import { Router } from 'express';
import { getMyWallet, requestWithdrawal } from '../controllers/wallet.controller.js';

const router = Router();

router.get('/', getMyWallet);
router.get('/me', getMyWallet);
router.post('/withdraw', requestWithdrawal);

export default router;
