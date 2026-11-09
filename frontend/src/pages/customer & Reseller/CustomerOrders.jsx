import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import { getOrders, cancelOrder } from '../../services/ecommerceService';
import OrderTrackingModal from '../../components/customer/OrderTrackingModal';
import CancelOrderModal from '../../components/customer/CancelOrderModal';
import TaxInvoiceModal from '../../components/customer/TaxInvoiceModal';

export default function CustomerOrders({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Flipkart tracking sheet & cancellation state
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getDynamicDeliveryOtp = (orderId) => {
    if (!orderId) return 4829;
    const seed = String(orderId).split('').reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) % 9000, 1000);
    return Math.abs(seed) + 1000;
  };

  const copyToClipboard = (text, msg = 'Copied to clipboard!') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    showToast(msg);
  };

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      if (data && Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDownloadInvoice = (orderId) => {
    const targetOrder = typeof orderId === 'object' ? orderId : orders.find((o) => o.id === orderId);
    if (targetOrder) setSelectedInvoiceOrder(targetOrder);
    else showToast(`Downloading Tax Invoice for #${orderId?.slice ? orderId.slice(0, 8) : ''}... 📄`);
  };

  // Perform Real Order Cancellation
  const handleConfirmCancel = async (reason) => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    const finalReason = reason || 'Customer requested cancellation';

    try {
      const res = await cancelOrder(cancellingOrder.id, finalReason);
      if (res && res.success) {
        showToast(`Order #${cancellingOrder.id.slice(0, 8)} cancelled successfully ❌`);
        
        // Update local state immediately
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancellingOrder.id
              ? { ...o, orderStatus: 'CANCELLED' }
              : o
          )
        );

        // Update tracking modal if open
        if (trackingModalOrder && trackingModalOrder.id === cancellingOrder.id) {
          setTrackingModalOrder((prev) => ({
            ...prev,
            status: 'cancelled',
            statusLabel: 'Cancelled ❌',
            rawStatus: 'CANCELLED'
          }));
        }

        setCancellingOrder(null);
      } else {
        showToast(res?.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      showToast('Error cancelling order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Map database orders to UI presentation
  const formattedOrders = orders.map((o) => {
    const firstItem = o.items?.[0] || {};
    const prod = firstItem.product || {};
    const rawCreatedAt = o.createdAt || new Date().toISOString();
    const orderDate = new Date(rawCreatedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let rawStatus = (o.orderStatus || 'ORDERED').toUpperCase();

    // Check if user requested a return for this order in PostgreSQL database
    if (o.returnRequest || rawStatus === 'RETURN_REQUESTED') {
      rawStatus = 'RETURN_REQUESTED';
    }

    let uiStatus = 'ordered';
    let statusLabel = 'Order Confirmed 📦';

    if (rawStatus === 'DELIVERED') {
      uiStatus = 'delivered';
      statusLabel = 'Delivered ✅';
    } else if (rawStatus === 'CANCELLED') {
      uiStatus = 'cancelled';
      statusLabel = 'Cancelled ❌';
    } else if (rawStatus === 'SHIPPED') {
      uiStatus = 'shipped';
      statusLabel = 'Shipped 🚚';
    } else if (rawStatus === 'OUT_FOR_DELIVERY') {
      uiStatus = 'out_for_delivery';
      statusLabel = 'Out for Delivery 🛵';
    } else if (['RETURNED', 'REFUNDED'].includes(rawStatus)) {
      uiStatus = 'returned';
      statusLabel = rawStatus === 'REFUNDED' ? 'Refunded 💰' : 'Returned & Refunded 🔄';
    } else if (rawStatus === 'RETURN_REQUESTED') {
      uiStatus = 'returned';
      statusLabel = 'Return Requested ⏳';
    } else {
      uiStatus = 'ordered';
      statusLabel = 'Confirmed & Processing 🚚';
    }


    const addr = typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress || '{}') : (o.shippingAddress || {});

    return {
      id: o.id,
      rawCreatedAt,
      rawStatus: o.orderStatus,
      orderDate,
      productId: firstItem.productId || prod.id,
      productName: prod.title || 'Ordered Product',
      image: prod.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400',
      size: firstItem.size || 'Free Size',
      color: prod.colors?.[0] || 'Black',
      qty: o.items?.reduce((sum, it) => sum + it.quantity, 0) || 1,
      price: o.totalAmount,
      originalPrice: Math.round(o.totalAmount * 1.6),
      status: uiStatus,
      statusLabel,
      paymentMethod: o.paymentMethod || 'COD',
      deliveryAddress: addr.details ? `${addr.name || ''}, ${addr.details} - ${addr.pincode || ''}` : 'Home Address',
      sellerName: prod.supplierName || 'Verified Supplier',
      itemsCount: o.items?.length || 1,
      items: o.items || [],
      returnRequest: o.returnRequest || null
    };
  });

  const filteredOrders = formattedOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.productName.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'in_transit') return ['ordered', 'confirmed', 'shipped', 'out_for_delivery'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'returned') return order.status === 'returned';
    return true;
  });

  // Dynamic Flipkart tracking timeline calculator based on order timestamps
  const getTrackingTimeline = (order) => {
    const baseTime = new Date(order.rawCreatedAt || Date.now());

    const dayOrdinal = (d) => {
      const day = d.getDate();
      if (day > 3 && day < 21) return `${day}th`;
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
      }
    };

    const fmtFull = (d) => {
      const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const month = d.toLocaleDateString('en-IN', { month: 'short' });
      const year = d.toLocaleDateString('en-IN', { year: '2-digit' });
      const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
      return `${weekday}, ${dayOrdinal(d)} ${month} '${year} - ${time}`;
    };

    const fmtDayDate = (d) => {
      const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const month = d.toLocaleDateString('en-IN', { month: 'short' });
      const year = d.toLocaleDateString('en-IN', { year: '2-digit' });
      return `${weekday}, ${dayOrdinal(d)} ${month} '${year}`;
    };

    const fmtShortDate = (d) => {
      const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const month = d.toLocaleDateString('en-IN', { month: 'short' });
      const day = d.getDate();
      return `${weekday} ${month} ${day}`;
    };

    // Realistic milestone offsets
    const tPlaced = new Date(baseTime.getTime());
    const tProcessed = new Date(baseTime.getTime() + 16 * 3600 * 1000);
    const tPickedUp = new Date(baseTime.getTime() + 43 * 3600 * 1000);
    const tShipped = new Date(baseTime.getTime() + 45 * 3600 * 1000);
    const tArrived1 = new Date(baseTime.getTime() + 57 * 3600 * 1000);
    const tArrived2 = new Date(baseTime.getTime() + 58 * 3600 * 1000);
    const tLeft = new Date(baseTime.getTime() + 61 * 3600 * 1000);
    const tExpected = new Date(baseTime.getTime() + 7 * 24 * 3600 * 1000);

    const trackingCode = 'SF' + (order.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase() || '3604819638F');

    return {
      placedDateStr: fmtDayDate(tPlaced),
      shippedDateStr: fmtDayDate(tShipped),
      shortPlacedDate: fmtShortDate(tPlaced),
      shortShippedDate: fmtShortDate(tShipped),
      deliveryLabelDate: `${fmtShortDate(tExpected)} by 11 PM`,
      expectedDeliveryStr: `Fri ${dayOrdinal(tExpected)} ${tExpected.toLocaleDateString('en-IN', { month: 'short' })}`,
      trackingPartner: 'Shadowfax',
      trackingCode,
      events: {
        placed: fmtFull(tPlaced),
        processed: fmtFull(tProcessed),
        pickedUp: fmtFull(tPickedUp),
        shipped: fmtFull(tShipped),
        arrived1: `${fmtFull(tArrived1)} - Gurgaon`,
        arrived2: `${fmtFull(tArrived2)} - Gurgaon`,
        left: `${fmtFull(tLeft)} - Gurgaon`,
      }
    };
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen text-[#191c1e] font-sans pb-28 antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-[#0f172a] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : handleNav('/user-home'))}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>My Orders</span>
                <span className="text-xs font-bold bg-pink-100 text-[#9f0038] px-2.5 py-0.5 rounded-full">
                  {formattedOrders.length} {formattedOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Live order tracking, delivery OTPs &amp; tax invoices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav('/user-dashboard1?tab=profile')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">person</span>
              <span>Account</span>
            </button>
            <button
              onClick={() => handleNav('/cart')}
              className="w-9 h-9 rounded-full bg-pink-50 text-[#9f0038] flex items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors"
              title="Cart"
            >
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Responsive Filter Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by product name or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#9f0038] focus:bg-white transition-all shadow-inner"
              />
              <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All Orders', count: formattedOrders.length },
                { id: 'in_transit', label: 'Active 🚚', count: formattedOrders.filter((o) => ['ordered', 'confirmed', 'shipped', 'out_for_delivery'].includes(o.status)).length },
                { id: 'delivered', label: 'Delivered ✅', count: formattedOrders.filter((o) => o.status === 'delivered').length },
                { id: 'returned', label: 'Returns 🔄', count: formattedOrders.filter((o) => o.status === 'returned').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#9f0038] to-[#e11d48] text-white shadow-md shadow-pink-500/20 scale-[1.02]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 sm:space-y-6">
        {/* Desktop Quick KPI Overview Cards */}
        {!loading && formattedOrders.length > 0 && (
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#9f0038] shrink-0">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                <p className="text-base font-black text-slate-900">{formattedOrders.length} Placed</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <span className="material-symbols-outlined text-xl">local_shipping</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Transit</p>
                <p className="text-base font-black text-blue-600">
                  {formattedOrders.filter((o) => ['ordered', 'confirmed', 'shipped', 'out_for_delivery'].includes(o.status)).length} Active
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined text-xl">task_alt</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
                <p className="text-base font-black text-emerald-600">
                  {formattedOrders.filter((o) => o.status === 'delivered').length} Safely
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-xl">published_with_changes</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Returns / Refund</p>
                <p className="text-base font-black text-amber-700">
                  {formattedOrders.filter((o) => o.status === 'returned').length} Items
                </p>
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400 font-semibold">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 space-y-4">
            <div className="w-20 h-20 rounded-full bg-pink-50 text-[#9f0038] flex items-center justify-center mx-auto text-3xl">
              📦
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">No Orders Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Discover 100% verified factory direct products with guaranteed lowest prices!
              </p>
            </div>
            <button
              onClick={() => handleNav('/user-home')}
              className="px-6 py-3 rounded-2xl bg-[#FF3F6C] text-white text-xs font-black shadow-lg shadow-pink-500/30 cursor-pointer hover:bg-[#e02659] transition-all uppercase tracking-wider"
            >
              Shop Trending Products ➔
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const trackInfo = getTrackingTimeline(order);
            const isReturned = order.status === 'returned';
            const isDelivered = !isReturned && order.status === 'delivered';
            const isCancelled = !isReturned && order.status === 'cancelled';
            const isShipped = !isReturned && order.status === 'shipped';
            const isOutForDelivery = !isReturned && order.status === 'out_for_delivery';
            const isOrdered = !isReturned && order.status === 'ordered';
            const isCancellable = (isOrdered || isShipped) && !isReturned;

            const returnData = order.returnRequest || null;

            return (
              <article
                key={order.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Top Strip */}
                <div className="bg-slate-50/70 px-4 sm:px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 tracking-wide">#{order.id.slice(0, 8)}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Placed on {order.orderDate}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-1 rounded-full text-xs ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCancelled
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Product Info & Tracking Section (2-Column Responsive Desktop Layout) */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (5 cols): Product Details & Delivery Address */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex gap-3 sm:gap-4 items-start">
                      {/* Product Image */}
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                        <img
                          src={order.image}
                          alt={order.productName}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                          Qty: {order.qty}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                          {order.productName}
                        </h2>

                        <p className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>Size: <strong className="text-slate-700">{order.size}</strong></span>
                          <span>•</span>
                          <span>Seller: <strong className="text-slate-700">{order.sellerName}</strong></span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <span>Pay Mode:</span>
                            <strong className="text-slate-800">{order.paymentMethod}</strong>
                            {order.paymentMethod !== 'COD' ? (
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md uppercase">
                                ✓ Paid
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md uppercase">
                                COD
                              </span>
                            )}
                          </span>
                        </p>

                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base sm:text-lg font-black text-slate-900">
                            ₹{order.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{order.originalPrice.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                            Free Delivery
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70 text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-sm text-[#9f0038]">pin_drop</span>
                        <span>Delivery Address</span>
                      </span>
                      <p className="text-slate-600 leading-relaxed text-[11px] pl-5">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* Right Column (7 cols): Tracking Stepper, OTPs & Actions */}
                  <div className="lg:col-span-7 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
                    {/* ─────────────────────────────────────────────────────────────
                        Flipkart Order Status Card Component
                        ───────────────────────────────────────────────────────────── */}
                    <div className="bg-[#fafbfc] rounded-2xl border border-slate-200/90 p-4 space-y-3.5">
                    {/* Status Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                          {isReturned
                            ? 'Return in Progress'
                            : isDelivered
                            ? 'Delivered'
                            : isCancelled
                            ? 'Cancelled'
                            : isOutForDelivery
                            ? 'Out for Delivery'
                            : isShipped
                            ? 'Shipped'
                            : 'Order Confirmed'}
                        </h3>
                        <span className="material-symbols-outlined text-slate-400 text-base">expand_less</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                        isReturned
                          ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-200'
                          : isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isOutForDelivery
                          ? 'bg-purple-100 text-purple-900 font-extrabold'
                          : isShipped
                          ? 'bg-blue-100 text-blue-900 font-extrabold'
                          : 'bg-emerald-100 text-emerald-800 font-extrabold'
                      }`}>
                        {isReturned
                          ? 'Return Requested'
                          : isDelivered
                          ? 'Delivered'
                          : isCancelled
                          ? 'Cancelled'
                          : isOutForDelivery
                          ? 'Arriving Today'
                          : isShipped
                          ? 'In Transit'
                          : 'Order Placed'}
                      </span>
                    </div>

                    {/* Live Status Description */}
                    <p className="text-xs text-slate-700 font-medium">
                      {isReturned ? (
                        <span>
                          Return registered{returnData?.requestedAt ? ` on ${new Date(returnData.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}: Our courier partner (Shadowfax Logistics) is scheduled for return collection during your slot: <strong>{returnData?.slot || 'Today'}</strong>.
                        </span>
                      ) : isDelivered ? (
                        <span>Delivered safely on {order.orderDate}. Handed directly to recipient.</span>
                      ) : isCancelled ? (
                        <span className="text-red-700 font-semibold">
                          This order was cancelled. {order.paymentMethod !== 'COD' ? 'Refund initiated to your account.' : 'No payment was deducted.'}
                        </span>
                      ) : isOutForDelivery ? (
                        <span>Today: Out for delivery with delivery partner. Arriving by 9 PM.</span>
                      ) : isShipped ? (
                        <span>In Transit: Product has left the facility and is on its way to your destination city.</span>
                      ) : (
                        <span>Placed on {order.orderDate}: Order received! Seller is preparing and packing your package for dispatch.</span>
                      )}
                    </p>

                    {/* Horizontal 3-Step Progress Bar */}
                    <div className="pt-2 px-1">
                      {isReturned ? (
                        <div className="relative flex items-center justify-between">
                          {/* Connecting Track Line */}
                          <div className="absolute left-8 right-8 top-3 h-0.5 bg-slate-200 -z-0">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
                              style={{ width: '50%' }}
                            />
                          </div>

                          {/* Step 1: Return Requested */}
                          <div className="flex flex-col items-center relative z-10 text-center w-28">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm bg-emerald-600 text-white">
                              ✓
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 mt-1 leading-tight">Return Requested</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {returnData?.requestedAt ? new Date(returnData.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Done'}
                            </span>
                          </div>

                          {/* Step 2: Courier Pickup */}
                          <div className="flex flex-col items-center relative z-10 text-center w-28">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm bg-amber-500 text-white animate-pulse">
                              ⏳
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 mt-1 leading-tight">Courier Pickup</span>
                            <span className="text-[10px] text-amber-700 font-bold">
                              {returnData?.slot ? returnData.slot.split(',')[0] : 'In Progress'}
                            </span>
                          </div>

                          {/* Step 3: Refund Processed */}
                          <div className="flex flex-col items-center relative z-10 text-center w-28">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-slate-300 bg-white text-slate-400">
                              ₹
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 mt-1 leading-tight">Refund Credited</span>
                            <span className="text-[10px] text-slate-400 font-medium">₹{order.price} to Bank</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-between">
                          {/* Connecting Track Line */}
                          <div className="absolute left-8 right-8 top-3 h-0.5 bg-slate-200 -z-0">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-500"
                              style={{
                                width: isDelivered
                                  ? '100%'
                                  : isCancelled
                                  ? '0%'
                                  : isOutForDelivery
                                  ? '80%'
                                  : isShipped
                                  ? '50%'
                                  : '0%'
                              }}
                            />
                          </div>

                          {/* Step 1: Order Confirmed */}
                          <div className="flex flex-col items-center relative z-10 text-center w-24">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              isCancelled ? 'bg-slate-300 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              ✓
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 mt-1 leading-tight">Order Confirmed</span>
                            <span className="text-[10px] text-slate-400 font-medium">{trackInfo.shortPlacedDate}</span>
                          </div>

                          {/* Step 2: Shipped */}
                          <div className="flex flex-col items-center relative z-10 text-center w-24">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              isCancelled
                                ? 'bg-red-500 text-white'
                                : (isShipped || isOutForDelivery || isDelivered)
                                ? 'bg-emerald-600 text-white'
                                : 'border-2 border-slate-300 bg-white text-transparent'
                            }`}>
                              {isCancelled ? '✕' : (isShipped || isOutForDelivery || isDelivered) ? '✓' : ''}
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 mt-1 leading-tight">
                              {isCancelled ? 'Cancelled' : 'Shipped'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {isCancelled
                                ? order.orderDate
                                : (isShipped || isOutForDelivery || isDelivered)
                                ? trackInfo.shortShippedDate
                                : 'Pending'}
                            </span>
                          </div>

                          {/* Step 3: Delivery */}
                          <div className="flex flex-col items-center relative z-10 text-center w-28">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              isDelivered
                                ? 'bg-emerald-600 text-white'
                                : isCancelled
                                ? 'border-2 border-slate-200 bg-slate-100 text-slate-400'
                                : 'border-2 border-slate-300 bg-white text-transparent'
                            }`}>
                              {isDelivered ? '✓' : isCancelled ? '—' : ''}
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 mt-1 leading-tight">Delivery</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {isDelivered ? order.orderDate : isCancelled ? 'Cancelled' : trackInfo.deliveryLabelDate}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notice Callout */}
                    <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs">
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0 mt-0.5">
                        {isReturned ? 'inventory_2' : 'info'}
                      </span>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {isReturned
                          ? 'Courier partner (Shadowfax) will visit your doorstep for pickup. Please keep product tags intact and share the 4-digit verification OTP only after item inspection.'
                          : isDelivered
                          ? 'Delivery Executive safely completed delivery to your location.'
                          : isCancelled
                          ? 'This shipment was cancelled and will not be dispatched to destination.'
                          : isOutForDelivery
                          ? 'Delivery partner is on the way to your doorstep. Keep phone reachable.'
                          : isShipped
                          ? 'Delivery Executive details will be available once the order is out for delivery.'
                          : 'Seller is verifying and preparing your package. Tracking code will activate once dispatched.'}
                      </p>
                    </div>

                    {/* Doorstep Return Pickup OTP Mini-Card */}
                    {isReturned && (
                      <div className="bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-white border border-rose-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#9f0038] flex items-center justify-center text-sm font-black shrink-0">
                            🛡️
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-[#9f0038] tracking-wider">
                              Doorstep Return Pickup OTP
                            </p>
                            <p className="text-lg font-black font-mono tracking-widest text-slate-900">
                              {returnData?.otp || 'Ready'}
                            </p>
                          </div>
                        </div>
                        {returnData?.otp && (
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(String(returnData.otp));
                              showToast('Pickup OTP copied to clipboard! 📋');
                            }}
                            className="px-3 py-1.5 text-xs font-black bg-white hover:bg-rose-50 text-[#9f0038] rounded-xl border border-rose-300 shadow-2xs cursor-pointer active:scale-95 transition-all"
                          >
                            Copy OTP
                          </button>
                        )}
                      </div>
                    )}

                    {/* Doorstep Prepaid Delivery OTP Mini-Card (Active when OUT_FOR_DELIVERY) */}
                    {isOutForDelivery && order.paymentMethod !== 'COD' && (() => {
                      const dynamicDeliveryOtp = order.deliveryOtp || getDynamicDeliveryOtp(order.id);
                      return (
                        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-black shrink-0">
                              📦
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">
                                Prepaid Delivery OTP (Share with delivery partner)
                              </p>
                              <p className="text-lg font-black font-mono tracking-widest text-slate-900">
                                {dynamicDeliveryOtp}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md hidden sm:inline-block">
                              📱 Sent via SMS &amp; Email
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                copyToClipboard(String(dynamicDeliveryOtp), 'Delivery OTP copied to clipboard! 📋');
                              }}
                              className="px-3 py-1.5 text-xs font-black bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-300 shadow-2xs cursor-pointer active:scale-95 transition-all"
                            >
                              Copy OTP
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* "See all updates" Blue Trigger */}
                    <div className="pt-1 text-center border-t border-slate-200/60">
                      <button
                        onClick={() => setTrackingModalOrder(order)}
                        className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-1 hover:underline transition-colors py-1"
                      >
                        <span>See all updates</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions & Buttons Row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Order Action:</span>
                      <span className="text-xs font-extrabold text-slate-700 capitalize">
                        {isReturned ? 'Return Requested' : isOrdered ? 'Processing' : order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Cancel Order Button (Available for non-delivered & non-cancelled orders) */}
                      {isCancellable && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="text-xs font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-sm"
                          title="Cancel this order"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* Return / Exchange (Only for Delivered) */}
                      {isDelivered && (
                        <button
                          onClick={() =>
                            handleNav(
                              `/return-request?orderId=${order.id}&item=${encodeURIComponent(
                                order.productName
                              )}&price=${order.price}&image=${encodeURIComponent(
                                order.image || ''
                              )}&size=${encodeURIComponent(
                                order.size || 'Free Size'
                              )}&deliveredDate=${encodeURIComponent(
                                order.deliveryDate || order.orderDate || 'Recently'
                              )}`
                            )
                          }
                          className="text-xs font-bold text-[#b90041] hover:bg-pink-50 border border-pink-200 flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">replay</span>
                          <span>Return / Exchange</span>
                        </button>
                      )}

                      {/* Return Requested Indicator & Direct View OTP Button */}
                      {order.status === 'returned' && (
                        <button
                          onClick={() =>
                            handleNav(
                              `/return-request?orderId=${order.id}&item=${encodeURIComponent(
                                order.productName
                              )}&price=${order.price}&image=${encodeURIComponent(
                                order.image || ''
                              )}&size=${encodeURIComponent(
                                order.size || 'Free Size'
                              )}&step=5`
                            )
                          }
                          className="text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>Return Requested (View OTP)</span>
                        </button>
                      )}

                      {/* Rate & Review (Only for Delivered) */}
                      {isDelivered && order.productId && (
                        <button
                          onClick={() => handleNav(`/write-review?productId=${order.productId}&orderId=${order.id}`)}
                          className="text-xs font-black text-white bg-gradient-to-r from-[#b90041] to-[#df2457] hover:brightness-110 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">hotel_class</span>
                          <span>Rate &amp; Review</span>
                        </button>
                      )}

                      {/* Invoice Button - Only available once delivered */}
                      {isDelivered && (
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>Invoice</span>
                        </button>
                      )}

                      {/* Need Help / Order Support CTA */}
                      <button
                        type="button"
                        onClick={() => handleNav(`/support-center?orderId=${order.id}`)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                        title="Need help with this order?"
                      >
                        <span className="material-symbols-outlined text-sm">support_agent</span>
                        <span>Help</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            );
          })
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          Flipkart Detailed Tracking Modal / View (Screenshot Image 3)
          ───────────────────────────────────────────────────────────── */}
      <OrderTrackingModal
        order={trackingModalOrder}
        onClose={() => setTrackingModalOrder(null)}
        onCancelRequest={(order) => setCancellingOrder(order)}
        onDownloadInvoice={handleDownloadInvoice}
        onToast={showToast}
        getTrackingTimeline={getTrackingTimeline}
      />

      {/* ─────────────────────────────────────────────────────────────
          Cancel Order Confirmation Modal with Real Reason Options
          ───────────────────────────────────────────────────────────── */}
      <CancelOrderModal
        order={cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleConfirmCancel}
        isCancelling={isCancelling}
      />

      {/* Real Printable Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="orders" onNavigate={handleNav} role="customer" homePath="/user-home" />
    </div>
  );
}
