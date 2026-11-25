import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE from '../../config/apiConfig';

const API_BASE_URL = API_BASE;

export default function InviteLanding() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [referralInfo, setReferralInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const cleanCode = (code || '').trim().toUpperCase();

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/referrals/info/${cleanCode}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setReferralInfo(json.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load referral details:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cleanCode]);

  // Handle Claim Offer & Start Shopping
  const handleClaimOffer = () => {
    try {
      // 1. Store referral code for attribution & clear any stale reseller margin
      localStorage.setItem('mshoppy_referral_code', cleanCode);
      localStorage.setItem('mshoppy_referral_timestamp', Date.now().toString());
      localStorage.removeItem('mshoppy_affiliate_margin');

      // 2. Pre-apply the 40% welcome coupon (up to ₹100)
      const couponObj = {
        code: cleanCode,
        discountPercent: 40,
        maxDiscount: 100,
        description: '40% OFF Referral Welcome Bonus (Up to ₹100)'
      };
      localStorage.setItem('mshoppy_applied_coupon', JSON.stringify(couponObj));
      localStorage.setItem('mshoppy_referral_banner_seen', 'false');

      // 3. Try to call backend apply if customer is already logged in
      const customerRaw = localStorage.getItem('mshoppy_customer_user');
      if (customerRaw) {
        try {
          const user = JSON.parse(customerRaw);
          if (user?.id) {
            fetch(`${API_BASE_URL}/referrals/apply`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: cleanCode, userId: user.id })
            }).catch(() => {});
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }

    // Navigate to customer shopping home
    navigate('/user-home');
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const referrerName = referralInfo?.referrerName || 'A friend';
  const initial = referrerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-slate-50 to-pink-50/40 flex flex-col justify-between text-slate-800">
      {/* Top Navbar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/user-home')}>
            <img
              src="/mshoppy-logo.png"
              alt="MShoppy"
              className="h-8 sm:h-9 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-xl sm:text-2xl font-black text-[#9f0038] tracking-tight">MShoppy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Friend Invite</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (Laptop / Desktop Responsive Split Layout) */}
      <main className="flex-1 flex items-center py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Desktop / Laptop View: Story & Benefits) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-[#9f0038] text-xs font-extrabold tracking-wide uppercase">
              <span>🎁 Exclusive Referral Welcome Offer</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Shop Direct from Factories with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9f0038] via-[#c2185b] to-[#e91e63]">
                Flat 40% OFF
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              <strong className="text-slate-900 font-bold">{referrerName}</strong> has invited you to join <strong className="text-[#9f0038]">MShoppy</strong>. Enjoy lowest wholesale prices on fashion, home decor, electronics & daily essentials with zero middleman commissions.
            </p>

            {/* 4 Feature Value Props */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Wholesale Rates</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Direct from verified manufacturers</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Cash on Delivery</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Pay safely after doorstep delivery</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">7-Day Easy Returns</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Hassle-free doorstep pickup & refund</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Free Delivery</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Available on 50,000+ top products</p>
                </div>
              </div>
            </div>

            {/* Trust Proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                ✓ <span className="text-slate-700 ml-1">Verified Community</span>
              </span>
              <span>•</span>
              <span>Direct from Verified Suppliers</span>
            </div>
          </div>

          {/* Right Column (Hero Voucher & Claim Card) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto order-1 lg:order-2">
            <div className="bg-white border-2 border-rose-100 rounded-3xl shadow-2xl shadow-rose-950/10 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
              
              {/* Card Header with Inviter Avatar */}
              <div className="bg-gradient-to-r from-[#9f0038] via-[#b7004d] to-[#d61c68] text-white p-6 sm:p-7 text-center relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-rose-400/20 rounded-full blur-lg pointer-events-none" />

                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-white text-[#9f0038] font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-white/90 ring-4 ring-white/20">
                  {initial}
                </div>

                <p className="text-rose-100 text-xs font-bold uppercase tracking-wider">
                  You Have Been Invited By
                </p>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  {referrerName}
                </h2>
                <p className="text-rose-100 text-xs mt-1">
                  Claim your first-order welcome discount below
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* 40% OFF Ticket Voucher Box */}
                <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                      🎁
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          Flat 40% OFF
                        </span>
                        <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded uppercase">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-semibold mt-0.5">
                        Up to ₹100 instant discount on 1st order
                      </p>
                    </div>
                  </div>
                </div>

                {/* Referral Code Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Referral Code
                    </span>
                    <span className="text-base font-black text-[#9f0038] font-mono tracking-wider">
                      {cleanCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      copied
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Action CTAs */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleClaimOffer}
                    className="w-full bg-[#9f0038] hover:bg-[#840032] text-white py-4 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-900/25 cursor-pointer active:scale-98 transition-all"
                  >
                    <span>Claim 40% OFF & Start Shopping</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>

                  <a
                    href="https://play.google.com/store/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-[#9f0038]">install_mobile</span>
                    <span>Download MShoppy App on Phone</span>
                  </a>

                  <p className="text-[11px] text-slate-400 text-center font-medium pt-0.5">
                    ⚡ 40% discount will be automatically applied at checkout
                  </p>
                </div>

                {/* Bottom Trust Badges */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-around text-[10px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">🛡️ 100% Genuine</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">⚡ Fast Dispatch</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">🔒 Safe Payments</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white/60 py-4 text-center text-xs text-slate-400">
        <p>© 2026 MShoppy India. India's Favourite Wholesale Shopping Marketplace.</p>
      </footer>
    </div>
  );
}
