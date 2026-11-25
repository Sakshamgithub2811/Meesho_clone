import React from 'react';
import StatCard from '../../common/StatCard';
import { Package, CheckCircle2, AlertTriangle, Layers, Clock } from 'lucide-react';

export default function ProductsStatsGrid({ stats = {} }) {
  const {
    totalProducts = 0,
    inStock = 0,
    lowStock = 0,
    totalCategories = 0,
    pendingApprovals = 0
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Catalog Products */}
      <StatCard
        title="Total Products"
        value={totalProducts}
        icon={Package}
        color="purple"
        subtitle="All catalog listings"
      />

      {/* 2. Pending Approvals */}
      <StatCard
        title="Pending Approval"
        value={pendingApprovals}
        icon={Clock}
        color="amber"
        subtitle={pendingApprovals > 0 ? "⚠️ Requires admin review" : "Queue is clear"}
      />

      {/* 3. In Stock */}
      <StatCard
        title="Live & Healthy"
        value={inStock}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Stock count > 10 units"
      />

      {/* 4. Low Stock Alerts */}
      <StatCard
        title="Low / Out of Stock"
        value={lowStock}
        icon={AlertTriangle}
        color="rose"
        subtitle="Requires supplier re-stock"
      />

      {/* 5. Active Categories */}
      <StatCard
        title="Categories"
        value={totalCategories}
        icon={Layers}
        color="blue"
        subtitle="Catalog classifications"
      />
    </div>
  );
}
