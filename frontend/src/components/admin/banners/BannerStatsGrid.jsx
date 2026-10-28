import React from 'react';
import { Image, CheckCircle2, Eye, MousePointerClick } from 'lucide-react';

export default function BannerStatsGrid({ stats }) {
  const cards = [
    {
      title: 'Total Banners',
      value: stats?.totalBanners ?? 0,
      sub: 'Promotional creatives registered',
      icon: Image,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Active in Carousel',
      value: stats?.activeBanners ?? 0,
      sub: 'Live on customer homepage',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Total Banner Clicks',
      value: (stats?.totalClicks ?? 0).toLocaleString('en-IN'),
      sub: 'Customer engagement interactions',
      icon: MousePointerClick,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Hidden / Inactive',
      value: stats?.inactiveBanners ?? 0,
      sub: 'Drafts or off-season banners',
      icon: Eye,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
