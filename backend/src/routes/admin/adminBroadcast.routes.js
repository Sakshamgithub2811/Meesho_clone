import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  sendBroadcast,
  getBroadcastHistory,
  getAudienceCounts
} from '../../controllers/admin/adminBroadcast.controller.js';

const router = Router();

// All broadcast operations require ADMIN authorization
router.post('/', verifyAuth, authorizeRole('ADMIN'), sendBroadcast);
router.get('/history', verifyAuth, authorizeRole('ADMIN'), getBroadcastHistory);
router.get('/audience-counts', verifyAuth, authorizeRole('ADMIN'), getAudienceCounts);

export default router;

