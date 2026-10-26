import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isCustomerAuthenticated } from '../services/customerAuthService';
import { isAffiliateAuthenticated } from '../services/affiliateAuthService';
import { isResellerAuthenticated } from '../services/resellerAuthService';
import { isDropshipperAuthenticated } from '../services/dropshipperService';

const ProtectedRoute = ({ children, role = 'customer', allowedRoles }) => {
  const location = useLocation();
  const { currentUser, isAuthenticated: isReduxAuth } = useSelector((state) => state.user || {});

  // 1. STRICT DROPSHIPPER GUARD (Prevents normal customers or expired sessions from entering)
  if (role === 'dropshipper') {
    const isLocalAuth = isDropshipperAuthenticated();
    const isReduxDropship = isReduxAuth && currentUser && (currentUser.role?.toUpperCase() === 'DROPSHIPPER');
    const isAuthorizedDropshipper = isLocalAuth || isReduxDropship;

    if (!isAuthorizedDropshipper) {
      return <Navigate to={`/dropshipper-login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }
    return children ? children : <Outlet />;
  }

  // 2. OTHER ROLES (Customer, Affiliate, Reseller)
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
      isAuth = isCustomerAuthenticated() || isAffiliateAuthenticated() || isResellerAuthenticated() || isDropshipperAuthenticated();
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
