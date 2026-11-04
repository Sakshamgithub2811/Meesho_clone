import transporter from '../config/emailTransporter.js';

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
    const sender = process.env.EMAIL_FROM || `"MShoppy Support" <${process.env.SMTP_USER || 'support@mshoppy.com'}>`;

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
    const sender = process.env.EMAIL_FROM || `"MShoppy Security" <${process.env.SMTP_USER || 'security@mshoppy.com'}>`;

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

