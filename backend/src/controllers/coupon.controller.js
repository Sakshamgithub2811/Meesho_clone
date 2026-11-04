// backend/src/controllers/coupon.controller.js
import prisma from '../config/prisma.js';

/**
 * 1. GET ALL ACTIVE COUPONS (For Customers at Checkout)
 * Only returns active, non-expired coupons that have remaining usage limit
 */
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter out coupons that exceeded usage limit if limit is set
    const validCoupons = coupons.filter(c => !c.usageLimit || c.usedCount < c.usageLimit);

    return res.status(200).json({
      success: true,
      count: validCoupons.length,
      data: validCoupons
    });
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

/**
 * 2. VALIDATE COUPON (Customer applying coupon code at checkout)
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please provide a coupon code to apply'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const total = parseFloat(cartTotal) || 0;

    // Strict Database lookup
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon code "${cleanCode}" is invalid or does not exist.`
      });
    }

    // Check expiration
    if (new Date(coupon.expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon "${cleanCode}" has expired on ${new Date(coupon.expiresAt).toLocaleDateString()}`
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon "${cleanCode}" has reached its maximum usage limit.`
      });
    }

    // Check minimum order value
    if (total < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrder} required for coupon "${cleanCode}". Current subtotal is ₹${Math.round(total)}.`
      });
    }

    // Calculate actual discount
    let discount = 0;
    if (coupon.type === 'PERCENT') {
      const calculated = Math.round((total * coupon.value) / 100);
      discount = Math.min(coupon.maxDiscount || calculated, calculated);
    } else {
      discount = Math.min(total, coupon.value);
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: `Coupon "${cleanCode}" applied successfully! You saved ₹${discount}`,
      data: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discountAmount: discount,
        minOrder: coupon.minOrder,
        finalTotal: Math.max(0, total - discount)
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
};

/**
 * 3. SERVER-SIDE HELPER: Calculate verified coupon discount for Orders
 */
export const calculateCouponDiscount = async (code, cartTotal) => {
  if (!code || typeof code !== 'string') return 0;
  const cleanCode = code.trim().toUpperCase();
  const total = parseFloat(cartTotal) || 0;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (!coupon || !coupon.isActive) return 0;
    if (new Date(coupon.expiresAt) <= new Date()) return 0;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 0;
    if (total < coupon.minOrder) return 0;

    if (coupon.type === 'PERCENT') {
      const calculated = Math.round((total * coupon.value) / 100);
      return Math.min(coupon.maxDiscount || calculated, calculated);
    }
    return Math.min(total, coupon.value);
  } catch (err) {
    console.error('Error in calculateCouponDiscount:', err);
    return 0;
  }
};

/**
 * =========================================================================
 * 🛠️ ADMIN CONTROLLERS (Admin Dashboard Coupon Management)
 * =========================================================================
 */

/**
 * 4. ADMIN: Get All Coupons (With Stats and Filters)
 */
export const adminGetAllCoupons = async (req, res) => {
  try {
    const { status, search } = req.query;
    const now = new Date();

    const where = {};

    if (status === 'active') {
      where.isActive = true;
      where.expiresAt = { gt: now };
    } else if (status === 'expired') {
      where.expiresAt = { lte: now };
    } else if (status === 'disabled') {
      where.isActive = false;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [coupons, totalCount, activeCount, expiredCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.count(),
      prisma.coupon.count({
        where: { isActive: true, expiresAt: { gt: now } }
      }),
      prisma.coupon.count({
        where: { expiresAt: { lte: now } }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: coupons,
      stats: {
        total: totalCount,
        active: activeCount,
        expired: expiredCount
      }
    });
  } catch (error) {
    console.error('Admin get all coupons error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

/**
 * 5. ADMIN: Create New Coupon
 */
export const adminCreateCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      type = 'FLAT', // 'FLAT' | 'PERCENT'
      value,
      minOrder = 0,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive = true
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon title is required' });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return res.status(400).json({ success: false, message: 'Valid discount value is required' });
    }

    // Auto-generate code if not provided
    const cleanCode = code && code.trim()
      ? code.trim().toUpperCase().replace(/\s+/g, '')
      : `MSH${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Check duplicate code
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists` });
    }

    // Default expiry 30 days if not given
    const expiryDate = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        title: title.trim(),
        description: description ? description.trim() : null,
        type: type === 'PERCENT' ? 'PERCENT' : 'FLAT',
        value: numValue,
        minOrder: parseFloat(minOrder) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiryDate,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive: Boolean(isActive)
      }
    });

    return res.status(201).json({
      success: true,
      message: `Coupon "${newCoupon.code}" created successfully!`,
      data: newCoupon
    });
  } catch (error) {
    console.error('Admin create coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

/**
 * 6. ADMIN: Update Existing Coupon
 */
export const adminUpdateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      value,
      minOrder,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive
    } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (type !== undefined) updateData.type = type === 'PERCENT' ? 'PERCENT' : 'FLAT';
    if (value !== undefined) updateData.value = parseFloat(value);
    if (minOrder !== undefined) updateData.minOrder = parseFloat(minOrder);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: `Coupon "${updated.code}" updated successfully!`,
      data: updated
    });
  } catch (error) {
    console.error('Admin update coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

/**
 * 7. ADMIN: Toggle Coupon Active Status
 */
export const adminToggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });

    return res.status(200).json({
      success: true,
      message: `Coupon "${updated.code}" is now ${updated.isActive ? 'Active' : 'Disabled'}`,
      data: updated
    });
  } catch (error) {
    console.error('Admin toggle coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status',
      error: error.message
    });
  }
};

/**
 * 8. ADMIN: Delete Coupon
 */
export const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await prisma.coupon.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `Coupon "${existing.code}" deleted permanently`
    });
  } catch (error) {
    console.error('Admin delete coupon error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};
