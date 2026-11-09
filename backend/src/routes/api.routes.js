import { Router } from 'express';
import healthRoutes from './health.routes.js';
import supplierRoutes from './supplier.routes.js';
import supplierAuthRoutes from './supplierAuth.routes.js';
import adminAuthRoutes from './admin/adminAuth.routes.js';
import adminProfileRoutes from './admin/adminProfile.routes.js';
import adminUsersRoutes from './admin/adminUsers.routes.js';
import adminDashboardRoutes from './admin/adminDashboard.routes.js';
import adminKycRoutes from './admin/adminKyc.routes.js';
import adminOrdersRoutes from './admin/adminOrders.routes.js';
import adminReturnsRoutes from './admin/adminReturns.routes.js';
import adminProductsRoutes from './admin/adminProducts.routes.js';
import adminSellersRoutes from './admin/adminSellers.routes.js';
import adminFinanceRoutes from './admin/adminFinance.routes.js';
import adminAnalyticsRoutes from './admin/adminAnalytics.routes.js';
import adminSupportRoutes from './admin/adminSupport.routes.js';
import adminCategoriesRoutes from './admin/adminCategories.routes.js';
import adminCouponsRoutes from './admin/adminCoupons.routes.js';
import adminBannersRoutes from './admin/adminBanners.routes.js';
import adminCmsRoutes from './admin/adminCms.routes.js';
import adminReviewsRoutes from './admin/adminReviews.routes.js';
import adminFlashSaleRoutes from './admin/adminFlashSale.routes.js';
import adminSettingsRoutes from './admin/adminSettings.routes.js';
import { getPublicSettings } from '../controllers/admin/adminSettings.controller.js';
import authRoutes from './auth.routes.js';
import affiliateAuthRoutes from './affiliate/affiliateAuth.routes.js';
import userAuthRoutes from './user/userAuth.routes.js';
import dropshipperRoutes from './dropshipper/dropshipper.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import addressRoutes from './address.routes.js';
import reviewRoutes from './review.routes.js';
import couponRoutes from './coupon.routes.js';
import flashSaleRoutes from './flashSale.routes.js';
import returnRoutes from './return.routes.js';
import paymentRoutes from './payment.routes.js';
import walletRoutes from './wallet.routes.js';
import bannerRoutes from './banner.routes.js';
import uploadRoutes from './upload.routes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.use('/', healthRoutes);

// Admin Module endpoints
apiRouter.use('/admin-auth', adminAuthRoutes);
apiRouter.use('/admin-profile', adminProfileRoutes);
apiRouter.use('/admin-users', adminUsersRoutes);
apiRouter.use('/admin-dashboard', adminDashboardRoutes);
apiRouter.use('/admin-kyc', adminKycRoutes);
apiRouter.use('/admin-orders', adminOrdersRoutes);
apiRouter.use('/admin-returns', adminReturnsRoutes);
apiRouter.use('/admin-products', adminProductsRoutes);
apiRouter.use('/admin-sellers', adminSellersRoutes);
apiRouter.use('/admin-finance', adminFinanceRoutes);
apiRouter.use('/admin-analytics', adminAnalyticsRoutes);
apiRouter.use('/admin-support', adminSupportRoutes);
apiRouter.use('/admin-categories', adminCategoriesRoutes);
apiRouter.use('/admin-coupons', adminCouponsRoutes);
apiRouter.use('/admin-banners', adminBannersRoutes);
apiRouter.use('/banners', adminBannersRoutes);
apiRouter.use('/admin-cms', adminCmsRoutes);
apiRouter.use('/admin-reviews', adminReviewsRoutes);
apiRouter.use('/admin-flash-sale', adminFlashSaleRoutes);
apiRouter.use('/admin-settings', adminSettingsRoutes);
apiRouter.get('/settings/public', getPublicSettings);

// Supplier Module endpoints
apiRouter.use('/supplier/auth', supplierAuthRoutes);
apiRouter.use('/auth/supplier', supplierAuthRoutes);
apiRouter.use('/supplier', supplierRoutes);

// Common Auth module (Reseller, Customer, etc.)
apiRouter.use('/auth', authRoutes);

// Dedicated affiliate and user auth routes
apiRouter.use('/affiliate/auth', affiliateAuthRoutes);
apiRouter.use('/auth/affiliate', affiliateAuthRoutes);
apiRouter.use('/affiliate-auth', affiliateAuthRoutes);
apiRouter.use('/user/auth', userAuthRoutes);
apiRouter.use('/auth/user', userAuthRoutes);
apiRouter.use('/user-auth', userAuthRoutes);

// Dropshipper Module endpoints
apiRouter.use('/dropshipper', dropshipperRoutes);

// Real Ecommerce Core Routes (Customer / Reseller shopping)
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/flash-sale', flashSaleRoutes);
apiRouter.use('/returns', returnRoutes);
apiRouter.use('/payment', paymentRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/wallets', walletRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/upload', uploadRoutes);

export default apiRouter;
