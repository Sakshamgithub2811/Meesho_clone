import { activeCoupons } from '../coupon.controller.js';

/**
 * 1. GET ALL COUPONS WITH STATS FOR ADMIN
 */
export const getAllAdminCoupons = async (req, res) => {
  try {
    const now = new Date();

    const totalCoupons = activeCoupons.length;
    const activeCount = activeCoupons.filter(
      (c) => c.isActive !== false && new Date(c.expiresAt) > now
    ).length;
    const expiredCount = activeCoupons.filter(
      (c) => new Date(c.expiresAt) <= now
    ).length;
    const totalRedemptions = activeCoupons.reduce(
      (sum, c) => sum + (c.usedCount || 0),
      0
    );

    // Estimate total customer discount given across all redemptions
    const totalDiscountGiven = activeCoupons.reduce((sum, c) => {
      const avgValue = c.type === 'PERCENT' ? (c.maxDiscount || 100) : c.value;
      return sum + (c.usedCount || 0) * avgValue;
    }, 0);

    return res.status(200).json({
      success: true,
      count: totalCoupons,
      coupons: activeCoupons,
      data: activeCoupons,
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

    // Check duplicate code
    const existing = activeCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode
    );
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
      ? new Date(expiresAt).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newCoupon = {
      id: `coup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: cleanCode,
      title: title?.trim() || `${type === 'PERCENT' ? `${discountVal}% Off` : `Flat ₹${discountVal} Off`}`,
      description: description?.trim() || `Save on orders above ₹${minOrderVal}`,
      type: type === 'PERCENT' ? 'PERCENT' : 'FLAT',
      value: discountVal,
      minOrder: minOrderVal,
      maxDiscount: type === 'PERCENT' ? (parseFloat(maxDiscount) || discountVal * 10) : discountVal,
      expiresAt: parsedExpiry,
      isGenerated: false,
      usageLimit: parseInt(usageLimit, 10) || 500,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    activeCoupons.unshift(newCoupon);

    return res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully`,
      coupon: newCoupon,
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

    const coupon = activeCoupons.find((c) => c.id === id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
      const duplicate = activeCoupons.find(
        (c) => c.id !== id && c.code.toUpperCase() === cleanCode
      );
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Coupon code "${cleanCode}" already used by another coupon.`,
        });
      }
      coupon.code = cleanCode;
    }

    if (title !== undefined) coupon.title = title.trim();
    if (description !== undefined) coupon.description = description.trim();
    if (type !== undefined) coupon.type = type === 'PERCENT' ? 'PERCENT' : 'FLAT';
    if (value !== undefined) coupon.value = parseFloat(value);
    if (minOrder !== undefined) coupon.minOrder = parseFloat(minOrder);
    if (maxDiscount !== undefined) coupon.maxDiscount = parseFloat(maxDiscount);
    if (expiresAt !== undefined) coupon.expiresAt = new Date(expiresAt).toISOString();
    if (usageLimit !== undefined) coupon.usageLimit = parseInt(usageLimit, 10);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" updated successfully`,
      coupon,
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
    const coupon = activeCoupons.find((c) => c.id === id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.isActive = coupon.isActive === false ? true : false;

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? 'Active' : 'Disabled'}`,
      isActive: coupon.isActive,
      coupon,
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
    const index = activeCoupons.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const [deleted] = activeCoupons.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: `Coupon "${deleted.code}" deleted successfully`,
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
