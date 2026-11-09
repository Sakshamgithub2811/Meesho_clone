import React from 'react';
import { Globe, Package, FolderTree, FileText, Layers } from 'lucide-react';
import StatCard from '../../common/StatCard';

export default function SeoMetricsGrid({ stats = null, loading = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <StatCard
        icon={Globe}
        label="Total Indexable URLs"
        value={loading ? '...' : (stats?.totalUrls || 0)}
        color="pink"
        badge={{ text: '100% Live', isPositive: true }}
      />
      <StatCard
        icon={Package}
        label="Products in Sitemap"
        value={loading ? '...' : (stats?.productsCount || 0)}
        color="emerald"
        badge={{ text: 'Priority 0.9', isPositive: true }}
      />
      <StatCard
        icon={FolderTree}
        label="Active Categories"
        value={loading ? '...' : (stats?.categoriesCount || 0)}
        color="indigo"
        badge={{ text: 'Priority 0.8', isPositive: true }}
      />
      <StatCard
        icon={FileText}
        label="Dynamic CMS Pages"
        value={loading ? '...' : (stats?.cmsPagesCount || 0)}
        color="amber"
        badge={{ text: 'Auto Indexed', isPositive: true }}
      />
      <StatCard
        icon={Layers}
        label="Curated Static Pages"
        value={loading ? '...' : (stats?.staticPagesCount || 0)}
        color="blue"
        badge={{ text: 'Core Routes', isPositive: true }}
      />
    </div>
  );
}

