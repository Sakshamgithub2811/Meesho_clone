import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL SELLERS / SUPPLIERS FOR ADMIN
 * Query Params: ?tier=Platinum&search=Surat
 */
export const getAllSellers = async (req, res) => {
  try {
    const { tier, search } = req.query;

    const where = {
      role: 'SUPPLIER'
    };

    // Tier Filter
    if (tier && tier.toUpperCase() !== 'ALL') {
      where.tier = { equals: tier, mode: 'insensitive' };
    }

    // Search Filter
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { storeName: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { gstin: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Fetch suppliers & KPI counts in parallel
    const [
      sellers,
      totalCount,
      platinumCount,
      goldCount,
      silverCount,
      totalCatalogProducts
    ] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          fullName: true,
          storeName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          tier: true,
          tierLabel: true,
          rating: true,
          followers: true,
          experienceYears: true,
          gstin: true,
          pan: true,
          bankDetails: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.profile.count({ where: { role: 'SUPPLIER' } }),
      prisma.profile.count({ where: { role: 'SUPPLIER', tier: { equals: 'Platinum', mode: 'insensitive' } } }),
      prisma.profile.count({ where: { role: 'SUPPLIER', tier: { equals: 'Gold', mode: 'insensitive' } } }),
      prisma.profile.count({ where: { role: 'SUPPLIER', tier: { equals: 'Silver', mode: 'insensitive' } } }),
      prisma.product.count()
    ]);

    // Attach product count to each seller
    const sellersWithCounts = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await prisma.product.count({
          where: {
            OR: [
              { supplierId: seller.id },
              { supplierName: { equals: seller.storeName || seller.fullName, mode: 'insensitive' } }
            ]
          }
        });
        return {
          ...seller,
          productCount
        };
      })
    );

    const stats = {
      totalSellers: totalCount,
      platinumSellers: platinumCount,
      goldSellers: goldCount,
      silverSellers: silverCount,
      totalProducts: totalCatalogProducts
    };

    return res.status(200).json({
      success: true,
      count: sellersWithCounts.length,
      stats,
      sellers: sellersWithCounts
    });
  } catch (error) {
    console.error('Error fetching admin sellers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sellers list',
      error: error.message
    });
  }
};

/**
 * 2. GET SINGLE SELLER DETAILS WITH RECENT PRODUCTS
 */
export const getSellerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await prisma.profile.findFirst({
      where: {
        id,
        role: 'SUPPLIER'
      }
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Fetch products belonging to this seller
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { supplierId: seller.id },
          { supplierName: { equals: seller.storeName || seller.fullName, mode: 'insensitive' } }
        ]
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { name: true, slug: true }
        },
        _count: {
          select: { orderItems: true, reviews: true }
        }
      }
    });

    const totalProducts = await prisma.product.count({
      where: {
        OR: [
          { supplierId: seller.id },
          { supplierName: { equals: seller.storeName || seller.fullName, mode: 'insensitive' } }
        ]
      }
    });

    return res.status(200).json({
      success: true,
      seller: {
        ...seller,
        totalProducts,
        recentProducts: products
      }
    });
  } catch (error) {
    console.error('Error fetching seller details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller details',
      error: error.message
    });
  }
};

/**
 * 3. UPDATE SELLER TIER
 */
export const updateSellerTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    const validTiers = ['Silver', 'Gold', 'Platinum'];
    const formattedTier = tier ? tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase() : null;

    if (!validTiers.includes(formattedTier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier. Allowed values: Silver, Gold, Platinum'
      });
    }

    const updatedSeller = await prisma.profile.update({
      where: { id },
      data: {
        tier: formattedTier,
        tierLabel: `${formattedTier} Verified Supplier`
      }
    });

    return res.status(200).json({
      success: true,
      message: `Seller upgraded to ${formattedTier} Tier`,
      seller: updatedSeller
    });
  } catch (error) {
    console.error('Error updating seller tier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update seller tier',
      error: error.message
    });
  }
};
