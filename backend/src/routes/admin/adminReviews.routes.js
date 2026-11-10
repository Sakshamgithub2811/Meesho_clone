import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllReviews,
  toggleReviewVisibility,
  replyToReview,
  deleteReview
} from '../../controllers/admin/adminReviews.controller.js';

const router = Router();

// All reviews moderation endpoints require ADMIN privilege
router.get('/', verifyAuth, authorizeRole('ADMIN'), getAllReviews);
router.patch('/:id/visibility', verifyAuth, authorizeRole('ADMIN'), toggleReviewVisibility);
router.post('/:id/reply', verifyAuth, authorizeRole('ADMIN'), replyToReview);
router.delete('/:id', verifyAuth, authorizeRole('ADMIN'), deleteReview);

export default router;
