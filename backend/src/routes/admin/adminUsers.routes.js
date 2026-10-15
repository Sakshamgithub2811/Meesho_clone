import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import { getAllUsers, updateUserRole, deleteUser } from '../../controllers/admin/adminUsers.controller.js';

const router = Router();

// Only ADMIN can access User Management
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllUsers);
router.put('/:id/role', verifyAuth, authorizeRole('ADMIN'), updateUserRole);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteUser);

export default router;
