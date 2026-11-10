import prisma from '../../config/prisma.js';
import { readConfig, writeConfig, getDefaultConfig } from '../flashSale.controller.js';
import { logAdminAction } from '../../utils/auditLogger.js';

/**
 * 1. GET FLASH SALE MANAGEMENT DATA FOR ADMIN
 * Returns active config, enriched featured products, and catalog candidates
 */
export const getAdminFlashSale = async (req, res) => {
  try {
    const config = readConfig();

    // Fetch featured products from PostgreSQL
    let featuredProducts = [];
    const featuredIds = Array.isArray(config.featuredProductIds) ? config.featuredProductIds : [];

    if (featuredIds.length > 0) {
      featuredProducts = await prisma.product.findMany({
        where: { id: { in: featuredIds } },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          rating: true,
          reviewsCount: true,
          categorySlug: true,
          stock: true,
          supplierName: true
        }
      });
    }

    // Recommended catalog candidates (excluding already featured products)
    const candidates = await prisma.product.findMany({
      where: {
        id: { notIn: featuredIds },
        stock: { gt: 0 }
      },
      take: 8,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        rating: true,
        reviewsCount: true,
        categorySlug: true,
        stock: true,
        supplierName: true
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        config,
        featuredProducts,
        candidates
      }
    });
  } catch (error) {
    console.error('Error fetching admin flash sale data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve flash sale settings',
      error: error.message
    });
  }
};

/**
 * 2. UPDATE FLASH SALE CONFIGURATION
 * Body: { title, subtitle, bannerBadge, dealBadge, resellerBonusNote, endTime, minDiscount, status, featuredProductIds }
 */
export const updateAdminFlashSale = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      bannerBadge,
      dealBadge,
      resellerBonusNote,
      endTime,
      minDiscount,
      status,
      featuredProductIds
    } = req.body;

    const current = readConfig();

    const updated = {
      ...current,
      ...(title !== undefined && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
      ...(bannerBadge !== undefined && { bannerBadge: bannerBadge.trim() }),
      ...(dealBadge !== undefined && { dealBadge: dealBadge.trim() }),
      ...(resellerBonusNote !== undefined && { resellerBonusNote: resellerBonusNote.trim() }),
      ...(endTime && { endTime: new Date(endTime).toISOString() }),
      ...(minDiscount !== undefined && { minDiscount: Number(minDiscount) }),
      ...(status && { status }),
      ...(Array.isArray(featuredProductIds) && { featuredProductIds }),
      updatedAt: new Date().toISOString()
    };

    writeConfig(updated);

    // Fetch updated featured products
    let featuredProducts = [];
    if (updated.featuredProductIds?.length > 0) {
      featuredProducts = await prisma.product.findMany({
        where: { id: { in: updated.featuredProductIds } },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          rating: true,
          reviewsCount: true,
          categorySlug: true,
          stock: true,
          supplierName: true
        }
      });
    }

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'FLASH_SALE_CONFIG_UPDATED',
      targetType: 'MARKETING',
      targetId: 'FLASH_SALE',
      details: `Updated Flash Sale settings (Status: ${updated.status}, Min Discount: ${updated.minDiscount}%, Featured: ${updated.featuredProductIds?.length || 0} products)`
    });

    return res.status(200).json({
      success: true,
      message: 'Flash Sale configuration saved and live on storefront',
      data: {
        config: updated,
        featuredProducts
      }
    });
  } catch (error) {
    console.error('Error updating flash sale configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update flash sale settings',
      error: error.message
    });
  }
};

/**
 * 3. QUICK EXTEND FLASH SALE TIMER
 * Body: { hours: number }
 */
export const quickExtendTimer = async (req, res) => {
  try {
    const { hours } = req.body;
    const addHours = Number(hours) || 2;

    const current = readConfig();
    const currentEnd = new Date(current.endTime).getTime();
    const now = Date.now();

    // If current timer is already expired, extend from now; else extend from currentEnd
    const baseTime = currentEnd > now ? currentEnd : now;
    const newEnd = new Date(baseTime + addHours * 60 * 60 * 1000);

    const updated = {
      ...current,
      endTime: newEnd.toISOString(),
      status: 'ACTIVE',
      updatedAt: new Date().toISOString()
    };

    writeConfig(updated);

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'FLASH_SALE_TIMER_EXTENDED',
      targetType: 'MARKETING',
      targetId: 'FLASH_SALE',
      details: `Quick extended Flash Sale campaign by ${addHours} hours until ${new Date(newEnd).toLocaleString('en-IN')}`
    });

    return res.status(200).json({
      success: true,
      message: `Flash Sale successfully extended by ${addHours} hours!`,
      data: updated
    });
  } catch (error) {
    console.error('Error extending flash sale timer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to extend flash sale timer',
      error: error.message
    });
  }
};

/**
 * 4. SEARCH PRODUCTS TO ADD TO DEAL
 * Query: ?q=kurti
 */
export const searchDealProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const query = q.trim();
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { supplierName: { contains: query, mode: 'insensitive' } },
          { categorySlug: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 12,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        rating: true,
        reviewsCount: true,
        categorySlug: true,
        stock: true,
        supplierName: true
      }
    });

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error searching deal products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search products for flash sale',
      error: error.message
    });
  }
};
