import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  resendVerificationEmail, 
  sendLoginOtp, 
  verifyLoginOtp 
} from '../../controllers/user/userAuth.controller.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-verification', resendVerificationEmail);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);

export default router;
