import React, { useState } from 'react';
import {
  Ticket,
  Copy,
  Check,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CouponsTable({
  coupons = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  statusFilter = 'ALL',
  searchTerm = '',
}) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const now = new Date();

  // Filter coupons by search term and status tab
  const filteredCoupons = coupons.filter((coupon) => {
    // 1. Search filter
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      coupon.code?.toLowerCase().includes(q) ||
      coupon.title?.toLowerCase().includes(q) ||
      coupon.description?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // 2. Status tab filter
    const isExpired = new Date(coupon.expiresAt) <= now;
    const isDisabled = coupon.isActive === false;

    if (statusFilter === 'ACTIVE') {
      return !isExpired && !isDisabled;
    }
    if (statusFilter === 'EXPIRED') {
      return isExpired;
    }
    if (statusFilter === 'DISABLED') {
      return isDisabled;
    }

    return true; // ALL
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExpiryBadge = (expiresAt) => {
    const exp = new Date(expiresAt);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Expired
        </span>
      );
    }
    if (diffDays <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Expires in {diffDays}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Expires in {diffDays}d
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
              <div className="space-y-2">
                <div className="w-28 h-4 bg-gray-100 rounded" />
                <div className="w-40 h-3 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="w-20 h-6 bg-gray-100 rounded-full" />
            <div className="w-24 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-8 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredCoupons.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
          <Ticket size={28} />
        </div>
        <h3 className="text-base font-bold text-gray-900">No Coupons Found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          {searchTerm || statusFilter !== 'ALL'
            ? 'No coupons match your active filters or search query.'
            : 'No promo codes created yet. Click "Create Coupon" above to launch a promotion.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Coupon Code & Campaign</th>
              <th className="py-3.5 px-4">Discount</th>
              <th className="py-3.5 px-4">Min Order / Cap</th>
              <th className="py-3.5 px-4">Redemptions</th>
              <th className="py-3.5 px-4">Validity</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredCoupons.map((coupon) => {
              const isPercent = coupon.type === 'PERCENT';
              const isExpired = new Date(coupon.expiresAt) <= now;
              const isActive = coupon.isActive !== false && !isExpired;
              const used = coupon.usedCount || 0;
              const limit = coupon.usageLimit || 500;
              const usagePct = Math.min(100, Math.round((used / limit) * 100));

              return (
                <tr
                  key={coupon.id}
                  className="hover:bg-purple-50/30 transition-colors group"
                >
                  {/* Coupon Code & Campaign */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 tracking-wide text-sm bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            title="Copy code"
                            className="text-gray-400 hover:text-purple-600 transition-colors p-1"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-1">
                          {coupon.title}
                        </p>
                        {coupon.description && (
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPercent
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {isPercent ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                    </span>
                  </td>

                  {/* Min Order & Max Discount */}
                  <td className="py-3.5 px-4 text-xs text-gray-600">
                    <div className="font-semibold text-gray-800">
                      Min: ₹{coupon.minOrder || 0}
                    </div>
                    {isPercent && coupon.maxDiscount && (
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Cap: ₹{coupon.maxDiscount}
                      </div>
                    )}
                  </td>

                  {/* Redemptions */}
                  <td className="py-3.5 px-4">
                    <div className="w-28">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span className="font-bold text-gray-800">{used}</span>
                        <span className="text-[11px] text-gray-400">/ {limit}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Validity */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {getExpiryBadge(coupon.expiresAt)}
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(coupon.expiresAt)}
                      </div>
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleStatus(coupon)}
                      title={coupon.isActive === false ? 'Enable Coupon' : 'Disable Coupon'}
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      {coupon.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                          <ToggleRight size={22} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600">
                          <ToggleLeft size={22} />
                          Disabled
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(coupon)}
                        title="Edit Coupon"
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(coupon)}
                        title="Delete Coupon"
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count summary */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filteredCoupons.length} coupons</span>
        <span className="text-[11px] text-gray-400">
          All active coupons are verified and applicable at checkout in real-time.
        </span>
      </div>
    </div>
  );
}
