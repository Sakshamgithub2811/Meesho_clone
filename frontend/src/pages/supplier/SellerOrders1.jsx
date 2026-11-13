import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AlertCircle,
  Printer,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  BellRing
} from 'lucide-react';
import OrderPrintSlipModal from '../../components/admin/orders/OrderPrintSlipModal';
import {
  playOrderChime,
  playTestChime,
  isSoundAlertEnabled,
  setSoundAlertEnabled
} from '../../utils/orderSoundChime';

const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'ORDERED', label: 'New / Ordered' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export default function SellerOrders1({ onNavigate, embedded = false, onNavigateTab }) {
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
  const [printOrder, setPrintOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Real-Time Radar & Sound Chime Alert States
  const [soundEnabled, setSoundEnabled] = useState(isSoundAlertEnabled);
  const [radarActive, setRadarActive] = useState(true);
  const [lastRadarPing, setLastRadarPing] = useState(null);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState(new Set());
  const knownOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Load real orders from backend (supports manual refresh & silent radar polling)
  const loadOrders = useCallback(async (isRefresh = false, isSilentRadar = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (!isSilentRadar) setLoading(true);

      const [ordersRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierOrders(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const ordData =
          ordersRes.value.data ||
          ordersRes.value.orders ||
          (Array.isArray(ordersRes.value) ? ordersRes.value : []);

        // Check for new incoming orders during radar ping
        if (isFirstLoadRef.current) {
          ordData.forEach((o) => knownOrderIdsRef.current.add(o.id));
          isFirstLoadRef.current = false;
        } else {
          const freshIncoming = ordData.filter(
            (o) => !knownOrderIdsRef.current.has(o.id)
          );

          if (freshIncoming.length > 0) {
            // Play Real-Time Melodic Order Chime
            playOrderChime();

            // Track newly arrived IDs to highlight in table
            setNewlyArrivedIds((prev) => {
              const next = new Set(prev);
              freshIncoming.forEach((o) => next.add(o.id));
              return next;
            });

            // Prominent Toast Notification
            const topOrder = freshIncoming[0];
            const displayId = String(topOrder.id).slice(-8).toUpperCase();
            const orderAmt = Number(topOrder.totalAmount || 0).toLocaleString('en-IN');
            toast.success(
              `🔔 New Order Received! #${displayId} (₹${orderAmt})`,
              {
                duration: 9000,
                description: `${freshIncoming.length > 1 ? `+${freshIncoming.length - 1} more order(s). ` : ''}Fulfill promptly to maintain high seller rating.`,
                action: {
                  label: 'View Order',
                  onClick: () => setSelectedOrder(topOrder),
                },
              }
            );

            // Add to known IDs
            freshIncoming.forEach((o) => knownOrderIdsRef.current.add(o.id));
          }
        }

        setOrders(ordData);
        setLastRadarPing(new Date());
      } else if (!isSilentRadar) {
        setOrders([]);
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else if (!isSilentRadar) {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Live supplier orders updated');
      }
    } catch (err) {
      if (!isSilentRadar) {
        console.error('Error loading orders:', err);
        toast.error('Failed to load orders from server');
      }
    } finally {
      if (!isSilentRadar) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Real-Time Background Radar Polling (Every 15 seconds)
  useEffect(() => {
    if (!radarActive) return;

    const interval = setInterval(() => {
      loadOrders(false, true); // silent radar ping
    }, 15000);

    return () => clearInterval(interval);
  }, [radarActive, loadOrders]);

  const toggleSoundAlert = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    setSoundAlertEnabled(nextState);
    if (nextState) {
      playTestChime();
      toast.success('🔔 Order Sound Chime Enabled! Test chime played.');
    } else {
      toast.info('🔕 Order Sound Chime Muted');
    }
  };

  const toggleRadar = () => {
    const nextState = !radarActive;
    setRadarActive(nextState);
    if (nextState) {
      toast.success('📡 Live Order Radar Activated (15s auto-check)');
      loadOrders(false, true);
    } else {
      toast.info('⏸️ Live Order Radar Paused');
    }
  };

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

  // Update real order status via API (supports per-item or order-level update)
  const handleStatusChange = async (orderId, newStatus, orderItemId = null) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await supplierApiService.updateOrderStatus(orderId, newStatus, orderItemId);
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          const updatedItems = (ord.items || []).map((it) => {
            if (!orderItemId || it.id === orderItemId) {
              return { ...it, itemStatus: newStatus };
            }
            return it;
          });
          return {
            ...ord,
            orderStatus: updated?.orderStatus || newStatus,
            items: updatedItems,
          };
        })
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => {
          const updatedItems = (prev.items || []).map((it) => {
            if (!orderItemId || it.id === orderItemId) {
              return { ...it, itemStatus: newStatus };
            }
            return it;
          });
          return {
            ...prev,
            orderStatus: updated?.orderStatus || newStatus,
            items: updatedItems,
          };
        });
      }
      toast.success(
        orderItemId
          ? `Item status updated to ${newStatus}`
          : `Order #${orderId.slice(-6).toUpperCase()} status updated to ${newStatus}`
      );
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

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
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

          {/* Real-time Order Radar & Sound Chime Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Radar Status & Toggle Button */}
            <button
              type="button"
              onClick={toggleRadar}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                radarActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title={
                radarActive
                  ? `Live Radar Active: Polling every 15s ${lastRadarPing ? `(Last ping: ${lastRadarPing.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})` : ''}`
                  : 'Radar Paused (Click to resume)'
              }
            >
              <span className="relative flex h-2.5 w-2.5">
                {radarActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    radarActive ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                ></span>
              </span>
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{radarActive ? 'Live Radar (15s)' : 'Radar Paused'}</span>
              <span className="sm:hidden">{radarActive ? 'Radar' : 'Off'}</span>
            </button>

            {/* Sound Chime Toggle Button */}
            <button
              type="button"
              onClick={toggleSoundAlert}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                soundEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
              title={
                soundEnabled
                  ? 'Sound Chime is ON: Melodic bell rings on incoming orders (Click to test/mute)'
                  : 'Sound Chime is MUTED (Click to enable)'
              }
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Chime Off'}</span>
              <span className="sm:hidden">{soundEnabled ? 'Sound' : 'Muted'}</span>
            </button>

            {/* Manual Sync Button */}
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Manually synchronize orders immediately"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Orders</span>
            </button>
          </div>
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              #{String(ord.id).slice(-8).toUpperCase()}
                            </span>
                            {newlyArrivedIds.has(ord.id) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shadow-xs">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>NEW</span>
                              </span>
                            )}
                          </div>
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

                            <button
                              type="button"
                              onClick={() => setPrintOrder(ord)}
                              className="p-1.5 rounded-xl text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 transition cursor-pointer"
                              title="Print Shipping Label & AWB Barcode"
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

                {/* Items in Order (with Per-Item Status Control) */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Ordered Catalog Items</h4>
                  <div className="space-y-2.5">
                    {(selectedOrder.items || []).map((item, idx) => {
                      const iStatus = (item.itemStatus || selectedOrder.orderStatus || 'ORDERED').toUpperCase();
                      return (
                        <div key={item.id || idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{item.product?.title || item.productTitle || 'Product'}</p>
                              <p className="text-[11px] text-slate-400">
                                Qty: {item.quantity || 1} • Unit: ₹{Number(item.price || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <span className="font-black text-slate-900 text-sm shrink-0">
                              ₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              Item Stage: {iStatus}
                            </span>
                            {item.id && (
                              <select
                                value={iStatus}
                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value, item.id)}
                                disabled={isUpdatingStatus}
                                className="h-7 px-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 text-[11px]"
                              >
                                <option value="ORDERED">ORDERED</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Batch Status Update Dropdown (All Supplier Items in this Order) */}
                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40">
                  <label className="font-bold text-slate-800 block mb-1.5">Update All Your Items in Order</label>
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
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Print Shipping Label CTA */}
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    setPrintOrder(ord);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print 4x6 Shipping Label & AWB Barcode</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Shipping Label & Barcode Modal */}
        {printOrder && (
          <OrderPrintSlipModal
            order={printOrder}
            onClose={() => setPrintOrder(null)}
          />
        )}
      </div>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="orders"
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
