import React from 'react';
import SectionCard from '../../common/SectionCard';
import RoleBadge from '../../common/RoleBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Users, Clock } from 'lucide-react';

export default function RecentUsersCard({ users = [], onNavigateTab, formatDate }) {
  return (
    <SectionCard
      title="Newly Registered"
      subtitle="Recent accounts created"
      icon={Users}
      iconColor="text-indigo-600"
      actionLabel="View All"
      onAction={onNavigateTab ? () => onNavigateTab('users') : null}
      contentClassName="p-4"
    >
      <div className="divide-y divide-gray-100">
        {users.length > 0 ? (
          users.map((u) => (
            <div key={u.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 bg-pink-100 text-[#b7004d] text-xs font-bold shrink-0">
                  {u.avatarUrl ? (
                    <AvatarImage src={u.avatarUrl} alt={u.fullName} />
                  ) : (
                    <AvatarFallback>{(u.fullName || u.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {u.fullName || 'User'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {u.email}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <RoleBadge role={u.role} />
                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                  <Clock className="w-2.5 h-2.5" /> {formatDate ? formatDate(u.createdAt) : ''}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No users found.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
