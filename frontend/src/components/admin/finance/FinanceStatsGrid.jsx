import React from 'react';
import StatCard from '../../common/StatCard';
import { Wallet, Clock, Banknote, TrendingUp } from 'lucide-react';

export default function FinanceStatsGrid({ stats = {} }) {
  const {
    totalEscrowBalance = 0,
    totalPendingWithdrawals = 0,
    platformCommissions = 0,
    grossMarketplaceVolume = 0
  } = stats;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Escrow Balance */}
      <StatCard
        title="Escrow Balance"
        value={formatCurrency(totalEscrowBalance)}
        icon={Wallet}
        color="blue"
        subtitle="Total funds held across partner wallets"
      />

      {/* 2. Pending Payout Requests */}
      <StatCard
        title="Pending Settlements"
        value={formatCurrency(totalPendingWithdrawals)}
        icon={Clock}
        color="amber"
        subtitle="Requested supplier / dropshipper payouts"
      />

      {/* 3. Platform Revenue & Commissions */}
      <StatCard
        title="Platform Revenue"
        value={formatCurrency(platformCommissions)}
        icon={Banknote}
        color="emerald"
        subtitle="Marketplace take-rate & service commissions"
      />

      {/* 4. Gross Marketplace Volume (GMV) */}
      <StatCard
        title="Gross Volume (GMV)"
        value={formatCurrency(grossMarketplaceVolume)}
        icon={TrendingUp}
        color="purple"
        subtitle="Cumulative paid platform volume"
      />
    </div>
  );
}
