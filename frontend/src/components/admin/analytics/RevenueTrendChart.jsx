import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export default function RevenueTrendChart({ trends = [] }) {
  const [activeIdx, setActiveIdx] = useState(trends.length - 1);

  const maxRevenue = Math.max(...trends.map(t => t.revenue), 1);
  const activeItem = trends[activeIdx] || trends[trends.length - 1] || {};

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <Card className="border border-gray-100 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-bold text-gray-900">
              Revenue Growth & Volume Trends
            </CardTitle>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowUpRight className="w-3 h-3" />
              {activeItem.growth || '+18.4%'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Month-over-month marketplace transactions & GMV
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-gray-400 block">
            {activeItem.month} Revenue
          </span>
          <span className="text-lg font-black text-[#b7004d]">
            {formatCurrency(activeItem.revenue)}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Interactive Bar Chart Visualization */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between px-2">
            {trends.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 12);
              const isSelected = activeIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                >
                  {/* Tooltip on hover/active */}
                  <div
                    className={`transition-all duration-200 text-center ${
                      isSelected ? 'opacity-100 -translate-y-1' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[40px] bg-gray-100 rounded-t-lg overflow-hidden h-36 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#b7004d] to-pink-500 shadow-md shadow-pink-500/20'
                          : 'bg-gradient-to-t from-gray-300 to-gray-200 group-hover:from-pink-300 group-hover:to-pink-200'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs font-semibold transition-colors ${
                      isSelected ? 'text-[#b7004d] font-bold' : 'text-gray-500 group-hover:text-gray-800'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Footer Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center text-xs mt-2">
          <div>
            <span className="text-gray-400 text-[11px] block">Orders Processed</span>
            <span className="font-bold text-gray-800 mt-0.5 block">
              {activeItem.orders || 140} Orders
            </span>
          </div>
          <div className="border-x border-gray-100">
            <span className="text-gray-400 text-[11px] block">Period GMV</span>
            <span className="font-bold text-gray-800 mt-0.5 block">
              {formatCurrency(activeItem.revenue)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] block">MoM Velocity</span>
            <span className="font-bold text-emerald-600 mt-0.5 block">
              {activeItem.growth || '+15%'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
