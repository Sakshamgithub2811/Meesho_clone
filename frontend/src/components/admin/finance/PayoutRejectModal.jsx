import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '../../ui/button';

export default function PayoutRejectModal({
  payout,
  onClose,
  onConfirmReject,
  loading = false,
  formatCurrency
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!payout) return null;

  const user = payout.user || {};
  const displayName = user.storeName || user.fullName || 'Partner Account';
  const formattedAmt = formatCurrency
    ? formatCurrency(payout.amount)
    : `₹${Number(payout.amount || 0).toLocaleString('en-IN')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting this withdrawal');
      return;
    }
    setError('');
    onConfirmReject(payout.id, { reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Reject Withdrawal Request
              </h3>
              <p className="text-xs text-gray-500">
                Cancel payout & automatically refund funds back to partner wallet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Beneficiary Warning Box */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              Rejecting this request will immediately refund{' '}
              <strong className="text-red-700 font-extrabold">{formattedAmt}</strong> back to{' '}
              <strong>{displayName}</strong>'s available wallet balance.
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="e.g. Invalid IFSC Code or Bank Account Name does not match registered GSTIN"
              className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              autoFocus
              required
            />
            {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Processing Refund...
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Confirm Rejection & Refund
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}

