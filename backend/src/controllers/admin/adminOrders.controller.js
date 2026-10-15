import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL ORDERS FOR ADMIN (With Filters, Search & Summary KPIs)
 * Supports query params: ?status=SHIPPED&paymentStatus=PAID&search=rahul
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;

    const where = {};

    // 1. Order Status Filter
    if (status && status.toUpperCase() !== 'ALL') {
      where.orderStatus = status.toUpperCase();
    }

    // 2. Payment Status Filter
    if (paymentStatus && paymentStatus.toUpperCase() !== 'ALL') {
      where.paymentStatus = paymentStatus.toUpperCase();
    }

    // 3. Search Filter (by Order ID, Customer name, email, or phone)
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    // Fetch filtered orders and aggregation stats simultaneously
    const [
      orders,
      totalOrders,
      revenueAggregate,
      pendingCount,
      shippedCount,
      deliveredCount,
      cancelledCount
    ] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              role: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  price: true,
                  supplierName: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { orderStatus: { in: ['ORDERED', 'CONFIRMED'] } }
      }),
      prisma.order.count({
        where: { orderStatus: { in: ['SHIPPED', 'OUT_FOR_DELIVERY'] } }
      }),
      prisma.order.count({
        where: { orderStatus: 'DELIVERED' }
      }),
      prisma.order.count({
        where: { orderStatus: 'CANCELLED' }
      })
    ]);

    const stats = {
      totalOrders,
      totalRevenue: revenueAggregate._sum.totalAmount || 0,
      pendingOrders: pendingCount,
      shippedOrders: shippedCount,
      deliveredOrders: deliveredCount,
      cancelledOrders: cancelledCount
    };

    return res.status(200).json({
      success: true,
      count: orders.length,
      stats,
      orders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * 2. GET SINGLE ORDER DETAILS
 */
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
            createdAt: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        deliveryTask: true,
        returnRequest: true
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
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

/**
 * 3. UPDATE ORDER STATUS & PAYMENT STATUS
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = [
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

    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    const updateData = {};

    if (orderStatus) {
      const upperOrder = orderStatus.toUpperCase();
      if (!validOrderStatuses.includes(upperOrder)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Allowed: ${validOrderStatuses.join(', ')}`
        });
      }
      updateData.orderStatus = upperOrder;

      // Auto update payment status for COD on delivery if still pending
      if (upperOrder === 'DELIVERED') {
        const currentOrder = await prisma.order.findUnique({ where: { id } });
        if (currentOrder && currentOrder.paymentMethod === 'COD' && currentOrder.paymentStatus === 'PENDING') {
          updateData.paymentStatus = 'PAID';
        }
      }
    }

    if (paymentStatus) {
      const upperPayment = paymentStatus.toUpperCase();
      if (!validPaymentStatuses.includes(upperPayment)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status. Allowed: ${validPaymentStatuses.join(', ')}`
        });
      }
      updateData.paymentStatus = upperPayment;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
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
