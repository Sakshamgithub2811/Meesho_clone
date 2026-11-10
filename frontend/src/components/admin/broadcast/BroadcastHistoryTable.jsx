import React, { useState } from 'react';
import { History, Bell, ExternalLink, Send } from 'lucide-react';
import FilterBar from '../../common/FilterBar';
import DataTable from '../../common/DataTable';
import { exportToCsv } from '../../../utils/csvExporter';

export default function BroadcastHistoryTable({ history = [], loading = false, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All Dispatches' },
    { id: 'promo', label: 'Promo Offers' },
    { id: 'system', label: 'System Notices' },
    { id: 'earning', label: 'Bonus Margins' }
  ];

  const filteredData = history.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'promo') return matchesSearch && item.type === 'promo';
    if (activeTab === 'system') return matchesSearch && item.type === 'system';
    if (activeTab === 'earning') return matchesSearch && item.type === 'earning';
    return matchesSearch;
  });

  const handleExportCsv = () => {
    exportToCsv({
      data: filteredData,
      filename: `broadcast-announcements-${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: 'title', label: 'Broadcast Title' },
        { key: 'body', label: 'Message Body' },
        { key: 'type', label: 'Category' },
        {
          key: 'data.targetAudience',
          label: 'Target Audience',
          formatter: (_, row) => row.data?.targetAudience || 'ALL'
        },
        {
          key: 'data.link',
          label: 'Destination Link',
          formatter: (_, row) => row.data?.link || 'None'
        },
        {
          key: 'createdAt',
          label: 'Sent Date & Time',
          formatter: (val) => (val ? new Date(val).toLocaleString('en-IN') : 'N/A')
        }
      ]
    });
  };

  const tableColumns = [
    { header: 'Headline & Message Body', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Target Audience', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Category Type', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Promo Route', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Sent At', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-right' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-gray-700" />
        <h3 className="font-bold text-gray-900 text-base">Broadcast Dispatch History & Logs</h3>
      </div>

      {/* Common FilterBar */}
      <FilterBar
        searchPlaceholder="Search broadcasts by title or message..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={filteredData.length}
        countLabel="Broadcasts"
        onRefresh={onRefresh}
        refreshing={loading}
        onExport={filteredData.length > 0 ? handleExportCsv : undefined}
        exportLabel="Export Broadcast Logs"
      />

      {/* Common DataTable */}
      <DataTable
        columns={tableColumns}
        data={filteredData}
        loading={loading}
        emptyTitle="No Broadcast Announcements Found"
        emptyMessage="Compose your first push notification above to engage your users."
        emptyIcon={Bell}
        keyExtractor={(item) => item.id}
        renderRow={(item) => {
          const audience = item.data?.targetAudience || 'ALL';
          const link = item.data?.link;

          return (
            <tr key={item.id} className="hover:bg-gray-50/75 transition-colors">
              <td className="py-3.5 px-4 max-w-md">
                <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.body}</div>
              </td>

              <td className="py-3.5 px-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                  {audience === 'ALL'
                    ? '👥 All Users'
                    : audience === 'CUSTOMER'
                    ? '🛍️ Customers'
                    : audience === 'SUPPLIER'
                    ? '📦 Suppliers'
                    : '🚚 Resellers'}
                </span>
              </td>

              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.type === 'promo'
                      ? 'bg-pink-50 text-[#b7004d] border border-pink-100'
                      : item.type === 'system'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : item.type === 'earning'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      : 'bg-amber-50 text-amber-800 border border-amber-100'
                  }`}
                >
                  {item.type}
                </span>
              </td>

              <td className="py-3.5 px-4">
                {link ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#b7004d]">
                    {link} <ExternalLink className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-mono">None</span>
                )}
              </td>

              <td className="py-3.5 px-4 text-right text-xs text-gray-500 whitespace-nowrap">
                {new Date(item.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}
