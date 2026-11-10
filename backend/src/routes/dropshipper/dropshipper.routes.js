import { Router } from 'express';
import { registerDropshipper, loginDropshipper } from '../../controllers/dropshipper/dropshipperAuth.controller.js';
import { 
  getDropshipperProfile, 
  updateDropshipperProfile, 
  uploadDropshipperAvatar,
  deactivateDropshipperAccount,
  restoreDropshipperAccount
} from '../../controllers/dropshipper/dropshipperProfile.controller.js';
import { submitDropshipperKyc, getDropshipperKycStatus } from '../../controllers/dropshipper/dropshipperKyc.controller.js';
import { 
  pushDropshipperOrder, 
  pushBulkDropshipperOrders, 
  getDropshipperOrders,
  updateDropshipperOrder,
  cancelDropshipperOrder,
  deleteDropshipperOrder,
  archiveDropshipperOrder
} from '../../controllers/dropshipper/dropshipperOrder.controller.js';
import { 
  createDropshipperTicket, 
  getDropshipperTickets,
  replyDropshipperTicket,
  updateDropshipperTicketStatus
} from '../../controllers/dropshipper/dropshipperTicket.controller.js';
import { receiveInboundWebhook, testWebhookPing } from '../../controllers/dropshipper/dropshipperWebhook.controller.js';
import { 
  getDropshipperIntegrations, 
  saveDropshipperIntegration, 
  getDropshipperWebhookLogs, 
  createTestWebhookPing, 
  clearDropshipperWebhookLogs 
} from '../../controllers/dropshipper/dropshipperIntegration.controller.js';
import {
  getDropshipperMarginConfig,
  saveDropshipperMarginConfig,
  resetDropshipperMarginConfig
} from '../../controllers/dropshipper/dropshipperMargin.controller.js';
import {
  getDropshipperSettlements,
  submitSettlementClaim
} from '../../controllers/dropshipper/dropshipperSettlement.controller.js';
import {
  getDropshipperRotData,
  updateDropshipperRotPlan,
  submitRotDispute
} from '../../controllers/dropshipper/dropshipperRot.controller.js';
import { uploadAvatar } from '../../middlewares/upload.middleware.js';
import { getDropshipperDashboardOverview } from '../../controllers/dropshipper/dropshipperDashboard.controller.js';

const router = Router();

// 0. Master Executive Dashboard Overview
router.get('/dashboard/overview/:firebaseUid', getDropshipperDashboardOverview);

// 1. Authentication Endpoints
router.post('/auth/register', registerDropshipper);
router.post('/auth/login', loginDropshipper);

// 2. Profile Management & Soft Delete Endpoints
router.get('/profile/:firebaseUid', getDropshipperProfile);
router.put('/profile', updateDropshipperProfile);
router.post('/profile/avatar', uploadAvatar.single('avatar'), uploadDropshipperAvatar);
router.post('/profile/deactivate', deactivateDropshipperAccount);
router.post('/profile/restore', restoreDropshipperAccount);

// 3. 4-Step KYC Onboarding & Status Endpoints
router.post('/kyc', submitDropshipperKyc);
router.get('/kyc/:firebaseUid', getDropshipperKycStatus);

// 4. Order Push Hub Endpoints (Database Integrated)
router.post('/orders/push', pushDropshipperOrder);
router.post('/orders/bulk-push', pushBulkDropshipperOrders);
router.get('/orders/:firebaseUid', getDropshipperOrders);
router.put('/orders/:orderId', updateDropshipperOrder);
router.put('/orders/:orderId/cancel', cancelDropshipperOrder);
router.put('/orders/:orderId/archive', archiveDropshipperOrder);
router.delete('/orders/:orderId', deleteDropshipperOrder);

// 5. Helpdesk & Support Dispute Endpoints (Database Integrated)
router.post('/tickets', createDropshipperTicket);
router.get('/tickets/:firebaseUid', getDropshipperTickets);
router.post('/tickets/:ticketId/reply', replyDropshipperTicket);
router.put('/tickets/:ticketId/status', updateDropshipperTicketStatus);

// 6. Webhooks & Omnichannel Ingestion Endpoints
router.post('/webhook/orders/:webhookToken', receiveInboundWebhook);
router.post('/webhook/test-ping', testWebhookPing);

// 7. Store Channel Integrations & Database Webhook Logs
router.get('/integrations/:firebaseUid', getDropshipperIntegrations);
router.post('/integrations/save', saveDropshipperIntegration);
router.get('/integrations/logs/:firebaseUid', getDropshipperWebhookLogs);
router.post('/integrations/test-ping', createTestWebhookPing);
router.delete('/integrations/logs/:firebaseUid', clearDropshipperWebhookLogs);

// 8. Profit Margin & Markup Engine Endpoints (Database Integrated)
router.get('/margin-config/:firebaseUid', getDropshipperMarginConfig);
router.post('/margin-config/save', saveDropshipperMarginConfig);
router.delete('/margin-config/:firebaseUid', resetDropshipperMarginConfig);

// 9. Order Settlement & Logistics Tracking Endpoints (Database Integrated)
router.get('/settlements/:firebaseUid', getDropshipperSettlements);
router.post('/settlements/claim', submitSettlementClaim);

// 10. ROT Liability & Return Protection Plan Endpoints (Database Integrated)
router.get('/rot/:firebaseUid', getDropshipperRotData);
router.post('/rot/plan', updateDropshipperRotPlan);
router.post('/rot/dispute', submitRotDispute);

export default router;
