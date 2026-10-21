import React from 'react';
import UserWebDashboard1 from './user_web_dashboard1';

/**
 * Legacy Dashboard Forwarder
 * Automatically delegates to UserWebDashboard1 to prevent any legacy UI rendering
 */
export default function UserWebDashboard(props) {
  return <UserWebDashboard1 {...props} />;
}