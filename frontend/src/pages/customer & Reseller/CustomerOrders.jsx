import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import { getOrders, cancelOrder } from '../../services/ecommerceService';

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
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
    showToast(`Downloading Tax Invoice for #${orderId?.slice(0, 8)}... 📄`);
  };

  // Perform Real Order Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    const finalReason = cancelReason === 'Other' ? (customCancelReason || 'Customer requested cancellation') : cancelReason;

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
        setCancelReason('Ordered by mistake');
        setCustomCancelReason('');
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

    const rawStatus = (o.orderStatus || 'ORDERED').toUpperCase();

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
      sellerName: prod.supplierName || 'Verified Meesho Supplier',
      itemsCount: o.items?.length || 1,
      items: o.items || []
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
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
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
                <span className="text-xs font-bold bg-pink-100 text-[#9f0038] px-2 py-0.5 rounded-full">
                  {formattedOrders.length} {formattedOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Live order tracking &amp; tax invoices
              </p>
            </div>
          </div>

          <button
            onClick={() => handleNav('/cart')}
            className="w-9 h-9 rounded-full bg-pink-50 text-[#9f0038] flex items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors"
            title="Cart"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
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
        </div>

        {/* Filter Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto pb-2.5 no-scrollbar">
          {[
            { id: 'all', label: 'All Orders', count: formattedOrders.length },
            { id: 'in_transit', label: 'Active 🚚', count: formattedOrders.filter((o) => ['ordered', 'confirmed', 'shipped', 'out_for_delivery'].includes(o.status)).length },
            { id: 'delivered', label: 'Delivered ✅', count: formattedOrders.filter((o) => o.status === 'delivered').length },
            { id: 'returned', label: 'Returns 🔄', count: formattedOrders.filter((o) => o.status === 'returned').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
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
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isShipped = order.status === 'shipped';
            const isOutForDelivery = order.status === 'out_for_delivery';
            const isOrdered = order.status === 'ordered';
            const isCancellable = isOrdered || isShipped;

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

                {/* Product Info Section */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex gap-3 sm:gap-5 items-start">
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

                      {/* Delivery Address Hint */}
                      <p className="text-[11px] text-slate-400 pt-1 line-clamp-1">
                        📍 Deliver to: {order.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      Flipkart Order Status Card Component
                      ───────────────────────────────────────────────────────────── */}
                  <div className="bg-[#fafbfc] rounded-2xl border border-slate-200/90 p-4 space-y-3.5">
                    {/* Status Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                          {isDelivered
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isOutForDelivery
                          ? 'bg-purple-100 text-purple-900 font-extrabold'
                          : isShipped
                          ? 'bg-blue-100 text-blue-900 font-extrabold'
                          : 'bg-emerald-100 text-emerald-800 font-extrabold'
                      }`}>
                        {isDelivered
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
                      {isDelivered ? (
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
                    </div>

                    {/* Notice Callout */}
                    <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs">
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0 mt-0.5">info</span>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {isDelivered
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
                        {isOrdered ? 'Processing' : order.status.replace('_', ' ')}
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
      {trackingModalOrder && (() => {
        const track = getTrackingTimeline(trackingModalOrder);
        const isDelivered = trackingModalOrder.status === 'delivered';
        const isCancelled = trackingModalOrder.status === 'cancelled';
        const isShipped = trackingModalOrder.status === 'shipped';
        const isOutForDelivery = trackingModalOrder.status === 'out_for_delivery';
        const isOrdered = trackingModalOrder.status === 'ordered';
        const isCancellable = isOrdered || isShipped;

        return (
          <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
              
              {/* App Bar / Header */}
              <div className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTrackingModalOrder(null)}
                    className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
                    aria-label="Back"
                  >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                  </button>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Order Details
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('Helpdesk: Dedicated Meesho Support available 24x7 📞')}
                    className="text-xs font-bold text-slate-700 border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Help
                  </button>
                  <button
                    onClick={() => copyToClipboard(window.location.href, 'Order tracking link copied!')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    title="Share Order"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </div>
              </div>

              {/* Product Info Strip */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-start gap-3.5">
                  <img
                    src={trackingModalOrder.image}
                    alt={trackingModalOrder.productName}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-slate-200 bg-white shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                      {trackingModalOrder.productName}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Color / Size: <span className="text-slate-800">{trackingModalOrder.size}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-600">
                        Order #{trackingModalOrder.id.slice(0, 14)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(trackingModalOrder.id, 'Order ID copied!')}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy Order ID"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Vertical Timeline */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                
                {/* ── 1. Order Confirmed Milestone ── */}
                <div className="flex gap-4 relative">
                  {/* Left Icon & Connecting Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 shrink-0 mt-0.5 shadow-sm" />
                    <div className={`w-0.5 flex-1 my-1 ${
                      isCancelled 
                        ? 'bg-slate-200' 
                        : (isShipped || isOutForDelivery || isDelivered) 
                        ? 'bg-emerald-600' 
                        : 'bg-slate-200'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900">Order Confirmed</h4>
                      <span className="text-slate-500 font-semibold">{track.placedDateStr}</span>
                    </div>

                    <div className="mt-2.5 space-y-3 pl-1 text-slate-600 font-medium">
                      <div>
                        <p className="text-slate-800 font-semibold">Your Order has been placed.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{track.events.placed}</p>
                      </div>
                      <div>
                        <p className="text-slate-800 font-semibold">
                          {isShipped || isOutForDelivery || isDelivered
                            ? 'Seller has processed your order.'
                            : 'Seller has received and is processing your order.'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isShipped || isOutForDelivery || isDelivered ? track.events.processed : 'In Progress'}
                        </p>
                      </div>
                      {(isShipped || isOutForDelivery || isDelivered) && (
                        <div>
                          <p className="text-slate-800 font-semibold">Your item has been picked up by delivery partner.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{track.events.pickedUp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── 2. Shipped / Cancelled Milestone ── */}
                {isCancelled ? (
                  <div className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-sm">
                        ✕
                      </div>
                      <div className="w-0.5 flex-1 my-1 bg-slate-200" />
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-red-600">Order Cancelled</h4>
                        <span className="text-slate-500 font-semibold">{trackingModalOrder.orderDate}</span>
                      </div>

                      <div className="mt-2.5 space-y-2 pl-1 text-slate-600 font-medium">
                        <p className="text-slate-800 font-semibold">Order cancelled as per your request.</p>
                        <p className="text-[11px] text-slate-500">
                          {trackingModalOrder.paymentMethod === 'COD'
                            ? 'Since this was Cash on Delivery, no amount was charged.'
                            : `Refund of ₹${trackingModalOrder.price} initiated to source payment mode (3-5 business days).`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (isShipped || isOutForDelivery || isDelivered) ? (
                  <div className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 shrink-0 mt-0.5 shadow-sm" />
                      <div className={`w-0.5 flex-1 my-1 ${isDelivered ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900">Shipped</h4>
                        <span className="text-slate-500 font-semibold">{track.shippedDateStr}</span>
                      </div>

                      {/* Courier Partner & Tracking code */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {track.trackingPartner} - {track.trackingCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(track.trackingCode, 'Tracking code copied!')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy tracking code"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-3 pl-1 text-slate-600 font-medium">
                        <div>
                          <p className="text-slate-800 font-semibold">Your item has been shipped.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{track.events.shipped}</p>
                        </div>
                        <div>
                          <p className="text-slate-800 font-semibold">Your item has arrived at a delivery partner facility</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{track.events.arrived1}</p>
                        </div>
                        <div>
                          <p className="text-slate-800 font-semibold">Your item has arrived at a delivery partner facility</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{track.events.arrived2}</p>
                        </div>
                        <div>
                          <p className="text-slate-800 font-semibold">Your item has left a delivery partner facility</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{track.events.left}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 italic">Item yet to reach hub nearest to you.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white shrink-0 mt-0.5" />
                      <div className="w-0.5 flex-1 my-1 bg-slate-200" />
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-400">Shipped (Pending Dispatch)</h4>
                        <span className="text-slate-400 font-semibold text-xs">Expected within 24-48 hrs</span>
                      </div>

                      <div className="mt-2.5 space-y-2 pl-1 text-slate-500 font-medium">
                        <p className="text-slate-700 font-semibold">Package is being prepared by the seller.</p>
                        <p className="text-[11px] text-slate-400">
                          Courier partner (Shadowfax) will pick up the package once packing is done. Tracking details will update automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 3. Out For Delivery Milestone ── */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${
                      isDelivered ? 'bg-emerald-600' : 'border-2 border-slate-300 bg-white'
                    }`} />
                    <div className={`w-0.5 flex-1 my-1 ${isDelivered ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                  </div>

                  <div className="flex-1 pb-4">
                    <h4 className={`font-extrabold text-sm ${isDelivered ? 'text-slate-900' : 'text-slate-500'}`}>
                      Out For Delivery
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 pl-1 font-medium">
                      {isDelivered
                        ? 'Package was out for delivery with local hub driver.'
                        : 'Item yet to be delivered.'}
                    </p>
                  </div>
                </div>

                {/* ── 4. Delivery Milestone ── */}
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${
                      isDelivered ? 'bg-emerald-600' : 'border-2 border-slate-300 bg-white'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <h4 className={`font-extrabold text-sm ${isDelivered ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {isDelivered ? 'Delivered' : `Delivery Expected By ${track.expectedDeliveryStr}`}
                    </h4>
                    <div className="mt-1 pl-1 text-[11px] text-slate-400 space-y-0.5 font-medium">
                      <p>{isDelivered ? 'Delivered to your doorstep.' : 'Item yet to be delivered.'}</p>
                      {!isDelivered && !isCancelled && (
                        <p className="text-slate-500 font-semibold">Expected by {track.expectedDeliveryStr}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Footer - Only shows relevant action */}
              {(isCancellable || isDelivered) && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
                  {isCancellable && (
                    <button
                      onClick={() => {
                        setCancellingOrder(trackingModalOrder);
                      }}
                      className="w-full py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 bg-white text-xs font-black transition-all text-center cursor-pointer shadow-sm active:scale-95"
                    >
                      Cancel Order
                    </button>
                  )}

                  {isDelivered && (
                    <button
                      onClick={() => handleDownloadInvoice(trackingModalOrder.id)}
                      className="w-full py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 bg-white text-xs font-bold transition-all text-center cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Download Tax Invoice</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          Cancel Order Confirmation Modal with Real Reason Options
          ───────────────────────────────────────────────────────────── */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">cancel</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Cancel Order</h3>
                  <p className="text-xs text-slate-400 font-semibold">#{cancellingOrder.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
              <img
                src={cancellingOrder.image}
                alt=""
                className="w-12 h-14 object-cover rounded-xl border border-slate-200 bg-white"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{cancellingOrder.productName}</p>
                <p className="text-[11px] text-slate-500">Size: {cancellingOrder.size} • ₹{cancellingOrder.price.toLocaleString()}</p>
              </div>
            </div>

            {/* Reasons List */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">
                Reason for cancellation:
              </label>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {[
                  'Ordered by mistake',
                  'Expected delivery date is too late',
                  'Want to change shipping address or phone',
                  'Need a different size or color',
                  'Found better price or product elsewhere',
                  'Other'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                      cancelReason === reason
                        ? 'border-[#9f0038] bg-pink-50/50 text-[#9f0038] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      className="accent-[#9f0038] cursor-pointer"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other' && (
                <textarea
                  rows="2"
                  placeholder="Please specify your reason..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="w-full mt-2 p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#9f0038]"
                />
              )}
            </div>

            {/* Refund Info Notice */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 leading-relaxed font-medium">
              {cancellingOrder.paymentMethod === 'COD' ? (
                <span>💡 <strong>Cash on Delivery:</strong> No payment has been deducted. Order will be cancelled immediately without charges.</span>
              ) : (
                <span>💡 <strong>Online Payment:</strong> ₹{cancellingOrder.price.toLocaleString()} will be automatically refunded to your original payment mode within 2-4 business days.</span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Don't Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="home" onNavigate={handleNav} />
    </div>
  );
}
