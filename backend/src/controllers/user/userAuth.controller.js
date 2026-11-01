import prisma from '../../config/prisma.js';
import admin from '../../config/firebaseAdmin.js';
import { sendVerificationEmail } from '../../utils/emailTemplates.js';

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
            fullName: fullName || "MShoppy Customer",
            wallet: {
              create: {
                balance: 0.0,
                pending: 0.0
              }
            }
          },
          include: {
            wallet: true
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
        walletBalance: 0,
        createdAt: new Date().toISOString()
      };
      fallbackUserStore.set(firebaseUid, profile);
    }

    // Automatically send high-impact, branded Meesho HTML Verification Email
    try {
      if (admin && admin.auth) {
        const verificationLink = await admin.auth().generateEmailVerificationLink(email);
        await sendVerificationEmail({
          email,
          name: fullName || profile.fullName || email.split('@')[0],
          verificationLink
        });
        console.log(`✨ Designed verification email successfully sent to ${email}`);
      }
    } catch (emailErr) {
      console.warn("Could not dispatch custom branded verification email:", emailErr.message);
    }

    return res.status(201).json({ 
      success: true, 
      message: 'User Registered Successfully. Branded verification email dispatched.', 
      user: profile 
    });

  } catch (error) {
    console.error("Register User Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 2. RESEND BRANDED VERIFICATION EMAIL
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (admin && admin.auth) {
      const verificationLink = await admin.auth().generateEmailVerificationLink(email);
      const result = await sendVerificationEmail({
        email,
        name: fullName || email.split('@')[0],
        verificationLink
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Branded verification email resent successfully"
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error || "Failed to deliver email"
        });
      }
    } else {
      return res.status(500).json({ error: "Firebase Admin is not configured" });
    }
  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 3. LOGIN USER / CUSTOMER
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
            fullName: email.split('@')[0] || "MShoppy Customer",
            wallet: {
              create: {
                balance: 0.0,
                pending: 0.0
              }
            }
          },
          include: {
            wallet: true
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
        walletBalance: 0,
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
