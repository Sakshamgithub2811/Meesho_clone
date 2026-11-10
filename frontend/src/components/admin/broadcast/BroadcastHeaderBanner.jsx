import React from 'react';
import { Megaphone, Users, ShoppingBag, Store, Truck, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';

export default function BroadcastHeaderBanner({
  counts = { ALL: 0, CUSTOMER: 0, SUPPLIER: 0, DROPSHIPPER: 0 },
  loading = false,
  onRefresh
}) {
  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-100/80 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#b7004d] text-white rounded-xl shadow-xs">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">Broadcast & Push Announcement Center</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FCM + In-App Dual Engine
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Dispatch instant marketing announcements, flash sale alerts, and system notices. Messages appear in the user’s in-app notification bell and as lock-screen push alerts.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-xs text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#b7004d]' : ''}`} />
          Refresh Reach Counts
        </Button>
      </div>

      {/* Audience Reach Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-pink-50 text-[#b7004d] rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Total Audience</div>
            <div className="text-sm font-extrabold text-gray-900">{counts.ALL || 0} Users</div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Active Buyers</div>
            <div className="text-sm font-extrabold text-gray-900">{counts.CUSTOMER || 0} Customers</div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Verified Sellers</div>
            <div className="text-sm font-extrabold text-gray-900">{counts.SUPPLIER || 0} Suppliers</div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-200/70 p-3 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Resellers</div>
            <div className="text-sm font-extrabold text-gray-900">{counts.DROPSHIPPER || 0} Resellers</div>
          </div>
        </div>
      </div>
    </div>
  );
}

