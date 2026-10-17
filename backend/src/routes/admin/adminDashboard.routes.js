import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import { getDashboardStats } from '../../controllers/admin/adminDashboard.controller.js';

const router = Router();

// Only ADMIN role can access Dashboard Analytics
router.get('/stats', verifyAuth, authorizeRole('ADMIN'), getDashboardStats);

export default router;
