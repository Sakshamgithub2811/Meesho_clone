import React from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

export default function TransactionTypeBadge({ type = 'credit', className = '' }) {
  const norm = (type || 'credit').toLowerCase();

  if (norm === 'credit') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
      >
        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
        <span>Credit (+)</span>
      </span>
    );
  }

  if (norm === 'debit') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
      >
        <ArrowUpRight className="w-3 h-3 text-rose-600" />
        <span>Debit (-)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
    >
      <RefreshCw className="w-3 h-3 text-amber-600" />
      <span>Reversed</span>
    </span>
  );
}
