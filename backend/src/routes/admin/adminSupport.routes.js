import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllSupportTickets,
  getTicketDetails,
  updateTicketStatus
} from '../../controllers/admin/adminSupport.controller.js';

const router = Router();

// All Support Desk endpoints require authentication and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllSupportTickets);
router.get('/:id', verifyAuth, authorizeRole('ADMIN'), getTicketDetails);
router.patch('/:id/status', verifyAuth, authorizeRole('ADMIN'), updateTicketStatus);

export default router;
