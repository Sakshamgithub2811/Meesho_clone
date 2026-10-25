import React from 'react';
import StatCard from '../../common/StatCard';
import { Store, Crown, Award, Package } from 'lucide-react';

export default function SellersStatsGrid({ stats = {} }) {
  const {
    totalSellers = 0,
    platinumSellers = 0,
    goldSellers = 0,
    totalProducts = 0
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Registered Suppliers */}
      <StatCard
        title="Registered Suppliers"
        value={totalSellers}
        icon={Store}
        color="blue"
        subtitle="Active marketplace vendors"
      />

      {/* 2. Platinum Elite Sellers */}
      <StatCard
        title="Platinum Partners"
        value={platinumSellers}
        icon={Crown}
        color="purple"
        subtitle="High-volume top merchants"
      />

      {/* 3. Gold Verified Sellers */}
      <StatCard
        title="Gold Suppliers"
        value={goldSellers}
        icon={Award}
        color="amber"
        subtitle="Verified growing manufacturers"
      />

      {/* 4. Total Catalog Items */}
      <StatCard
        title="Total Catalog Products"
        value={totalProducts}
        icon={Package}
        color="emerald"
        subtitle="Products supplied across categories"
      />
    </div>
  );
}
