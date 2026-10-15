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
    const { firebaseUid, fullName, phone, avatarUrl } = req.body;

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
    const updatedProfile = await prisma.profile.update({
      where: { id: firebaseUid },
      data: {
        fullName: cleanName,
        phone: cleanPhone !== null ? cleanPhone : existingProfile.phone,
        avatarUrl: cleanAvatar
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
