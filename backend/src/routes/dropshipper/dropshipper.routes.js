import { Router } from 'express';
import { registerDropshipper, loginDropshipper } from '../../controllers/dropshipper/dropshipperAuth.controller.js';

const router = Router();

// Authentication Endpoints
router.post('/auth/register', registerDropshipper);
router.post('/auth/login', loginDropshipper);

export default router;
