import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL COUPONS WITH STATS FOR ADMIN
 */
export const getAllAdminCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const totalCoupons = coupons.length;
    const activeCount = coupons.filter(
      (c) => c.isActive !== false && new Date(c.expiresAt) > now
    ).length;
    const expiredCount = coupons.filter(
      (c) => new Date(c.expiresAt) <= now
    ).length;
    const totalRedemptions = coupons.reduce(
      (sum, c) => sum + (c.usedCount || 0),
      0
    );

    // Estimate total customer discount given across all redemptions
    const totalDiscountGiven = coupons.reduce((sum, c) => {
      const avgValue = c.type === 'PERCENT' ? (c.maxDiscount || 100) : c.value;
      return sum + (c.usedCount || 0) * avgValue;
    }, 0);

    return res.status(200).json({
      success: true,
      count: totalCoupons,
      coupons: coupons,
      data: coupons,
      stats: {
        totalCoupons,
        activeCoupons: activeCount,
        expiredCoupons: expiredCount,
        totalRedemptions,
        totalDiscountGiven: Math.round(totalDiscountGiven),
      },
    });
  } catch (error) {
    console.error('Error fetching admin coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message,
    });
  }
};

/**
 * 2. CREATE NEW COUPON
 */
export const createAdminCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      type = 'FLAT',
      value,
      minOrder,
      maxDiscount,
      expiresAt,
      usageLimit = 500,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');

    // Check duplicate code in DB
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" already exists. Please choose a different code.`,
      });
    }

    const discountVal = parseFloat(value);
    if (isNaN(discountVal) || discountVal <= 0) {
      return res.status(400).json({ success: false, message: 'Discount value must be greater than 0' });
    }

    const minOrderVal = parseFloat(minOrder) || 0;
    const parsedExpiry = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        title: title?.trim() || (type === 'PERCENT' ? `${discountVal}% Off` : `Flat ₹${discountVal} Off`),
        description: description?.trim() || `Save on orders above ₹${minOrderVal}`,
        type: type === 'PERCENT' ? 'PERCENT' : 'FLAT',
        value: discountVal,
        minOrder: minOrderVal,
        maxDiscount: type === 'PERCENT' ? (parseFloat(maxDiscount) || discountVal * 10) : discountVal,
        expiresAt: parsedExpiry,
        usageLimit: parseInt(usageLimit, 10) || 500,
        usedCount: 0,
        isActive: true,
      }
    });

    return res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully`,
      coupon: newCoupon,
      data: newCoupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message,
    });
  }
};

/**
 * 3. UPDATE EXISTING COUPON
 */
export const updateAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      description,
      type,
      value,
      minOrder,
      maxDiscount,
      expiresAt,
      usageLimit,
      isActive,
    } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const updateData = {};
    if (code) {
      const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
      const duplicate = await prisma.coupon.findFirst({
        where: { code: cleanCode, NOT: { id } }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Coupon code "${cleanCode}" already used by another coupon.`,
        });
      }
      updateData.code = cleanCode;
    }

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (type !== undefined) updateData.type = type === 'PERCENT' ? 'PERCENT' : 'FLAT';
    if (value !== undefined) updateData.value = parseFloat(value);
    if (minOrder !== undefined) updateData.minOrder = parseFloat(minOrder);
    if (maxDiscount !== undefined) updateData.maxDiscount = parseFloat(maxDiscount);
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
    if (usageLimit !== undefined) updateData.usageLimit = parseInt(usageLimit, 10);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: `Coupon "${updated.code}" updated successfully`,
      coupon: updated,
      data: updated
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message,
    });
  }
};

/**
 * 4. TOGGLE COUPON STATUS (ACTIVE / INACTIVE)
 */
export const toggleAdminCoupon = async (req, res) => {
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
      isActive: updated.isActive,
      coupon: updated,
      data: updated
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle status',
      error: error.message,
    });
  }
};

/**
 * 5. DELETE COUPON
 */
export const deleteAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await prisma.coupon.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `Coupon "${existing.code}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message,
    });
  }
};
