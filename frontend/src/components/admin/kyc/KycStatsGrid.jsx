import React from 'react';
import StatCard from '../../common/StatCard';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

/**
 * KycStatsGrid Component
 * Renders 4 analytical KPI cards for KYC applications using common StatCard
 */
export default function KycStatsGrid({ stats }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Applications',
      value: stats?.total || 0,
      icon: ShieldCheck,
      color: 'pink',
      subtitle: 'across platform'
    },
    {
      id: 'pending',
      title: 'Pending Review',
      value: stats?.pending || 0,
      icon: AlertCircle,
      color: 'amber',
      badge: stats?.pending > 0 ? {
        text: 'Action Required',
        icon: AlertCircle,
        variant: 'warning'
      } : null,
      subtitle: stats?.pending > 0 ? '' : 'All caught up'
    },
    {
      id: 'underReview',
      title: 'Under Review',
      value: stats?.underReview || 0,
      icon: Clock,
      color: 'blue',
      subtitle: 'documents in review'
    },
    {
      id: 'approved',
      title: 'Approved Partners',
      value: stats?.approved || 0,
      icon: CheckCircle2,
      color: 'emerald',
      badge: {
        text: 'Verified',
        icon: CheckCircle2,
        variant: 'success'
      },
      subtitle: 'active on platform'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.id} {...card} />
      ))}
    </div>
  );
}
