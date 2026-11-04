// frontend/src/config/apiConfig.js
// Centralized API configuration for Development and Production deployment

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

// Base host without trailing paths (e.g. "http://localhost:5000" or "https://api.yourdomain.com")
export const BACKEND_ROOT = rawBackendUrl
  .replace(/\/api(\/v1)?\/?$/, '')
  .replace(/\/+$/, '');

// /api root (e.g. "http://localhost:5000/api" or "https://api.yourdomain.com/api")
export const API_BASE = `${BACKEND_ROOT}/api`;

// /api/v1 root (e.g. "http://localhost:5000/api/v1" or "https://api.yourdomain.com/api/v1")
export const API_V1_BASE = `${BACKEND_ROOT}/api/v1`;

export default API_BASE;

