import React from 'react';
import { Globe, FileText, ExternalLink } from 'lucide-react';
import FilterBar from '../../common/FilterBar';
import DataTable from '../../common/DataTable';
import { exportToCsv } from '../../../utils/csvExporter';

export default function SeoPagesTable({
  pages = [],
  loading = false,
  frontendBase = 'http://localhost:5173',
  searchQuery = '',
  setSearchQuery,
  activeFilter = 'all',
  setActiveFilter
}) {
  const filterTabs = [
    { id: 'all', label: 'All Pages' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'partner', label: 'Partner & Help' },
    { id: 'theme', label: 'Themes' }
  ];

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.path?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.label?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'shopping') return matchesSearch && page.type === 'Shopping';
    if (activeFilter === 'partner') return matchesSearch && page.type === 'Partner & Support';
    if (activeFilter === 'theme') return matchesSearch && page.type === 'Theme & Design';
    return matchesSearch;
  });

  const handleExportCsv = () => {
    exportToCsv({
      data: filteredPages,
      filename: `seo-indexed-routes-${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: 'label', label: 'Page Name' },
        { key: 'path', label: 'Route Path' },
        { key: 'type', label: 'Category' },
        { key: 'priority', label: 'Search Priority' },
        { key: 'changefreq', label: 'Crawl Frequency' },
        {
          key: 'fullUrl',
          label: 'Full Preview URL',
          formatter: (_, row) => `${frontendBase}${row.path}`
        }
      ]
    });
  };

  const tableColumns = [
    { header: 'Route Path & Label', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Category Type', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Search Priority', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Crawl Frequency', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Live Preview', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-right' }
  ];

  return (
    <div className="space-y-4">
      {/* ── UNIFIED FILTER & EXPORT BAR ─────────────────── */}
      <FilterBar
        searchPlaceholder="Search indexable routes (e.g. /explorer, Sarees, Support)..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={filterTabs}
        activeTab={activeFilter}
        onTabChange={setActiveFilter}
        totalCount={filteredPages.length}
        countLabel="Routes"
        onExport={filteredPages.length > 0 ? handleExportCsv : undefined}
        exportLabel="Export SEO URLs"
      />

      {/* ── DATA TABLE OF INDEXABLE STATIC PAGES ─────────── */}
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
                href={`${frontendBase}${page.path}`}
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
