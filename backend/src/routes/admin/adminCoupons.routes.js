import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  toggleAdminCoupon,
  deleteAdminCoupon,
} from '../../controllers/admin/adminCoupons.controller.js';

const router = Router();

// All admin coupon endpoints require authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllAdminCoupons);
router.post('/', verifyAuth, authorizeRole('ADMIN'), createAdminCoupon);
router.put('/:id', verifyAuth, authorizeRole('ADMIN'), updateAdminCoupon);
router.patch('/:id/toggle', verifyAuth, authorizeRole('ADMIN'), toggleAdminCoupon);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteAdminCoupon);

export default router;
