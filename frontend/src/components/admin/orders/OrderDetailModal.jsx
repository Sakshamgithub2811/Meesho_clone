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
  ShoppingBag,
  ExternalLink,
  Hash,
  Sparkles,
  Printer
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderPrintSlipModal from './OrderPrintSlipModal';
import { Button } from '../../ui/button';

export const COURIER_OPTIONS = [
  { value: 'Delhivery Surface / Express', label: 'Delhivery Express 🚚', prefix: 'https://www.delhivery.com/track/package/' },
  { value: 'BlueDart Air', label: 'BlueDart Air ✈️', prefix: 'https://www.bluedart.com/tracking?trackNumber=' },
  { value: 'Shadowfax Logistics', label: 'Shadowfax Logistics 🛵', prefix: 'https://tracker.shadowfax.in/#/track?awb=' },
  { value: 'XpressBees Logistics', label: 'XpressBees 🐝', prefix: 'https://www.xpressbees.com/track?awb=' },
  { value: 'DTDC Express', label: 'DTDC Express 📦', prefix: 'https://www.dtdc.in/tracking/tracking_results.asp?trType=awb_no&strAwbNo=' },
  { value: 'Ekart Logistics', label: 'Ekart Logistics ⚡', prefix: 'https://ekartlogistics.com/shipmenttrack/' },
  { value: 'India Post (Speed Post)', label: 'India Post (Speed Post) 📮', prefix: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx' },
  { value: 'Self-Ship / Local Fleet', label: 'Self-Ship / Local Fleet 🏬', prefix: '' },
  { value: 'Meesho Express (Demo Tracking)', label: 'Meesho Express (Demo Tracking) 🚀', prefix: '' }
];

export const getLiveTrackingUrl = (courier = '', awb = '') => {
  if (!awb) return '';
  const c = courier.toLowerCase();
  const cleanAwb = String(awb).trim();
  if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${cleanAwb}`;
  if (c.includes('blue') || c.includes('bluedart')) return `https://www.bluedart.com/tracking?trackNumber=${cleanAwb}`;
  if (c.includes('shadowfax')) return `https://tracker.shadowfax.in/#/track?awb=${cleanAwb}`;
  if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/tracking_results.asp?trType=awb_no&strAwbNo=${cleanAwb}`;
  if (c.includes('xpress')) return `https://www.xpressbees.com/track?awb=${cleanAwb}`;
  if (c.includes('ekart')) return `https://ekartlogistics.com/shipmenttrack/${cleanAwb}`;
  if (c.includes('post') || c.includes('speed')) return 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
  return '';
};

export default function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  actionLoading,
  formatDate,
  formatCurrency
}) {
  if (!order) return null;

  const shipping = order.shippingAddress || {};
  const items = order.items || [];

  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.paymentStatus);
  const [courierPartner, setCourierPartner] = useState(
    shipping.courier || shipping.courierPartner || 'Delhivery Surface / Express'
  );
  const [trackingNumber, setTrackingNumber] = useState(
    shipping.awb || shipping.trackingNumber || ''
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    shipping.estimatedDelivery || ''
  );
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleGenerateDemoAwb = () => {
    const isBlue = courierPartner.toLowerCase().includes('blue');
    const isDelhivery = courierPartner.toLowerCase().includes('delhivery');
    const prefix = isBlue ? 'BD' : isDelhivery ? 'DEL' : 'MSH';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    setTrackingNumber(`${prefix}-${randomNum}`);
  };

  const handleSaveStatus = () => {
    onUpdateStatus(order.id, {
      orderStatus: selectedStatus,
      paymentStatus: selectedPaymentStatus,
      courierPartner,
      trackingNumber,
      estimatedDelivery
    });
  };

  const formattedTotal = formatCurrency
    ? formatCurrency(order.totalAmount)
    : `₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`;

  const computedLiveUrl = getLiveTrackingUrl(courierPartner, trackingNumber);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
          
          {/* ── 1. MODAL HEADER ────────────────────────────────────────── */}
          <div className="flex justify-between items-start border-b pb-4 flex-wrap gap-2">
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
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPrintModal(true)}
                className="text-xs border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#b7004d]" />
                Print Label / Slip
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── 2. ACTIVE LOGISTICS CARD (If already dispatched) ─────────── */}
          {(shipping.courier || shipping.awb) && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      {shipping.courier || shipping.courierPartner || 'Assigned Courier'}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active Shipment
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-gray-600 mt-0.5">
                    AWB: <strong>{shipping.awb || shipping.trackingNumber}</strong>
                  </p>
                </div>
              </div>
              {shipping.trackingUrl && (
                <a
                  href={shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-xs"
                >
                  Track on Portal <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* ── 3. CUSTOMER & SHIPPING SUMMARY ─────────────────────────── */}
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

          {/* ── 4. ORDER ITEMS ─────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              <ShoppingBag className="w-3.5 h-3.5 text-[#b7004d]" />
              Ordered Items ({items.length})
            </div>

            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {items.map((item, idx) => {
                const product = item.product || {};
                const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                const itemTotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={img}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
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

          {/* ── 5. PAYMENT & INVOICE SUMMARY ───────────────────────────── */}
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

          {/* ── 6. STATUS UPDATE & DISPATCH CONTROLS ───────────────────── */}
          <div className="border-t pt-4 space-y-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Update Order & Logistics Status
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

            {/* Logistics & Dispatch Box (Shows when SHIPPED or OUT_FOR_DELIVERY is selected) */}
            {(selectedStatus === 'SHIPPED' || selectedStatus === 'OUT_FOR_DELIVERY') && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5 text-[#b7004d]" />
                    Courier Partner & AWB Tracking
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateDemoAwb}
                    className="text-[11px] font-semibold text-[#b7004d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate Test AWB
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b7004d]/20 focus:border-[#b7004d]"
                    >
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">
                      AWB / Tracking Consignment ID
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. DEL98421098 or BD1029384"
                        className="w-full text-xs font-mono font-semibold pl-8 pr-2.5 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b7004d]/20 focus:border-[#b7004d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Link Preview if available */}
                {computedLiveUrl && (
                  <div className="flex items-center justify-between text-[11px] bg-white border border-slate-200 rounded-lg p-2 text-slate-600">
                    <span className="truncate max-w-[340px]">
                      🔗 Public Portal Link: <span className="font-mono text-blue-600">{computedLiveUrl}</span>
                    </span>
                    <a
                      href={computedLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline shrink-0 ml-2 flex items-center gap-0.5"
                    >
                      Test ↗
                    </a>
                  </div>
                )}
              </div>
            )}

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
                className="bg-[#b7004d] hover:bg-[#96003f] text-white text-xs cursor-pointer font-bold"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Updating Logistics...
                  </>
                ) : (
                  'Save Status & Dispatch'
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 7. PRINT SLIP & INVOICE MODAL ───────────────────────────── */}
      {showPrintModal && (
        <OrderPrintSlipModal
          order={order}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  );
}
