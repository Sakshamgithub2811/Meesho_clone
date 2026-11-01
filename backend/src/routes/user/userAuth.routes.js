import { Router } from 'express';
import { registerUser, loginUser, resendVerificationEmail } from '../../controllers/user/userAuth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-verification', resendVerificationEmail);

export default router;
