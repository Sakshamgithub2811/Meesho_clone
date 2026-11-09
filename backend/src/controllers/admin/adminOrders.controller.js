import prisma from '../../config/prisma.js';
import { dispatchDeliveryOtpEmail } from '../order.controller.js';

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
 * Helper to generate official public tracking URLs for Indian couriers
 */
export const getCourierTrackingUrl = (courier = '', awb = '') => {
  if (!awb) return '';
  const c = (courier || '').toLowerCase();
  const cleanAwb = String(awb).trim();

  if (c.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${cleanAwb}`;
  }
  if (c.includes('blue') || c.includes('bluedart')) {
    return `https://www.bluedart.com/tracking?trackNumber=${cleanAwb}`;
  }
  if (c.includes('shadowfax')) {
    return `https://tracker.shadowfax.in/#/track?awb=${cleanAwb}`;
  }
  if (c.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/tracking_results.asp?trType=awb_no&strAwbNo=${cleanAwb}`;
  }
  if (c.includes('xpress') || c.includes('xpressbees')) {
    return `https://www.xpressbees.com/track?awb=${cleanAwb}`;
  }
  if (c.includes('ekart')) {
    return `https://ekartlogistics.com/shipmenttrack/${cleanAwb}`;
  }
  if (c.includes('speed') || c.includes('post') || c.includes('india post')) {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
  }
  return '';
};

/**
 * 3. UPDATE ORDER STATUS & PAYMENT STATUS (With Logistics AWB Tracking)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderStatus,
      paymentStatus,
      courierPartner,
      trackingNumber,
      trackingUrl,
      estimatedDelivery
    } = req.body;

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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = {};
    let upperOrder = null;

    if (orderStatus) {
      upperOrder = orderStatus.toUpperCase();
      if (!validOrderStatuses.includes(upperOrder)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Allowed: ${validOrderStatuses.join(', ')}`
        });
      }
      updateData.orderStatus = upperOrder;

      // Auto update payment status for COD on delivery if still pending
      if (upperOrder === 'DELIVERED') {
        if (existingOrder.paymentMethod === 'COD' && existingOrder.paymentStatus === 'PENDING') {
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

    // Process Courier Partner & AWB tracking details into shippingAddress JSON
    const currAddr = (typeof existingOrder.shippingAddress === 'object' && existingOrder.shippingAddress !== null)
      ? existingOrder.shippingAddress
      : {};

    const cleanCourier = courierPartner !== undefined ? courierPartner : (currAddr.courier || currAddr.courierPartner || '');
    const cleanAwb = trackingNumber !== undefined ? trackingNumber : (currAddr.awb || currAddr.trackingNumber || '');
    const computedTrackingUrl = trackingUrl || getCourierTrackingUrl(cleanCourier, cleanAwb) || currAddr.trackingUrl || '';

    if (courierPartner !== undefined || trackingNumber !== undefined || upperOrder === 'SHIPPED') {
      const fallbackAwb = cleanAwb || (upperOrder === 'SHIPPED' ? `AWB${Date.now().toString().slice(-8)}` : null);
      const fallbackCourier = cleanCourier || (upperOrder === 'SHIPPED' ? 'Delhivery Surface' : '');
      const finalTrackingUrl = computedTrackingUrl || getCourierTrackingUrl(fallbackCourier, fallbackAwb);

      updateData.shippingAddress = {
        ...currAddr,
        courier: fallbackCourier,
        courierPartner: fallbackCourier,
        awb: fallbackAwb,
        trackingNumber: fallbackAwb,
        trackingUrl: finalTrackingUrl,
        shippedAt: upperOrder === 'SHIPPED' ? (currAddr.shippedAt || new Date().toISOString()) : currAddr.shippedAt,
        estimatedDelivery: estimatedDelivery || currAddr.estimatedDelivery || null
      };
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
        },
        deliveryTask: true
      }
    });

    // Synchronize DeliveryTask state based on order progress
    if (upperOrder === 'SHIPPED') {
      await prisma.deliveryTask.upsert({
        where: { orderId: id },
        update: {
          status: 'in_transit',
          pickupTime: new Date()
        },
        create: {
          orderId: id,
          status: 'in_transit',
          pickupTime: new Date()
        }
      }).catch(() => {});

      // In-App Notification to Customer
      if (existingOrder.userId) {
        const finalCourier = updateData.shippingAddress?.courier || 'Delhivery';
        const finalAwb = updateData.shippingAddress?.awb || '';
        await prisma.notification.create({
          data: {
            userId: existingOrder.userId,
            title: 'Order Dispatched! 📦',
            body: `Your order #${id.slice(-8)} has been shipped via ${finalCourier}${finalAwb ? ` (AWB: ${finalAwb})` : ''}. Tap to track live.`,
            type: 'order',
            data: {
              orderId: id,
              courier: finalCourier,
              awb: finalAwb,
              trackingUrl: updateData.shippingAddress?.trackingUrl
            }
          }
        }).catch(() => {});
      }
    } else if (upperOrder === 'DELIVERED') {
      await prisma.deliveryTask.updateMany({
        where: { orderId: id },
        data: {
          status: 'delivered',
          deliveryTime: new Date()
        }
      }).catch(() => {});
    }

    if (upperOrder === 'OUT_FOR_DELIVERY') {
      try {
        const otpResult = await dispatchDeliveryOtpEmail({ orderId: id, type: 'DELIVERY' });
        console.log(`🚚 [Admin Order ${id}] OUT_FOR_DELIVERY OTP automatically emailed to: ${otpResult.sentTo}`);
      } catch (err) {
        console.error(`⚠️ [Admin Order ${id}] OTP email failed:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully with logistics details',
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
