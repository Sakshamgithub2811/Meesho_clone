import prisma from '../config/prisma.js';
import transporter from '../config/emailTransporter.js';
import { calculateCouponDiscount } from './coupon.controller.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || 'guest_customer';
};

const ensureProfile = async (userId) => {
  if (!userId) return null;
  try {
    return await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return await prisma.profile.findUnique({ where: { id: userId } });
    }
    throw err;
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const {
      items, // array of { productId, quantity, size }
      shippingAddress,
      paymentMethod = 'COD',
      couponCode
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Map payment method to enum
    let validPaymentMethod = 'COD';
    const pmUpper = (paymentMethod || '').toUpperCase();
    if (['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET'].includes(pmUpper)) {
      validPaymentMethod = pmUpper;
    }

    let parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;

    if (parsedShippingAddress) {
      const name = (parsedShippingAddress.name || parsedShippingAddress.fullName || '').trim();
      const phone = (parsedShippingAddress.phone || parsedShippingAddress.mobileNumber || '').trim();
      const details = (parsedShippingAddress.details || `${parsedShippingAddress.addressLine || ''}, ${parsedShippingAddress.city || ''}, ${parsedShippingAddress.state || ''}`).replace(/^[\s,]+|[\s,]+$/g, '');
      const pincode = (parsedShippingAddress.pincode || parsedShippingAddress.pin || '').trim();
      parsedShippingAddress = {
        ...parsedShippingAddress,
        name: name || 'Valued Customer',
        phone,
        details,
        pincode
      };

      if (name) {
        await prisma.profile.update({
          where: { id: userId },
          data: { fullName: name }
        }).catch(() => {});
      }
    }

    // Server-side authoritative price verification & stock check
    const productIds = items.map(it => it.productId).filter(Boolean);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let authoritativeTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} was not found.`
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Only ${product.stock} left in stock.`
        });
      }

      // Support Affiliate/Reseller Custom Margin Pricing
      const sentPrice = parseFloat(item.price);
      const baseProductPrice = parseFloat(product.price);
      // Unit price is base product price plus any valid positive affiliate margin passed from client
      const unitPrice = (sentPrice && sentPrice >= baseProductPrice) ? sentPrice : baseProductPrice;
      authoritativeTotal += unitPrice * qty;

      validatedItems.push({
        productId: product.id,
        quantity: qty,
        price: unitPrice,
        size: item.size || 'Free Size'
      });
    }

    let finalOrderTotal = authoritativeTotal;
    if (couponCode) {
      const discount = await calculateCouponDiscount(couponCode, authoritativeTotal);
      finalOrderTotal = Math.max(0, authoritativeTotal - discount);
    }

    // Atomic transaction: Decrement stock, create order, clear user cart
    const order = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory for each product
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // 2. Create the order with verified pricing
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: finalOrderTotal,
          shippingAddress: parsedShippingAddress,
          paymentMethod: validPaymentMethod,
          paymentStatus: validPaymentMethod === 'COD' ? 'PENDING' : 'PAID',
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

      // 3. Clear cart for this user atomically
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      // 4. Increment coupon usage count if applied
      if (couponCode) {
        await tx.coupon.updateMany({
          where: { code: couponCode.trim().toUpperCase() },
          data: { usedCount: { increment: 1 } }
        }).catch(() => {});
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (existing.orderStatus === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled. You can request a return or exchange instead.'
      });
    }

    if (existing.orderStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'CANCELLED',
        ...(existing.paymentStatus === 'PAID' ? { paymentStatus: 'REFUNDED' } : {})
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // If order was PAID (online/wallet), automatically refund to User's Wallet!
    if (existing.paymentStatus === 'PAID') {
      try {
        let userWallet = await prisma.wallet.findUnique({ where: { userId: existing.userId } });
        if (!userWallet) {
          userWallet = await prisma.wallet.create({
            data: { userId: existing.userId, balance: 0 }
          });
        }
        await prisma.wallet.update({
          where: { id: userWallet.id },
          data: { balance: { increment: existing.totalAmount } }
        });
        await prisma.walletTransaction.create({
          data: {
            walletId: userWallet.id,
            amount: existing.totalAmount,
            type: 'credit',
            description: `Refund for Cancelled Order #${existing.id.slice(0, 8)} (${reason || 'Customer Cancelled'})`
          }
        });
      } catch (wErr) {
        console.error('Error processing wallet refund on order cancel:', wErr);
      }
    }

    // Also cancel delivery task if one was assigned
    try {
      await prisma.deliveryTask.updateMany({
        where: { orderId: id },
        data: { status: 'CANCELLED' }
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};


/**
 * Update order status (ORDERED -> CONFIRMED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'ORDERED',
      'CONFIRMED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUNDED'
    ];

    const upperStatus = (status || '').toUpperCase();
    if (!validStatuses.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status '${status}'. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: upperStatus,
        ...(upperStatus === 'DELIVERED' ? { paymentStatus: 'PAID' } : {})
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Auto-dispatch delivery OTP email as soon as marked OUT_FOR_DELIVERY
    if (upperStatus === 'OUT_FOR_DELIVERY') {
      dispatchDeliveryOtpEmail({ orderId: id, type: 'DELIVERY' })
        .then((result) => console.log(`🚚 [Order ${id}] OUT_FOR_DELIVERY OTP automatically emailed to: ${result.sentTo}`))
        .catch((err) => console.error(`⚠️ [Order ${id}] OUT_FOR_DELIVERY email dispatch error:`, err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${upperStatus}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * Core helper: Dispatch delivery or pickup OTP email via SMTP directly to login email
 */
export const dispatchDeliveryOtpEmail = async ({
  orderId,
  otp,
  type = 'DELIVERY',
  email,
  recipientName,
  slotLabel
}) => {
  let finalOtp = otp;
  if (!finalOtp && orderId) {
    const isPickup = (type || '').toUpperCase().includes('PICKUP') || (type || '').toUpperCase().includes('RETURN');
    const multiplier = isPickup ? 41 : 33;
    const seed = orderId.split('').reduce((acc, char) => (acc * multiplier + char.charCodeAt(0)) % 9000, 1000);
    finalOtp = Math.abs(seed) + 1000;
  }

  if (!finalOtp) {
    throw new Error('OTP is required to dispatch verification email');
  }

  let targetEmail = email;
  let targetName = recipientName || 'Valued Customer';
  let orderDetails = null;

  if (orderId) {
    orderDetails = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        user: true
      }
    });

    if (!targetEmail) {
      targetEmail = orderDetails?.user?.email;
      if ((!targetEmail || targetEmail.endsWith('@customer.meesho')) && orderDetails?.shippingAddress) {
        try {
          const addr = typeof orderDetails.shippingAddress === 'string'
            ? JSON.parse(orderDetails.shippingAddress)
            : orderDetails.shippingAddress;
          if (addr?.email && !addr.email.endsWith('@customer.meesho')) targetEmail = addr.email;
          if (addr?.name) targetName = addr.name;
        } catch (e) {}
      }
    }
  }

  // If targetEmail has customer_..._gmail_com, extract actual gmail address
  if (targetEmail && targetEmail.includes('@customer.meesho')) {
    const match = targetEmail.match(/customer_(.+)@customer\.meesho/);
    if (match && match[1]?.endsWith('_gmail_com')) {
      targetEmail = match[1].replace(/_gmail_com$/, '@gmail.com');
    }
  }

  // Default to SMTP user for development/demo testing if dummy email
  if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
    targetEmail = email || process.env.SMTP_USER;
  }

  const isPickup = (type || '').toUpperCase().includes('PICKUP') || (type || '').toUpperCase().includes('RETURN');

  // Strict enforcement: DELIVERY OTP is only emailed when the order is OUT_FOR_DELIVERY
  if (!isPickup && orderDetails) {
    const currentStatus = (orderDetails.orderStatus || '').toUpperCase();
    if (currentStatus !== 'OUT_FOR_DELIVERY') {
      console.log(`ℹ️ [OTP Email] Skipping DELIVERY OTP for Order ${orderId}: status is "${currentStatus}" (OTP only sent upon OUT_FOR_DELIVERY).`);
      return {
        success: false,
        message: `Delivery OTP email is only dispatched when order is OUT_FOR_DELIVERY (current: ${currentStatus}).`,
        sentTo: null,
        otp: null
      };
    }
  }

  console.log(`📨 [OTP Email] Sending ${type} OTP (${finalOtp}) to login email: ${targetEmail}`);
  const subject = isPickup
    ? `🚚 Mshoppy Return Pickup Alert: Rider arriving for pickup (OTP: ${finalOtp})`
    : `🚚 Mshoppy Order Delivery Alert: Out for Delivery (OTP: ${finalOtp})`;

  const itemTitle = orderDetails?.items?.[0]?.product?.title || 'Catalog Purchase';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #9f0038 0%, #be123c 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Mshoppy</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; font-weight: 600;">
          ${isPickup ? 'Doorstep Return Pickup & Handover Alert' : 'Doorstep Parcel Delivery Alert'}
        </p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 0;">
          Hello ${targetName},
        </h2>
        <p style="font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          ${isPickup
            ? `Our courier partner (Shadowfax Logistics) is scheduled to arrive at your doorstep for return parcel collection during your slot: <strong>${slotLabel || 'Today'}</strong>.<br/><br/>Please hand over the parcel and share this secure verification OTP with the courier executive:`
            : 'Your order delivery executive is out for delivery. Please share this verification OTP only when you receive your package at your doorstep:'}
        </p>

        <div style="background: #fff1f2; border: 2px dashed #fb7185; border-radius: 16px; padding: 22px; text-align: center; margin: 20px 0;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9f0038; letter-spacing: 1.5px; margin-bottom: 6px;">
            ${isPickup ? 'Doorstep Return Handover OTP' : 'Order Delivery OTP'}
          </div>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #9f0038; font-family: monospace;">
            ${finalOtp}
          </div>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 8px; font-weight: 600;">
            ${slotLabel ? `Scheduled Slot: ${slotLabel}` : 'Valid for today\'s doorstep delivery visit'}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 12.5px; color: #334155; line-height: 1.6;">
          <div style="font-weight: 800; color: #0f172a; margin-bottom: 6px;">Package Details:</div>
          ${orderId ? `<div><strong>Order ID:</strong> #${orderId.slice(0, 14)}</div>` : ''}
          <div><strong>Product:</strong> ${itemTitle}</div>
          <div><strong>Security Rule:</strong> Share this OTP ONLY after handing over or receiving the parcel.</div>
        </div>

        <p style="font-size: 11.5px; color: #94a3b8; margin-top: 22px; line-height: 1.5; text-align: center;">
          This is an automated security verification email from Mshoppy. Do not share this OTP over calls or messages.
        </p>
      </div>

      <div style="background: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
        © 2026 Mshoppy Internet Commerce. All rights reserved.
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Mshoppy <${process.env.SMTP_USER}>`,
    to: targetEmail,
    subject,
    html: htmlContent
  });

  return {
    success: true,
    message: `OTP email successfully sent to ${targetEmail}`,
    messageId: info.messageId,
    sentTo: targetEmail,
    otp: finalOtp
  };
};

export const sendOtpEmail = async (req, res) => {
  try {
    const result = await dispatchDeliveryOtpEmail(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP email',
      error: error.message
    });
  }
};

export const submitReturnRequest = async (req, res) => {
  try {
    const {
      orderId,
      reason,
      subReason,
      images,
      actionType = 'return',
      exchangeSize,
      refundMethod,
      upiId,
      bankDetails,
      slot
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const reasonParts = [];
    if (reason) reasonParts.push(reason);
    if (subReason) reasonParts.push(subReason);
    if (actionType === 'exchange' && exchangeSize) reasonParts.push(`Exchange Size: ${exchangeSize}`);
    if (refundMethod === 'upi' && upiId) reasonParts.push(`UPI: ${upiId}`);
    if (slot) reasonParts.push(`Pickup Slot: ${slot}`);

    const finalReason = reasonParts.join(' | ') || 'Customer Return Request';

    // Sanitize image URLs/filenames to pure string array (Prisma requires String[])
    const cleanImages = Array.isArray(images)
      ? images
          .map((img) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object') return img.url || img.name || '';
            return '';
          })
          .filter(Boolean)
      : [];

    // Upsert return request in PostgreSQL database
    const returnReq = await prisma.returnRequest.upsert({
      where: { orderId: orderId },
      update: {
        reason: finalReason,
        status: 'requested',
        images: cleanImages,
      },
      create: {
        orderId: orderId,
        reason: finalReason,
        status: 'requested',
        images: cleanImages,
      }
    });

    // Update order status to RETURN_REQUESTED
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: 'RETURN_REQUESTED' }
    });

    return res.status(200).json({
      success: true,
      message: 'Return request registered successfully in database',
      data: returnReq
    });
  } catch (error) {
    console.error('Error creating return request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit return request',
      error: error.message
    });
  }
};

