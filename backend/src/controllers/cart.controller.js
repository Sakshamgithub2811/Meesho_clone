import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || 'guest_customer';
};

const ensureProfile = async (userId) => {
  if (!userId) return null;
  try {
    return await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return await prisma.profile.findUnique({ where: { id: userId } });
    }
    throw err;
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const items = await prisma.cartItem.findMany({
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

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const originalSubtotal = items.reduce((sum, item) => sum + ((item.product.originalPrice || item.product.price) * item.quantity), 0);
    const totalDiscount = Math.max(0, originalSubtotal - subtotal);

    return res.status(200).json({
      success: true,
      items,
      totalItems,
      subtotal,
      originalSubtotal,
      totalDiscount,
      deliveryFee: 0
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const { productId, quantity = 1, size = 'Free Size' } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const safeSize = size || 'Free Size';

    // Atomic upsert with concurrency retry: Prevents P2002 collisions under simultaneous clicks
    let cartItem;
    try {
      cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId_size: {
            userId,
            productId,
            size: safeSize
          }
        },
        update: {
          quantity: { increment: qty }
        },
        create: {
          userId,
          productId,
          quantity: qty,
          size: safeSize
        },
        include: { product: true }
      });
    } catch (upsertErr) {
      if (upsertErr.code === 'P2002') {
        cartItem = await prisma.cartItem.update({
          where: {
            userId_productId_size: {
              userId,
              productId,
              size: safeSize
            }
          },
          data: {
            quantity: { increment: qty }
          },
          include: { product: true }
        });
      } else {
        throw upsertErr;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      item: cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { quantity, size } = req.body;

    const existingItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    if (existingItem.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this cart item' });
    }

    const data = {};
    if (quantity !== undefined) data.quantity = Math.max(1, parseInt(quantity, 10) || 1);
    if (size !== undefined) data.size = size;

    const updated = await prisma.cartItem.update({
      where: { id },
      data,
      include: { product: true }
    });

    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      item: updated
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const existingItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    if (existingItem.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this cart item' });
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};
