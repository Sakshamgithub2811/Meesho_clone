import React, { useState } from 'react';
import { X, CheckCircle2, Building2, AlertTriangle, RefreshCw, Hash, FileText } from 'lucide-react';
import { Button } from '../../ui/button';

export default function PayoutApproveModal({
  payout,
  onClose,
  onConfirmApprove,
  loading = false,
  formatCurrency
}) {
  const [utrNumber, setUtrNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');

  if (!payout) return null;

  const user = payout.user || {};
  const displayName = user.storeName || user.fullName || 'Partner Account';
  const bank = user.bankDetails || {};
  const formattedAmt = formatCurrency
    ? formatCurrency(payout.amount)
    : `₹${Number(payout.amount || 0).toLocaleString('en-IN')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setError('Please enter the Bank UTR / Reference Transaction Number');
      return;
    }
    setError('');
    onConfirmApprove(payout.id, {
      utrNumber: utrNumber.trim(),
      adminNotes: adminNotes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Confirm Payout Disbursement
              </h3>
              <p className="text-xs text-gray-500">
                Mark bank withdrawal as settled & generate ledger receipt
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

        {/* Beneficiary & Amount Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Beneficiary Partner</span>
            <span className="text-xs font-bold text-gray-900">{displayName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Payout Amount</span>
            <span className="text-sm font-extrabold text-emerald-600">{formattedAmt}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600 pt-1 border-t border-slate-200">
            <span className="font-semibold text-gray-500">Target Account</span>
            <span className="font-mono text-gray-800 font-medium">
              {payout.destination || bank.accountNumber || 'Bank Account'}
            </span>
          </div>
          {bank.ifsc && (
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span className="font-semibold text-gray-500">IFSC Code</span>
              <span className="font-mono text-gray-800 font-medium">{bank.ifsc}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Bank Reference / UTR Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => {
                  setUtrNumber(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="e.g. UTR984210452189 or IMPS26189"
                className="w-full pl-9 pr-4 py-2.5 text-xs font-mono font-semibold uppercase border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                autoFocus
                required
              />
            </div>
            {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Notes / Banking Remarks (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Transferred via HDFC NetBanking IMPS"
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Recording Settlement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirm & Mark Paid
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}

