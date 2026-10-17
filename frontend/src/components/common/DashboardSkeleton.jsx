import React from 'react';

/**
 * Reusable Loading Skeleton
 * Supports configurable card counts and widgets for any dashboard or hub across the app.
 */
export default function DashboardSkeleton({
  cardsCount = 4,
  showWidgets = true,
  className = ''
}) {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      {/* Top Header Placeholder */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
        <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
      </div>

      {/* Dynamic Metric Cards Grid */}
      {cardsCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: cardsCount }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      )}

      {/* Bottom Widgets Grid */}
      {showWidgets && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-gray-200 rounded-xl"></div>
          <div className="h-72 bg-gray-200 rounded-xl"></div>
        </div>
      )}
    </div>
  );
}
