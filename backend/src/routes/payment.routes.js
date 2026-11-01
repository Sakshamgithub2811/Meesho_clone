import { Router } from 'express';
import {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/payment.controller.js';

const router = Router();

router.get('/razorpay/config', getRazorpayConfig);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
