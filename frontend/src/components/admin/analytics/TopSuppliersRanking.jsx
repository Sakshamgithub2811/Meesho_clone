import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Store, Star, Award, Crown, Package } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import SellerStatusBadge from '../sellers/SellerStatusBadge';

export default function TopSuppliersRanking({ suppliers = [] }) {
  return (
    <Card className="border border-gray-100 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <CardTitle className="text-sm font-bold text-gray-900">
            Top Performing Suppliers
          </CardTitle>
        </div>
        <p className="text-xs text-gray-500">
          Leading manufacturers by satisfaction rating and catalog listings
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {suppliers.map((s, idx) => (
          <div
            key={s.id || idx}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-5 text-center text-xs font-bold text-gray-400">
                #{idx + 1}
              </span>
              <Avatar className="h-8 w-8 rounded-lg bg-pink-50 text-[#b7004d] text-xs font-bold shrink-0">
                {s.avatarUrl ? (
                  <AvatarImage src={s.avatarUrl} alt={s.storeName} className="object-cover" />
                ) : (
                  <AvatarFallback>{(s.storeName || s.fullName || 'S').charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 line-clamp-1">
                  {s.storeName || s.fullName || 'Official Merchant'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {s.rating || 5.0}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    • {s.productCount || 1} products
                  </span>
                </div>
              </div>
            </div>

            <SellerStatusBadge tier={s.tier} showLabel={false} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
