import React, { useState } from 'react';
import {
  X,
  Store,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Package,
  Star,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import SellerStatusBadge from './SellerStatusBadge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

export default function SellerDetailModal({
  seller,
  onClose,
  onUpdateTier,
  actionLoading,
  formatCurrency
}) {
  if (!seller) return null;

  const [selectedTier, setSelectedTier] = useState(seller.tier || 'Silver');

  const bank = seller.bankDetails || {};
  const products = seller.recentProducts || [];

  const handleTierSubmit = () => {
    if (selectedTier !== seller.tier) {
      onUpdateTier(seller.id, selectedTier);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* ── 1. MODAL HEADER ────────────────────────────────────────── */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-3.5">
            <Avatar className="w-14 h-14 rounded-xl border border-gray-200 bg-pink-50 text-[#b7004d] text-lg font-bold">
              {seller.avatarUrl ? (
                <AvatarImage src={seller.avatarUrl} alt={seller.storeName} className="object-cover" />
              ) : (
                <AvatarFallback>
                  <Store className="w-6 h-6" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {seller.storeName || 'Official Store'}
                </h3>
                <SellerStatusBadge tier={seller.tier} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Proprietor: <strong className="text-gray-800">{seller.fullName || 'Registered Merchant'}</strong>
                {seller.createdAt && (
                  <span> • Joined {new Date(seller.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. METRICS & KPI STRIP ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Active Products
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-gray-900 text-sm">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>{seller.totalProducts ?? seller.productCount ?? 0} Listings</span>
            </div>
          </div>

          <div className="text-center sm:text-left border-l sm:border-l-gray-200 sm:pl-3">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Vendor Rating
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-amber-600 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{seller.rating ? `${seller.rating} ★` : '5.0 ★'}</span>
            </div>
          </div>

          <div className="text-center sm:text-left sm:border-l sm:border-l-gray-200 sm:pl-3">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Followers
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-blue-600 text-sm">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{seller.followers || '1.5k'}</span>
            </div>
          </div>

          <div className="text-center sm:text-left border-l sm:border-l-gray-200 sm:pl-3">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Industry Experience
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-purple-600 text-sm">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>{seller.experienceYears || '2+ yrs'}</span>
            </div>
          </div>
        </div>

        {/* ── 3. BUSINESS & BANKING GRID ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Box 1: Business Credentials */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Business & Compliance</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">GSTIN</span>
                <span className="font-mono font-bold text-gray-800">{seller.gstin || '27AABCP1234F1Z5'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">PAN</span>
                <span className="font-mono font-bold text-gray-800">{seller.pan || 'AABCP1234F'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Registered Email</span>
                <span className="text-gray-800 font-medium truncate max-w-[180px]">{seller.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Contact Number</span>
                <span className="text-gray-800 font-semibold">{seller.phone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Banking & Settlements */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>Payout & Bank Account</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Bank Name</span>
                <span className="font-semibold text-gray-800">{bank.bankName || 'HDFC Bank'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Account Number</span>
                <span className="font-mono font-semibold text-gray-800">{bank.accountNumber || '•••• •••• 4912'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">IFSC Code</span>
                <span className="font-mono font-semibold text-gray-800">{bank.ifsc || 'HDFC0001234'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">UPI ID</span>
                <span className="font-mono text-purple-700 font-medium">{bank.upiId || `${seller.id}@upi`}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── 4. TIER LEVEL CONTROLLER ───────────────────────────────── */}
        <div className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 border border-purple-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Partner Tier Moderation
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Current Status: <strong className="text-purple-700">{seller.tier || 'Silver'} Tier</strong>. Modify vendor authorization level.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="text-xs font-semibold border border-purple-200 rounded-lg px-3 py-1.5 bg-white text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              <option value="Silver">Silver Supplier</option>
              <option value="Gold">Gold Partner ⭐</option>
              <option value="Platinum">Platinum Elite 👑</option>
            </select>
            <Button
              size="sm"
              onClick={handleTierSubmit}
              disabled={actionLoading || selectedTier === seller.tier}
              className="bg-[#b7004d] hover:bg-[#96003f] text-white text-xs h-8 cursor-pointer"
            >
              {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Update Tier'}
            </Button>
          </div>
        </div>

        {/* ── 5. CATALOG PREVIEW ─────────────────────────────────────── */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Catalog Items from this Store ({products.length})
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-xl text-gray-400 text-xs">
              No products uploaded under this supplier yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-white hover:border-[#b7004d]/40 transition-colors"
                >
                  <img
                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={prod.title}
                    className="w-12 h-12 rounded-md object-cover bg-gray-100 shrink-0 border border-gray-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{prod.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-[#b7004d]">
                        {formatCurrency ? formatCurrency(prod.price) : `₹${prod.price}`}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Stock: <strong className="text-gray-700">{prod.stock}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 6. FOOTER ──────────────────────────────────────────────── */}
        <div className="border-t pt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
