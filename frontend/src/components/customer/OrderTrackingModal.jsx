import { API_BASE, API_V1_BASE } from '../../config/apiConfig';
import React from 'react';
import { useSelector } from 'react-redux';
import { auth } from '../../utils/firebase';

export default function OrderTrackingModal({
  order,
  onClose,
  onCancelRequest,
  onDownloadInvoice,
  onToast,
  getTrackingTimeline,
}) {
  if (!order) return null;

  const reduxUser = useSelector((state) => state.user?.currentUser);

  const st = (order.orderStatus || order.status || 'ORDERED').toUpperCase();
  const isReturned = st === 'RETURNED' || st === 'RETURN_REQUESTED';
  const isDelivered = !isReturned && st === 'DELIVERED';
  const isCancelled = !isReturned && st === 'CANCELLED';
  const isShipped = !isReturned && st === 'SHIPPED';
  const isOutForDelivery = !isReturned && st === 'OUT_FOR_DELIVERY';
  const isOrdered = !isReturned && (st === 'ORDERED' || st === 'CONFIRMED' || st === 'PROCESSING');
  const isCancellable = (isOrdered || isShipped) && !isReturned;
  const isPrepaid = (order?.paymentMethod || '').toUpperCase() !== 'COD';

  const returnData = React.useMemo(() => {
    try {
      const returnedOrders = JSON.parse(localStorage.getItem('mshoppy_returned_orders') || '{}');
      return returnedOrders[order.id] || null;
    } catch (e) {
      return null;
    }
  }, [order.id]);

  const primaryItem = order?.items?.[0] || {};
  const product = primaryItem.product || {};
  const image = order.image || product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200';
  const productName = order.productName || product.title || (order.items?.length > 1 ? `${order.items.length} Order Items` : 'Catalog Order');
  const size = order.size || primaryItem.size || 'Free Size';
  const price = Number(order.price ?? order.totalAmount ?? 0);

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const defaultTimeline = {
    trackingPartner: 'Shadowfax Logistics (AWB: SF' + (order.id?.slice(0, 8).toUpperCase() || '1029384') + ')',
    placedDateStr: orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    shippedDateStr: new Date(orderDate.getTime() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    expectedDeliveryStr: new Date(orderDate.getTime() + 4 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    events: {
      placed: `${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Order received & verified`,
      processed: 'Seller acknowledged & packed item',
      pickedUp: 'Courier picked up from warehouse hub',
      arrived1: 'Arrived at sorting facility',
      left: 'In transit to destination city hub',
    }
  };
  const track = (getTrackingTimeline ? getTrackingTimeline(order) : null) || defaultTimeline;

  const copyToClipboard = (text, msg = 'Copied to clipboard!') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (onToast) onToast(msg);
  };

  // Deterministic 4-digit Delivery OTP based on order ID
  const deliveryOtp = React.useMemo(() => {
    const seed = (order.id || 'order-sample').split('').reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) % 9000, 1000);
    return Math.abs(seed) + 1000;
  }, [order.id]);

  const customerEmail = React.useMemo(() => {
    // 1. Check logged-in user in Redux
    if (reduxUser?.email && !reduxUser.email.endsWith('@customer.meesho')) {
      return reduxUser.email;
    }
    // 2. Check Firebase Auth current session
    if (auth?.currentUser?.email) {
      return auth.currentUser.email;
    }
    // 3. Check localStorage customer session
    try {
      const u = localStorage.getItem('mshoppy_customer_user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed.email && !parsed.email.endsWith('@customer.meesho')) return parsed.email;
      }
    } catch (e) {}
    // 4. Check Redux persist root
    try {
      const persistStr = localStorage.getItem('persist:root');
      if (persistStr) {
        const parsedRoot = JSON.parse(persistStr);
        if (parsedRoot.user) {
          const uObj = JSON.parse(parsedRoot.user);
          if (uObj.currentUser?.email && !uObj.currentUser.email.endsWith('@customer.meesho')) {
            return uObj.currentUser.email;
          }
        }
      }
    } catch (e) {}
    // 5. Check order shipping address
    const addr = order?.shippingAddress;
    if (addr) {
      const parsedAddr = typeof addr === 'string' ? JSON.parse(addr) : addr;
      if (parsedAddr?.email) return parsedAddr.email;
    }
    return order?.user?.email || '';
  }, [reduxUser, order?.shippingAddress, order?.user]);

  // Automated silent OTP email dispatch as soon as order is OUT_FOR_DELIVERY
  const autoSentRef = React.useRef(false);

  React.useEffect(() => {
    if (isOutForDelivery && customerEmail && !autoSentRef.current) {
      const storageKey = `otp_email_sent_${order.id}_${deliveryOtp}`;
      if (!sessionStorage.getItem(storageKey)) {
        autoSentRef.current = true;
        sessionStorage.setItem(storageKey, 'true');
        fetch(`${API_V1_BASE}/orders/send-otp-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            otp: deliveryOtp,
            type: 'DELIVERY',
            email: customerEmail,
            recipientName: order.shippingAddress?.name || 'Customer',
            slotLabel: `Today by 8:00 PM (${track?.expectedDeliveryStr || 'Today'})`
          })
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && onToast) {
              onToast(`Delivery OTP automatically sent to ${customerEmail} 📧`);
            }
          })
          .catch((err) => console.error('Silent OTP auto-dispatch error:', err));
      }
    }
  }, [isOutForDelivery, customerEmail, order.id, deliveryOtp, track?.expectedDeliveryStr, onToast]);

  return (
    <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* App Bar / Header */}
        <div className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer text-lg font-bold"
              aria-label="Back"
            >
              ✕
            </button>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {isReturned ? 'Return Tracking & Milestones' : 'Order Tracking & Milestones'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToast && onToast('Dedicated Support available 24x7: support@mshoppy.in 📞')}
              className="text-xs font-bold text-slate-700 border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Help
            </button>
            <button
              onClick={() => copyToClipboard(order.id, 'Order ID copied!')}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              title="Copy Order ID"
            >
              📋
            </button>
          </div>
        </div>

        {/* Product Info Strip */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-start gap-3.5">
            <img
              src={image}
              alt={productName}
              className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-slate-200 bg-white shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                {productName}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Size: <span className="text-slate-800">{size}</span> • <span className="text-[#b7004d] font-bold">₹{price.toLocaleString('en-IN')}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-slate-600 font-mono">
                  Order #{order.id?.slice(0, 14)}
                </span>
                <button
                  onClick={() => copyToClipboard(order.id, 'Order ID copied!')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs"
                  title="Copy Order ID"
                >
                  [Copy]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery / Return OTP & Window Card */}
        {isReturned ? (
          <div className="mx-5 mt-4 p-3.5 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#9f0038] flex items-center justify-center font-black text-xl shrink-0">
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#9f0038]">
                    Doorstep Return Handover OTP
                  </span>
                  <span className="text-[9px] bg-pink-200 text-[#9f0038] font-extrabold px-2 py-0.5 rounded-full">
                    Keep Ready for Courier
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-lg font-black tracking-widest text-[#9f0038] font-mono">
                    {returnData?.otp || deliveryOtp}
                  </span>
                  <button
                    onClick={() => copyToClipboard(String(returnData?.otp || deliveryOtp), 'Return OTP copied to clipboard! 📋')}
                    className="text-[10px] text-[#9f0038] font-bold hover:underline cursor-pointer flex items-center gap-0.5 bg-white border border-rose-200 px-2 py-0.5 rounded-md"
                  >
                    <span>Copy</span>
                  </button>
                  {customerEmail && (
                    <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                      <span>✓</span> Emailed to {customerEmail}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                  🕒 Pickup Slot: <strong className="text-slate-800">{returnData?.slot || 'Today'}</strong> • Courier: Shadowfax Logistics
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                  <span>⚠️</span> Share this OTP with courier partner only upon item handover
                </p>
              </div>
            </div>
          </div>
        ) : !isCancelled && !isDelivered && (
          <div className="mx-5 mt-4 p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xl shrink-0">
                🔐
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    {isPrepaid ? 'Prepaid Delivery OTP' : 'Doorstep Delivery OTP'}
                  </span>
                  <span className="text-[9px] bg-amber-200/70 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                    Required at Delivery
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-lg font-black tracking-widest text-slate-900 font-mono">
                    {deliveryOtp}
                  </span>
                  <button
                    onClick={() => copyToClipboard(String(deliveryOtp), 'Delivery OTP copied to clipboard! 📋')}
                    className="text-[10px] text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-0.5 bg-amber-100/60 px-2 py-0.5 rounded-md"
                  >
                    <span>Copy</span>
                  </button>
                  {customerEmail && (
                    <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                      <span>✓</span> Emailed to {customerEmail}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  🕒 Delivery Window: <strong className="text-slate-700">9:00 AM – 8:00 PM</strong> • Expected by {track?.expectedDeliveryStr}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                  <span>📲</span> Sent automatically to your login email upon Out For Delivery
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Vertical Timeline */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isReturned ? (
            <div className="space-y-6">
              {/* Return Step 1 */}
              <div className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 shrink-0 mt-0.5 shadow-sm" />
                  <div className="w-0.5 flex-1 my-1 bg-amber-500" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900">Return Request Submitted</h4>
                    <span className="text-slate-500 font-semibold">
                      {returnData?.requestedAt ? new Date(returnData.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Done'}
                    </span>
                  </div>
                  <div className="mt-2 pl-1 text-slate-600 font-medium">
                    <p className="text-slate-800 font-semibold">Return &amp; Refund Request Accepted</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Item requested for reverse collection &amp; 100% refund.</p>
                  </div>
                </div>
              </div>

              {/* Return Step 2 */}
              <div className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-amber-500 shrink-0 mt-0.5 shadow-sm animate-pulse" />
                  <div className="w-0.5 flex-1 my-1 bg-slate-200" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900">Courier Partner Assigned</h4>
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Scheduled
                    </span>
                  </div>
                  <div className="mt-2 pl-1 text-slate-600 font-medium">
                    <p className="text-slate-800 font-semibold">Shadowfax Logistics assigned for doorstep pickup</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Collection slot: <strong>{returnData?.slot || 'Today'}</strong>. Keep item tags and packaging intact.
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Step 3 */}
              <div className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white shrink-0 mt-0.5" />
                  <div className="w-0.5 flex-1 my-1 bg-slate-200" />
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-extrabold text-sm text-slate-700">Doorstep Verification &amp; Handover</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Courier executive will verify the product at doorstep. Share the 4-digit OTP: <strong className="font-mono text-[#9f0038]">{returnData?.otp || deliveryOtp}</strong>.
                  </p>
                </div>
              </div>

              {/* Return Step 4 */}
              <div className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white shrink-0 mt-0.5" />
                </div>
                <div className="flex-1 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-700">100% Refund Credited</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Amount ₹{price} will be credited to your Bank/UPI account instantly upon successful pickup scan.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* 1. Order Confirmed Milestone */}
          <div className="flex gap-4 relative">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-emerald-600 shrink-0 mt-0.5 shadow-sm" />
              <div
                className={`w-0.5 flex-1 my-1 ${
                  isCancelled
                    ? 'bg-slate-200'
                    : isShipped || isOutForDelivery || isDelivered
                    ? 'bg-emerald-600'
                    : 'bg-slate-200'
                }`}
              />
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm text-slate-900">Order Confirmed</h4>
                <span className="text-slate-500 font-semibold">{track?.placedDateStr}</span>
              </div>

              <div className="mt-2.5 space-y-3 pl-1 text-slate-600 font-medium">
                <div>
                  <p className="text-slate-800 font-semibold">Your Order has been placed.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{track?.events?.placed}</p>
                </div>
                <div>
                  <p className="text-slate-800 font-semibold">
                    {isShipped || isOutForDelivery || isDelivered
                      ? 'Seller has processed your order.'
                      : 'Seller has received and is processing your order.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{track?.events?.processed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled Milestone Branch */}
          {isCancelled ? (
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-red-600 shrink-0 mt-0.5 shadow-sm" />
              </div>
              <div className="flex-1 pb-4">
                <h4 className="font-extrabold text-sm text-red-600">Order Cancelled</h4>
                <p className="text-[11px] text-slate-500 mt-1">This order was cancelled by customer request.</p>
              </div>
            </div>
          ) : isShipped || isOutForDelivery || isDelivered ? (
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-600 shrink-0 mt-0.5 shadow-sm" />
                <div
                  className={`w-0.5 flex-1 my-1 ${
                    isOutForDelivery || isDelivered ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h4 className="font-extrabold text-sm text-slate-900">Shipped</h4>
                  <span className="text-slate-500 font-semibold">{track?.shippedDateStr}</span>
                </div>

                <div className="mt-2.5 space-y-2.5 pl-1 text-slate-600 font-medium">
                  <div>
                    <p className="text-slate-800 font-semibold">
                      Courier partner ({track?.trackingPartner}) has picked up your item.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{track?.events?.pickedUp}</p>
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold">Your item has arrived at a hub facility</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{track?.events?.arrived1}</p>
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold">Your item has left a delivery partner facility</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{track?.events?.left}</p>
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
                    Courier partner (Shadowfax) will pick up the package once packing is done.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Out For Delivery Milestone */}
          {!isCancelled && (
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${
                    isDelivered ? 'bg-emerald-600' : 'border-2 border-slate-300 bg-white'
                  }`}
                />
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

                {isOutForDelivery && !isDelivered && order.paymentMethod !== 'COD' && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                        Prepaid Delivery OTP
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-950 tracking-widest">
                        {deliveryOtp}
                      </span>
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        📱 Sent to your phone via SMS. Share with delivery partner at doorstep.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Delivery Milestone */}
          {!isCancelled && (
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${
                    isDelivered ? 'bg-emerald-600' : 'border-2 border-slate-300 bg-white'
                  }`}
                />
              </div>

              <div className="flex-1">
                <h4 className={`font-extrabold text-sm ${isDelivered ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {isDelivered ? 'Delivered' : `Delivery Expected By ${track?.expectedDeliveryStr}`}
                </h4>
                <div className="mt-1 pl-1 text-[11px] text-slate-400 space-y-0.5 font-medium">
                  <p>{isDelivered ? 'Delivered to your doorstep.' : 'Item yet to be delivered.'}</p>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {/* Bottom Sticky Action Footer */}
        {(isCancellable || isDelivered) && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
            {isCancellable && (
              <button
                onClick={() => onCancelRequest(order)}
                className="w-full py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 bg-white text-xs font-black transition-all text-center cursor-pointer shadow-sm active:scale-95"
              >
                Cancel Order
              </button>
            )}

            {isDelivered && (
              <button
                onClick={() => onDownloadInvoice && onDownloadInvoice(order)}
                className="w-full py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 bg-white text-xs font-bold transition-all text-center cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>📄 Download Tax Invoice</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
