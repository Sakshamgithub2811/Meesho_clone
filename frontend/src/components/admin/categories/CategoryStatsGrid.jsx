import React from 'react';
import { Layers, Package, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CategoryStatsGrid({ stats }) {
  const cards = [
    {
      title: 'Total Categories',
      value: stats?.totalCategories ?? 0,
      sub: 'Catalog taxonomies registered',
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Active in Catalog',
      value: stats?.activeCategories ?? 0,
      sub: 'Categories having live products',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Total Linked Products',
      value: stats?.totalProducts ?? 0,
      sub: 'Mapped products across catalog',
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Empty Categories',
      value: stats?.emptyCategories ?? 0,
      sub: 'Categories with 0 products linked',
      icon: AlertCircle,
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
