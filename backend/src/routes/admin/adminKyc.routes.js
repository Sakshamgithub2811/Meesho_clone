import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import { 
  getAllKycApplications, 
  updateKycStatus, 
  getKycDetails 
} from '../../controllers/admin/adminKyc.controller.js';

const router = Router();

// All KYC admin endpoints are protected: require valid token and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllKycApplications);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getKycDetails);
router.put('/:id/status', verifyAuth, authorizeRole('ADMIN'), updateKycStatus);

export default router;
