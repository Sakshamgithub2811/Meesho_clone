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
import authRoutes from './auth.routes.js';
import affiliateAuthRoutes from './affiliate/affiliateAuth.routes.js';
import userAuthRoutes from './user/userAuth.routes.js';
import dropshipperRoutes from './dropshipper/dropshipper.routes.js';

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

// Supplier Module endpoints
apiRouter.use('/supplier/auth', supplierAuthRoutes);
apiRouter.use('/auth/supplier', supplierAuthRoutes);
apiRouter.use('/supplier', supplierRoutes);

// Common Auth module (Reseller, Customer, etc.)
apiRouter.use('/auth', authRoutes);

// Dropshipper Module endpoints
apiRouter.use('/dropshipper', dropshipperRoutes);

// Dedicated affiliate and user auth routes
apiRouter.use('/affiliate/auth', affiliateAuthRoutes);
apiRouter.use('/auth/affiliate', affiliateAuthRoutes);
apiRouter.use('/affiliate-auth', affiliateAuthRoutes);
apiRouter.use('/user/auth', userAuthRoutes);
apiRouter.use('/auth/user', userAuthRoutes);
apiRouter.use('/user-auth', userAuthRoutes);

export default apiRouter;
