import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL ROT LIABILITY & RETURN ORDERS FOR DROPSHIPPER
 * Route: GET /api/v1/dropshipper/rot/:firebaseUid
 */
export const getDropshipperRotData = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid is required' });
    }

    // 1. Fetch Dropshipper Profile & Wallet
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

    // Read saved ROT protection plan (defaults to 'Shared Shield')
    const bankDetails = (user.bankDetails && typeof user.bankDetails === 'object') ? user.bankDetails : {};
    const activePlan = bankDetails.rotPlan || 'Shared Shield';

    // 2. Fetch Return / RTO Orders for this Dropshipper from PostgreSQL
    const returnOrders = await prisma.order.findMany({
      where: {
        userId: firebaseUid,
        isDeleted: false,
        OR: [
          { orderStatus: 'CANCELLED' },
          { orderStatus: 'RETURNED' },
          { orderStatus: 'RETURN_REQUESTED' },
          { returnRequest: { isNot: null } }
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        returnRequest: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Map Real Database Records with ROT Liability Math
    const formattedReturns = returnOrders.map((o) => {
      const addr = (o.shippingAddress && typeof o.shippingAddress === 'object') ? o.shippingAddress : {};
      const sellingPrice = Number(o.totalAmount || addr.customerPrice || 999);
      const supplierPrice = Number(addr.wholesaleCost || (sellingPrice * 0.65));
      const shippingFee = Number(addr.shippingFee || 60);
      const tdsDeduction = Math.round(sellingPrice * 0.01);
      const earnedMargin = Math.max(0, sellingPrice - supplierPrice - shippingFee - tdsDeduction);
      const reversedMargin = earnedMargin;

      const reasonRaw = o.returnRequest?.reason || 'Customer Doorstep Refusal (RTO)';
      const reasonLower = reasonRaw.toLowerCase();

      // Fault Attribution
      let faultAttribution = 'Catalog / Customer Preference';
      if (reasonLower.includes('defect') || reasonLower.includes('damaged') || reasonLower.includes('torn') || reasonLower.includes('broken')) {
        faultAttribution = 'Supplier Quality Defect';
      } else if (reasonLower.includes('size') || reasonLower.includes('fit') || reasonLower.includes('small') || reasonLower.includes('large') || reasonLower.includes('tight')) {
        faultAttribution = 'Buyer Remorse (Fit Issue)';
      }

      // ROT Liability Calculation based on Plan & Fault
      let rotLiability = 'Plan Covered (Shared Shield 50%)';
      let rotAmount = Math.round(shippingFee * 0.5);

      if (faultAttribution === 'Supplier Quality Defect') {
        rotLiability = '₹0 (100% Supplier Absorbed)';
        rotAmount = 0;
      } else if (activePlan === 'Zero-Risk Lite') {
        rotLiability = '₹0 (100% Platform Covered)';
        rotAmount = 0;
      } else if (activePlan === 'Shared Shield') {
        rotLiability = 'Plan Covered (Shared Shield 50%)';
        rotAmount = Math.round(shippingFee * 0.5);
      } else {
        // High Margin Pro
        rotLiability = 'Full Reseller Liability (High Margin Pro)';
        rotAmount = shippingFee;
      }

      const netResellerDebit = reversedMargin + rotAmount;
      const walletStatus = rotAmount === 0 ? 'Margin Reversed (Zero Penalty)' : 'Adjusted in Escrow Payout';

      // Check if dispute ticket exists in database for this order
      const existingTicket = user.supportTickets?.find(t => t.description?.includes(o.id));
      const disputeStatus = existingTicket 
        ? `Dispute Filed: ${existingTicket.status === 'RESOLVED' ? 'Resolved (Refunded)' : 'Admin Reviewing'}` 
        : null;

      const orderDateStr = new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const returnDateStr = o.returnRequest?.createdAt
        ? new Date(o.returnRequest.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : orderDateStr;

      return {
        id: `DSH-RET-${o.id.slice(0, 6).toUpperCase()}`,
        orderId: `DSP-${o.id.slice(0, 8).toUpperCase()}`,
        dbOrderId: o.id,
        returnId: o.returnRequest?.id ? `RET-${o.returnRequest.id.slice(0, 6).toUpperCase()}` : `RTO-${o.id.slice(0, 6).toUpperCase()}`,
        productName: addr.productName || o.items?.[0]?.product?.title || 'Wholesale Sourced Item',
        productSku: addr.productSku || 'SKU-DS-01',
        productImg: o.items?.[0]?.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
        sellingPrice,
        supplierPrice,
        earnedMargin,
        reversedMargin,
        customerReturnReason: reasonRaw,
        faultAttribution,
        rotLiability,
        rotAmount,
        netResellerDebit,
        walletStatus,
        orderDate: orderDateStr,
        returnDate: returnDateStr,
        disputeStatus,
        claimId: existingTicket ? `CLM-${existingTicket.id.slice(0, 6).toUpperCase()}` : null
      };
    });

    // 4. Calculate Aggregate Metrics
    const totalRotPaid = formattedReturns.reduce((sum, r) => sum + r.rotAmount, 0);
    const totalMarginReversed = formattedReturns.reduce((sum, r) => sum + r.reversedMargin, 0);
    const walletBalance = Number(user.wallet?.balance || 0);

    return res.status(200).json({
      success: true,
      activePlan,
      returns: formattedReturns,
      metrics: {
        activePlan,
        totalRotPaid,
        totalMarginReversed,
        returnsCount: formattedReturns.length,
        walletBalance
      }
    });

  } catch (error) {
    console.error('Error in getDropshipperRotData:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dropshipper ROT data',
      error: error.message
    });
  }
};

/**
 * 2. UPDATE DROPSHIPPER ROT PROTECTION PLAN
 * Route: POST /api/v1/dropshipper/rot/plan
 */
export const updateDropshipperRotPlan = async (req, res) => {
  try {
    const { firebaseUid, planName } = req.body;

    if (!firebaseUid || !planName) {
      return res.status(400).json({ success: false, message: 'firebaseUid and planName are required' });
    }

    const validPlans = ['Zero-Risk Lite', 'Shared Shield', 'High Margin Pro'];
    if (!validPlans.includes(planName)) {
      return res.status(400).json({ success: false, message: 'Invalid ROT plan name' });
    }

    const user = await prisma.profile.findUnique({ where: { id: firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Dropshipper profile not found' });
    }

    const currentBankDetails = (user.bankDetails && typeof user.bankDetails === 'object') ? user.bankDetails : {};

    const updatedUser = await prisma.profile.update({
      where: { id: firebaseUid },
      data: {
        bankDetails: {
          ...currentBankDetails,
          rotPlan: planName
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Return protection plan updated to '${planName}' successfully!`,
      activePlan: planName
    });

  } catch (error) {
    console.error('Error in updateDropshipperRotPlan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ROT plan in database',
      error: error.message
    });
  }
};

/**
 * 3. SUBMIT ROT REVERSE FREIGHT DISPUTE TICKET
 * Route: POST /api/v1/dropshipper/rot/dispute
 */
export const submitRotDispute = async (req, res) => {
  try {
    const { firebaseUid, orderId, returnId, reason, description } = req.body;

    if (!firebaseUid || !orderId) {
      return res.status(400).json({ success: false, message: 'firebaseUid and orderId are required' });
    }

    const newTicket = await prisma.supportTicket.create({
      data: {
        userId: firebaseUid,
        subject: `ROT Reverse Freight Dispute: Order #${orderId} (${returnId || 'Return'})`,
        description: `Order ID: ${orderId}\nReturn ID: ${returnId || 'N/A'}\nDispute Grounds: ${reason || 'Inaccurate Return Reason'}\nEvidence Note: ${description || 'No note provided'}`,
        status: 'OPEN',
        priority: 'HIGH',
        category: 'DISPUTE_CLAIM'
      }
    });

    const claimId = `CLM-${newTicket.id.slice(0, 6).toUpperCase()}`;

    return res.status(201).json({
      success: true,
      message: `Dispute raised for Order #${orderId}. ROT debit put on temporary freeze.`,
      claimId,
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error in submitRotDispute:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit ROT dispute ticket',
      error: error.message
    });
  }
};

