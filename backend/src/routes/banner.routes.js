// backend/src/routes/banner.routes.js
import { Router } from 'express';
import { getBanners, updateBanners } from '../controllers/banner.controller.js';

const router = Router();

router.get('/', getBanners);
router.put('/', updateBanners);

export default router;

