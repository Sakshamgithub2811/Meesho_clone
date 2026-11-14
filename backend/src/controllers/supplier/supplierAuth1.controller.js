import prisma from '../../config/prisma.js';

// 1. REGISTER SUPPLIER (Firebase UID Based)
export const registerSupplier = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, storeName, phone } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    let profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (profile) {
      return res.status(400).json({ error: "Supabase Error: User already exists" });
    }

    profile = await prisma.profile.create({
      data: {
        id: firebaseUid,
        email: email,
        fullName: fullName || "New Supplier",
        storeName: storeName || `${fullName || 'Supplier'}'s Store`,
        phone: phone || null,
        role: "SUPPLIER",
        tier: "Silver",
        tierLabel: "Silver Supplier",
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Supplier Registered Successfully',
      user: profile
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN SUPPLIER (Firebase UID Based)
export const loginSupplier = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!profile) {
      return res.status(404).json({ error: "Supabase Error: Supplier Profile not found in database" });
    }

    if (profile.role !== 'SUPPLIER' && profile.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Your role is not SUPPLIER' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login Success',
      user: profile
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
