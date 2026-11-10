import React, { useState } from 'react';
import { UserCheck, Shield, Trash2, Edit, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import FilterBar from '../../common/FilterBar';
import DataTable from '../../common/DataTable';
import { Button } from '../../ui/button';
import { exportToCsv } from '../../../utils/csvExporter';

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  SUPPORT_AGENT: 'bg-blue-100 text-blue-800 border-blue-200',
  CATALOG_MODERATOR: 'bg-amber-100 text-amber-800 border-amber-200',
  FINANCE_OFFICER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CUSTOM: 'bg-slate-100 text-slate-800 border-slate-200'
};

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin 👑',
  SUPPORT_AGENT: 'Support Agent 🎧',
  CATALOG_MODERATOR: 'Catalog Moderator 📦',
  FINANCE_OFFICER: 'Finance Officer 💰',
  CUSTOM: 'Custom Access ⚙️'
};

export default function StaffTable({
  staff = [],
  loading = false,
  onRefresh,
  onEditStaff,
  onToggleStatus,
  onDeleteStaff
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All Staff' },
    { id: 'SUPPORT_AGENT', label: 'Support Agents' },
    { id: 'CATALOG_MODERATOR', label: 'Moderators' },
    { id: 'FINANCE_OFFICER', label: 'Finance' },
    { id: 'CUSTOM', label: 'Custom' }
  ];

  const filteredData = staff.filter((item) => {
    const matchesSearch =
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && item.role === activeTab;
  });

  const handleExportCsv = () => {
    exportToCsv({
      data: filteredData,
      filename: `staff-roster-${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: 'fullName', label: 'Staff Member Name' },
        { key: 'email', label: 'Staff Email' },
        {
          key: 'role',
          label: 'System Role',
          formatter: (val) => ROLE_LABELS[val] || val
        },
        {
          key: 'permissions',
          label: 'Allowed Navigation Tabs',
          formatter: (val) => (Array.isArray(val) ? val.join(', ') : 'All')
        },
        { key: 'status', label: 'Account Status' },
        {
          key: 'createdAt',
          label: 'Created Date',
          formatter: (val) => (val ? new Date(val).toLocaleDateString('en-IN') : 'N/A')
        }
      ]
    });
  };

  const tableColumns = [
    { header: 'Staff Member', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Assigned Role', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Accessible Tabs', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700' },
    { header: 'Account Status', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Created', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-center' },
    { header: 'Actions', headerClassName: 'py-3.5 px-4 font-semibold text-gray-700 text-right' }
  ];

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <FilterBar
        searchPlaceholder="Search staff by name, email or role..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={filteredData.length}
        countLabel="Members"
        onRefresh={onRefresh}
        refreshing={loading}
        onExport={handleExportCsv}
        exportLabel="Export Roster"
      />

      {/* Main Staff DataTable */}
      <DataTable
        columns={tableColumns}
        data={filteredData}
        loading={loading}
        emptyTitle="No Staff Accounts Found"
        emptyMessage={
          searchQuery
            ? 'No staff members match your current search filters.'
            : 'No staff accounts configured yet. Click "Add Staff Member" above to create one.'
        }
        emptyIcon={UserCheck}
        renderRow={(member) => {
          const isSuperAdmin = member.role === 'SUPER_ADMIN';
          const isActive = member.status === 'ACTIVE';
          const initials = (member.fullName || 'Staff')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          const permissions = Array.isArray(member.permissions) ? member.permissions : [];

          return (
            <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
              {/* Member Name & Email */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-100 text-[#b7004d] font-bold text-xs flex items-center justify-center shrink-0 border border-pink-200">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                      {member.fullName}
                      {isSuperAdmin && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                          ROOT
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">{member.email}</div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {ROLE_LABELS[member.role] || member.role}
                </span>
              </td>

              {/* Accessible Tabs Pills */}
              <td className="py-3 px-4">
                {isSuperAdmin || permissions.includes('ALL') ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    <Shield className="w-3 h-3" /> Full Platform Access
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1 max-w-xs">
                    {permissions.slice(0, 3).map((tab) => (
                      <span
                        key={tab}
                        className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 uppercase"
                      >
                        {tab}
                      </span>
                    ))}
                    {permissions.length > 3 && (
                      <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                        +{permissions.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </td>

              {/* Account Status */}
              <td className="py-3 px-4 text-center">
                <button
                  type="button"
                  disabled={isSuperAdmin}
                  onClick={() => onToggleStatus && onToggleStatus(member.id, member.status)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    isSuperAdmin
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                      : isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 cursor-pointer'
                      : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 cursor-pointer'
                  }`}
                  title={isSuperAdmin ? 'Super admin status cannot be toggled' : 'Click to toggle status'}
                >
                  {isActive ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-600" />
                      Inactive
                    </>
                  )}
                </button>
              </td>

              {/* Created Date */}
              <td className="py-3 px-4 text-center text-xs text-gray-500">
                {member.createdAt
                  ? new Date(member.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'N/A'}
              </td>

              {/* Actions */}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSuperAdmin}
                    onClick={() => onEditStaff && onEditStaff(member)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isSuperAdmin ? 'Super Admin cannot be edited' : 'Edit permissions'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSuperAdmin}
                    onClick={() => onDeleteStaff && onDeleteStaff(member.id, member.fullName)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isSuperAdmin ? 'Super Admin cannot be deleted' : 'Revoke staff member'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}
