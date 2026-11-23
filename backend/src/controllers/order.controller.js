import prisma from '../config/prisma.js';
import transporter from '../config/emailTransporter.js';
import { calculateCouponDiscount } from './coupon.controller.js';
import {
  sendOrderConfirmationEmail,
  sendOrderDispatchedEmail,
  sendOrderOutForDeliveryEmail
} from '../utils/emailTemplates.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || 'guest_customer';
};

const ensureProfile = async (userId, incomingEmail = null, fullName = null, phone = null) => {
  if (!userId) return null;
  const cleanEmail = (incomingEmail && incomingEmail.includes('@') && !incomingEmail.endsWith('@customer.meesho'))
    ? incomingEmail.toLowerCase().trim()
    : `${userId}@customer.meesho`;

  try {
    if (incomingEmail && incomingEmail.includes('@') && !incomingEmail.endsWith('@customer.meesho')) {
      const existing = await prisma.profile.findFirst({
        where: { email: { equals: incomingEmail.toLowerCase().trim(), mode: 'insensitive' } }
      });
      if (existing) return existing;
    }

    return await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        fullName: fullName || 'Customer',
        email: cleanEmail,
        phone: phone || null,
        role: 'CUSTOMER'
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      try {
        return await prisma.profile.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            fullName: fullName || 'Customer',
            email: `${userId}@customer.meesho`,
            phone: phone || null,
            role: 'CUSTOMER'
          }
        });
      } catch (_) {
        return await prisma.profile.findFirst({ where: { OR: [{ id: userId }, { email: cleanEmail }] } });
      }
    }
    throw err;
  }
};

export const createOrder = async (req, res) => {
  try {
    let userId = getUserId(req);

    const {
      items, // array of { productId, quantity, size }
      shippingAddress,
      paymentMethod = 'COD',
      couponCode,
      referralCode
    } = req.body;

    // Validate and sanitize payment method to match Prisma PaymentMethod enum: COD, UPI, CARD, NETBANKING, WALLET
    const rawMethod = (paymentMethod || 'COD').toString().toUpperCase().trim();
    let validPaymentMethod = 'COD';
    if (['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET'].includes(rawMethod)) {
      validPaymentMethod = rawMethod;
    } else if (rawMethod === 'ONLINE' || rawMethod === 'RAZORPAY') {
      validPaymentMethod = 'UPI';
    } else {
      validPaymentMethod = 'COD';
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    let parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;

    const incomingEmail = (req.body.customerEmail || req.headers['x-user-email'] || req.user?.email || parsedShippingAddress?.email || '').trim().toLowerCase();
    const incomingPhone = (parsedShippingAddress?.phone || parsedShippingAddress?.mobileNumber || req.headers['x-user-phone'] || '').trim();

    // If userId is unauthenticated/guest or customer_..., automatically link to real profile if email/phone matches
    if (!req.user?.id || userId.startsWith('guest_') || userId.startsWith('customer_')) {
      if (incomingEmail && incomingEmail.includes('@') && !incomingEmail.endsWith('@customer.meesho')) {
        const existingUser = await prisma.profile.findFirst({
          where: { email: { equals: incomingEmail, mode: 'insensitive' } },
          orderBy: { createdAt: 'asc' }
        });
        if (existingUser) {
          userId = existingUser.id;
        }
      } else if (incomingPhone && incomingPhone.length === 10) {
        const existingUser = await prisma.profile.findFirst({
          where: { phone: incomingPhone },
          orderBy: { createdAt: 'asc' }
        });
        if (existingUser) {
          userId = existingUser.id;
        }
      }
    }

    await ensureProfile(userId, incomingEmail, parsedShippingAddress?.name, incomingPhone);

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
        pincode,
        ...(incomingEmail && incomingEmail.includes('@') ? { email: incomingEmail } : {})
      };

      const profileUpdates = {};
      if (name) profileUpdates.fullName = name;
      if (incomingEmail && incomingEmail.includes('@') && !incomingEmail.endsWith('@customer.meesho')) {
        profileUpdates.email = incomingEmail.toLowerCase();
      }
      if (Object.keys(profileUpdates).length > 0) {
        await prisma.profile.update({
          where: { id: userId },
          data: profileUpdates
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

      if (product.isDeleted || product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" has been deleted or discontinued by the supplier and cannot be ordered.`
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

    const allowedPaymentMethods = ['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET'];
    const normalizedMethod = String(paymentMethod || 'COD').toUpperCase().trim();
    const validPaymentMethod = allowedPaymentMethods.includes(normalizedMethod) ? normalizedMethod : 'COD';

    // Atomic transaction: Decrement stock, create order, clear user cart with extended timeout for cloud DB
    const order = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory for each product in parallel
      await Promise.all(
        validatedItems.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        )
      );

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
              size: item.size,
              itemStatus: 'ORDERED'
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: true
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
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    // 5. Affiliate Referral Attribution & Real Database Custom Margin Credit
    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      try {
        const cleanRef = referralCode.trim().toUpperCase();

        // Calculate exact custom profit margin set by the affiliate for items in this order
        const calculatedMargin = validatedItems.reduce((acc, it) => {
          const baseP = parseFloat(productMap.get(it.productId)?.price || 0);
          const diff = Math.max(0, it.price - baseP);
          return acc + (diff * it.quantity);
        }, 0);

        const directMargin = parseFloat(req.body.marginAmount) || 0;
        const commissionAmount = Math.round(Math.max(calculatedMargin, directMargin));

        // Find the referrer or affiliate partner profile
        const cleanSuffix = cleanRef.replace(/^(MSHOPPY|AFF-)/, '');
        let affiliateProfile = await prisma.profile.findFirst({
          where: {
            OR: [
              { storeName: cleanRef },
              { id: cleanRef },
              ...(cleanSuffix.length >= 3 ? [{ email: { startsWith: cleanSuffix.toLowerCase() } }] : []),
              ...(cleanSuffix.length >= 4 ? [{ phone: { endsWith: cleanSuffix } }] : [])
            ]
          },
          include: { wallet: true }
        });

        if (affiliateProfile && affiliateProfile.id !== userId) {
          // Record or link referral in PostgreSQL referrals table for Invite & Earn
          const existingRef = await prisma.referral.findFirst({
            where: {
              referrerId: affiliateProfile.id,
              referredId: userId
            }
          });

          if (!existingRef) {
            await prisma.referral.create({
              data: {
                referrerId: affiliateProfile.id,
                referredId: userId,
                code: cleanRef,
                rewardAmount: commissionAmount > 0 ? commissionAmount : 0,
                isRedeemed: true
              }
            }).catch(e => console.warn('Referral creation note:', e.message));
          }

          // If there is custom reseller margin commission, credit to wallet immediately
          if (commissionAmount > 0) {
            let wallet = affiliateProfile.wallet;
            if (!wallet) {
              wallet = await prisma.wallet.create({
                data: {
                  userId: affiliateProfile.id,
                  balance: 0,
                  pending: 0
                }
              });
            }

            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: { increment: commissionAmount }
              }
            });

            await prisma.walletTransaction.create({
              data: {
                walletId: wallet.id,
                amount: commissionAmount,
                type: 'credit',
                description: `Affiliate Custom Margin for Order #${order.id.slice(-6).toUpperCase()}`,
                orderId: order.id
              }
            });

            console.log(`[Affiliate] Credited ₹${commissionAmount} custom margin to ${affiliateProfile.email || affiliateProfile.fullName} for Order ${order.id}`);
          }
        }
      } catch (affiliateErr) {
        console.warn('Affiliate custom margin credit note:', affiliateErr.message);
      }
    }

    // 6. Asynchronously dispatch branded Order Confirmation Email to the customer
    let recipientEmail = incomingEmail;
    if (!recipientEmail || recipientEmail.endsWith('@customer.meesho')) {
      recipientEmail = order?.user?.email || (typeof parsedShippingAddress === 'object' ? parsedShippingAddress?.email : null);
    }
    const recipientName = (typeof parsedShippingAddress === 'object' ? parsedShippingAddress?.name : null) || order?.user?.fullName || 'Valued Customer';

    const origin = req.headers['origin'] || req.headers['referer'] || '';
    const clientBase = (origin.includes('vercel.app') || !origin.includes('localhost'))
      ? 'https://meesho-clone-nu.vercel.app'
      : (origin ? origin.replace(/\/+$/, '') : 'https://meesho-clone-nu.vercel.app');
    const trackingUrl = `${clientBase}/user-dashboard1?tab=orders${order?.id ? `&orderId=${order.id}` : ''}`;

    // 6. Await dispatch of branded Order Confirmation Email so Vercel Serverless doesn't terminate before SMTP completes
    try {
      const emailResult = await sendOrderConfirmationEmail({
        order,
        email: recipientEmail || undefined,
        name: recipientName || undefined,
        trackingUrl
      });
      console.log('📧 Order confirmation dispatch outcome:', emailResult);
    } catch (emailErr) {
      console.warn('⚠️ Order confirmation email non-fatal notice:', emailErr.message);
    }

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
    let userId = getUserId(req);
    await ensureProfile(userId);

    const userIds = [userId];
    const profile = await prisma.profile.findUnique({ where: { id: userId } });

    // Link orders across matching email or phone so customer never loses visibility
    if (profile?.email && !profile.email.endsWith('@customer.meesho')) {
      const peers = await prisma.profile.findMany({
        where: { email: { equals: profile.email, mode: 'insensitive' } },
        select: { id: true }
      });
      peers.forEach(p => { if (!userIds.includes(p.id)) userIds.push(p.id); });
    }
    if (profile?.phone) {
      const peers = await prisma.profile.findMany({
        where: { phone: profile.phone },
        select: { id: true }
      });
      peers.forEach(p => { if (!userIds.includes(p.id)) userIds.push(p.id); });
    }

    const orders = await prisma.order.findMany({
      where: { userId: { in: userIds } },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        returnRequest: true
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
        },
        returnRequest: true
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

    // Mark all items as CANCELLED
    await prisma.orderItem.updateMany({
      where: { orderId: id },
      data: { itemStatus: 'CANCELLED' }
    }).catch(() => {});

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

    // Auto-dispatch confirmation email if status is updated to CONFIRMED
    if (upperStatus === 'CONFIRMED') {
      const origin = req.headers['origin'] || req.headers['referer'] || '';
      const clientBase = (origin.includes('vercel.app') || !origin.includes('localhost'))
        ? 'https://meesho-clone-nu.vercel.app'
        : (origin ? origin.replace(/\/+$/, '') : 'https://meesho-clone-nu.vercel.app');
      const trackingUrl = `${clientBase}/user-dashboard1?tab=orders${updated?.id ? `&orderId=${updated.id}` : ''}`;
      try {
        await Promise.race([
          sendOrderConfirmationEmail({ order: updated, trackingUrl }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Email dispatch timeout (6s)')), 6000))
        ]);
      } catch (err) {
        console.warn(`⚠️ [Order ${id}] CONFIRMED status email dispatch notice:`, err.message);
      }
    }

    // Auto-dispatch dispatch alert email if status is updated to SHIPPED
    if (upperStatus === 'SHIPPED') {
      sendOrderDispatchedEmail({ order: updated })
        .then((res) => console.log(`📦 [Order ${id}] Automated SHIPPED email sent to: ${res.sentTo} (AWB: ${res.awb})`))
        .catch((err) => console.warn(`⚠️ [Order ${id}] Automated SHIPPED email error:`, err.message));
    }

    // Auto-dispatch universal delivery verification OTP email if status is updated to OUT_FOR_DELIVERY
    if (upperStatus === 'OUT_FOR_DELIVERY') {
      sendOrderOutForDeliveryEmail({ order: updated })
        .then((res) => console.log(`🚚 [Order ${id}] Automated OUT_FOR_DELIVERY OTP email sent to: ${res.sentTo} (OTP: ${res.otp})`))
        .catch((err) => console.warn(`⚠️ [Order ${id}] Automated OUT_FOR_DELIVERY OTP email error:`, err.message));
    }

    // Auto-credit ₹123 referral cashback to the referrer if this is the friend's 1st delivered order!
    if (upperStatus === 'DELIVERED') {
      try {
        const referral = await prisma.referral.findFirst({
          where: {
            referredId: updated.userId
          },
          include: { referrer: { include: { wallet: true } } }
        });

        if (referral) {
          let referrerWallet = referral.referrer?.wallet;
          if (!referrerWallet) {
            referrerWallet = await prisma.wallet.create({
              data: { userId: referral.referrerId, balance: 0, pending: 0 }
            });
          }

          const alreadyCredited = referrerWallet?.id ? await prisma.walletTransaction.findFirst({
            where: {
              walletId: referrerWallet.id,
              description: { contains: 'Refer & Earn' }
            }
          }) : null;

          if (!alreadyCredited) {
            await prisma.wallet.update({
              where: { id: referrerWallet.id },
              data: { balance: { increment: 123 } }
            });

            await prisma.walletTransaction.create({
              data: {
                walletId: referrerWallet.id,
                amount: 123,
                type: 'credit',
                description: `Refer & Earn: ₹123 credited! Friend's 1st order was delivered!`,
                orderId: updated.id
              }
            });

            await prisma.referral.update({
              where: { id: referral.id },
              data: { rewardAmount: (referral.rewardAmount || 0) + 123, isRedeemed: true }
            });

            console.log(`🎁 [Referral Reward] Credited ₹123 cash into referrer ${referral.referrerId}'s wallet!`);
          }
        }
      } catch (refErr) {
        console.warn('Referral reward processing note:', refErr.message);
      }
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

  // Only send to valid real customer email address
  if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
    if (email && !email.endsWith('@customer.meesho')) {
      targetEmail = email;
    } else {
      return {
        success: false,
        message: 'No valid customer email address available for OTP delivery.',
        sentTo: null,
        otp: null
      };
    }
  }

  const isPickup = (type || '').toUpperCase().includes('PICKUP') || (type || '').toUpperCase().includes('RETURN');

  // Strict enforcement: RETURN PICKUP OTP is only sent if slot is TODAY or driver has arrived
  if (isPickup && slotLabel && !slotLabel.toLowerCase().includes('today')) {
    console.log(`ℹ️ [OTP Email] Skipping RETURN OTP for Order ${orderId}: scheduled for "${slotLabel}" (OTP is only sent on pickup day).`);
    return {
      success: false,
      message: `Return pickup OTP email is only dispatched on scheduled pickup day (current: ${slotLabel}).`,
      sentTo: null,
      otp: null
    };
  }

  // Universal Delivery Verification OTP: Applicable for BOTH Prepaid and COD orders!
  if (!isPickup) {
    return await sendOrderOutForDeliveryEmail({
      order: orderDetails,
      orderId,
      otp: finalOtp,
      customEmail: targetEmail,
      recipientName: targetName,
      slotLabel
    });
  }

  console.log(`📨 [OTP Email] Sending ${type} OTP (${finalOtp}) to login email: ${targetEmail}`);
  const subject = `🚚 Mshoppy Return Pickup Alert: Rider arriving for pickup (OTP: ${finalOtp})`;

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

/**
 * Manual Admin / Operational trigger: Resend Order Dispatched (SHIPPED) Email
 * POST /api/orders/:id/resend-dispatch-email
 */
export const resendDispatchEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { customEmail, courierPartner, trackingNumber, trackingUrl, recipientName } = req.body;

    const result = await sendOrderDispatchedEmail({
      orderId: id,
      courierPartner,
      trackingNumber,
      trackingUrl,
      customEmail,
      recipientName
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: `Dispatch alert email successfully sent to ${result.sentTo}`,
      data: result
    });
  } catch (error) {
    console.error('Error resending dispatch email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend dispatch email',
      error: error.message
    });
  }
};

/**
 * Manual Admin / Operational trigger: Resend Out for Delivery OTP Email
 * POST /api/orders/:id/resend-delivery-otp
 */
export const resendDeliveryOtpEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { customEmail, otp, recipientName, slotLabel } = req.body;

    const result = await sendOrderOutForDeliveryEmail({
      orderId: id,
      otp,
      customEmail,
      recipientName,
      slotLabel
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: `Delivery OTP email successfully sent to ${result.sentTo} (OTP: ${result.otp})`,
      data: result
    });
  } catch (error) {
    console.error('Error resending delivery OTP email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend delivery OTP email',
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
    // Disallow local browser blob: URLs as they cannot be viewed across sessions/devices
    const cleanImages = Array.isArray(images)
      ? images
          .map((img) => {
            if (typeof img === 'string') return img.trim();
            if (img && typeof img === 'object') return (img.url || img.remoteUrl || img.name || '').trim();
            return '';
          })
          .filter((img) => img && !img.startsWith('blob:'))
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

