import admin from '../config/firebaseAdmin.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No Token Provided' });
    }
    const token = authHeader.split(' ')[1];
    
    // Firebase se token verify karna
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Database me user check karna
    const profile = await prisma.profile.findUnique({
      where: { id: decodedToken.uid }
    });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    // Sab theek hai toh user ka data request me daal do
    req.user = profile; 
    next(); 
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user hume upar wale 'verifyAuth' function se mila
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: You need one of these roles: ${allowedRoles.join(', ')}` 
      });
    }
    next(); // Agar role match ho gaya, toh aage jane do
  };
};
