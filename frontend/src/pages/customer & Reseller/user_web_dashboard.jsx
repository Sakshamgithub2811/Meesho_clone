import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import { getDropshipperApp, subscribeDropshipperApp } from '../../services/dropshipperSessionStore';
import { getAffiliateApp, subscribeAffiliateApp } from '../../services/affiliateSessionStore';

export default function UserWebDashboard({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };
  const [activeSidebarTab, setActiveSidebarTab] = useState('Dashboard');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(12840);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Dropshipper KYC State (Synced with in-memory store; auto-resets on refresh)
  const [dropshipperApp, setDropshipperApp] = useState(() => getDropshipperApp());

  useEffect(() => {
    const unsubscribe = subscribeDropshipperApp((updatedApp) => {
      setDropshipperApp(updatedApp);
    });
    return unsubscribe;
  }, []);

  // Affiliate KYC State (Synced with affiliateSessionStore & localStorage)
  const [affiliateApp, setAffiliateApp] = useState(() => getAffiliateApp());

  useEffect(() => {
    const unsubscribeAffiliate = subscribeAffiliateApp((updatedApp) => {
      setAffiliateApp(updatedApp);
    });
    return unsubscribeAffiliate;
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      triggerToast('Please enter a valid withdrawal amount');
      return;
    }
    if (amount > walletBalance) {
      triggerToast('Amount exceeds available wallet balance');
      return;
    }

    setWalletBalance((prev) => prev - amount);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    triggerToast(`Withdrawal of ₹${amount.toLocaleString()} initiated to bank! 🏦`);
  };

  const handleShareProduct = (productName, profit) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Check out ${productName} on Meesho! Earn ₹${profit} profit!`);
    }
    triggerToast(`Shared ${productName}! Earn ₹${profit} per resale 🚀`);
  };

  const weeklyEarnings = [
    { day: 'Mon', amount: 480, height: '40%' },
    { day: 'Tue', amount: 650, height: '55%' },
    { day: 'Wed', amount: 320, height: '30%' },
    { day: 'Thu', amount: 890, height: '75%' },
    { day: 'Fri', amount: 560, height: '50%' },
    { day: 'Sat', amount: 720, height: '65%' },
    { day: 'Sun', amount: 1100, height: '95%', peak: true },
  ];

  const orderHistory = [
    {
      id: '#ML-89210',
      product: 'Emerald Silk Embroidered Kurta',
      status: 'Delivered',
      statusColor: 'bg-emerald-50 text-[#008644] border-emerald-200',
      earnings: '₹420',
      target: 'product',
    },
    {
      id: '#ML-89215',
      product: 'Handcrafted Leather Crossbody Bag',
      status: 'In Transit',
      statusColor: 'bg-indigo-50 text-[#4d41df] border-indigo-200',
      earnings: '₹280',
      target: 'product',
    },
    {
      id: '#ML-89218',
      product: 'Wireless Studio Pro Earbuds',
      status: 'Processing',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      earnings: '₹550',
      target: 'product',
    },
    {
      id: '#ML-89222',
      product: 'Organic Cotton Summer Co-ord Set',
      status: 'Returned',
      statusColor: 'bg-red-50 text-red-700 border-red-200',
      earnings: '₹0',
      target: 'product',
    },
  ];

  const resaleProducts = [
    {
      id: 1,
      title: 'Golden Oversized Luxe Streetwear Hoodie',
      tag: 'Streetwear Luxe',
      price: '₹899',
      profit: '150',
      badge: 'High Margin',
      img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Minimalist Ceramic Dial Timepiece',
      tag: 'Timepieces',
      price: '₹1,249',
      profit: '220',
      badge: 'Hot Seller',
      img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Azure Velvet Evening Designer Pumps',
      tag: 'Footwear',
      price: '₹1,899',
      profit: '300',
      badge: 'Trending',
      img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Retro Gold-Rimmed Aviator Frames',
      tag: 'Accessories',
      price: '₹549',
      profit: '120',
      badge: 'High Margin',
      img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="bg-[#f8f9fb] font-sans text-[#191c1e] min-h-screen flex antialiased selection:bg-pink-100 selection:text-pink-600 w-full max-w-full overflow-x-hidden">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Side Navigation Bar for Web/Tablet */}
      <aside className="hidden lg:flex flex-col h-screen w-64 bg-white border-r border-slate-100 fixed left-0 top-0 z-40 py-6 px-3 space-y-2">
        <div
          onClick={() => onNavigate('reseller')}
          className="px-4 mb-6 cursor-pointer flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b90041] to-[#df2457] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <span className="material-symbols-outlined text-xl">storefront</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#b90041] group-hover:underline">
              Curator Luxe
            </h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Digital Reseller Hub
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {(() => {
            let dropshipperNavTitle = 'Become a Dropshipper';
            let dropshipperNavBadge = 'NEW';
            let dropshipperNavIcon = 'local_shipping';

            if (dropshipperApp) {
              if (dropshipperApp.status === 'Approved') {
                dropshipperNavTitle = 'Dropshipper Status';
                dropshipperNavBadge = 'ACTIVE';
                dropshipperNavIcon = 'verified';
              } else if (dropshipperApp.status === 'Rejected') {
                dropshipperNavTitle = 'Dropshipper KYC';
                dropshipperNavBadge = 'ACTION';
                dropshipperNavIcon = 'warning';
              } else {
                dropshipperNavTitle = 'Dropshipper KYC';
                dropshipperNavBadge = 'REVIEW';
                dropshipperNavIcon = 'pending';
              }
            }

            let affiliateNavTitle = 'Become an Affiliate';
            let affiliateNavBadge = 'NEW';
            let affiliateNavIcon = 'loyalty';

            if (affiliateApp) {
              if (affiliateApp.status === 'Approved' || affiliateApp.status === 'APPROVED') {
                affiliateNavTitle = 'Affiliate Status';
                affiliateNavBadge = 'ACTIVE';
                affiliateNavIcon = 'verified';
              } else if (affiliateApp.status === 'Rejected' || affiliateApp.status === 'REJECTED') {
                affiliateNavTitle = 'Affiliate KYC';
                affiliateNavBadge = 'ACTION';
                affiliateNavIcon = 'warning';
              } else {
                affiliateNavTitle = 'Affiliate KYC';
                affiliateNavBadge = 'REVIEW';
                affiliateNavIcon = 'pending';
              }
            }

            return [
              { id: 'Dashboard', icon: 'dashboard', action: () => setActiveSidebarTab('Dashboard') },
              { id: affiliateNavTitle, icon: affiliateNavIcon, badge: affiliateNavBadge, action: () => handleNav(affiliateApp ? '/affiliate-kyc-status' : 'affiliate-kyc'), highlight: !affiliateApp || affiliateNavBadge === 'REVIEW' },
              { id: dropshipperNavTitle, icon: dropshipperNavIcon, badge: dropshipperNavBadge, action: () => handleNav('/dropshipper-register') },
              { id: 'Products', icon: 'inventory_2', action: () => handleNav('explorer') },
              { id: 'Orders', icon: 'shopping_bag', action: () => handleNav('/orders') },
              { id: 'Wishlist', icon: 'favorite', action: () => handleNav('wishlist') },
              { id: 'Sarees Store', icon: 'styler', action: () => handleNav('sarees') },
              { id: 'Flash Drops', icon: 'bolt', action: () => handleNav('flash') },
              { id: 'Curator Spotlight', icon: 'auto_awesome', action: () => handleNav('spotlight') },
            ];
          })().map((item) => {
            const isActive = activeSidebarTab === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full text-left rounded-2xl px-4 py-3 flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pink-50 text-[#b90041] font-bold shadow-sm'
                    : item.highlight
                    ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-[#FF3F6C] font-extrabold border border-rose-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="text-xs font-bold">{item.id}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${
                      item.badge === 'ACTIVE'
                        ? 'bg-emerald-600 text-white'
                        : item.badge === 'ACTION'
                        ? 'bg-rose-600 text-white'
                        : item.badge === 'REVIEW'
                        ? 'bg-amber-500 text-white'
                        : item.badge === 'KYC'
                        ? 'bg-[#FF3F6C] text-white'
                        : 'bg-[#b90041] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Shortcuts */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <button
            onClick={() => handleNav('/admin-panel')}
            className="w-full text-left rounded-2xl px-4 py-2.5 flex items-center space-x-3 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs font-bold"
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            <span>Admin Console</span>
          </button>
          <button
            onClick={() => onNavigate('reseller')}
            className="w-full text-left rounded-2xl px-4 py-2.5 flex items-center space-x-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            <span>Back to Shopping</span>
          </button>
          <button
            onClick={() => triggerToast('Logged out of Curator Hub')}
            className="w-full text-left rounded-2xl px-4 py-2.5 flex items-center space-x-3 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs font-bold"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full max-w-7xl lg:ml-64 p-3 sm:p-6 md:p-8 min-h-screen mx-auto space-y-5 sm:space-y-8 pb-36 sm:pb-32 overflow-hidden">
        {/* Top Header */}
        <header className="flex flex-col gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <button
                onClick={() => (onBack ? onBack() : handleNav('/admin-panel'))}
                className="p-1.5 -ml-1 hover:bg-slate-100 rounded-full text-slate-700 cursor-pointer shrink-0 transition-colors flex items-center justify-center"
                aria-label="Back"
                title="Go back"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <h1 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-[#191c1e] truncate font-['Plus_Jakarta_Sans',sans-serif]">
                Hello, Sarah James! 👋
              </h1>
            </div>

            {/* Quick Actions, Wishlist, Notification & Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                onClick={() => handleNav('/admin-panel')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                title="Back to Admin Console"
              >
                <span className="material-symbols-outlined text-sm text-rose-400">admin_panel_settings</span>
                <span>Admin Console</span>
              </button>
              <button
                onClick={() => handleNav('explorer')}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#FF3F6C] to-[#b90041] text-white font-black text-xs sm:text-sm shadow-md shadow-pink-500/25 hover:opacity-95 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Find Products"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">add_shopping_cart</span>
                <span>Find Products</span>
              </button>

              <button
                onClick={() => onNavigate('wishlist')}
                className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Wishlist"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">favorite</span>
              </button>
              <button
                onClick={() => triggerToast('3 new order inquiries today!')}
                className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500"></span>
              </button>
              <div
                onClick={() => triggerToast('Viewing Sarah James Curator Profile')}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-2xl bg-[#4d41df] text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-md cursor-pointer hover:opacity-90 shrink-0"
              >
                SJ
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <p className="text-[#b90041] font-bold text-xs md:text-sm">
              You have earned <span className="underline">₹4,250</span> in reseller margins this month.
            </p>
          </div>
        </header>

        {/* Dropshipper Onboarding / Status Hero Banner */}
        {dropshipperApp?.status === 'Approved' ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-[#005a2b] p-4 sm:p-7 text-white shadow-xl shadow-emerald-950/10 border border-emerald-500/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-500/30 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">Verified Dropshipper Partner • App #{dropshipperApp.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug sm:leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Welcome, {dropshipperApp.brandName}! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Your dropshipping KYC and store (<span className="font-mono text-emerald-300 font-bold break-all">{dropshipperApp.storeUrl}</span>) have been approved! You can now source supplier products with zero inventory and full white-label packaging.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/dropshipper-register')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 font-black text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">verified</span>
                  <span>View KYC Status &amp; Store</span>
                </button>
              </div>
            </div>
          </section>
        ) : dropshipperApp?.status === 'Rejected' ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-[#7f1d1d] p-4 sm:p-7 text-white shadow-xl shadow-red-950/10 border border-red-500/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-[11px] font-bold text-rose-300 border border-rose-500/30 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0"></span>
                  <span className="truncate">KYC Action Required • App #{dropshipperApp.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug sm:leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Document Verification Needs Attention ⚠️
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Admin feedback: <strong className="text-rose-300">{dropshipperApp.rejectionReason || 'Please resubmit your PAN/Aadhaar document proofs.'}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/dropshipper-register')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-2xl bg-rose-600 text-white hover:bg-rose-500 font-black text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">edit_document</span>
                  <span>Fix &amp; Resubmit KYC</span>
                </button>
              </div>
            </div>
          </section>
        ) : dropshipperApp ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-[#78350f] p-4 sm:p-7 text-white shadow-xl shadow-amber-950/10 border border-amber-500/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-500/30 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                  <span className="truncate">Verification In Progress • App #{dropshipperApp.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug sm:leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Your Dropshipper KYC is Under Review ⏳
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Submitted for <strong className="text-white">{dropshipperApp.brandName}</strong> (<span className="font-mono text-amber-200 font-bold break-all">{dropshipperApp.storeUrl}</span>). The compliance team is cross-verifying your PAN, Aadhaar and bank details (estimated 24-48 hrs).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/dropshipper-register')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">fact_check</span>
                  <span>Check Live Status</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17051d] via-[#4a0827] to-[#990038] p-5 sm:p-7 text-white shadow-2xl shadow-rose-950/25 border border-rose-500/30 ring-1 ring-white/10 group transition-all duration-300 hover:border-rose-400/50">
            {/* Ambient Multi-layer Mesh Glow */}
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-gradient-to-br from-[#FF3F6C]/25 to-rose-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 -translate-y-2 w-48 h-48 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black text-rose-200 border border-white/20 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="tracking-wider uppercase text-[10px]">Dropshipping Engine • 0 Inventory &amp; Capital</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Launch Your Connected Dropshipping Store <span className="inline-block animate-bounce text-2xl sm:text-3xl">🚀</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Connect your storefront (Shopify, WooCommerce or Custom Domain), sync supplier products with 1-click, and let verified suppliers pack &amp; deliver directly to your customers with white-label branding.
                </p>

                {/* Micro-feature value badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200">
                    <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
                    <span>100% White-Label Packaging</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200">
                    <span className="material-symbols-outlined text-sm text-amber-300">sync_saved_locally</span>
                    <span>1-Click Catalog Auto-Sync</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200">
                    <span className="material-symbols-outlined text-sm text-pink-300">local_shipping</span>
                    <span>Direct Doorstep Delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/dropshipper-register')}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-white text-[#990038] hover:bg-rose-50 font-black text-xs sm:text-sm shadow-xl shadow-black/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-xl text-[#b90041] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">
                    rocket_launch
                  </span>
                  <span>Become a Dropshipper</span>
                  <span className="material-symbols-outlined text-base opacity-60 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Affiliate Onboarding / KYC Status Hero Banner */}
        {affiliateApp?.status === 'Approved' || affiliateApp?.status === 'APPROVED' ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#033b23] via-slate-900 to-[#024a2f] p-4 sm:p-7 text-white shadow-xl shadow-emerald-950/10 border border-emerald-500/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-500/30 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">Verified Affiliate Partner • Active • App #{affiliateApp.applicationId || affiliateApp.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug sm:leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Welcome, {affiliateApp.fullName || 'Sarah James'}! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Your affiliate partner KYC has been approved! You can now share curated Meesho product referral links and earn up to <strong className="text-emerald-300">15% commission</strong> directly into your verified bank account.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/affiliate-panel')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 font-black text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">loyalty</span>
                  <span>Open Affiliate Hub</span>
                </button>
              </div>
            </div>
          </section>
        ) : affiliateApp?.status === 'Rejected' || affiliateApp?.status === 'REJECTED' ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-[#7f1d1d] p-4 sm:p-7 text-white shadow-xl shadow-red-950/10 border border-red-500/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-[11px] font-bold text-rose-300 border border-rose-500/30 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0"></span>
                  <span className="truncate">KYC Action Required • App #{affiliateApp.applicationId || affiliateApp.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug sm:leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Affiliate Verification Needs Attention ⚠️
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Admin feedback: <strong className="text-rose-300">{affiliateApp.rejectionReason || 'Please resubmit your PAN card photo and bank passbook/cheque with matching legal name.'}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/affiliate-kyc?edit=true')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-2xl bg-rose-600 text-white hover:bg-rose-500 font-black text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">edit_document</span>
                  <span>Fix &amp; Resubmit KYC</span>
                </button>
              </div>
            </div>
          </section>
        ) : affiliateApp ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#260e22] via-slate-900 to-[#3d122e] p-4 sm:p-7 text-white shadow-xl shadow-pink-950/10 border border-pink-500/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                  <span className="truncate">Verification In Progress • App #{affiliateApp.applicationId || affiliateApp.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug sm:leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Your Affiliate KYC is Under Review ⏳
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Submitted for <strong className="text-white">{affiliateApp.fullName || 'Sarah James'}</strong> ({affiliateApp.handle ? <span className="font-mono text-pink-300 font-bold">{affiliateApp.handle}</span> : 'PAN: ' + (affiliateApp.panNumber || 'BKWPS9821K')}). The compliance team is cross-verifying your PAN, Aadhaar and bank payout details (estimated 24-48 hrs).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('/affiliate-kyc-status')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">fact_check</span>
                  <span>Check Live Status</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170a26] via-[#320a2b] to-[#6e0034] p-5 sm:p-7 text-white shadow-2xl shadow-pink-950/20 border border-pink-500/30 ring-1 ring-white/10 group transition-all duration-300 hover:border-pink-400/50">
            {/* Ambient Multi-layer Mesh Glow */}
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-gradient-to-br from-[#FF3F6C]/25 to-pink-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 bottom-0 -translate-y-2 w-48 h-48 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5 max-w-2xl">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-[#FF3F6C] via-[#df2457] to-[#b90041] text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#FF3F6C]/35 ring-4 ring-white/10 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl text-white">loyalty</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gradient-to-r from-pink-500/30 to-rose-500/20 border border-pink-400/40 text-pink-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      High Commission Partner
                    </span>
                    <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Earn up to 15% Payout
                    </span>
                  </div>

                  <h3 className="font-['Plus_Jakarta_Sans'] font-black text-lg sm:text-2xl text-white tracking-tight leading-snug">
                    Become an Affiliate Partner <span className="text-pink-300 font-normal">✦</span>
                  </h3>

                  <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                    Submit your KYC details for fast-track Admin verification. Once approved, share curated Meesho product referral links and earn guaranteed commissions directly into your bank account!
                  </p>

                  {/* Micro-feature value badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200">
                      <span className="material-symbols-outlined text-sm text-pink-300">payments</span>
                      <span>Weekly Direct Bank Payouts</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200">
                      <span className="material-symbols-outlined text-sm text-amber-300">link</span>
                      <span>Instant Referral Link Hub</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleNav('affiliate-kyc')}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3F6C] via-[#ea1d5d] to-[#b90041] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-xl shadow-[#FF3F6C]/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-white/20 group"
                >
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                    how_to_reg
                  </span>
                  <span>Become an Affiliate</span>
                  <span className="material-symbols-outlined text-base opacity-70 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => handleNav('/orders')}
            className="bg-white p-3.5 sm:p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:border-pink-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 sm:p-2.5 bg-pink-50 rounded-2xl text-[#b90041] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-lg sm:text-xl">shopping_bag</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-[#008644] bg-emerald-50 px-2 py-0.5 rounded-full">
                +12% MoM
              </span>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400">Total Customer Orders</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mt-1 text-[#191c1e]">142</h3>
            </div>
          </div>

          <div
            onClick={() => handleNav('/orders')}
            className="bg-white p-3.5 sm:p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:border-indigo-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 sm:p-2.5 bg-indigo-50 rounded-2xl text-[#4d41df] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-lg sm:text-xl">local_shipping</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500">4 arriving today</span>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400">Pending Deliveries</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mt-1 text-[#191c1e]">8</h3>
            </div>
          </div>

          <div
            onClick={() => onNavigate('wishlist')}
            className="bg-white p-3.5 sm:p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:border-pink-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 sm:p-2.5 bg-pink-50 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#b90041]">View All ➔</span>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400">Saved Wishlist Items</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mt-1 text-[#191c1e]">24</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#b90041] to-[#df2457] text-white p-3.5 sm:p-5 rounded-3xl shadow-lg shadow-pink-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 sm:p-2.5 bg-white/20 rounded-2xl">
                <span className="material-symbols-outlined text-lg sm:text-xl">account_balance_wallet</span>
              </span>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-white text-[#b90041] px-2.5 sm:px-3 py-1 rounded-full shadow-sm hover:bg-pink-50 cursor-pointer"
              >
                Withdraw
              </button>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-pink-100">Wallet Balance</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mt-1">
                ₹{walletBalance.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </section>

        {/* Charts and Order History Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Breakdown */}
          <div className="lg:col-span-1 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-extrabold text-[#191c1e]">Reseller Earnings</h2>
                <p className="text-xs text-slate-400">Last 7 Days Performance</p>
              </div>
              <span className="text-[10px] font-black bg-pink-50 text-[#b90041] px-2.5 py-1 rounded-full">
                ₹4,250 Total
              </span>
            </div>

            {/* Bars */}
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-44 pb-2">
              {weeklyEarnings.map((bar) => (
                <div
                  key={bar.day}
                  onClick={() => triggerToast(`${bar.day}: ₹${bar.amount} profit earned`)}
                  className="flex flex-col items-center flex-1 gap-2 cursor-pointer group"
                >
                  <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden flex items-end h-32">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 group-hover:opacity-80 ${
                        bar.peak ? 'bg-[#b90041] shadow-md shadow-pink-500/30' : 'bg-slate-300'
                      }`}
                      style={{ height: bar.height }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${bar.peak ? 'text-[#b90041]' : 'text-slate-500'}`}>
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Weekly Profit
                </p>
                <p className="text-lg font-black text-[#191c1e]">₹4,250</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Average Margin
                </p>
                <p className="text-lg font-black text-[#008644]">18.4%</p>
              </div>
            </div>
          </div>

          {/* Order History Table */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base font-extrabold text-[#191c1e]">Recent Reseller Orders</h2>
              <button
                onClick={() => handleNav('/orders')}
                className="text-xs font-bold text-[#4d41df] hover:underline cursor-pointer"
              >
                View All Orders ➔
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Margin</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {orderHistory.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 font-bold text-[#191c1e]">{row.product}</td>
                      <td className="py-3.5 text-slate-400 font-mono">{row.id}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-black text-[#008644]">{row.earnings}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate(row.target)}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recommended for Resale Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#191c1e]">Recommended for Resale</h2>
              <p className="text-xs text-slate-400">Trending styles with highest profit margins</p>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
            >
              Explore Full Catalog ➔
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resaleProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black text-[#b90041] uppercase tracking-wider">
                    {p.badge}
                  </div>
                  <button
                    onClick={() => handleShareProduct(p.title, p.profit)}
                    className="absolute bottom-3 right-3 h-9 w-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#b90041] shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    title="Share to earn"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {p.tag}
                    </p>
                    <h4
                      onClick={() => onNavigate('product')}
                      className="font-extrabold text-sm text-[#191c1e] line-clamp-1 hover:text-[#b90041] cursor-pointer"
                    >
                      {p.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">
                        Reseller Price
                      </span>
                      <span className="text-base font-black text-[#b90041]">{p.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">
                        Share & Earn
                      </span>
                      <span className="text-xs font-black text-[#008644]">₹{p.profit} profit</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Route Shortcuts Footer Bento */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black">Ready to scale your social store?</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Browse millions of trending sarees, western wear, and accessories with zero investment.
            </p>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('sarees')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 cursor-pointer text-center"
            >
              Sarees Catalog 🥻
            </button>
            <button
              onClick={() => onNavigate('flash')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#b90041] text-white font-bold text-xs shadow-md shadow-pink-500/30 hover:bg-[#a00037] cursor-pointer text-center"
            >
              Flash Drops ⚡
            </button>
          </div>
        </section>
      </main>

      {/* Instant Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-[#191c1e]">Withdraw Reseller Earnings</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Linked Bank: <span className="font-bold text-slate-800">ICICI Bank •••• 4210</span>
                </p>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-700 text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={walletBalance}
                    className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl py-3 pl-8 pr-4 font-black text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#b90041] text-white font-bold text-xs shadow-md shadow-pink-500/25 cursor-pointer hover:bg-[#a00037]"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (desktop/tablet only to avoid overlapping content on mobile screens) */}
      <button
        onClick={() => onNavigate('explorer')}
        className="hidden sm:flex fixed sm:bottom-8 sm:right-8 h-14 w-14 bg-gradient-to-r from-[#b90041] to-[#df2457] text-white rounded-full shadow-2xl items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer shadow-pink-500/40"
        title="Explore Catalogue"
      >
        <span className="material-symbols-outlined text-2xl">search</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden">
        <AppBottomNav activeNav="profile" onNavigate={onNavigate} />
      </div>
    </div>
  );
}