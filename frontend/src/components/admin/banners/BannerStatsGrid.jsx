import React from 'react';
import StatCard from '../../common/StatCard';
import { Image, CheckCircle2, Eye, MousePointerClick } from 'lucide-react';

export default function BannerStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Banners"
        value={stats?.totalBanners ?? 0}
        icon={Image}
        color="pink"
        subtitle="Promotional creatives registered"
      />
      <StatCard
        title="Active in Carousel"
        value={stats?.activeBanners ?? 0}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Live on customer homepage"
      />
      <StatCard
        title="Total Banner Clicks"
        value={(stats?.totalClicks ?? 0).toLocaleString('en-IN')}
        icon={MousePointerClick}
        color="blue"
        subtitle="Customer engagement interactions"
      />
      <StatCard
        title="Hidden / Inactive"
        value={stats?.inactiveBanners ?? 0}
        icon={Eye}
        color="amber"
        subtitle="Drafts or off-season banners"
      />
    </div>
  );
}
