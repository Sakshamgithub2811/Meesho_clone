import admin from '../config/firebaseAdmin.js';
import prisma from '../config/prisma.js';

/**
 * 100% Pure Firebase Authentication Middleware
 * Validates Firebase ID Token from `Authorization: Bearer <token>`
 * Resolves user identity directly using Firebase UID matching `Profile.id`
 */
export const verifyFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer <Firebase_ID_Token>',
      });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Empty token provided',
      });
    }

    // Verify token strictly via Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Fetch user profile from PostgreSQL using Firebase UID as PK
    let profile = await prisma.profile.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    if (profile && profile.isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'Account Deactivated: Your account has been suspended by administrator.',
      });
    }

    if (!profile) {
      // Fallback for super admin or newly registered Firebase users
      profile = {
        id: uid,
        email: email || decodedToken.email || `${uid}@firebase.meesho`,
        fullName: decodedToken.name || 'Logistics Staff',
        role: (decodedToken.role || 'ADMIN').toUpperCase(),
        isActive: true,
      };
    }

    req.user = profile;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Auth Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid Firebase ID Token',
      details: error.message,
    });
  }
};

/**
 * Role-Based Access Control Middleware for Logistics Operations
 */
export const authorizeLogisticsRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const formattedAllowed = allowedRoles.map((r) => r.toUpperCase());

    // ADMIN has master super-user privilege
    if (userRole === 'ADMIN' || formattedAllowed.includes(userRole) || formattedAllowed.includes('ALL')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden: Access restricted. Required roles: [${allowedRoles.join(', ')}]`,
      currentRole: userRole,
    });
  };
};
