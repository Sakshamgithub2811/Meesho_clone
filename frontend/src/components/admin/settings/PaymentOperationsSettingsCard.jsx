import React from 'react';
import { Banknote, AlertTriangle, ShieldCheck, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

export default function PaymentOperationsSettingsCard({
  codEnabled = true,
  maintenanceMode = false,
  onChange
}) {
  return (
    <Card className="border border-gray-200/90 shadow-xs hover:border-emerald-200 transition-all">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Payment Gateway & Platform Operations
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Master switches for Cash on Delivery (COD) and platform-wide maintenance mode.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 1. Cash on Delivery (COD) Master Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200/80 bg-gray-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                Cash on Delivery (COD) Global Switch
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  codEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {codEnabled ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Across All Pincodes
                  </>
                ) : (
                  <>
                    <Power className="w-3 h-3 text-rose-600" />
                    Disabled Nationwide
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
              When enabled, customers can select Cash on Delivery at checkout. When turned off, checkout immediately restricts payment to online methods only (UPI, NetBanking, Cards).
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange('codEnabled', !codEnabled)}
            className={`w-14 h-7 rounded-full transition-colors cursor-pointer relative p-1 shrink-0 ${
              codEnabled ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                codEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Platform Maintenance Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Scheduled Maintenance Mode
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                  maintenanceMode
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {maintenanceMode ? 'Maintenance Live' : 'Normal Operations'}
              </span>
            </div>
            <p className="text-xs text-gray-600 max-w-lg leading-relaxed">
              Enable this when running database migrations or deploying critical backend updates. Non-admin visitors will be presented with a polite maintenance banner.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange('maintenanceMode', !maintenanceMode)}
            className={`w-14 h-7 rounded-full transition-colors cursor-pointer relative p-1 shrink-0 ${
              maintenanceMode ? 'bg-amber-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                maintenanceMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

