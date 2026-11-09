import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAdminFlashSale,
  updateAdminFlashSale,
  quickExtendTimer,
  searchDealProducts
} from '../../controllers/admin/adminFlashSale.controller.js';

const router = Router();

// All flash sale management endpoints require ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAdminFlashSale);
router.put('/', verifyAuth, authorizeRole('ADMIN'), updateAdminFlashSale);
router.post('/extend', verifyAuth, authorizeRole('ADMIN'), quickExtendTimer);
router.get('/search-products', verifyAuth, authorizeRole('ADMIN'), searchDealProducts);

export default router;
