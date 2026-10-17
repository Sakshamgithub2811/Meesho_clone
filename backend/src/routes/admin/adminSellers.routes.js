import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllSellers,
  getSellerDetails,
  updateSellerTier
} from '../../controllers/admin/adminSellers.controller.js';

const router = Router();

// All Admin Seller endpoints require valid token and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllSellers);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getSellerDetails);
router.patch('/:id/tier', verifyAuth, authorizeRole('ADMIN'), updateSellerTier);

export default router;
