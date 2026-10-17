import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  Truck, 
  Clock, 
  XCircle, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

/**
 * Maps OrderStatus to appropriate visual styling & icon
 */
export function getOrderStatusConfig(status = '') {
  const s = (status || '').toUpperCase();

  switch (s) {
    case 'ORDERED':
    case 'PENDING':
      return {
        label: 'Ordered',
        className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
        icon: Clock
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        className: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
        icon: Package
      };
    case 'SHIPPED':
      return {
        label: 'Shipped',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20',
        icon: Truck
      };
    case 'OUT_FOR_DELIVERY':
      return {
        label: 'Out for Delivery',
        className: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20',
        icon: Truck
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
        icon: CheckCircle2
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
        icon: XCircle
      };
    case 'RETURN_REQUESTED':
    case 'RETURNED':
      return {
        label: 'Return Requested',
        className: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20',
        icon: RotateCcw
      };
    case 'REFUNDED':
      return {
        label: 'Refunded',
        className: 'bg-zinc-100 text-zinc-700 border-zinc-200 ring-zinc-600/20',
        icon: AlertCircle
      };
    default:
      return {
        label: status || 'Unknown',
        className: 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20',
        icon: Package
      };
  }
}

export default function OrderStatusBadge({ status, className = '' }) {
  const config = getOrderStatusConfig(status);
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
