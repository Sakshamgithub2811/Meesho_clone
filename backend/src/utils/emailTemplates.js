import transporter from '../config/emailTransporter.js';
import prisma from '../config/prisma.js';

/**
 * Generate high-conversion, professional Meesho-themed HTML email template
 */
export const getVerificationEmailHtml = ({ name, verificationLink }) => {
  const safeName = name && name.trim() ? name.trim() : 'Valued Shopper';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your MShoppy Account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fff4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 560px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(183, 0, 77, 0.08);
      border: 1px solid #ffe2e8;
    }
    .header-banner {
      background: linear-gradient(135deg, #9f0038 0%, #b7004d 50%, #ff7293 100%);
      padding: 38px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 18px;
      border-radius: 50px;
      backdrop-filter: blur(10px);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .brand-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .brand-tagline {
      font-size: 13px;
      font-weight: 500;
      margin-top: 6px;
      opacity: 0.95;
    }
    .content-box {
      padding: 38px 36px;
      color: #334155;
    }
    .greeting {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 14px 0;
    }
    .message-text {
      font-size: 14.5px;
      line-height: 1.65;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .verify-btn {
      display: inline-block;
      background: linear-gradient(135deg, #b7004d 0%, #ff527b 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.3px;
      box-shadow: 0 8px 24px rgba(183, 0, 77, 0.35);
    }
    .perks-grid {
      background: #fff8f9;
      border: 1px dashed #ffb8c9;
      border-radius: 16px;
      padding: 18px 20px;
      margin: 28px 0;
    }
    .perks-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: #b7004d;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .perk-item {
      font-size: 13px;
      color: #475569;
      margin: 6px 0;
      display: flex;
      align-items: center;
    }
    .security-note {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 12px;
      border-left: 3px solid #cbd5e1;
    }
    .footer {
      background: #fafafa;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      font-size: 11.5px;
      color: #94a3b8;
    }
    .footer a {
      color: #b7004d;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="logo-badge">Official Verification</div>
      <h1 class="brand-title">MSHOPPY</h1>
      <div class="brand-tagline">India's Leading Social Commerce Marketplace</div>
    </div>

    <div class="content-box">
      <h2 class="greeting">Hello ${safeName}, 🎉</h2>
      <p class="message-text">
        Welcome to <strong>MShoppy</strong>! We are delighted to have you join our shopping community.
      </p>
      <p class="message-text">
        To activate your account and start exploring wholesale prices, trending fashion, and exclusive affiliate deals, please confirm your email address:
      </p>

      <div class="cta-container">
        <a href="${verificationLink}" class="verify-btn" target="_blank">
          ✓ Verify My Account
        </a>
      </div>

      <div class="perks-grid">
        <div class="perks-title">What awaits you on MShoppy:</div>
        <div class="perk-item">🛍️ Lowest Wholesale Prices on Trending Catalogues</div>
        <div class="perk-item">🚚 Free Delivery & Cash on Delivery Available</div>
        <div class="perk-item">💸 Resell Products & Earn Real Profit Margins</div>
      </div>

      <div class="security-note">
        <strong>🔒 Security Notice:</strong> This verification link is valid for 24 hours. If you did not create an account on MShoppy, you can safely disregard this email.
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #475569;">
        MShoppy Internet Commerce Private Limited
      </p>
      <p style="margin: 0 0 10px 0;">
        100% Secure Shopping • Guaranteed Quality • 7-Day Easy Returns
      </p>
      <p style="margin: 0; font-size: 10.5px;">
        Need assistance? Contact our 24x7 Help Desk in the MShoppy App.
      </p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send branded verification email via configured SMTP
 */
export const sendVerificationEmail = async ({ email, name, verificationLink }) => {
  try {
    const html = getVerificationEmailHtml({ name, verificationLink });
    const sender = process.env.EMAIL_FROM || `"MShoppy Support" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Verify your MShoppy Account (Activation Required)',
      html: html,
    });

    console.log(`✅ Branded verification email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Error sending verification email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Generate high-conversion, professional Meesho-themed Login OTP email
 */
export const getLoginOtpEmailHtml = ({ name, otp }) => {
  const safeName = name && name.trim() ? name.trim() : 'Valued Shopper';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your MShoppy Login OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fff4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 560px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(183, 0, 77, 0.08);
      border: 1px solid #ffe2e8;
    }
    .header-banner {
      background: linear-gradient(135deg, #9f0038 0%, #b7004d 50%, #ff7293 100%);
      padding: 34px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 18px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .brand-title {
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .content-box {
      padding: 34px 32px;
      color: #334155;
    }
    .greeting {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .message-text {
      font-size: 14.5px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 18px 0;
    }
    .otp-box {
      background: #fff0f3;
      border: 2px dashed #b7004d;
      border-radius: 18px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #b7004d;
      font-family: monospace;
      margin: 0;
    }
    .otp-expiry {
      font-size: 12px;
      color: #9f0038;
      font-weight: 700;
      margin-top: 8px;
    }
    .security-note {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 12px;
      border-left: 3px solid #cbd5e1;
      margin-top: 20px;
    }
    .footer {
      background: #fafafa;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      font-size: 11.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="logo-badge">Login Security</div>
      <h1 class="brand-title">MSHOPPY</h1>
    </div>

    <div class="content-box">
      <h2 class="greeting">Hello ${safeName}, 👋</h2>
      <p class="message-text">
        We detected a sign-in attempt to your MShoppy account. Please use the following 6-digit One-Time Password (OTP) to authenticate and continue:
      </p>

      <div class="otp-box">
        <p class="otp-code">${otp}</p>
        <p class="otp-expiry">⏱️ Valid for 10 minutes</p>
      </div>

      <div class="security-note">
        <strong>🔒 Security Notice:</strong> Never share this OTP with anyone. MShoppy customer service will never ask for your one-time password. If you didn't initiate this login, please secure your password immediately.
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0; font-weight: 600;">© 2026 MShoppy Internet Commerce. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send branded Login OTP email via configured SMTP
 */
export const sendLoginOtpEmail = async ({ email, name, otp }) => {
  try {
    const html = getLoginOtpEmailHtml({ name, otp });
    const sender = process.env.EMAIL_FROM || `"MShoppy Security" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: email,
      subject: `Your MShoppy Login OTP: ${otp}`,
      html: html,
    });

    console.log(`✅ Branded Login OTP email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Error sending login OTP email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Resolves an email-safe, globally CDN-cached image URL for all email templates.
 * Bypasses Supabase's 'x-robots-tag: none' header by routing through wsrv.nl (Cloudflare edge)
 * which strips robots restrictions, converts to clean 140x140 JPEG, and allows Google Image Proxy
 * to crawl and cache seamlessly without requiring heavy/suspicious MIME attachments.
 */
export const getEmailSafeImageUrl = (rawUrl) => {
  const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80';
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return fallback;
  }
  const url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return fallback;
  }

  // Already safe public CDN
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // Route Supabase or custom storage URLs through wsrv.nl
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=140&h=140&fit=cover&output=jpg&q=85`;
};

/**
 * Generate high-conversion, professional Meesho/MShoppy Order Confirmation HTML Email
 */
export const getOrderConfirmationEmailHtml = ({ order, name, trackingUrl }) => {
  const safeName = name && name.trim() ? name.trim() : 'Valued Customer';
  const orderId = order?.id || 'ORD-' + Date.now();
  const shortId = orderId.slice(0, 10).toUpperCase();
  const totalAmount = Number(order?.totalAmount || 0).toLocaleString('en-IN');
  const paymentMethod = order?.paymentMethod || 'COD';
  const paymentStatus = order?.paymentStatus || (paymentMethod === 'COD' ? 'Pay on Delivery' : 'PAID');

  let address = order?.shippingAddress;
  if (typeof address === 'string') {
    try { address = JSON.parse(address); } catch (e) {}
  }
  const addressDetails = address?.details || `${address?.addressLine || ''}, ${address?.city || ''}, ${address?.state || ''}`.replace(/^[\s,]+|[\s,]+$/g, '');
  const recipientName = address?.name || safeName;
  const phone = address?.phone || '';
  const pincode = address?.pincode || '';

  const items = Array.isArray(order?.items) ? order.items : [];
  const itemsHtml = items.map((it) => {
    const product = it.product || {};
    const title = product.title || 'Item in Order';
    const rawImage = (Array.isArray(product.images) && product.images[0]) || product.image || '';
    const image = getEmailSafeImageUrl(rawImage);

    const price = Number(it.price || product.price || 0).toLocaleString('en-IN');
    const qty = it.quantity || 1;
    const size = it.size || 'Free Size';

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 64px;">
          <img src="${image}" alt="${title}" width="56" height="56" border="0" style="display: block; width: 56px; height: 56px; max-width: 56px; max-height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #ffe2e8; outline: none; text-decoration: none;"/>
        </td>
        <td style="padding: 12px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
          <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 4px;">
            ${title}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            Size: <strong style="color: #334155;">${size}</strong> &bull; Qty: <strong style="color: #334155;">${qty}</strong>
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; text-align: right; white-space: nowrap;">
          <div style="font-size: 14px; font-weight: 800; color: #9f0038;">
            ₹${price}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Construct precise live tracking URL
  let appUrl = trackingUrl;
  if (!appUrl) {
    const rawFrontend = process.env.FRONTEND_URL || '';
    const base = (rawFrontend && !rawFrontend.includes('localhost'))
      ? rawFrontend.replace(/\/+$/, '')
      : 'https://meesho-clone-nu.vercel.app';
    appUrl = `${base}/user-dashboard1?tab=orders${order?.id ? `&orderId=${order.id}` : ''}`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - #${shortId}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fff4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body style="background-color: #fff4f6; margin: 0; padding: 20px 10px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(183, 0, 77, 0.08); border: 1px solid #ffe2e8;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #9f0038 0%, #b7004d 50%, #ff527b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 5px 16px; border-radius: 50px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.3);">
        Order Placed Successfully
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">MSHOPPY</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95; font-weight: 600;">
        Thank you for shopping with us! 🎉
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px; color: #334155;">
      
      <!-- Greeting & Overview Card -->
      <div style="background: #fdf2f4; border: 1px solid #fbcfe8; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
          Hello ${safeName}, 👋
        </h2>
        <p style="font-size: 13.5px; color: #475569; margin: 0; line-height: 1.5;">
          Your order has been confirmed and is being processed by our verified suppliers. Here are your order details:
        </p>
      </div>

      <!-- Order Meta Info -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Order ID:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #0f172a; font-family: monospace;">#${shortId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Order Date:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #334155;">${orderDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Mode:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 800; color: ${paymentMethod === 'COD' ? '#d97706' : '#16a34a'};">
            ${paymentMethod} (${paymentStatus})
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Estimated Delivery:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #b7004d;">3 - 5 Business Days</td>
        </tr>
      </table>

      <!-- Items Section -->
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          Items in this order (${items.length})
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
      </div>

      <!-- Total Amount Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13.5px;">
          <tr>
            <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Delivery Fee:</td>
            <td style="text-align: right; color: #16a34a; font-weight: 800; padding: 4px 0;">FREE</td>
          </tr>
          <tr>
            <td style="color: #0f172a; font-weight: 800; font-size: 16px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">Total Payable:</td>
            <td style="text-align: right; color: #9f0038; font-weight: 900; font-size: 18px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">₹${totalAmount}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px;">
          📍 Delivery Address
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${recipientName} ${phone ? `• ${phone}` : ''}</div>
        <div style="font-size: 13px; color: #475569; margin-top: 4px; line-height: 1.4;">
          ${addressDetails} ${pincode ? `- ${pincode}` : ''}
        </div>
      </div>

      <!-- Track Button CTA -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #b7004d 0%, #ff527b 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 14px; font-weight: 800; letter-spacing: 0.3px; box-shadow: 0 6px 18px rgba(183, 0, 77, 0.35);">
          Track Your Order &rarr;
        </a>
      </div>

      <p style="font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">
        You will receive another update when your order is packed and dispatched.
      </p>

    </div>

    <!-- Footer -->
    <div style="background: #fafafa; padding: 18px 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0; font-weight: 600;">© 2026 MShoppy Internet Commerce. All rights reserved.</p>
      <p style="margin: 0;">Need help? Reply to this email or visit our Help Center.</p>
    </div>

  </div>
</body>
</html>`;
};

/**
 * Resolves customer email and recipient name cleanly from order data
 */
export const resolveCustomerEmailAndName = async (order, customEmail, customName) => {
  let targetEmail = customEmail || '';
  let targetName = customName || '';

  // 1. Order User email
  if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
    if (order?.user?.email && !order.user.email.endsWith('@customer.meesho')) {
      targetEmail = order.user.email;
    }
    if (order?.user?.fullName && !targetName) {
      targetName = order.user.fullName;
    }
  }

  // 2. Shipping Address email
  if ((!targetEmail || targetEmail.endsWith('@customer.meesho')) && order?.shippingAddress) {
    try {
      const addr = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
      if (addr?.email && !addr.email.endsWith('@customer.meesho')) targetEmail = addr.email;
      if (addr?.name && !targetName) targetName = addr.name;
    } catch (_) {}
  }

  // 3. Fallback to querying profile directly from database
  if ((!targetEmail || targetEmail.endsWith('@customer.meesho')) && order?.userId) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: order.userId },
        select: { email: true, fullName: true }
      });
      if (profile?.email && !profile.email.endsWith('@customer.meesho')) {
        targetEmail = profile.email;
      }
      if (profile?.fullName && !targetName) {
        targetName = profile.fullName;
      }
    } catch (e) {
      console.warn('Error retrieving profile for order email resolution:', e.message);
    }
  }

  // 4. Decode customer_..._gmail_com format if present
  if (targetEmail && targetEmail.includes('@customer.meesho')) {
    const match = targetEmail.match(/customer_(.+)@customer\.meesho/);
    if (match && match[1]?.endsWith('_gmail_com')) {
      targetEmail = match[1].replace(/_gmail_com$/, '@gmail.com');
    }
  }

  // 5. Fallback to configured SMTP user for local development if still missing
  if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
    targetEmail = process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com';
  }

  return {
    targetEmail,
    targetName: targetName || 'Valued Customer'
  };
};

/**
 * Send branded Order Confirmation email via configured SMTP
 */
export const sendOrderConfirmationEmail = async ({ order, email, name, trackingUrl }) => {
  try {
    let orderData = order;
    if (orderData?.id && (!orderData.items || !orderData.items[0]?.product)) {
      const full = await prisma.order.findUnique({
        where: { id: orderData.id },
        include: { items: { include: { product: true } }, user: true }
      });
      if (full) orderData = full;
    }

    const { targetEmail, targetName } = await resolveCustomerEmailAndName(orderData, email, name);

    const html = getOrderConfirmationEmailHtml({
      order: orderData,
      name: targetName || orderData?.user?.fullName || 'Valued Customer',
      trackingUrl,
    });

    const shortId = (orderData?.id || '').slice(0, 10).toUpperCase();
    const sender = process.env.EMAIL_FROM || `"MShoppy Orders" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject: `🎉 Order Confirmed! Your MShoppy Order #${shortId} is Placed`,
      html,
    });

    console.log(`✅ [Automated] Order confirmation email sent to ${targetEmail} for Order #${orderData?.id} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, sentTo: targetEmail };
  } catch (err) {
    console.error('❌ Error sending order confirmation email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Universal tracking URL generator for major Indian logistics providers
 */
export const getCourierTrackingUrl = (courier = '', awb = '') => {
  if (!awb) return '';
  const c = String(courier || '').toLowerCase();
  const cleanAwb = String(awb).trim();

  if (c.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${cleanAwb}`;
  }
  if (c.includes('blue') || c.includes('bluedart')) {
    return `https://www.bluedart.com/tracking?trackNumber=${cleanAwb}`;
  }
  if (c.includes('shadowfax')) {
    return `https://tracker.shadowfax.in/#/track?awb=${cleanAwb}`;
  }
  if (c.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/tracking_results.asp?trType=awb_no&strAwbNo=${cleanAwb}`;
  }
  if (c.includes('xpress') || c.includes('xpressbees')) {
    return `https://www.xpressbees.com/track?awb=${cleanAwb}`;
  }
  if (c.includes('ekart')) {
    return `https://ekartlogistics.com/shipmenttrack/${cleanAwb}`;
  }
  if (c.includes('speed') || c.includes('post') || c.includes('india post')) {
    return 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
  }
  return '';
};

/**
 * Deterministic 4-digit OTP generator for orders
 */
export const generateOrderDeliveryOtp = (orderId, type = 'DELIVERY') => {
  if (!orderId) return Math.floor(1000 + Math.random() * 9000);
  const isPickup = (type || '').toUpperCase().includes('PICKUP') || (type || '').toUpperCase().includes('RETURN');
  const multiplier = isPickup ? 41 : 33;
  const seed = String(orderId).split('').reduce((acc, char) => (acc * multiplier + char.charCodeAt(0)) % 9000, 1000);
  return Math.abs(seed) + 1000;
};

/**
 * Branded Order Dispatched (SHIPPED) HTML Email Template
 */
export const getOrderDispatchedEmailHtml = ({
  order,
  courierPartner,
  trackingNumber,
  trackingUrl,
  customerName
}) => {
  const shortId = (order?.id || '').slice(0, 10).toUpperCase();
  const name = customerName || 'Valued Customer';
  const courier = courierPartner || 'Delhivery Express';
  const awb = trackingNumber || `AWB-${(order?.id || '0000').slice(0, 8).toUpperCase()}`;
  const totalAmount = order?.totalAmount ? Number(order.totalAmount).toLocaleString('en-IN') : '0';
  const paymentMethod = (order?.paymentMethod || 'PREPAID').toUpperCase();

  const appUrl = trackingUrl || getCourierTrackingUrl(courier, awb) || 'https://meesho-clone-nu.vercel.app/user-dashboard1?tab=orders';

  let shipping = {};
  try {
    shipping = typeof order?.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : (order?.shippingAddress || {});
  } catch (_) {
    shipping = {};
  }

  const recipientName = shipping.name || name;
  const addressDetails = shipping.details || shipping.addressLine || 'Your registered delivery address';
  const pincode = shipping.pincode || '';
  const phone = shipping.phone || '';

  const items = order?.items || [];
  const itemsHtml = items.map((item) => {
    const product = item.product || {};
    const rawUrl = (Array.isArray(product.images) && product.images[0]) || product.image || '';
    const imgUrl = getEmailSafeImageUrl(rawUrl);
    const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 64px;">
          <img src="${imgUrl}" alt="${product.title || 'Product'}" width="54" height="54" style="border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; display: block;" />
        </td>
        <td style="padding: 12px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
          <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-bottom: 3px; line-height: 1.3;">
            ${product.title || 'MShoppy Purchase Item'}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            Qty: <strong style="color: #334155;">${item.quantity || 1}</strong>
            ${item.size ? ` &bull; Size: <span style="background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-weight: 600;">${item.size}</span>` : ''}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; text-align: right; font-weight: 800; font-size: 13.5px; color: #0f172a; white-space: nowrap;">
          ₹${itemTotal.toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Dispatched - MShoppy</title>
  <style>
    body { margin: 0; padding: 0; background-color: #fff4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(183, 0, 77, 0.08); border: 1px solid #ffe2e8; }
    .header-banner { background: linear-gradient(135deg, #9f0038 0%, #b7004d 50%, #ff7293 100%); padding: 34px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.22); padding: 5px 16px; border-radius: 50px; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.35); }
    .title { font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; color: #334155; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #b7004d 0%, #ff527b 100%); color: #ffffff !important; text-decoration: none; padding: 14px 38px; border-radius: 50px; font-size: 14.5px; font-weight: 800; letter-spacing: 0.3px; box-shadow: 0 8px 24px rgba(183, 0, 77, 0.35); }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="badge">📦 DISPATCH NOTIFICATION</div>
      <h1 class="title">Your Order is On Its Way!</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.92;">Packed with care & handed over to our courier partner</p>
    </div>

    <div class="content">
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
        Hello ${name},
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        Great news! Your MShoppy order <strong>#${shortId}</strong> has been dispatched. Our delivery partner is transporting your package safely to your address.
      </p>

      <!-- Logistics Partner & Tracking Card -->
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 16px; padding: 20px; margin: 22px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 1px;">
                🚚 Courier Partner
              </div>
              <div style="font-size: 17px; font-weight: 800; color: #14532d; margin-top: 2px;">
                ${courier}
              </div>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 1px;">
                Tracking / AWB No.
              </div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: monospace; margin-top: 2px; letter-spacing: 0.5px;">
                ${awb}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Action CTA -->
      <div style="text-align: center; margin: 26px 0;">
        <a href="${appUrl}" target="_blank" class="cta-btn">
          Track Live Shipment &rarr;
        </a>
      </div>

      <!-- Order Details Summary -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px;">
          Order Summary (${items.length} ${items.length === 1 ? 'Item' : 'Items'})
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
        <table style="width: 100%; font-size: 13.5px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
          <tr>
            <td style="color: #64748b; font-weight: 600;">Payment Mode:</td>
            <td style="text-align: right; font-weight: 800; color: ${paymentMethod === 'COD' ? '#d97706' : '#16a34a'};">
              ${paymentMethod}
            </td>
          </tr>
          <tr>
            <td style="color: #0f172a; font-weight: 800; font-size: 15px; padding-top: 6px;">Total Amount:</td>
            <td style="text-align: right; color: #9f0038; font-weight: 900; font-size: 16px; padding-top: 6px;">₹${totalAmount}</td>
          </tr>
        </table>
      </div>

      <!-- Delivery Address -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 16px 18px; margin-bottom: 22px;">
        <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px;">
          📍 Delivery Destination
        </div>
        <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">${recipientName} ${phone ? `&bull; ${phone}` : ''}</div>
        <div style="font-size: 12.5px; color: #475569; margin-top: 4px; line-height: 1.4;">
          ${addressDetails} ${pincode ? `- ${pincode}` : ''}
        </div>
      </div>

      <!-- Security Advisory -->
      <div style="background: #fff8f9; border-left: 4px solid #b7004d; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5;">
        <strong style="color: #9f0038;">Security Notice:</strong>
        Please inspect the parcel exterior carefully upon arrival. If the tamper-proof security bag or seal is torn or broken, do not accept the package and notify us immediately.
      </div>

      <p style="font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 24px 0 0 0;">
        You will receive another update containing your <strong>Delivery Verification OTP</strong> as soon as the rider is out for delivery.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #fafafa; padding: 18px 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0; font-weight: 600;">&copy; 2026 MShoppy Internet Commerce. All rights reserved.</p>
      <p style="margin: 0;">Need help? Reply to this email or visit your MShoppy Help Center.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send branded Order Dispatched (SHIPPED) Email via SMTP
 */
export const sendOrderDispatchedEmail = async ({
  order,
  orderId,
  courierPartner,
  trackingNumber,
  trackingUrl,
  customEmail,
  recipientName
}) => {
  try {
    let orderData = order;
    const targetOrderId = orderData?.id || orderId;

    if (targetOrderId && (!orderData || !orderData.items || !orderData.items[0]?.product)) {
      orderData = await prisma.order.findUnique({
        where: { id: targetOrderId },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });
    }

    if (!orderData) {
      console.warn(`[Dispatch Email] Order #${targetOrderId} not found.`);
      return { success: false, message: `Order #${targetOrderId} not found.` };
    }

    const { targetEmail, targetName } = await resolveCustomerEmailAndName(
      orderData,
      customEmail,
      recipientName
    );

    if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
      console.warn(`[Dispatch Email] No valid recipient email for Order #${targetOrderId}`);
      return { success: false, message: 'No recipient email available for order dispatch alert' };
    }

    // Resolve logistics fields
    let shipping = {};
    try {
      shipping = typeof orderData.shippingAddress === 'string'
        ? JSON.parse(orderData.shippingAddress)
        : (orderData.shippingAddress || {});
    } catch (_) {}

    const resolvedCourier = courierPartner || shipping.courier || shipping.courierPartner || 'Delhivery Express';
    const resolvedAwb = trackingNumber || shipping.awb || shipping.trackingNumber || `AWB-${(targetOrderId || '').slice(0, 8).toUpperCase()}`;
    const resolvedTrackingUrl = trackingUrl || shipping.trackingUrl || getCourierTrackingUrl(resolvedCourier, resolvedAwb);

    const html = getOrderDispatchedEmailHtml({
      order: orderData,
      courierPartner: resolvedCourier,
      trackingNumber: resolvedAwb,
      trackingUrl: resolvedTrackingUrl,
      customerName: targetName
    });

    const shortId = (targetOrderId || '').slice(0, 10).toUpperCase();
    const sender = process.env.EMAIL_FROM || `"MShoppy Logistics" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject: `📦 Order Dispatched! Your MShoppy Order #${shortId} is on the way with ${resolvedCourier}`,
      html,
    });

    console.log(`✅ [Dispatch Email] Sent to ${targetEmail} for Order #${targetOrderId} (Courier: ${resolvedCourier}, AWB: ${resolvedAwb}, Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      sentTo: targetEmail,
      courier: resolvedCourier,
      awb: resolvedAwb,
      trackingUrl: resolvedTrackingUrl
    };
  } catch (err) {
    console.error('❌ Error sending order dispatched email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Branded Out for Delivery HTML Email Template (Universal OTP for Prepaid & COD)
 */
export const getOrderOutForDeliveryEmailHtml = ({
  order,
  otp,
  customerName
}) => {
  const shortId = (order?.id || '').slice(0, 10).toUpperCase();
  const name = customerName || 'Valued Customer';
  const totalAmount = order?.totalAmount ? Number(order.totalAmount).toLocaleString('en-IN') : '0';
  const paymentMethod = (order?.paymentMethod || 'COD').toUpperCase();
  const isCod = paymentMethod === 'COD';

  let shipping = {};
  try {
    shipping = typeof order?.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : (order?.shippingAddress || {});
  } catch (_) {
    shipping = {};
  }

  const recipientName = shipping.name || name;
  const addressDetails = shipping.details || shipping.addressLine || 'Your registered delivery address';
  const pincode = shipping.pincode || '';
  const phone = shipping.phone || '';

  const items = order?.items || [];
  const primaryItem = items[0]?.product?.title || 'Catalog Purchase';
  const rawFirstImg = (Array.isArray(items[0]?.product?.images) && items[0]?.product?.images[0]) || items[0]?.product?.image || '';
  const primaryThumb = rawFirstImg ? getEmailSafeImageUrl(rawFirstImg) : null;
  const otherItemsCount = items.length > 1 ? items.length - 1 : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Out for Delivery - MShoppy</title>
  <style>
    body { margin: 0; padding: 0; background-color: #fff4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(183, 0, 77, 0.08); border: 1px solid #ffe2e8; }
    .header-banner { background: linear-gradient(135deg, #9f0038 0%, #b7004d 50%, #ff7293 100%); padding: 34px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.22); padding: 5px 16px; border-radius: 50px; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.35); }
    .title { font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; color: #334155; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <div class="badge">🚚 ARRIVING TODAY</div>
      <h1 class="title">Your Order is Out for Delivery!</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.92;">Our delivery partner is en route to your doorstep</p>
    </div>

    <div class="content">
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
        Hello ${name},
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        Your delivery executive is out for delivery with your MShoppy order <strong>#${shortId}</strong>. Please ensure someone is available at the delivery location.
      </p>

      <!-- Prominent 4-digit OTP Card (Applicable for both Prepaid and COD) -->
      <div style="background: #fff1f2; border: 2.5px dashed #fb7185; border-radius: 18px; padding: 24px 20px; text-align: center; margin: 22px 0;">
        <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #9f0038; letter-spacing: 1.5px; margin-bottom: 8px;">
          🔐 YOUR DOORSTEP VERIFICATION OTP
        </div>
        <div style="font-size: 46px; font-weight: 900; letter-spacing: 14px; color: #9f0038; font-family: 'SFMono-Regular', Consolas, Monaco, monospace; margin: 6px 0; padding-left: 14px;">
          ${otp}
        </div>
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">
          Valid for today's doorstep delivery handover
        </div>
      </div>

      <!-- Payment Alert Box: Distinct Instructions for COD vs PREPAID -->
      ${isCod ? `
      <!-- COD Payment Notice -->
      <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.5px;">
                💵 Mode: Cash On Delivery (COD)
              </div>
              <div style="font-size: 22px; font-weight: 900; color: #92400e; margin: 4px 0 6px 0;">
                Amount Due: ₹${totalAmount}
              </div>
              <div style="font-size: 12.5px; color: #78350f; line-height: 1.5;">
                Please keep exact cash of <strong>₹${totalAmount}</strong> ready. Hand over the cash and share the 4-digit OTP <strong>${otp}</strong> only after receiving the sealed parcel.
              </div>
            </td>
          </tr>
        </table>
      </div>
      ` : `
      <!-- Prepaid Payment Notice -->
      <div style="background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 0.5px;">
                💳 Mode: Prepaid Order (Paid Online)
              </div>
              <div style="font-size: 22px; font-weight: 900; color: #065f46; margin: 4px 0 6px 0;">
                Amount Due: ₹0 (No Cash Required)
              </div>
              <div style="font-size: 12.5px; color: #064e3b; line-height: 1.5;">
                This order is fully paid online. <strong>Do NOT pay any money or handling fee</strong> to the courier rider. Share OTP <strong>${otp}</strong> only after receiving the parcel.
              </div>
            </td>
          </tr>
        </table>
      </div>
      `}

      <!-- Package & Delivery Address Recap -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px; margin-bottom: 20px;">
        <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px;">
          📦 Package Details
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            ${primaryThumb ? `
            <td style="width: 52px; vertical-align: top; padding-right: 12px;">
              <img src="${primaryThumb}" alt="${primaryItem}" width="48" height="48" style="border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; display: block;" />
            </td>
            ` : ''}
            <td style="vertical-align: top;">
              <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">
                ${primaryItem} ${otherItemsCount > 0 ? `<span style="font-size: 12px; color: #64748b; font-weight: normal;">(+${otherItemsCount} more item${otherItemsCount > 1 ? 's' : ''})</span>` : ''}
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                <strong>Order ID:</strong> #${shortId} &bull; <strong>Delivery To:</strong> ${recipientName} (${addressDetails} ${pincode ? `- ${pincode}` : ''})
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Critical Security Notice -->
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #991b1b; line-height: 1.5;">
        <strong>🛡️ Critical Security Advice:</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 18px;">
          <li>Never share this OTP over phone call, SMS, or WhatsApp.</li>
          <li>Share OTP <strong>only face-to-face</strong> at your doorstep after package inspection.</li>
          <li>Never accept a package if the tamper-evident security tape is damaged.</li>
        </ul>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #fafafa; padding: 18px 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0; font-weight: 600;">&copy; 2026 MShoppy Internet Commerce. All rights reserved.</p>
      <p style="margin: 0;">Automated Security Notification &bull; Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send branded Out for Delivery Email via SMTP (Universal OTP for Prepaid & COD)
 */
export const sendOrderOutForDeliveryEmail = async ({
  order,
  orderId,
  otp,
  customEmail,
  recipientName,
  slotLabel
}) => {
  try {
    let orderData = order;
    const targetOrderId = orderData?.id || orderId;

    if (targetOrderId && (!orderData || !orderData.items || !orderData.items[0]?.product)) {
      orderData = await prisma.order.findUnique({
        where: { id: targetOrderId },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });
    }

    if (!orderData) {
      console.warn(`[Out For Delivery Email] Order #${targetOrderId} not found.`);
      return { success: false, message: `Order #${targetOrderId} not found.` };
    }

    const { targetEmail, targetName } = await resolveCustomerEmailAndName(
      orderData,
      customEmail,
      recipientName
    );

    if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
      console.warn(`[Out For Delivery Email] No valid recipient email for Order #${targetOrderId}`);
      return { success: false, message: 'No recipient email available for delivery OTP alert' };
    }

    const finalOtp = otp || generateOrderDeliveryOtp(targetOrderId, 'DELIVERY');

    const html = getOrderOutForDeliveryEmailHtml({
      order: orderData,
      otp: finalOtp,
      customerName: targetName
    });

    const shortId = (targetOrderId || '').slice(0, 10).toUpperCase();
    const sender = process.env.EMAIL_FROM || `"MShoppy Delivery" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject: `🚚 Out for Delivery! Your MShoppy Order #${shortId} is Arriving Today (OTP: ${finalOtp})`,
      html,
    });

    console.log(`✅ [Out For Delivery Email] Sent to ${targetEmail} for Order #${targetOrderId} (OTP: ${finalOtp}, Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      sentTo: targetEmail,
      otp: finalOtp
    };
  } catch (err) {
    console.error('❌ Error sending out for delivery OTP email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 4. Generate high-impact Order Delivered HTML email with Review CTA
 */
export const getOrderDeliveredEmailHtml = ({ order, customerName = 'Valued Customer', clientBase = 'https://meesho-clone-nu.vercel.app' }) => {
  const shortId = (order.id || '').slice(0, 10).toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0] || {};
  const firstProdId = firstItem.productId || firstItem.product?.id || '';
  const reviewUrl = `${clientBase}/write-review?productId=${firstProdId}&orderId=${order.id || ''}`;

  const itemRowsHtml = items.map((it) => {
    const prod = it.product || {};
    const imgUrl = getEmailSafeImageUrl(Array.isArray(prod.images) ? prod.images[0] : prod.image);
    const title = prod.title || it.title || 'Product';
    const qty = it.quantity || 1;
    const price = Number(it.price || prod.price || 0);

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="56" valign="top" style="padding-right: 12px;">
                <img src="${imgUrl}" alt="${title}" width="56" height="56" style="border-radius: 8px; object-fit: cover; display: block; background: #f8fafc;" />
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.4;">${title}</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">Qty: ${qty} • ₹${price.toLocaleString('en-IN')}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Delivered - MShoppy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Order Delivered</span>
      <h1 style="margin: 0; font-size: 26px; font-weight: 900;">Delivered Successfully! 🎉</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order #${shortId}</p>
    </div>
    <div style="padding: 28px 24px; color: #334155;">
      <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Hello ${customerName},</p>
      <p style="font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Great news! Your package for Order <strong>#${shortId}</strong> has been delivered. We hope you love your purchase!
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Items Delivered</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${itemRowsHtml}
        </table>
        <div style="padding-top: 12px; text-align: right; font-size: 13px; font-weight: 800; color: #0f172a;">
          Total Paid: ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')} (${order.paymentMethod || 'COD'})
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${reviewUrl}" style="display: inline-block; background: #b7004d; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 14px; font-weight: 800; box-shadow: 0 4px 14px rgba(183,0,77,0.3);">
          ★ Rate & Review Your Products
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 24px 0 0 0;">
        Need help or want to return/exchange? Visit your <a href="${clientBase}/user-dashboard1?tab=orders" style="color: #b7004d; font-weight: 700; text-decoration: none;">Order Dashboard</a> within 7 days.
      </p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Dispatch automated Order Delivered email
 */
export const sendOrderDeliveredEmail = async ({ order, orderId, customEmail, recipientName }) => {
  try {
    let orderData = order;
    const targetOrderId = orderData?.id || orderId;

    if (!orderData && targetOrderId) {
      orderData = await prisma.order.findUnique({
        where: { id: targetOrderId },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });
    }

    if (!orderData) {
      console.warn(`[Delivered Email] Order #${targetOrderId} not found.`);
      return { success: false, message: `Order #${targetOrderId} not found.` };
    }

    const { targetEmail, targetName } = await resolveCustomerEmailAndName(
      orderData,
      customEmail,
      recipientName
    );

    if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
      console.warn(`[Delivered Email] No valid recipient email for Order #${targetOrderId}`);
      return { success: false, message: 'No recipient email available for delivery notification' };
    }

    const html = getOrderDeliveredEmailHtml({
      order: orderData,
      customerName: targetName
    });

    const shortId = (targetOrderId || '').slice(0, 10).toUpperCase();
    const sender = process.env.EMAIL_FROM || `"MShoppy Orders" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject: `🎉 Order Delivered! Your MShoppy Order #${shortId} has arrived`,
      html,
    });

    console.log(`✅ [Delivered Email] Successfully sent to ${targetEmail} for Order #${targetOrderId} (Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      sentTo: targetEmail
    };
  } catch (err) {
    console.error('❌ Error sending order delivered email:', err.message);
    return { success: false, error: err.message };
  }
};




