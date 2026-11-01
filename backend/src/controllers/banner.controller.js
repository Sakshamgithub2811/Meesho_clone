// backend/src/controllers/banner.controller.js

// Dynamic banners collection (can also be persisted to DB or updated via admin)
let promotionalBanners = [
  {
    id: 'banner_flash',
    badge: '⚡ Lightning Flash Sale',
    badgeStatus: 'Live Now',
    title: 'Mega Flash Deals! Up to 75% Off',
    subtitle: 'Limited-time lightning drops with verified factory pricing & Free Delivery on all orders.',
    buttonText: 'View Flash Deals',
    targetUrl: '/flash',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    accentColor: 'text-rose-600',
    isActive: true,
    order: 1
  },
  {
    id: 'banner_festive',
    badge: 'Special Festive Deals 🛍️',
    badgeStatus: 'Special Offer',
    title: 'Grand Festive Sale! Up to 70% Off',
    subtitle: '100% verified factory direct prices with Free Delivery & Easy 7-day returns.',
    buttonText: 'Explore Catalog',
    targetUrl: '/explorer',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-pink-600 via-rose-600 to-red-600',
    accentColor: 'text-pink-600',
    isActive: true,
    order: 2
  },
  {
    id: 'banner_men',
    badge: 'Lowest Price Guarantee',
    badgeStatus: 'Best Value',
    title: 'Trending Menswear & Gadgets',
    subtitle: 'Casual shirts, sneakers, audio gear & everyday essentials directly at wholesale rates.',
    buttonText: 'Shop Men',
    targetCategory: 'Men',
    targetUrl: '/user-home?category=Men',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-indigo-700 via-blue-600 to-cyan-600',
    accentColor: 'text-indigo-700',
    isActive: true,
    order: 3
  }
];

export const getBanners = async (req, res) => {
  try {
    const activeOnly = req.query.all !== 'true';
    const banners = promotionalBanners
      .filter((b) => (activeOnly ? b.isActive : true))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message
    });
  }
};

export const updateBanners = async (req, res) => {
  try {
    const { banners } = req.body;
    if (Array.isArray(banners)) {
      promotionalBanners = banners;
      return res.status(200).json({
        success: true,
        message: 'Banners updated successfully',
        data: promotionalBanners
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid banners payload. Expected an array.'
    });
  } catch (error) {
    console.error('Error updating banners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banners',
      error: error.message
    });
  }
};

