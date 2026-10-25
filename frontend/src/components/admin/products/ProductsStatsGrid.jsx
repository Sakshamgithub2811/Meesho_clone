import React from 'react';
import StatCard from '../../common/StatCard';
import { Package, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function ProductsStatsGrid({ stats = {} }) {
  const {
    totalProducts = 0,
    inStock = 0,
    lowStock = 0,
    totalCategories = 0
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Catalog Products */}
      <StatCard
        title="Total Catalog Products"
        value={totalProducts}
        icon={Package}
        color="purple"
        subtitle="Active items across all sellers"
      />

      {/* 2. In Stock */}
      <StatCard
        title="Healthy Inventory"
        value={inStock}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Stock count > 10 units"
      />

      {/* 3. Low Stock Alerts */}
      <StatCard
        title="Low / Out of Stock"
        value={lowStock}
        icon={AlertTriangle}
        color="amber"
        subtitle="Requires supplier re-stock"
      />

      {/* 4. Active Categories */}
      <StatCard
        title="Product Categories"
        value={totalCategories}
        icon={Layers}
        color="blue"
        subtitle="Catalog classifications"
      />
    </div>
  );
}
