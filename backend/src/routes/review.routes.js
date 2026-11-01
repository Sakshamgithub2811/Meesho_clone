import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  checkCanReview,
  voteHelpfulReview
} from '../controllers/review.controller.js';

const router = Router();

// Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Check if current user can review this product
router.get('/can-review/:productId', checkCanReview);

// Toggle helpful upvote on a review
router.post('/:id/helpful', voteHelpfulReview);

// Create or update review (requires delivered order)
router.post('/', createReview);

export default router;

