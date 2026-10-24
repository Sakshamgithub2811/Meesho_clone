import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Auto-reloaded for avatar route

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

// Dynamic CORS to support localhost on any port (5173, 5174, etc.)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
