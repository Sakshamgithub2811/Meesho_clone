import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Package, 
  Eye, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ReturnStatusBadge from './ReturnStatusBadge';
import { Button } from '../../ui/button';

export default function ReturnReviewModal({
  returnReq,
  onClose,
  onUpdateStatus,
  actionLoading,
  formatDate,
  formatCurrency
}) {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!returnReq) return null;

  const order = returnReq.order || {};
  const user = order.user || {};
  const items = order.items || [];
  const images = returnReq.images || [];

  const handleAction = (status) => {
    onUpdateStatus(returnReq.id, status);
  };

  const formattedAmount = formatCurrency
    ? formatCurrency(order.totalAmount)
    : `₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
          
          {/* ── 1. MODAL HEADER ────────────────────────────────────────── */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Return & Refund Review
                </h3>
                <ReturnStatusBadge status={returnReq.status} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Claim ID: <span className="font-mono text-gray-800 font-semibold">{returnReq.id}</span>
                {returnReq.createdAt && (
                  <span> • Filed on {formatDate ? formatDate(returnReq.createdAt) : new Date(returnReq.createdAt).toLocaleDateString()}</span>
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

          {/* ── 2. RETURN REASON & PROOF PHOTOS ────────────────────────── */}
          <div className="space-y-3">
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Customer Return Reason
              </div>
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                "{returnReq.reason || 'No specific reason detailed by customer.'}"
              </p>
            </div>

            {/* Proof Images Gallery */}
            {images.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Customer Proof Photos ({images.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImage(img)}
                      className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`Proof ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 3. ORDER & CUSTOMER INFORMATION ────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5 text-[#b7004d]" />
                Customer Details
              </div>
              <p className="text-xs font-bold text-gray-900">{user.fullName || 'Customer'}</p>
              <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
              {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                <CreditCard className="w-3.5 h-3.5 text-[#b7004d]" />
                Order & Refund Amount
              </div>
              <p className="text-xs text-gray-600">
                Order ID: <span className="font-mono text-gray-800">#{order.id?.slice(0, 8)}...</span>
              </p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Refund Value:</span>
                <span className="text-sm font-bold text-[#b7004d]">{formattedAmount}</span>
              </div>
              <p className="text-[11px] text-gray-400">Paid via {order.paymentMethod || 'COD'}</p>
            </div>
          </div>

          {/* ── 4. ORDERED ITEMS PREVIEW ───────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#b7004d]" />
              Items In This Order ({items.length})
            </div>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {items.map((item, idx) => {
                const product = item.product || {};
                const img = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                return (
                  <div key={item.id || idx} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={img}
                        alt={product.title || 'Product'}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{product.title || 'Item'}</p>
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity} • Size: {item.size || 'Free Size'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">
                      ₹{item.price} each
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. ACTION BUTTONS ──────────────────────────────────────── */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Take Decision on Return Request
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAction('rejected')}
                disabled={actionLoading || returnReq.status === 'rejected' || returnReq.status === 'refunded'}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject Claim
              </Button>

              <div className="flex flex-wrap gap-2">
                {returnReq.status === 'requested' && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAction('approved')}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1" />
                    Approve Pickup
                  </Button>
                )}

                {returnReq.status === 'approved' && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAction('picked_up')}
                    disabled={actionLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 mr-1" />
                    Mark Picked Up
                  </Button>
                )}

                {returnReq.status !== 'refunded' && returnReq.status !== 'rejected' && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAction('refunded')}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
                  >
                    {actionLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    Process Refund ({formattedAmount})
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── LIGHTBOX PHOTO PREVIEW ─────────────────────────────────── */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Enlarged Proof" className="max-w-full max-h-[80vh] rounded-xl object-contain mx-auto" />
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
