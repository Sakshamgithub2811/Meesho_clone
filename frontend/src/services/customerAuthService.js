// frontend/src/services/customerAuthService.js
import { clearAffiliateApp } from './affiliateSessionStore';
import { resetCartCache } from '../hooks/useCart';
import { API_V1_BASE } from '../config/apiConfig';

const API_BASE_URL = API_V1_BASE;
const TOKEN_KEY = 'mshoppy_customer_token';
const USER_KEY = 'mshoppy_customer_user';

const listeners = new Set();

function notifyListeners() {
  const current = getStoredCustomer();
  listeners.forEach((fn) => {
    try {
      fn(current);
    } catch (e) {}
  });
}

/**
 * Customer / User Login via Mobile or Email & OTP
 */
export async function loginCustomer({ phone, email, fullName, otp = '123456' }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, email, fullName, otp }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Customer authentication failed. Please check credentials.');
    }

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    try {
      clearAffiliateApp();
    } catch (e) {}

    notifyListeners();
    return data;
  } catch (error) {
    console.error('Customer login API failed:', error);
    throw error;
  }
}

/**
 * Retrieve currently logged in Customer
 */
export function getStoredCustomer() {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (!userStr) return null; const parsedUser = JSON.parse(userStr); return { user: parsedUser, token: token || parsedUser?.id || 'mock_cust_token' };

    return {
      user: JSON.parse(userStr),
      token,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Check if Customer is logged in
 */
export function isCustomerAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  return Boolean(token && user);
}

/**
 * Update Customer Profile
 */
export async function updateCustomerProfile(updates) {
  let session = getStoredCustomer();
  let userObj = session?.user;

  if (!userObj) {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) userObj = JSON.parse(raw);
    } catch (_) {}
  }

  const cleanUpdates = {
    ...updates,
    phone: updates.phone ? updates.phone.toString().replace(/\D/g, '').slice(-10) : ''
  };

  const merged = { ...userObj, ...cleanUpdates };

  // 1. Immediately persist to localStorage
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
  } catch (e) {}

  notifyListeners();

  try {
    const token = session?.token || localStorage.getItem(TOKEN_KEY) || userObj?.id || userObj?.uid || '';
    const response = await fetch(`${API_BASE_URL}/auth/customer-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanUpdates),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        const finalUser = {
          ...merged,
          ...data.user,
          phone: data.user.phone || cleanUpdates.phone || merged.phone || ''
        };
        localStorage.setItem(USER_KEY, JSON.stringify(finalUser));
        notifyListeners();
        return finalUser;
      }
    }
  } catch (e) {
    console.warn('Could not update customer profile on server:', e);
  }

  return merged;
}

/**
 * Logout Customer - Purge all session, address, KYC, and cart state
 */
export function logoutCustomer() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('affiliate_kyc_application');
  localStorage.removeItem('current_session_affiliate_app');
  localStorage.removeItem('mshoppy_affiliate_token');
  localStorage.removeItem('mshoppy_affiliate_user');
  localStorage.removeItem('mshoppy_affiliate_stats');
  localStorage.removeItem('mshoppy_selected_address');
  localStorage.removeItem('mshoppy_applied_coupon');
  localStorage.removeItem('mshoppy_guest_id');
  localStorage.removeItem('mshoppy_customer_wallet');
  localStorage.removeItem('mshoppy_customer_wallet_txns');
  localStorage.removeItem('mshoppy_real_notifications');
  try {
    sessionStorage.clear();
  } catch (e) {}
  try {
    clearAffiliateApp();
  } catch (e) {}
  try {
    resetCartCache();
  } catch (e) {}
  notifyListeners();
}

/**
 * Subscribe to Customer auth updates
 */
export function subscribeCustomerAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
