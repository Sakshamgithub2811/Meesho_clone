import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { Button } from '../../ui/button';

export default function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  actionLoading,
  formatDate,
  formatCurrency
}) {
  if (!order) return null;

  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.paymentStatus);

  const shipping = order.shippingAddress || {};
  const items = order.items || [];

  const handleSaveStatus = () => {
    if (selectedStatus === order.orderStatus && selectedPaymentStatus === order.paymentStatus) {
      onClose();
      return;
    }
    onUpdateStatus(order.id, {
      orderStatus: selectedStatus,
      paymentStatus: selectedPaymentStatus
    });
  };

  const formattedTotal = formatCurrency
    ? formatCurrency(order.totalAmount)
    : `₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* ── 1. MODAL HEADER ────────────────────────────────────────── */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                Order Details
              </h3>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Order ID: <span className="font-mono text-gray-800 font-semibold">{order.id}</span>
              {order.createdAt && (
                <span> • Placed on {formatDate ? formatDate(order.createdAt) : new Date(order.createdAt).toLocaleDateString()}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. CUSTOMER & SHIPPING ADDRESS ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Profile */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#b7004d]" />
              Customer Information
            </div>
            <p className="text-sm font-bold text-gray-900">
              {order.user?.fullName || shipping.name || 'Customer'}
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-gray-400" />
                <span>{order.user?.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{order.user?.phone || shipping.phone || 'No phone registered'}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#b7004d]" />
              Shipping Address
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {shipping.name || order.user?.fullName}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {shipping.details || shipping.addressLine || 'Address not provided'}
              {shipping.city && `, ${shipping.city}`}
              {shipping.state && `, ${shipping.state}`}
              {shipping.pincode && ` - ${shipping.pincode}`}
            </p>
          </div>
        </div>

        {/* ── 3. ORDER ITEMS ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-[#b7004d]" />
            Ordered Items ({items.length})
          </div>

          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {items.map((item, idx) => {
              const product = item.product || {};
              const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
              const itemTotal = (item.price || product.price || 0) * (item.quantity || 1);

              return (
                <div key={item.id || idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={img}
                      alt={product.title || 'Product'}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">
                        {product.title || 'Product item'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        {item.size && (
                          <span className="bg-gray-100 px-1.5 py-0.2 rounded font-medium text-gray-700">
                            Size: {item.size}
                          </span>
                        )}
                        <span>Qty: <strong>{item.quantity}</strong></span>
                        {product.supplierName && (
                          <span className="text-gray-400">• By {product.supplierName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">
                      ₹{Number(itemTotal).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ₹{item.price} each
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. PAYMENT & INVOICE SUMMARY ───────────────────────────── */}
        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              <CreditCard className="w-3.5 h-3.5 text-[#b7004d]" />
              Payment Information
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-bold text-gray-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : order.paymentStatus === 'FAILED'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs border-t md:border-t-0 md:border-l border-gray-200 md:pl-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>{formattedTotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping Fee:</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="text-[#b7004d]">{formattedTotal}</span>
            </div>
          </div>
        </div>

        {/* ── 5. STATUS UPDATE CONTROLS ──────────────────────────────── */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Update Order & Payment Status
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">
                Order Delivery Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b7004d]/20 focus:border-[#b7004d]"
              >
                <option value="ORDERED">ORDERED (Pending Fulfillment)</option>
                <option value="CONFIRMED">CONFIRMED (Accepted)</option>
                <option value="SHIPPED">SHIPPED (In Transit)</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED (Completed)</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="RETURN_REQUESTED">RETURN REQUESTED</option>
                <option value="RETURNED">RETURNED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b7004d]/20 focus:border-[#b7004d]"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={actionLoading}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveStatus}
              disabled={actionLoading}
              className="bg-[#b7004d] hover:bg-[#96003f] text-white text-xs cursor-pointer"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Status Changes'
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
