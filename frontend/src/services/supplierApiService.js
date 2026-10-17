// frontend/src/services/supplierApiService.js

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (supplier) localStorage.setItem(SUPPLIER_KEY, JSON.stringify(supplier));
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SUPPLIER_KEY);
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
      throw new Error('Backend server is offline. Please start backend on http://localhost:5000');
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

// Email/ID + Password Login
export async function loginWithPassword(identifier, password) {
  const data = await request('/supplier/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

  if (data.token && data.supplier) {
    saveAuthSession(data.token, data.supplier);
  }
  return data;
}

// Register New Supplier
export async function registerSupplier(supplierData) {
  const data = await request('/supplier/auth/register', {
    method: 'POST',
    body: JSON.stringify(supplierData),
  });

  if (data.token && data.supplier) {
    saveAuthSession(data.token, data.supplier);
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

// Update Product
export async function updateSupplierProduct(productId, updateData) {
  const data = await request(`/supplier/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  return data.data;
}

// Delete Product
export async function deleteSupplierProduct(productId) {
  return request(`/supplier/products/${productId}`, {
    method: 'DELETE',
  });
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

// Update Order Status
export async function updateOrderStatus(orderId, orderStatus) {
  const data = await request(`/supplier/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ orderStatus }),
  });
  return data.data;
}

export default {
  getAuthToken,
  getCurrentSupplier,
  saveAuthSession,
  clearAuthSession,
  sendOtp,
  verifyOtp,
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
  fetchCategories,
  createCategory,
  fetchSupplierOrders,
  updateOrderStatus,
};
