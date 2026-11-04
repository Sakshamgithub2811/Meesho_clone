import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Platform standard default template (Clean Enterprise Standard)
export const DEFAULT_MARGIN_CONFIG = {
  pricingStrategy: 'FIXED', // 'FIXED' | 'PERCENTAGE'
  fixedMarkup: 200,
  percentageMarkup: 25,
  smartRounding: true,
  shippingMode: 'FREE_TO_CUSTOMER', // 'FREE_TO_CUSTOMER' | 'SEPARATE'
  estimatedShippingFee: 60,
  categoryRules: [] // Clean by default: Overrides are optional and dynamic
};

/**
 * 1. GET DROPSHIPPER MARGIN CONFIGURATION
 * Route: GET /api/v1/dropshipper/margin-config/:firebaseUid
 */
export const getDropshipperMarginConfig = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });
    if (!user) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    const savedConfig = await prisma.dropshipperMarginConfig.findUnique({
      where: { userId: firebaseUid }
    });

    if (!savedConfig) {
      // User has not customized their margin rules yet -> return platform standard template
      return res.status(200).json({
        success: true,
        isCustom: false,
        config: DEFAULT_MARGIN_CONFIG
      });
    }

    return res.status(200).json({
      success: true,
      isCustom: true,
      config: {
        pricingStrategy: savedConfig.pricingStrategy,
        fixedMarkup: savedConfig.fixedMarkup,
        percentageMarkup: savedConfig.percentageMarkup,
        smartRounding: savedConfig.smartRounding,
        shippingMode: savedConfig.shippingMode,
        estimatedShippingFee: savedConfig.estimatedShippingFee,
        categoryRules: savedConfig.categoryRules || DEFAULT_MARGIN_CONFIG.categoryRules,
        updatedAt: savedConfig.updatedAt
      }
    });
  } catch (error) {
    console.error("Get Margin Config Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch margin config" });
  }
};

/**
 * 2. SAVE OR UPDATE MARGIN CONFIGURATION
 * Route: POST /api/v1/dropshipper/margin-config/save
 */
export const saveDropshipperMarginConfig = async (req, res) => {
  try {
    const { 
      firebaseUid,
      pricingStrategy,
      fixedMarkup,
      percentageMarkup,
      smartRounding,
      shippingMode,
      estimatedShippingFee,
      categoryRules
    } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });
    if (!user) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    const saved = await prisma.dropshipperMarginConfig.upsert({
      where: { userId: firebaseUid },
      update: {
        pricingStrategy: pricingStrategy || 'FIXED',
        fixedMarkup: Number(fixedMarkup) >= 0 ? Number(fixedMarkup) : 200,
        percentageMarkup: Number(percentageMarkup) >= 0 ? Number(percentageMarkup) : 25,
        smartRounding: typeof smartRounding === 'boolean' ? smartRounding : true,
        shippingMode: shippingMode || 'FREE_TO_CUSTOMER',
        estimatedShippingFee: Number(estimatedShippingFee) >= 0 ? Number(estimatedShippingFee) : 60,
        categoryRules: categoryRules ?? undefined
      },
      create: {
        userId: firebaseUid,
        pricingStrategy: pricingStrategy || 'FIXED',
        fixedMarkup: Number(fixedMarkup) >= 0 ? Number(fixedMarkup) : 200,
        percentageMarkup: Number(percentageMarkup) >= 0 ? Number(percentageMarkup) : 25,
        smartRounding: typeof smartRounding === 'boolean' ? smartRounding : true,
        shippingMode: shippingMode || 'FREE_TO_CUSTOMER',
        estimatedShippingFee: Number(estimatedShippingFee) >= 0 ? Number(estimatedShippingFee) : 60,
        categoryRules: categoryRules || DEFAULT_MARGIN_CONFIG.categoryRules
      }
    });

    return res.status(200).json({
      success: true,
      message: "Margin & Pricing rules saved to database",
      config: saved
    });
  } catch (error) {
    console.error("Save Margin Config Error:", error);
    return res.status(500).json({ error: error.message || "Failed to save margin config" });
  }
};

/**
 * 3. RESET MARGIN CONFIGURATION TO DEFAULTS
 * Route: DELETE /api/v1/dropshipper/margin-config/:firebaseUid
 */
export const resetDropshipperMarginConfig = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    await prisma.dropshipperMarginConfig.deleteMany({
      where: { userId: firebaseUid }
    });

    return res.status(200).json({
      success: true,
      message: "Margin configuration reset to platform defaults",
      config: DEFAULT_MARGIN_CONFIG
    });
  } catch (error) {
    console.error("Reset Margin Config Error:", error);
    return res.status(500).json({ error: error.message || "Failed to reset margin config" });
  }
};
