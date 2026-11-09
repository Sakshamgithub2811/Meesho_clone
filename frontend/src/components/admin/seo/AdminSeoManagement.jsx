import React, { useState, useEffect } from 'react';
import SeoHeaderBanner from './SeoHeaderBanner';
import SeoMetricsGrid from './SeoMetricsGrid';
import SeoProtocolCards from './SeoProtocolCards';
import SeoPagesTable from './SeoPagesTable';
import { API_BASE, BACKEND_ROOT } from '../../../config/apiConfig';

/**
 * Enterprise SEO & Search Crawler Hub
 * Orchestrator component managing sitemap generation stats,
 * crawler directives, and indexable storefront routes.
 */
export default function AdminSeoManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchSeoStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/seo/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load SEO stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoStats();
  }, []);

  const handleCopySitemap = () => {
    const url = stats?.sitemapUrl || `${BACKEND_ROOT}/sitemap.xml`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Static pages list with type categorization
  const staticPages = (stats?.staticPages || []).map((page) => {
    let type = 'Shopping';
    if (
      page.path.includes('resell') ||
      page.path.includes('affiliate') ||
      page.path.includes('supplier') ||
      page.path.includes('support') ||
      page.path.includes('ticket') ||
      page.path.includes('dropship')
    ) {
      type = 'Partner & Support';
    } else if (
      page.path.includes('curator') ||
      page.path.includes('petal') ||
      page.path.includes('pulse') ||
      page.path.includes('signal') ||
      page.path.includes('luxe')
    ) {
      type = 'Theme & Design';
    }
    return { ...page, type };
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Status Action Banner */}
      <SeoHeaderBanner
        loading={loading}
        onRefresh={fetchSeoStats}
        onCopySitemap={handleCopySitemap}
        copied={copied}
      />

      {/* 2. 5-Metric Crawler StatCard Grid */}
      <SeoMetricsGrid stats={stats} loading={loading} />

      {/* 3. Direct Protocol Files (sitemap.xml & robots.txt) */}
      <SeoProtocolCards stats={stats} />

      {/* 4. Filterable & Exportable Indexable Routes Table */}
      <SeoPagesTable
        pages={staticPages}
        loading={loading}
        frontendBase={stats?.frontendBase || 'http://localhost:5173'}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
    </div>
  );
}
