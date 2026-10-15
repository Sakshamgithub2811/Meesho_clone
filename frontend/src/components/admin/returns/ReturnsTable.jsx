import React from 'react';
import DataTable from '../../common/DataTable';
import ReturnStatusBadge from './ReturnStatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Eye, RotateCcw, Calendar, ImageIcon } from 'lucide-react';

export default function ReturnsTable({
  returns = [],
  loading = false,
  onOpenReview,
  formatDate,
  formatCurrency
}) {
  const columns = [
    {
      header: 'Claim ID & Date',
      render: (ret) => {
        const dateStr = formatDate
          ? formatDate(ret.createdAt)
          : new Date(ret.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        return (
          <div>
            <span
              onClick={() => onOpenReview(ret)}
              className="font-mono text-xs font-bold text-[#b7004d] hover:underline cursor-pointer block"
            >
              #{ret.id.slice(0, 8)}...
            </span>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{dateStr}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Customer & Order',
      render: (ret) => {
        const user = ret.order?.user || {};
        const customerName = user.fullName || 'Customer';
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 bg-pink-100 text-[#b7004d] text-xs font-bold shrink-0">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={customerName} />
              ) : (
                <AvatarFallback>{customerName.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-bold text-gray-900 text-xs">{customerName}</p>
              <p className="text-[11px] text-gray-400 font-mono">
                Order: #{ret.orderId?.slice(0, 8)}...
              </p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Reason & Proof',
      render: (ret) => {
        const proofCount = ret.images?.length || 0;
        return (
          <div className="max-w-[220px]">
            <p className="text-xs font-medium text-gray-800 line-clamp-1">
              {ret.reason || 'No reason provided'}
            </p>
            {proofCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-pink-700 bg-pink-50 px-1.5 py-0.2 rounded font-medium mt-0.5">
                <ImageIcon className="w-3 h-3" />
                {proofCount} {proofCount === 1 ? 'photo' : 'photos'} attached
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">No photos</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Refund Value',
      render: (ret) => {
        const amount = ret.order?.totalAmount || 0;
        return (
          <span className="font-bold text-gray-900 text-xs">
            {formatCurrency ? formatCurrency(amount) : `₹${amount}`}
          </span>
        );
      }
    },
    {
      header: 'Status',
      render: (ret) => <ReturnStatusBadge status={ret.status} />
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (ret) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenReview(ret)}
          className="text-xs h-8 border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-[#b7004d]" />
          Review Claim
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={returns}
      loading={loading}
      loadingMessage="Loading return claims..."
      emptyTitle="No return requests"
      emptyMessage="There are currently no customer return or refund requests matching your criteria."
      emptyIcon={RotateCcw}
    />
  );
}
