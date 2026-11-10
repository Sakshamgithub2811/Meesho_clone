import React from 'react';
import { CheckCircle2, EyeOff, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';

export default function BulkActionBar({
  selectedCount = 0,
  totalCount = 0,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  loading = false
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 sm:gap-5 flex-wrap">
        {/* Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#b7004d] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold text-slate-200">
            Selected of {totalCount}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* 1. Bulk Activate */}
          <Button
            type="button"
            size="sm"
            onClick={onBulkActivate}
            disabled={loading}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 h-8 px-3 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Activate</span>
          </Button>

          {/* 2. Bulk Deactivate (Delist) */}
          <Button
            type="button"
            size="sm"
            onClick={onBulkDeactivate}
            disabled={loading}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 h-8 px-3 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Delist / Hide</span>
          </Button>

          {/* 3. Bulk Delete */}
          <Button
            type="button"
            size="sm"
            onClick={onBulkDelete}
            disabled={loading}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 h-8 px-3 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Delete</span>
          </Button>
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

        {/* Cancel / Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          disabled={loading}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
