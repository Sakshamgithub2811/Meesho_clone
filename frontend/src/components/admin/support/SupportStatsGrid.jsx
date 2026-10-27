import React from 'react';
import StatCard from '../../common/StatCard';
import { Headphones, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function SupportStatsGrid({ stats = {} }) {
  const {
    totalTickets = 0,
    openTickets = 0,
    inProgressTickets = 0,
    resolvedTickets = 0
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Tickets */}
      <StatCard
        title="Total Support Tickets"
        value={totalTickets}
        icon={Headphones}
        color="purple"
        subtitle="All-time partner & buyer queries"
      />

      {/* 2. Open Disputes */}
      <StatCard
        title="Open Issues"
        value={openTickets}
        icon={AlertCircle}
        color="rose"
        subtitle="Needs immediate action"
      />

      {/* 3. In Progress */}
      <StatCard
        title="In Progress"
        value={inProgressTickets}
        icon={Clock}
        color="amber"
        subtitle="Under investigation"
      />

      {/* 4. Resolved */}
      <StatCard
        title="Resolved"
        value={resolvedTickets}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Successfully closed tickets"
      />
    </div>
  );
}
