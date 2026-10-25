import React from 'react';
import StatCard from '../../common/StatCard';
import { TrendingUp, ShoppingBag, Users, CheckCircle2 } from 'lucide-react';

export default function AnalyticsStatsGrid({ kpis = {} }) {
  const {
    grossMerchandiseValue = 0,
    averageOrderValue = 0,
    totalUsers = 0,
    fulfillmentRate = 0
  } = kpis;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. GMV */}
      <StatCard
        title="Gross Volume (GMV)"
        value={formatCurrency(grossMerchandiseValue)}
        icon={TrendingUp}
        color="purple"
        subtitle="Platform revenue across all orders"
      />

      {/* 2. Average Order Value */}
      <StatCard
        title="Average Order Value"
        value={formatCurrency(averageOrderValue)}
        icon={ShoppingBag}
        color="blue"
        subtitle="Mean cart spend per transaction"
      />

      {/* 3. Total Users */}
      <StatCard
        title="Active User Base"
        value={totalUsers}
        icon={Users}
        color="emerald"
        subtitle="Customers, suppliers & dropshippers"
      />

      {/* 4. Fulfillment Rate */}
      <StatCard
        title="Fulfillment Rate"
        value={`${fulfillmentRate}%`}
        icon={CheckCircle2}
        color="amber"
        subtitle="Successfully delivered order ratio"
      />
    </div>
  );
}
