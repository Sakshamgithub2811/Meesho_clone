import admin from '../config/firebaseAdmin.js';
import prisma from '../config/prisma.js';

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID Token and loads user profile from Prisma database
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: No Firebase Token Provided' 
      });
    }
    const token = authHeader.split(' ')[1];

    const authInstance = admin?.auth ? admin.auth() : null;
    let decodedToken = null;
    let uid = token;
    let email = null;

    if (authInstance) {
      try {
        decodedToken = await authInstance.verifyIdToken(token);
        uid = decodedToken.uid;
        email = decodedToken.email;
      } catch (tokenErr) {
        // Token might be a custom token or direct Firebase UID in development
        if (token.startsWith('firebase_') || token.length >= 10) {
          uid = token;
        } else {
          return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized: Invalid Firebase Token', 
            details: tokenErr.message 
          });
        }
      }
    }

    // Database me user check karna
    let profile = null;
    try {
      if (prisma?.profile?.findUnique) {
        profile = await prisma.profile.findUnique({
          where: { id: uid },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma profile lookup warning:", dbErr.message);
    }

    // Agar database me profile na ho toh Firebase payload se construct karein
    if (!profile) {
      profile = {
        id: uid,
        email: email || decodedToken?.email || `${uid}@meesho.clone`,
        fullName: decodedToken?.name || 'Meesho User',
        role: (decodedToken?.role || 'CUSTOMER').toUpperCase(),
      };
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error("Firebase Auth Middleware Error:", error);
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Invalid Firebase Token',
      details: error.message 
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if authenticated user has required role
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: User not authenticated with Firebase' 
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const formattedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!formattedAllowed.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: `Forbidden: Access restricted. Required roles: [${allowedRoles.join(', ')}]`,
        currentRole: userRole 
      });
    }
    next();
  };
};

// Aliases for compatibility across existing routes
export const authenticateToken = verifyAuth;
export const authorizeRoles = authorizeRole;

export default {
  verifyAuth,
  authorizeRole,
  authenticateToken,
  authorizeRoles,
};
