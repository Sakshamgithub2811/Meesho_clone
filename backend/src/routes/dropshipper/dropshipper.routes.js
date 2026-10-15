import { Router } from 'express';
import { registerDropshipper, loginDropshipper } from '../../controllers/dropshipper/dropshipperAuth.controller.js';
import { getDropshipperProfile, updateDropshipperProfile } from '../../controllers/dropshipper/dropshipperProfile.controller.js';

const router = Router();

// 1. Authentication Endpoints
router.post('/auth/register', registerDropshipper);
router.post('/auth/login', loginDropshipper);

// 2. Profile Management Endpoints
router.get('/profile/:firebaseUid', getDropshipperProfile);
router.put('/profile', updateDropshipperProfile);

export default router;
