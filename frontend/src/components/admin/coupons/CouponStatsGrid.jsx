import React from 'react';
import { Ticket, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';

export default function CouponStatsGrid({ stats }) {
  const cards = [
    {
      title: 'Total Coupons',
      value: stats?.totalCoupons ?? 0,
      sub: 'Promo campaigns registered',
      icon: Ticket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Active & Valid',
      value: stats?.activeCoupons ?? 0,
      sub: 'Currently redeemable codes',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Total Redemptions',
      value: (stats?.totalRedemptions ?? 0).toLocaleString('en-IN'),
      sub: 'Customer uses at checkout',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Est. Customer Savings',
      value: `₹${(stats?.totalDiscountGiven ?? 0).toLocaleString('en-IN')}`,
      sub: 'Gross promotional value given',
      icon: Sparkles,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
