import { Router } from 'express';
import { registerAffiliate, loginAffiliate } from '../../controllers/affiliate/affiliateAuth.controller.js';
import { getAffiliateStats } from '../../controllers/auth.controller.js';
import { verifyAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerAffiliate);
router.post('/login', loginAffiliate);
router.get('/stats', (req, res, next) => {
  if (req.headers.authorization) {
    return verifyAuth(req, res, next);
  }
  next();
}, getAffiliateStats);

export default router;
