import React from 'react';
import SectionCard from '../../common/SectionCard';
import DataTable from '../../common/DataTable';
import { ShoppingCart } from 'lucide-react';

export default function RecentOrdersCard({ orders = [], onNavigateTab, formatCurrency }) {
  const columns = [
    {
      header: 'Order ID',
      render: (order) => (
        <span className="font-mono text-xs text-gray-600">
          #{order.id.slice(0, 8)}...
        </span>
      )
    },
    {
      header: 'Customer',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900 text-xs">
            {order.user?.fullName || 'Customer'}
          </div>
          <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
            {order.user?.email || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Amount',
      render: (order) => (
        <span className="font-bold text-gray-900 text-xs">
          {formatCurrency ? formatCurrency(order.totalAmount) : `₹${order.totalAmount}`}
        </span>
      )
    },
    {
      header: 'Payment',
      render: (order) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
          order.paymentStatus === 'PAID' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {order.paymentMethod} • {order.paymentStatus}
        </span>
      )
    },
    {
      header: 'Status',
      render: (order) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {order.orderStatus}
        </span>
      )
    }
  ];

  return (
    <SectionCard
      title="Recent Orders"
      subtitle="Latest transactions processed in the system"
      icon={ShoppingCart}
      iconColor="text-[#b7004d]"
      actionLabel="All Orders"
      onAction={onNavigateTab ? () => onNavigateTab('orders') : null}
      className="lg:col-span-2"
      contentClassName="p-0"
    >
      <DataTable
        columns={columns}
        data={orders}
        hasCardWrapper={false}
        emptyTitle="No orders recorded"
        emptyMessage="No customer transactions processed in the database yet."
        emptyIcon={ShoppingCart}
      />
    </SectionCard>
  );
}
