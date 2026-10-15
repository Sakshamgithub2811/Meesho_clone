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
        });
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
