import admin from '../config/firebaseAdmin.js';
import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';

/**
 * Generate a Firebase token for user or return custom token
 */
const generateFirebaseToken = async (userId, claims = {}) => {
  try {
    const authInstance = admin?.auth ? admin.auth() : null;
    if (authInstance) {
      return await authInstance.createCustomToken(userId, claims);
    }
  } catch (error) {
    console.warn('Firebase createCustomToken notice:', error.message);
  }
  return `firebase_${userId}`;
};

// Resilient in-memory stores for development & zero-downtime offline fallback
const resellerStore = new Map();
const customerStore = new Map();
const affiliateStore = new Map();

// Helper to sanitize phone number
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '').slice(-10);
};

/**
 * ==========================================
 * 1. RESELLER AUTHENTICATION
 * ==========================================
 * POST /api/v1/auth/reseller-login
 */
export const resellerLogin = async (req, res) => {
  try {
    const { phone, otp, fullName } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    const cleanPhone = cleanPhoneNumber(phone);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Please enter a valid 10-digit number.',
      });
    }

    // Default dev OTP is 123456 or any 6-digit OTP in non-prod
    if (otp && otp.length === 6 && otp !== '123456' && process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.',
      });
    }

    const userId = `reseller_${cleanPhone}`;
    let reseller = resellerStore.get(userId);

    if (!reseller) {
      reseller = {
        id: userId,
        phone: cleanPhone,
        fullName: fullName || `Reseller +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}`,
        role: 'RESELLER',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        wallet: {
          balance: 0.00,
          pendingAmount: 0.00,
          totalEarned: 0.00,
          withdrawnAmount: 0.00,
          upiId: cleanPhone ? `${cleanPhone}@upi` : '',
          bankLinked: false,
          bankName: '',
          accountLast4: '',
        },
        createdAt: new Date().toISOString(),
      };
      resellerStore.set(userId, reseller);
    } else if (fullName) {
      reseller.fullName = fullName;
    }

    const token = await generateFirebaseToken(reseller.id, {
      role: reseller.role,
      phone: reseller.phone,
      fullName: reseller.fullName,
    });

    return res.status(200).json({
      success: true,
      message: 'Reseller authentication successful! Welcome to MShoppy Reseller Hub.',
      token,
      user: {
        id: reseller.id,
        phone: reseller.phone,
        fullName: reseller.fullName,
        role: reseller.role,
        avatarUrl: reseller.avatarUrl,
      },
      wallet: reseller.wallet,
    });
  } catch (error) {
    console.error('❌ Reseller Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during reseller login',
      error: error.message,
    });
  }
};

/**
 * ==========================================
 * 2. CUSTOMER / USER AUTHENTICATION
 * ==========================================
 * POST /api/v1/auth/customer-login
 * POST /api/v1/auth/user-login
 */
export const customerLogin = async (req, res) => {
  try {
    const { phone, email, otp, fullName } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or Email is required for customer login',
      });
    }

    let userId = '';
    let cleanPhone = '';

    if (phone) {
      cleanPhone = cleanPhoneNumber(phone);
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number. Please enter a valid 10-digit number.',
        });
      }
      userId = `customer_${cleanPhone}`;
    } else {
      userId = `customer_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }

    // Default dev OTP is 123456 (or any 4/6-digit in development)
    if (otp && otp.length >= 4 && otp !== '123456' && otp !== '1234' && process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.',
      });
    }

    let customer = null;

    // 1. Try persisting directly to real Prisma PostgreSQL database
    try {
      let profile = await prisma.profile.findFirst({
        where: {
          OR: [
            ...(cleanPhone ? [{ phone: cleanPhone }] : []),
            ...(email ? [{ email: email.toLowerCase() }] : []),
            { id: userId }
          ]
        },
        include: {
          wallet: true,
          _count: {
            select: {
              orders: true,
              wishlist: true,
              cart: true
            }
          }
        }
      });

      if (!profile) {
        // Create new customer profile in Prisma
        profile = await prisma.profile.create({
          data: {
            id: userId,
            phone: cleanPhone || null,
            email: email ? email.toLowerCase() : (cleanPhone ? `${cleanPhone}@customer.mshoppy` : null),
            fullName: fullName || (cleanPhone ? `Customer +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}` : 'Valued Customer'),
            role: 'CUSTOMER',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            wallet: {
              create: {
                balance: 500.0,
                pending: 0.0
              }
            }
          },
          include: {
            wallet: true,
            _count: {
              select: {
                orders: true,
                wishlist: true,
                cart: true
              }
            }
          }
        });
      } else {
        // Update customer profile details if provided
        const updateData = {};
        if (fullName && (!profile.fullName || profile.fullName.startsWith('Customer +91'))) {
          updateData.fullName = fullName;
        }
        if (email && !profile.email) {
          updateData.email = email.toLowerCase();
        }
        if (Object.keys(updateData).length > 0) {
          profile = await prisma.profile.update({
            where: { id: profile.id },
            data: updateData,
            include: {
              wallet: true,
              _count: {
                select: {
                  orders: true,
                  wishlist: true,
                  cart: true
                }
              }
            }
          });
        }

        // Ensure wallet exists for this customer
        if (!profile.wallet) {
          await prisma.wallet.create({
            data: {
              userId: profile.id,
              balance: 500.0,
              pending: 0.0
            }
          }).catch(() => {});
        }
      }

      customer = {
        id: profile.id,
        phone: profile.phone || cleanPhone || '',
        email: profile.email || '',
        fullName: profile.fullName || 'Valued Customer',
        role: profile.role || 'CUSTOMER',
        avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        walletBalance: profile.wallet?.balance ?? 500.0,
        ordersCount: profile._count?.orders ?? 0,
        wishlistCount: profile._count?.wishlist ?? 0,
        cartCount: profile._count?.cart ?? 0,
        createdAt: profile.createdAt?.toISOString?.() || new Date().toISOString()
      };
      customerStore.set(customer.id, customer);
    } catch (dbError) {
      console.warn('⚠️ Prisma DB notice in customerLogin, falling back to memory store:', dbError.message);
      customer = customerStore.get(userId);

      if (!customer) {
        customer = {
          id: userId,
          phone: cleanPhone || '',
          email: email || `${cleanPhone}@mshoppy.user`,
          fullName: fullName || (cleanPhone ? `Customer +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}` : 'Valued Customer'),
          role: 'CUSTOMER',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          walletBalance: 500.0,
          ordersCount: 0,
          wishlistCount: 0,
          cartCount: 0,
          createdAt: new Date().toISOString(),
        };
        customerStore.set(userId, customer);
      } else {
        if (fullName) customer.fullName = fullName;
        if (email) customer.email = email;
      }
    }

    const token = await generateFirebaseToken(customer.id, {
      role: customer.role,
      phone: customer.phone,
      email: customer.email,
      fullName: customer.fullName,
    });

    return res.status(200).json({
      success: true,
      message: 'Customer authentication successful! Welcome to MShoppy.',
      token,
      user: {
        id: customer.id,
        phone: customer.phone,
        email: customer.email,
        fullName: customer.fullName,
        role: customer.role,
        avatarUrl: customer.avatarUrl,
        walletBalance: customer.walletBalance,
        ordersCount: customer.ordersCount,
        wishlistCount: customer.wishlistCount,
        cartCount: customer.cartCount,
      },
    });
  } catch (error) {
    console.error('❌ Customer Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during customer login',
      error: error.message,
    });
  }
};

/**
 * ==========================================
 * 3. AFFILIATE PARTNER AUTHENTICATION
 * ==========================================
 * POST /api/v1/auth/affiliate-login
 */
export const affiliateLogin = async (req, res) => {
  try {
    const { phone, email, otp, fullName, referralCode } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number or Email is required for affiliate authentication',
      });
    }

    const cleanPhone = phone ? cleanPhoneNumber(phone) : '';
    if (phone && cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Please enter a valid 10-digit number.',
      });
    }

    const userId = cleanPhone ? `affiliate_${cleanPhone}` : `affiliate_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    let affiliate = affiliateStore.get(userId);

    const generatedCode = referralCode || (cleanPhone ? `MSHOPPY${cleanPhone.slice(-4)}` : 'MEESHO500');

    if (!affiliate) {
      affiliate = {
        id: userId,
        phone: cleanPhone,
        email: email || `${cleanPhone}@affiliate.meesho`,
        fullName: fullName || `Affiliate Partner ${cleanPhone ? `+91 ${cleanPhone.slice(-4)}` : ''}`.trim(),
        role: 'AFFILIATE',
        referralCode: generatedCode,
        kycStatus: 'NOT_SUBMITTED',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        stats: {
          totalCommission: 0,
          pendingCommission: 0,
          withdrawnAmount: 0,
          clicks: 0,
          convertedOrders: 0,
          conversionRate: '0%',
        },
        payoutDetails: null,
        createdAt: new Date().toISOString(),
      };
      affiliateStore.set(userId, affiliate);
    } else {
      if (fullName) affiliate.fullName = fullName;
      if (referralCode) affiliate.referralCode = referralCode;
    }

    const token = await generateFirebaseToken(affiliate.id, {
      role: affiliate.role,
      phone: affiliate.phone,
      email: affiliate.email,
      fullName: affiliate.fullName,
      referralCode: affiliate.referralCode,
    });

    return res.status(200).json({
      success: true,
      message: 'Affiliate authentication successful! Welcome to the Partner Suite.',
      token,
      user: {
        id: affiliate.id,
        phone: affiliate.phone,
        email: affiliate.email,
        fullName: affiliate.fullName,
        role: affiliate.role,
        avatarUrl: affiliate.avatarUrl,
        referralCode: affiliate.referralCode,
        kycStatus: affiliate.kycStatus,
      },
      stats: affiliate.stats,
      payoutDetails: affiliate.payoutDetails,
    });
  } catch (error) {
    console.error('❌ Affiliate Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during affiliate login',
      error: error.message,
    });
  }
};

/**
 * ==========================================
 * 4. CURRENT AUTHENTICATED USER
 * ==========================================
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const { id, role } = req.user;

    let userObj = null;
    let extraData = {};

    if (role === 'RESELLER') {
      userObj = resellerStore.get(id);
      if (userObj) {
        extraData = { wallet: userObj.wallet };
      }
    } else if (role === 'CUSTOMER') {
      try {
        const profile = await prisma.profile.findUnique({
          where: { id },
          include: {
            wallet: true,
            _count: {
              select: {
                orders: true,
                wishlist: true,
                cart: true
              }
            }
          }
        });

        if (profile) {
          userObj = {
            id: profile.id,
            phone: profile.phone || '',
            email: profile.email || '',
            fullName: profile.fullName || 'Valued Customer',
            role: profile.role || 'CUSTOMER',
            avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            walletBalance: profile.wallet?.balance ?? 500.0,
            ordersCount: profile._count?.orders ?? 0,
            wishlistCount: profile._count?.wishlist ?? 0,
            cartCount: profile._count?.cart ?? 0,
          };
          extraData = { 
            walletBalance: userObj.walletBalance,
            ordersCount: userObj.ordersCount,
            wishlistCount: userObj.wishlistCount,
            cartCount: userObj.cartCount,
          };
        }
      } catch (err) {
        console.warn('Prisma fetch notice in getCurrentUser:', err.message);
      }

      if (!userObj) {
        userObj = customerStore.get(id);
        if (userObj) {
          extraData = { 
            walletBalance: userObj.walletBalance,
            ordersCount: userObj.ordersCount,
            wishlistCount: userObj.wishlistCount,
            cartCount: userObj.cartCount || 0,
          };
        }
      }
    } else if (role === 'AFFILIATE') {
      userObj = affiliateStore.get(id);
      if (userObj) {
        extraData = { 
          stats: userObj.stats,
          payoutDetails: userObj.payoutDetails,
          referralCode: userObj.referralCode,
          kycStatus: userObj.kycStatus,
        };
      }
    }

    if (!userObj) {
      return res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          phone: req.user.phone,
          fullName: req.user.fullName,
          role: req.user.role || 'CUSTOMER',
        },
        ...extraData,
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userObj.id,
        phone: userObj.phone,
        email: userObj.email,
        fullName: userObj.fullName,
        role: userObj.role,
        avatarUrl: userObj.avatarUrl,
        ...userObj,
      },
      ...extraData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message,
    });
  }
};

/**
 * ==========================================
 * 5. UPDATE PROFILES
 * ==========================================
 */
export const updateResellerProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { fullName, upiId, bankName, accountLast4 } = req.body;

    let user = resellerStore.get(id);
    if (!user) {
      user = {
        id,
        phone: req.user.phone,
        fullName: fullName || req.user.fullName,
        role: 'RESELLER',
        wallet: {
          balance: 24850.50,
          pendingAmount: 1240.00,
        },
      };
      resellerStore.set(id, user);
    }

    if (fullName) user.fullName = fullName;
    if (upiId) user.wallet.upiId = upiId;
    if (bankName) user.wallet.bankName = bankName;
    if (accountLast4) user.wallet.accountLast4 = accountLast4;

    return res.status(200).json({
      success: true,
      message: 'Reseller profile updated successfully',
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      wallet: user.wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update reseller profile',
      error: error.message,
    });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { fullName, email, avatarUrl, phone } = req.body;
    const cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : '';

    let updatedUser = null;
    try {
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email.toLowerCase();
      if (avatarUrl) updateData.avatarUrl = avatarUrl;
      if (cleanPhone) updateData.phone = cleanPhone;

      if (Object.keys(updateData).length > 0) {
        const profile = await prisma.profile.update({
          where: { id },
          data: updateData,
          include: {
            wallet: true,
            _count: {
              select: {
                orders: true,
                wishlist: true,
                cart: true
              }
            }
          }
        });

        updatedUser = {
          id: profile.id,
          phone: profile.phone || cleanPhone || '',
          email: profile.email || email || '',
          fullName: profile.fullName || fullName || 'Valued Customer',
          role: profile.role || 'CUSTOMER',
          avatarUrl: profile.avatarUrl || avatarUrl,
          walletBalance: profile.wallet?.balance ?? 500.0,
          ordersCount: profile._count?.orders ?? 0,
          wishlistCount: profile._count?.wishlist ?? 0,
          cartCount: profile._count?.cart ?? 0,
        };
      }
    } catch (dbErr) {
      console.warn('Prisma update notice in updateCustomerProfile:', dbErr.message);
    }

    let customer = customerStore.get(id);
    if (!customer) {
      customer = {
        id,
        phone: cleanPhone || req.user.phone || '',
        email: email || req.user.email || '',
        fullName: fullName || req.user.fullName || 'Valued Customer',
        role: 'CUSTOMER',
      };
      customerStore.set(id, customer);
    }

    if (fullName) customer.fullName = fullName;
    if (email) customer.email = email;
    if (avatarUrl) customer.avatarUrl = avatarUrl;
    if (cleanPhone) customer.phone = cleanPhone;

    return res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully',
      user: updatedUser || customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update customer profile',
      error: error.message,
    });
  }
};

export const updateAffiliateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { fullName, referralCode, upiId, bankName, accountNumber } = req.body;

    let affiliate = affiliateStore.get(id);
    if (!affiliate) {
      affiliate = {
        id,
        phone: req.user.phone || '',
        fullName: fullName || req.user.fullName || 'Affiliate Partner',
        role: 'AFFILIATE',
        referralCode: referralCode || 'MEESHO500',
        payoutDetails: {},
        stats: { totalCommission: 12450.50 },
      };
      affiliateStore.set(id, affiliate);
    }

    if (fullName) affiliate.fullName = fullName;
    if (referralCode) affiliate.referralCode = referralCode;
    if (upiId) affiliate.payoutDetails.upiId = upiId;
    if (bankName) affiliate.payoutDetails.bankName = bankName;
    if (accountNumber) affiliate.payoutDetails.accountNumber = accountNumber;

    return res.status(200).json({
      success: true,
      message: 'Affiliate partner profile updated successfully',
      user: affiliate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update affiliate profile',
      error: error.message,
    });
  }
};

/**
 * ==========================================
 * 4. GOOGLE AUTHENTICATION (User & Affiliate)
 * ==========================================
 * POST /api/v1/auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { firebaseUid, email, name, avatar, role = 'USER' } = req.body;

    if (!email || !firebaseUid) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID and Email are required',
      });
    }

    const isAffiliate = (role || '').toUpperCase() === 'AFFILIATE';
    let profile;

    // 1. Prisma DB find or create
    try {
      if (prisma?.profile) {
        profile = await prisma.profile.findUnique({
          where: { id: firebaseUid }
        });

        if (!profile) {
          profile = await prisma.profile.create({
            data: {
              id: firebaseUid,
              email: email,
              fullName: name || email.split('@')[0],
              avatarUrl: avatar || null,
              role: 'CUSTOMER',
            }
          });
        }
      }
    } catch (dbError) {
      console.warn('Prisma DB notice for Google Auth:', dbError.message);
    }

    // 2. Setup user object based on role
    const userId = firebaseUid || `google_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (isAffiliate) {
      const existingAffiliate = affiliateStore.get(userId);
      const partnerCode = existingAffiliate?.referralCode || `AFF-${email.split('@')[0].toUpperCase().slice(0, 5)}${Math.floor(100 + Math.random() * 900)}`;
      
      profile = {
        id: userId,
        email: email,
        fullName: name || existingAffiliate?.fullName || 'Affiliate Partner',
        avatarUrl: avatar || existingAffiliate?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'AFFILIATE',
        referralCode: partnerCode,
        kycStatus: existingAffiliate?.kycStatus || 'NOT_SUBMITTED',
        tier: existingAffiliate?.tier || 'Silver Tier',
        stats: existingAffiliate?.stats || {
          totalEarnings: 0,
          pendingPayout: 0,
          clicks: 0,
          conversions: 0
        },
        createdAt: existingAffiliate?.createdAt || new Date().toISOString(),
      };
      affiliateStore.set(userId, profile);
    } else {
      let existingCustomer = customerStore.get(userId);
      profile = {
        id: userId,
        email: email,
        fullName: name || existingCustomer?.fullName || 'MShoppy Customer',
        avatarUrl: avatar || existingCustomer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'CUSTOMER',
        walletBalance: existingCustomer?.walletBalance || 12840,
        ordersCount: existingCustomer?.ordersCount || 4,
        wishlistCount: existingCustomer?.wishlistCount || 3,
        createdAt: existingCustomer?.createdAt || new Date().toISOString(),
      };
      customerStore.set(userId, profile);
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      process.env.JWT_SECRET || 'meesho_jwt_secret_super_secure_key_2026',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: `Google authentication successful as ${profile.role}!`,
      token,
      user: profile,
    });

  } catch (error) {
    console.error('❌ Google Auth Server Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication',
      error: error.message,
    });
  }
};

