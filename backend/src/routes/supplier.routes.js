import { Router } from 'express';
import {
  getDashboardStats,
  getSupplierProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  bulkDeleteProducts,
  bulkUploadProducts,
  getCategories,
  addCategory,
  getSupplierOrders,
  updateOrderStatus,
  getSupplierSettlements,
  requestSupplierPayout,
  getSupplierAnalytics,
  downloadOrderInvoice,
  downloadShippingLabel,
  getSupplierReturns,
  updateReturnStatus,
  getSupplierReviews,
  replyToProductReview,
} from '../controllers/supplier/supplier.controller.js';
import {
  getSupplierProfile,
  updateSupplierProfile,
  updateBankDetails,
  updateGstDetails,
} from '../controllers/supplier/supplierAuth.controller.js';
import {
  getSupplierKyc,
  submitSupplierKyc,
} from '../controllers/supplier/supplierKyc.controller.js';
import {
  getSupplierStaffList,
  getMySupplierPermissions,
  updateSupplierStaffPermissions,
  createSupplierStaff,
  deleteSupplierStaff,
} from '../controllers/supplier/supplierRbac.controller.js';
import { uploadProductMedia } from '../middlewares/upload.middleware.js';
import { verifySupplier } from '../middlewares/supplierAuth.middleware.js';

const router = Router();

// Public / Unauthenticated category read for suppliers and catalog picker
router.get('/categories', getCategories);

// Apply supplier authentication middleware to all protected supplier routes
router.use(verifySupplier);

// Profile & KYC Management
router.get('/profile', getSupplierProfile);
router.put('/profile', updateSupplierProfile);
router.put('/profile/bank', updateBankDetails);
router.put('/profile/gst', updateGstDetails);

// Supplier KYC Application
router.get('/kyc', getSupplierKyc);
router.post('/kyc', submitSupplierKyc);

// Dashboard & Analytics
router.get('/dashboard-stats', getDashboardStats);
router.get('/finance-settlements', getSupplierSettlements);
router.post('/finance-settlements/withdraw', requestSupplierPayout);
router.post('/request-payout', requestSupplierPayout);
router.get('/analytics', getSupplierAnalytics);

// Products / Catalog
router.get('/products', getSupplierProducts);
router.post('/products', uploadProductMedia.array('images', 8), addProduct);
router.post('/products/bulk-upload', bulkUploadProducts);
router.patch('/products/bulk', bulkUpdateProducts);
router.post('/products/bulk-delete', bulkDeleteProducts);
router.delete('/products/bulk', bulkDeleteProducts);
router.put('/products/:id', uploadProductMedia.array('images', 8), updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories (Creation requires authenticated supplier)
router.post('/categories', addCategory);

// Orders & Fulfillment
router.get('/orders', getSupplierOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/orders/:id/invoice', downloadOrderInvoice);
router.get('/orders/:id/shipping-label', downloadShippingLabel);

// Returns & RTO Hub
router.get('/returns', getSupplierReturns);
router.patch('/returns/:id/status', updateReturnStatus);

// Product Reviews & Ratings (UGC & Feedback Hub)
router.get('/reviews', getSupplierReviews);
router.post('/reviews/:id/reply', replyToProductReview);

// Team & RBAC Permissions Hub (100% Database-Driven)
router.get('/rbac/staff', getSupplierStaffList);
router.get('/rbac/my-permissions', getMySupplierPermissions);
router.put('/rbac/staff/:id/permissions', updateSupplierStaffPermissions);
router.post('/rbac/staff', createSupplierStaff);
router.delete('/rbac/staff/:id', deleteSupplierStaff);

export default router;
