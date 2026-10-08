import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. REGISTER ADMIN
export const registerAdmin = async (req, res) => {
  try {
    const { firebaseUid, email, fullName } = req.body;

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
        role: "ADMIN",
        fullName: fullName || "New Admin"
      }
    });

    return res.status(201).json({ success: true, message: 'Admin Registered Successfully', user: profile });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN ADMIN
export const loginAdmin = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!profile) {
      return res.status(404).json({ error: "Supabase Error: Admin Profile not found in database" });
    }

    if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Your role is not ADMIN' });
    }

    return res.status(200).json({ success: true, message: 'Login Success', user: profile });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};