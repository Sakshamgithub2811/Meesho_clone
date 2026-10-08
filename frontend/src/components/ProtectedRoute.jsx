// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isCustomerAuthenticated } from '../services/customerAuthService';
import { isAffiliateAuthenticated } from '../services/affiliateAuthService';
import { isResellerAuthenticated } from '../services/resellerAuthService';

export default function ProtectedRoute({ children, role = 'customer' }) {
  const location = useLocation();

  let isAuthenticated = false;
  let targetRole = role;

  if (role === 'customer') {
    isAuthenticated = isCustomerAuthenticated();
  } else if (role === 'affiliate') {
    isAuthenticated = isAffiliateAuthenticated();
  } else if (role === 'reseller') {
    isAuthenticated = isResellerAuthenticated();
  } else if (role === 'any') {
    isAuthenticated = isCustomerAuthenticated() || isAffiliateAuthenticated() || isResellerAuthenticated();
    targetRole = 'customer';
  }

  if (!isAuthenticated) {
    // Redirect to unified LoginSignup page with role and redirect state
    return <Navigate to={`/login?role=${targetRole}&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}
