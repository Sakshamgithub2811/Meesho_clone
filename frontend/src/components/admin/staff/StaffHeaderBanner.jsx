import React from 'react';
import { UserCheck, Shield, Headphones, PackageCheck, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';

export default function StaffHeaderBanner({
  staff = [],
  loading = false,
  onRefresh,
  onOpenAddModal
}) {
  const totalCount = staff.length;
  const activeCount = staff.filter((s) => s.status === 'ACTIVE').length;
  const supportCount = staff.filter((s) => s.role === 'SUPPORT_AGENT').length;
  const moderatorCount = staff.filter((s) => s.role === 'CATALOG_MODERATOR').length;

  return (
    <div className="bg-gradient-to-r from-pink-50 via-slate-50 to-indigo-50 border border-pink-100/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#b7004d] text-white rounded-xl shadow-xs">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">Staff Roles & Permissions (RBAC)</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Granular Tab Security
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Delegate operational responsibilities safely. Grant support teams access only to orders and dispute tickets while strictly locking out financial escrow and platform settings.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-xs text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#b7004d]' : ''}`} />
            Refresh
          </Button>

          <Button
            type="button"
            onClick={onOpenAddModal}
            className="rounded-xl bg-[#b7004d] hover:bg-[#9a0041] text-white shadow-sm text-xs font-bold flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Staff KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-pink-50 text-[#b7004d] rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Total Staff Accounts</div>
            <div className="text-sm font-extrabold text-gray-900">{totalCount} Members</div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Active Status</div>
            <div className="text-sm font-extrabold text-gray-900">{activeCount} Active</div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Support Desk Team</div>
            <div className="text-sm font-extrabold text-gray-900">{supportCount} Agents</div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Catalog Moderators</div>
            <div className="text-sm font-extrabold text-gray-900">{moderatorCount} Moderators</div>
          </div>
        </div>
      </div>
    </div>
  );
}

