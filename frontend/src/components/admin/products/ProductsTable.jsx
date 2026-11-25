import React from 'react';
import DataTable from '../../common/DataTable';
import ProductStockBadge from './ProductStockBadge';
import { Button } from '../../ui/button';
import { Package, Eye, Star, Truck, Check, X, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function ProductsTable({
  products = [],
  loading = false,
  onInspectProduct,
  onApproveProduct,
  onRejectProduct,
  formatCurrency,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll
}) {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  const columns = [
    // 0. Checkbox Column
    {
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded accent-[#b7004d] border-gray-300 cursor-pointer"
            title={isAllSelected ? 'Deselect All' : 'Select All'}
          />
        </div>
      ),
      headerClassName: 'py-3.5 px-3 w-10 text-center',
      cellClassName: 'py-3.5 px-3 w-10 text-center',
      render: (product) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.includes(product.id)}
            onChange={() => onToggleSelect?.(product.id)}
            className="w-4 h-4 rounded accent-[#b7004d] border-gray-300 cursor-pointer"
          />
        </div>
      )
    },
    {
      header: 'Product Details',
      render: (product) => {
        const thumbnail =
          product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              <img
                src={thumbnail}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                }}
              />
            </div>
            <div className="min-w-0 max-w-[220px]">
              <span
                onClick={() => onInspectProduct?.(product)}
                className="font-semibold text-xs text-gray-900 hover:text-[#b7004d] hover:underline cursor-pointer line-clamp-1 block"
                title={product.title}
              >
                {product.title}
              </span>
              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-gray-100 text-gray-600 mt-0.5">
                {product.category?.name || product.categorySlug || 'Catalog'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Pricing & Offer',
      render: (product) => {
        const priceStr = formatCurrency ? formatCurrency(product.price) : `₹${product.price}`;
        const originalPriceStr = product.originalPrice
          ? formatCurrency
            ? formatCurrency(product.originalPrice)
            : `₹${product.originalPrice}`
          : null;

        return (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-gray-900 text-xs">{priceStr}</span>
              {originalPriceStr && (
                <span className="text-[11px] text-gray-400 line-through">{originalPriceStr}</span>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded mt-0.5">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Stock Inventory',
      render: (product) => <ProductStockBadge stock={product.stock} />
    },
    {
      header: 'Moderation Status',
      headerClassName: 'py-3.5 px-4 font-semibold text-center',
      cellClassName: 'py-3.5 px-4 text-center',
      render: (product) => {
        const approval = product.approvalStatus || (product.isActive ? 'APPROVED' : 'PENDING');
        if (approval === 'PENDING') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
              Pending Review
            </span>
          );
        }
        if (approval === 'REJECTED') {
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
              title={product.rejectionReason || 'Rejected by admin'}
            >
              <XCircle className="w-3 h-3 text-rose-500" />
              Rejected
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Live / Approved
          </span>
        );
      }
    },
    {
      header: 'Supplier & Delivery',
      render: (product) => (
        <div>
          <p className="text-xs font-semibold text-gray-800 line-clamp-1">
            {product.supplierName || 'Official Seller'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
            {product.isFreeDelivery ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <Truck className="w-3 h-3" />
                Free Delivery
              </span>
            ) : (
              <span>Standard Delivery</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (product) => {
        const isPending = product.approvalStatus === 'PENDING';
        return (
          <div className="flex items-center justify-end gap-1.5">
            {isPending && (
              <>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => onApproveProduct?.(product.id)}
                  title="Approve & Publish to Customers"
                  className="h-7 px-2 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  <Check className="w-3 h-3 mr-0.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onRejectProduct?.(product.id)}
                  title="Reject Product"
                  className="h-7 px-2 text-[11px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <X className="w-3 h-3 mr-0.5" />
                  Reject
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onInspectProduct?.(product)}
              className="text-xs h-7 px-2.5 border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#b7004d]" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      skeletonRows={5}
      emptyTitle="No products found"
      emptyMessage="No catalog listings match your selected search, category, or stock filters."
      emptyIcon={Package}
    />
  );
}
