import { Router } from 'express';
import { verifyAuth } from '../../middlewares/auth.middleware.js';
import { getMyProfile, updateMyProfile, changePassword } from '../../controllers/admin/adminProfile.controller.js';

const router = Router();

// Teeno routes token protected hain
router.get('/me', verifyAuth, getMyProfile);
router.put('/update', verifyAuth, updateMyProfile);
router.post('/change-password', verifyAuth, changePassword);

export default router;
