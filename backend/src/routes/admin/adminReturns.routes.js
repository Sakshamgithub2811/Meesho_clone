import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllReturnRequests,
  getReturnRequestDetails,
  updateReturnStatus
} from '../../controllers/admin/adminReturns.controller.js';

const router = Router();

// All Returns & Refunds admin endpoints require valid token and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllReturnRequests);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getReturnRequestDetails);
router.patch('/:id/status', verifyAuth, authorizeRole('ADMIN'), updateReturnStatus);

export default router;
