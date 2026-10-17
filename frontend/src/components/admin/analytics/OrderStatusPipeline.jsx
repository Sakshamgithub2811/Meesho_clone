import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { ShoppingCart, CheckCircle2, Truck, Package, XCircle } from 'lucide-react';

export default function OrderStatusPipeline({ statusCounts = {} }) {
  const {
    ORDERED = 0,
    CONFIRMED = 0,
    SHIPPED = 0,
    DELIVERED = 0,
    CANCELLED = 0
  } = statusCounts;

  const total = ORDERED + CONFIRMED + SHIPPED + DELIVERED + CANCELLED || 1;

  const stages = [
    { label: 'Placed', count: ORDERED, color: 'text-amber-600 bg-amber-50 border-amber-200', icon: ShoppingCart },
    { label: 'Confirmed', count: CONFIRMED, color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package },
    { label: 'In Transit', count: SHIPPED, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
    { label: 'Delivered', count: DELIVERED, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    { label: 'Cancelled', count: CANCELLED, color: 'text-rose-600 bg-rose-50 border-rose-200', icon: XCircle }
  ];

  return (
    <Card className="border border-gray-100 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-sm font-bold text-gray-900">
            Fulfillment & Order Pipeline
          </CardTitle>
        </div>
        <p className="text-xs text-gray-500">
          Real-time order progression through the fulfillment lifecycle
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const percentage = Math.round((st.count / total) * 100);

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center space-y-1 ${st.color}`}
              >
                <div className="flex justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-lg font-black block">{st.count}</span>
                <span className="text-[11px] font-semibold block">{st.label}</span>
                <span className="text-[10px] opacity-75 block">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
