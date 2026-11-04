import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getActiveBanners,
  getAllAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  toggleAdminBanner,
  deleteAdminBanner,
} from '../../controllers/admin/adminBanners.controller.js';

const router = Router();

// Public endpoint for customer app carousel
router.get('/active', getActiveBanners);

// Protected admin endpoints
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllAdminBanners);
router.post('/', verifyAuth, authorizeRole('ADMIN'), createAdminBanner);
router.put('/:id', verifyAuth, authorizeRole('ADMIN'), updateAdminBanner);
router.patch('/:id/toggle', verifyAuth, authorizeRole('ADMIN'), toggleAdminBanner);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteAdminBanner);

export default router;
