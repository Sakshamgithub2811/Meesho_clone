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
 * Helper: Check if Dropshipper is authenticated in localStorage
 */
export const isDropshipperAuthenticated = () => {
  try {
    const sessionStr = localStorage.getItem('meesho_dropshipper_session');
    if (!sessionStr) return false;
    const session = JSON.parse(sessionStr);
    return !!(session && session.isLoggedIn && (session.role === 'DROPSHIPPER' || session.role === 'dropshipper'));
  } catch (e) {
    return false;
  }
};


