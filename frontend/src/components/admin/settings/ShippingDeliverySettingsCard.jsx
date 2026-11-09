import React from 'react';
import { Truck, PackageCheck, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';

export default function ShippingDeliverySettingsCard({
  freeShippingThreshold = 499,
  shippingFee = 49,
  onChange
}) {
  const freeThresholdPresets = [
    { label: '₹299', value: 299 },
    { label: '₹499 (Recommended)', value: 499 },
    { label: '₹699', value: 699 },
    { label: '₹999', value: 999 },
    { label: '₹0 (Always Free)', value: 0 }
  ];

  const shippingFeePresets = [
    { label: '₹39', value: 39 },
    { label: '₹49 (Standard)', value: 49 },
    { label: '₹69', value: 69 },
    { label: '₹79', value: 79 }
  ];

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:border-indigo-200 transition-all">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Customer Shipping & Free Delivery Rules
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Control minimum cart value qualifying for 100% free delivery across all customer orders.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 1. Free Shipping Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span>Free Delivery Cart Threshold (₹)</span>
              <span className="text-pink-600">*</span>
            </label>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Free on orders &ge; <strong className="text-indigo-950 font-bold">₹{freeShippingThreshold}</strong>
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
              value={freeShippingThreshold}
              onChange={(e) => onChange('freeShippingThreshold', Number(e.target.value))}
              className="pl-8 text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-indigo-500/30"
              placeholder="e.g. 499"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Presets:</span>
            {freeThresholdPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange('freeShippingThreshold', preset.value)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  freeShippingThreshold === preset.value
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 2. Flat Delivery Fee for orders below threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>Standard Delivery Fee Below Threshold (₹)</span>
              <span className="text-pink-600">*</span>
            </label>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Fee: <strong className="text-amber-900 font-bold">₹{shippingFee}</strong>
            </span>
          </div>

          <div className="relative max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
              ₹
            </span>
            <Input
              type="number"
              min="0"
              step="5"
              value={shippingFee}
              onChange={(e) => onChange('shippingFee', Number(e.target.value))}
              className="pl-8 text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-indigo-500/30"
              placeholder="e.g. 49"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Standard Fees:</span>
            {shippingFeePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange('shippingFee', preset.value)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  shippingFee === preset.value
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
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
              Example: If cart total is ₹350, customer is charged +₹{shippingFee} delivery. If cart is ₹520 (&ge; ₹{freeShippingThreshold}), delivery is completely FREE.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

