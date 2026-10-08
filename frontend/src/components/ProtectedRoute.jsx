import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isCustomerAuthenticated } from '../services/customerAuthService';
import { isAffiliateAuthenticated } from '../services/affiliateAuthService';
import { isResellerAuthenticated } from '../services/resellerAuthService';

const ProtectedRoute = ({ children, role = 'customer', allowedRoles }) => {
  const location = useLocation();
  const { currentUser, isAuthenticated: isReduxAuth } = useSelector((state) => state.user || {});

  // Check if authenticated via Redux (Firebase login)
  let isAuth = isReduxAuth && !!currentUser;

  // If not authenticated via Redux, fallback to role-based local storage check
  if (!isAuth) {
    if (role === 'customer') {
      isAuth = isCustomerAuthenticated();
    } else if (role === 'affiliate') {
      isAuth = isAffiliateAuthenticated();
    } else if (role === 'reseller') {
      isAuth = isResellerAuthenticated();
    } else if (role === 'any') {
      isAuth = isCustomerAuthenticated() || isAffiliateAuthenticated() || isResellerAuthenticated();
    }
  }

  // Check allowedRoles if provided (e.g. ['ADMIN', 'SUPER_ADMIN'])
  if (allowedRoles && currentUser) {
    if (!allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
  }

  if (!isAuth) {
    const targetRole = role === 'any' ? 'customer' : role;
    return <Navigate to={`/login?role=${targetRole}&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
