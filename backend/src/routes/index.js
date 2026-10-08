import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.use('/', healthRoutes);

// Auth module (Reseller, Customer, etc.)
apiRouter.use('/auth', authRoutes);
// apiRouter.use('/products', productRoutes);
// apiRouter.use('/orders', orderRoutes);
// apiRouter.use('/kyc', kycRoutes);
// apiRouter.use('/returns', returnRoutes);

export default apiRouter;
