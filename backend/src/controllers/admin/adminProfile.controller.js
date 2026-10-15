import prisma from '../../config/prisma.js';
import admin from '../../config/firebaseAdmin.js';

// 1. GET LOGGED IN PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. UPDATE PROFILE DETAILS (Name, Phone, Avatar, Address)
export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, avatarUrl, addressLine, city, state, pincode } = req.body;

    // 1. Agar address update bheja hai toh pehle Address table me update ya create karein
    if (addressLine || city || pincode) {
      const existingAddress = await prisma.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            addressLine: addressLine || existingAddress.addressLine,
            city: city || existingAddress.city || '',
            state: state || existingAddress.state || '',
            pincode: pincode || existingAddress.pincode || '',
            fullName: fullName || existingAddress.fullName,
            phone: phone || existingAddress.phone
          }
        });
      } else {
        await prisma.address.create({
          data: {
            userId: req.user.id,
            addressLine: addressLine || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            fullName: fullName || 'Admin',
            phone: phone || ''
          }
        });
      }
    }

    // 2. Profile update karein (sirf valid columns: fullName, phone, avatarUrl)
    const updatedProfile = await prisma.profile.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. CHANGE PASSWORD (Firebase Admin SDK se)
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    // Firebase Auth mein password update
    await admin.auth().updateUser(req.user.id, {
      password: newPassword
    });

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
