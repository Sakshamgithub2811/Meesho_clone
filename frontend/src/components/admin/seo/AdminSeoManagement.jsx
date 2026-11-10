import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileCode,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Package,
  FolderTree,
  FileText
} from 'lucide-react';
import StatCard from '../../common/StatCard';
import DataTable from '../../common/DataTable';
import { Card, CardContent } from '../../ui/card';
import { API_BASE, BACKEND_ROOT } from '../../../config/apiConfig';

export default function AdminSeoManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'shopping', 'partner', 'theme'

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
    if (page.path.includes('resell') || page.path.includes('affiliate') || page.path.includes('supplier') || page.path.includes('support') || page.path.includes('ticket') || page.path.includes('dropship')) {
      type = 'Partner & Support';
    } else if (page.path.includes('curator') || page.path.includes('petal') || page.path.includes('pulse') || page.path.includes('signal') || page.path.includes('luxe')) {
      type = 'Theme & Design';
    }
    return { ...page, type };
  });

  const filteredPages = staticPages.filter((page) => {
    const matchesSearch =
      page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.label.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'shopping') return matchesSearch && page.type === 'Shopping';
    if (activeFilter === 'partner') return matchesSearch && page.type === 'Partner & Support';
    if (activeFilter === 'theme') return matchesSearch && page.type === 'Theme & Design';
    return matchesSearch;
  });

  const tableColumns = [
    { header: 'Route Path & Label', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Category Type', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Search Priority', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Crawl Frequency', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Live Preview', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-right' }
  ];

  return (
    <div className="space-y-6">
      {/* ── TOP ACTION & STATUS BANNER ───────────────────────── */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-100/70 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#b7004d] text-white rounded-xl shadow-xs">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">Dynamic SEO & Search Crawler Hub</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live On-The-Fly Generation
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Real-time sitemap queries your PostgreSQL products and categories directly on crawl requests, adhering strictly to the <span className="font-semibold text-gray-800">sitemaps.org standard</span> for instant Google indexing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchSeoStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition-all active:scale-95"
            title="Refresh stats from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b7004d]' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleCopySitemap}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#b7004d] hover:bg-[#9a0041] rounded-xl shadow-sm transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy GSC Sitemap URL'}
          </button>
        </div>
      </div>``

      {/* ── 5 STATCARDS METRIC GRID (METHOD 2 INTEGRATION) ──── */}
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

      {/* ── DIRECT FILE LINKS & ROBOTS PROTOCOL ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sitemap card */}
        <Card className="border border-gray-200/80 shadow-xs hover:border-pink-200 transition-all">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-pink-50 text-[#b7004d] rounded-2xl">
              <FileCode className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">sitemap.xml (Public XML)</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-pink-100 text-[#b7004d]">
                  XML Protocol
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Serves on-the-fly XML to Googlebot, Bingbot, and Yahoo with all published products, categories, and public storefronts.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={stats?.sitemapUrl || `${BACKEND_ROOT}/sitemap.xml`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b7004d] hover:underline"
                >
                  Inspect Live XML <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">
                  {stats?.sitemapUrl}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt card */}
        <Card className="border border-gray-200/80 shadow-xs hover:border-indigo-200 transition-all">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">robots.txt (Crawler Directives)</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  Security Guard
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Directs search engines to index storefront while explicitly blocking private routes like <code className="text-indigo-600">/admin-panel</code>, <code className="text-indigo-600">/cart</code>, and <code className="text-indigo-600">/api/</code>.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={stats?.robotsUrl || `${BACKEND_ROOT}/robots.txt`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                >
                  Inspect Live robots.txt <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">
                  {stats?.robotsUrl}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FILTER & SEARCH BAR FOR INDEXED PAGES ───────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indexable routes (e.g. /explorer, Sarees, Support)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#b7004d]/20 focus:border-[#b7004d] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All Pages' },
            { id: 'shopping', label: 'Shopping' },
            { id: 'partner', label: 'Partner & Help' },
            { id: 'theme', label: 'Themes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DATA TABLE OF INDEXABLE STATIC PAGES ─────────────── */}
      <DataTable
        columns={tableColumns}
        data={filteredPages}
        loading={loading}
        emptyTitle="No SEO pages match filter"
        emptyMessage="Try adjusting your search query or tab filter."
        emptyIcon={Globe}
        keyExtractor={(item) => item.path}
        renderRow={(page) => (
          <tr key={page.path} className="hover:bg-gray-50/75 transition-colors">
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-gray-100 text-gray-600 rounded-lg">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{page.label}</div>
                  <div className="text-xs font-mono text-[#b7004d] mt-0.5">{page.path}</div>
                </div>
              </div>
            </td>

            <td className="py-3.5 px-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  page.type === 'Shopping'
                    ? 'bg-pink-50 text-pink-700 border border-pink-100'
                    : page.type === 'Partner & Support'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                }`}
              >
                {page.type}
              </span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-xs text-gray-800">
                {page.priority}
              </span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                {page.changefreq}
              </span>
            </td>

            <td className="py-3.5 px-4 text-right">
              <a
                href={`${stats?.frontendBase || 'http://localhost:5173'}${page.path}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                Open Page <ExternalLink className="w-3 h-3" />
              </a>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
