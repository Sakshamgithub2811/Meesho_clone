import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL KYC APPLICATIONS (With Filters & Search)
 * Supports query params: ?status=PENDING&type=dropshipper&search=rahul
 */
export const getAllKycApplications = async (req, res) => {
  try {
    const { status, type, search } = req.query;

    const where = {};

    // Status filter
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status.toUpperCase();
    }

    // Type filter (dropshipper | affiliate)
    if (type && type.toUpperCase() !== 'ALL') {
      where.type = type.toLowerCase();
    }

    // Search filter (applicant name, email, or phone)
    if (search && search.trim()) {
      const q = search.trim();
      where.user = {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } }
        ]
      };
    }

    const [applications, totalCount, pendingCount, underReviewCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.kYCApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              role: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.kYCApplication.count(),
      prisma.kYCApplication.count({ where: { status: 'PENDING' } }),
      prisma.kYCApplication.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.kYCApplication.count({ where: { status: 'APPROVED' } }),
      prisma.kYCApplication.count({ where: { status: 'REJECTED' } })
    ]);

    return res.status(200).json({
      success: true,
      applications,
      stats: {
        total: totalCount,
        pending: pendingCount,
        underReview: underReviewCount,
        approved: approvedCount,
        rejected: rejectedCount
      }
    });

  } catch (error) {
    console.error("Get KYC Applications Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. UPDATE KYC STATUS (Approve, Reject, or Mark Under Review)
 * PUT /api/v1/admin-kyc/:id/status
 * Body: { status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW', adminNotes: 'string' }
 */
export const updateKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, error: "Valid status is required (PENDING, UNDER_REVIEW, APPROVED, REJECTED)" });
    }

    const normalizedStatus = status.toUpperCase(); 

    // Verify KYC application exists
    const existing = await prisma.kYCApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "KYC Application not found" });
    }

    // Update KYC Application
    const updatedApplication = await prisma.kYCApplication.update({
      where: { id },
      data: {
        status: normalizedStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        }
      }
    });

    // If APPROVED, update applicant's role in Profile table
    if (normalizedStatus === 'APPROVED' && existing.userId) {
      if (existing.type?.toLowerCase() === 'dropshipper') {
        await prisma.profile.update({
          where: { id: existing.userId },
          data: { role: 'DROPSHIPPER' }
        }).catch(() => {});
      } else if (existing.type?.toLowerCase() === 'supplier') {
        const docs = existing.documents || {};
        await prisma.profile.update({
          where: { id: existing.userId },
          data: { 
            role: 'SUPPLIER',
            storeName: docs.businessName || docs.tradeName || undefined,
            gstin: docs.gstin || undefined,
            pan: docs.pan?.number || undefined,
            bankDetails: docs.bank || undefined,
            tier: 'Silver',
            tierLabel: 'Verified Supplier'
          }
        }).catch((err) => console.warn('Supplier profile auto-update warning:', err.message));
      } else if (existing.type?.toLowerCase() === 'affiliate') {
        await prisma.profile.update({
          where: { id: existing.userId },
          data: { 
            role: 'RESELLER'
          }
        }).catch((err) => console.warn('Affiliate profile auto-update warning:', err.message));
      }
    }

    return res.status(200).json({
      success: true,
      message: `KYC Application ${normalizedStatus} successfully`,
      application: updatedApplication
    });

  } catch (error) {
    console.error("Update KYC Status Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 3. GET SINGLE KYC APPLICATION DETAILS
 * GET /api/v1/admin-kyc/:id
 */
export const getKycDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.kYCApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, error: "KYC Application not found" });
    }

    return res.status(200).json({
      success: true,
      application
    });

  } catch (error) {
    console.error("Get KYC Details Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 4. SUBMIT AFFILIATE KYC APPLICATION (Real Database Persistence)
 * POST /api/v1/admin-kyc/submit-affiliate
 */
export const submitAffiliateKyc = async (req, res) => {
  try {
    const {
      userId,
      applicationId,
      fullName,
      email,
      phone,
      handle,
      platform,
      followers,
      panNumber,
      panDocName,
      aadhaarNumber,
      aadhaarDocName,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId,
      chequeDocName,
      documents
    } = req.body || {};

    const cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    // 1. Locate existing Profile by userId, email, or phone
    let profile = null;
    if (userId) {
      profile = await prisma.profile.findUnique({ where: { id: userId } });
    }
    if (!profile && cleanEmail) {
      profile = await prisma.profile.findFirst({ where: { email: cleanEmail } });
    }
    if (!profile && cleanPhone) {
      profile = await prisma.profile.findFirst({ where: { phone: cleanPhone } });
    }

    if (!profile) {
      const generatedId = userId || `affiliate_${cleanPhone || Date.now()}`;
      let safePhone = cleanPhone || null;
      let safeEmail = cleanEmail || `${generatedId}@affiliate.meesho`;

      if (safePhone) {
        const phoneExists = await prisma.profile.findFirst({ where: { phone: safePhone } });
        if (phoneExists) safePhone = null;
      }
      if (safeEmail) {
        const emailExists = await prisma.profile.findFirst({ where: { email: safeEmail } });
        if (emailExists) safeEmail = `${generatedId}_${Date.now()}@affiliate.meesho`;
      }

      try {
        profile = await prisma.profile.create({
          data: {
            id: generatedId,
            fullName: fullName || 'Affiliate Creator',
            phone: safePhone,
            email: safeEmail,
            role: 'CUSTOMER'
          }
        });
      } catch (createErr) {
        profile = await prisma.profile.create({
          data: {
            id: generatedId,
            fullName: fullName || 'Affiliate Creator',
            phone: null,
            email: `${generatedId}_${Date.now()}@affiliate.meesho`,
            role: 'CUSTOMER'
          }
        });
      }
    } else {
      // Safely update profile without overriding with colliding email or phone
      const updateData = {};
      if (fullName && (!profile.fullName || profile.fullName === 'Affiliate Creator' || profile.fullName === 'MShoppy Customer')) {
        updateData.fullName = fullName;
      }
      if (cleanPhone && !profile.phone) {
        const phoneExists = await prisma.profile.findFirst({ where: { phone: cleanPhone } });
        if (!phoneExists) updateData.phone = cleanPhone;
      }
      if (cleanEmail && !profile.email) {
        const emailExists = await prisma.profile.findFirst({ where: { email: cleanEmail } });
        if (!emailExists) updateData.email = cleanEmail;
      }

      if (Object.keys(updateData).length > 0) {
        try {
          profile = await prisma.profile.update({
            where: { id: profile.id },
            data: updateData
          });
        } catch (updateErr) {
          console.warn('Profile soft update skipped in submitAffiliateKyc:', updateErr.message);
        }
      }
    }

    const docPayload = {
      ...(documents || {}),
      applicationId: applicationId || `KYC-AFF-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: fullName || profile.fullName || '',
      email: cleanEmail || profile.email || '',
      phone: cleanPhone || profile.phone || '',
      handle: handle || '',
      platform: platform || 'Direct / Social',
      followers: followers || '0',
      panNumber: (panNumber || '').toUpperCase(),
      panDocName: panDocName || '',
      aadhaarNumber: aadhaarNumber || '',
      aadhaarDocName: aadhaarDocName || '',
      bankName: bankName || '',
      accountHolderName: (accountHolderName || fullName || profile.fullName || '').toUpperCase(),
      accountNumber: accountNumber || '',
      ifscCode: (ifscCode || '').toUpperCase(),
      upiId: upiId || '',
      chequeDocName: chequeDocName || '',
      submittedAt: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Check if an existing KYC application exists for this user and type 'affiliate'
    const existing = await prisma.kYCApplication.findFirst({
      where: {
        userId: profile.id,
        type: 'affiliate'
      }
    });

    let kycApp;
    if (existing) {
      kycApp = await prisma.kYCApplication.update({
        where: { id: existing.id },
        data: {
          status: 'PENDING',
          documents: docPayload,
          adminNotes: ''
        },
        include: { user: true }
      });
    } else {
      kycApp = await prisma.kYCApplication.create({
        data: {
          userId: profile.id,
          type: 'affiliate',
          status: 'PENDING',
          documents: docPayload,
          adminNotes: ''
        },
        include: { user: true }
      });
    }

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: profile.id,
        title: 'Affiliate KYC Under Review ⏳',
        body: `Your KYC Application #${docPayload.applicationId} has been successfully submitted to Admin Desk for compliance verification.`,
        type: 'earning',
        data: {
          applicationId: docPayload.applicationId,
          kycId: kycApp.id
        }
      }
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Affiliate KYC application submitted successfully to Admin Desk!',
      application: kycApp
    });
  } catch (error) {
    console.error("Submit Affiliate KYC Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 5. GET AFFILIATE KYC STATUS FOR CREATOR DESK
 * GET /api/v1/admin-kyc/affiliate-status
 */
export const getAffiliateKycStatus = async (req, res) => {
  try {
    const { userId, email, phone, applicationId } = req.query;

    let application = null;
    const cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.toString().trim().toLowerCase() : '';

    // 1. Locate user if userId, email, or phone is provided
    let user = null;
    if (userId || cleanEmail || cleanPhone) {
      user = await prisma.profile.findFirst({
        where: {
          OR: [
            userId ? { id: userId } : undefined,
            cleanEmail ? { email: cleanEmail } : undefined,
            cleanPhone ? { phone: cleanPhone } : undefined,
            cleanPhone ? { id: `affiliate_${cleanPhone}` } : undefined
          ].filter(Boolean)
        }
      });
    }

    // 2. If user exists, find THEIR affiliate KYC
    if (user) {
      application = await prisma.kYCApplication.findFirst({
        where: {
          userId: user.id,
          type: 'affiliate'
        },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
    }

    // 3. If still not found, and applicationId is provided ALONG WITH user verification
    if (!application && applicationId && user) {
      const match = await prisma.kYCApplication.findFirst({
        where: {
          OR: [
            { id: applicationId },
            { documents: { path: ['applicationId'], equals: applicationId } }
          ],
          userId: user.id,
          type: 'affiliate'
        },
        include: { user: true }
      });
      if (match) {
        application = match;
      }
    }

    // If no KYC application exists for this verified user, return null (NEVER return other users' applications)
    return res.status(200).json({
      success: true,
      application: application || null
    });
  } catch (error) {
    console.error("Get Affiliate KYC Status Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 6. GET ALL AFFILIATE KYC APPLICATIONS FOR ADMIN
 * GET /api/v1/admin-kyc/affiliates
 */
export const getAllAffiliateKyc = async (req, res) => {
  try {
    const applications = await prisma.kYCApplication.findMany({
      where: { type: 'affiliate' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true
      }
    });

    return res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("Get All Affiliate KYC Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
