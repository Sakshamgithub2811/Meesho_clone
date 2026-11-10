import prisma from '../../config/prisma.js';

/**
 * Consolidated Dropshipper Executive Dashboard Overview
 * GET /api/v1/dropshipper/dashboard/overview/:firebaseUid
 */
export const getDropshipperDashboardOverview = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid param is required' });
    }

    // 1. Fetch Profile, Wallet & KYC
    const [profile, kycRecord, walletRecord] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: firebaseUid }
      }),
      (prisma.kYCApplication || prisma.kycApplication).findFirst({
        where: { userId: firebaseUid },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wallet.findFirst({
        where: { userId: firebaseUid }
      })
    ]);

    // 2. Fetch Orders with Items & Products
    const orders = await prisma.order.findMany({
      where: { userId: firebaseUid },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // 3. Fetch Support Tickets
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: firebaseUid },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Fetch Channels / Integrations
    const integrations = await prisma.storeIntegration.findMany({
      where: { userId: firebaseUid }
    });

    // --- Compute Fulfillment Metrics ---
    const totalOrdersCount = orders.length;
    let dispatchedCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let activeOrdersCount = 0;

    let grossSalesRevenue = 0;
    let totalMarginEarned = 0; // Cleared / Delivered
    let escrowMarginLocked = 0; // In transit / pending delivery
    let totalPotentialMargin = 0;

    const formattedRecentOrders = orders.slice(0, 5).map(o => {
      const addr = (typeof o.shippingAddress === 'object' && o.shippingAddress !== null)
        ? o.shippingAddress
        : {};

      const margin = typeof addr.dropshipperMargin === 'number' 
        ? addr.dropshipperMargin 
        : Math.max(0, Math.round(o.totalAmount * 0.25));

      const status = o.orderStatus === 'ORDERED' ? 'DISPATCHED' : o.orderStatus;

      return {
        id: `DSP-${o.id.slice(0, 8).toUpperCase()}`,
        dbId: o.id,
        date: new Date(o.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        customerName: addr.fullName || 'Customer',
        customerPhone: addr.phone || '-',
        city: addr.city || 'Metro Hub',
        state: addr.state || '',
        pincode: addr.pincode || '',
        productName: addr.productName || o.items?.[0]?.product?.title || 'Wholesale Sourced Product',
        productImg: o.items?.[0]?.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
        sku: addr.productSku || 'SKU-DS',
        qty: addr.quantity || o.items?.[0]?.quantity || 1,
        wholesaleCost: addr.wholesaleCost || Math.round(o.totalAmount * 0.65),
        customerPrice: o.totalAmount,
        margin: margin,
        status: status,
        courier: addr.courier || 'Delhivery Express Air',
        awb: addr.awb || `DEL-${o.id.slice(0, 10).toUpperCase()}`,
        paymentMode: addr.paymentMode || o.paymentMethod || 'COD',
        isArchived: !!addr.isArchived
      };
    });

    // Compute sums
    orders.forEach(o => {
      const addr = (typeof o.shippingAddress === 'object' && o.shippingAddress !== null)
        ? o.shippingAddress
        : {};

      const margin = typeof addr.dropshipperMargin === 'number' 
        ? addr.dropshipperMargin 
        : Math.max(0, Math.round(o.totalAmount * 0.25));

      if (o.orderStatus === 'CANCELLED') {
        cancelledCount++;
      } else {
        activeOrdersCount++;
        grossSalesRevenue += o.totalAmount;
        totalPotentialMargin += margin;

        if (o.orderStatus === 'DELIVERED') {
          deliveredCount++;
          totalMarginEarned += margin;
        } else if (o.orderStatus === 'IN_TRANSIT') {
          inTransitCount++;
          escrowMarginLocked += margin;
        } else {
          // ORDERED / DISPATCHED
          dispatchedCount++;
          escrowMarginLocked += margin;
        }
      }
    });

    // Compute Support Metrics
    const totalTicketsCount = tickets.length;
    const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const resolvedTicketsCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

    // Available Wallet Balance
    const availableWalletBalance = walletRecord?.balance || profile?.walletBalance || 0;

    // KYC Status
    const kycStatus = kycRecord?.status || 'NOT_SUBMITTED'; // 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED'
    const isKycVerified = kycStatus === 'APPROVED';

    const partnerData = {
      firebaseUid,
      fullName: profile?.fullName || 'Dropshipper Partner',
      storeName: profile?.storeName || kycRecord?.businessName || 'Kunal Retail Store',
      email: profile?.email || '',
      phone: profile?.phone || '',
      avatarUrl: profile?.avatarUrl || null,
      kycStatus,
      isKycVerified
    };

    const kpiData = {
      grossSalesRevenue,
      totalMarginEarned,       // Cleared margin ready to withdraw
      escrowMarginLocked,      // In-transit / active dispatches
      totalPotentialMargin,
      availableWalletBalance,
      totalOrdersCount,
      activeOrdersCount,
      dispatchedCount,
      inTransitCount,
      deliveredCount,
      cancelledCount,
      rotShieldPercent: 100,   // Zero Damage Return Liability
      rotTierName: 'Platinum 100% Shield',
      totalTicketsCount,
      openTicketsCount,
      resolvedTicketsCount,
      connectedChannelsCount: integrations.length
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      partner: partnerData,
      kpi: kpiData,
      kpis: kpiData,
      recentOrders: formattedRecentOrders,
      data: {
        partner: partnerData,
        kpi: kpiData,
        kpis: kpiData,
        recentOrders: formattedRecentOrders
      }
    });

  } catch (error) {
    console.error('Error in getDropshipperDashboardOverview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard overview',
      error: error.message
    });
  }
};
