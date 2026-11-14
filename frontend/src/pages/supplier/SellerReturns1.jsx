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
  FileCheck2,
  Eye,
  Camera,
  ShieldAlert,
  ExternalLink,
  Image as ImageIcon,
  User,
  MapPin,
  Truck,
  Download
} from 'lucide-react';
import { exportReturnsToCsv } from '../../utils/csvExport';

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
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activePhotoPreview, setActivePhotoPreview] = useState(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

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
        prev.map((o) =>
          o.id === returnId || o.orderId === returnId || o.returnRequestId === returnId
            ? { ...o, rtoStatus: 'REFUNDED', orderStatus: 'RETURNED' }
            : o
        )
      );
      if (selectedClaim && (selectedClaim.id === returnId || selectedClaim.orderId === returnId || selectedClaim.returnRequestId === returnId)) {
        setSelectedClaim((prev) => (prev ? { ...prev, rtoStatus: 'REFUNDED', orderStatus: 'RETURNED' } : null));
      }
      toast.success('Return accepted and item marked as received in warehouse');
    } catch (err) {
      toast.error('Failed to update return status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaim || !disputeReason.trim()) {
      toast.error('Please enter the reason for disputing this claim');
      return;
    }

    const targetId = selectedClaim.returnRequestId || selectedClaim.id || selectedClaim.orderId;
    setDisputeSubmitting(true);
    try {
      await supplierApiService.updateReturnStatus(targetId, 'disputed', {
        disputeReason: disputeReason.trim(),
      });
      setReturnOrders((prev) =>
        prev.map((o) =>
          o.id === targetId || o.orderId === targetId || o.returnRequestId === targetId
            ? { ...o, rtoStatus: 'DISPUTED', orderStatus: 'DISPUTED' }
            : o
        )
      );
      if (selectedClaim) {
        setSelectedClaim((prev) => (prev ? { ...prev, rtoStatus: 'DISPUTED', orderStatus: 'DISPUTED' } : null));
      }
      toast.success('Dispute raised successfully. MShoppy Trust & Safety team is reviewing evidence.');
      setDisputeModalOpen(false);
      setDisputeReason('');
    } catch (err) {
      toast.error('Failed to submit dispute');
    } finally {
      setDisputeSubmitting(false);
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

  const handleExportReturns = () => {
    const listToExport = filteredReturns.length > 0 ? filteredReturns : returnOrders;
    if (listToExport.length === 0) {
      toast.error('No return or RTO claims to export');
      return;
    }
    const count = exportReturnsToCsv(listToExport);
    toast.success(`Exported ${count} return & RTO claim(s) to CSV spreadsheet!`);
  };

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

          <div className="flex items-center gap-2.5">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportReturns}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition active:scale-95 cursor-pointer"
              title="Download reverse logistics and claim ledger in CSV / Excel format"
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => loadReturnsData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
                    const isDisputed = status === 'DISPUTED';
                    const prod = ord.product || ord.items?.[0]?.product || {};
                    const displayId = String(ord.orderId || ord.id || '').slice(-8).toUpperCase();
                    const targetId = ord.returnRequestId || ord.id || ord.orderId;
                    const proofCount = ord.proofImages?.length || 0;

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
                              <img src={prod.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1 max-w-[190px]">
                                {prod.title || ord.items?.[0]?.productTitle || 'Merchandise Item'}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                Qty: {prod.quantity || 1} • ₹{Number(ord.totalAmount || prod.price || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 max-w-[260px]">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-800 line-clamp-2">
                              {ord.reason || ord.customerReason || 'Customer return requested'}
                            </p>
                            {ord.customer?.name && (
                              <span className="text-[10px] text-slate-400 block">
                                By: {ord.customer.name} ({ord.customer.city || 'India'})
                              </span>
                            )}
                            {proofCount > 0 ? (
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedClaim(ord)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 transition cursor-pointer"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>{proofCount} Photo{proofCount > 1 ? 's' : ''}</span>
                                </button>
                                <div className="flex items-center -space-x-1.5">
                                  {ord.proofImages.slice(0, 3).map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt="Proof thumbnail"
                                      onClick={() => {
                                        setSelectedClaim(ord);
                                        setActivePhotoPreview(img);
                                      }}
                                      className="w-6 h-6 rounded-md object-cover border-2 border-white shadow-xs cursor-pointer hover:scale-110 hover:z-10 transition"
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block">
                                No proof photos (Courier RTO)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 block">
                            {ord.awb || 'RTO-PENDING'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ord.courier || 'Reverse Logistics'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isProcessed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isDisputed
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : status.includes('REQUEST') || status.includes('PENDING')
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {status}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                              {ord.claimType === 'CUSTOMER_RETURN'
                                ? 'Customer Claim'
                                : ord.claimType === 'COURIER_CANCELLED'
                                ? 'Pre-Dispatch Cancel'
                                : 'Courier RTO'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedClaim(ord)}
                              title="Inspect Customer Claim & Proof Evidence"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Inspect</span>
                            </button>

                            {!isProcessed && !isDisputed ? (
                              <button
                                type="button"
                                disabled={actionLoadingId === targetId}
                                onClick={() => handleAcknowledgeReturn(targetId)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                              >
                                {actionLoadingId === targetId ? 'Processing...' : 'Accept'}
                              </button>
                            ) : isDisputed ? (
                              <span className="text-purple-600 font-bold text-xs inline-flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                                <ShieldAlert className="w-3.5 h-3.5" /> Disputed
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Restocked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CLAIM EVIDENCE & INSPECTION MODAL */}
        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Customer Return Claim Evidence</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Claim #{String(selectedClaim.orderId || selectedClaim.id || '').slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Logged on {new Date(selectedClaim.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} • Status: <span className="font-bold text-slate-800">{selectedClaim.rtoStatus || selectedClaim.orderStatus}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product & Refund Value */}
              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                {selectedClaim.product?.image ? (
                  <img
                    src={selectedClaim.product.image}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {selectedClaim.product?.title || 'Merchandise Item'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>Qty: <strong className="text-slate-800">{selectedClaim.product?.quantity || 1}</strong></span>
                    <span>Item Price: <strong className="text-slate-800">₹{Number(selectedClaim.product?.price || 0).toLocaleString('en-IN')}</strong></span>
                    <span>Total Claim Value: <strong className="text-rose-600">₹{Number(selectedClaim.totalAmount || 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
              </div>

              {/* Customer & Reverse Logistics Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer Details</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedClaim.customer?.name || 'Customer'}</p>
                  <p className="text-slate-500">Phone: {selectedClaim.customer?.phone || 'N/A'}</p>
                  <p className="text-slate-500">Location: {selectedClaim.customer?.city || 'India'}, {selectedClaim.customer?.state || ''}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reverse Logistics & AWB</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900">{selectedClaim.awb || 'RTO-PENDING'}</p>
                  <p className="text-slate-500">Partner: {selectedClaim.courier || 'Delhivery Reverse Logistics'}</p>
                  <p className="text-slate-500">Claim Type: {selectedClaim.claimType || 'CUSTOMER_RETURN'}</p>
                </div>
              </div>

              {/* Customer Stated Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer Return Reason & Remarks
                </label>
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-slate-800 text-xs leading-relaxed font-medium">
                  {selectedClaim.reason || selectedClaim.customerReason || 'Customer reported return request without extra remarks.'}
                </div>
              </div>

              {/* Customer Defect Proof Photos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-500" />
                    <span>Customer Defect Proof Evidence ({selectedClaim.proofImages?.length || 0})</span>
                  </label>
                  {selectedClaim.proofImages?.length > 0 && (
                    <span className="text-[11px] text-slate-400">Click photo to view high-resolution</span>
                  )}
                </div>

                {selectedClaim.proofImages && selectedClaim.proofImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedClaim.proofImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePhotoPreview(imgUrl)}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer hover:shadow-md transition"
                      >
                        <img
                          src={imgUrl}
                          alt={`Proof evidence #${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Eye className="w-4 h-4" />
                          <span>View Full</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                    <ImageIcon className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No Customer Proof Photos Attached</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      This return is classified as a Courier RTO or parcel refusal at doorstep before package delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {!['RETURNED', 'REFUNDED', 'DISPUTED'].includes((selectedClaim.rtoStatus || selectedClaim.orderStatus || '').toUpperCase()) && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDisputeModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Raise SPF Dispute</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionLoadingId === (selectedClaim.returnRequestId || selectedClaim.id || selectedClaim.orderId)}
                        onClick={() => handleAcknowledgeReturn(selectedClaim.returnRequestId || selectedClaim.id || selectedClaim.orderId)}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === (selectedClaim.returnRequestId || selectedClaim.id || selectedClaim.orderId)
                          ? 'Processing...'
                          : 'Accept & Restock Item'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPF DISPUTE MODAL */}
        {disputeModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Supplier Protection Fund (SPF)</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Dispute Customer Return Claim
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Submit an operational dispute if the customer sent a wrong item, counterfeit product, damaged merchandise, or an empty parcel.
              </p>

              <form onSubmit={handleDisputeSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Dispute Explanation & Evidence Summary *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g. Received empty outer box with torn security tape; item serial number does not match original shipment..."
                    className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputeModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting || !disputeReason.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {disputeSubmitting ? 'Submitting...' : 'Submit Dispute'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PHOTO LIGHTBOX PREVIEW */}
        {activePhotoPreview && (
          <div
            onClick={() => setActivePhotoPreview(null)}
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center cursor-default"
            >
              <button
                type="button"
                onClick={() => setActivePhotoPreview(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={activePhotoPreview}
                alt="High-resolution customer return proof"
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
              <div className="p-3 text-center text-xs text-slate-300 font-medium">
                Customer Uploaded Defect Proof Photo
              </div>
            </div>
          </div>
        )}
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
