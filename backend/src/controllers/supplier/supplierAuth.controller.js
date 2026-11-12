import prisma from '../../config/prisma.js';

// Helper to format supplier response safely
const formatSupplierResponse = (user) => {
  if (!user) return null;
  const bank = user.bankDetails || {
    accountHolder: user.fullName || 'Verified Supplier',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  };

  const gst = user.gstDetails || {
    gstin: user.gstin || '',
    pan: user.pan || '',
    registeredState: '',
  };

  return {
    id: user.id,
    name: user.fullName || 'Verified Supplier',
    fullName: user.fullName || 'Verified Supplier',
    email: user.email || '',
    phone: user.phone || '',
    storeName: user.storeName || `${user.fullName || 'Supplier'}'s Store`,
    avatarUrl: user.avatarUrl || null,
    tier: user.tier || 'Silver',
    tierLabel: user.tierLabel || 'Silver Supplier',
    rating: user.rating || 5.0,
    followers: user.followers || '0',
    experienceYears: user.experienceYears || '1+',
    role: user.role || 'SUPPLIER',
    bankDetails: bank,
    gstDetails: gst,
  };
};

/**
 * 1. Get Current Logged-In Supplier Profile
 * GET /api/supplier/auth/me or GET /api/supplier/profile
 */
export const getSupplierProfile = async (req, res, next) => {
  try {
    const supplierId = req.supplierId || req.user?.id || req.user?.uid;

    if (!supplierId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Supplier ID not found in session',
      });
    }

    const supplier = await prisma.profile.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier profile not found in database',
      });
    }

    return res.status(200).json({
      success: true,
      supplier: formatSupplierResponse(supplier),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Update Supplier Profile
 * PUT /api/supplier/profile
 */
export const updateSupplierProfile = async (req, res, next) => {
  try {
    const supplierId = req.supplierId || req.user?.id || req.user?.uid;
    const { name, fullName, storeName, phone, avatarUrl } = req.body;

    if (!supplierId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Supplier ID not found in session',
      });
    }

    const updateData = {};
    if (fullName || name) updateData.fullName = fullName || name;
    if (storeName) updateData.storeName = storeName;
    if (phone) updateData.phone = phone;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    const updatedSupplier = await prisma.profile.update({
      where: { id: supplierId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      supplier: formatSupplierResponse(updatedSupplier),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Update Bank & Financial Details
 * PUT /api/supplier/profile/bank
 */
export const updateBankDetails = async (req, res, next) => {
  try {
    const supplierId = req.supplierId || req.user?.id || req.user?.uid;
    const { accountHolder, bankName, accountNumber, ifsc, upiId } = req.body;

    if (!supplierId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Supplier ID not found in session',
      });
    }

    const bankDetails = {
      accountHolder: accountHolder || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifsc: ifsc || '',
      upiId: upiId || '',
    };

    const updatedSupplier = await prisma.profile.update({
      where: { id: supplierId },
      data: { bankDetails },
    });

    return res.status(200).json({
      success: true,
      message: 'Bank details updated successfully!',
      bankDetails: updatedSupplier.bankDetails || bankDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Update GST & Tax Details
 * PUT /api/supplier/profile/gst
 */
export const updateGstDetails = async (req, res, next) => {
  try {
    const supplierId = req.supplierId || req.user?.id || req.user?.uid;
    const { gstin, pan, registeredState } = req.body;

    if (!supplierId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Supplier ID not found in session',
      });
    }

    const updateData = {};
    if (gstin) updateData.gstin = gstin;
    if (pan) updateData.pan = pan;

    const updatedSupplier = await prisma.profile.update({
      where: { id: supplierId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'GST & Tax details updated successfully!',
      gstDetails: {
        gstin: updatedSupplier.gstin || '',
        pan: updatedSupplier.pan || '',
        registeredState: registeredState || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Supplier Logout
 * POST /api/supplier/auth/logout
 */
export const logoutSupplier = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
