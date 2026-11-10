import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBkNsdWIycbJ4GfJnmOZJWSVur_m38UNI4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'meesho-clone-d1709.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'meesho-clone-d1709',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'meesho-clone-d1709.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '108825967954995756730',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:108825967954995756730:web:abcdef',
};

let app = null;
let auth = null;
let googleProvider = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  // Force Google to show account selection dialog on every login instead of auto-logging into cached account
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (error) {
  console.warn('⚠️ Firebase initialization warning:', error?.message);
}

/**
 * Initialize invisible or visible reCAPTCHA verifier for Phone SMS Auth
 * @param {string} containerId - DOM ID of reCAPTCHA container
 * @param {object} customCallbacks - Optional callback handlers
 */
export function setupRecaptcha(containerId = 'recaptcha-container', customCallbacks = {}) {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check Firebase configuration.');
  }

  // Clear existing verifier if previously attached to avoid DOM conflicts
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Recaptcha clear notice:', e?.message);
    }
    window.recaptchaVerifier = null;
  }

  // Check if target container exists in the DOM
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[Firebase Phone Auth] Container #${containerId} not found in DOM yet.`);
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response) => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
      if (typeof customCallbacks.onSolved === 'function') {
        customCallbacks.onSolved(response);
      }
    },
    'expired-callback': () => {
      // Response expired
      console.warn('[Firebase Phone Auth] reCAPTCHA token expired. Re-verification required.');
      if (typeof customCallbacks.onExpired === 'function') {
        customCallbacks.onExpired();
      }
    }
  });

  return window.recaptchaVerifier;
}

/**
 * Sends SMS verification code via Firebase Phone Auth
 * When the website is live and authorized domain is set in Firebase Console,
 * this triggers a real telecom SMS.
 * @param {string} phoneNumber - 10-digit mobile number or full E.164 string (+91...)
 * @param {RecaptchaVerifier} [appVerifier] - reCAPTCHA instance (defaults to window.recaptchaVerifier)
 */
export async function sendPhoneOtp(phoneNumber, appVerifier) {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }

  const verifier = appVerifier || window.recaptchaVerifier || setupRecaptcha('recaptcha-container');

  // Format phone number to E.164 (India default +91)
  const cleanDigits = phoneNumber.toString().replace(/\D/g, '');
  const e164Phone = phoneNumber.toString().startsWith('+')
    ? phoneNumber.toString()
    : cleanDigits.length === 10
      ? `+91${cleanDigits}`
      : `+${cleanDigits}`;

  const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Verifies the SMS OTP code using Firebase ConfirmationResult
 * @param {object} confirmationResult - Object returned by sendPhoneOtp
 * @param {string} otpCode - 6-digit OTP received via SMS
 */
export async function verifyPhoneOtp(confirmationResult, otpCode) {
  const activeConfirmation = confirmationResult || window.confirmationResult;
  if (!activeConfirmation || typeof activeConfirmation.confirm !== 'function') {
    throw new Error('No active verification session. Please request a new OTP.');
  }

  const userCredential = await activeConfirmation.confirm(otpCode.trim());
  return userCredential.user;
}

export { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber };
export default app;
