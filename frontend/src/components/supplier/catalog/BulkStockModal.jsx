import React from 'react';
import { Box, X } from 'lucide-react';

export default function BulkStockModal({
  isOpen,
  onClose,
  selectedCount,
  bulkStockMode,
  setBulkStockMode,
  bulkStockValue,
  setBulkStockValue,
  onSubmit,
  isSubmitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 text-[#b7004d] text-xs font-bold mb-1">
              <Box className="w-3.5 h-3.5" />
              <span>Batch Inventory Operation</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Bulk Update Stock ({selectedCount} Products)
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
            <label className="text-xs font-bold text-slate-700 block">Stock Update Method:</label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  bulkStockMode === 'SET' ? 'border-[#b7004d] bg-pink-50/50 font-bold' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="stockMode"
                  value="SET"
                  checked={bulkStockMode === 'SET'}
                  onChange={() => setBulkStockMode('SET')}
                  className="mt-0.5 accent-[#b7004d]"
                />
                <div>
                  <p className="text-slate-900">Set Exact Stock Quantity</p>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Replaces stock of all selected products with this exact number.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  bulkStockMode === 'ADD' ? 'border-[#b7004d] bg-pink-50/50 font-bold' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="stockMode"
                  value="ADD"
                  checked={bulkStockMode === 'ADD'}
                  onChange={() => setBulkStockMode('ADD')}
                  className="mt-0.5 accent-[#b7004d]"
                />
                <div>
                  <p className="text-slate-900">Add Stock to Existing Quantity</p>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Increments current stock of each selected product by this number.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  bulkStockMode === 'OUT_OF_STOCK'
                    ? 'border-amber-500 bg-amber-50/50 font-bold'
                    : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="stockMode"
                  value="OUT_OF_STOCK"
                  checked={bulkStockMode === 'OUT_OF_STOCK'}
                  onChange={() => setBulkStockMode('OUT_OF_STOCK')}
                  className="mt-0.5 accent-amber-600"
                />
                <div>
                  <p className="text-amber-900">Set All to Out of Stock (0 units)</p>
                  <span className="text-[11px] text-amber-700 font-normal">
                    Temporarily marks items unavailable for purchase.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {bulkStockMode !== 'OUT_OF_STOCK' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {bulkStockMode === 'SET' ? 'New Stock Quantity (Units) *' : 'Quantity to Add (Units) *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(e.target.value)}
                placeholder={bulkStockMode === 'SET' ? 'e.g. 50' : 'e.g. 25'}
                className="w-full h-11 px-3.5 text-xs font-semibold rounded-2xl border border-slate-200 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 outline-none transition"
              />
            </div>
          )}

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
              disabled={
                isSubmitting ||
                (bulkStockMode !== 'OUT_OF_STOCK' && (!bulkStockValue || isNaN(bulkStockValue)))
              }
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : `Update ${selectedCount} Products`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
