import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Initialize services
import './src/config/firebaseAdmin.js';
import './src/config/redisClient.js';
import './src/config/supabaseClient.js';
import './src/config/emailTransporter.js';
import prisma from './src/config/prisma.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Meesho API!' });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
});
