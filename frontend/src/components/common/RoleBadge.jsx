import React from 'react';

const ROLE_STYLES = {
  ADMIN: 'bg-pink-100 text-[#b7004d] border-pink-200',
  SUPPLIER: 'bg-amber-100 text-amber-800 border-amber-200',
  RESELLER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  DROPSHIPPER: 'bg-purple-100 text-purple-800 border-purple-200',
  DRIVER: 'bg-blue-100 text-blue-800 border-blue-200',
  CUSTOMER: 'bg-gray-100 text-gray-700 border-gray-200'
};

/**
 * Reusable RoleBadge Component
 * Standardized badge for user roles across Admin Dashboard, Users List, and Profile.
 */
export default function RoleBadge({ role }) {
  const normalizedRole = role?.toUpperCase() || 'CUSTOMER';
  const style = ROLE_STYLES[normalizedRole] || ROLE_STYLES.CUSTOMER;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
      {normalizedRole}
    </span>
  );
}
