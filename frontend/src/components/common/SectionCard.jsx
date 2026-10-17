import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable SectionCard Component
 * Wraps content with standard Admin panel styling, including header, icon,
 * subtitle, and an optional header action button (e.g. View All / Navigate).
 */
export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#b7004d]',
  actionLabel,
  onAction,
  className = '',
  contentClassName = 'p-0',
  children
}) {
  return (
    <Card className={`border border-gray-100 shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
            {title}
          </CardTitle>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actionLabel && onAction && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAction}
            className="text-xs text-[#b7004d] hover:bg-pink-50 font-semibold cursor-pointer"
          >
            {actionLabel} <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}
