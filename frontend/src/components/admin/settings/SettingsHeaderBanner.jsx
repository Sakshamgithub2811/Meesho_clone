import React from 'react';
import { Sliders, Save, RotateCcw, Clock } from 'lucide-react';
import { Button } from '../../ui/button';

export default function SettingsHeaderBanner({
  saving = false,
  isDirty = false,
  lastUpdated = null,
  onSave,
  onReset
}) {
  return (
    <div className="bg-gradient-to-r from-pink-50 via-slate-50 to-indigo-50 border border-pink-100/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-[#b7004d] text-white rounded-xl shadow-xs">
            <Sliders className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-gray-900">Global Platform Business Settings</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Engine Config
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Configure marketplace commission cuts, reseller wallet payout thresholds, free delivery rules, and payment gateway controls in real time.
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last modified: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={!isDirty || saving}
          className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 shadow-xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Discard Changes
        </Button>

        <Button
          type="button"
          onClick={onSave}
          disabled={saving || !isDirty}
          className="rounded-xl bg-[#b7004d] hover:bg-[#9a0041] text-white shadow-sm text-xs font-semibold flex items-center gap-2 px-5 py-2.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Applying Settings...' : isDirty ? 'Save Platform Settings' : 'Settings Saved'}
        </Button>
      </div>
    </div>
  );
}

