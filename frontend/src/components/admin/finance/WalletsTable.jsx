import React from 'react';
import DataTable from '../../common/DataTable';
import RoleBadge from '../../common/RoleBadge';
import { Button } from '../../ui/button';
import { Wallet, Settings, Building2, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

export default function WalletsTable({
  wallets = [],
  loading = false,
  onOpenAdjust,
  formatCurrency
}) {
  const columns = [
    {
      header: 'Partner & Account',
      render: (wallet) => {
        const u = wallet.user || {};
        const displayName = u.storeName || u.fullName || 'Partner';
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-lg border border-gray-200 bg-pink-50 text-[#b7004d] text-xs font-bold shrink-0">
              {u.avatarUrl ? (
                <AvatarImage src={u.avatarUrl} alt={displayName} className="object-cover" />
              ) : (
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 max-w-[200px]">
              <span className="font-bold text-xs text-gray-900 line-clamp-1 block">
                {displayName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <RoleBadge role={u.role} />
                {u.storeName && u.fullName && (
                  <span className="text-[10px] text-gray-400 truncate">({u.fullName})</span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Settlement & Bank Details',
      render: (wallet) => {
        const bank = wallet.user?.bankDetails || {};
        return (
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{bank.bankName || 'Verified Payout Account'}</span>
            </div>
            <p className="text-[11px] font-mono text-gray-400 mt-0.5">
              {bank.accountNumber || '•••• •••• 4912'} ({bank.ifsc || 'UPI Direct'})
            </p>
          </div>
        );
      }
    },
    {
      header: 'Available Balance',
      render: (wallet) => (
        <div>
          <span className="font-black text-sm text-emerald-700 block">
            {formatCurrency(wallet.balance)}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            Disbursable
          </span>
        </div>
      )
    },
    {
      header: 'Pending Settlement',
      render: (wallet) => (
        <div>
          <span className="font-bold text-xs text-amber-700 block">
            {formatCurrency(wallet.pending)}
          </span>
          <span className="text-[10px] text-gray-400">
            {wallet.pending > 0 ? 'Payout In Process' : 'No Pending Payout'}
          </span>
        </div>
      )
    },
    {
      header: 'Ledger Audit',
      render: (wallet) => (
        <span className="text-xs font-medium text-gray-600">
          {wallet._count?.transactions || 0} Transactions
        </span>
      )
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (wallet) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenAdjust?.(wallet)}
          className="text-xs h-8 border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 mr-1 text-[#b7004d]" />
          Adjust
        </Button>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={wallets}
      loading={loading}
      skeletonRows={5}
      emptyTitle="No wallets found"
      emptyMessage="No partner escrow accounts match your selected filter."
      emptyIcon={Wallet}
    />
  );
}
