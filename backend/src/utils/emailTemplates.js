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
    let rawImage = (Array.isArray(product.images) && product.images[0]) || product.image || 'https://images.meesho.com/images/products/placeholder.png';
    let image = typeof rawImage === 'string' ? rawImage.trim() : 'https://images.meesho.com/images/products/placeholder.png';
    // Ensure email-safe JPEG image formats (Google Image Proxy rejects WebP with .jpg extensions)
    image = image.replace(/f_webp,?/g, '').replace(/([?&])(?:format|fm)=webp/gi, '$1fm=jpg');

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
 * Send branded Order Confirmation email via configured SMTP
 */
export const sendOrderConfirmationEmail = async ({ order, email, name, trackingUrl }) => {
  try {
    let targetEmail = email;
    let targetName = name;

    // 1. Check passed email or order.user.email
    if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
      targetEmail = order?.user?.email;
    }

    // 2. Check shippingAddress
    if ((!targetEmail || targetEmail.endsWith('@customer.meesho')) && order?.shippingAddress) {
      try {
        const addr = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
        if (addr?.email && !addr.email.endsWith('@customer.meesho')) targetEmail = addr.email;
        if (addr?.name && !targetName) targetName = addr.name;
      } catch (e) {}
    }

    // 3. Fallback to querying profile directly from database using order.userId
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
        console.warn('Error retrieving profile for order email:', e.message);
      }
    }

    // 4. Decode if email was encoded in dummy customer_..._gmail_com format
    if (targetEmail && targetEmail.includes('@customer.meesho')) {
      const match = targetEmail.match(/customer_(.+)@customer\.meesho/);
      if (match && match[1]?.endsWith('_gmail_com')) {
        targetEmail = match[1].replace(/_gmail_com$/, '@gmail.com');
      }
    }

    if (!targetEmail || targetEmail.endsWith('@customer.meesho')) {
      console.warn(`[Order Confirmation Email] Skipping: No real customer email available for Order #${order?.id} (userId: ${order?.userId})`);
      return { success: false, message: 'No recipient email available' };
    }

    const html = getOrderConfirmationEmailHtml({
      order,
      name: targetName || order?.user?.fullName || 'Valued Customer',
      trackingUrl,
    });

    const shortId = (order?.id || '').slice(0, 10).toUpperCase();
    const sender = process.env.EMAIL_FROM || `"MShoppy Orders" <${process.env.SMTP_USER || 'pramodlodhi2003born@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject: `🎉 Order Confirmed! Your MShoppy Order #${shortId} is Placed`,
      html,
    });

    console.log(`✅ Order confirmation email sent to ${targetEmail} for Order #${order?.id} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, sentTo: targetEmail };
  } catch (err) {
    console.error('❌ Error sending order confirmation email:', err.message);
    return { success: false, error: err.message };
  }
};


