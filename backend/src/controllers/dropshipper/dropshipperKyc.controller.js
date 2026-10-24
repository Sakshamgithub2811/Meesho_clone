import prisma from '../../config/prisma.js';

/**
 * 1. SUBMIT DROPSHIPPER 4-STEP KYC APPLICATION
 * POST /api/v1/dropshipper/kyc
 */
export const submitDropshipperKyc = async (req, res) => {
  try {
    const {
      firebaseUid,
      brandName,
      storeName,
      proprietorName,
      email,
      phone,
      storeUrl,
      platform,
      expectedOrders,
      niche,
      businessType,
      panNumber,
      aadhaarNumber,
      businessRegType,
      gstin,
      msmeNumber,
      accountHolder,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      documents
    } = req.body;

    const targetUid = firebaseUid || req.user?.id;
    if (!targetUid) {
      return res.status(400).json({ success: false, error: "Firebase UID is required to submit KYC application" });
    }

    // 1. Verify or create user Profile in PostgreSQL
    let profile = await prisma.profile.findUnique({
      where: { id: targetUid }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: targetUid,
          email: email || `${targetUid}@dropshipper.meesho.local`,
          fullName: proprietorName || brandName || "Dropshipper Partner",
          phone: phone || null,
          role: "DROPSHIPPER",
          storeName: brandName || storeName || null
        }
      });
    }

    // 2. Prepare structured documents payload matching Admin expectations
    const effectiveBrand = (brandName || storeName || profile.storeName || "My Dropship Store").trim();
    const effectiveName = (proprietorName || accountHolder || profile.fullName || "Dropshipper Partner").trim();

    const documentsPayload = {
      businessName: effectiveBrand,
      brandName: effectiveBrand,
      storeType: businessType || "Individual Dropshipper",
      storeUrl: storeUrl || "",
      platform: platform || "Shopify",
      expectedOrders: expectedOrders || "",
      niche: Array.isArray(niche) ? niche : (niche ? [niche] : []),
      proprietorName: effectiveName,
      pan: {
        number: (panNumber || "").toUpperCase().trim(),
        nameOnDoc: effectiveName,
        status: "Submitted",
        image: documents?.panImage || ""
      },
      aadhaar: {
        number: (aadhaarNumber || "").trim(),
        nameOnDoc: effectiveName,
        status: "Submitted",
        image: documents?.aadhaarImage || ""
      },
      tax: {
        businessRegType: businessRegType || "gstin",
        gstin: (gstin || "").toUpperCase().trim(),
        msmeNumber: (msmeNumber || "").trim()
      },
      bank: {
        bankName: (bankName || "").trim(),
        accountNumber: (accountNumber || "").trim(),
        ifsc: (ifscCode || "").toUpperCase().trim(),
        holderName: (accountHolder || effectiveName).trim(),
        upiId: (upiId || "").trim()
      },
      submittedAt: new Date().toISOString()
    };

    // 3. Find if application already exists for this user
    const existingApp = await prisma.kYCApplication.findFirst({
      where: {
        userId: targetUid,
        type: 'dropshipper'
      }
    });

    let savedApp;
    if (existingApp) {
      savedApp = await prisma.kYCApplication.update({
        where: { id: existingApp.id },
        data: {
          status: 'PENDING',
          documents: documentsPayload,
          adminNotes: null
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          }
        }
      });
    } else {
      savedApp = await prisma.kYCApplication.create({
        data: {
          userId: targetUid,
          type: 'dropshipper',
          status: 'PENDING',
          documents: documentsPayload
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          }
        }
      });
    }

    // 4. Update Profile with immediate store & bank metadata
    try {
      await prisma.profile.update({
        where: { id: targetUid },
        data: {
          storeName: effectiveBrand,
          fullName: effectiveName,
          phone: phone || profile.phone,
          pan: (panNumber || "").toUpperCase().trim() || profile.pan,
          gstin: (gstin || "").toUpperCase().trim() || profile.gstin,
          bankDetails: {
            bankName: bankName || '',
            accountNumber: accountNumber || '',
            ifscCode: (ifscCode || '').toUpperCase(),
            upiId: upiId || ''
          }
        }
      });
    } catch (profileUpdateErr) {
      console.warn("Could not sync profile metadata:", profileUpdateErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Dropshipper KYC Application submitted successfully to Admin verification queue.",
      application: savedApp
    });

  } catch (error) {
    console.error("Submit Dropshipper KYC Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. GET DROPSHIPPER KYC STATUS
 * GET /api/v1/dropshipper/kyc/:firebaseUid
 */
export const getDropshipperKycStatus = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, error: "Firebase UID is required" });
    }

    const application = await prisma.kYCApplication.findFirst({
      where: {
        userId: firebaseUid,
        type: 'dropshipper'
      },
      orderBy: { createdAt: 'desc' }
    });

    const profile = await prisma.profile.findUnique({
      where: { id: firebaseUid },
      select: {
        id: true,
        role: true,
        storeName: true,
        pan: true,
        gstin: true,
        bankDetails: true
      }
    });

    if (!application) {
      return res.status(200).json({
        success: true,
        hasSubmitted: false,
        status: 'NOT_SUBMITTED',
        profile
      });
    }

    return res.status(200).json({
      success: true,
      hasSubmitted: true,
      status: application.status,
      application,
      adminNotes: application.adminNotes,
      profile
    });

  } catch (error) {
    console.error("Get Dropshipper KYC Status Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
