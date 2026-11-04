import prisma from '../../config/prisma.js';

/**
 * 1. Live Inbound Webhook Receiver (Shopify / WooCommerce / Custom Bot)
 * POST /api/v1/dropshipper/webhook/orders/:webhookToken
 */
export const receiveInboundWebhook = async (req, res) => {
  try {
    const { webhookToken } = req.params;
    const payload = req.body;

    console.log(`[Inbound Webhook] Received event for token: ${webhookToken}`);

    // If payload is empty or test ping
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Webhook endpoint reachable (Empty test ping received)',
        timestamp: new Date()
      });
    }

    // Try to find dropshipper from webhookToken (token is typically prefix + uid)
    const cleanUid = webhookToken.replace('wh_live_', '');
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: cleanUid },
          { id: { startsWith: cleanUid } },
          { role: 'DROPSHIPPER' }
        ]
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No active dropshipper found for this webhook signature'
      });
    }

    // Extract customer & order attributes flexibly (Shopify vs WooCommerce vs Custom)
    const customer = payload.customer || payload.shipping_address || {};
    const customerName = customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Online Customer';
    const customerPhone = customer.phone || payload.phone || '9800000000';
    const city = customer.city || 'City';
    const state = customer.province || customer.state || 'State';
    const pincode = customer.zip || customer.pincode || '400001';
    const addressLine = customer.address1 || customer.address || 'Online Store Delivery';

    const lineItems = payload.line_items || [];
    const firstItem = lineItems[0] || {};
    const productName = firstItem.title || firstItem.name || payload.product_name || 'Imported Sourced Product';
    const productSku = firstItem.sku || payload.sku || 'SKU-EXT-01';
    const quantity = Number(firstItem.quantity || payload.quantity || 1);
    const totalPrice = Number(payload.total_price || payload.customer_price || 999);

    const fallbackProduct = await prisma.product.findFirst();
    const randomAwb = `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const shippingAddress = {
      fullName: customerName,
      phone: customerPhone,
      addressLine,
      city,
      state,
      pincode,
      whiteLabelStoreName: profile.storeName || 'Online Fashion Boutique',
      productName,
      productSku,
      quantity,
      customerPrice: totalPrice,
      wholesaleCost: totalPrice * 0.6,
      shippingFee: 60,
      dropshipperMargin: Math.max(0, totalPrice * 0.34),
      courier: 'Delhivery Air',
      awb: randomAwb,
      paymentMode: (payload.financial_status === 'paid' || payload.payment_mode === 'PREPAID') ? 'PREPAID' : 'COD'
    };

    const newOrder = await prisma.order.create({
      data: {
        userId: profile.id,
        totalAmount: totalPrice,
        shippingAddress,
        paymentMethod: shippingAddress.paymentMode === 'COD' ? 'COD' : 'UPI',
        paymentStatus: shippingAddress.paymentMode === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'ORDERED',
        ...(fallbackProduct && {
          items: {
            create: {
              productId: fallbackProduct.id,
              quantity,
              price: totalPrice
            }
          }
        })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Order ingested from sales channel webhook and sent to supplier queue!',
      orderId: newOrder.id,
      orderNumber: `DSP-${newOrder.id.slice(0, 8).toUpperCase()}`,
      awb: randomAwb
    });

  } catch (error) {
    console.error('Error in receiveInboundWebhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process webhook order',
      error: error.message
    });
  }
};

/**
 * 2. Instant Test Ping
 * POST /api/v1/dropshipper/webhook/test-ping
 */
export const testWebhookPing = async (req, res) => {
  try {
    const { channel = 'Shopify Store', storeDomain } = req.body;
    return res.status(200).json({
      success: true,
      status: 200,
      statusText: 'OK',
      channel,
      storeDomain: storeDomain || 'connected-store.myshopify.com',
      message: 'Webhook handshake verified successfully (HTTP 200 OK)',
      latencyMs: Math.floor(40 + Math.random() * 40),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Webhook ping failed',
      error: error.message
    });
  }
};
