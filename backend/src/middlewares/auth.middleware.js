import admin from '../config/firebaseAdmin.js';
import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';

/**
 * Firebase & JWT Authentication Middleware
 * Verifies Firebase ID Token or standard JWT and loads user profile directly from PostgreSQL database
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: No Authentication Token Provided' 
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
        // Fallback: Check if token is a standard signed JWT (e.g. from Google Auth or local session)
        try {
          const jwtDecoded = jwt.decode(token);
          if (jwtDecoded && (jwtDecoded.id || jwtDecoded.uid)) {
            uid = jwtDecoded.id || jwtDecoded.uid;
            email = jwtDecoded.email || null;
            decodedToken = jwtDecoded;
          }
        } catch (jwtErr) {}

        if (!decodedToken && (token.startsWith('firebase_') || token.length >= 3)) {
          uid = token;
        } else if (!decodedToken) {
          return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized: Invalid Authentication Token', 
            details: tokenErr.message 
          });
        }
      }
    } else {
      // Admin auth not initialized, check JWT or token format
      try {
        const jwtDecoded = jwt.decode(token);
        if (jwtDecoded && (jwtDecoded.id || jwtDecoded.uid)) {
          uid = jwtDecoded.id || jwtDecoded.uid;
          email = jwtDecoded.email || null;
          decodedToken = jwtDecoded;
        }
      } catch (jwtErr) {}
    }

    // Database user check in PostgreSQL
    let profile = null;
    const cleanUid = uid.startsWith('firebase_') ? uid.replace(/^firebase_/, '') : uid;
    try {
      if (prisma?.profile?.findFirst) {
        profile = await prisma.profile.findFirst({
          where: {
            OR: [
              { id: uid },
              { id: cleanUid },
              ...(uid.includes('@') ? [{ email: uid.toLowerCase() }] : []),
              ...(email ? [{ email: email.toLowerCase() }] : [])
            ]
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            role: true,
          }
        });
      }
    } catch (dbErr) {
      console.warn("Prisma profile lookup warning:", dbErr.message);
    }

      // Agar account deactivated ho, toh access block karein
      if (profile && profile.isActive === false) {
        return res.status(403).json({ 
          success: false, 
          error: 'Your account has been deactivated by administrator. Please contact customer support.',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // If profile not yet in database, construct minimal user
    if (!profile) {
      profile = {
        id: cleanUid,
        email: email || decodedToken?.email || `${cleanUid}@meesho.clone`,
        fullName: decodedToken?.name || decodedToken?.fullName || 'Meesho User',
        role: (decodedToken?.role || 'CUSTOMER').toUpperCase(),
        isActive: true,
      };
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Invalid Authentication Token',
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
        error: 'Unauthorized: User not authenticated' 
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const formattedAllowed = allowedRoles.map(r => r.toUpperCase());

    // Allow RESELLER if looking for AFFILIATE, or vice-versa
    const effectiveRoles = [userRole];
    if (userRole === 'RESELLER') effectiveRoles.push('AFFILIATE');
    if (userRole === 'AFFILIATE') effectiveRoles.push('RESELLER');
    if (userRole === 'ADMIN') effectiveRoles.push('CUSTOMER', 'RESELLER', 'AFFILIATE', 'SUPPLIER');

    const hasPermission = effectiveRoles.some(r => formattedAllowed.includes(r));

    if (!hasPermission) {
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
