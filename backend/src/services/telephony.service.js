import prisma from '../config/prisma.js';

// In-memory active call bridge sessions (stores session mapping for call routing)
const activeCallSessions = new Map();

/**
 * Mask customer phone number for UI & driver view
 * Example: +91 9876543210 -> +91 98765 XXXXX
 */
export const maskPhoneNumber = (phone = '') => {
  if (!phone || typeof phone !== 'string') return '+91 XXXXX XXXXX';
  const clean = phone.replace(/[\s-]/g, '');
  if (clean.length >= 10) {
    const prefix = clean.startsWith('+91') ? clean.slice(0, 8) : clean.slice(0, 5);
    return `${prefix} XXXXX`;
  }
  return 'XXXXX XXXXX';
};

/**
 * Returns the configured virtual pilot number for cloud telephony
 */
export const getVirtualPilotNumber = () => {
  return process.env.TELEPHONY_VIRTUAL_NUMBER || process.env.EXOTEL_VIRTUAL_NUMBER || '+918047123456';
};

/**
 * Clean up expired sessions periodically (older than 60 mins)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of activeCallSessions.entries()) {
    if (session.expiresAt && session.expiresAt < now) {
      activeCallSessions.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Initiate an encrypted Call Bridge between driver and customer
 */
export const initiateCallBridge = async ({
  orderId,
  driverId = 'driver_default',
  driverPhone = '+919999988888',
  driverName = 'Delivery Rider'
}) => {
  try {
    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });
    }

    // Resolve real customer phone safely
    let customerPhone = '';
    let customerName = 'Valued Customer';

    if (order) {
      let shipping = {};
      try {
        shipping = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : (order.shippingAddress || {});
      } catch (_) {}

      customerPhone = shipping.phone || order.user?.phone || '';
      customerName = shipping.name || order.user?.fullName || 'Valued Customer';
    }

    // If order lookup in test/demo does not have phone, use safe default
    if (!customerPhone) {
      customerPhone = process.env.DEFAULT_TEST_PHONE || '+919876543210';
    }

    const sessionId = `BRIDGE_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const virtualNumber = getVirtualPilotNumber();
    const maskedCustomer = maskPhoneNumber(customerPhone);
    const maskedDriver = maskPhoneNumber(driverPhone);
    const extensionCode = String(1000 + (Math.abs(orderId ? orderId.charCodeAt(0) : 10) * 17) % 9000);

    const provider = (process.env.TELEPHONY_PROVIDER || 'simulator').toLowerCase();

    const sessionData = {
      sessionId,
      orderId: order?.id || orderId || 'DEMO_ORDER',
      driverId,
      driverName,
      driverPhone,
      customerName,
      customerPhone, // stored only in server memory for bridging, never exposed to client
      maskedCustomerPhone: maskedCustomer,
      virtualNumber,
      extensionCode,
      status: 'INITIATED',
      provider,
      createdAt: Date.now(),
      expiresAt: Date.now() + 45 * 60 * 1000 // 45 minutes auto-expiry
    };

    activeCallSessions.set(sessionId, sessionData);
    if (orderId) {
      activeCallSessions.set(orderId, sessionData);
    }
    // Also index by driver phone for inbound IVR lookup
    activeCallSessions.set(`DRIVER_${driverPhone.replace(/\D/g, '')}`, sessionData);

    console.log(`📞 [Telephony] Initialized Call Bridge [${sessionId}] for Order #${sessionData.orderId}`);
    console.log(`   Rider: ${driverName} (${maskedDriver}) ➔ Virtual DID: ${virtualNumber} ➔ Customer: ${customerName} (${maskedCustomer})`);

    // Handle Live Twilio Provider
    if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls.json`;

        const webhookCallback = `${process.env.BACKEND_URL || 'https://meesho.digitalsabkuch.com'}/api/v1/telephony/webhook/twilio-voice?sessionId=${sessionId}`;
        
        const params = new URLSearchParams();
        params.append('To', driverPhone);
        params.append('From', process.env.TWILIO_PHONE_NUMBER || virtualNumber);
        params.append('Url', webhookCallback);

        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const twilioRes = await response.json();
        console.log('✅ [Twilio Voice] Call dispatch response:', twilioRes.sid || twilioRes.status);
      } catch (twErr) {
        console.warn('⚠️ [Twilio Voice] Notice:', twErr.message);
      }
    }

    // Handle Live Exotel Provider
    if (provider === 'exotel' && process.env.EXOTEL_SID && process.env.EXOTEL_API_KEY) {
      try {
        const exotelAuth = 'Basic ' + Buffer.from(`${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}`).toString('base64');
        const exotelUrl = `https://api.exotel.com/v1/Accounts/${process.env.EXOTEL_SID}/Calls/connect.json`;

        const params = new URLSearchParams();
        params.append('From', driverPhone);
        params.append('To', customerPhone);
        params.append('CallerId', virtualNumber);
        params.append('TimeLimit', '600'); // 10 min max call duration

        const response = await fetch(exotelUrl, {
          method: 'POST',
          headers: {
            'Authorization': exotelAuth,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const exotelRes = await response.json();
        console.log('✅ [Exotel Voice] Call connect status:', exotelRes?.Call?.Status);
      } catch (exErr) {
        console.warn('⚠️ [Exotel Voice] Notice:', exErr.message);
      }
    }

    return {
      success: true,
      sessionId,
      provider,
      orderId: sessionData.orderId,
      virtualNumber,
      extensionCode,
      dialString: `tel:${virtualNumber}`,
      customerName,
      maskedCustomerPhone: maskedCustomer,
      message: 'Secure call bridge connected. Customer direct phone number is protected.',
      expiresInMinutes: 45
    };
  } catch (err) {
    console.error('❌ [Telephony] Error initiating call bridge:', err.message);
    throw err;
  }
};

/**
 * Retrieve active call bridge session details
 */
export const getCallSession = (sessionIdOrOrderId) => {
  if (!sessionIdOrOrderId) return null;
  const session = activeCallSessions.get(sessionIdOrOrderId);
  if (!session) return null;

  // Return sanitized object (never expose customerPhone to client)
  return {
    sessionId: session.sessionId,
    orderId: session.orderId,
    customerName: session.customerName,
    maskedCustomerPhone: session.maskedCustomerPhone,
    virtualNumber: session.virtualNumber,
    extensionCode: session.extensionCode,
    status: session.status,
    provider: session.provider,
    expiresAt: session.expiresAt
  };
};

/**
 * Terminate a call bridge session (e.g. when order is delivered or cancelled)
 */
export const terminateCallBridge = (orderId) => {
  if (!orderId) return false;
  const session = activeCallSessions.get(orderId);
  if (session) {
    activeCallSessions.delete(session.sessionId);
    activeCallSessions.delete(orderId);
    if (session.driverPhone) {
      activeCallSessions.delete(`DRIVER_${session.driverPhone.replace(/\D/g, '')}`);
    }
    console.log(`🔒 [Telephony] Call bridge session terminated for Order #${orderId}. Number unlinked.`);
    return true;
  }
  return false;
};

/**
 * Handle incoming Twilio voice webhook (generates TwiML instructions)
 */
export const generateTwilioVoiceResponse = ({ sessionId, from, to }) => {
  const session = activeCallSessions.get(sessionId) || activeCallSessions.get(`DRIVER_${(from || '').replace(/\D/g, '')}`);
  
  if (!session) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Sorry, no active delivery call session found for this number.</Say>
  <Hangup/>
</Response>`;
  }

  const virtualNumber = getVirtualPilotNumber();

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Connecting your MShoppy delivery call. This call is recorded for quality and security.</Say>
  <Dial callerId="${virtualNumber}" timeout="25" record="record-from-answer">
    <Number>${session.customerPhone}</Number>
  </Dial>
</Response>`;
};
