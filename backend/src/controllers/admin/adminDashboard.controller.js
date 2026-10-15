import prisma from '../../config/prisma.js';

/**
 * Controller to fetch real-time overview analytics for Admin Dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      roleCounts,
      totalProducts,
      totalCategories,
      salesAgg,
      pendingKyc,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.kYCApplication.count({
        where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          totalAmount: true,
          orderStatus: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }),
      prisma.profile.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true
        }
      })
    ]);

    const rolesMap = roleCounts.reduce((acc, curr) => {
      acc[curr.role] = curr._count.id;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        totalSales: salesAgg._sum.totalAmount || 0,
        totalOrders: salesAgg._count.id || 0,
        totalUsers,
        roles: rolesMap,
        totalProducts,
        totalCategories,
        pendingKyc,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
