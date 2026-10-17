import React from 'react';
import StatCard from '../../common/StatCard';
import { RotateCcw, Clock, Truck, CheckCircle2 } from 'lucide-react';

export default function ReturnsStatsGrid({ stats = {} }) {
  const {
    totalReturns = 0,
    pendingApproval = 0,
    approvedForPickup = 0,
    refunded = 0
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Claims */}
      <StatCard
        title="Total Return Claims"
        value={totalReturns}
        icon={RotateCcw}
        color="purple"
        subtitle="All-time customer requests"
      />

      {/* 2. Pending Approval */}
      <StatCard
        title="Pending Review"
        value={pendingApproval}
        icon={Clock}
        color="amber"
        subtitle="Awaiting admin approval"
      />

      {/* 3. In Pickup Transit */}
      <StatCard
        title="Pickup Scheduled"
        value={approvedForPickup}
        icon={Truck}
        color="blue"
        subtitle="Driver pickup assigned"
      />

      {/* 4. Refunded / Settled */}
      <StatCard
        title="Refunds Settled"
        value={refunded}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Payment reversed to buyer"
      />
    </div>
  );
}
