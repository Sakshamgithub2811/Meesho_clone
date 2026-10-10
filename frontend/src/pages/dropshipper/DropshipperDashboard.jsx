import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/userSlice';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  RotateCcw, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  Banknote,
  Percent
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

// Dropshipper Master Sidebar Menu
const DROPSHIPPER_MENU = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Wholesale Catalog', icon: Package, path: '/supplier-products' },
  {
    id: 'settlements-group',
    label: 'Orders & Settlements',
    icon: ShoppingCart,
    children: [
      { id: 'settlements', label: 'Settlement Tracking', icon: TrendingUp, path: '/dropshipper-settlements' },
      { id: 'rot-manager', label: 'ROT Liability & Return', icon: RotateCcw, path: '/dropshipper-rot-manager' },
      { id: 'returns-ledger', label: 'Margin Returns Ledger', icon: Percent, path: '/reseller-returns' },
    ]
  },
  {
    id: 'wallet-group',
    label: 'Earnings & Payouts',
    icon: Wallet,
    children: [
      { id: 'wallet-passbook', label: 'Fintech Wallet', icon: Wallet, path: '/my-wallet' },
      { id: 'withdraw-funds', label: 'Withdraw Margin', icon: Banknote, path: '/withdraw-earnings' },
      { id: 'payout-settings', label: 'Bank & UPI Settings', icon: CheckCircle2, path: '/payout-settings' },
    ]
  },
  { id: 'kyc', label: '4-Step KYC Verification', icon: ShieldCheck, path: '/dropshipper-register' },
];

export default function DropshipperDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle Tab / Menu navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // Find if the clicked menu has a navigation route
    const findPath = (items) => {
      for (const item of items) {
        if (item.id === tabId && item.path) return item.path;
        if (item.children) {
          const sub = item.children.find(c => c.id === tabId);
          if (sub && sub.path) return sub.path;
        }
      }
      return null;
    };

    const targetPath = findPath(DROPSHIPPER_MENU);
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Safe Dropshipper Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      localStorage.removeItem('meesho_dropshipper_session');
      toast.success("Successfully logged out from Dropshipper portal!");
      navigate('/dropshipper-login');
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const dropshipperName = currentUser?.fullName || "Verified Dropshipper";
  const dropshipperEmail = currentUser?.email || "partner@auratrends.shop";

  return (
    <DashboardLayout
      menuItems={DROPSHIPPER_MENU}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      roleName="DROPSHIPPER"
      userName={dropshipperName}
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-10">

        {/* 1. TOP NOTICE / KYC CTA BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ffe4ec] via-[#fff0f4] to-[#ffdae3] p-6 sm:p-8 border border-[#ffb3c6] shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b7004d]/10 border border-[#b7004d]/20 text-[#b7004d] text-xs font-bold tracking-wide uppercase">
                <AlertCircle className="w-3.5 h-3.5" />
                Step 2: KYC & Compliance Verification
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#4a2135] tracking-tight">
                Unlock Wholesale Supplier Catalog & Direct Margin Payouts
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Complete your mandatory 4-Step KYC (GSTIN / MSME, Store profile & Bank verification) to enable instant automated margin payouts and full ROT liability coverage.
              </p>
            </div>
            
            <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
              <Button
                onClick={() => navigate('/dropshipper-register')}
                className="w-full md:w-auto bg-[#b7004d] hover:bg-[#92003d] text-white font-bold py-6 px-6 rounded-2xl shadow-lg shadow-[#b7004d]/20 transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span>Complete 4-Step KYC Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Decorative Background Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#ff7293]/15 blur-2xl pointer-events-none" />
        </div>

        {/* 2. STATS & KPI METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Resell Margin</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">₹42,850.00</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span>↑ +18.4%</span>
                <span className="text-gray-400">vs last cycle</span>
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Dropship Orders</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#b7004d] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">34</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                28 in-transit • 6 out for delivery
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ROT Shield Protection</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">100%</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Zero damage return liability
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Wallet Balance</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">₹14,200.00</h3>
              <p className="text-xs text-purple-600 font-semibold mt-1">
                Eligible for instant withdrawal
              </p>
            </div>
          </div>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => navigate('/supplier-products')}
            className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#b7004d]" />
            </div>
            <h4 className="font-bold text-gray-900 mt-3 text-sm">Browse Wholesale Catalog</h4>
            <p className="text-xs text-gray-500 mt-1">Discover trending B2B suppliers and zero-margin products.</p>
          </div>

          <div 
            onClick={() => navigate('/dropshipper-settlements')}
            className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mt-3 text-sm">Settlement Tracking</h4>
            <p className="text-xs text-gray-500 mt-1">Monitor real-time customer payments and profit payouts.</p>
          </div>

          <div 
            onClick={() => navigate('/dropshipper-rot-manager')}
            className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
            </div>
            <h4 className="font-bold text-gray-900 mt-3 text-sm">ROT Return Manager</h4>
            <p className="text-xs text-gray-500 mt-1">Manage return-on-transit claims & supplier freight offsets.</p>
          </div>

          <div 
            onClick={() => navigate('/withdraw-earnings')}
            className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Banknote className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
            </div>
            <h4 className="font-bold text-gray-900 mt-3 text-sm">Withdraw Earnings</h4>
            <p className="text-xs text-gray-500 mt-1">Transfer cleared margin balance to your registered bank account.</p>
          </div>
        </div>

        {/* 4. RECENT ORDERS & ACTIVITY PREVIEW */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Dropship Orders</h3>
              <p className="text-xs text-gray-500 mt-0.5">Live tracking of your customer orders through verified suppliers</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dropshipper-settlements')}
              className="text-xs font-bold text-[#b7004d] border-pink-200 hover:bg-pink-50 rounded-xl cursor-pointer"
            >
              View All Settlements →
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Product SKU</th>
                  <th className="pb-3 px-2">Destination</th>
                  <th className="pb-3 px-2">Customer Price</th>
                  <th className="pb-3 px-2">Your Margin</th>
                  <th className="pb-3 px-2">ROT Status</th>
                  <th className="pb-3 px-2">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-2 font-mono text-gray-800">#MSH-9824</td>
                  <td className="py-4 px-2 text-gray-800">Banarasi Silk Saree (Red)</td>
                  <td className="py-4 px-2 text-gray-600">Bengaluru, KA</td>
                  <td className="py-4 px-2 text-gray-900 font-bold">₹1,499.00</td>
                  <td className="py-4 px-2 text-emerald-600 font-bold">+₹450.00</td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Shielded
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-2 font-mono text-gray-800">#MSH-9819</td>
                  <td className="py-4 px-2 text-gray-800">Wireless ANC Earbuds Pro</td>
                  <td className="py-4 px-2 text-gray-600">Jaipur, RJ</td>
                  <td className="py-4 px-2 text-gray-900 font-bold">₹999.00</td>
                  <td className="py-4 px-2 text-emerald-600 font-bold">+₹320.00</td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Shielded
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <Clock className="w-3 h-3" /> In Transit
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-2 font-mono text-gray-800">#MSH-9805</td>
                  <td className="py-4 px-2 text-gray-800">Luxe Embroidery Kurti Set</td>
                  <td className="py-4 px-2 text-gray-600">Pune, MH</td>
                  <td className="py-4 px-2 text-gray-900 font-bold">₹849.00</td>
                  <td className="py-4 px-2 text-emerald-600 font-bold">+₹280.00</td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Shielded
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
