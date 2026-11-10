import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getStaffList,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
} from '../../controllers/admin/adminStaff.controller.js';

const router = Router();

router.use(verifyAuth, authorizeRole('ADMIN'));

router.get('/', getStaffList);
router.post('/', createStaffMember);
router.patch('/:id', updateStaffMember);
router.delete('/:id', deleteStaffMember);

export default router;

