import React from 'react';
import DataTable from '../../common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Eye, Calendar, Headphones, Clock, CheckCircle2 } from 'lucide-react';

export default function SupportTicketsTable({
  tickets = [],
  loading = false,
  onOpenReview,
  formatDate
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            Closed
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || 'normal').toLowerCase();
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">🔥 Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">High</span>;
      case 'nthikeormal':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Normal</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600">{priority}</span>;
    }
  };

  const columns = [
    {
      header: 'Ticket ID & Priority',
      render: (t) => (
        <div>
          <span
            onClick={() => onOpenReview(t)}
            className="font-mono text-xs font-bold text-purple-700 hover:underline cursor-pointer block"
          >
            #{t.id.slice(0, 8)}...
          </span>
          <div className="mt-1">
            {getPriorityBadge(t.priority)}
          </div>
        </div>
      )
    },
    {
      header: 'Requester / Partner',
      render: (t) => {
        const user = t.user || {};
        const userName = user.fullName || user.email?.split('@')[0] || 'User';
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 bg-purple-100 text-purple-700 text-xs font-bold shrink-0">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={userName} />
              ) : (
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900 text-xs">{userName}</p>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {user.role || 'USER'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
                {user.email || user.phone || '—'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Subject & Category',
      render: (t) => (
        <div className="max-w-[280px]">
          <p 
            onClick={() => onOpenReview(t)}
            className="font-semibold text-xs text-gray-900 hover:text-purple-700 cursor-pointer truncate"
          >
            {t.subject}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              {t.category || 'General'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Date Created',
      render: (t) => {
        const dateStr = formatDate
          ? formatDate(t.createdAt)
          : new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        return (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{dateStr}</span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      render: (t) => getStatusBadge(t.status)
    },
    {
      header: 'Action',
      align: 'right',
      render: (t) => (
        <Button
          size="sm"
          onClick={() => onOpenReview(t)}
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold px-3 py-1 flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          Review & Resolve
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={tickets}
      loading={loading}
      emptyMessage="No support tickets match the selected filters."
      emptyIcon={Headphones}
    />
  );
}
