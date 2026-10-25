import React from 'react';
import { Crown, Award, Shield, CheckCircle2 } from 'lucide-react';

export default function SellerStatusBadge({ tier = 'Silver', showLabel = true, className = '' }) {
  const normalizedTier = (tier || 'Silver').toLowerCase();

  if (normalizedTier === 'platinum') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}
      >
        <Crown className="w-3.5 h-3.5 text-purple-600" />
        {showLabel && <span>Platinum Partner</span>}
      </span>
    );
  }

  if (normalizedTier === 'gold') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      >
        <Award className="w-3.5 h-3.5 text-amber-600" />
        {showLabel && <span>Gold Verified</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      <Shield className="w-3.5 h-3.5 text-slate-500" />
      {showLabel && <span>Silver Supplier</span>}
    </span>
  );
}
