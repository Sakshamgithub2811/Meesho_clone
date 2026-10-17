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
  ShoppingCart,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  Eye,
  IndianRupee,
  Filter,
  X,
  User,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'ORDERED', label: 'New / Ordered' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export default function SellerOrders1({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [profile, setProfile] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load real orders from backend
  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [ordersRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierOrders(),
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

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Live supplier orders updated');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      toast.error('Failed to load orders from server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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

  // Update real order status via API
  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await supplierApiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
      toast.success(`Order #${orderId.slice(-6)} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filter orders dynamically
  const filteredOrders = orders.filter((order) => {
    const status = (order.orderStatus || order.status || '').toUpperCase();
    const statusMatch = selectedStatus === 'ALL' || status === selectedStatus;

    const query = searchQuery.toLowerCase();
    const idMatch = (order.id || '').toLowerCase().includes(query);
    const userMatch = (order.user?.fullName || order.customerName || '').toLowerCase().includes(query);
    const itemMatch = (order.items || []).some((item) =>
      (item.product?.title || item.productTitle || '').toLowerCase().includes(query)
    );

    return statusMatch && (idMatch || userMatch || itemMatch);
  });

  // Calculate real metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) =>
    ['ORDERED', 'PENDING', 'CONFIRMED'].includes((o.orderStatus || o.status || '').toUpperCase())
  ).length;
  const shippedOrdersCount = orders.filter((o) =>
    ['SHIPPED', 'OUT_FOR_DELIVERY'].includes((o.orderStatus || o.status || '').toUpperCase())
  ).length;
  const deliveredOrdersCount = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED'].includes((o.orderStatus || o.status || '').toUpperCase())
  ).length;

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="orders"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              Live Order Fulfillment
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Orders & Dispatch
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review received customer orders, confirm stock allocations, and update package shipping statuses in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Orders</span>
          </button>
        </div>

        {/* Real Order Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : totalOrdersCount}</p>
            <span className="text-[11px] text-slate-500">All received orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Dispatch</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{loading ? '...' : pendingOrdersCount}</p>
            <span className="text-[11px] text-amber-600 font-medium">Ready for fulfillment</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">In Transit</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{loading ? '...' : shippedOrdersCount}</p>
            <span className="text-[11px] text-blue-600 font-medium">Shipped with logistics</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Delivered</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{loading ? '...' : deliveredOrdersCount}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Fulfilled successfully</span>
          </div>
        </div>

        {/* Toolbar: Search & Status Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto w-full md:w-auto">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold whitespace-nowrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedStatus(opt.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    selectedStatus === opt.id
                      ? 'bg-white text-indigo-700 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            /* REAL EMPTY STATE */
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <ShoppingCart className="w-8 h-8 opacity-80" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery || selectedStatus !== 'ALL'
                    ? 'No Orders Found For Current Filter'
                    : 'No Orders Received Yet'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery || selectedStatus !== 'ALL'
                    ? 'Try selecting a different status filter or clearing your search query.'
                    : 'When customers or dropship resellers place orders for items in your inventory catalog, they will appear here.'}
                </p>
              </div>

              {searchQuery || selectedStatus !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('ALL');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-inventory1')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
                >
                  <Package className="w-4 h-4" />
                  <span>Check Inventory Products</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-5">Order ID & Date</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Ordered Items</th>
                    <th className="py-4 px-4">Total Amount</th>
                    <th className="py-4 px-4">Fulfillment Status</th>
                    <th className="py-4 px-5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => {
                    const status = (ord.orderStatus || ord.status || 'ORDERED').toUpperCase();
                    const isDelivered = status === 'DELIVERED';
                    const isShipped = status === 'SHIPPED';
                    const isConfirmed = status === 'CONFIRMED';
                    const isCancelled = status === 'CANCELLED';

                    const itemsList = ord.items || [];
                    const firstItem = itemsList[0];
                    const itemTitle = firstItem?.product?.title || firstItem?.productTitle || 'Catalog Product';
                    const itemsCount = itemsList.length || 1;

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            #{String(ord.id).slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-800">
                            {ord.user?.fullName || ord.customerName || 'Customer'}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {ord.user?.phone || 'Verified Buyer'}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-[200px]">
                          <p className="font-medium text-slate-800 truncate">{itemTitle}</p>
                          {itemsCount > 1 && (
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                              +{itemsCount - 1} more items
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-black text-slate-900 text-sm">
                          ₹{Number(ord.totalAmount || ord.price || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isShipped
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : isConfirmed
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Action dropdown or quick step */}
                            {status === 'ORDERED' && (
                              <button
                                type="button"
                                disabled={isUpdatingStatus}
                                onClick={() => handleStatusChange(ord.id, 'CONFIRMED')}
                                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}

                            {status === 'CONFIRMED' && (
                              <button
                                type="button"
                                disabled={isUpdatingStatus}
                                onClick={() => handleStatusChange(ord.id, 'SHIPPED')}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                              >
                                Ship Order
                              </button>
                            )}

                            {status === 'SHIPPED' && (
                              <button
                                type="button"
                                disabled={isUpdatingStatus}
                                onClick={() => handleStatusChange(ord.id, 'DELIVERED')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer"
                              >
                                Mark Delivered
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
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

        {/* Detailed Order Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase">Order Details</span>
                  <h3 className="text-lg font-black text-slate-900">
                    #{String(selectedOrder.id).slice(-8).toUpperCase()}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Customer Information</span>
                  </div>
                  <p className="text-slate-700 font-semibold">{selectedOrder.user?.fullName || selectedOrder.customerName || 'N/A'}</p>
                  <p className="text-slate-500">Phone: {selectedOrder.user?.phone || 'N/A'}</p>
                  <p className="text-slate-500">Email: {selectedOrder.user?.email || 'N/A'}</p>
                  {selectedOrder.shippingAddress && (
                    <div className="pt-1 flex items-start gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{typeof selectedOrder.shippingAddress === 'string' ? selectedOrder.shippingAddress : JSON.stringify(selectedOrder.shippingAddress)}</span>
                    </div>
                  )}
                </div>

                {/* Items in Order */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Ordered Catalog Items</h4>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{item.product?.title || item.productTitle || 'Product'}</p>
                          <p className="text-[11px] text-slate-400">Qty: {item.quantity || 1} • Unit: ₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <span className="font-black text-slate-900 text-sm shrink-0">
                          ₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40">
                  <label className="font-bold text-slate-800 block mb-1.5">Update Dispatch Status</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedOrder.orderStatus || selectedOrder.status || 'ORDERED'}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      disabled={isUpdatingStatus}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 text-xs"
                    >
                      <option value="ORDERED">ORDERED (New)</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
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
