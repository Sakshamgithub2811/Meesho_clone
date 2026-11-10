import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getFinanceOverview,
  adjustWalletBalance,
  getWithdrawalsQueue,
  approveWithdrawal,
  rejectWithdrawal
} from '../../controllers/admin/adminFinance.controller.js';

const router = Router();

// All Admin Finance endpoints require valid token and ADMIN role
router.get('/', verifyAuth, authorizeRole('ADMIN'), getFinanceOverview);
router.post('/wallets/:walletId/adjust', verifyAuth, authorizeRole('ADMIN'), adjustWalletBalance);

// Withdrawals & Payouts Queue
router.get('/withdrawals', verifyAuth, authorizeRole('ADMIN'), getWithdrawalsQueue);
router.post('/withdrawals/:id/approve', verifyAuth, authorizeRole('ADMIN'), approveWithdrawal);
router.post('/withdrawals/:id/reject', verifyAuth, authorizeRole('ADMIN'), rejectWithdrawal);

export default router;
