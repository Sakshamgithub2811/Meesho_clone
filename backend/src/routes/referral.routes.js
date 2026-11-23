import { Router } from 'express';
import { getReferralStats, applyReferralCode, getReferralInfo } from '../controllers/referral.controller.js';

const router = Router();

// GET /api/referrals/stats (Real stats, milestones, contacts, and invited friends)
router.get('/stats', getReferralStats);

// GET /api/referrals/info/:code (Public referral info for invite landing page)
router.get('/info/:code', getReferralInfo);

// POST /api/referrals/apply (Apply referral code on signup or checkout)
router.post('/apply', applyReferralCode);

export default router;
