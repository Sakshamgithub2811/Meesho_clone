import React from 'react';
import { 
  Clock, 
  Truck, 
  Package, 
  CheckCircle2, 
  XCircle,
  RotateCcw
} from 'lucide-react';

export function getReturnStatusConfig(status = '') {
  const s = (status || '').toLowerCase();

  switch (s) {
    case 'requested':
      return {
        label: 'Pending Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
        icon: Clock
      };
    case 'approved':
      return {
        label: 'Pickup Scheduled',
        className: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
        icon: Truck
      };
    case 'picked_up':
      return {
        label: 'Item Picked Up',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20',
        icon: Package
      };
    case 'refunded':
      return {
        label: 'Refund Processed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
        icon: CheckCircle2
      };
    case 'rejected':
      return {
        label: 'Claim Rejected',
        className: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
        icon: XCircle
      };
    default:
      return {
        label: status || 'Unknown',
        className: 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20',
        icon: RotateCcw
      };
  }
}

export default function ReturnStatusBadge({ status, className = '' }) {
  const config = getReturnStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className} ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}
