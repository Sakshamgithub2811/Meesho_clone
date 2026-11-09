import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Clock, ExternalLink } from 'lucide-react';

const pad = (n) => String(n || 0).padStart(2, '0');

export default function FlashSaleCountdownBanner({
  status = 'ACTIVE',
  title = '',
  subtitle = '',
  timeLeft = { hours: 0, minutes: 0, seconds: 0, isExpired: false },
  onQuickExtend,
  extending = false
}) {
  return (
    <Card className="border border-pink-100 shadow-xs bg-linear-to-r from-pink-500 via-rose-500 to-amber-500 text-white overflow-hidden relative">
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <CardContent className="p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'ACTIVE' && !timeLeft.isExpired
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-amber-300'
                }`}
              />
              {status === 'ACTIVE' && !timeLeft.isExpired
                ? 'LIVE ON STOREFRONT'
                : status === 'PAUSED'
                ? 'CAMPAIGN PAUSED'
                : 'TIMER EXPIRED'}
            </span>
            <a
              href="/flash"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white font-medium underline underline-offset-2 ml-2"
            >
              <span>View Storefront (/flash)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <h2 className="text-2xl font-black tracking-tight drop-shadow-xs">
            {title || 'Flash Sale'}
          </h2>
          <p className="text-xs text-white/90 font-medium max-w-md">
            {subtitle || 'Limited-time discount campaign'}
          </p>
        </div>

        {/* Countdown Clock Display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Time Remaining
            </p>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-black text-2xl tracking-wider text-white">
              <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                {pad(timeLeft.hours)}
              </span>
              <span>:</span>
              <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                {pad(timeLeft.minutes)}
              </span>
              <span>:</span>
              <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-amber-300">
                {pad(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Quick Timer Extenders */}
          <div className="flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">
              Quick Extend
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={extending}
                onClick={() => onQuickExtend(2)}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
              >
                +2h
              </button>
              <button
                type="button"
                disabled={extending}
                onClick={() => onQuickExtend(6)}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
              >
                +6h
              </button>
              <button
                type="button"
                disabled={extending}
                onClick={() => onQuickExtend(24)}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
              >
                +24h
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

