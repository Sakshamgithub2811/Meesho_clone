import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../controllers/admin/adminCategories.controller.js';

const router = Router();

// All category management endpoints require authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllCategories);
router.post('/', verifyAuth, authorizeRole('ADMIN'), createCategory);
router.put('/:id', verifyAuth, authorizeRole('ADMIN'), updateCategory);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteCategory);

export default router;
