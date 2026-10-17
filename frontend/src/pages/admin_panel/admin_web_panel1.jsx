import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLogout } from '../../hooks/useLogout';
import UserProfile from '../../components/common/UserProfile';
import AdminUsersManagement from '../../components/admin/users/AdminUsersManagement';
import AdminDashboardOverview from '../../components/admin/dashboard/AdminDashboardOverview';
import AdminKycManagement from '../../components/admin/kyc/AdminKycManagement';
import AdminOrdersManagement from '../../components/admin/orders/AdminOrdersManagement';
import AdminReturnsManagement from '../../components/admin/returns/AdminReturnsManagement';
import AdminProductsManagement from '../../components/admin/products/AdminProductsManagement';
import AdminSellersManagement from '../../components/admin/sellers/AdminSellersManagement';
import AdminFinanceManagement from '../../components/admin/finance/AdminFinanceManagement';
import AdminAnalyticsManagement from '../../components/admin/analytics/AdminAnalyticsManagement';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  LayoutDashboard, ShieldCheck, Truck, Users,
  Package, ShoppingCart, RotateCcw, LineChart,
  Wallet, Banknote, Store
} from 'lucide-react';
// Yeh raha aapka MASTER MENU (with Sub-menus)
const ADMIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'kyc',
    label: 'KYC Verifications',
    icon: ShieldCheck,
    children: [
      { id: 'dropshipper-kyc', label: 'Dropshipper KYC 📦', icon: Truck, path: '/admin-dropshipper-kyc' },
      { id: 'affiliate-kyc', label: 'Affiliate KYC 🤝', icon: Users, path: '/admin-affiliate-kyc' },
    ],
  },
  { id: 'products', label: 'Products 📦', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'returns', label: 'Returns & Refunds 🔄', icon: RotateCcw },
  { id: 'sellers', label: 'Sellers 🏬', icon: Store },
  { id: 'finance', label: 'Finance & Payouts 💳', icon: Banknote },
  { id: 'analytics', label: 'Analytics 📊', icon: LineChart },
  { id: 'users', label: 'Users', icon: Users, path: '/user-dashboard' },
];


export default function AdminWebPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const user = useSelector((state) => state.user?.currentUser);

  // Real name ya email ka prefix
  const adminName = user?.fullName || user?.email?.split('@')[0] || "Admin";

  // Custom Firebase Logout Hook call
  const handleLogout = useLogout('/admin/login');

  // Helper function to get Title and Subtitle dynamically based on Active Tab
  const getPageHeader = () => {
    switch (activeTab) {
      case 'profile':
        return { title: "Account Settings", subtitle: "" };
      case 'dashboard':
        return { title: "Dashboard Overview", subtitle: "" };
      case 'kyc':
      case 'dropshipper-kyc':
      case 'affiliate-kyc':
        return { title: "KYC Verifications", subtitle: "" };
      case 'users':
        return { title: "Manage Users", subtitle: "" };
      case 'products':
        return { title: "Product Catalog & Moderation", subtitle: "Inspect supplier listings, manage inventory, and monitor stock levels" };
      case 'orders':
        return { title: "Manage Orders", subtitle: "Track, fulfill, and monitor customer orders" };
      case 'returns':
        return { title: "Returns & Refunds", subtitle: "Inspect claims, manage pickups, and process customer refunds" };
      case 'sellers':
        return { title: "Seller & Supplier Management", subtitle: "Monitor registered vendors, verify business credentials, and manage partner tiers" };
      case 'finance':
      case 'earnings':
        return { title: "Finance, Escrow & Settlements", subtitle: "Manage partner escrow wallets, process withdrawal payouts, and monitor transaction ledger" };
      case 'analytics':
        return { title: "Business Intelligence & Analytics", subtitle: "Analyze sales trends, order progression, catalog distribution, and top suppliers" };
      default:
        // Fallback: Menu se title nikal lo
        const item = ADMIN_MENU.find(m => m.id === activeTab) || ADMIN_MENU.flatMap(m => m.children || []).find(c => c.id === activeTab);
        return { title: item?.label || "Admin Panel", subtitle: "" };
    }
  };

  const headerInfo = getPageHeader();

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      roleName="ADMIN"
      userName={adminName}
      pageTitle={headerInfo.title}
      pageSubtitle={headerInfo.subtitle}
      onLogout={handleLogout}
    >

      {/* ===== YAHAN BAAKI PAGES AAYENGE ===== */}

      {activeTab === 'profile' && (
        <UserProfile
          name={adminName}
          email={user?.email || "No Email Found"}
          role="Administrator Role"
          status="Active"
        />
      )}

      {activeTab === 'dashboard' && (
        <AdminDashboardOverview onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {(activeTab === 'kyc' || activeTab === 'dropshipper-kyc' || activeTab === 'affiliate-kyc') && (
        <AdminKycManagement
          key={activeTab}
          initialType={activeTab === 'dropshipper-kyc' ? 'dropshipper' : activeTab === 'affiliate-kyc' ? 'affiliate' : 'all'}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersManagement />
      )}

      {activeTab === 'products' && (
        <AdminProductsManagement />
      )}

      {activeTab === 'orders' && (
        <AdminOrdersManagement />
      )}

      {activeTab === 'returns' && (
        <AdminReturnsManagement />
      )}

      {activeTab === 'sellers' && (
        <AdminSellersManagement />
      )}

      {(activeTab === 'finance' || activeTab === 'earnings') && (
        <AdminFinanceManagement />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalyticsManagement />
      )}

    </DashboardLayout>
  );
}
