import React, { useState, useEffect } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import { getOrders } from '../../services/ecommerceService';

// Default initial orders matching design specs
const INITIAL_ORDERS = [
  {
    id: 'ORD-88219',
    customerName: 'Priya Sharma',
    status: 'new', // 'new' | 'pending' | 'completed'
    statusLabel: 'New Order',
    productName: 'Elite Wireless Headphones Gen 2',
    productDetails: 'Qty: 1 • Rose Gold',
    price: '₹2,499.00',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    imageAlt: 'Professional wireless headphones in rose gold',
    shippingInfo: null,
  },
  {
    id: 'ORD-88224',
    customerName: 'Rahul Verma',
    status: 'new',
    statusLabel: 'New Order',
    productName: 'Minimalist Chrono Watch',
    productDetails: 'Qty: 2 • Silver Steel',
    price: '₹4,800.00',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    imageAlt: 'Minimalist designer wrist watch silver',
    shippingInfo: null,
  },
  {
    id: 'ORD-87910',
    customerName: 'Anjali Gupta',
    status: 'pending',
    statusLabel: 'Pending Dispatch',
    productName: 'Urban Polarized Shades',
    productDetails: 'Qty: 1 • Matte Black',
    price: '₹1,250.00',
    imageUrl:
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80',
    imageAlt: 'Modern polarized sunglasses black',
    shippingInfo: 'Pickup scheduled for today, 5:00 PM',
  },
  {
    id: 'ORD-87102',
    customerName: 'Siddharth Roy',
    status: 'completed',
    statusLabel: 'Delivered',
    productName: 'Aura Minimalist Timepiece',
    productDetails: 'Qty: 1 • Classic Tan',
    price: '₹1,499.00',
    imageUrl:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
    imageAlt: 'Modern minimalist wrist watch',
    shippingInfo: `Delivered on ${new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, 2:30 PM`,
  },
];

const TABS = [
  { id: 'new', label: 'New', count: 12 },
  { id: 'pending', label: 'Pending', count: 4 },
  { id: 'completed', label: 'Completed', count: 112 },
  { id: 'returns', label: 'Returns & RTO 🔄', count: 48 },
];

const BOTTOM_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'orders', label: 'Orders', icon: 'package_2', active: true },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
  { id: 'account', label: 'Account', icon: 'person' },
];

export function SupplierOrdersList({ onBack, onNavigate }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    getOrders()
      .then((liveDbOrders) => {
        if (liveDbOrders && Array.isArray(liveDbOrders) && liveDbOrders.length > 0) {
          const mapped = liveDbOrders.map((ord) => {
            const firstItem = ord.items?.[0] || ord.orderItems?.[0];
            const statusUpper = (ord.orderStatus || ord.status || 'NEW').toUpperCase();
            let normalizedStatus = 'new';
            let statusLabel = 'New Order';
            if (statusUpper.includes('DELIVER') || statusUpper.includes('COMPLETE')) {
              normalizedStatus = 'completed';
              statusLabel = 'Delivered';
            } else if (statusUpper.includes('DISPATCH') || statusUpper.includes('SHIP') || statusUpper.includes('PROCESS')) {
              normalizedStatus = 'pending';
              statusLabel = 'Pending Dispatch';
            }

            const addr = typeof ord.shippingAddress === 'string'
              ? (ord.shippingAddress.startsWith('{') ? JSON.parse(ord.shippingAddress) : { details: ord.shippingAddress })
              : (ord.shippingAddress || {});

            const custName = addr.fullName || addr.name || ord.user?.fullName || 'Verified Customer';
            const locationStr = addr.city ? `${addr.city}, ${addr.state || 'India'}` : 'Delivery Scheduled';

            return {
              id: `ORD-${(ord.id || '').slice(0, 8).toUpperCase()}`,
              customerName: custName,
              status: normalizedStatus,
              statusLabel: statusLabel,
              productName: firstItem?.title || firstItem?.product?.title || firstItem?.name || 'Verified Marketplace Order',
              productDetails: `Qty: ${firstItem?.quantity || 1} • Standard`,
              price: `₹${Number(ord.totalAmount || 849).toLocaleString('en-IN')}.00`,
              imageUrl: firstItem?.image || firstItem?.product?.image || firstItem?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
              imageAlt: firstItem?.title || 'Product Image',
              shippingInfo: normalizedStatus === 'new' ? `Destination: ${locationStr}` : (normalizedStatus === 'pending' ? 'Courier Assigned' : 'Delivered Successfully'),
              isLiveOrder: true
            };
          });
          setOrders([...mapped, ...INITIAL_ORDERS]);
        }
      })
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedOrderForOptions, setSelectedOrderForOptions] = useState(null);

  // Trigger temporary notification toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ship Now action
  const handleShipNow = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'pending',
            statusLabel: 'Pending Dispatch',
            shippingInfo: 'Pickup scheduled for today, 5:00 PM',
          };
        }
        return order;
      })
    );
    showToast(`Order #${orderId} marked for dispatch! Courier assigned.`);
  };

  // Filter orders by active tab and search query
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'new') return order.status === 'new';
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

  return (
    <div className="bg-[#F8F9FB] text-[#191C1E] min-h-screen pb-32 font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006a34] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">local_shipping</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================== TopAppBar ===================== */}
      <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-40 bg-[#F8F9FB] dark:bg-slate-900 border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack || (() => window.history.back())}
            aria-label="Go Back"
            className="active:scale-95 duration-150 p-2 rounded-full hover:bg-[#F2F4F6] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#FF3F6C] dark:text-[#FF5C85]">
              arrow_back
            </span>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold tracking-tight text-[#191C1E] dark:text-white">
            Supplier Orders
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearchInput(!showSearchInput)}
            aria-label="Search Orders"
            className="active:scale-95 duration-150 p-2 rounded-full hover:bg-[#F2F4F6] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#FF3F6C] dark:text-[#FF5C85]">
              search
            </span>
          </button>
        </div>
      </header>

      {/* Slide-down Search Input */}
      {showSearchInput && (
        <div className="px-6 py-3 bg-white border-b border-slate-200 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2 bg-[#F2F4F6] rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, order #, or item..."
              className="w-full bg-transparent outline-none text-sm text-[#191C1E] placeholder-slate-400 font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Separation Logic */}
      <div className="bg-[#F2F4F6] dark:bg-slate-800 h-2 w-full"></div>

      {/* ===================== Tab Bar (Status Filters) ===================== */}
      <div className="bg-[#F8F9FB] dark:bg-slate-900 sticky top-16 z-30 px-6 pt-4 border-b border-slate-200/40">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'returns') {
                    if (onNavigate) onNavigate('/supplier-returns');
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={`pb-3 whitespace-nowrap font-semibold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#FF3F6C] border-b-2 border-[#FF3F6C]'
                    : 'text-[#191C1E] opacity-60 hover:opacity-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== Main Content: Order List ===================== */}
      <main className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">
              inbox
            </span>
            <p className="font-semibold text-sm">No {activeTab} orders found.</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-[#FF3F6C] font-bold underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isNew = order.status === 'new';
            const isPending = order.status === 'pending';
            const isCompleted = order.status === 'completed';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 flex flex-col gap-4 transition-all hover:shadow-md ${
                  isPending ? 'opacity-95' : ''
                }`}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#4d41df] tracking-wider uppercase">
                      Order #{order.id}
                    </p>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base text-[#191C1E]">
                      {order.customerName}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  {isNew ? (
                    <span className="bg-[#b90041]/10 text-[#b90041] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                      {order.statusLabel}
                    </span>
                  ) : isPending ? (
                    <span className="bg-[#4d41df]/10 text-[#4d41df] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                      {order.statusLabel}
                    </span>
                  ) : (
                    <span className="bg-[#006a34]/10 text-[#006a34] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                      {order.statusLabel}
                    </span>
                  )}
                </div>

                {/* Product Info Card */}
                <div className="flex gap-4 bg-[#F2F4F6] dark:bg-slate-800/40 p-3 rounded-lg items-center">
                  <img
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    alt={order.productName}
                    data-alt={order.imageAlt}
                    src={order.imageUrl}
                    loading="lazy"
                  />
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#191C1E] leading-tight mb-1 truncate">
                      {order.productName}
                    </p>
                    <p className="text-xs text-slate-500 mb-2">{order.productDetails}</p>
                    <p className="text-base font-bold text-[#b90041]">{order.price}</p>
                  </div>
                </div>

                {/* Shipping Info Notice (if pending/delivered) */}
                {order.shippingInfo && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="material-symbols-outlined text-sm text-[#4d41df]">
                      local_shipping
                    </span>
                    {order.shippingInfo}
                  </div>
                )}

                {/* Action Buttons for New Orders */}
                {isNew && (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleShipNow(order.id)}
                      className="flex-1 bg-gradient-to-r from-[#b90041] to-[#df2457] hover:from-[#a00037] hover:to-[#c71e4d] text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 duration-200 cursor-pointer"
                    >
                      Ship Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForOptions(order)}
                      aria-label="Order Options"
                      className="p-3 rounded-xl bg-[#e7e8ea] hover:bg-[#d9dadc] text-[#191C1E] active:scale-95 duration-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons for Pending Orders */}
                {isPending && (
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => showToast(`Downloading shipping label for Order #${order.id}...`)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#191C1E] py-2.5 rounded-xl font-bold text-xs border border-slate-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">print</span>
                      Print Shipping Label
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForOptions(order)}
                      aria-label="Order Options"
                      className="p-2.5 rounded-xl bg-[#e7e8ea] hover:bg-[#d9dadc] text-[#191C1E] active:scale-95 duration-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">more_horiz</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* ===================== Options Modal ===================== */}
      {selectedOrderForOptions && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base text-[#191C1E] mb-1">
              Order #{selectedOrderForOptions.id}
            </h4>
            <p className="text-xs text-slate-500 mb-4">{selectedOrderForOptions.customerName}</p>

            <div className="space-y-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  showToast('Generating Tax Invoice PDF...');
                  setSelectedOrderForOptions(null);
                }}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center gap-3 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-[#FF3F6C]">receipt</span>
                Download Tax Invoice
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Connecting with Customer Support...');
                  setSelectedOrderForOptions(null);
                }}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center gap-3 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-[#4d41df]">support_agent</span>
                Contact Support / Reseller
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Cancellation request submitted.');
                  setSelectedOrderForOptions(null);
                }}
                className="w-full text-left p-3 hover:bg-red-50 rounded-xl font-semibold text-red-600 flex items-center gap-3 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-red-600">cancel</span>
                Cancel Order
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrderForOptions(null)}
              className="w-full mt-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===================== BottomNavBar ===================== */}
      <AppBottomNav activeNav="orders" onNavigate={onNavigate} />
    </div>
  );
}

export default SupplierOrdersList;
