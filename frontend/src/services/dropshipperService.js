import axios from 'axios';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api/v1';

/**
 * 0. Master Executive Dashboard Overview Metrics
 */
export const getDropshipperDashboardOverviewApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/dashboard/overview/${firebaseUid}`);
  return response.data;
};

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
 * 4. Update Dropshipper Profile (Name, Phone, Avatar, StoreName, BankDetails, PAN, GSTIN)
 */
export const updateDropshipperProfileApi = async ({ firebaseUid, fullName, phone, avatarUrl, storeName, bankDetails, pan, gstin }) => {
  const response = await axios.put(`${API_BASE}/dropshipper/profile`, {
    firebaseUid,
    fullName,
    phone,
    avatarUrl,
    storeName,
    bankDetails,
    pan,
    gstin
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
 * 10a. Update Dropshipper Order Details (Customer Name, Phone, Address, Price)
 */
export const updateDropshipperOrderApi = async (orderId, updatePayload) => {
  const response = await axios.put(`${API_BASE}/dropshipper/orders/${orderId}`, updatePayload);
  return response.data;
};

/**
 * 10b. Cancel a Dropshipper Order
 */
export const cancelDropshipperOrderApi = async (orderId, cancellationReason) => {
  const response = await axios.put(`${API_BASE}/dropshipper/orders/${orderId}/cancel`, { cancellationReason });
  return response.data;
};

/**
 * 10c. Permanently Delete a Dropshipper Order
 */
export const deleteDropshipperOrderApi = async (orderId) => {
  const response = await axios.delete(`${API_BASE}/dropshipper/orders/${orderId}`);
  return response.data;
};

/**
 * 10d. Archive / Unarchive a Dropshipper Order (Soft Archiving)
 */
export const archiveDropshipperOrderApi = async (orderId, archive = true) => {
  const response = await axios.put(`${API_BASE}/dropshipper/orders/${orderId}/archive`, { archive });
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
 * 12b. Post a Reply Message to an Existing Ticket
 */
export const replyDropshipperTicketApi = async (ticketId, { text, sender = 'dropshipper', name }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/tickets/${ticketId}/reply`, { text, sender, name });
  return response.data;
};

/**
 * 12c. Update Ticket Status (RESOLVED / CLOSED / IN_PROGRESS / OPEN)
 */
export const updateDropshipperTicketStatusApi = async (ticketId, status) => {
  const response = await axios.put(`${API_BASE}/dropshipper/tickets/${ticketId}/status`, { status });
  return response.data;
};

/**
 * 13. Send Webhook Test Ping (Database Persisted)
 */
export const sendWebhookTestPingApi = async (payload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/integrations/test-ping`, payload);
  return response.data;
};

/**
 * 13.1 Fetch Saved Store Integrations for Dropshipper from Database
 */
export const getDropshipperIntegrationsApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/integrations/${firebaseUid}`);
  return response.data;
};

/**
 * 13.2 Save/Update Store Integration in Database
 */
export const saveDropshipperIntegrationApi = async (integrationPayload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/integrations/save`, integrationPayload);
  return response.data;
};

/**
 * 13.3 Fetch Real Webhook Traffic Logs for Dropshipper from Database
 */
export const getDropshipperWebhookLogsApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/integrations/logs/${firebaseUid}`);
  return response.data;
};

/**
 * 13.4 Clear Webhook Logs from Database
 */
export const clearDropshipperWebhookLogsApi = async (firebaseUid) => {
  const response = await axios.delete(`${API_BASE}/dropshipper/integrations/logs/${firebaseUid}`);
  return response.data;
};

/**
 * 14. Save Dropshipper Session with Remember Me / Expiration Support
 * - rememberMe = true: 30-day persistent session across browser restarts
 * - rememberMe = false: Single-browser-session temporary storage (expires when tab/browser closes)
 */
export const setDropshipperSession = (userData, rememberMe = false) => {
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours for temporary session
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days for Remember Me session
  const duration = rememberMe ? THIRTY_DAYS : TWENTY_FOUR_HOURS;
  const kycStatus = (userData.kycStatus || userData.kycRemoteStatus || 'NOT_SUBMITTED').toUpperCase();

  const sessionData = {
    isLoggedIn: true,
    dropshipperId: userData.id || userData.uid,
    name: userData.fullName || userData.name || 'Verified Dropshipper',
    email: userData.email,
    role: 'DROPSHIPPER',
    kycStatus: kycStatus,
    isKycApproved: kycStatus === 'APPROVED',
    rememberMe: Boolean(rememberMe),
    loginTime: now,
    expiresAt: now + duration
  };

  localStorage.setItem('meesho_dropshipper_session', JSON.stringify(sessionData));

  // If not rememberMe, set a session marker that dies when the browser window closes
  if (!rememberMe) {
    sessionStorage.setItem('meesho_dropshipper_temp_active', 'true');
  } else {
    sessionStorage.removeItem('meesho_dropshipper_temp_active');
  }

  return sessionData;
};

/**
 * 15. Helper: Check if Dropshipper is authenticated with valid session
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

    // If temporary session (Remember Me was unchecked), verify browser session is still active
    if (session.rememberMe === false && !sessionStorage.getItem('meesho_dropshipper_temp_active')) {
      console.warn("[Dropshipper Guard] Browser closed after temporary session. Logging out for security.");
      localStorage.removeItem('meesho_dropshipper_session');
      return false;
    }

    // Expiry Check
    const now = Date.now();
    if (session.expiresAt && now > session.expiresAt) {
      console.warn("[Dropshipper Guard] Session expired. Clearing session.");
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
 * 16. Update KYC status in session (called when live KYC status is fetched)
 */
export const updateDropshipperKycStatus = (status) => {
  try {
    const sessionStr = localStorage.getItem('meesho_dropshipper_session');
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    const norm = (status || 'NOT_SUBMITTED').toUpperCase();
    session.kycStatus = norm;
    session.isKycApproved = norm === 'APPROVED';
    localStorage.setItem('meesho_dropshipper_session', JSON.stringify(session));
    return session;
  } catch (e) {
    return null;
  }
};

/**
 * 17. Get Dropshipper KYC state
 */
export const getDropshipperKycState = () => {
  try {
    const sessionStr = localStorage.getItem('meesho_dropshipper_session');
    if (!sessionStr) return { kycStatus: 'NOT_SUBMITTED', isKycApproved: false, isUnderReview: false };
    const session = JSON.parse(sessionStr);
    const kycStatus = (session.kycStatus || 'NOT_SUBMITTED').toUpperCase();
    return {
      kycStatus,
      isKycApproved: kycStatus === 'APPROVED',
      isUnderReview: ['PENDING', 'UNDER_REVIEW'].includes(kycStatus)
    };
  } catch (e) {
    return { kycStatus: 'NOT_SUBMITTED', isKycApproved: false, isUnderReview: false };
  }
};

/**
 * 18. Complete Dropshipper Logout
 */
export const clearDropshipperSession = () => {
  localStorage.removeItem('meesho_dropshipper_session');
};

/**
 * 19. Deactivate Dropshipper Account (Soft Delete)
 */
export const deactivateDropshipperAccountApi = async ({ firebaseUid, reason, email }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/profile/deactivate`, {
    firebaseUid,
    reason,
    email
  });
  return response.data;
};

/**
 * 20. Restore Dropshipper Account
 */
export const restoreDropshipperAccountApi = async ({ firebaseUid, email }) => {
  const payload = typeof firebaseUid === 'string' && !email 
    ? { firebaseUid } 
    : { firebaseUid, email };
  const response = await axios.post(`${API_BASE}/dropshipper/profile/restore`, payload);
  return response.data;
};

/**
 * 21. Fetch Saved Margin & Pricing Rules from Database
 */
export const getDropshipperMarginConfigApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/margin-config/${firebaseUid}`);
  return response.data;
};

/**
 * 22. Save/Update Margin & Pricing Rules in Database
 */
export const saveDropshipperMarginConfigApi = async (configPayload) => {
  const response = await axios.post(`${API_BASE}/dropshipper/margin-config/save`, configPayload);
  return response.data;
};

/**
 * 23. Reset Margin Rules to Platform Defaults in Database
 */
export const resetDropshipperMarginConfigApi = async (firebaseUid) => {
  const response = await axios.delete(`${API_BASE}/dropshipper/margin-config/${firebaseUid}`);
  return response.data;
};

/**
 * 24. Fetch Real Categories from Database for Dynamic Niche Rules
 */
export const getStoreCategoriesApi = async () => {
  const response = await axios.get(`${API_BASE}/categories`);
  return response.data;
};

/**
 * 25. Fetch Real Order Settlements & Logistics Tracking Ledger from Database
 */
export const getDropshipperSettlementsApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/settlements/${firebaseUid}`);
  return response.data;
};

/**
 * 26. Submit Dispute Claim for RTO / Reverse Freight in Database
 */
export const submitSettlementClaimApi = async ({ firebaseUid, orderId, claimReason, description }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/settlements/claim`, {
    firebaseUid,
    orderId,
    claimReason,
    description
  });
  return response.data;
};

/**
 * 27. Fetch Real ROT Liability & Return Orders from Database
 */
export const getDropshipperRotDataApi = async (firebaseUid) => {
  const response = await axios.get(`${API_BASE}/dropshipper/rot/${firebaseUid}`);
  return response.data;
};

/**
 * 28. Update Dropshipper ROT Protection Plan in Database
 */
export const updateDropshipperRotPlanApi = async ({ firebaseUid, planName }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/rot/plan`, {
    firebaseUid,
    planName
  });
  return response.data;
};

/**
 * 29. Submit ROT Reverse Freight Dispute Ticket in Database
 */
export const submitRotDisputeApi = async ({ firebaseUid, orderId, returnId, reason, description }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/rot/dispute`, {
    firebaseUid,
    orderId,
    returnId,
    reason,
    description
  });
  return response.data;
};








