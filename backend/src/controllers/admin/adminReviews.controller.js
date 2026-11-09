import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL REVIEWS FOR ADMIN WITH PAGINATION, FILTER & KPIS
 * Query params: page, limit, rating, status (all | published | hidden), hasImages (true | false), search
 */
export const getAllReviews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const { rating, status, hasImages, search } = req.query;

    const where = {};

    // Filter by Rating (1 - 5)
    if (rating && rating !== 'all') {
      const numRating = parseInt(rating, 10);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 5) {
        where.rating = numRating;
      }
    }

    // Filter by Moderation Status (published vs hidden)
    if (status && status !== 'all') {
      if (status === 'hidden') {
        where.isHidden = true;
      } else if (status === 'published' || status === 'approved') {
        where.isHidden = false;
      }
    }

    // Filter by Media Presence
    if (hasImages === 'true') {
      where.images = { isEmpty: false };
    }

    // Search query matching product title, customer name, review title, or comment
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { comment: { contains: q, mode: 'insensitive' } },
        {
          product: {
            title: { contains: q, mode: 'insensitive' }
          }
        },
        {
          user: {
            fullName: { contains: q, mode: 'insensitive' }
          }
        },
        {
          user: {
            email: { contains: q, mode: 'insensitive' }
          }
        }
      ];
    }

    // Parallel fetch: reviews list, total filtered count, and global KPI statistics
    const [
      reviews,
      filteredCount,
      totalCount,
      hiddenCount,
      aggStats,
      rating5Count,
      rating4Count,
      rating3Count,
      rating2Count,
      rating1Count,
      mediaCount
    ] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              rating: true,
              reviewsCount: true,
              supplierName: true,
              categorySlug: true
            }
          }
        }
      }),
      prisma.review.count({ where }),
      prisma.review.count(),
      prisma.review.count({ where: { isHidden: true } }),
      prisma.review.aggregate({
        _avg: { rating: true }
      }),
      prisma.review.count({ where: { rating: 5 } }),
      prisma.review.count({ where: { rating: 4 } }),
      prisma.review.count({ where: { rating: 3 } }),
      prisma.review.count({ where: { rating: 2 } }),
      prisma.review.count({ where: { rating: 1 } }),
      prisma.review.count({ where: { images: { isEmpty: false } } })
    ]);

    const avgRating = aggStats._avg.rating ? Number(aggStats._avg.rating.toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total: filteredCount,
          totalPages: Math.ceil(filteredCount / limit) || 1
        },
        stats: {
          totalReviews: totalCount,
          avgRating,
          hiddenReviews: hiddenCount,
          mediaReviews: mediaCount,
          breakdown: {
            5: rating5Count,
            4: rating4Count,
            3: rating3Count,
            2: rating2Count,
            1: rating1Count
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer reviews for moderation',
      error: error.message
    });
  }
};

/**
 * 2. TOGGLE REVIEW VISIBILITY (Hide / Delist or Approve / Unhide)
 * Body: { isHidden: boolean }
 * Recalculates product rating & review count for visible reviews
 */
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    if (typeof isHidden !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHidden boolean flag is required'
      });
    }

    const existing = await prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review moderation state
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isHidden,
        status: isHidden ? 'HIDDEN' : 'APPROVED'
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatarUrl: true }
        },
        product: {
          select: { id: true, title: true, images: true, price: true }
        }
      }
    });

    // Recalculate product rating & reviewsCount for only visible reviews
    const stats = await prisma.review.aggregate({
      where: {
        productId: existing.productId,
        isHidden: false
      },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const newAvgRating = stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0;
    const newReviewsCount = stats._count.rating || 0;

    await prisma.product.update({
      where: { id: existing.productId },
      data: {
        rating: newAvgRating,
        reviewsCount: newReviewsCount
      }
    });

    return res.status(200).json({
      success: true,
      message: isHidden ? 'Review hidden from customer storefront' : 'Review approved and visible to customers',
      data: {
        review: updatedReview,
        productRating: newAvgRating,
        reviewsCount: newReviewsCount
      }
    });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update review visibility',
      error: error.message
    });
  }
};

/**
 * 3. ADD OR EDIT OFFICIAL ADMIN REPLY TO REVIEW
 * Body: { adminReply: string }
 */
export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const existing = await prisma.review.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        adminReply: adminReply ? adminReply.trim() : null
      }
    });

    return res.status(200).json({
      success: true,
      message: adminReply ? 'Official response attached to review' : 'Official response removed',
      data: updated
    });
  } catch (error) {
    console.error('Error replying to review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save admin reply',
      error: error.message
    });
  }
};

/**
 * 4. PERMANENTLY DELETE REVIEW (Spam / Fake Removal)
 * Recalculates product rating & review count
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    });

    // Recalculate product rating & reviewsCount
    const stats = await prisma.review.aggregate({
      where: {
        productId: existing.productId,
        isHidden: false
      },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const newAvgRating = stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0;
    const newReviewsCount = stats._count.rating || 0;

    await prisma.product.update({
      where: { id: existing.productId },
      data: {
        rating: newAvgRating,
        reviewsCount: newReviewsCount
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Review deleted permanently and product rating updated',
      data: {
        deletedId: id,
        productRating: newAvgRating,
        reviewsCount: newReviewsCount
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};
