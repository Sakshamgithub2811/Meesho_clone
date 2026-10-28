// backend/src/controllers/coupon.controller.js

// Preloaded genuine active coupons
export let activeCoupons = [
  {
    id: 'coup_1',
    code: 'SAVE50',
    title: 'Flat ₹50 Off',
    description: 'Save ₹50 on all orders above ₹199',
    type: 'FLAT', // 'FLAT' | 'PERCENT'
    value: 50,
    minOrder: 199,
    maxDiscount: 50,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isGenerated: false,
    usageLimit: 1000,
    usedCount: 142,
    isActive: true
  },
  {
    id: 'coup_2',
    code: 'MEESHO100',
    title: 'Super Saver ₹100 Off',
    description: 'Flat ₹100 instant discount on orders above ₹399',
    type: 'FLAT',
    value: 100,
    minOrder: 399,
    maxDiscount: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isGenerated: false,
    usageLimit: 500,
    usedCount: 89,
    isActive: true
  },
  {
    id: 'coup_3',
    code: 'FESTIVE15',
    title: 'Festive Delight 15% Off',
    description: 'Get 15% instant off up to ₹150 on orders above ₹249',
    type: 'PERCENT',
    value: 15,
    minOrder: 249,
    maxDiscount: 150,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isGenerated: false,
    usageLimit: 800,
    usedCount: 213,
    isActive: true
  },
  {
    id: 'coup_4',
    code: 'NEWUSER80',
    title: 'Special First Order ₹80 Off',
    description: 'Special introductory discount for verified customers on orders above ₹299',
    type: 'FLAT',
    value: 80,
    minOrder: 299,
    maxDiscount: 80,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isGenerated: false,
    usageLimit: 2000,
    usedCount: 410,
    isActive: true
  },
  {
    id: 'coup_5',
    code: 'BIGSAVER20',
    title: 'Mega Saver 20% Off',
    description: 'Save 20% up to ₹250 on cart total above ₹499',
    type: 'PERCENT',
    value: 20,
    minOrder: 499,
    maxDiscount: 250,
    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isGenerated: false,
    usageLimit: 300,
    usedCount: 65,
    isActive: true
  }
];

/**
 * Get all active valid coupons available to users
 */
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const validCoupons = activeCoupons.filter(
      c => c.isActive !== false && new Date(c.expiresAt) > now
    );

    return res.status(200).json({
      success: true,
      count: validCoupons.length,
      data: validCoupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

/**
 * Validate and calculate exact discount for an applied coupon code
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

    // Strict lookup: only genuinely registered/generated codes are accepted
    const coupon = activeCoupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon code "${cleanCode}" is invalid or does not exist.`
      });
    }

    // Check if disabled by admin
    if (coupon.isActive === false) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon code "${cleanCode}" has been disabled or deactivated.`
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
 * Generate a new authentic coupon code and register it in the active coupons database
 */
export const generateNewCoupon = async (req, res) => {
  try {
    const { discountType, value, minOrder, prefix = 'MSH' } = req.body || {};

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedCode = `${prefix.toUpperCase()}${randomSuffix}`;

    const discountVal = parseInt(value) || 75;
    const isPercent = discountType === 'PERCENT';
    const minVal = parseInt(minOrder) || (discountVal * 3);

    const newCoupon = {
      id: `coup_${Date.now()}_${randomSuffix}`,
      code: generatedCode,
      title: isPercent ? `Exclusive ${discountVal}% Off` : `Exclusive ₹${discountVal} Off`,
      description: isPercent
        ? `Get ${discountVal}% instant off on orders above ₹${minVal}`
        : `Flat ₹${discountVal} instant savings on orders above ₹${minVal}`,
      type: isPercent ? 'PERCENT' : 'FLAT',
      value: discountVal,
      minOrder: minVal,
      maxDiscount: isPercent ? discountVal * 10 : discountVal,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days validity
      isGenerated: true,
      usageLimit: 1,
      usedCount: 0
    };

    activeCoupons.unshift(newCoupon);

    return res.status(201).json({
      success: true,
      message: `New exclusive coupon code "${generatedCode}" generated and registered successfully!`,
      data: newCoupon
    });
  } catch (error) {
    console.error('Error generating coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate coupon',
      error: error.message
    });
  }
};
