import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. REGISTER DROPSHIPPER
export const registerDropshipper = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, phone, businessName } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const cleanEmail = email.trim();
    const cleanPhone = (phone && typeof phone === 'string' && phone.trim().length > 0) ? phone.trim() : null;

    // Check if account already exists with this Firebase UID
    let existingProfile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (existingProfile) {
      return res.status(400).json({ error: "Dropshipper account already exists with this ID" });
    }

    // Check if email or phone is already taken
    const conflictConditions = [{ email: cleanEmail }];
    if (cleanPhone) {
      conflictConditions.push({ phone: cleanPhone });
    }

    const existingConflict = await prisma.profile.findFirst({
      where: {
        OR: conflictConditions
      }
    });

    if (existingConflict) {
      if (existingConflict.email?.toLowerCase() === cleanEmail.toLowerCase()) {
        return res.status(400).json({ error: "An account with this email address already exists. Please login." });
      }
      if (cleanPhone && existingConflict.phone === cleanPhone) {
        return res.status(400).json({ error: "An account with this phone number already exists." });
      }
    }

    const profile = await prisma.profile.create({
      data: {
        id: firebaseUid,
        email: cleanEmail,
        phone: cleanPhone,
        role: "DROPSHIPPER",
        fullName: (fullName && fullName.trim()) || (businessName && businessName.trim()) || "Dropshipper Partner"
      }
    });

    // Auto-create wallet for dropshipper if not exists
    try {
      await prisma.wallet.create({
        data: {
          userId: profile.id,
          balance: 0,
          pending: 0
        }
      });
    } catch (wErr) {
      // Wallet creation non-blocking if already exists
    }

    return res.status(201).json({
      success: true,
      message: 'Dropshipper Registered Successfully',
      user: profile
    });

  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target ? (Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target) : 'field';
      return res.status(400).json({ error: `An account with this ${field} is already registered.` });
    }
    return res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN DROPSHIPPER
export const loginDropshipper = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!profile) {
      return res.status(404).json({ error: "Dropshipper Profile not found in database. Please register first." });
    }

    if (profile.role !== 'DROPSHIPPER' && profile.role !== 'RESELLER') {
      return res.status(403).json({ error: 'Access Denied: Your account role is not registered as a Dropshipper' });
    }

    return res.status(200).json({
      success: true,
      message: 'Dropshipper Login Success',
      user: profile
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
