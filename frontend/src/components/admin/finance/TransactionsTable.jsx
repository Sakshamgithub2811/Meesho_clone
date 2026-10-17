import React from 'react';
import DataTable from '../../common/DataTable';
import TransactionTypeBadge from './TransactionTypeBadge';
import RoleBadge from '../../common/RoleBadge';
import { Calendar, ReceiptText } from 'lucide-react';

export default function TransactionsTable({
  transactions = [],
  loading = false,
  formatCurrency,
  formatDate
}) {
  const columns = [
    {
      header: 'Transaction ID & Date',
      render: (tx) => {
        const dateStr = formatDate
          ? formatDate(tx.createdAt)
          : new Date(tx.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

        return (
          <div>
            <span className="font-mono text-xs font-bold text-gray-800 block">
              #{tx.id.slice(0, 8)}...
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
      header: 'Beneficiary Account',
      render: (tx) => {
        const u = tx.wallet?.user || {};
        return (
          <div>
            <span className="font-bold text-xs text-gray-900 block">
              {u.storeName || u.fullName || 'Partner Account'}
            </span>
            <div className="mt-0.5">
              <RoleBadge role={u.role} />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Narration / Description',
      render: (tx) => (
        <p className="text-xs text-gray-700 max-w-xs line-clamp-1">
          {tx.description || 'Wallet transaction adjustment'}
        </p>
      )
    },
    {
      header: 'Type',
      render: (tx) => <TransactionTypeBadge type={tx.type} />
    },
    {
      header: 'Amount',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (tx) => {
        const isCredit = (tx.type || '').toLowerCase() === 'credit';
        return (
          <span
            className={`font-black text-xs ${
              isCredit ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
          </span>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={loading}
      skeletonRows={5}
      emptyTitle="No transactions found"
      emptyMessage="No wallet transaction activity matches your selected criteria."
      emptyIcon={ReceiptText}
    />
  );
}
