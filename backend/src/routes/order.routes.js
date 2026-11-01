import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  sendOtpEmail,
  submitReturnRequest
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

export default router;

