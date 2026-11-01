import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || 'guest_customer';
};

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret') {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

/**
 * Get Razorpay Client Configuration
 * GET /api/v1/payment/razorpay/config
 */
export const getRazorpayConfig = async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(
    keyId &&
    keyId !== 'your_razorpay_key_id' &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret'
  );

  return res.status(200).json({
    success: true,
    isConfigured,
    keyId: isConfigured ? keyId : null,
    isSandbox: keyId ? keyId.startsWith('rzp_test_') : false
  });
};

/**
 * Create a new Razorpay Order
 * POST /api/v1/payment/razorpay/create-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid order amount is required'
      });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay keys not configured in backend .env. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      });
    }

    // Razorpay requires amount in paise (multiply INR by 100)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes
    };

    const order = await rzp.orders.create(options);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to initialize Razorpay order'
    });
  }
};

/**
 * Verify Razorpay Payment Signature and finalize order
 * POST /api/v1/payment/razorpay/verify
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification parameters missing'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay Key Secret is missing from server config'
      });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }

    // Payment signature is valid! Persist order into database
    const userId = getUserId(req);

    // Ensure customer profile exists atomically
    await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });

    const {
      items = [],
      shippingAddress,
      totalAmount
    } = orderPayload || {};

    const parsedAddress = typeof shippingAddress === 'string'
      ? JSON.parse(shippingAddress)
      : shippingAddress;

    // Verify product IDs and calculate verified total
    const productIds = items.map(it => it.productId).filter(Boolean);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      const unitPrice = prod ? parseFloat(prod.price) : (parseFloat(item.price) || 0);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      calculatedTotal += unitPrice * qty;

      validatedItems.push({
        productId: item.productId,
        quantity: qty,
        price: unitPrice,
        size: item.size || 'Free Size'
      });
    }

    const verifiedTotal = calculatedTotal > 0 ? calculatedTotal : (parseFloat(totalAmount) || 0);

    // Atomic transaction: Decrement stock, create order, clear user cart
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Decrement stock
      for (const item of validatedItems) {
        if (productMap.has(item.productId)) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          }).catch(() => {});
        }
      }

      // 2. Create paid order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: verifiedTotal,
          shippingAddress: parsedAddress || {},
          paymentMethod: 'UPI',
          paymentStatus: 'PAID',
          orderStatus: 'ORDERED',
          items: {
            create: validatedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // 3. Clear cart items for this user cleanly
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully! 🎉',
      data: {
        ...createdOrder,
        razorpayPaymentId: razorpay_payment_id
      }
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Payment verification failed'
    });
  }
};
