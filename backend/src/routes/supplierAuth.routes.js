import { Router } from 'express';
import {
  registerSupplier,
  loginSupplier,
  sendSupplierOtp,
  verifySupplierOtp,
  getSupplierProfile,
  updateSupplierProfile,
  updateBankDetails,
  updateGstDetails,
  logoutSupplier,
} from '../controllers/supplier/supplierAuth.controller.js';
import { verifySupplier } from '../middlewares/supplierAuth.middleware.js';

const router = Router();

// Public Authentication Routes
router.post('/register', registerSupplier);
router.post('/login', loginSupplier);
router.post('/send-otp', sendSupplierOtp);
router.post('/verify-otp', verifySupplierOtp);
router.post('/logout', logoutSupplier);

// Authenticated Supplier Profile Routes
router.get('/me', verifySupplier, getSupplierProfile);
router.get('/profile', verifySupplier, getSupplierProfile);
router.put('/profile', verifySupplier, updateSupplierProfile);
router.put('/profile/bank', verifySupplier, updateBankDetails);
router.put('/profile/gst', verifySupplier, updateGstDetails);

export default router;
