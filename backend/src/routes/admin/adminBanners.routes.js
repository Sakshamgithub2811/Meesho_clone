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

// Public endpoint for customer app carousel (Active banners from DB)
router.get('/active', getActiveBanners);

// Smart root GET: If Admin Auth is present, returns all banners for Admin panel; otherwise returns active DB banners publicly
router.get('/', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return verifyAuth(req, res, () => {
      authorizeRole('ADMIN')(req, res, () => getAllAdminBanners(req, res, next));
    });
  }
  return getActiveBanners(req, res, next);
});

// Protected admin endpoints
router.post('/', verifyAuth, authorizeRole('ADMIN'), createAdminBanner);
router.put('/:id', verifyAuth, authorizeRole('ADMIN'), updateAdminBanner);
router.patch('/:id/toggle', verifyAuth, authorizeRole('ADMIN'), toggleAdminBanner);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteAdminBanner);

export default router;
