import { Router } from 'express';
import { getActiveFlashSale, updateFlashSale } from '../controllers/flashSale.controller.js';

const router = Router();

// Public / Customer endpoint to get active sale timer & banner info
router.get('/active', getActiveFlashSale);
router.get('/', getActiveFlashSale);

// Update endpoint (can be called by Admin Panel in future)
router.post('/config', updateFlashSale);
router.put('/config', updateFlashSale);

export default router;
