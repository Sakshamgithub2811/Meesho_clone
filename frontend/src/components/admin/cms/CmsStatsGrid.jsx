import React from 'react';
import StatCard from '../../common/StatCard';
import { FileText, CheckCircle2, FileEdit, Globe } from 'lucide-react';

export default function CmsStatsGrid({ stats, pages = [] }) {
  const seoConfiguredCount = pages.filter((p) => p.metaTitle && p.metaDescription).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pages */}
      <StatCard
        title="Total Pages"
        value={stats?.total ?? pages.length}
        icon={FileText}
        color="pink"
        subtitle="Standard policies & custom pages"
      />

      {/* 2. Published & Live */}
      <StatCard
        title="Published & Live"
        value={stats?.published ?? pages.filter((p) => p.status === 'PUBLISHED').length}
        icon={CheckCircle2}
        color="emerald"
        subtitle="Visible on customer storefront"
      />

      {/* 3. Drafts */}
      <StatCard
        title="Drafts / Unpublished"
        value={stats?.drafts ?? pages.filter((p) => p.status === 'DRAFT').length}
        icon={FileEdit}
        color="amber"
        subtitle="Hidden from public viewing"
      />

      {/* 4. SEO Optimized */}
      <StatCard
        title="SEO Ready"
        value={`${seoConfiguredCount} / ${pages.length}`}
        icon={Globe}
        color="blue"
        subtitle="Custom meta title & description"
      />
    </div>
  );
}
