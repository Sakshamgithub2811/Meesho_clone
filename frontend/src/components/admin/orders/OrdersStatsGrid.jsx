import React from 'react';
import StatCard from '../../common/StatCard';
import { ShoppingCart, IndianRupee, Clock, Truck, CheckCircle2 } from 'lucide-react';

export default function OrdersStatsGrid({ stats = {}, formatCurrency }) {
  const {
    totalOrders = 0,
    totalRevenue = 0,
    pendingOrders = 0,
    shippedOrders = 0,
    deliveredOrders = 0,
    cancelledOrders = 0
  } = stats;

  const displayRevenue = formatCurrency
    ? formatCurrency(totalRevenue)
    : `₹${Number(totalRevenue || 0).toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Orders */}
      <StatCard
        title="Total Orders"
        value={totalOrders}
        icon={ShoppingCart}
        color="pink"
        subtitle="All-time customer orders"
      />

      {/* 2. Total Revenue */}
      <StatCard
        title="Total Revenue"
        value={displayRevenue}
        icon={IndianRupee}
        color="emerald"
        subtitle="Gross merchandise value"
      />

      {/* 3. Pending / In Progress */}
      <StatCard
        title="Pending Processing"
        value={pendingOrders}
        icon={Clock}
        color="amber"
        subtitle="Awaiting fulfillment"
      />

      {/* 4. In Transit / Shipped */}
      <StatCard
        title="In Transit"
        value={shippedOrders}
        icon={Truck}
        color="blue"
        subtitle="Dispatched for delivery"
      />

      {/* 5. Delivered */}
      <StatCard
        title="Delivered"
        value={deliveredOrders}
        icon={CheckCircle2}
        color="purple"
        subtitle={`${cancelledOrders} cancelled`}
      />
    </div>
  );
}
