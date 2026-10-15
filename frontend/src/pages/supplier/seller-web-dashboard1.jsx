import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  RotateCcw,
  PlusCircle,
  Store,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  Box,
  Layers,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { SUPPLIER_MENU } from './supplierNavConfig';

export default function SellerWebDashboard1({ onNavigate, onBack }) {
  const navigate = useNavigate();

  // Navigation Helper
  const handleNav = useCallback((path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  }, [onNavigate, navigate]);

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Real Dynamic Data States (No Hardcoded Mock Data)
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch real data from backend
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all dynamic metrics in parallel
      const [statsRes, profileRes, productsRes, ordersRes] = await Promise.allSettled([
        supplierApiService.fetchDashboardStats(),
        supplierApiService.fetchSupplierProfile(),
        supplierApiService.fetchSupplierProducts({ limit: 6 }),
        supplierApiService.fetchSupplierOrders(),
      ]);

      // 1. Stats
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      } else {
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          lowStockCount: 0,
          recentOrders: [],
        });
      }

      // 2. Profile
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile(profileRes.value);
      } else {
        const stored = getCurrentSupplier();
        setProfile(stored || null);
      }

      // 3. Products
      if (productsRes.status === 'fulfilled' && productsRes.value) {
        const prodData =
          productsRes.value.data ||
          productsRes.value.products ||
          (Array.isArray(productsRes.value) ? productsRes.value : []);
        setProducts(prodData);
      } else {
        setProducts([]);
      }

      // 4. Orders
      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const ordData =
          ordersRes.value.data ||
          ordersRes.value.orders ||
          (Array.isArray(ordersRes.value) ? ordersRes.value : []);
        setOrders(ordData);
      } else {
        setOrders([]);
      }

      if (isRefresh) {
        toast.success('Live dashboard data updated');
      }
    } catch (err) {
      console.error('Failed to load supplier dashboard data:', err);
      setError(err.message || 'Unable to connect to supplier services. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Tab Switch / Route Navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item && item.path) {
      handleNav(item.path);
    }
  };

  // Safe Logout Handler
  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) {
        await supplierApiService.logoutSupplier().catch(() => {});
      }
      if (auth) {
        await signOut(auth).catch(() => {});
      }
    } catch (err) {
      console.warn('Logout cleanup warning:', err);
    } finally {
      clearAuthSession();
      localStorage.removeItem('meesho_supplier_token');
      localStorage.removeItem('meesho_supplier_user');
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplier');
      sessionStorage.clear();
      toast.success('Successfully logged out of Supplier portal');
      handleNav('/supplier-login');
    }
  };

  const supplierDisplayName =
    profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';
  const supplierRoleTitle = profile?.tierLabel || 'MShoppy Supplier';

  // Compute combined recent orders from stats or orders list
  const recentOrdersList =
    stats?.recentOrders && stats.recentOrders.length > 0
      ? stats.recentOrders
      : orders.slice(0, 5).map((o) => ({
          orderId: o.id || o.orderId || '#ORD-LIVE',
          productTitle: o.productTitle || o.title || o.product?.title || 'Catalog Item',
          quantity: o.quantity || 1,
          price: o.price || o.totalAmount || 0,
          status: o.orderStatus || o.status || 'Pending',
          createdAt: o.createdAt || new Date().toISOString(),
        }));

  const activeProductsCount =
    stats?.totalProducts !== undefined ? stats.totalProducts : products.length;
  const totalRevenueAmount = stats?.totalRevenue || 0;
  const totalOrdersCount = stats?.totalOrders || orders.length;
  const lowStockItemsCount = stats?.lowStockCount || 0;

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ======================================================== */}
        {/* 1. TOP HERO / WELCOME BANNER (Dynamic & Real) */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5a0624] via-[#850d3a] to-[#b7004d] p-6 sm:p-8 text-white shadow-xl shadow-pink-950/10 border border-pink-700/30">
          {/* Subtle Ambient Background Ornaments */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-pink-400/10 blur-3xl pointer-events-none" />
          <div className="absolute right-32 -bottom-20 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase text-pink-200">
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                <span>Supplier Operations Console</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 normal-case font-medium text-[11px]">System Live</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {supplierDisplayName}
              </h1>

              <p className="text-sm text-pink-100/90 leading-relaxed max-w-xl">
                Manage your real-time catalog, process dispatch orders, track inventory stock levels, and monitor wholesale settlement payouts.
              </p>

              {/* Status Pills */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white font-medium backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {supplierRoleTitle}
                </span>
                {profile?.email && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-black/20 text-pink-100 font-mono text-[11px]">
                    {profile.email}
                  </span>
                )}
                {profile?.phone && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-black/20 text-pink-100 font-mono text-[11px]">
                    📞 +91 {profile.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons in Banner */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => handleNav('/supplier-add-product1')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#b7004d] hover:bg-pink-50 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('/supplier-inventory1')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Manage Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                title="Refresh Live Data"
                className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert with Retry if API failed */}
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">API Connection Notice</p>
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadDashboardData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. REAL METRIC KPI CARDS (Live Data, No Mock) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Revenue
              </span>
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  `₹${Number(totalRevenueAmount).toLocaleString('en-IN')}`
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                <span>Gross sales across all processed orders</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Orders
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  Number(totalOrdersCount).toLocaleString('en-IN')
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Dispatched & Received orders</span>
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-orders1')}
                  className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Active Catalog Items */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Catalog
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  Number(activeProductsCount).toLocaleString('en-IN')
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Live listed wholesale items</span>
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-inventory1')}
                  className="text-emerald-600 hover:text-emerald-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  Catalog <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Low Stock Alert
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  Number(lowStockItemsCount).toLocaleString('en-IN')
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {lowStockItemsCount > 0 ? (
                  <span className="text-amber-600 font-bold">Needs immediate inventory replenishment</span>
                ) : (
                  <span className="text-emerald-600 font-medium">All listed stock levels optimal</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN WORKFLOW SHORTCUTS */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Supplier Workflows & Services</h2>
              <p className="text-xs text-slate-500">Direct shortcuts to dispatch, catalog, and settlements</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                title: 'Add Product',
                desc: 'Upload to catalog',
                icon: PlusCircle,
                color: 'text-pink-600 bg-pink-50 border-pink-100',
                path: '/supplier-add-product1',
              },
              {
                title: 'Inventory Hub',
                desc: 'Stock & pricing',
                icon: Package,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                path: '/supplier-inventory1',
              },
              {
                title: 'Orders Dispatch',
                desc: 'Fulfill customer orders',
                icon: ShoppingCart,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                path: '/supplier-orders1',
              },
              {
                title: 'Dropship Portal',
                desc: 'Wholesale partner orders',
                icon: Truck,
                color: 'text-blue-600 bg-blue-50 border-blue-100',
                path: '/supplier-dropship1',
              },
              {
                title: 'Returns & RTO',
                desc: 'Track return claims',
                icon: RotateCcw,
                color: 'text-rose-600 bg-rose-50 border-rose-100',
                path: '/supplier-returns1',
              },
              {
                title: 'KYC & Profile',
                desc: 'Bank & GST details',
                icon: Store,
                color: 'text-amber-600 bg-amber-50 border-amber-100',
                path: '/supplier-profile1',
              },
            ].map((shortcut) => (
              <button
                key={shortcut.title}
                type="button"
                onClick={() => handleNav(shortcut.path)}
                className="p-4 rounded-2xl border text-left hover:shadow-md transition-all active:scale-95 cursor-pointer flex flex-col justify-between group bg-slate-50/50 hover:bg-white"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 ${shortcut.color} group-hover:scale-105 transition-transform`}
                >
                  <shortcut.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#b7004d] transition-colors">
                    {shortcut.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{shortcut.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. REAL RECENT ORDERS & REAL PRODUCT CATALOG */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Recent Orders Table */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#b7004d]" />
                  <span>Recent Customer Orders</span>
                </h2>
                <p className="text-xs text-slate-500">Live order stream received for your catalog</p>
              </div>

              {recentOrdersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-orders1')}
                  className="text-xs font-bold text-[#b7004d] hover:text-[#9e003f] inline-flex items-center gap-1 cursor-pointer"
                >
                  View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 mt-4">
              {loading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : recentOrdersList.length === 0 ? (
                /* REAL EMPTY STATE: No dummy data */
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#b7004d] flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-sm font-bold text-slate-800">No Orders Received Yet</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      As customers and dropshippers place orders for your products, order items and shipping labels will appear here automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/supplier-inventory1')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Check Product Inventory</span>
                  </button>
                </div>
              ) : (
                /* REAL ORDERS LIST */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-2">Order ID</th>
                        <th className="py-3 px-2">Product</th>
                        <th className="py-3 px-2">Qty</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentOrdersList.map((order, idx) => (
                        <tr key={order.orderId || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-2 font-mono font-bold text-slate-800">
                            {order.orderId || `#ORD-${1000 + idx}`}
                          </td>
                          <td className="py-3.5 px-2 font-medium text-slate-700 max-w-[160px] truncate">
                            {order.productTitle || 'Catalog Product'}
                          </td>
                          <td className="py-3.5 px-2 text-slate-600 font-medium">
                            {order.quantity || 1}
                          </td>
                          <td className="py-3.5 px-2 font-bold text-slate-900">
                            ₹{Number(order.price || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                String(order.status).toLowerCase().includes('delivered')
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : String(order.status).toLowerCase().includes('shipped')
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {order.status || 'Processing'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Real Catalog Products */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#b7004d]" />
                  <span>Live Catalog Products</span>
                </h2>
                <p className="text-xs text-slate-500">Real items currently in wholesale inventory</p>
              </div>

              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-inventory1')}
                  className="text-xs font-bold text-[#b7004d] hover:text-[#9e003f] inline-flex items-center gap-1 cursor-pointer"
                >
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 mt-4">
              {loading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                /* REAL EMPTY STATE: No dummy data */
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#b7004d] flex items-center justify-center shadow-inner">
                    <Package className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-sm font-bold text-slate-800">No Products Listed Yet</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your catalog is currently empty. Add your first wholesale product to start receiving orders across India.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/supplier-add-product1')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white text-xs font-bold shadow-md shadow-pink-600/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add First Product</span>
                  </button>
                </div>
              ) : (
                /* REAL PRODUCT LIST */
                <div className="space-y-3">
                  {products.slice(0, 5).map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-pink-200 bg-slate-50/40 hover:bg-white transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prod.images && prod.images[0] ? (
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center shrink-0">
                            <Box className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {prod.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Stock: <span className={prod.stock < 10 ? 'text-amber-600 font-bold' : 'text-slate-600'}>{prod.stock ?? 0} units</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          ₹{Number(prod.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleNav('/add-product')}
                    className="w-full py-2.5 rounded-2xl border border-dashed border-pink-300 text-[#b7004d] hover:bg-pink-50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Another Product</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Secure Supplier Logout */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
        title="Log out of Supplier Portal?"
        description="Are you sure you want to end your supplier session? You can log back in at any time with your credentials."
        confirmText="Yes, Logout"
      />
    </DashboardLayout>
  );
}
