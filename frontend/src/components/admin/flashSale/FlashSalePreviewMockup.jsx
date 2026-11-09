import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

const pad = (n) => String(n || 0).padStart(2, '0');

export default function FlashSalePreviewMockup({
  title = '',
  subtitle = '',
  bannerBadge = '',
  dealBadge = '',
  resellerBonusNote = '',
  minDiscount = 40,
  timeLeft = { hours: 0, minutes: 0, seconds: 0 },
  sampleProduct = null
}) {
  return (
    <Card className="border border-gray-100 shadow-xs sticky top-24">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            Live Storefront Preview
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Mobile / App View
          </span>
        </div>

        {/* Mockup phone frame */}
        <div className="rounded-2xl border-4 border-gray-800 bg-slate-900 text-white p-4 shadow-xl space-y-3">
          {/* Badge header */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500 text-white">
              {bannerBadge || 'Live Drops'}
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] text-amber-300 font-bold">
              <span>{pad(timeLeft.hours)}h</span>:
              <span>{pad(timeLeft.minutes)}m</span>:
              <span>{pad(timeLeft.seconds)}s</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h4 className="font-extrabold text-sm text-white tracking-tight">
              {title || 'Flash Sale'}
            </h4>
            <p className="text-[11px] text-gray-300">
              {subtitle || 'Limited discounts'}
            </p>
          </div>

          {/* Deal badge callout */}
          <div className="bg-white/10 rounded-lg p-2 border border-white/10 text-[10px] text-amber-200 font-medium flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{dealBadge || 'Special limited drop'}</span>
          </div>

          {/* Reseller margin callout */}
          {resellerBonusNote && (
            <div className="bg-emerald-950/70 border border-emerald-500/30 rounded-lg p-2 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{resellerBonusNote}</span>
            </div>
          )}

          {/* Sample product pill */}
          <div className="bg-white rounded-xl p-2.5 text-gray-900 flex items-center gap-2.5 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              <img
                src={sampleProduct?.images?.[0] || 'https://placehold.co/60x60?text=Deal'}
                alt="Sample"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-gray-900 truncate">
                {sampleProduct?.title || 'Featured Lightning Item'}
              </p>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="font-black text-pink-600">
                  ₹{sampleProduct?.price || 299}
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                  {minDiscount}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center pt-1">
          Any changes saved here reflect instantly on the customer's{' '}
          <code className="text-pink-600 font-medium">/flash</code> landing page.
        </div>
      </CardContent>
    </Card>
  );
}

