import React, { useState } from 'react';

const INITIAL_VERIFICATIONS = [
  {
    id: 'ver-1',
    type: 'merchant',
    title: 'Modern Ethnic Wears',
    subtitle: 'New Merchant • GST: 22AAAAA0000A1Z5',
    icon: 'storefront',
    imageUrl: null,
  },
  {
    id: 'ver-2',
    type: 'product',
    title: 'Kanchipuram Silk Saree',
    subtitle: 'Product ID: #PRD-8829 • Fashion Category',
    icon: null,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDNh33K1ZNcYOVS3MmGlsIHs_8mqVJuvT1p5NSbhi1PagxKqKRAxIAGOTFK_N5m6Ad6aDjMddfZcmQ1UwDVya6dyFEB6kJc_nbaJeVHX48Gqw_r-KiZXUX-nQ726O78RTPw-U3F8_oVJVwESvZkxiMN_1q2LDsw_NvVT1uJNCu1HzVsNhZQCmaNPgnJ_7afS3-Frwt8Rxpys5jh00MLeUGVXzQMBQBEfz360Hg9Ty8WXmM1dldv200ySI77lvivcJqDIW6RqW_tMhk',
  },
  {
    id: 'ver-3',
    type: 'reseller',
    title: 'Priya S. Influencer',
    subtitle: 'Reseller Profile • 120k Followers',
    icon: 'person_search',
    imageUrl: null,
  },
];

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  {
    id: 'kyc',
    label: 'KYC Verifications',
    icon: 'verified_user',
    isParent: true,
    children: [
      { id: 'dropshipper-kyc', label: 'Dropshipper KYC 📦', icon: 'local_shipping', path: '/admin-dropshipper-kyc' },
      { id: 'affiliate-kyc', label: 'Affiliate KYC 🤝', icon: 'loyalty', path: '/admin-affiliate-kyc' },
    ],
  },
  { id: 'products', label: 'Products', icon: 'inventory_2' },
  { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
  { id: 'returns', label: 'Returns & Refunds 🔄', icon: 'assignment_return' },
  { id: 'analytics', label: 'Analytics', icon: 'insights' },
  { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
  { id: 'earnings', label: 'Earnings', icon: 'payments' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'sellers', label: 'Sellers', icon: 'storefront' },
  { id: 'finance', label: 'Finance', icon: 'account_balance' },
];

export function AdminWebPanel({ onNavigate, onSwitchView }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('30days');
  const [verifications, setVerifications] = useState(INITIAL_VERIFICATIONS);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKycMenuOpen, setIsKycMenuOpen] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVerify = (id, action) => {
    const item = verifications.find((v) => v.id === id);
    setVerifications((prev) => prev.filter((v) => v.id !== id));
    if (action === 'approve') {
      showToast(`Approved "${item?.title || 'Item'}" successfully!`);
    } else {
      showToast(`Rejected "${item?.title || 'Item'}".`);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006a34] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">verified</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================== Mobile Top Bar ===================== */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 cursor-pointer"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="text-sm font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
            Admin Console
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/admin-returns')}
          className="bg-rose-50 text-rose-700 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 border border-rose-200 cursor-pointer"
        >
          <span>Returns Hub</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* ===================== Mobile Navigation Drawer ===================== */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-slate-900 text-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="text-base font-black text-rose-500 font-['Plus_Jakarta_Sans',sans-serif]">
                    Admin Console
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Digital Curator Hub
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto max-h-[70vh]">
                {SIDEBAR_NAV.map((item) => {
                  if (item.isParent) {
                    const isAnyChildActive = item.children?.some((c) => activeTab === c.id);
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setIsKycMenuOpen(!isKycMenuOpen)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isAnyChildActive
                              ? 'bg-slate-800 text-rose-400'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="material-symbols-outlined mr-2.5 text-base">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <span
                            className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                              isKycMenuOpen ? 'rotate-180 text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            expand_more
                          </span>
                        </button>

                        {isKycMenuOpen && (
                          <div className="ml-4 pl-3 border-l border-slate-700/80 space-y-1 py-1">
                            {item.children?.map((subItem) => {
                              const isSubActive = activeTab === subItem.id;
                              return (
                                <button
                                  key={subItem.id}
                                  type="button"
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (subItem.path && onNavigate) {
                                      onNavigate(subItem.path);
                                    } else {
                                      setActiveTab(subItem.id);
                                      if (onNavigate) onNavigate(subItem.id);
                                    }
                                  }}
                                  className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    isSubActive
                                      ? 'bg-rose-600 text-white font-bold'
                                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                  }`}
                                >
                                  <span className="material-symbols-outlined mr-2 text-sm text-rose-400">{subItem.icon}</span>
                                  <span>{subItem.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (item.id === 'returns') {
                          if (onNavigate) onNavigate('/admin-returns');
                          return;
                        }
                        setActiveTab(item.id);
                        if (onNavigate) onNavigate(item.id);
                      }}
                      className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined mr-2.5 text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigate) onNavigate('/admin-returns');
                }}
                className="w-full py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Open Returns &amp; SPF Hub</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1">
        {/* ===================== Sidebar Navigation Shell ===================== */}
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-950 py-6 space-y-2 border-r border-slate-200/60 dark:border-slate-800">
          <div className="px-6 mb-8">
            <h1 className="text-lg font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
              Management Console
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
              Digital Curator Hub
            </p>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {SIDEBAR_NAV.map((item) => {
              if (item.isParent) {
                const isAnyChildActive = item.children?.some((c) => activeTab === c.id);
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setIsKycMenuOpen(!isKycMenuOpen)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold transition-all cursor-pointer ${
                        isAnyChildActive
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-3 text-rose-500">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-lg text-slate-400 transition-transform duration-200 ${
                          isKycMenuOpen ? 'rotate-180 text-rose-500' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {isKycMenuOpen && (
                      <div className="ml-5 pl-3 border-l-2 border-rose-200 dark:border-rose-900/60 space-y-1 py-1">
                        {item.children?.map((subItem) => {
                          const isSubActive = activeTab === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              type="button"
                              onClick={() => {
                                if (subItem.path && onNavigate) {
                                  onNavigate(subItem.path);
                                } else {
                                  setActiveTab(subItem.id);
                                  if (onNavigate) onNavigate(subItem.id);
                                }
                              }}
                              className={`w-full flex items-center px-3 py-2 rounded-lg font-['Plus_Jakarta_Sans',sans-serif] text-xs font-semibold transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm translate-x-1 font-bold'
                                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 hover:translate-x-0.5'
                              }`}
                            >
                              <span className="material-symbols-outlined mr-2 text-base text-rose-500/80">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'returns') {
                      if (onNavigate) onNavigate('/admin-returns');
                      return;
                    }
                    setActiveTab(item.id);
                    if (onNavigate) onNavigate(item.id);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm translate-x-1'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:translate-x-1'
                  }`}
                >
                  <span className="material-symbols-outlined mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-4 mt-auto border-t border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={onSwitchView || (() => showToast('Switched to Live Storefront'))}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 mb-4 cursor-pointer"
            >
              Switch View
            </button>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => showToast('Opening Admin Support Desk...')}
                className="w-full flex items-center px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold cursor-pointer rounded-lg text-left"
              >
                <span className="material-symbols-outlined mr-3 text-lg">help</span>
                Support
              </button>
              <button
                type="button"
                onClick={() => showToast('Admin logged out.')}
                className="w-full flex items-center px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold cursor-pointer rounded-lg text-left"
              >
                <span className="material-symbols-outlined mr-3 text-lg">logout</span>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ===================== Main Content Canvas ===================== */}
        <main className="md:ml-64 flex-1 p-3.5 sm:p-6 md:p-8 bg-[#f8f9fb] min-h-screen">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-4 border-b border-slate-200/50">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                Overview Dashboard
              </h2>
              <p className="text-slate-500 font-medium mt-1 text-sm">
                Real-time health of the Curator Luxe ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#e7e8ea] rounded-full px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Live Environment</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('System notification: 28 verifications pending.')}
                aria-label="Notifications"
                className="w-10 h-10 rounded-full bg-[#e1e2e4] hover:bg-slate-300 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
          </header>

          {/* Bento Grid: Platform Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Active Users */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">group</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Active Users
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  1.2M
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">+12%</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#b90041] h-full rounded-full w-[70%]"></div>
              </div>
            </div>

            {/* Verified Sellers */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">verified</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Verified Sellers
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  42.5K
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">+5.4%</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#4d41df] h-full rounded-full w-[45%]"></div>
              </div>
            </div>

            {/* Total GMV */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Total GMV (MTD)
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  $8.4M
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">+18.2%</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#006a34] h-full rounded-full w-[85%]"></div>
              </div>
            </div>

            {/* Daily Active Sessions */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">bolt</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Daily Sessions
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  245K
                </h3>
                <span className="text-rose-500 text-xs font-bold pb-1">-2.1%</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#df2457] h-full rounded-full w-[60%]"></div>
              </div>
            </div>
          </div>

          {/* Urgent Returns, Refunds & SPF Claims Alert Banner (Panel 4) */}
          <section className="bg-gradient-to-r from-rose-50 via-white to-amber-50/50 p-5 rounded-2xl border border-rose-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-[#b90041] text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                <span className="material-symbols-outlined text-2xl">assignment_return</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Return &amp; Refund Settlement Hub (Panel 4)
                  </h3>
                  <span className="bg-[#b90041] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  18 Customer Refunds Awaiting Disbursal (₹84,200) • 3 Supplier SPF Dispute Claims In-Review (₹28,500)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/admin-returns')}
                className="bg-[#b90041] hover:bg-[#a00037] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Open Settlement &amp; SPF Hub</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Middle Section: Growth Chart & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Platform Growth Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                    Platform Growth
                  </h4>
                  <p className="text-sm text-slate-400 mt-0.5">
                    User and reseller expansion over{' '}
                    {timeRange === '30days' ? '30 days' : '6 months'}.
                  </p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-[#f2f4f6] text-xs font-bold text-slate-700 rounded-lg px-3 py-2 border-none outline-none cursor-pointer"
                >
                  <option value="30days">Last 30 Days</option>
                  <option value="6months">Last 6 Months</option>
                </select>
              </div>

              {/* Minimalist SVG Trend Chart */}
              <div className="relative h-60 w-full flex items-end justify-between px-4 pb-2">
                <div className="absolute inset-0 bg-gradient-to-t from-rose-50 to-transparent rounded-xl opacity-30"></div>
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M0,80 Q25,70 50,40 T100,20 L100,100 L0,100 Z"
                    fill="url(#adminGrad)"
                    fillOpacity="0.12"
                  ></path>
                  <path
                    d="M0,80 Q25,70 50,40 T100,20"
                    fill="none"
                    stroke="#b90041"
                    strokeWidth="2.5"
                  ></path>
                  <defs>
                    <linearGradient id="adminGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#b90041', stopOpacity: 1 }}></stop>
                      <stop offset="100%" style={{ stopColor: '#b90041', stopOpacity: 0 }}></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="z-10 text-[10px] text-slate-400 font-bold">W1</div>
                <div className="z-10 text-[10px] text-slate-400 font-bold">W2</div>
                <div className="z-10 text-[10px] text-slate-400 font-bold">W3</div>
                <div className="z-10 text-[10px] text-slate-400 font-bold">W4</div>
              </div>
            </div>

            {/* System Health Indicators */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between">
              <h4 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] mb-6 flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-rose-500">monitor_heart</span>
                System Health
              </h4>

              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-black">Server Uptime</p>
                    <p className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white">
                      99.98%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-500">cloud_done</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-black">API Latency</p>
                    <p className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white">
                      124ms
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 border-t-rose-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-rose-500">timer</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-slate-400 font-bold">Active Support Tickets</span>
                    <span className="text-xs text-rose-400 font-bold">14 Urgent</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-2 flex-1 rounded-full bg-rose-500"></div>
                    <div className="h-2 flex-1 rounded-full bg-rose-500"></div>
                    <div className="h-2 flex-1 rounded-full bg-slate-700"></div>
                    <div className="h-2 flex-1 rounded-full bg-slate-700"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Section: Pending Verifications & Finance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Pending Verifications List */}
            <div className="bg-[#f2f4f6] p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                      Pending Verifications
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Quick triage of identity & business requests</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {verifications.length} Action Required
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('/admin-dropshipper-kyc')}
                      className="px-3 py-1.5 bg-[#b90041] hover:bg-[#960034] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      <span>Dropshipper KYC</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {verifications.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl text-center text-slate-400 text-sm font-semibold">
                      All pending verifications are cleared!
                    </div>
                  ) : (
                    verifications.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-xl flex items-center justify-between group hover:translate-x-1 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-4">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#edeef0] flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                          )}
                          <div>
                            <h5 className="font-bold text-[#191c1e] text-sm">{item.title}</h5>
                            <p className="text-xs text-slate-500 font-medium">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerify(item.id, 'approve')}
                            title="Approve"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerify(item.id, 'reject')}
                            title="Reject"
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined">cancel</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Finance Section: Payout Status */}
            <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] mb-6">
                  Finance &amp; Payouts
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#f8f9fb] p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
                      Scheduled Today
                    </p>
                    <p className="text-2xl font-bold text-[#4d41df] font-['Plus_Jakarta_Sans',sans-serif]">
                      $420,000
                    </p>
                  </div>
                  <div className="bg-[#f8f9fb] p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">
                      Pending Clearance
                    </p>
                    <p className="text-2xl font-bold text-[#b90041] font-['Plus_Jakarta_Sans',sans-serif]">
                      $1.2M
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-600 text-sm">
                          payments
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#191c1e]">
                        Top Tier Resellers
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Processed
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-600 text-sm">
                          pending
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#191c1e]">
                        International Logistics
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      In-Review
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-rose-600 text-sm">
                          history
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#191c1e]">Supplier Refunds</span>
                    </div>
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Generating detailed finance report...')}
                className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 hover:border-[#b90041]/40 transition-colors rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest cursor-pointer"
              >
                Generate Detailed Report
              </button>
            </div>
          </div>

          {/* System-wide Footer */}
          <footer className="flex flex-col md:flex-row justify-between items-center px-4 py-10 w-full mt-16 font-['Inter'] text-xs text-slate-500 border-t border-slate-200/60">
            <p>© 2024 Curator Luxe Social Commerce. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Terms of Service
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Merchant Agreement
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Contact
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminWebPanel;
