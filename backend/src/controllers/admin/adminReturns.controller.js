import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL RETURN REQUESTS FOR ADMIN (With Filters, Search & Summary KPIs)
 * Supports query params: ?status=requested&search=rahul
 */
export const getAllReturnRequests = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};

    // 1. Status Filter (requested | approved | picked_up | refunded | rejected)
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status.toLowerCase();
    }

    // 2. Search Filter (by Order ID, Return ID, Customer name, email, or Reason)
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { orderId: { contains: q, mode: 'insensitive' } },
        { reason: { contains: q, mode: 'insensitive' } },
        {
          order: {
            user: {
              OR: [
                { fullName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } }
              ]
            }
          }
        }
      ];
    }

    // Parallel fetching of return requests and KPI stats
    const [
      returnRequests,
      totalCount,
      requestedCount,
      approvedCount,
      pickedUpCount,
      refundedCount,
      rejectedCount
    ] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              totalAmount: true,
              paymentMethod: true,
              paymentStatus: true,
              orderStatus: true,
              shippingAddress: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatarUrl: true
                }
              },
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      images: true,
                      price: true,
                      supplierName: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.returnRequest.count(),
      prisma.returnRequest.count({ where: { status: 'requested' } }),
      prisma.returnRequest.count({ where: { status: 'approved' } }),
      prisma.returnRequest.count({ where: { status: 'picked_up' } }),
      prisma.returnRequest.count({ where: { status: 'refunded' } }),
      prisma.returnRequest.count({ where: { status: 'rejected' } })
    ]);

    const stats = {
      totalReturns: totalCount,
      pendingApproval: requestedCount,
      approvedForPickup: approvedCount,
      pickedUp: pickedUpCount,
      refunded: refundedCount,
      rejected: rejectedCount
    };

    return res.status(200).json({
      success: true,
      count: returnRequests.length,
      stats,
      returnRequests
    });
  } catch (error) {
    console.error('Error fetching return requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch return requests',
      error: error.message
    });
  }
};

/**
 * 2. GET SINGLE RETURN REQUEST DETAILS
 */
export const getReturnRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    return res.status(200).json({
      success: true,
      returnRequest
    });
  } catch (error) {
    console.error('Error fetching return details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch return request details',
      error: error.message
    });
  }
};

/**
 * 3. UPDATE RETURN STATUS (Approve, Picked Up, Refund, Reject)
 */
export const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['requested', 'approved', 'picked_up', 'refunded', 'rejected'];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const lowerStatus = status.toLowerCase();

    // 1. Update ReturnRequest record
    const updatedReturn = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: lowerStatus
      },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: { product: true }
            }
          }
        }
      }
    });

    // 2. Synchronize Order status based on return state
    if (updatedReturn.orderId) {
      if (lowerStatus === 'refunded') {
        await prisma.order.update({
          where: { id: updatedReturn.orderId },
          data: {
            orderStatus: 'REFUNDED',
            paymentStatus: 'REFUNDED'
          }
        });
      } else if (lowerStatus === 'approved' || lowerStatus === 'picked_up') {
        await prisma.order.update({
          where: { id: updatedReturn.orderId },
          data: {
            orderStatus: lowerStatus === 'picked_up' ? 'RETURNED' : 'RETURN_REQUESTED'
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Return request marked as ${lowerStatus}`,
      returnRequest: updatedReturn
    });
  } catch (error) {
    console.error('Error updating return status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update return request',
      error: error.message
    });
  }
};
