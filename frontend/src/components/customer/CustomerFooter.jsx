import React, { useState } from 'react';

export default function CustomerFooter({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(() => {
    try {
      return Boolean(localStorage.getItem('mshoppy_newsletter_code'));
    } catch (_) {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubscribe = (e) => {
    e?.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showToast('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const existing = JSON.parse(localStorage.getItem('mshoppy_newsletter_subscribers') || '[]');
      if (!existing.includes(cleanEmail)) {
        existing.push(cleanEmail);
        localStorage.setItem('mshoppy_newsletter_subscribers', JSON.stringify(existing));
      }
      localStorage.setItem('mshoppy_newsletter_code', 'WELCOME10');
      setSubscribed(true);
      showToast('🎉 Subscribed! Use code WELCOME10 for 10% off.');
    } catch (_) {
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard?.writeText('WELCOME10');
      setCopied(true);
      showToast('Coupon code WELCOME10 copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleNav = (path) => {
    if (typeof onNavigate === 'function') {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-24 lg:pb-12 border-t border-slate-800 relative z-10">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-[#b7004d] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── 1. Footer Newsletter Subscription Card (Primary Sir Requirement) ── */}
        <div className="bg-gradient-to-r from-[#580026] via-[#800038] to-[#9f0046] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-pink-500/20">
          <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 -top-8 w-44 h-44 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-pink-200">
              <span className="material-symbols-outlined text-sm">mail</span>
              <span>Official MShoppy Newsletter</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Subscribe &amp; Get 10% OFF Your First Order
            </h3>

            <p className="text-xs sm:text-sm text-pink-100/80 max-w-lg mx-auto leading-relaxed">
              Join 500,000+ smart shoppers. Get weekly handpicked price-drops, flash deals, and exclusive subscriber coupon codes directly in your inbox.
            </p>

            {subscribed ? (
              <div className="p-4 sm:p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-md mx-auto text-center space-y-2 animate-in zoom-in-95">
                <span className="material-symbols-outlined text-3xl text-emerald-400">verified</span>
                <h4 className="text-sm font-black text-white">You're Subscribed to Newsletter! 🎉</h4>
                <p className="text-xs text-pink-100">Apply your welcome discount at checkout:</p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="px-4 py-2 bg-white text-[#800038] font-mono font-black text-base rounded-xl tracking-wider shadow-xs">
                    WELCOME10
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md"
                  >
                    {copied ? 'COPIED!' : 'COPY CODE'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-pink-200/70 focus:placeholder:text-slate-400 border border-white/30 rounded-2xl px-4 py-3.5 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-white text-[#800038] hover:bg-pink-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer uppercase tracking-wider shrink-0 disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}

            <p className="text-[10px] text-pink-200/60 pt-1">
              Zero spam. Easy 1-click unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* ── 2. Trust Badges Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-800 text-center">
          <div className="p-3 space-y-1">
            <span className="material-symbols-outlined text-2xl text-pink-500">local_shipping</span>
            <h4 className="text-xs font-bold text-white">Free Delivery</h4>
            <p className="text-[11px] text-slate-400">On all prepaid &amp; COD orders</p>
          </div>
          <div className="p-3 space-y-1">
            <span className="material-symbols-outlined text-2xl text-pink-500">currency_rupee</span>
            <h4 className="text-xs font-bold text-white">Cash on Delivery</h4>
            <p className="text-[11px] text-slate-400">OTP verified secure payment</p>
          </div>
          <div className="p-3 space-y-1">
            <span className="material-symbols-outlined text-2xl text-pink-500">assignment_return</span>
            <h4 className="text-xs font-bold text-white">7-Day Easy Return</h4>
            <p className="text-[11px] text-slate-400">Instant door-step pickup</p>
          </div>
          <div className="p-3 space-y-1">
            <span className="material-symbols-outlined text-2xl text-pink-500">verified</span>
            <h4 className="text-xs font-bold text-white">Lowest Price Guarantee</h4>
            <p className="text-[11px] text-slate-400">Direct from Surat &amp; Tirupur</p>
          </div>
        </div>

        {/* ── 3. Footer Links Columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Shop Non-Stop */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-white tracking-tight">Shop Non-Stop</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Trusted by 15 Crore+ Indians for the best fashion, electronics, home decor &amp; kitchen essentials.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleNav('/explorer')}
                className="text-left text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer"
              >
                Explore All Categories ›
              </button>
              <button
                type="button"
                onClick={() => handleNav('/reseller')}
                className="text-left text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer"
              >
                Reseller &amp; Earn Hub ›
              </button>
            </div>
          </div>

          {/* Col 2: Customer Policies */}
          <div className="space-y-2.5">
            <h4 className="font-black text-sm text-white tracking-tight">Customer Policies</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button type="button" onClick={() => handleNav('/policy?type=terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/policy?type=privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/policy?type=return')} className="hover:text-white transition-colors cursor-pointer">
                  Return &amp; Refund Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/policy?type=shipping')} className="hover:text-white transition-colors cursor-pointer">
                  Shipping &amp; Delivery
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Useful Links */}
          <div className="space-y-2.5">
            <h4 className="font-black text-sm text-white tracking-tight">Useful Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button type="button" onClick={() => handleNav('/orders')} className="hover:text-white transition-colors cursor-pointer">
                  My Orders &amp; Tracking
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/cart')} className="hover:text-white transition-colors cursor-pointer">
                  Shopping Cart
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/wishlist')} className="hover:text-white transition-colors cursor-pointer">
                  My Wishlist
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('/seller/register')} className="hover:text-white transition-colors cursor-pointer">
                  Become a Supplier (0% Comm.)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Reach Out to Us */}
          <div className="space-y-2.5">
            <h4 className="font-black text-sm text-white tracking-tight">Reach Out to Us</h4>
            <div className="space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
              <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="material-symbols-outlined text-sm text-pink-400">mail</span>
                <span>support@mshoppy.in</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="material-symbols-outlined text-sm text-pink-400">call</span>
                <span>+91 80 6179 9600 (9 AM - 7 PM)</span>
              </p>
              <p className="pt-1 text-[10.5px]">
                MShoppy Technologies Pvt. Ltd.<br />
                Outer Ring Road, Bellandur,<br />
                Bengaluru, Karnataka 560103, India
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Bottom Copyright & Security Strip ── */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 MShoppy Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
              <span>256-Bit SSL Encrypted Checkout</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">100% Secure Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
