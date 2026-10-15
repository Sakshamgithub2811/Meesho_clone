import React from 'react';
import DataTable from '../../common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import RoleBadge from '../../common/RoleBadge';
import UserActionsMenu from './UserActionsMenu';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export default function UserTable({
  users = [],
  loading,
  currentAdminId,
  actionLoadingId,
  onRoleChange,
  onDeleteUser
}) {
  const columns = [
    {
      header: 'User',
      render: (u) => {
        const isCurrentAdmin = u.id === currentAdminId;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-pink-100 text-[#b7004d] font-bold">
              {u.avatarUrl ? (
                <AvatarImage src={u.avatarUrl} alt={u.fullName} className="object-cover" />
              ) : (
                <AvatarFallback>{(u.fullName || u.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <span>{u.fullName || 'Anonymous User'}</span>
                {isCurrentAdmin && (
                  <span className="text-[10px] font-bold bg-pink-100 text-[#b7004d] px-1.5 py-0.2 rounded-full">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">UID: {u.id.slice(0, 8)}...</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Contact',
      render: (u) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <span>{u.email || 'No email registered'}</span>
          </div>
          {u.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{u.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Role',
      render: (u) => <RoleBadge role={u.role} />
    },
    {
      header: 'Joined Date',
      render: (u) => {
        const joinFormatted = u.createdAt 
          ? new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'N/A';
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>{joinFormatted}</span>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      headerClassName: 'py-4 px-6 text-right',
      cellClassName: 'py-4 px-6 text-right',
      render: (u) => (
        <UserActionsMenu
          user={u}
          currentAdminId={currentAdminId}
          actionLoadingId={actionLoadingId}
          onRoleChange={onRoleChange}
          onDeleteUser={onDeleteUser}
        />
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      loadingMessage="Loading user data..."
      emptyTitle="No users found"
      emptyMessage="Try adjusting your search query or role filter."
      emptyIcon={Users}
    />
  );
}
