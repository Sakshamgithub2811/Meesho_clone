import { Router } from 'express';
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist
} from '../controllers/wishlist.controller.js';

const router = Router();

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
