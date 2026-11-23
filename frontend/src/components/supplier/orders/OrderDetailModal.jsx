import React from 'react';
import { X, User, MapPin, Printer } from 'lucide-react';

export default function OrderDetailModal({
  order,
  onClose,
  handleStatusChange,
  isUpdatingStatus,
  onPrintSlip,
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase">Order Details</span>
            <h3 className="text-lg font-black text-slate-900">
              #{String(order.id).slice(-8).toUpperCase()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
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
            <p className="text-slate-700 font-semibold">{order.user?.fullName || order.customerName || 'N/A'}</p>
            <p className="text-slate-500">Phone: {order.user?.phone || 'N/A'}</p>
            <p className="text-slate-500">Email: {order.user?.email || 'N/A'}</p>
            {order.shippingAddress && (
              <div className="pt-1 flex items-start gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {typeof order.shippingAddress === 'string'
                    ? order.shippingAddress
                    : JSON.stringify(order.shippingAddress)}
                </span>
              </div>
            )}
          </div>

          {/* Items in Order (with Per-Item Status Control) */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Ordered Catalog Items</h4>
            <div className="space-y-2.5">
              {(order.items || []).map((item, idx) => {
                const iStatus = (item.itemStatus || order.orderStatus || 'ORDERED').toUpperCase();
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
                          onChange={(e) => handleStatusChange(order.id, e.target.value, item.id)}
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
                value={order.orderStatus || order.status || 'ORDERED'}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
            onClick={() => onPrintSlip(order)}
            className="w-full py-2.5 rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print 4x6 Shipping Label & AWB Barcode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
