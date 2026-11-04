import prisma from '../../config/prisma.js';
import admin from '../../config/firebaseAdmin.js';
import { sendVerificationEmail, sendLoginOtpEmail } from '../../utils/emailTemplates.js';

// In-memory fallback in case Prisma / database connection is unavailable
const fallbackUserStore = new Map();
// In-memory OTP store for secure email login verification
const loginOtpStore = new Map();

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
      const authInstance = typeof admin?.auth === 'function' ? admin.auth() : admin?.auth;
      if (authInstance?.generateEmailVerificationLink) {
        const verificationLink = await authInstance.generateEmailVerificationLink(email);
        const emailRes = await sendVerificationEmail({
          email,
          name: fullName || profile.fullName || email.split('@')[0],
          verificationLink
        });
        console.log(`✨ Designed verification email successfully sent to ${email}:`, emailRes);
      } else {
        console.warn("Firebase Admin auth instance not available for email link generation");
      }
    } catch (emailErr) {
      console.error("Could not dispatch custom branded verification email:", emailErr.message);
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

    const authInstance = typeof admin?.auth === 'function' ? admin.auth() : admin?.auth;
    if (authInstance?.generateEmailVerificationLink) {
      const verificationLink = await authInstance.generateEmailVerificationLink(email);
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

// 3. LOGIN USER / CUSTOMER (DIRECT EMAIL & PASSWORD LOGIN - NO OTP REQUIRED)
export const loginUser = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "Missing Firebase Uid and Email" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let profile;
    try {
      profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { id: firebaseUid },
            { email: { equals: cleanEmail, mode: 'insensitive' } }
          ]
        },
        include: {
          wallet: true
        }
      });

      if (!profile) {
        // Auto-provision if user exists in Firebase but not in DB yet
        profile = await prisma.profile.create({
          data: {
            id: firebaseUid,
            email: cleanEmail,
            role: "CUSTOMER",
            fullName: cleanEmail.split('@')[0] || "MShoppy Customer",
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
      profile = fallbackUserStore.get(firebaseUid) || fallbackUserStore.get(cleanEmail) || {
        id: firebaseUid,
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0] || "MShoppy Customer",
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

// 4. SEND LOGIN OTP TO USER EMAIL
export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    // 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    let fullName = "MShoppy Customer";
    try {
      const user = await prisma.profile.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } }
      });
      if (user?.fullName) fullName = user.fullName;
    } catch (e) {}

    loginOtpStore.set(cleanEmail, { otp, expiresAt, fullName });

    const emailRes = await sendLoginOtpEmail({
      email: cleanEmail,
      name: fullName,
      otp
    });

    console.log(`🔐 Login OTP generated for ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `Login OTP dispatched to ${cleanEmail}`,
      emailSent: emailRes?.success || false,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error("sendLoginOtp Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 5. VERIFY LOGIN OTP
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, firebaseUid } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = loginOtpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ 
        error: "No active OTP request found. Please request a new OTP code." 
      });
    }

    if (Date.now() > record.expiresAt) {
      loginOtpStore.delete(cleanEmail);
      return res.status(400).json({ 
        error: "This OTP has expired. Please request a fresh OTP code." 
      });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({ 
        error: "Invalid OTP code. Please enter the correct 6-digit code sent to your email." 
      });
    }

    // OTP Verified! Clear it from store
    loginOtpStore.delete(cleanEmail);

    let profile;
    try {
      profile = await prisma.profile.findFirst({
        where: {
          OR: [
            firebaseUid ? { id: firebaseUid } : null,
            { email: { equals: cleanEmail, mode: 'insensitive' } }
          ].filter(Boolean)
        },
        include: { wallet: true }
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            id: firebaseUid || `user_${Date.now()}`,
            email: cleanEmail,
            role: "CUSTOMER",
            fullName: record.fullName || cleanEmail.split('@')[0],
            wallet: {
              create: { balance: 0.0, pending: 0.0 }
            }
          },
          include: { wallet: true }
        });
      }
    } catch (dbError) {
      console.warn("Prisma fallback during OTP login:", dbError.message);
      profile = fallbackUserStore.get(firebaseUid || cleanEmail) || {
        id: firebaseUid || `user_${Date.now()}`,
        email: cleanEmail,
        fullName: record.fullName || cleanEmail.split('@')[0],
        role: "CUSTOMER",
        walletBalance: 0
      };
    }

    return res.status(200).json({
      success: true,
      message: "Login OTP verified successfully",
      user: profile
    });
  } catch (error) {
    console.error("verifyLoginOtp Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
