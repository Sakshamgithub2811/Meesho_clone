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

export default apiRouter;
