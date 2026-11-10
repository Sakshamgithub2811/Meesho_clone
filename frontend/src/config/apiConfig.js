// frontend/src/config/apiConfig.js
// Centralized API configuration for Development and Production deployment

const getRawBackendUrl = () => {
  // 1. Browser Runtime Auto-Detection:
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, origin } = window.location;
    // When running on Vercel (e.g. meesho-clone-nu.vercel.app), connect directly to the Vercel backend
    if (hostname.includes('vercel.app')) {
      return 'https://meesho-clone-backend-beta.vercel.app/api/v1';
    }
    // If running on a production domain or VPS IP (not localhost),
    // default to the current origin so reverse proxy (e.g. Nginx on VPS) handles /api cleanly.
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${origin}/api/v1`;
    }
  }

  // 2. Explicit env variables (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  }

  // 3. Localhost fallback
  return 'http://localhost:5000/api/v1';
};

const rawBackendUrl = getRawBackendUrl();

// Base host without trailing paths (e.g. "http://localhost:5000" or "https://api.yourdomain.com")
export const BACKEND_ROOT = rawBackendUrl
  .replace(/\/api(\/v1)?\/?$/, '')
  .replace(/\/+$/, '');

// /api root (e.g. "http://localhost:5000/api" or "https://api.yourdomain.com/api")
export const API_BASE = `${BACKEND_ROOT}/api`;

// /api/v1 root (e.g. "http://localhost:5000/api/v1" or "https://api.yourdomain.com/api/v1")
export const API_V1_BASE = `${BACKEND_ROOT}/api/v1`;

export default API_BASE;
