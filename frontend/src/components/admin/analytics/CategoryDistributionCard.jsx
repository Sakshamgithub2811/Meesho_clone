import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Layers, ArrowRight } from 'lucide-react';

const COLORS = [
  'bg-pink-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-indigo-500'
];

export default function CategoryDistributionCard({ categories = [] }) {
  return (
    <Card className="border border-gray-100 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <CardTitle className="text-sm font-bold text-gray-900">
            Catalog Category Distribution
          </CardTitle>
        </div>
        <p className="text-xs text-gray-500">
          Share of catalog inventory across primary classifications
        </p>
      </CardHeader>

      <CardContent className="space-y-3.5">
        {categories.map((cat, idx) => {
          const colorClass = COLORS[idx % COLORS.length];

          return (
            <div key={cat.slug || idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[11px]">
                    {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-bold text-gray-900 text-[11px] w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
