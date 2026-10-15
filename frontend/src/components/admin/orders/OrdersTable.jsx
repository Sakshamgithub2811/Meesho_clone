import React from 'react';
import DataTable from '../../common/DataTable';
import OrderStatusBadge from './OrderStatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Eye, ShoppingCart, Calendar } from 'lucide-react';

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
              className="font-mono text-xs font-bold text-[#b7004d] hover:underline cursor-pointer block"
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
      header: 'Customer',
      render: (order) => {
        const customerName = order.user?.fullName || order.shippingAddress?.name || 'Customer';
        const customerEmail = order.user?.email || 'No email';
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 bg-pink-100 text-[#b7004d] text-xs font-bold shrink-0">
              {order.user?.avatarUrl ? (
                <AvatarImage src={order.user.avatarUrl} alt={customerName} />
              ) : (
                <AvatarFallback>{customerName.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-bold text-gray-900 text-xs">{customerName}</p>
              <p className="text-[11px] text-gray-400 truncate max-w-[130px]">{customerEmail}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Items',
      render: (order) => {
        const items = order.items || [];
        const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
        const firstItem = items[0]?.product;
        return (
          <div className="flex items-center gap-2">
            {firstItem?.images?.[0] ? (
              <img
                src={firstItem.images[0]}
                alt={firstItem.title}
                className="w-8 h-8 rounded object-cover bg-gray-100 border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-800">
                {count} {count === 1 ? 'item' : 'items'}
              </p>
              <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
                {firstItem?.title || 'Multiple items'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Total Amount',
      render: (order) => (
        <span className="font-bold text-gray-900 text-xs">
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
      header: 'Status',
      render: (order) => <OrderStatusBadge status={order.orderStatus} />
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
      emptyTitle="No orders found"
      emptyMessage="No customer transactions match your selected search or status filters."
      emptyIcon={ShoppingCart}
    />
  );
}
