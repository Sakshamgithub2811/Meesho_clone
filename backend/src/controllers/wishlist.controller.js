import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || 'guest_customer';
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

export const getWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      });
      return res.status(200).json({
        success: true,
        action: 'removed',
        message: 'Removed from wishlist'
      });
    } else {
      const created = await prisma.wishlistItem.create({
        data: {
          userId,
          productId
        },
        include: {
          product: true
        }
      });

      return res.status(201).json({
        success: true,
        action: 'added',
        message: 'Added to wishlist',
        data: created
      });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update wishlist',
      error: error.message
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};
