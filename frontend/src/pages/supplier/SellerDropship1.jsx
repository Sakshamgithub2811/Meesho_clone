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
  Truck,
  Package,
  Layers,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  ShieldCheck,
  Percent,
  IndianRupee,
  Box,
  FileText
} from 'lucide-react';

export default function SellerDropship1({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'catalog'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedPackingSlip, setSelectedPackingSlip] = useState(null);

  const loadDropshipData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [ordersRes, prodsRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierOrders(),
        supplierApiService.fetchSupplierProducts({ limit: 50 }),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const ordData =
          ordersRes.value.data ||
          ordersRes.value.orders ||
          (Array.isArray(ordersRes.value) ? ordersRes.value : []);
        setOrders(ordData);
      } else {
        setOrders([]);
      }

      if (prodsRes.status === 'fulfilled' && prodsRes.value) {
        const prodData =
          prodsRes.value.data ||
          prodsRes.value.products ||
          (Array.isArray(prodsRes.value) ? prodsRes.value : []);
        setProducts(prodData);
      } else {
        setProducts([]);
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Dropship dispatch data updated');
      }
    } catch (err) {
      console.error('Dropship data error:', err);
      toast.error('Failed to load dropship data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDropshipData();
  }, [loadDropshipData]);

  const handleTabChange = (tabId) => {
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

  const handleDispatchOrder = async (orderId) => {
    try {
      await supplierApiService.updateOrderStatus(orderId, 'SHIPPED');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'SHIPPED' } : o))
      );
      toast.success('Dropship order marked as dispatched & handed to logistics');
    } catch (err) {
      toast.error('Failed to update dispatch status');
    }
  };

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="dropship"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-1">
              <Truck className="w-3.5 h-3.5" />
              Wholesale Partner Fulfillment
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Dropship Fulfilment Console
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fulfill dropship orders generated by resellers, print standardized shipping labels, and manage wholesale margins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadDropshipData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dropship Orders</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : orders.length}</p>
            <span className="text-[11px] text-slate-500">Live network orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Pending Dispatch</span>
            <p className="text-2xl font-black text-blue-700 mt-1">
              {loading ? '...' : orders.filter((o) => ['ORDERED', 'CONFIRMED', 'PENDING'].includes((o.orderStatus || o.status || '').toUpperCase())).length}
            </p>
            <span className="text-[11px] text-blue-600 font-medium">Packing slips needed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Wholesale Items</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{loading ? '...' : products.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Available for reseller sharing</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Sync Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-base font-black text-slate-900">Auto-Dispatched</p>
            </div>
            <span className="text-[11px] text-slate-500">Zero delay webhook sync</span>
          </div>
        </div>

        {/* Sub-tab Navigation: Orders Stream vs Wholesale Catalog */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fulfillment Queue ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Wholesale Catalog & Margin Sync ({products.length})
          </button>
        </div>

        {/* Sub-tab 1: Orders Fulfillment Queue */}
        {activeSubTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              /* REAL EMPTY STATE */
              <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <Truck className="w-8 h-8 opacity-80" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-slate-800">No Dropship Orders Pending</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    When dropshippers and resellers sell your wholesale catalog items on social networks, dispatch tickets will populate here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-inventory1')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
                >
                  <Package className="w-4 h-4" />
                  <span>Review Wholesale Catalog</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-4 px-5">Order ID & Date</th>
                      <th className="py-4 px-4">Item & Quantity</th>
                      <th className="py-4 px-4">Wholesale Settlement</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => {
                      const status = (ord.orderStatus || ord.status || 'ORDERED').toUpperCase();
                      const isShipped = status === 'SHIPPED' || status === 'DELIVERED';
                      const itemTitle = ord.items?.[0]?.product?.title || ord.items?.[0]?.productTitle || 'Catalog Product';

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-mono font-bold text-slate-900 block">
                              #{String(ord.id).slice(-8).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                            </span>
                          </td>

                          <td className="py-4 px-4 max-w-[220px]">
                            <p className="font-bold text-slate-800 truncate">{itemTitle}</p>
                            <p className="text-[11px] text-slate-400">Qty: {ord.items?.[0]?.quantity || 1} units</p>
                          </td>

                          <td className="py-4 px-4 font-black text-slate-900 text-sm">
                            ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isShipped
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              {!isShipped && (
                                <button
                                  type="button"
                                  onClick={() => handleDispatchOrder(ord.id)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                                >
                                  Dispatch
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedPackingSlip(ord)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                title="Print Packing Slip"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
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
        )}

        {/* Sub-tab 2: Wholesale Catalog & Margin Sync */}
        {activeSubTab === 'catalog' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Wholesale Channel Sync</h3>
                <p className="text-xs text-slate-500">Items listed here are automatically made available to verified dropshippers with wholesale margins.</p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No catalog items available. Add products to activate wholesale syndication.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => {
                  const wholesaleCost = Math.round(Number(prod.price || 0) * 0.8);
                  const suggestedMargin = Number(prod.price || 0) - wholesaleCost;

                  return (
                    <div key={prod.id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/40 space-y-3">
                      <div className="flex items-center gap-3">
                        {prod.images?.[0] || prod.imageUrl ? (
                          <img
                            src={prod.images?.[0] || prod.imageUrl}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Box className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{prod.title}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">Stock: {prod.stock} units</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Wholesale Cost</span>
                          <span className="font-bold text-slate-800">₹{wholesaleCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Reseller Margin</span>
                          <span className="font-bold text-emerald-600">+₹{suggestedMargin.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Printable Packing Slip Modal */}
        {selectedPackingSlip && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">MShoppy Logistics</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Standard Dropship Slip</span>
                </div>
                <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                  #{String(selectedPackingSlip.id).slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="text-xs space-y-2 py-2">
                <p><strong className="text-slate-700">Supplier:</strong> {supplierDisplayName}</p>
                <p><strong className="text-slate-700">Recipient:</strong> {selectedPackingSlip.user?.fullName || selectedPackingSlip.customerName || 'Customer'}</p>
                <p><strong className="text-slate-700">Address:</strong> {selectedPackingSlip.shippingAddress || 'India Post Delivery Zone'}</p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-800 mb-1">Package Contents:</p>
                  <p className="text-slate-600">{selectedPackingSlip.items?.[0]?.product?.title || selectedPackingSlip.items?.[0]?.productTitle || 'Catalog Merchandise'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPackingSlip(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                >
                  Print Slip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
