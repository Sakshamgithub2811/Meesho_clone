import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || req.body.userId || 'guest_customer';
};

const ensureProfile = async (userId) => {
  if (!userId) return null;
  const existing = await prisma.profile.findUnique({ where: { id: userId } });
  if (!existing) {
    return await prisma.profile.create({
      data: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });
  }
  return existing;
};

/**
 * Submit or update a product review
 * Enforces requirement: Order must be DELIVERED to user!
 */
export const createReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const {
      productId,
      rating,
      title = '',
      comment = '',
      images = []
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required'
      });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // STRICT CHECK: Does this user have a DELIVERED order for this product?
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        orderStatus: 'DELIVERED',
        items: {
          some: {
            productId
          }
        }
      }
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products that have been delivered to you. Your order is not yet marked as DELIVERED in the system.'
      });
    }

    // Sync customer name from delivered order if available

    if (deliveredOrder?.shippingAddress) {
      const addr = typeof deliveredOrder.shippingAddress === 'string'
        ? JSON.parse(deliveredOrder.shippingAddress)
        : deliveredOrder.shippingAddress;
      if (addr?.name) {
        await prisma.profile.update({
          where: { id: userId },
          data: { fullName: addr.name }
        }).catch(() => {});
      }
    }

    // Upsert the review (1 review per user per product)
    const review = await prisma.review.upsert({

      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      update: {
        rating: numericRating,
        title: title ? title.trim() : null,
        comment: comment ? comment.trim() : null,
        images: Array.isArray(images) ? images : []
      },
      create: {
        userId,
        productId,
        rating: numericRating,
        title: title ? title.trim() : null,
        comment: comment ? comment.trim() : null,
        images: Array.isArray(images) ? images : []
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Recalculate average rating & reviewsCount for this product
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const avgRating = stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : numericRating;
    const reviewsCount = stats._count.rating || 1;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewsCount
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review,
        productRating: avgRating,
        reviewsCount
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

/**
 * Fetch all reviews for a product with breakdown & stats
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        images: true,
        rating: true,
        reviewsCount: true,
        price: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute star breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const allCustomerPhotos = [];

    reviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating] += 1;
      }
      if (Array.isArray(r.images) && r.images.length > 0) {
        allCustomerPhotos.push(...r.images);
      }
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1))
      : 0;


    // Enrich reviews with verified customer name from order if profile has default name
    const enrichedReviews = await Promise.all(
      reviews.map(async (r) => {
        let authorName = r.user?.fullName;
        if (!authorName || authorName.toLowerCase() === 'customer' || authorName.toLowerCase() === 'guest_customer') {
          const userOrder = await prisma.order.findFirst({
            where: {
              userId: r.userId,
              items: { some: { productId } }
            },
            select: { shippingAddress: true },
            orderBy: { createdAt: 'desc' }
          }) || await prisma.order.findFirst({
            where: { userId: r.userId },
            select: { shippingAddress: true },
            orderBy: { createdAt: 'desc' }
          });

          if (userOrder?.shippingAddress) {
            const addr = typeof userOrder.shippingAddress === 'string'
              ? JSON.parse(userOrder.shippingAddress)
              : userOrder.shippingAddress;
            if (addr?.name) {
              authorName = addr.name;
              prisma.profile.update({
                where: { id: r.userId },
                data: { fullName: addr.name }
              }).catch(() => {});
            }
          }
        }

        return {
          ...r,
          user: {
            ...r.user,
            fullName: authorName || 'Verified Buyer'
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        product,
        averageRating: avgRating,
        reviewsCount: totalReviews,
        breakdown,
        customerPhotos: allCustomerPhotos,
        reviews: enrichedReviews
      }
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Check if the current user is eligible to review this product
 */
export const checkCanReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    // Check delivered order
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        orderStatus: 'DELIVERED',
        items: {
          some: {
            productId
          }
        }
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Check existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        canReview: !!deliveredOrder,
        hasDeliveredOrder: !!deliveredOrder,
        deliveredOrder,
        hasReviewed: !!existingReview,
        existingReview
      }
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: error.message
    });
  }
};
