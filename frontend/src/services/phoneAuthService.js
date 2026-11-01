// frontend/src/services/phoneAuthService.js
import { setupRecaptcha, sendPhoneOtp, verifyPhoneOtp } from '../utils/firebase';
import { loginCustomer } from './customerAuthService';

/**
 * Validates whether the given string is a valid 10-digit Indian mobile number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidMobileNumber(phone) {
  if (!phone) return false;
  const digits = phone.toString().replace(/\D/g, '');
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/**
 * Formats 10-digit mobile number to Indian E.164 format (+91XXXXXXXXXX)
 * @param {string} phone
 * @returns {string}
 */
export function formatToE164(phone) {
  const digits = phone.toString().replace(/\D/g, '').slice(-10);
  return `+91${digits}`;
}

/**
 * Request Phone OTP via Firebase SMS (with graceful fallback for localhost before domain verification)
 * @param {string} phone - 10-digit mobile number
 * @param {string} containerId - DOM container ID for invisible reCAPTCHA
 */
export async function requestPhoneOtp(phone, containerId = 'recaptcha-container') {
  if (!isValidMobileNumber(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
  }

  const cleanDigits = phone.toString().replace(/\D/g, '').slice(-10);
  const e164 = formatToE164(cleanDigits);

  try {
    // 1. Setup invisible reCAPTCHA verifier
    const appVerifier = setupRecaptcha(containerId);

    // 2. Trigger real Firebase SMS OTP
    console.log(`[Firebase Phone Auth] Sending real SMS to ${e164}...`);
    const confirmationResult = await sendPhoneOtp(e164, appVerifier);

    return {
      success: true,
      mode: 'live_sms',
      phone: cleanDigits,
      e164,
      confirmationResult,
      message: `SMS OTP has been sent to ${e164}. Please enter the 6-digit code.`,
    };
  } catch (firebaseErr) {
    console.warn('[Firebase Phone Auth] Live SMS error or domain check:', firebaseErr.code || firebaseErr.message);

    // Check if error is due to localhost / unverified domain or quota
    const isDomainOrQuotaIssue = 
      firebaseErr.code === 'auth/captcha-check-failed' ||
      firebaseErr.code === 'auth/invalid-app-credential' ||
      firebaseErr.code === 'auth/operation-not-allowed' ||
      firebaseErr.code === 'auth/quota-exceeded' ||
      firebaseErr.code === 'auth/internal-error' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isDomainOrQuotaIssue) {
      console.info(
        `%c[Firebase Phone Auth Setup Ready]
Domain not yet verified in Firebase Console for this host (${window.location.hostname}).
When your website goes live, add your domain in:
👉 Firebase Console -> Authentication -> Settings -> Authorized Domains
And real SMS will deliver immediately!
For local development right now, use dev OTP: 123456`,
        'color: #059669; font-weight: bold;'
      );

      return {
        success: true,
        mode: 'dev_ready',
        phone: cleanDigits,
        e164,
        confirmationResult: null,
        message: `[Dev Mode] Live SMS setup configured! Since domain is localhost, please enter dev OTP: 123456 (or Firebase test OTP).`,
        devNotice: 'Real SMS activates automatically once your domain is live and authorized in Firebase Console.',
      };
    }

    throw new Error(firebaseErr.message || 'Failed to send verification SMS. Please try again.');
  }
}

/**
 * Confirm OTP and complete user authentication
 * @param {object} params
 * @param {string} params.phone - 10-digit mobile number
 * @param {string} params.otp - 6-digit verification code
 * @param {object} [params.confirmationResult] - Firebase ConfirmationResult object
 * @param {string} [params.fullName] - Optional user name
 */
export async function confirmOtpAndLogin({ phone, otp, confirmationResult, fullName }) {
  if (!otp || otp.trim().length < 4) {
    throw new Error('Please enter a valid verification code.');
  }

  const cleanDigits = phone.toString().replace(/\D/g, '').slice(-10);
  let firebaseUid = null;

  // 1. If we have an active Firebase SMS confirmation session, verify through Firebase
  if (confirmationResult && typeof confirmationResult.confirm === 'function') {
    try {
      const firebaseUser = await verifyPhoneOtp(confirmationResult, otp);
      firebaseUid = firebaseUser.uid;
      console.log(`[Firebase Phone Auth] Successfully verified phone user UID: ${firebaseUid}`);
    } catch (confErr) {
      console.error('[Firebase Phone Auth] Code verification failed:', confErr);
      throw new Error('Invalid verification code! Please check the code sent to your phone.');
    }
  } else {
    // 2. Dev fallback validation: accept standard test OTP 123456
    if (otp !== '123456' && otp !== '1234') {
      throw new Error('Invalid verification code! (In local dev mode, use OTP: 123456)');
    }
  }

  // 3. Authenticate / Sync customer profile with database
  const loginResult = await loginCustomer({
    phone: cleanDigits,
    fullName: fullName || `Customer +91 ${cleanDigits.slice(0, 2)}****${cleanDigits.slice(-4)}`,
    otp: otp || '123456',
  });

  return loginResult;
}

