import React from 'react';
import DataTable from '../../common/DataTable';
import OrderStatusBadge from './OrderStatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Eye, ShoppingCart, Calendar, Truck } from 'lucide-react';

export default function OrdersTable({
  orders = [],
  loading = false,
  onOpenOrder,
  formatDate,
  formatCurrency
}) {
  const columns = [
    {
      header: 'Order ID & Date',
      render: (order) => {
        const dateStr = formatDate 
          ? formatDate(order.createdAt)
          : new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        return (
          <div>
            <span
              onClick={() => onOpenOrder(order)}
              className="font-mono text-xs font-bold text-gray-900 hover:text-[#b7004d] cursor-pointer block"
            >
              #{order.id.slice(0, 8)}...
            </span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{dateStr}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Customer Details',
      render: (order) => {
        const customerName = order.user?.fullName || order.shippingAddress?.name || 'Customer';
        const phone = order.user?.phone || order.shippingAddress?.phone || 'No phone';
        return (
          <div>
            <span className="font-bold text-xs text-gray-900 block truncate max-w-[140px]">
              {customerName}
            </span>
            <span className="text-[11px] text-gray-400 block font-mono">
              {phone}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Purchased Items',
      render: (order) => {
        const items = order.items || [];
        const firstItem = items[0] || {};
        const product = firstItem.product || {};
        const count = items.length;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg border border-gray-200 bg-gray-50 shrink-0">
              {product.images?.[0] ? (
                <AvatarImage src={product.images[0]} alt={product.title} className="object-cover" />
              ) : (
                <AvatarFallback className="text-[10px] bg-pink-50 text-[#b7004d] font-bold">
                  {product.title ? product.title.charAt(0) : 'P'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 max-w-[160px]">
              <span className="text-xs font-semibold text-gray-800 truncate block">
                {product.title || 'Product Item'}
              </span>
              <span className="text-[10px] text-gray-400 block">
                {count > 1 ? `+${count - 1} other item${count > 2 ? 's' : ''}` : 'Single product'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Amount',
      render: (order) => (
        <span className="font-bold text-xs text-gray-900">
          {formatCurrency ? formatCurrency(order.totalAmount) : `₹${order.totalAmount}`}
        </span>
      )
    },
    {
      header: 'Payment',
      render: (order) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
            {order.paymentMethod}
          </span>
          <div>
            <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
              order.paymentStatus === 'PAID'
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-amber-700 bg-amber-50 border border-amber-200'
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Status & Logistics',
      render: (order) => {
        const addr = order.shippingAddress || {};
        const courier = addr.courier || addr.courierPartner;
        const awb = addr.awb || addr.trackingNumber;

        return (
          <div className="space-y-1">
            <OrderStatusBadge status={order.orderStatus} />
            {courier && awb && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate max-w-[120px]" title={`${courier} (${awb})`}>
                  {courier.split(' ')[0]}: <span className="font-mono font-bold text-gray-700">{awb}</span>
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (order) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenOrder(order)}
          className="text-xs h-8 border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-[#b7004d]" />
          View
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      loading={loading}
      loadingMessage="Loading customer orders..."
      emptyMessage="No customer transactions match your selected search or status filters."
      emptyIcon={ShoppingCart}
    />
  );
}
