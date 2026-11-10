import React, { useState } from 'react';

export default function CancelOrderModal({
  order,
  onClose,
  onConfirm,
  isCancelling = false,
}) {
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customCancelReason, setCustomCancelReason] = useState('');

  if (!order) return null;

  const primaryItem = order.items?.[0] || {};
  const prod = primaryItem.product || {};
  const image = order.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200';
  const productName = order.productName || prod.title || (order.items?.length > 1 ? `${order.items.length} Order Items` : 'Catalog Order');
  const size = order.size || primaryItem.size || 'Free Size';
  const price = Number(order.price ?? order.totalAmount ?? 0);
  const paymentMethod = (order.paymentMethod || 'COD').toUpperCase();

  const handleConfirm = () => {
    const finalReason =
      cancelReason === 'Other'
        ? customCancelReason || 'Customer requested cancellation'
        : cancelReason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Cancel Order</h3>
              <p className="text-xs text-slate-400 font-semibold font-mono">#{order.id?.slice(0, 10)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Product Summary */}
        <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
          <img
            src={image}
            alt=""
            className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 line-clamp-1">{productName}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {order.items?.length > 1 ? `${order.items.length} items • ` : ''}
              Size: {size} • <strong className="text-slate-900">₹{price.toLocaleString('en-IN')}</strong>
            </p>
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
              'Other',
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
          {paymentMethod === 'COD' ? (
            <span>
              💡 <strong>Cash on Delivery:</strong> No payment has been deducted. Order will be cancelled immediately without charges.
            </span>
          ) : (
            <span>
              💡 <strong>Instant Refund:</strong> ₹{price.toLocaleString('en-IN')} will be automatically refunded to your Customer Wallet balance immediately.
            </span>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Don't Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
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
  );
}
