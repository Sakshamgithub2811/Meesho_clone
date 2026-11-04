import React from 'react';
import StatCard from '../../common/StatCard';
import { Layers, Package, GitBranch, FolderTree } from 'lucide-react';

export default function CategoryStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Taxonomies"
        value={stats?.totalCategories ?? 0}
        icon={Layers}
        color="pink"
        subtitle="All categories & subcategories"
      />
      <StatCard
        title="Main Categories"
        value={stats?.mainCategories ?? 0}
        icon={FolderTree}
        color="blue"
        subtitle="Root-level departments"
      />
      <StatCard
        title="Subcategories"
        value={stats?.subCategories ?? 0}
        icon={GitBranch}
        color="emerald"
        subtitle="Child classification levels"
      />
      <StatCard
        title="Linked Products"
        value={stats?.totalProducts ?? 0}
        icon={Package}
        color="indigo"
        subtitle="Active catalog products mapped"
      />
    </div>
  );
}
