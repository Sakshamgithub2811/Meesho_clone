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
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShieldCheck,
  Percent,
  Clock,
  ArrowRight,
  X,
  FileCheck2
} from 'lucide-react';

export default function SellerReturns1({ onNavigate, embedded = false, onNavigateTab }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [returnOrders, setReturnOrders] = useState([]);
  const [returnStats, setReturnStats] = useState({
    totalReturns: 0,
    pendingAction: 0,
    completedReturns: 0,
    returnRate: '0%',
    returnLossAmount: 0,
  });
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReturnsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [returnsRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierReturns(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (returnsRes.status === 'fulfilled' && returnsRes.value) {
        const data = returnsRes.value;
        const list = data.returns || (Array.isArray(data) ? data : []);
        setReturnOrders(list);
        if (data.stats) {
          setReturnStats(data.stats);
        }
      } else {
        setReturnOrders([]);
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Returns and RTO hub synchronized');
      }
    } catch (err) {
      console.error('Error loading returns:', err);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReturnsData();
  }, [loadReturnsData]);

  const handleTabChange = (tabId) => {
    if (onNavigateTab) return onNavigateTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn(err);
    } finally {
      clearAuthSession();
      toast.success('Logged out successfully');
      handleNav('/supplier-login');
    }
  };

  const handleAcknowledgeReturn = async (returnId) => {
    setActionLoadingId(returnId);
    try {
      await supplierApiService.updateReturnStatus(returnId, 'refunded');
      setReturnOrders((prev) =>
        prev.map((o) => (o.id === returnId || o.orderId === returnId ? { ...o, rtoStatus: 'REFUNDED', orderStatus: 'RETURNED' } : o))
      );
      toast.success('Return accepted and item marked as received in warehouse');
    } catch (err) {
      toast.error('Failed to update return status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReturns = returnOrders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const idMatch = (ord.orderId || ord.id || '').toLowerCase().includes(q);
    const itemMatch = (ord.product?.title || ord.items?.[0]?.product?.title || '').toLowerCase().includes(q);
    const userMatch = (ord.customer?.name || ord.user?.fullName || '').toLowerCase().includes(q);
    const reasonMatch = (ord.reason || '').toLowerCase().includes(q);
    return idMatch || itemMatch || userMatch || reasonMatch;
  });

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold tracking-wide uppercase mb-1">
              <RotateCcw className="w-3.5 h-3.5" />
              Reverse Logistics Hub
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Returns & RTO Claims Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track customer return requests, courier return-to-origin (RTO) parcels, and manage reverse stock reconciliations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReturnsData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Return Claims</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : (returnStats.totalReturns ?? returnOrders.length)}</p>
            <span className="text-[11px] text-slate-500">Live return incidents</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Inspection</span>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {loading ? '...' : (returnStats.pendingAction ?? returnOrders.filter((o) => ['REQUESTED', 'APPROVED'].includes(o.rtoStatus || o.orderStatus)).length)}
            </p>
            <span className="text-[11px] text-amber-600 font-medium">Awaiting return review</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Reconciled / Restocked</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {loading ? '...' : (returnStats.completedReturns ?? returnOrders.filter((o) => ['PICKED_UP', 'REFUNDED', 'RETURNED'].includes(o.rtoStatus || o.orderStatus)).length)}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Successfully processed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Return Rate</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : (returnStats.returnRate || '0%')}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Optimal platform benchmark</span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search return by Order ID, item, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition bg-slate-50/50"
            />
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredReturns.length === 0 ? (
            /* REAL EMPTY STATE */
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                <FileCheck2 className="w-8 h-8 opacity-80" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-slate-800">Zero Return & RTO Claims</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Excellent! There are currently no active return claims or RTO shipments pending for your supplier catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNav('/supplier-orders1')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <span>View Delivered Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-5">Order ID & Date</th>
                    <th className="py-4 px-4">Returned Product</th>
                    <th className="py-4 px-4">Customer Reason</th>
                    <th className="py-4 px-4">Reverse AWB</th>
                    <th className="py-4 px-4">Claim Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReturns.map((ord) => {
                    const status = (ord.rtoStatus || ord.orderStatus || 'REQUESTED').toUpperCase();
                    const isProcessed = ['RETURNED', 'REFUNDED'].includes(status);
                    const prod = ord.product || ord.items?.[0]?.product || {};
                    const displayId = String(ord.orderId || ord.id || '').slice(-8).toUpperCase();
                    const targetId = ord.returnRequestId || ord.id || ord.orderId;

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5">
                          <p className="font-mono font-bold text-slate-900">#{displayId}</p>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            {prod.image ? (
                              <img src={prod.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                                {prod.title || ord.items?.[0]?.productTitle || 'Merchandise Item'}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                Qty: {prod.quantity || 1} • ₹{Number(ord.totalAmount || prod.price || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 max-w-[220px]">
                          <p className="font-medium line-clamp-2">{ord.reason || 'Customer preference return'}</p>
                          {ord.customer?.name && (
                            <span className="text-[10px] text-slate-400">By: {ord.customer.name} ({ord.customer.city || 'India'})</span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] font-semibold text-slate-700">
                          {ord.awb || 'RTO-PENDING'}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isProcessed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : status.includes('REQUEST')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          {!isProcessed ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === targetId}
                              onClick={() => handleAcknowledgeReturn(targetId)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                            >
                              {actionLoadingId === targetId ? 'Processing...' : 'Accept & Restock'}
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Restocked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="returns"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {mainContent}

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
