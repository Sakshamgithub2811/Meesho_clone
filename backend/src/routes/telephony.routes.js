import { Router } from 'express';
import {
  initiateSecureCall,
  getActiveSession,
  terminateSession,
  handleTwilioVoiceWebhook,
  getTelephonyInfo
} from '../controllers/telephony.controller.js';

const router = Router();

// Public info & configuration
router.get('/info', getTelephonyInfo);

// Initiate secure call bridge
router.post('/initiate-call', initiateSecureCall);

// Query active session
router.get('/session/:id', getActiveSession);

// Terminate session
router.post('/terminate', terminateSession);

// Voice webhooks (Twilio & Exotel)
router.post('/webhook/twilio-voice', handleTwilioVoiceWebhook);
router.all('/webhook/voice', handleTwilioVoiceWebhook);

export default router;
