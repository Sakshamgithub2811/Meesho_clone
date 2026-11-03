import React from 'react';
import { Layers, Package, GitBranch, FolderTree } from 'lucide-react';

export default function CategoryStatsGrid({ stats }) {
  const cards = [
    {
      title: 'Total Taxonomies',
      value: stats?.totalCategories ?? 0,
      sub: 'All categories & subcategories',
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Main Categories',
      value: stats?.mainCategories ?? 0,
      sub: 'Root-level departments',
      icon: FolderTree,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Subcategories',
      value: stats?.subCategories ?? 0,
      sub: 'Child classification levels',
      icon: GitBranch,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Linked Products',
      value: stats?.totalProducts ?? 0,
      sub: 'Active catalog products mapped',
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
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

