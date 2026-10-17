import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, RefreshCw } from 'lucide-react';

/**
 * Reusable FilterBar Component
 * Unifies Search, Dynamic Category/Role Tabs, Dropdown Select Filters,
 * Item Counter, and Refresh action in a consistent responsive card.
 */
export default function FilterBar({
  // Search
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  showSearch = true,

  // Tabs / Pills
  tabs = [], // [{ id: 'all', label: 'All' }, ...] or ['ALL', 'ACTIVE', ...]
  activeTab,
  onTabChange,

  // Dropdown Selects
  dropdowns = [], // [{ value, onChange, options: [{ value, label }] }]

  // Counter & Refresh
  totalCount,
  countLabel = 'Items',
  onRefresh,
  refreshing = false,

  className = ''
}) {
  return (
    <Card className={`border border-gray-100 shadow-xs ${className}`}>
      <CardContent className="p-4 space-y-3">
        
        {/* Row 1: Search Bar + Dropdowns + Counter + Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSearchSubmit?.(e);
                  }
                }}
                className="pl-9 h-9 text-xs rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#b7004d]/30 focus:bg-white"
              />
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            {dropdowns.map((d, idx) => (
              <select
                key={idx}
                value={d.value}
                onChange={(e) => d.onChange?.(e.target.value)}
                className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#b7004d] cursor-pointer"
              >
                {d.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ))}

            {totalCount !== undefined && totalCount !== null && (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Total: <strong className="text-gray-900">{totalCount}</strong> {countLabel}
              </span>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="h-9 rounded-lg px-3 flex items-center gap-1.5 text-xs cursor-pointer hover:bg-pink-50 hover:text-[#b7004d] border-gray-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#b7004d]' : ''}`} />
                <span>Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Filter Tabs (Pills) */}
        {tabs.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100/80 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => {
              const tabId = typeof tab === 'string' ? tab : tab.id;
              const tabLabel = typeof tab === 'string' ? tab : tab.label;
              const isSelected = activeTab === tabId;

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => onTabChange?.(tabId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#b7004d] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
