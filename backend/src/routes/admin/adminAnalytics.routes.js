import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import { getAnalyticsDashboard } from '../../controllers/admin/adminAnalytics.controller.js';

const router = Router();

// All Admin Analytics endpoints require valid token and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAnalyticsDashboard);

export default router;
