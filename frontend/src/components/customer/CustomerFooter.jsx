import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerFooter({ onNavigate }) {
  const routerNavigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  // Clear any global legacy flag on load so guests always see the input box
  useEffect(() => {
    try {
      localStorage.removeItem('mshoppy_newsletter_code');
    } catch (_) {}
  }, []);

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
      showToast('Code WELCOME10 copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleNav = (path) => {
    if (!path) return;
    if (path.startsWith('mailto:') || path.startsWith('http://') || path.startsWith('https://')) {
      window.location.href = path;
      return;
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
    if (typeof onNavigate === 'function') {
      onNavigate(path);
    } else {
      routerNavigate(path);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-[#b7004d] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* ── 1. Clean, Compact Newsletter Section ── */}
        <div className="bg-slate-800/60 rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-slate-400 text-xs max-w-md">
              Get updates on new arrivals, weekly curated deals, and exclusive discount codes.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-emerald-500/30 px-4 py-2.5 rounded-xl">
                <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                <span className="text-xs text-white">Code:</span>
                <span className="font-mono font-bold text-pink-400 tracking-wider">WELCOME10</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-2 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 flex-1 min-w-[200px]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#b7004d] hover:bg-[#96003f] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {loading ? '...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── 2. Clean Navigation Links (Zero Dummy Data, Zero Fake Numbers) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 text-xs">
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Explore</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/explorer')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  All Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/reseller-home')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Reseller Hub
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/become-supplier')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Become a Supplier
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Orders &amp; Account</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/orders')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  My Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/cart')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Cart
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/wishlist')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Wishlist
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Policies</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/terms-and-conditions')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/privacy-policy')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/return-and-refund-policy')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Return &amp; Refund Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/shipping-policy')}
                  className="hover:text-white transition-colors cursor-pointer text-left block w-full py-0.5"
                >
                  Shipping Policy
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Support</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="mailto:support@mshoppy.in"
                  className="text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1.5 py-0.5"
                >
                  <span className="material-symbols-outlined text-xs">mail</span>
                  <span>support@mshoppy.in</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/support-center')}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 text-slate-400 py-0.5 block w-full"
                >
                  <span className="material-symbols-outlined text-xs">headset_mic</span>
                  <span>Help &amp; Support Center</span>
                </button>
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Mon - Sat (9:00 AM - 6:00 PM)
              </li>
            </ul>
          </div>
        </div>

        {/* ── 3. Bottom Strip: Clean Copyright & Security ── */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {currentYear} MShoppy. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-xs text-emerald-400">lock</span>
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
