import React, { useState } from 'react';
import { X, Wallet, RefreshCw, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export default function WalletAdjustModal({
  wallet,
  onClose,
  onSubmit,
  actionLoading,
  formatCurrency
}) {
  if (!wallet) return null;

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit');
  const [description, setDescription] = useState('');

  const u = wallet.user || {};
  const displayName = u.storeName || u.fullName || 'Partner Account';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    onSubmit(wallet.id, {
      amount: parseFloat(amount),
      type,
      description: description.trim() || `Admin manual ${type.toUpperCase()}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Adjust Escrow Balance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Account: <strong className="text-gray-800">{displayName}</strong>
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

        {/* Current Balance Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-500 block">Available Balance</span>
            <span className="text-base font-black text-emerald-700">
              {formatCurrency(wallet.balance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block">Pending Payout</span>
            <span className="text-xs font-bold text-amber-700">
              {formatCurrency(wallet.pending)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Type */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  type === 'credit'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                Credit Fund (+)
              </button>

              <button
                type="button"
                onClick={() => setType('debit')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  type === 'debit'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                Debit Fund (-)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Amount (₹)
            </label>
            <Input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-sm font-bold"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Narration / Reason
            </label>
            <Input
              type="text"
              placeholder="e.g. Incentive bonus, Order margin correction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={actionLoading}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={actionLoading || !amount}
              className="bg-[#b7004d] hover:bg-[#96003f] text-white text-xs cursor-pointer"
            >
              {actionLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Confirm Adjustment'
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
