import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { Router } from 'express';
import healthRoutes from './src/routes/health.routes.js';
import adminAuthRoutes from './src/routes/admin/adminAuth.routes.js';
import userAuthRoutes from './src/routes/user/userAuth.routes.js';
import affiliateAuthRoutes from './src/routes/affiliate/affiliateAuth.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import dropshipperRoutes from './src/routes/dropshipper/dropshipper.routes.js';
import productRoutes from './src/routes/product.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import addressRoutes from './src/routes/address.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import couponRoutes from './src/routes/coupon.routes.js';

const apiRouter = Router();

// Initialize services
import './src/config/firebaseAdmin.js';
import './src/config/redisClient.js';
import './src/config/supabaseClient.js';
import './src/config/emailTransporter.js';
import prisma from './src/config/prisma.js';

apiRouter.use('/', healthRoutes);
apiRouter.use('/admin-auth', adminAuthRoutes);
apiRouter.use('/user-auth', userAuthRoutes);
apiRouter.use('/affiliate-auth', affiliateAuthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dropshipper', dropshipperRoutes);

// Real Ecommerce Core Routes
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/coupons', couponRoutes);


import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Meesho API!' });
});

app.use('/api/v1', apiRouter);

// Centralized Error Handler (guarantees JSON responses, avoids HTML error pages)
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
});

export default apiRouter;
