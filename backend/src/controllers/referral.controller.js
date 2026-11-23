import prisma from '../config/prisma.js';

/**
 * Helper to get or generate user's permanent unique referral code
 */
const getOrCreateReferralCode = async (user) => {
  if (user.storeName && user.storeName.startsWith('MSHOPPY')) {
    return user.storeName;
  }

  const cleanPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
  const baseSuffix = cleanPhone && cleanPhone.length >= 4
    ? cleanPhone.slice(-4)
    : user.id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase();

  let code = `MSHOPPY${baseSuffix}`;

  // Check for collision with another user's code
  const conflict = await prisma.profile.findFirst({
    where: {
      storeName: code,
      id: { not: user.id }
    }
  });

  if (conflict) {
    const extra = user.id.replace(/[^A-Za-z0-9]/g, '').slice(-2).toUpperCase();
    code = `MSHOPPY${baseSuffix}${extra}`;
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: { storeName: code }
  }).catch(() => {});

  return code;
};

/**
 * GET /api/referrals/stats
 * Real dynamic stats for the logged-in user:
 * - Real referral code & shareable link
 * - Real invited friends from DB with live delivery & order status
 * - 4 Milestones with dynamic unlocked state based on delivered orders count
 * - Real wallet balance and total earned cashback
 * - Suggested contacts from user's address book / past orders
 */
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.headers['x-customer-id'] || req.query.userId;
    let clientOrigin = process.env.FRONTEND_URL || 'https://meesho.digitalsabkuch.com';
    try {
      if (req.headers.origin) {
        clientOrigin = new URL(req.headers.origin).origin;
      } else if (req.headers.referer) {
        clientOrigin = new URL(req.headers.referer).origin;
      }
    } catch (_) {}

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view referral stats'
      });
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const referralCode = await getOrCreateReferralCode(user);
    const referralLink = `${clientOrigin}/invite/${referralCode}`;

    // 1. Fetch real referrals from DB
    const realReferrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            createdAt: true,
            orders: {
              select: {
                id: true,
                orderStatus: true,
                totalAmount: true,
                createdAt: true
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Compute status for each referred friend
    let deliveredCount = 0;
    const friends = realReferrals.map((ref, idx) => {
      const friendOrders = ref.referred?.orders || [];
      const hasDelivered = friendOrders.some((o) => o.orderStatus === 'DELIVERED');
      const hasActiveOrder = friendOrders.some((o) => !['CANCELLED', 'RETURNED'].includes(o.orderStatus));

      let status = 'Registered';
      let statusClass = 'text-slate-500 bg-slate-100';
      let rewardEarned = 0;

      if (hasDelivered) {
        status = '1st Order Delivered 🎉';
        statusClass = 'text-emerald-700 bg-emerald-50 border border-emerald-200';
        deliveredCount++;
        rewardEarned = 123;
      } else if (hasActiveOrder) {
        status = 'Order Placed (In Transit 🚚)';
        statusClass = 'text-amber-700 bg-amber-50 border border-amber-200';
      }

      const rawPhone = ref.referred?.phone || '';
      const maskedPhone = rawPhone.length >= 10
        ? `+91 ${rawPhone.slice(0, 2)}*** ***${rawPhone.slice(-2)}`
        : 'Registered User';

      const initials = (ref.referred?.fullName || 'Friend')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return {
        id: ref.id,
        name: ref.referred?.fullName || `Friend #${idx + 1}`,
        phone: maskedPhone,
        rawPhone: rawPhone,
        status,
        statusClass,
        rewardEarned,
        hasInstalled: true,
        hasActiveOrder,
        hasDelivered,
        statusDetail: hasDelivered
          ? '1st Order Delivered! Cash Credited 🎉'
          : (hasActiveOrder ? 'Order placed, in transit 🚚' : 'Waiting for their order to be delivered'),
        joinedAt: ref.createdAt,
        avatar: initials,
        color: ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'][idx % 4]
      };
    });

    // 3. Compute dynamic 10 milestones
    const milestones = Array.from({ length: 10 }, (_, i) => {
      const num = i + 1;
      const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
      const isUnlocked = deliveredCount >= num;
      const isNext = deliveredCount === num - 1;
      return {
        id: num,
        amount: 123,
        label: `${num}${suffix} Invite`,
        unlocked: isUnlocked,
        statusText: isUnlocked ? 'Unlocked ✓' : (isNext ? 'In Progress' : 'Locked')
      };
    });

    const totalCashEarned = deliveredCount * 123;
    const maxPotentialCash = 10 * 123; // 1230

    return res.status(200).json({
      success: true,
      data: {
        referralCode,
        referralLink,
        totalInvited: realReferrals.length,
        deliveredCount,
        pendingCount: Math.max(0, realReferrals.length - deliveredCount),
        totalCashEarned,
        maxPotentialCash,
        milestones,
        friends,
        suggestedContacts: [],
        walletBalance: user.wallet?.balance || 0
      }
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/referrals/apply
 * Applies a referral code when a user signs up or links their account
 */
export const applyReferralCode = async (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ success: false, message: 'Code and userId are required' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Look up referrer by storeName, id, or phone suffix
    const referrer = await prisma.profile.findFirst({
      where: {
        OR: [
          { storeName: cleanCode },
          { id: cleanCode },
          ...(cleanCode.replace(/^MSHOPPY/, '').length >= 4 ? [{ phone: { endsWith: cleanCode.replace(/^MSHOPPY/, '') } }] : [])
        ]
      }
    });

    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }

    if (referrer.id === userId) {
      return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
    }

    // Check if already referred
    const existing = await prisma.referral.findFirst({
      where: { referredId: userId }
    });

    if (existing) {
      return res.status(200).json({ success: true, message: 'Referral code already applied', data: existing });
    }

    const newRef = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: userId,
        code: cleanCode,
        rewardAmount: 0,
        isRedeemed: false
      }
    });

    return res.status(201).json({
      success: true,
      message: `Referral code ${cleanCode} successfully applied! You will get 40% off on your 1st order (up to ₹100)!`,
      data: newRef
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/referrals/info/:code
 * Public details for the Invite Landing Page (/invite/:code)
 */
export const getReferralInfo = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanSuffix = cleanCode.replace(/^MSHOPPY/, '');

    const referrer = await prisma.profile.findFirst({
      where: {
        OR: [
          { storeName: cleanCode },
          { id: cleanCode },
          ...(cleanSuffix.length >= 4 ? [{ phone: { endsWith: cleanSuffix } }] : [])
        ]
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        storeName: true
      }
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: `Referral code "${cleanCode}" is invalid or does not exist.`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        code: cleanCode,
        referrerName: referrer.fullName || 'A friend',
        referrerAvatar: referrer.avatarUrl || '',
        discountPercent: 40,
        maxDiscount: 100,
        offerTitle: 'Flat 40% OFF on First Order (Up to ₹100)',
        offerDescription: `Join MShoppy and get cheapest prices online. Install via ${referrer.fullName || 'friend'}'s link and get 40% OFF on your first order (up to ₹100).`,
        minOrderValue: 0
      }
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
