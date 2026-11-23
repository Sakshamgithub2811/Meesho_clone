import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  sendOtpEmail,
  submitReturnRequest,
  resendDispatchEmail,
  resendDeliveryOtpEmail
} from '../controllers/order.controller.js';

const router = Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.post('/send-otp-email', sendOtpEmail);
router.post('/return-request', submitReturnRequest);
router.post('/return', submitReturnRequest);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/resend-dispatch-email', resendDispatchEmail);
router.post('/:id/resend-delivery-otp', resendDeliveryOtpEmail);

export default router;

