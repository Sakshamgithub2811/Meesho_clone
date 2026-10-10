import { Router } from 'express';
import { registerAffiliate, loginAffiliate } from '../../controllers/affiliate/affiliateAuth.controller.js';

const router = Router();

router.post('/register', registerAffiliate);
router.post('/login', loginAffiliate);

export default router;
