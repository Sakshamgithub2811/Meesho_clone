import prisma from '../../config/prisma.js';

// 1. REGISTER AFFILIATE PARTNER (100% PostgreSQL DB Driven)
export const registerAffiliate = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, referralCode } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const partnerCode = referralCode || `AFF-${cleanEmail.split('@')[0].toUpperCase().slice(0, 5)}${Math.floor(100 + Math.random() * 900)}`;

    let profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: firebaseUid },
          { email: cleanEmail }
        ]
      },
      include: {
        wallet: true,
        kycApplications: {
          where: { type: 'affiliate' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: { select: { orders: true } }
      }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: firebaseUid,
          email: cleanEmail,
          role: "CUSTOMER", // Stored as customer base profile in Postgres enum
          fullName: fullName || "Affiliate Partner",
          storeName: partnerCode,
          wallet: {
            create: {
              balance: 0.0,
              pending: 0.0
            }
          }
        },
        include: {
          wallet: true,
          kycApplications: {
            where: { type: 'affiliate' },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: { select: { orders: true } }
        }
      });
    }

    if (!profile.storeName) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { storeName: partnerCode }
      }).catch(() => {});
    }

    const latestKyc = profile.kycApplications?.[0];
    const kycStatus = latestKyc?.status || (profile.role === 'RESELLER' ? 'APPROVED' : 'NOT_SUBMITTED');

    const affiliateUser = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      role: "AFFILIATE",
      referralCode: partnerCode,
      kycStatus: kycStatus,
      tier: profile.tier || "Silver Tier",
      stats: {
        totalEarnings: profile.wallet?.balance ?? 0.0,
        pendingPayout: profile.wallet?.pending ?? 0.0,
        clicks: (profile._count?.orders ?? 0) * 3,
        conversions: profile._count?.orders ?? 0
      }
    };

    return res.status(201).json({ 
      success: true, 
      message: 'Affiliate Partner Registered Successfully in PostgreSQL database', 
      user: affiliateUser 
    });

  } catch (error) {
    console.error("Register Affiliate Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN AFFILIATE PARTNER (100% PostgreSQL DB Driven)
export const loginAffiliate = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const cleanEmail = email.toLowerCase().trim();

    let profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: firebaseUid },
          { email: cleanEmail }
        ]
      },
      include: {
        wallet: true,
        kycApplications: {
          where: { type: 'affiliate' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: { select: { orders: true } }
      }
    });

    if (!profile) {
      // Auto-provision in PostgreSQL if user exists in Firebase but not in DB yet
      profile = await prisma.profile.create({
        data: {
          id: firebaseUid,
          email: cleanEmail,
          role: "CUSTOMER",
          fullName: cleanEmail.split('@')[0] || "Affiliate Partner",
          storeName: `AFF-${cleanEmail.split('@')[0].toUpperCase().slice(0, 5)}${firebaseUid.slice(-3)}`,
          wallet: {
            create: {
              balance: 0.0,
              pending: 0.0
            }
          }
        },
        include: {
          wallet: true,
          kycApplications: {
            where: { type: 'affiliate' },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: { select: { orders: true } }
        }
      });
    }

    const latestKyc = profile.kycApplications?.[0];
    const kycStatus = latestKyc?.status || (profile.role === 'RESELLER' ? 'APPROVED' : 'NOT_SUBMITTED');
    const partnerCode = profile.storeName || `AFF-${cleanEmail.split('@')[0].toUpperCase().slice(0, 5)}${profile.id.slice(-3)}`;
    if (!profile.storeName) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { storeName: partnerCode }
      }).catch(() => {});
    }

    const affiliateUser = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      role: "AFFILIATE",
      referralCode: partnerCode,
      kycStatus: kycStatus,
      tier: profile.tier || "Silver Tier",
      stats: {
        totalEarnings: profile.wallet?.balance ?? 0.0,
        pendingPayout: profile.wallet?.pending ?? 0.0,
        clicks: (profile._count?.orders ?? 0) * 3,
        conversions: profile._count?.orders ?? 0
      }
    };

    return res.status(200).json({ 
      success: true, 
      message: 'Affiliate Login Success from PostgreSQL database', 
      user: affiliateUser 
    });

  } catch (error) {
    console.error("Login Affiliate Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
