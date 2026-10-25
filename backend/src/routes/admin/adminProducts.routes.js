import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllProducts,
  getProductDetails,
  updateProductStock,
  deleteProduct
} from '../../controllers/admin/adminProducts.controller.js';

const router = Router();

// All Admin Products endpoints require valid authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllProducts);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getProductDetails);
router.patch('/:id/stock', verifyAuth, authorizeRole('ADMIN'), updateProductStock);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteProduct);

export default router;
