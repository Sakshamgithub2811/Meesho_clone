import { Router } from 'express';
import { registerDropshipper, loginDropshipper } from '../../controllers/dropshipper/dropshipperAuth.controller.js';
import { getDropshipperProfile, updateDropshipperProfile, uploadDropshipperAvatar } from '../../controllers/dropshipper/dropshipperProfile.controller.js';
import { submitDropshipperKyc, getDropshipperKycStatus } from '../../controllers/dropshipper/dropshipperKyc.controller.js';
import { pushDropshipperOrder, pushBulkDropshipperOrders, getDropshipperOrders } from '../../controllers/dropshipper/dropshipperOrder.controller.js';
import { createDropshipperTicket, getDropshipperTickets } from '../../controllers/dropshipper/dropshipperTicket.controller.js';
import { receiveInboundWebhook, testWebhookPing } from '../../controllers/dropshipper/dropshipperWebhook.controller.js';
import { uploadAvatar } from '../../middlewares/upload.middleware.js';

const router = Router();

// 1. Authentication Endpoints
router.post('/auth/register', registerDropshipper);
router.post('/auth/login', loginDropshipper);

// 2. Profile Management Endpoints
router.get('/profile/:firebaseUid', getDropshipperProfile);
router.put('/profile', updateDropshipperProfile);
router.post('/profile/avatar', uploadAvatar.single('avatar'), uploadDropshipperAvatar);

// 3. 4-Step KYC Onboarding & Status Endpoints
router.post('/kyc', submitDropshipperKyc);
router.get('/kyc/:firebaseUid', getDropshipperKycStatus);

// 4. Order Push Hub Endpoints (Database Integrated)
router.post('/orders/push', pushDropshipperOrder);
router.post('/orders/bulk-push', pushBulkDropshipperOrders);
router.get('/orders/:firebaseUid', getDropshipperOrders);

// 5. Helpdesk & Support Dispute Endpoints (Database Integrated)
router.post('/tickets', createDropshipperTicket);
router.get('/tickets/:firebaseUid', getDropshipperTickets);

// 6. Webhooks & Omnichannel Ingestion Endpoints
router.post('/webhook/orders/:webhookToken', receiveInboundWebhook);
router.post('/webhook/test-ping', testWebhookPing);

export default router;
