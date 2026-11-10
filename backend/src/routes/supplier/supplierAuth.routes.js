import { Router } from 'express';
import {
  registerSupplier,
  loginSupplier,
} from '../../controllers/supplier/supplierAuth1.controller.js';
import {
  getSupplierProfile,
  updateSupplierProfile,
  updateBankDetails,
  updateGstDetails,
  logoutSupplier,
} from '../../controllers/supplier/supplierAuth.controller.js';
import { verifySupplier } from '../../middlewares/supplierAuth.middleware.js';

const router = Router();

// Public Authentication Routes (Firebase UID Based, No JWT)
router.post('/register', registerSupplier);
router.post('/login', loginSupplier);
router.post('/logout', logoutSupplier);

// Authenticated Supplier Profile Routes
router.get('/me', verifySupplier, getSupplierProfile);
router.get('/profile', verifySupplier, getSupplierProfile);
router.put('/profile', verifySupplier, updateSupplierProfile);
router.put('/profile/bank', verifySupplier, updateBankDetails);
router.put('/profile/gst', verifySupplier, updateGstDetails);

export default router;
