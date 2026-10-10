import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In-memory fallback in case Prisma / database connection is unavailable
const fallbackUserStore = new Map();

// 1. REGISTER USER / CUSTOMER
export const registerUser = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, phone } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    let profile;
    try {
      profile = await prisma.profile.findUnique({
        where: { id: firebaseUid }
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            id: firebaseUid,
            email: email,
            phone: phone || null,
            role: "CUSTOMER",
            fullName: fullName || "MShoppy Customer"
          }
        });
      }
    } catch (dbError) {
      console.warn("Prisma DB fallback triggered for user register:", dbError.message);
      profile = {
        id: firebaseUid,
        email: email,
        phone: phone || null,
        fullName: fullName || "MShoppy Customer",
        role: "CUSTOMER",
        walletBalance: 1000,
        createdAt: new Date().toISOString()
      };
      fallbackUserStore.set(firebaseUid, profile);
    }

    return res.status(201).json({ 
      success: true, 
      message: 'User Registered Successfully', 
      user: profile 
    });

  } catch (error) {
    console.error("Register User Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN USER / CUSTOMER
export const loginUser = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    let profile;
    try {
      profile = await prisma.profile.findUnique({
        where: { id: firebaseUid }
      });

      if (!profile) {
        // Auto-provision if user exists in Firebase but not in DB yet
        profile = await prisma.profile.create({
          data: {
            id: firebaseUid,
            email: email,
            role: "CUSTOMER",
            fullName: email.split('@')[0] || "MShoppy Customer"
          }
        });
      }
    } catch (dbError) {
      console.warn("Prisma DB fallback triggered for user login:", dbError.message);
      profile = fallbackUserStore.get(firebaseUid) || {
        id: firebaseUid,
        email: email,
        fullName: email.split('@')[0] || "MShoppy Customer",
        role: "CUSTOMER",
        walletBalance: 1000,
        createdAt: new Date().toISOString()
      };
    }

    return res.status(200).json({ 
      success: true, 
      message: 'User Login Success', 
      user: profile 
    });

  } catch (error) {
    console.error("Login User Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
