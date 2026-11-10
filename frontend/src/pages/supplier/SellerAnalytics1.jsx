import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  LineChart,
  TrendingUp,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Package,
  Truck,
  RotateCcw,
  CheckCircle2,
  Box,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function SellerAnalytics1({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [timeframe, setTimeframe] = useState('6M');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadAnalyticsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [analyticsRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierAnalytics(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalyticsData(analyticsRes.value);
      } else {
        setAnalyticsData({
          kpis: {
            totalSales: 0,
            totalOrders: 0,
            activeListings: 0,
            avgOrderValue: 0,
            fulfillmentRate: 100,
            returnRate: 0,
          },
          pipeline: {
            pending: 0,
            shipped: 0,
            delivered: 0,
            returns: 0,
          },
          revenueTrends: [],
          topProducts: [],
        });
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Live analytics data refreshed from database');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Failed to load supplier analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleTabChange = (tabId) => {
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      clearAuthSession();
      toast.success('Successfully logged out of Supplier portal');
      handleNav('/supplier-login');
    }
  };

  const supplierDisplayName =
    profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  const kpis = analyticsData?.kpis || {};
  const pipeline = analyticsData?.pipeline || {};
  const trends = analyticsData?.revenueTrends || [];
  const topProducts = analyticsData?.topProducts || [];

  const maxRevenue = Math.max(...trends.map((t) => t.revenue || 0), 1000);

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="analytics"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ======================================================== */}
        {/* 1. TOP HERO BANNER */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#b7004d] p-6 sm:p-8 text-white shadow-xl shadow-pink-950/10 border border-pink-700/30">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase text-pink-200">
                <LineChart className="w-3.5 h-3.5 text-pink-300" />
                <span>Business Intelligence & Performance</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 normal-case font-medium text-[11px]">Real-Time Sync</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Sales Analytics 📊
              </h1>
              <p className="text-sm text-pink-100/90 leading-relaxed max-w-xl">
                Gain insights into revenue velocity, product demand patterns, dispatch fulfillment speed, and return rates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadAnalyticsData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Sync Live'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 4 KEY METRIC CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Sales */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
              <div className="w-9 h-9 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(kpis.totalSales || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#b7004d] font-bold">
                All Processed
              </span>
              <span className="text-slate-400">Total volume</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders Dispatched</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {Number(kpis.totalOrders || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Active catalog:</span>
              <span className="font-bold text-slate-800">{kpis.activeListings || 0} listings</span>
            </div>
          </div>

          {/* Card 3: Avg Order Value */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Order Value (AOV)</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(kpis.avgOrderValue || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                Per Cart Basket
              </span>
            </div>
          </div>

          {/* Card 4: Fulfillment Rate */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment Rate</span>
              <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.fulfillmentRate ?? 100}%
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold">
                RTO: {kpis.returnRate ?? 0}%
              </span>
              <span className="text-slate-400">High Reliability</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. ORDER PIPELINE DISTRIBUTION */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Order Lifecycle Pipeline</h3>
              <p className="text-xs text-slate-500">Real-time status breakdown across all received orders</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs font-bold text-amber-700 block">Pending Dispatch</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">{pipeline.pending || 0}</span>
              <span className="text-[11px] text-amber-600 mt-0.5 block">Requires packing</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs font-bold text-blue-700 block">In Transit</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">{pipeline.shipped || 0}</span>
              <span className="text-[11px] text-blue-600 mt-0.5 block">With courier fleet</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 block">Delivered & Settled</span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">{pipeline.delivered || 0}</span>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">Customer received</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-bold text-rose-700 block">Returns & RTO</span>
              <span className="text-2xl font-black text-rose-900 mt-1 block">{pipeline.returns || 0}</span>
              <span className="text-[11px] text-rose-600 mt-0.5 block">Reversed / Cancelled</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. REVENUE CHARTS & TOP PERFORMING PRODUCTS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trends Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Monthly Revenue Velocity</h3>
                  <p className="text-xs text-slate-500">Gross sales aggregated strictly from delivered order items</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {['3M', '6M'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeframe(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        timeframe === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
              ) : trends.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  No monthly trends available yet
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 px-2">
                    {trends.map((item, idx) => {
                      const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{Math.round(item.revenue / 1000)}k
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-[#b7004d] to-[#ff7293] group-hover:from-[#92003d] group-hover:to-[#b7004d] transition-all shadow-xs"
                          />
                          <span className="text-[11px] font-bold text-slate-500 mt-1">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b7004d]" /> Gross Settled Revenue
              </span>
              <span>Updated in real-time</span>
            </div>
          </div>

          {/* Top Selling Products (1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Top Sellers</h3>
                  <p className="text-xs text-slate-500">Highest volume items</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-inventory1')}
                  className="text-xs font-bold text-[#b7004d] hover:underline cursor-pointer"
                >
                  Catalog ➔
                </button>
              </div>

              {loading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No product sales records yet
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.slice(0, 5).map((prod, idx) => {
                    return (
                      <div
                        key={prod.id || idx}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/20 transition-all flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 truncate">
                            {prod.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-extrabold text-slate-900">₹{Number(prod.price || 0).toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{prod.unitsSold} sold</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => handleNav('/supplier-add-product1')}
                className="w-full py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#b7004d] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>+ List More Inventory</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
        title="Log out of Supplier Portal?"
        description="Are you sure you want to end your supplier session?"
        confirmText="Yes, Logout"
      />
    </DashboardLayout>
  );
}

