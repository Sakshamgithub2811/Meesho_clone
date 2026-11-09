import React from 'react';
import { Percent, Wallet, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';

export default function FinancialSettingsCard({
  commissionRate = 5,
  minPayoutThreshold = 500,
  onChange
}) {
  const commissionPresets = [
    { label: '0% (Zero Fee)', value: 0 },
    { label: '2% (Promotional)', value: 2 },
    { label: '5% (Standard)', value: 5 },
    { label: '8% (Enterprise)', value: 8 },
    { label: '10% (Premium)', value: 10 }
  ];

  const payoutPresets = [
    { label: '₹100 (Low)', value: 100 },
    { label: '₹250 (Mid)', value: 250 },
    { label: '₹500 (Meesho Standard)', value: 500 },
    { label: '₹1,000 (Weekly)', value: 1000 },
    { label: '₹2,000 (High Volume)', value: 2000 }
  ];

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:border-pink-200 transition-all">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-50 text-[#b7004d] rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Marketplace Economics & Payout Thresholds
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Default commission deducted from supplier gross volumes and minimum payout limit for reseller wallets.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 1. Default Platform Commission Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>Default Platform Commission Rate (%)</span>
              <span className="text-pink-600">*</span>
            </label>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              Current: <strong className="text-gray-900 font-bold">{commissionRate}%</strong>
            </span>
          </div>

          <div className="relative max-w-sm">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={commissionRate}
              onChange={(e) => onChange('commissionRate', Number(e.target.value))}
              className="pr-10 text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#b7004d]/30"
              placeholder="e.g. 5.0"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              %
            </span>
          </div>

          {/* Quick Commission Preset Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Quick Presets:</span>
            {commissionPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange('commissionRate', preset.value)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  commissionRate === preset.value
                    ? 'bg-[#b7004d] text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>
              This commission applies automatically to supplier earnings during settlement escrow calculations and monthly revenue analytics.
            </span>
          </p>
        </div>

        <hr className="border-gray-100" />

        {/* 2. Minimum Wallet Payout Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Minimum Wallet Withdrawal Threshold (₹)</span>
              <span className="text-pink-600">*</span>
            </label>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Min: <strong className="text-emerald-900 font-bold">₹{minPayoutThreshold}</strong>
            </span>
          </div>

          <div className="relative max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              ₹
            </span>
            <Input
              type="number"
              min="0"
              step="50"
              value={minPayoutThreshold}
              onChange={(e) => onChange('minPayoutThreshold', Number(e.target.value))}
              className="pl-8 text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#b7004d]/30"
              placeholder="e.g. 500"
            />
          </div>

          {/* Quick Payout Preset Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Recommended:</span>
            {payoutPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange('minPayoutThreshold', preset.value)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  minPayoutThreshold === preset.value
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Resellers and affiliates must accumulate at least this balance before submitting an atomic bank payout request.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
