import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ChevronRight } from 'lucide-react';

const COLOR_MAP = {
  pink: {
    bgBlob: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    iconText: 'text-[#b7004d]',
    actionText: 'text-[#b7004d]'
  },
  indigo: {
    bgBlob: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    actionText: 'text-indigo-600'
  },
  emerald: {
    bgBlob: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    actionText: 'text-emerald-600'
  },
  amber: {
    bgBlob: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    actionText: 'text-amber-700'
  },
  blue: {
    bgBlob: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    actionText: 'text-blue-600'
  }
};

/**
 * Reusable StatCard Component
 * Renders an analytical metric card with icon, value, badge/subtext and optional action link
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'pink',
  badge,
  subtitle,
  actionLabel,
  onAction
}) {
  const colorStyles = COLOR_MAP[color] || COLOR_MAP.pink;
  const BadgeIcon = badge?.icon;

  return (
    <Card className="border border-gray-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Background ambient decorative blob */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${colorStyles.bgBlob} rounded-full -mr-6 -mt-6 pointer-events-none`} />

      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${colorStyles.iconBg} ${colorStyles.iconText} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="text-2xl font-black text-gray-900">
          {value}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-2 truncate">
            {badge && (
              <span className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
                badge.variant === 'warning' 
                  ? 'bg-amber-50 text-amber-700' 
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                {badge.text}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`${colorStyles.actionText} hover:underline font-semibold flex items-center shrink-0 ml-1 cursor-pointer`}
            >
              {actionLabel} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
