import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllProducts,
  getProductDetails,
  updateProductStock,
  deleteProduct,
  bulkUpdateProductStatus
} from '../../controllers/admin/adminProducts.controller.js';

const router = Router();

// All Admin Products endpoints require valid authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllProducts);
router.patch('/bulk-status', verifyAuth, authorizeRole('ADMIN'), bulkUpdateProductStatus);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getProductDetails);
router.patch('/:id/stock', verifyAuth, authorizeRole('ADMIN'), updateProductStock);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteProduct);

export default router;
