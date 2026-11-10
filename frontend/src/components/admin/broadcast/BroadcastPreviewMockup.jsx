import React from 'react';
import { Smartphone, Bell, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

export default function BroadcastPreviewMockup({ form }) {
  const displayTitle = form.title?.trim() || 'Midnight Flash Sale is Live! ⚡';
  const displayBody =
    form.body?.trim() ||
    'Flat 50% discount on all festive sarees and kurtis. Use coupon code FESTIVE50 at checkout!';
  const displayLink = form.link?.trim() || '/flash-sale';

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:border-purple-200 transition-all flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Live Lock-Screen & App Preview
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Real-time rendering of your push banner on Android/iOS lock screens and web notifications.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50/50 to-purple-50/20">
        {/* Mobile Device Frame */}
        <div className="w-full max-w-sm bg-slate-900 rounded-[32px] p-3 shadow-xl border-4 border-slate-800">
          {/* Top Speaker / Notch */}
          <div className="flex items-center justify-center pb-3">
            <div className="w-20 h-3.5 bg-slate-800 rounded-full flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              <div className="w-8 h-1 rounded-full bg-slate-700"></div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-[24px] p-4 min-h-[320px] flex flex-col justify-between text-white">
            {/* Clock & Status */}
            <div className="text-center pt-2">
              <div className="text-3xl font-extrabold tracking-tight">12:30</div>
              <div className="text-[11px] text-slate-400 font-medium">Tuesday, November 10</div>
            </div>

            {/* Simulated Push Notification Card (Glassmorphic) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-lg space-y-2 animate-in fade-in zoom-in-95 duration-200">
              {/* Notification Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#b7004d] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    M
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    MShoppy
                  </span>
                  <span className="text-[10px] text-slate-400">• now</span>
                </div>
                <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {form.audience || 'ALL'}
                </span>
              </div>

              {/* Title & Body */}
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1 leading-tight">
                  {displayTitle}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {displayBody}
                </p>
              </div>

              {/* Action Chip */}
              {displayLink && (
                <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-pink-300 hover:underline">
                  <span>Open {displayLink}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Bottom Swipe Hint */}
            <div className="text-center pb-1">
              <div className="w-24 h-1 bg-white/30 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>

        {/* In-App Bell Notification Card Simulation */}
        <div className="w-full max-w-sm mt-4 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#b7004d]" />
              In-App Notification Tray View
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Unread (New)
            </span>
          </div>
          <div className="text-xs font-bold text-gray-900 line-clamp-1">{displayTitle}</div>
          <div className="text-[11px] text-gray-500 line-clamp-2">{displayBody}</div>
        </div>
      </CardContent>
    </Card>
  );
}

