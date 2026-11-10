import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import { 
  getAllKycApplications, 
  updateKycStatus, 
  getKycDetails,
  submitAffiliateKyc,
  getAffiliateKycStatus,
  getAllAffiliateKyc
} from '../../controllers/admin/adminKyc.controller.js';

const router = Router();

// Public / Creator Desk routes for Affiliate KYC
router.post('/submit-affiliate', submitAffiliateKyc);
router.get('/affiliate-status', getAffiliateKycStatus);
router.get('/affiliates', getAllAffiliateKyc);

// Admin KYC management endpoints
router.get('/', getAllKycApplications);
router.get('/:id', getKycDetails);
router.put('/:id/status', updateKycStatus);

export default router;
