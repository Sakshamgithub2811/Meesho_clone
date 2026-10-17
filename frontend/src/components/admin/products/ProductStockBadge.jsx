import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function ProductStockBadge({ stock = 0, className = '' }) {
  const stockNum = Number(stock || 0);

  if (stockNum <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}
      >
        <XCircle className="w-3 h-3 text-red-500" />
        <span>Out of Stock</span>
      </span>
    );
  }

  if (stockNum <= 10) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        <span>Low Stock ({stockNum})</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      <span>In Stock ({stockNum})</span>
    </span>
  );
}
