import React, { useState } from 'react';
import { FileClock, User, Shield, Terminal, Globe, ArrowUpRight } from 'lucide-react';
import FilterBar from '../../common/FilterBar';
import DataTable from '../../common/DataTable';
import { exportToCsv } from '../../../utils/csvExporter';

const CATEGORY_COLORS = {
  PRODUCT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  SETTINGS: 'bg-amber-100 text-amber-800 border-amber-200',
  STAFF: 'bg-purple-100 text-purple-800 border-purple-200',
  BROADCAST: 'bg-blue-100 text-blue-800 border-blue-200',
  SYSTEM: 'bg-slate-100 text-slate-800 border-slate-200'
};

export default function AuditFeedTable({
  logs = [],
  loading = false,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filterTabs = [
    { id: 'ALL', label: 'All Activities' },
    { id: 'PRODUCT', label: 'Product Moderation' },
    { id: 'SETTINGS', label: 'Platform Config' },
    { id: 'STAFF', label: 'Staff & Roles' },
    { id: 'BROADCAST', label: 'Broadcasts' },
    { id: 'SYSTEM', label: 'System' }
  ];

  const filteredData = logs.filter((log) => {
    const matchesSearch =
      log.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress?.includes(searchQuery);

    if (activeCategory === 'ALL') return matchesSearch;
    return matchesSearch && log.targetType?.toUpperCase() === activeCategory;
  });

  const handleExportCsv = () => {
    exportToCsv({
      data: filteredData,
      filename: `admin-audit-log-${new Date().toISOString().slice(0, 10)}`,
      columns: [
        {
          key: 'timestamp',
          label: 'Timestamp',
          formatter: (val) => (val ? new Date(val).toLocaleString('en-IN') : 'N/A')
        },
        { key: 'adminName', label: 'Admin Name' },
        { key: 'adminEmail', label: 'Admin Email' },
        { key: 'action', label: 'Action Event' },
        { key: 'targetType', label: 'Target Category' },
        { key: 'targetId', label: 'Target Entity ID' },
        { key: 'details', label: 'Event Details' },
        { key: 'ipAddress', label: 'IP Address' }
      ]
    });
  };

  const tableColumns = [
    { header: 'Date & Time', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Admin Account', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Category', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Action Code', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Forensic Details', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Network IP', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-right' }
  ];

  return (
    <div className="space-y-4">
      {/* Search and Category FilterBar */}
      <FilterBar
        searchPlaceholder="Search audit events by admin, action, IP or keyword..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={filterTabs}
        activeTab={activeCategory}
        onTabChange={setActiveCategory}
        totalCount={filteredData.length}
        countLabel="Audit Events"
        onRefresh={onRefresh}
        refreshing={loading}
        onExport={handleExportCsv}
        exportLabel="Export Audit Trail"
      />

      {/* Main Audit DataTable */}
      <DataTable
        columns={tableColumns}
        data={filteredData}
        loading={loading}
        emptyTitle="No Audit Logs Found"
        emptyMessage={
          searchQuery
            ? 'No administrative events match your current filter parameters.'
            : 'Audit history is currently empty. Actions taken by administrators will appear here.'
        }
        emptyIcon={FileClock}
        renderRow={(item) => {
          const initials = (item.adminName || item.adminEmail || 'AD')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          const categoryStyle =
            CATEGORY_COLORS[item.targetType?.toUpperCase()] ||
            'bg-gray-100 text-gray-800 border-gray-200';

          return (
            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
              {/* Timestamp */}
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="text-xs font-semibold text-gray-900">
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('en-IN') : ''}
                </div>
              </td>

              {/* Admin Account */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">
                      {item.adminName || 'Admin'}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono truncate max-w-[160px]">
                      {item.adminEmail || 'admin@meesho.com'}
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${categoryStyle}`}
                >
                  {item.targetType || 'GENERAL'}
                </span>
              </td>

              {/* Action Code */}
              <td className="py-3 px-4">
                <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100">
                  {item.action}
                </span>
              </td>

              {/* Forensic Details */}
              <td className="py-3 px-4 max-w-sm">
                <p className="text-xs text-gray-700 break-words leading-relaxed">
                  {item.details || 'No additional details logged.'}
                </p>
                {item.targetId && item.targetId !== 'SYS-ROOT' && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    Ref ID: {item.targetId}
                  </span>
                )}
              </td>

              {/* Network IP */}
              <td className="py-3 px-4 text-right">
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  <Globe className="w-3 h-3 text-gray-400" />
                  {item.ipAddress || '127.0.0.1'}
                </span>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}

