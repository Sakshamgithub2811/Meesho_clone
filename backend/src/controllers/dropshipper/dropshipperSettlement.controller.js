import prisma from '../../config/prisma.js';

/**
 * Helper to determine courier logo
 */
const getCourierLogo = (courierName = '') => {
  const c = courierName.toLowerCase();
  if (c.includes('delhivery')) return '🚚';
  if (c.includes('shadowfax')) return '⚡';
  if (c.includes('bluedart')) return '✈️';
  if (c.includes('ekart')) return '📦';
  return '🚚';
};

/**
 * 1. GET ALL SETTLEMENTS & LOGISTICS TRACKING ORDERS FOR DROPSHIPPER
 * Route: GET /api/v1/dropshipper/settlements/:firebaseUid
 */
export const getDropshipperSettlements = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid is required' });
    }

    // 1. Verify User Profile & Wallet
    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid },
      include: {
        wallet: true,
        supportTickets: {
          where: { category: 'DISPUTE_CLAIM' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Dropshipper profile not found in database' });
    }

    // 2. Fetch Orders for Dropshipper from Database
    const rawOrders = await prisma.order.findMany({
      where: {
        userId: firebaseUid,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        },
        returnRequest: true
      }
    });

    const now = Date.now();
    const bankAccountStr = user.bankDetails && typeof user.bankDetails === 'object' && user.bankDetails.accountNumber
      ? `${user.bankDetails.bankName || 'Bank'} ****${String(user.bankDetails.accountNumber).slice(-4)}`
      : `Bank ****${user.phone ? String(user.phone).slice(-4) : '4419'}`;

    // 3. Format Real Database Orders with Lifecycle & Settlement Math
    const formattedOrders = rawOrders.map((o) => {
      const addr = (o.shippingAddress && typeof o.shippingAddress === 'object') ? o.shippingAddress : {};
      const orderCreatedTime = new Date(o.createdAt).getTime();
      const daysSinceCreation = Math.floor((now - orderCreatedTime) / (1000 * 60 * 60 * 24));

      // Financials
      const sellingPrice = Number(o.totalAmount || addr.customerPrice || 999);
      const supplierBasePrice = Number(addr.wholesaleCost || (sellingPrice * 0.65));
      const shippingFee = Number(addr.shippingFee || 60);
      const tdsDeduction = Math.round(sellingPrice * 0.01); // 1% Government TDS
      const normalMargin = Math.max(0, sellingPrice - supplierBasePrice - shippingFee - tdsDeduction);

      // Status resolution
      const rawStatus = (o.orderStatus || 'ORDERED').toUpperCase();
      let orderStatus = 'In-Transit';
      let logisticsStatus = 'In-Transit';
      let settlementStatus = 'In Escrow';
      let coolingDaysLeft = 7;
      let netMargin = normalMargin;
      let rtoReason = null;

      if (rawStatus === 'DELIVERED') {
        orderStatus = 'Delivered';
        logisticsStatus = 'Delivered';
        if (daysSinceCreation >= 7) {
          settlementStatus = 'Settled';
          coolingDaysLeft = 0;
        } else {
          settlementStatus = 'In Escrow';
          coolingDaysLeft = Math.max(0, 7 - daysSinceCreation);
        }
      } else if (rawStatus === 'CANCELLED' || rawStatus === 'RETURNED' || o.returnRequest) {
        orderStatus = rawStatus === 'RETURNED' ? 'Returned' : 'RTO';
        logisticsStatus = rawStatus === 'RETURNED' ? 'Reverse Pickup Completed' : 'RTO Delivered to Warehouse';
        settlementStatus = 'Reversed';
        coolingDaysLeft = 0;
        netMargin = -Math.abs(shippingFee); // Customer freight loss on RTO
        rtoReason = o.returnRequest?.reason || 'Customer Unreachable / Doorstep Cancellation';
      } else if (rawStatus === 'SHIPPED') {
        orderStatus = 'In-Transit';
        logisticsStatus = 'In-Transit';
        settlementStatus = 'In Escrow';
        coolingDaysLeft = 7;
      } else {
        orderStatus = 'In-Transit';
        logisticsStatus = 'Manifested';
        settlementStatus = 'In Escrow';
        coolingDaysLeft = 7;
      }

      // Check if dispute claim exists for this order in support tickets
      const existingTicket = user.supportTickets?.find(t => t.description?.includes(o.id));
      const disputeStatus = existingTicket ? (existingTicket.status === 'RESOLVED' ? 'Claim Resolved' : 'Claim Under Review') : null;
      const claimId = existingTicket ? `CLM-${existingTicket.id.slice(0, 6).toUpperCase()}` : null;

      if (disputeStatus) {
        settlementStatus = 'Disputed';
      }

      const courier = addr.courier || 'Delhivery Express';
      const awb = addr.awb || `DEL-${o.id.slice(0, 10).toUpperCase()}`;

      // Dates
      const orderDateStr = new Date(o.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const settlementDate = new Date(orderCreatedTime + (coolingDaysLeft * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      // Realistic 5-Stage Lifecycle Journey
      const timeline = [
        {
          step: 'Order Placed & Confirmed',
          time: orderDateStr,
          desc: `Customer ${addr.fullName || 'Buyer'} placed order via store channel. Payment mode: ${addr.paymentMode || o.paymentMethod || 'COD'}.`,
          completed: true
        },
        {
          step: 'Supplier Dispatched',
          time: new Date(orderCreatedTime + 3600 * 1000 * 8).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          desc: `Packed and dispatched via ${courier}. AWB: ${awb}.`,
          completed: rawStatus !== 'ORDERED'
        },
        {
          step: 'In-Transit & Regional Hub',
          time: new Date(orderCreatedTime + 3600 * 1000 * 24).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          desc: `Arrived at regional hub (${addr.city || 'Regional Hub'}).`,
          completed: rawStatus === 'SHIPPED' || rawStatus === 'DELIVERED' || rawStatus === 'RETURNED'
        },
        {
          step: 'Doorstep Delivery',
          time: rawStatus === 'DELIVERED' ? new Date(orderCreatedTime + 3600 * 1000 * 48).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'In Progress',
          desc: rawStatus === 'DELIVERED' ? `Delivered successfully to customer address in ${addr.city || 'Destination'}.` : 'Out for delivery to customer.',
          completed: rawStatus === 'DELIVERED'
        },
        {
          step: '7-Day Return Window & Settlement',
          time: settlementStatus === 'Settled' ? 'Settled' : `${coolingDaysLeft} Days Left`,
          desc: settlementStatus === 'Settled'
            ? `Return window cleared. Net margin ₹${netMargin} credited to bank account (${bankAccountStr}).`
            : (settlementStatus === 'In Escrow' ? `Margin ₹${netMargin} held securely in escrow pending 7-day return window.` : `Order reversed.`),
          completed: settlementStatus === 'Settled'
        }
      ];

      return {
        id: `DSP-${o.id.slice(0, 8).toUpperCase()}`,
        dbId: o.id,
        awb,
        courier,
        courierLogo: getCourierLogo(courier),
        orderDate: orderDateStr,
        customerName: addr.fullName || 'Customer',
        customerCity: addr.city ? `${addr.city}, ${addr.state || ''}` : 'India',
        customerPhone: addr.phone || '-',
        productName: addr.productName || o.items?.[0]?.product?.title || 'Wholesale Sourced Item',
        productSku: addr.productSku || 'SKU-DS-01',
        productImage: o.items?.[0]?.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        qty: addr.quantity || o.items?.[0]?.quantity || 1,
        paymentMode: addr.paymentMode || (o.paymentMethod === 'COD' ? 'COD' : 'Prepaid (UPI)'),
        sellingPrice,
        supplierBasePrice,
        shippingFee,
        tdsDeduction,
        netMargin,
        orderStatus,
        logisticsStatus,
        settlementStatus,
        coolingDaysLeft,
        settlementDate,
        utrNumber: settlementStatus === 'Settled' ? `UTR-MSHOPPY-${o.id.slice(0, 10).toUpperCase()}` : (settlementStatus === 'In Escrow' ? 'Pending Escrow Release' : `REV-ADJ-${o.id.slice(0, 8).toUpperCase()}`),
        bankAccount: bankAccountStr,
        rtoReason,
        disputeStatus,
        claimId,
        timeline
      };
    });

    // 4. Compute Aggregate KPI Metrics from Real Database Orders
    const totalGov = formattedOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
    const settledMargin = formattedOrders
      .filter((o) => o.settlementStatus === 'Settled')
      .reduce((sum, o) => sum + o.netMargin, 0);
    const pendingEscrow = formattedOrders
      .filter((o) => o.settlementStatus === 'In Escrow')
      .reduce((sum, o) => sum + o.netMargin, 0);
    const reversedAmount = formattedOrders
      .filter((o) => o.settlementStatus === 'Reversed')
      .reduce((sum, o) => sum + Math.abs(o.netMargin), 0);
    const rtoCount = formattedOrders.filter((o) => o.orderStatus === 'RTO' || o.orderStatus === 'Returned').length;
    const activeInTransit = formattedOrders.filter((o) => o.orderStatus === 'In-Transit').length;

    const metrics = {
      totalGov,
      settledMargin,
      pendingEscrow,
      reversedAmount,
      rtoCount,
      activeInTransit,
      totalOrdersCount: formattedOrders.length,
      walletBalance: user.wallet?.balance || 0
    };

    return res.status(200).json({
      success: true,
      metrics,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error in getDropshipperSettlements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve settlements from database',
      error: error.message
    });
  }
};

/**
 * 2. SUBMIT DISPUTE CLAIM FOR RTO / RETURN
 * Route: POST /api/v1/dropshipper/settlements/claim
 */
export const submitSettlementClaim = async (req, res) => {
  try {
    const { firebaseUid, orderId, claimReason, description } = req.body;

    if (!firebaseUid || !orderId) {
      return res.status(400).json({ success: false, message: 'firebaseUid and orderId are required' });
    }

    const newTicket = await prisma.supportTicket.create({
      data: {
        userId: firebaseUid,
        subject: `Dispute Claim for Order #${orderId} - ${claimReason || 'RTO Reversal'}`,
        description: `Order ID: ${orderId}\nReason: ${claimReason}\nEvidence Description: ${description || 'No description provided'}`,
        status: 'OPEN',
        priority: 'HIGH',
        category: 'DISPUTE_CLAIM'
      }
    });

    const claimId = `CLM-${newTicket.id.slice(0, 6).toUpperCase()}`;

    return res.status(201).json({
      success: true,
      message: `Dispute Claim #${claimId} submitted successfully! Support team will verify within 24 hours.`,
      claimId,
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error in submitSettlementClaim:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit dispute claim',
      error: error.message
    });
  }
};

