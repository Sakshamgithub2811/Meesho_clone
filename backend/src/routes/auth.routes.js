import { Router } from 'express';
import { 
  resellerLogin, 
  customerLogin, 
  affiliateLogin, 
  googleAuth,
  getCurrentUser, 
  getAffiliateStats,
  getPayoutSettings,
  updatePayoutSettings,
  updateResellerProfile, 
  updateCustomerProfile, 
  updateAffiliateProfile 
} from '../controllers/auth.controller.js';
import { verifyAuth, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public auth endpoints (Firebase Authentication & Google)
router.post('/reseller-login', resellerLogin);
router.post('/customer-login', customerLogin);
router.post('/user-login', customerLogin); // Alias for user login
router.post('/affiliate-login', affiliateLogin);
router.post('/google', googleAuth);

// Live Database Stats (Supports token or query/header)
router.get('/affiliate-stats', (req, res, next) => {
  // If authorization header present, verify it; otherwise proceed to controller
  if (req.headers.authorization) {
    return verifyAuth(req, res, next);
  }
  next();
}, getAffiliateStats);

// Payout & Bank Details (100% Database Driven)
router.get('/payout-settings', (req, res, next) => {
  if (req.headers.authorization) return verifyAuth(req, res, next);
  next();
}, getPayoutSettings);
router.put('/payout-settings', (req, res, next) => {
  if (req.headers.authorization) return verifyAuth(req, res, next);
  next();
}, updatePayoutSettings);

// Protected endpoints (Requires valid Firebase/JWT Token)
router.get('/me', verifyAuth, getCurrentUser);
router.put('/reseller-profile', verifyAuth, authorizeRole('RESELLER', 'ADMIN'), updateResellerProfile);
router.put('/customer-profile', verifyAuth, authorizeRole('CUSTOMER', 'ADMIN'), updateCustomerProfile);
router.put('/affiliate-profile', verifyAuth, authorizeRole('AFFILIATE', 'RESELLER', 'ADMIN'), updateAffiliateProfile);

export default router;
