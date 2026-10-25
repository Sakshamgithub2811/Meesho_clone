import React from 'react';
import DataTable from '../../common/DataTable';
import SellerStatusBadge from './SellerStatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Store, Eye, Star, Package, Phone, Mail } from 'lucide-react';

export default function SellersTable({
  sellers = [],
  loading = false,
  onOpenSeller
}) {
  const columns = [
    {
      header: 'Store & Proprietor',
      render: (seller) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-lg border border-gray-200 bg-pink-50 text-[#b7004d] text-xs font-bold shrink-0">
            {seller.avatarUrl ? (
              <AvatarImage src={seller.avatarUrl} alt={seller.storeName} className="object-cover" />
            ) : (
              <AvatarFallback>
                <Store className="w-4 h-4" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 max-w-[200px]">
            <span
              onClick={() => onOpenSeller?.(seller)}
              className="font-bold text-xs text-gray-900 hover:text-[#b7004d] hover:underline cursor-pointer line-clamp-1 block"
            >
              {seller.storeName || 'Official Store'}
            </span>
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
              {seller.fullName || 'Registered Vendor'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Credentials',
      render: (seller) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
            <span>{seller.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate max-w-[150px]">{seller.email || '—'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Partner Tier',
      render: (seller) => (
        <div>
          <SellerStatusBadge tier={seller.tier} />
          {seller.gstin && (
            <span className="text-[10px] text-gray-400 font-mono block mt-1">
              GST: {seller.gstin.slice(0, 10)}...
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Catalog Size',
      render: (seller) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          <span>{seller.productCount || 0} Products</span>
        </div>
      )
    },
    {
      header: 'Performance',
      render: (seller) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{seller.rating ? `${seller.rating} ★` : '5.0 ★'}</span>
          </div>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            {seller.experienceYears || '2+ yrs exp'}
          </span>
        </div>
      )
    },
    {
      header: 'Action',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (seller) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenSeller?.(seller)}
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
      data={sellers}
      loading={loading}
      skeletonRows={5}
      emptyTitle="No sellers found"
      emptyMessage="No registered supplier accounts match your selected filter criteria."
      emptyIcon={Store}
    />
  );
}
