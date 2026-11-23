import React from 'react';
import { IndianRupee, X } from 'lucide-react';

export default function BulkPriceModal({
  isOpen,
  onClose,
  selectedCount,
  bulkPriceMode,
  setBulkPriceMode,
  bulkPriceValue,
  setBulkPriceValue,
  onSubmit,
  isSubmitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Batch Price Adjustment</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Bulk Adjust Price ({selectedCount} Products)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Pricing Adjustment Method:</label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  bulkPriceMode === 'SET' ? 'border-emerald-600 bg-emerald-50/50 font-bold' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="priceMode"
                  value="SET"
                  checked={bulkPriceMode === 'SET'}
                  onChange={() => setBulkPriceMode('SET')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <p className="text-slate-900">Set Exact Flat Selling Price</p>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Sets all selected items to this exact price (e.g. ₹499).
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  bulkPriceMode === 'PERCENT_DISCOUNT' ? 'border-emerald-600 bg-emerald-50/50 font-bold' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="priceMode"
                  value="PERCENT_DISCOUNT"
                  checked={bulkPriceMode === 'PERCENT_DISCOUNT'}
                  onChange={() => setBulkPriceMode('PERCENT_DISCOUNT')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <p className="text-slate-900">Apply Percentage Discount (% OFF)</p>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Reduces each item's price by X% (e.g. 10% Festive Sale).
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  bulkPriceMode === 'FLAT_DISCOUNT' ? 'border-emerald-600 bg-emerald-50/50 font-bold' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="priceMode"
                  value="FLAT_DISCOUNT"
                  checked={bulkPriceMode === 'FLAT_DISCOUNT'}
                  onChange={() => setBulkPriceMode('FLAT_DISCOUNT')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <p className="text-slate-900">Apply Flat Rupee Reduction (₹ OFF)</p>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Subtracts flat ₹X from current price of each item.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {bulkPriceMode === 'SET'
                ? 'New Selling Price (₹) *'
                : bulkPriceMode === 'PERCENT_DISCOUNT'
                ? 'Discount Percentage (%) *'
                : 'Flat Reduction Amount (₹) *'}
            </label>
            <input
              type="number"
              min="1"
              required
              value={bulkPriceValue}
              onChange={(e) => setBulkPriceValue(e.target.value)}
              placeholder={
                bulkPriceMode === 'SET'
                  ? 'e.g. 499'
                  : bulkPriceMode === 'PERCENT_DISCOUNT'
                  ? 'e.g. 10'
                  : 'e.g. 50'
              }
              className="w-full h-11 px-3.5 text-xs font-semibold rounded-2xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBulkSubmitting || !bulkPriceValue || isNaN(bulkPriceValue)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {isBulkSubmitting ? 'Updating...' : `Update Prices for ${selectedCount} Products`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
