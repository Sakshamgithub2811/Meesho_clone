import React, { useState } from 'react';
import DataTable from '../../common/DataTable';
import RoleBadge from '../../common/RoleBadge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  XCircle, 
  Banknote,
  Send,
  AlertCircle
} from 'lucide-react';

export default function WithdrawalsQueueTable({
  withdrawals = [],
  loading = false,
  onOpenApprove,
  onOpenReject,
  formatCurrency,
  formatDate
}) {
  const [copiedId, setCopiedId] = useState('');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const columns = [
    {
      header: 'Request ID & Date',
      render: (item) => {
        const dateStr = formatDate
          ? formatDate(item.createdAt)
          : new Date(item.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-gray-800">
                #{item.id.slice(0, 8)}...
              </span>
              <button
                type="button"
                onClick={() => handleCopy(item.id)}
                title="Copy Full Transaction ID"
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              >
                {copiedId === item.id ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{dateStr}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Partner & Account',
      render: (item) => {
        const u = item.user || {};
        const displayName = u.storeName || u.fullName || 'Partner';
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 rounded-lg border border-gray-200 bg-pink-50 text-[#b7004d] text-xs font-bold shrink-0">
              {u.avatarUrl ? (
                <AvatarImage src={u.avatarUrl} alt={displayName} className="object-cover" />
              ) : (
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 max-w-[190px]">
              <span className="font-bold text-xs text-gray-900 truncate block">
                {displayName}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <RoleBadge role={u.role} />
                {u.phone && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    • {u.phone.slice(-10)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Amount Requested',
      render: (item) => {
        const formatted = formatCurrency
          ? formatCurrency(item.amount)
          : `₹${Number(item.amount || 0).toLocaleString('en-IN')}`;

        return (
          <div>
            <span className="font-extrabold text-sm text-gray-900">
              {formatted}
            </span>
            <span className="block text-[10px] font-semibold text-gray-400 uppercase">
              Escrow Direct
            </span>
          </div>
        );
      }
    },
    {
      header: 'Bank / Settlement Target',
      render: (item) => {
        const bank = item.user?.bankDetails || {};
        return (
          <div className="max-w-[220px]">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">
                {item.destination || bank.bankName || 'Settlement Bank'}
              </span>
            </div>
            {bank.accountNumber && (
              <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                A/C: {bank.accountNumber} {bank.ifsc && `(${bank.ifsc})`}
              </p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Payout Status',
      render: (item) => {
        if (item.status === 'PAID') {
          return (
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Settled / Paid
              </span>
              {item.utrNumber && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 mt-1">
                  <span>UTR: <strong>{item.utrNumber}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.utrNumber)}
                    className="p-0.5 hover:text-gray-700 text-gray-400 cursor-pointer"
                    title="Copy UTR"
                  >
                    {copiedId === item.utrNumber ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        }

        if (item.status === 'REJECTED') {
          return (
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3 h-3 text-red-600" />
                Rejected
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[160px]" title={item.description}>
                Refunded to wallet
              </p>
            </div>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Payout
          </span>
        );
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => {
        if (item.status === 'PENDING') {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                size="sm"
                onClick={() => onOpenApprove(item)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 h-7 rounded-lg shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approve & Pay
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenReject(item)}
                className="text-red-600 hover:bg-red-50 border-red-200 text-[11px] font-bold px-2.5 py-1 h-7 rounded-lg cursor-pointer"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </div>
          );
        }

        return (
          <span className="text-[11px] font-semibold text-gray-400 italic">
            {item.status === 'PAID' ? 'Receipt Generated' : 'Reversed'}
          </span>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={withdrawals}
      loading={loading}
      emptyMessage="No withdrawal requests found matching your filter criteria."
    />
  );
}

