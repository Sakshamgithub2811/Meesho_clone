import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Register a new Dropshipper in database with role DROPSHIPPER
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
 * Verify Dropshipper login in database
 */
export const loginDropshipperApi = async ({ firebaseUid, email }) => {
  const response = await axios.post(`${API_BASE}/dropshipper/auth/login`, {
    firebaseUid,
    email
  });
  return response.data;
};
