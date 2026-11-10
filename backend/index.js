import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Auto-reloaded for soft-delete & Prisma client sync

// Initialize services
import './src/config/firebaseAdmin.js';
import './src/config/redisClient.js';
import './src/config/supabaseClient.js';
import './src/config/emailTransporter.js';
import prisma from './src/config/prisma.js';

// Import Routes and Middlewares
import apiRouter from './src/routes/api.routes.js';
import seoRoutes from './src/routes/seo.routes.js';
import { notFoundHandler, errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === process.env.CLIENT_URL ||
      origin === process.env.FRONTEND_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-customer-id',
    'x-affiliate-id',
    'x-reseller-id',
    'x-user-phone',
    'x-user-email',
    'x-requested-with',
    'Accept',
    'Origin'
  ],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static uploads directory for product images (supports local & Vercel /tmp)
const localUploads = path.join(__dirname, 'uploads');
const tmpUploads = path.join(os.tmpdir(), 'uploads');
if (fs.existsSync(localUploads)) {
  app.use('/uploads', express.static(localUploads));
}
app.use('/uploads', express.static(tmpUploads));

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Meesho SuperApp API Server!',
    status: 'online',
    health: '/api/health',
    version: '1.0.0',
    documentation: '/api',
  });
});

// Root documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Meesho SuperApp API!',
    status: 'online',
    version: '1.0.0',
    documentation: {
      adminAuth: '/api/v1/admin-auth',
      adminProfile: '/api/v1/admin-profile',
      supplierAuth: '/api/supplier/auth',
      supplier: '/api/supplier',
      health: '/api/health',
    },
  });
});

// Root SEO routes (sitemap.xml and robots.txt must be at root domain)
app.use('/', seoRoutes);

// Mount Main API Router (Supports both /api and /api/v1 prefix)
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server (standalone only; in Vercel serverless the exported app is invoked)
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 Backend server is running on http://localhost:${port}`);
  });
}

export default app;
