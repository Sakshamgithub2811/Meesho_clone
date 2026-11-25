import {
  initiateCallBridge,
  getCallSession,
  terminateCallBridge,
  generateTwilioVoiceResponse,
  maskPhoneNumber,
  getVirtualPilotNumber
} from '../services/telephony.service.js';

/**
 * Controller to initiate secure call bridge between driver and customer
 * POST /api/v1/telephony/initiate-call
 */
export const initiateSecureCall = async (req, res) => {
  try {
    const { orderId, driverId, driverPhone, driverName } = req.body;

    const result = await initiateCallBridge({
      orderId,
      driverId: driverId || req.user?.id || 'DRIVER_CURRENT',
      driverPhone: driverPhone || req.user?.phone || '+919999988888',
      driverName: driverName || req.user?.fullName || 'Delivery Partner'
    });

    return res.status(200).json({
      success: true,
      message: 'Secure call bridge initialized successfully',
      data: result
    });
  } catch (err) {
    console.error('Telephony controller initiation error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate secure call bridge',
      error: err.message
    });
  }
};

/**
 * Get active session status for a delivery order
 * GET /api/v1/telephony/session/:id
 */
export const getActiveSession = (req, res) => {
  try {
    const { id } = req.params;
    const session = getCallSession(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active call session found for this reference'
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving call session',
      error: err.message
    });
  }
};

/**
 * Terminate a call bridge session
 * POST /api/v1/telephony/terminate
 */
export const terminateSession = (req, res) => {
  try {
    const { orderId } = req.body;
    const terminated = terminateCallBridge(orderId);

    return res.status(200).json({
      success: true,
      message: terminated ? 'Call bridge session terminated' : 'Session not found or already closed'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error terminating call session',
      error: err.message
    });
  }
};

/**
 * Twilio Voice Webhook Handler
 * POST /api/v1/telephony/webhook/twilio-voice
 */
export const handleTwilioVoiceWebhook = (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    const from = req.body.From || req.query.From;
    const to = req.body.To || req.query.To;

    const xml = generateTwilioVoiceResponse({ sessionId, from, to });
    res.type('text/xml');
    return res.send(xml);
  } catch (err) {
    console.error('Twilio voice webhook error:', err.message);
    res.type('text/xml');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred connecting your call.</Say></Response>`);
  }
};

/**
 * General Telephony System Info / Pilot Number
 * GET /api/v1/telephony/info
 */
export const getTelephonyInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      provider: process.env.TELEPHONY_PROVIDER || 'simulator',
      virtualPilotNumber: getVirtualPilotNumber(),
      callRecordingEnabled: true,
      numberMaskingActive: true,
      autoExpiryMinutes: 45
    }
  });
};
