import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getFinanceOverview,
  adjustWalletBalance
} from '../../controllers/admin/adminFinance.controller.js';

const router = Router();

// All Admin Finance endpoints require valid token and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getFinanceOverview);
router.post('/wallets/:walletId/adjust', verifyAuth, authorizeRole('ADMIN'), adjustWalletBalance);

export default router;
