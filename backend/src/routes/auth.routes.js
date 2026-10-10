import { Router } from 'express';
import { 
  resellerLogin, 
  customerLogin, 
  affiliateLogin, 
  getCurrentUser, 
  updateResellerProfile, 
  updateCustomerProfile, 
  updateAffiliateProfile 
} from '../controllers/auth.controller.js';
import { verifyAuth, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public auth endpoints (Firebase Authentication)
router.post('/reseller-login', resellerLogin);
router.post('/customer-login', customerLogin);
router.post('/user-login', customerLogin); // Alias for user login
router.post('/affiliate-login', affiliateLogin);

// Protected endpoints (Requires valid Firebase Token)
router.get('/me', verifyAuth, getCurrentUser);
router.put('/reseller-profile', verifyAuth, authorizeRole('RESELLER', 'ADMIN'), updateResellerProfile);
router.put('/customer-profile', verifyAuth, authorizeRole('CUSTOMER', 'ADMIN'), updateCustomerProfile);
router.put('/affiliate-profile', verifyAuth, authorizeRole('AFFILIATE', 'ADMIN'), updateAffiliateProfile);

export default router;
