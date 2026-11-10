import prisma from '../../config/prisma.js';

/**
 * 1. PUBLIC: Customer App Homepage Banners (Only active, sorted by displayOrder)
 */
export const getActiveBanners = async (req, res) => {
  try {
    const liveBanners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      count: liveBanners.length,
      data: liveBanners,
    });
  } catch (error) {
    console.error('Error fetching active banners from DB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message,
    });
  }
};

/**
 * 2. ADMIN: Get All Banners with Live DB Analytics
 */
export const getAllAdminBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const totalBanners = banners.length;
    const activeCount = banners.filter((b) => b.isActive).length;
    const inactiveCount = totalBanners - activeCount;
    const totalClicks = banners.reduce(
      (sum, b) => sum + (b.clicksCount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      count: totalBanners,
      banners,
      data: banners,
      stats: {
        totalBanners,
        activeBanners: activeCount,
        inactiveBanners: inactiveCount,
        totalClicks,
      },
    });
  } catch (error) {
    console.error('Error fetching admin banners from DB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin banners',
      error: error.message,
    });
  }
};

/**
 * 3. ADMIN: Create New Banner in Database
 */
export const createAdminBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      imageUrl,
      targetUrl,
      badgeText,
      displayOrder = 1,
      isActive = true,
    } = req.body;

    if (!title?.trim() || !imageUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and Image URL are required',
      });
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || '',
        imageUrl: imageUrl.trim(),
        targetUrl: targetUrl?.trim() || '/',
        badgeText: badgeText?.trim() || 'MEGA SALE',
        displayOrder: parseInt(displayOrder, 10) || 1,
        isActive: Boolean(isActive),
      },
    });

    return res.status(201).json({
      success: true,
      message: `Banner "${banner.title}" saved to database`,
      banner,
    });
  } catch (error) {
    console.error('Error creating banner in DB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message,
    });
  }
};

/**
 * 4. ADMIN: Update Banner in Database
 */
export const updateAdminBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const {
      title,
      subtitle,
      imageUrl,
      targetUrl,
      badgeText,
      displayOrder,
      isActive,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl.trim();
    if (badgeText !== undefined) updateData.badgeText = badgeText.trim();
    if (displayOrder !== undefined)
      updateData.displayOrder = parseInt(displayOrder, 10) || 1;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: `Banner "${banner.title}" updated in database`,
      banner,
    });
  } catch (error) {
    console.error('Error updating banner in DB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message,
    });
  }
};

/**
 * 5. ADMIN: Quick Toggle Active Status in Database
 */
export const toggleAdminBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.banner.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Banner is now ${banner.isActive ? 'Active on Homepage' : 'Hidden'}`,
      isActive: banner.isActive,
      banner,
    });
  } catch (error) {
    console.error('Error toggling banner in DB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle status',
      error: error.message,
    });
  }
};

/**
 * 6. ADMIN: Delete Banner from Database
 */
export const deleteAdminBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.banner.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await prisma.banner.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `Banner "${existing.title}" permanently deleted from database`,
    });
  } catch (error) {
    console.error('Error deleting banner from DB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message,
    });
  }
};
