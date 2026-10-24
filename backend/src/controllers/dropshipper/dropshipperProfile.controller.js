import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * 1. GET DROPSHIPPER PROFILE
 * Route: GET /api/v1/dropshipper/profile/:firebaseUid
 */
export const getDropshipperProfile = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID in request parameters" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: firebaseUid },
      include: {
        wallet: {
          select: {
            id: true,
            balance: true,
            pending: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    // Role Guard: Ensure user is authorized as DROPSHIPPER or RESELLER
    if (profile.role !== 'DROPSHIPPER' && profile.role !== 'RESELLER') {
      return res.status(403).json({ error: "Access Denied: Account is not authorized as a Dropshipper" });
    }

    return res.status(200).json({
      success: true,
      profile
    });

  } catch (error) {
    console.error("Get Dropshipper Profile Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch dropshipper profile" });
  }
};

/**
 * 2. UPDATE DROPSHIPPER PROFILE
 * Route: PUT /api/v1/dropshipper/profile
 * Body: { firebaseUid, fullName, phone, avatarUrl }
 */
export const updateDropshipperProfile = async (req, res) => {
  try {
    const { firebaseUid, fullName, phone, avatarUrl, storeName, bankDetails } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID in request body" });
    }

    // Find existing profile
    const existingProfile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!existingProfile) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    if (existingProfile.role !== 'DROPSHIPPER' && existingProfile.role !== 'RESELLER') {
      return res.status(403).json({ error: "Access Denied: Account is not authorized as a Dropshipper" });
    }

    // Sanitize inputs
    const cleanName = typeof fullName === 'string' && fullName.trim().length > 0 
      ? fullName.trim() 
      : existingProfile.fullName;

    const cleanPhone = typeof phone === 'string' && phone.trim().length > 0 
      ? phone.trim() 
      : null;

    const cleanAvatar = typeof avatarUrl === 'string' && avatarUrl.trim().length > 0
      ? avatarUrl.trim()
      : existingProfile.avatarUrl;

    // Check duplicate phone number if changing
    if (cleanPhone && cleanPhone !== existingProfile.phone) {
      const conflictPhone = await prisma.profile.findFirst({
        where: {
          phone: cleanPhone,
          id: { not: firebaseUid }
        }
      });

      if (conflictPhone) {
        return res.status(400).json({ 
          error: "An account with this phone number already exists. Please use a different number." 
        });
      }
    }

    // Update profile in PostgreSQL
    const updateData = {
      fullName: cleanName,
      phone: cleanPhone !== null ? cleanPhone : existingProfile.phone,
      avatarUrl: cleanAvatar
    };

    if (typeof storeName === 'string') {
      updateData.storeName = storeName.trim();
    }

    if (bankDetails && typeof bankDetails === 'object') {
      updateData.bankDetails = bankDetails;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: firebaseUid },
      data: updateData,
      include: {
        wallet: {
          select: {
            id: true,
            balance: true,
            pending: true
          }
        }
      }
    });

    // Also sync updated storeName and bankDetails with the user's KYCApplication documents in DB
    try {
      const existingKyc = await prisma.kYCApplication.findFirst({
        where: { userId: firebaseUid, type: 'dropshipper' },
        orderBy: { createdAt: 'desc' }
      });

      if (existingKyc) {
        const docs = typeof existingKyc.documents === 'object' && existingKyc.documents !== null 
          ? { ...existingKyc.documents } 
          : {};

        if (typeof storeName === 'string' && storeName.trim()) {
          docs.brandName = storeName.trim();
          docs.businessName = storeName.trim();
        }
        if (cleanName) {
          docs.proprietorName = cleanName;
        }
        if (cleanPhone) {
          docs.phone = cleanPhone;
        }
        if (bankDetails && typeof bankDetails === 'object') {
          docs.bank = {
            ...(docs.bank || {}),
            bankName: bankDetails.bankName || docs.bank?.bankName || '',
            accountNumber: bankDetails.accountNumber || docs.bank?.accountNumber || '',
            ifsc: (bankDetails.ifscCode || bankDetails.ifsc || docs.bank?.ifsc || '').toUpperCase(),
            upiId: bankDetails.upiId || docs.bank?.upiId || '',
            holderName: bankDetails.accountHolder || docs.bank?.holderName || cleanName
          };
          if (bankDetails.storeUrl) docs.storeUrl = bankDetails.storeUrl;
          if (bankDetails.platform) docs.platform = bankDetails.platform;
        }

        await prisma.kYCApplication.update({
          where: { id: existingKyc.id },
          data: { documents: docs }
        });
      }
    } catch (kycSyncErr) {
      console.warn("KYC documents sync warning:", kycSyncErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Dropshipper profile updated successfully",
      profile: updatedProfile
    });

  } catch (error) {
    console.error("Update Dropshipper Profile Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: "A unique constraint conflict occurred. Please verify your phone number." 
      });
    }
    return res.status(500).json({ error: error.message || "Failed to update profile" });
  }
};

/**
 * 3. UPLOAD DROPSHIPPER AVATAR
 * Route: POST /api/v1/dropshipper/profile/avatar
 * Multipart Form Data: { firebaseUid, avatar (file) }
 */
export const uploadDropshipperAvatar = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID in request body" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided for avatar upload" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!profile) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    // Public URL path relative to static server
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const updatedProfile = await prisma.profile.update({
      where: { id: firebaseUid },
      data: {
        avatarUrl: avatarPath
      },
      include: {
        wallet: {
          select: {
            id: true,
            balance: true,
            pending: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Profile avatar uploaded successfully",
      avatarUrl: avatarPath,
      profile: updatedProfile
    });

  } catch (error) {
    console.error("Upload Avatar Error:", error);
    return res.status(500).json({ error: error.message || "Failed to upload avatar" });
  }
};

