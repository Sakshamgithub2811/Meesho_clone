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
 * Request Phone OTP via Firebase SMS
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
    console.error('[Firebase Phone Auth] Live SMS error:', firebaseErr.code || firebaseErr.message);
    throw new Error(firebaseErr.message || 'Failed to send verification SMS to your mobile. Please verify the number and try again.');
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

  if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
    throw new Error('No active verification session found. Please request a new OTP code on your phone.');
  }

  const cleanDigits = phone.toString().replace(/\D/g, '').slice(-10);
  let firebaseUid = null;

  try {
    const firebaseUser = await verifyPhoneOtp(confirmationResult, otp);
    firebaseUid = firebaseUser.uid;
    console.log(`[Firebase Phone Auth] Successfully verified phone user UID: ${firebaseUid}`);
  } catch (confErr) {
    console.error('[Firebase Phone Auth] Code verification failed:', confErr);
    throw new Error('Invalid verification code! Please check the code sent to your phone.');
  }

  // Authenticate / Sync customer profile with database
  const loginResult = await loginCustomer({
    phone: cleanDigits,
    fullName: fullName || `Customer +91 ${cleanDigits.slice(0, 2)}****${cleanDigits.slice(-4)}`,
    otp,
    firebaseUid
  });

  return loginResult;
}

