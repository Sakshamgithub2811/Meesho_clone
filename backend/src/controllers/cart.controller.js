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

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        size
      }
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + parseInt(quantity) },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: parseInt(quantity),
          size
        },
        include: { product: true }
      });
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
    const { id } = req.params;
    const { quantity, size } = req.body;

    const data = {};
    if (quantity !== undefined) data.quantity = Math.max(1, parseInt(quantity));
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
    const { id } = req.params;

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
