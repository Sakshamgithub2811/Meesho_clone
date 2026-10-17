import React from 'react';
import { Card } from '../ui/card';
import { RefreshCw, FileText } from 'lucide-react';

/**
 * Universal Reusable DataTable Component
 * Handles responsive horizontal scroll, standardized header row,
 * animated loading state, customizable empty state, and column/row rendering.
 */
export default function DataTable({
  columns = [],
  data = [],
  keyExtractor = (item, idx) => item.id || idx,
  loading = false,
  skeletonRows = 5,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items matching your criteria.',
  emptyIcon: EmptyIcon = FileText,
  renderRow,
  hasCardWrapper = true,
  className = '',
  tableClassName = ''
}) {
  const tableContent = (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm border-collapse ${tableClassName}`}>
        <thead className="bg-gray-50/75 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.header || idx}
                className={col.headerClassName || 'py-3.5 px-4 font-semibold'}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <tr key={`skel-row-${rIdx}`} className="animate-pulse">
                {columns.map((col, cIdx) => (
                  <td key={`skel-col-${cIdx}`} className={col.cellClassName || 'py-3.5 px-4'}>
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-gray-200 rounded w-24"></div>
                          <div className="h-2.5 bg-gray-100 rounded w-32"></div>
                        </div>
                      </div>
                    ) : cIdx === columns.length - 1 ? (
                      <div className="flex justify-end">
                        <div className="h-7 bg-gray-200 rounded-lg w-16"></div>
                      </div>
                    ) : (
                      <div className="h-3.5 bg-gray-200 rounded w-20"></div>
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className="py-14 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  {EmptyIcon && (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1 text-gray-400">
                      <EmptyIcon className="w-6 h-6" />
                    </div>
                  )}
                  <p className="text-sm font-bold text-gray-700">{emptyTitle}</p>
                  {emptyMessage && <p className="text-xs text-gray-400">{emptyMessage}</p>}
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) =>
              renderRow ? (
                renderRow(item, index)
              ) : (
                <tr key={keyExtractor(item, index)} className="hover:bg-gray-50/60 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={col.cellClassName || 'py-3.5 px-4'}
                    >
                      {col.render ? col.render(item, index) : item[col.accessor]}
                    </td>
                  ))}
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );

  if (!hasCardWrapper) {
    return <div className={className}>{tableContent}</div>;
  }

  return (
    <Card className={`border border-gray-100 shadow-xs overflow-hidden ${className}`}>
      {tableContent}
    </Card>
  );
}
