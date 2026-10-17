import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus
} from '../../controllers/admin/adminOrders.controller.js';

const router = Router();

// All Admin Orders endpoints require valid authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllOrders);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getOrderDetails);
router.patch('/:id/status', verifyAuth, authorizeRole('ADMIN'), updateOrderStatus);

export default router;
