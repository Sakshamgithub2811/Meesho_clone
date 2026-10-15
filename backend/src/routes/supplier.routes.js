import { Router } from 'express';
import {
  getDashboardStats,
  getSupplierProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  addCategory,
  getSupplierOrders,
  updateOrderStatus,
} from '../controllers/supplier/supplier.controller.js';
import {
  getSupplierProfile,
  updateSupplierProfile,
  updateBankDetails,
  updateGstDetails,
} from '../controllers/supplier/supplierAuth.controller.js';
import { uploadProductMedia } from '../middlewares/upload.middleware.js';
import { verifySupplier } from '../middlewares/supplierAuth.middleware.js';

const router = Router();

// Apply supplier authentication middleware to all supplier routes
router.use(verifySupplier);

// Profile Management
router.get('/profile', getSupplierProfile);
router.put('/profile', updateSupplierProfile);
router.put('/profile/bank', updateBankDetails);
router.put('/profile/gst', updateGstDetails);

// Dashboard & Analytics
router.get('/dashboard-stats', getDashboardStats);

// Products / Catalog
router.get('/products', getSupplierProducts);
router.post('/products', uploadProductMedia.array('images', 8), addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.get('/categories', getCategories);
router.post('/categories', addCategory);

// Orders & Fulfillment
router.get('/orders', getSupplierOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
