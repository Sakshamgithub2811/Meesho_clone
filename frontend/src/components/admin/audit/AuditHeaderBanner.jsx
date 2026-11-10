import React from 'react';
import { FileClock, ShieldCheck, Activity, RefreshCw, Lock, Sliders } from 'lucide-react';
import { Button } from '../../ui/button';

export default function AuditHeaderBanner({
  logs = [],
  loading = false,
  onRefresh
}) {
  const totalCount = logs.length;
  const staffLogsCount = logs.filter((l) => l.targetType === 'STAFF').length;
  const productLogsCount = logs.filter((l) => l.targetType === 'PRODUCT').length;
  const settingsLogsCount = logs.filter((l) => l.targetType === 'SETTINGS' || l.targetType === 'BROADCAST').length;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 shadow-md space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl">
              <FileClock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Admin Activity Audit Logs</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Forensic Tracking
            </span>
          </div>
          <p className="text-sm text-indigo-200/80 mt-2 max-w-2xl">
            Enterprise tamper-evident audit ledger capturing administrative operations, staff permission modifications, platform setting alterations, and catalog moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl border-white/20 text-white bg-white/10 hover:bg-white/20 shadow-xs text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Trail
          </Button>
        </div>
      </div>

      {/* Audit Stats KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-indigo-200/70">Total Audit Events</div>
            <div className="text-sm font-extrabold text-white">{totalCount} Records</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-indigo-200/70">Staff & RBAC Updates</div>
            <div className="text-sm font-extrabold text-white">{staffLogsCount} Actions</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-indigo-200/70">Catalog Moderations</div>
            <div className="text-sm font-extrabold text-white">{productLogsCount} Events</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-indigo-200/70">Platform & Config</div>
            <div className="text-sm font-extrabold text-white">{settingsLogsCount} Changes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

