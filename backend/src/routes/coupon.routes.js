// backend/src/routes/coupon.routes.js
import { Router } from 'express';
import { getActiveCoupons, validateCoupon, generateNewCoupon } from '../controllers/coupon.controller.js';

const router = Router();

// GET /api/v1/coupons - List all active valid coupons
router.get('/', getActiveCoupons);

// POST /api/v1/coupons/validate - Validate a coupon code strictly
router.post('/validate', validateCoupon);

// POST /api/v1/coupons/generate - Generate a real new coupon code
router.post('/generate', generateNewCoupon);

export default router;
