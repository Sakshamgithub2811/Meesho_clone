// frontend/src/services/supplierApiService.js
import { API_BASE } from '../config/apiConfig';

const API_BASE_URL = API_BASE;

const TOKEN_KEY = 'meesho_supplier_token';
const SUPPLIER_KEY = 'meesho_supplier_user';

/**
 * Session Token & User storage helpers
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getCurrentSupplier() {
  try {
    const raw = localStorage.getItem(SUPPLIER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(token, supplier) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('supplierToken', token);
    }
    if (supplier) {
      localStorage.setItem(SUPPLIER_KEY, JSON.stringify(supplier));
      localStorage.setItem('supplier', JSON.stringify(supplier));
    }
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SUPPLIER_KEY);
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplier');
  } catch (err) {
    console.error('Failed to clear session from localStorage:', err);
  }
}

/**
 * Helper to make API requests with Authorization header
 */
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  // If not FormData, attach Content-Type: application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach Bearer token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status})`);
    }

    return data;
  } catch (error) {
    console.warn(`[SupplierAPI] Request to ${endpoint} failed:`, error.message);
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
      throw new Error(`Backend server is offline or unreachable at ${API_BASE_URL}.`);
    }
    throw error;
  }
}

/**
 * ========================================================
 * 1. AUTHENTICATION & ONBOARDING
 * ========================================================
 */

// Mobile Send OTP
export async function sendOtp(phone) {
  return request('/supplier/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

// Mobile Verify OTP
export async function verifyOtp(phone, otp, name = '') {
  const data = await request('/supplier/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, name }),
  });

  if (data.token && data.supplier) {
    saveAuthSession(data.token, data.supplier);
  }
  return data;
}

// Login Supplier (Firebase UID Based)
export async function loginSupplier({ firebaseUid, email }) {
  const data = await request('/supplier/auth/login', {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, email }),
  });

  if (data.user) {
    saveAuthSession(firebaseUid, data.user);
  }
  return data;
}

// Email/ID + Password Login (Firebase wrapper for backward compatibility)
export async function loginWithPassword(identifier, password) {
  // If identifier is an object containing firebaseUid, forward to loginSupplier
  if (typeof identifier === 'object' && identifier?.firebaseUid) {
    return loginSupplier(identifier);
  }
  return loginSupplier({ firebaseUid: identifier, email: identifier });
}

// Register New Supplier (Firebase UID Based)
export async function registerSupplier(supplierData) {
  const { firebaseUid, email, fullName, storeName, phone, name } = supplierData;
  const data = await request('/supplier/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firebaseUid,
      email,
      fullName: fullName || name || 'Supplier Partner',
      storeName: storeName || `${fullName || name || 'Supplier'}'s Store`,
      phone: phone || null,
    }),
  });

  if (data.user) {
    saveAuthSession(firebaseUid, data.user);
  }
  return data;
}

// Logout
export async function logoutSupplier() {
  clearAuthSession();
  try {
    await request('/supplier/auth/logout', { method: 'POST' });
  } catch {}
}

/**
 * ========================================================
 * 2. SUPPLIER PROFILE & VERIFICATION
 * ========================================================
 */

// Get Logged In Supplier Profile
export async function fetchSupplierProfile() {
  const data = await request('/supplier/auth/me');
  if (data.supplier) {
    saveAuthSession(getAuthToken(), data.supplier);
  }
  return data.supplier;
}

// Update General Profile Info (Store name, phone, etc.)
export async function updateSupplierProfile(profileData) {
  const data = await request('/supplier/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (data.supplier) {
    saveAuthSession(getAuthToken(), data.supplier);
  }
  return data.supplier;
}

// Update Bank & UPI Details
export async function updateBankDetails(bankData) {
  const data = await request('/supplier/profile/bank', {
    method: 'PUT',
    body: JSON.stringify(bankData),
  });
  return data.bankDetails;
}

// Update GST & Tax Details
export async function updateGstDetails(gstData) {
  const data = await request('/supplier/profile/gst', {
    method: 'PUT',
    body: JSON.stringify(gstData),
  });
  return data.gstDetails;
}

// Get Supplier KYC Application & Status
export async function fetchSupplierKyc() {
  const data = await request('/supplier/kyc');
  return data;
}

// Submit or Re-submit Supplier KYC Application
export async function submitSupplierKyc(kycPayload) {
  const data = await request('/supplier/kyc', {
    method: 'POST',
    body: JSON.stringify(kycPayload),
  });
  return data;
}

/**
 * ========================================================
 * 3. DASHBOARD, INVENTORY & PRODUCTS
 * ========================================================
 */

// Get Dashboard Statistics (sales, orders, revenue)
export async function fetchDashboardStats() {
  const data = await request('/supplier/dashboard-stats');
  return data.data;
}

// Get Supplier Catalog / Products
export async function fetchSupplierProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/supplier/products${query ? `?${query}` : ''}`;
  const data = await request(endpoint);
  return data;
}

// Add New Product (Supports FormData with uploaded images)
export async function createSupplierProduct(payload) {
  let body;
  let headers = {};

  if (payload instanceof FormData) {
    body = payload;
    // Let browser set multipart boundary
  } else {
    body = JSON.stringify(payload);
    headers['Content-Type'] = 'application/json';
  }

  const data = await request('/supplier/products', {
    method: 'POST',
    headers,
    body,
  });
  return data.data;
}

// Update Product (Supports FormData with uploaded images or standard JSON)
export async function updateSupplierProduct(productId, updateData) {
  let body;
  let headers = {};

  if (updateData instanceof FormData) {
    body = updateData;
    // Let browser set multipart boundary
  } else {
    body = JSON.stringify(updateData);
    headers['Content-Type'] = 'application/json';
  }

  const data = await request(`/supplier/products/${productId}`, {
    method: 'PUT',
    headers,
    body,
  });
  return data.data;
}

// Delete Product
export async function deleteSupplierProduct(productId) {
  return request(`/supplier/products/${productId}`, {
    method: 'DELETE',
  });
}

// Bulk Update Products (Stock or Price)
export async function bulkUpdateSupplierProducts(payload) {
  const data = await request('/supplier/products/bulk', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data;
}

// Bulk Delete Products
export async function bulkDeleteSupplierProducts(productIds) {
  const data = await request('/supplier/products/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });
  return data;
}

// Get Categories
export async function fetchCategories() {
  const data = await request('/supplier/categories');
  return data.data || [];
}

// Add Category
export async function createCategory(categoryData) {
  const data = await request('/supplier/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  return data.data;
}

// Get Orders for Supplier
export async function fetchSupplierOrders() {
  const data = await request('/supplier/orders');
  return data.data || [];
}

// Update Order Status (supports optional item-level targeting)
export async function updateOrderStatus(orderId, orderStatus, orderItemId = null) {
  const payload = { orderStatus };
  if (orderItemId) payload.orderItemId = orderItemId;
  const data = await request(`/supplier/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.data;
}

// Get Settlements & Payouts (Finance)
export async function fetchSupplierSettlements() {
  const data = await request('/supplier/finance-settlements');
  return data.data;
}

// Request Escrow / Settled Payout Withdrawal to Registered Bank Account
export async function requestSupplierPayout(amount, notes = '') {
  const data = await request('/supplier/finance-settlements/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, notes }),
  });
  return data;
}

// Get Supplier Analytics & Performance
export async function fetchSupplierAnalytics() {
  const data = await request('/supplier/analytics');
  return data.data;
}

export function downloadOrderInvoice(orderId) {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/supplier/orders/${orderId}/invoice${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  window.open(url, '_blank');
}

export function downloadShippingLabel(orderId) {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/supplier/orders/${orderId}/shipping-label${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  window.open(url, '_blank');
}

export async function fetchSupplierReturns() {
  const data = await request('/supplier/returns');
  return data.data;
}

export async function updateReturnStatus(id, status, extra = {}) {
  const data = await request(`/supplier/returns/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...extra }),
  });
  return data;
}

export default {
  getAuthToken,
  getCurrentSupplier,
  saveAuthSession,
  clearAuthSession,
  sendOtp,
  verifyOtp,
  loginSupplier,
  loginWithPassword,
  registerSupplier,
  logoutSupplier,
  fetchSupplierProfile,
  updateSupplierProfile,
  updateBankDetails,
  updateGstDetails,
  fetchSupplierKyc,
  submitSupplierKyc,
  fetchDashboardStats,
  fetchSupplierProducts,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct,
  bulkUpdateSupplierProducts,
  bulkDeleteSupplierProducts,
  fetchCategories,
  createCategory,
  fetchSupplierOrders,
  updateOrderStatus,
  fetchSupplierSettlements,
  requestSupplierPayout,
  fetchSupplierAnalytics,
  downloadOrderInvoice,
  downloadShippingLabel,
  fetchSupplierReturns,
  updateReturnStatus,
};
