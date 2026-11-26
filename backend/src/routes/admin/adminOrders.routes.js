import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getLiveOrderUpdates,
  resendAdminOrderDispatchEmail,
  resendAdminOrderDeliveryOtp
} from '../../controllers/admin/adminOrders.controller.js';

const router = Router();

// All Admin Orders endpoints require valid authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllOrders);
router.get('/live-poll', verifyAuth, authorizeRole('ADMIN'), getLiveOrderUpdates);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getOrderDetails);
router.patch('/:id/status', verifyAuth, authorizeRole('ADMIN'), updateOrderStatus);
router.post('/:id/resend-dispatch-email', verifyAuth, authorizeRole('ADMIN'), resendAdminOrderDispatchEmail);
router.post('/:id/resend-delivery-otp', verifyAuth, authorizeRole('ADMIN'), resendAdminOrderDeliveryOtp);

export default router;
