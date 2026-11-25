import { Router } from 'express';
import { getCategories, getCategoryBySlug, getCategoryAttributes } from '../controllers/category.controller.js';

const router = Router();

router.get('/', getCategories);
router.get('/:slug/attributes', getCategoryAttributes);
router.get('/:slug', getCategoryBySlug);

export default router;
