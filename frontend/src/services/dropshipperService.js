import axios from 'axios';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api/v1';

/**
 * 1. Register a new Dropshipper in database with role DROPSHIPPER
 */
export const registerDropshipperApi = async ({ firebaseUid, email, fullName, phone, businessName }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/auth/register`, {
    firebaseUid,
    email,
    fullName,
    phone,
    businessName
  });
  return response.data;
};

/**
 * 2. Verify Dropshipper login in database
 */
export const loginDropshipperApi = async ({ firebaseUid, email }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/auth/login`, {
    firebaseUid,
    email
  });
  return response.data;
};

/**
 * 3. Fetch Dropshipper Profile by Firebase UID
 */
export const getDropshipperProfileApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/profile/${firebaseUid}`);
  return response.data;
};

/**
 * 4. Update Dropshipper Profile (Name, Phone, Avatar, StoreName, BankDetails)
 */
export const updateDropshipperProfileApi = async ({ firebaseUid, fullName, phone, avatarUrl, storeName, bankDetails }) => {
  const response = await axios.put(`${API_BASE}/dropshipper/profile`, {
    firebaseUid,
    fullName,
    phone,
    avatarUrl,
    storeName,
    bankDetails
  });
  return response.data;
};

/**
 * 5. Upload Dropshipper Profile Avatar Image
 */
export const uploadDropshipperAvatarApi = async (firebaseUid, file) => {
  const formData = new FormData();
  formData.append('firebaseUid', firebaseUid);
  formData.append('avatar', file);

  const response = await axios.post(`${API_BASE}/dropshipper/profile/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 6. Submit Dropshipper 4-Step KYC Application
 */
export const submitDropshipperKycApi = async (kycPayload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/kyc`, kycPayload);
  return response.data;
};

/**
 * 7. Get Dropshipper KYC Application Status
 */
export const getDropshipperKycStatusApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/kyc/${firebaseUid}`);
  return response.data;
};

/**
 * 8. Push a Single Customer Order to Supplier
 */
export const pushDropshipperOrderApi = async (orderPayload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/orders/push`, orderPayload);
  return response.data;
};

/**
 * 9. Push Bulk Orders Batch to Suppliers
 */
export const pushBulkDropshipperOrdersApi = async ({ firebaseUid, orders, whiteLabelStoreName }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/orders/bulk-push`, {
    firebaseUid,
    orders,
    whiteLabelStoreName
  });
  return response.data;
};

/**
 * 10. Fetch All Pushed Orders for Dropshipper from Database
 */
export const getDropshipperOrdersApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/orders/${firebaseUid}`);
  return response.data;
};

/**
 * 11. Raise a Support Dispute / Ticket in Database
 */
export const createDropshipperTicketApi = async (ticketPayload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/tickets`, ticketPayload);
  return response.data;
};

/**
 * 12. Fetch Support Tickets for Dropshipper from Database
 */
export const getDropshipperTicketsApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/tickets/${firebaseUid}`);
  return response.data;
};

/**
 * 13. Send Webhook Test Ping
 */
export const sendWebhookTestPingApi = async (payload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/webhook/test-ping`, payload);
  return response.data;
};

/**
 * 14. Save Dropshipper Session with 24-Hour Expiration
 */
export const setDropshipperSession = (userData) => {
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 86,400,000 ms

  const sessionData = {
    isLoggedIn: true,
    dropshipperId: userData.id || userData.uid,
    name: userData.fullName || userData.name || 'Verified Dropshipper',
    email: userData.email,
    role: 'DROPSHIPPER',
    loginTime: now,
    expiresAt: now + TWENTY_FOUR_HOURS
  };

  localStorage.setItem('meesho_dropshipper_session', JSON.stringify(sessionData));
  return sessionData;
};

/**
 * 15. Helper: Check if Dropshipper is authenticated with valid 24h session
 */
export const isDropshipperAuthenticated = () => {
  try {
    const sessionStr = localStorage.getItem('meesho_dropshipper_session');
    if (!sessionStr) return false;
    const session = JSON.parse(sessionStr);

    if (!session || !session.isLoggedIn) {
      localStorage.removeItem('meesho_dropshipper_session');
      return false;
    }

    // Role check
    const roleUpper = (session.role || '').toUpperCase();
    if (roleUpper !== 'DROPSHIPPER') {
      localStorage.removeItem('meesho_dropshipper_session');
      return false;
    }

    // 24-Hour Expiry Check
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (session.expiresAt && now > session.expiresAt) {
      console.warn("[Dropshipper Guard] Session expired after 24 hours. Clearing session.");
      localStorage.removeItem('meesho_dropshipper_session');
      return false;
    }

    if (session.loginTime && (now - session.loginTime > TWENTY_FOUR_HOURS)) {
      console.warn("[Dropshipper Guard] Session exceeded 24 hours. Clearing session.");
      localStorage.removeItem('meesho_dropshipper_session');
      return false;
    }

    return true;
  } catch (e) {
    localStorage.removeItem('meesho_dropshipper_session');
    return false;
  }
};

/**
 * 16. Complete Dropshipper Logout
 */
export const clearDropshipperSession = () => {
  localStorage.removeItem('meesho_dropshipper_session');
  // Clean any temporary session caches if needed
};




