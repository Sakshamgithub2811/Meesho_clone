import React, { useState } from 'react';
import { useLogout } from '../../hooks/useLogout';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  LayoutDashboard, ShieldCheck, Truck, Users, 
  Package, ShoppingCart, RotateCcw, LineChart, 
  Heart, Wallet, Banknote, Store
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
  { id: 'products', label: 'Products', icon: Package, path: '/supplier-products' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'returns', label: 'Returns & Refunds 🔄', icon: RotateCcw },
  { id: 'analytics', label: 'Analytics', icon: LineChart, path: '/admin-analytics' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'earnings', label: 'Earnings', icon: Wallet, path: '/earnings-dashboard-1' },
  { id: 'users', label: 'Users', icon: Users, path: '/user-dashboard' },
  { id: 'sellers', label: 'Sellers', icon: Store, path: '/seller-dashboard' },
  { id: 'finance', label: 'Finance', icon: Banknote },
];


export default function AdminWebPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Custom Firebase Logout Hook call
  const handleLogout = useLogout('/admin/login');

  return (
    <DashboardLayout 
      menuItems={ADMIN_MENU} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      roleName="ADMIN"
      userName="Super Admin"
      onLogout={handleLogout}
    >
      
      {/* ===== YAHAN BAAKI PAGES AAYENGE ===== */}
      
      {activeTab === 'dashboard' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">Total Sales: ₹50,000</div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">Total Users: 120</div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">Pending KYC: 5</div>
          </div>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">KYC Approvals</h2>
          <p>Yahan Shadcn ka Data Table aayega...</p>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
          <p>Yahan Users list aayegi...</p>
        </div>
      )}

    </DashboardLayout>
  );
}
