import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ReturnRefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>

          <Link to="/user-home" className="text-lg font-black tracking-tight text-[#b7004d]">
            MShoppy<span className="text-xs font-medium text-slate-400 ml-1.5">Official</span>
          </Link>

          <div className="w-16" />
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link to="/user-home" className="hover:text-white transition-colors">Home</Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">Policies</span>
          <span className="text-slate-600">/</span>
          <span className="text-pink-400 font-semibold">Return &amp; Refund Policy</span>
        </nav>

        {/* Policy Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar text-xs">
          <Link
            to="/terms-and-conditions"
            className="px-4 py-2 rounded-xl font-medium bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy-policy"
            className="px-4 py-2 rounded-xl font-medium bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/return-and-refund-policy"
            className="px-4 py-2 rounded-xl font-bold bg-[#b7004d] text-white shadow-md shadow-pink-900/30"
          >
            Return &amp; Refund
          </Link>
          <Link
            to="/shipping-policy"
            className="px-4 py-2 rounded-xl font-medium bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            Shipping Policy
          </Link>
        </div>

        {/* Document Card */}
        <article className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10">
          <div className="border-b border-slate-800 pb-5 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Return &amp; Refund Policy
            </h1>
            <p className="text-xs text-slate-400">
              URL: <span className="font-mono text-slate-500">/return-and-refund-policy</span>
            </p>
          </div>

          {/* Clean Placeholder Section (Content to be added later) */}
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center my-6">
            <div className="w-14 h-14 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">replay</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">
              Return &amp; Refund Policy Content Coming Soon
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              This page is successfully linked and active. The full guidelines for 7-day returns, replacements, and refund processes will be written and published here.
            </p>
            <Link
              to="/user-home"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Back to Storefront</span>
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} MShoppy Technologies Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}