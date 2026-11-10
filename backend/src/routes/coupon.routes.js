// backend/src/routes/coupon.routes.js
import { Router } from 'express';
import {
  getActiveCoupons,
  validateCoupon,
  adminGetAllCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminToggleCouponStatus,
  adminDeleteCoupon
} from '../controllers/coupon.controller.js';

const router = Router();

// -------------------------------------------------------------
// Customer / Public Routes (Checkout & Validation)
// -------------------------------------------------------------

// GET /api/v1/coupons - List all active valid coupons for customer
router.get('/', getActiveCoupons);

// POST /api/v1/coupons/validate - Validate a coupon code strictly
router.post('/validate', validateCoupon);


// -------------------------------------------------------------
// Admin Coupon Management Routes (Full CRUD)
// -------------------------------------------------------------

// GET /api/v1/coupons/admin/all - Get all coupons with filters & stats
router.get('/admin/all', adminGetAllCoupons);

// POST /api/v1/coupons/admin/create - Create new coupon
router.post('/admin/create', adminCreateCoupon);

// PUT /api/v1/coupons/admin/:id - Update existing coupon
router.put('/admin/:id', adminUpdateCoupon);

// PATCH /api/v1/coupons/admin/:id/toggle - Toggle active/disabled
router.patch('/admin/:id/toggle', adminToggleCouponStatus);

// DELETE /api/v1/coupons/admin/:id - Permanently delete coupon
router.delete('/admin/:id', adminDeleteCoupon);

export default router;
