import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  ExternalLink,
  Truck,
  RotateCcw,
  Banknote,
  LineChart,
  Store,
  Box
} from 'lucide-react';

export default function SupplierDashboardOverview({
  onNavigateTab,
  stats,
  products = [],
  orders = [],
  profile,
  kycData,
  loading = false,
  refreshing = false,
  onRefresh
}) {
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const supplierDisplayName =
    (typeof profile?.storeName === 'string' && profile.storeName.trim()) ||
    (typeof profile?.fullName === 'string' && profile.fullName.trim()) ||
    (typeof profile?.name === 'string' && profile.name.trim()) ||
    'Verified Supplier';

  const supplierRoleTitle =
    (typeof profile?.tierLabel === 'string' && profile.tierLabel) || 'MShoppy Supplier';

  // Compute combined recent orders from stats or orders list
  const recentOrdersList =
    Array.isArray(stats?.recentOrders) && stats.recentOrders.length > 0
      ? stats.recentOrders
      : safeOrders.slice(0, 5).map((o, idx) => ({
          orderId: o?.id || o?.orderId || `#ORD-${1000 + idx}`,
          productTitle: o?.productTitle || o?.title || o?.product?.title || 'Catalog Item',
          quantity: o?.quantity || 1,
          price: o?.price || o?.totalAmount || 0,
          status: o?.orderStatus || o?.status || 'Pending',
          createdAt: o?.createdAt || new Date().toISOString(),
        }));

  const activeProductsCount =
    typeof stats?.totalProducts === 'number' ? stats.totalProducts : safeProducts.length;
  const totalRevenueAmount = stats?.totalRevenue || 0;
  const totalOrdersCount =
    typeof stats?.totalOrders === 'number' ? stats.totalOrders : safeOrders.length;
  const lowStockItemsCount = stats?.lowStockCount || 0;

  return (
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
              <span>Unified Supplier Control Center</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 normal-case font-medium text-[11px]">SPA Live</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {supplierDisplayName}
            </h1>

            <p className="text-sm text-pink-100/90 leading-relaxed max-w-xl">
              Switch seamlessly across orders, catalog, financial payouts, dropship fulfillment, and live analytics with zero page reloads.
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
              onClick={() => onNavigateTab('add-product')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#b7004d] hover:bg-pink-50 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Manage Catalog</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh Live Data"
                className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic KYC Compliance Alert */}
      {kycData?.status === 'APPROVED' ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900">Verified Merchant Account</span>
              <p className="text-[11px] text-emerald-700">Your business KYC is fully verified. Automated daily settlements are active.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('kyc')}
            className="text-xs font-bold text-emerald-800 hover:underline shrink-0 cursor-pointer"
          >
            View Verification ➔
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d82a62] text-white flex items-center justify-center shrink-0 shadow-sm shadow-pink-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {kycData ? `KYC Status: ${kycData.status}` : 'Action Required: Supplier KYC Verification'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#b7004d] text-[10px] font-bold">
                  {kycData?.status || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete GSTIN, PAN, and Bank verification to activate wholesale catalog distribution and daily bank payouts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('kyc')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
          >
            <span>{kycData ? 'Check KYC Status' : 'Complete KYC Verification'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REAL METRIC KPI CARDS (Live Data, No Mock) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div 
          onClick={() => onNavigateTab('finance')}
          className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
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
            <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
              <span>Gross sales processed</span>
              <span className="text-[#b7004d] font-bold inline-flex items-center gap-0.5">
                Payouts <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
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
              <span>Fulfillment & Dispatch</span>
              <span className="text-indigo-600 font-bold inline-flex items-center gap-0.5">
                Orders <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Catalog Items */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
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
              <span className="text-emerald-600 font-bold inline-flex items-center gap-0.5">
                Catalog <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stock Warnings
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
            <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
              <span>{lowStockItemsCount > 0 ? 'Items need replenishment' : 'All inventory healthy'}</span>
              <span className="text-amber-600 font-bold inline-flex items-center gap-0.5">
                Restock <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. QUICK ACCESS FEATURE TILES (SPA Tab Switching) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Settlements Hub */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center shrink-0 group-hover:bg-[#b7004d] group-hover:text-white transition-colors">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b7004d] transition-colors">
              Settlements & Payouts
            </h4>
            <p className="text-xs text-slate-500">0% Commission, Escrow & Ledger</p>
          </div>
        </div>

        {/* Dropship Hub */}
        <div
          onClick={() => onNavigateTab('dropship')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              Dropship Logistics
            </h4>
            <p className="text-xs text-slate-500">Print packing slips & dispatch</p>
          </div>
        </div>

        {/* Returns & RTO */}
        <div
          onClick={() => onNavigateTab('returns')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
              Returns & RTO Hub
            </h4>
            <p className="text-xs text-slate-500">Customer returns & reverse log</p>
          </div>
        </div>

        {/* Sales Analytics */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
              Sales Analytics
            </h4>
            <p className="text-xs text-slate-500">Trends, conversion & growth</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. RECENT ORDERS & CATALOG PREVIEW SECTION */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Stream (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Orders Stream</h3>
              <p className="text-xs text-slate-500">Live order flow ready for processing and dispatch</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#b7004d] hover:text-[#880e4f] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : recentOrdersList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No Orders Yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Once customer orders arrive for your wholesale catalog products, they will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Product Item</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrdersList.map((order, idx) => {
                    const statusStr = String(order.status || 'Pending').toUpperCase();
                    const isDelivered = statusStr === 'DELIVERED';
                    const isShipped = statusStr === 'SHIPPED';
                    const isCancelled = statusStr === 'CANCELLED';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-800">
                          {order.orderId}
                        </td>
                        <td className="py-3 font-medium text-slate-700 max-w-[180px] truncate">
                          {order.productTitle}
                        </td>
                        <td className="py-3 text-slate-600 font-semibold">
                          {order.quantity}
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          ₹{Number(order.price || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800'
                                : isShipped
                                ? 'bg-blue-100 text-blue-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDelivered
                                  ? 'bg-emerald-600'
                                  : isShipped
                                  ? 'bg-blue-600'
                                  : isCancelled
                                  ? 'bg-rose-600'
                                  : 'bg-amber-600'
                              }`}
                            />
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onNavigateTab('orders')}
                            className="text-[#b7004d] hover:underline font-bold text-xs cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Catalog Preview Highlights (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Active Listings</h3>
                <p className="text-xs text-slate-500">Fast preview of your wholesale catalog</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Catalog ➔
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : safeProducts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#b7004d] mx-auto flex items-center justify-center mb-3">
                  <Box className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No Products Listed</p>
                <p className="text-xs text-slate-400 mt-1">Start listing items to begin receiving reseller orders.</p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('add-product')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#b7004d] text-white text-xs font-bold shadow-sm hover:bg-[#880e4f] transition cursor-pointer"
                >
                  + Add First Product
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {safeProducts.slice(0, 4).map((p, idx) => {
                  const title = p.title || p.name || 'Catalog Item';
                  const price = p.price || p.regularPrice || 0;
                  const stock = typeof p.stock === 'number' ? p.stock : 0;
                  const img = (Array.isArray(p.images) && p.images[0]) || p.image || null;

                  return (
                    <div
                      key={p.id || idx}
                      onClick={() => onNavigateTab('inventory')}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/20 transition-all flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {img ? (
                          <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#b7004d] transition-colors">
                          {title}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-extrabold text-slate-900">₹{Number(price).toLocaleString('en-IN')}</span>
                          <span>•</span>
                          <span className={stock < 10 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-semibold'}>
                            {stock} in stock
                          </span>
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
              onClick={() => onNavigateTab('add-product')}
              className="w-full py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#b7004d] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Catalog Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
