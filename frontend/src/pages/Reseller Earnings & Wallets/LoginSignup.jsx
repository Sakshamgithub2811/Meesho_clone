import React from 'react';
import { useLocation } from 'react-router-dom';
import UserLogin from '../customer & Reseller/UserLogin';
import AffiliateLogin from './AffiliateLogin';

export default function LoginPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');

  if (roleParam === 'affiliate') {
    return <AffiliateLogin />;
  }

  // Default to User / Customer Login
  return <UserLogin />;
}