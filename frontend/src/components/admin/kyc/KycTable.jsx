import React from 'react';
import DataTable from '../../common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Eye, ShieldCheck } from 'lucide-react';
import KycStatusBadge from './KycStatusBadge';

export default function KycTable({
  applications = [],
  loading,
  onOpenReview,
  formatDate
}) {
  const columns = [
    {
      header: 'Applicant',
      render: (app) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-pink-100 text-[#b7004d] text-xs font-bold shrink-0">
            {app.user?.avatarUrl ? (
              <AvatarImage src={app.user.avatarUrl} alt={app.user.fullName} />
            ) : (
              <AvatarFallback>{(app.user?.fullName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-bold text-gray-900 text-xs">{app.user?.fullName || 'Applicant'}</p>
            <p className="text-[11px] text-gray-400">{app.user?.email || 'No email'}</p>
            {app.user?.phone && (
              <p className="text-[10px] text-gray-400">{app.user?.phone}</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (app) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
          app.type?.toLowerCase() === 'dropshipper' 
            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
        }`}>
          {app.type}
        </span>
      )
    },
    {
      header: 'Business / Handle',
      render: (app) => (
        <span className="text-xs font-medium text-gray-800">
          {app.documents?.businessName || app.documents?.handle || '—'}
        </span>
      )
    },
    {
      header: 'Submitted',
      render: (app) => (
        <span className="text-xs text-gray-500">
          {formatDate ? formatDate(app.createdAt) : ''}
        </span>
      )
    },
    {
      header: 'Status',
      render: (app) => <KycStatusBadge status={app.status} />
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (app) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenReview(app)}
          className="text-xs h-8 border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-[#b7004d]" />
          Review Docs
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      loading={loading}
      loadingMessage="Loading KYC verification requests..."
      emptyTitle="No KYC applications found"
      emptyMessage="There are no verification requests matching your selected filters."
      emptyIcon={ShieldCheck}
    />
  );
}
