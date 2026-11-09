import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getPlatformSettings,
  updatePlatformSettings
} from '../../controllers/admin/adminSettings.controller.js';

const router = Router();

// All settings routes require authenticated ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getPlatformSettings);
router.put('/', verifyAuth, authorizeRole('ADMIN'), updatePlatformSettings);

export default router;
