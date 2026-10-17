import React from 'react';
import DataTable from '../../common/DataTable';
import ProductStockBadge from './ProductStockBadge';
import { Button } from '../../ui/button';
import { Package, Eye, Star, Truck } from 'lucide-react';

export default function ProductsTable({
  products = [],
  loading = false,
  onInspectProduct,
  formatCurrency
}) {
  const columns = [
    {
      header: 'Product Details',
      render: (product) => {
        const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
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
          ? (formatCurrency ? formatCurrency(product.originalPrice) : `₹${product.originalPrice}`)
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
      header: 'Performance',
      render: (product) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating || '4.0'}</span>
            <span className="text-gray-400 font-normal text-[11px]">
              ({product._count?.reviews || 0})
            </span>
          </div>
          <span className="text-[11px] text-gray-500 block mt-0.5">
            {product._count?.orderItems || 0} orders
          </span>
        </div>
      )
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (product) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onInspectProduct?.(product)}
          className="text-xs h-8 border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-[#b7004d]" />
          Inspect
        </Button>
      )
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
