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

export const createOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const {
      items, // array of { productId, quantity, size, price }
      shippingAddress,
      paymentMethod = 'COD',
      totalAmount
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Map payment method to enum
    let validPaymentMethod = 'COD';
    const pmUpper = (paymentMethod || '').toUpperCase();
    if (['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET'].includes(pmUpper)) {
      validPaymentMethod = pmUpper;
    }

    const calculatedTotal = totalAmount || items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;

    if (parsedShippingAddress?.name && parsedShippingAddress.name.trim()) {
      await prisma.profile.update({
        where: { id: userId },
        data: { fullName: parsedShippingAddress.name.trim() }
      }).catch(() => {});
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(calculatedTotal),
        shippingAddress: parsedShippingAddress,
        paymentMethod: validPaymentMethod,
        paymentStatus: validPaymentMethod === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'ORDERED',

        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price),
            size: item.size || 'Free Size'
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Clear cart for this user
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (existing.orderStatus === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled. You can request a return or exchange instead.'
      });
    }

    if (existing.orderStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'CANCELLED',
        ...(existing.paymentStatus === 'PAID' ? { paymentStatus: 'REFUNDED' } : {})
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};


/**
 * Update order status (ORDERED -> CONFIRMED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'ORDERED',
      'CONFIRMED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUNDED'
    ];

    const upperStatus = (status || '').toUpperCase();
    if (!validStatuses.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status '${status}'. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: upperStatus,
        ...(upperStatus === 'DELIVERED' ? { paymentStatus: 'PAID' } : {})
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${upperStatus}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

