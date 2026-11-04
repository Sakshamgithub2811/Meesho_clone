import React from 'react';
import StatCard from '../../common/StatCard';
import { Ticket, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';

export default function CouponStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Coupons"
        value={stats?.totalCoupons ?? 0}
        icon={Ticket}
        color="pink"
        subtitle="Promo campaigns registered"
      />
      <StatCard
        title="Active & Valid"
        value={stats?.activeCoupons ?? 0}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Currently redeemable codes"
      />
      <StatCard
        title="Total Redemptions"
        value={(stats?.totalRedemptions ?? 0).toLocaleString('en-IN')}
        icon={ShoppingBag}
        color="blue"
        subtitle="Customer uses at checkout"
      />
      <StatCard
        title="Est. Savings Given"
        value={`₹${(stats?.totalDiscountGiven ?? 0).toLocaleString('en-IN')}`}
        icon={Sparkles}
        color="amber"
        subtitle="Gross promotional value given"
      />
    </div>
  );
}
