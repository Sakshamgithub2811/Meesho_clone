import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Initialize services
import './src/config/firebaseAdmin.js';
import './src/config/redisClient.js';
import './src/config/supabaseClient.js';
import './src/config/emailTransporter.js';
import prisma from './src/config/prisma.js';

// Import Routes and Middlewares
import apiRouter from './src/routes/index.js';
import { notFoundHandler, errorHandler } from './src/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static uploads directory for product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Mount Main API Router (Supports both /api and /api/v1 prefix)
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
  console.log(`🛡️ Admin auth endpoints available at http://localhost:${port}/api/v1/admin-auth`);
  console.log(`👤 Admin profile endpoints available at http://localhost:${port}/api/v1/admin-profile`);
});

export default app;
