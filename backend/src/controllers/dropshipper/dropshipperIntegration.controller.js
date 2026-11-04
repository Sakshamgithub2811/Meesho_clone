import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * 1. GET ALL INTEGRATIONS FOR DROPSHIPPER
 * Route: GET /api/v1/dropshipper/integrations/:firebaseUid
 */
export const getDropshipperIntegrations = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    // Verify user exists
    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });
    if (!user) {
      return res.status(200).json({ success: true, integrations: [] });
    }

    // Return real saved store connections from PostgreSQL (clean by default)
    const integrations = await prisma.storeIntegration.findMany({
      where: { userId: firebaseUid }
    });

    return res.status(200).json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error("Get Integrations Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch integrations" });
  }
};

/**
 * 2. SAVE OR UPDATE INTEGRATION CONFIG
 * Route: POST /api/v1/dropshipper/integrations/save
 */
export const saveDropshipperIntegration = async (req, res) => {
  try {
    const { 
      firebaseUid, 
      platform, 
      storeDomain, 
      accessToken, 
      webhookSecret, 
      isConnected, 
      autoSyncOrders, 
      autoPushTracking, 
      inventorySync 
    } = req.body;

    if (!firebaseUid || !platform) {
      return res.status(400).json({ error: "Missing required fields: firebaseUid and platform" });
    }

    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });
    if (!user) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    const normPlatform = platform.toUpperCase();

    const saved = await prisma.storeIntegration.upsert({
      where: {
        userId_platform: {
          userId: firebaseUid,
          platform: normPlatform
        }
      },
      update: {
        storeDomain: storeDomain ?? undefined,
        accessToken: accessToken ?? undefined,
        webhookSecret: webhookSecret ?? undefined,
        isConnected: typeof isConnected === 'boolean' ? isConnected : undefined,
        autoSyncOrders: typeof autoSyncOrders === 'boolean' ? autoSyncOrders : undefined,
        autoPushTracking: typeof autoPushTracking === 'boolean' ? autoPushTracking : undefined,
        inventorySync: typeof inventorySync === 'boolean' ? inventorySync : undefined
      },
      create: {
        userId: firebaseUid,
        platform: normPlatform,
        storeDomain: storeDomain || null,
        accessToken: accessToken || null,
        webhookSecret: webhookSecret || `whsec_${Math.random().toString(36).substring(2, 12)}`,
        isConnected: Boolean(isConnected),
        autoSyncOrders: autoSyncOrders ?? true,
        autoPushTracking: autoPushTracking ?? true,
        inventorySync: inventorySync ?? true
      }
    });

    return res.status(200).json({
      success: true,
      message: `${normPlatform} integration saved to database`,
      integration: saved
    });
  } catch (error) {
    console.error("Save Integration Error:", error);
    return res.status(500).json({ error: error.message || "Failed to save integration" });
  }
};

/**
 * 3. GET LIVE WEBHOOK LOGS FOR DROPSHIPPER
 * Route: GET /api/v1/dropshipper/integrations/logs/:firebaseUid
 */
export const getDropshipperWebhookLogs = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });
    if (!user) {
      return res.status(200).json({ success: true, logs: [] });
    }

    // Clean query: Fetch only real logs recorded for this user
    const logs = await prisma.webhookLog.findMany({
      where: { userId: firebaseUid },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    console.error("Get Webhook Logs Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch webhook logs" });
  }
};

/**
 * 4. TEST WEBHOOK PING (PERSISTS REAL RECORD IN DB)
 * Route: POST /api/v1/dropshipper/integrations/test-ping
 */
export const createTestWebhookPing = async (req, res) => {
  try {
    const { firebaseUid, channel = 'Shopify Store', event = 'orders/create', payload } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    const user = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });
    if (!user) {
      return res.status(404).json({ error: "Dropshipper profile not found in database" });
    }

    const testPayload = payload || {
      order_id: `TEST-${Math.floor(10000 + Math.random() * 90000)}`,
      total_price: (499 + Math.floor(Math.random() * 1500)).toFixed(2),
      currency: 'INR',
      line_items: [{ sku: 'SKU-TEST-LIVE', name: 'Embroidered Silk Collection', quantity: 1 }],
      shipping_address: { name: 'Live Tester', city: 'Mumbai', zip: '400001' }
    };

    const randomLatency = `${Math.floor(45 + Math.random() * 95)}ms`;

    const newLog = await prisma.webhookLog.create({
      data: {
        userId: firebaseUid,
        channel: channel,
        event: event,
        status: 200,
        statusText: 'OK',
        latency: randomLatency,
        payload: testPayload
      }
    });

    return res.status(201).json({
      success: true,
      message: "Test webhook generated and stored in database",
      log: newLog
    });
  } catch (error) {
    console.error("Test Webhook Ping Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process test ping" });
  }
};

/**
 * 5. CLEAR ALL WEBHOOK LOGS FROM DATABASE
 * Route: DELETE /api/v1/dropshipper/integrations/logs/:firebaseUid
 */
export const clearDropshipperWebhookLogs = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
    }

    await prisma.webhookLog.deleteMany({
      where: { userId: firebaseUid }
    });

    return res.status(200).json({
      success: true,
      message: "All webhook logs successfully cleared from database"
    });
  } catch (error) {
    console.error("Clear Webhook Logs Error:", error);
    return res.status(500).json({ error: error.message || "Failed to clear logs" });
  }
};
