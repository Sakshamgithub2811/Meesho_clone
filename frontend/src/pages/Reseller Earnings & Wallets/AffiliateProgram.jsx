import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';
import { getProducts } from '../../services/ecommerceService';
import { getAffiliateStats, fetchAffiliateStats, subscribeAffiliateAuth, getStoredAffiliate } from '../../services/affiliateAuthService';
import { getAffiliateApp } from '../../services/affiliateSessionStore';
import { getStoredCustomer } from '../../services/customerAuthService';

export default function AffiliateProgram() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedToast, setCopiedToast] = useState('');
  const [products, setProducts] = useState([]);

  // Dynamic real wallet and live stats
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('mshoppy_customer_wallet');
      if (saved !== null) return Number(saved);
    } catch (e) {}
    return 0;
  });

  const [affiliateStats, setAffiliateStats] = useState(() => getAffiliateStats());

  useEffect(() => {
    fetchAffiliateStats().then((stats) => {
      if (stats) setAffiliateStats(stats);
      if (typeof stats?.walletBalance === 'number') setWalletBalance(stats.walletBalance);
    }).catch(() => {});

    const unsub = subscribeAffiliateAuth(() => {
      setAffiliateStats(getAffiliateStats());
      try {
        const saved = localStorage.getItem('mshoppy_customer_wallet');
        if (saved !== null) setWalletBalance(Number(saved));
      } catch (e) {}
    });

    const handleStorage = (e) => {
      if (e.key === 'mshoppy_affiliate_stats' || e.key === 'mshoppy_customer_wallet') {
        setAffiliateStats(getAffiliateStats());
        try {
          const saved = localStorage.getItem('mshoppy_customer_wallet');
          if (saved !== null) setWalletBalance(Number(saved));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsub();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    getProducts({ limit: 6 })
      .then((data) => {
        if (data && data.length > 0) setProducts(data);
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = (prod) => {
    const storedAff = getStoredAffiliate();
    const affApp = getAffiliateApp();
    const partnerPrefix = custUser?.user?.fullName 
      ? custUser.user.fullName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()
      : (custUser?.user?.email ? custUser.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() : 'PARTNER');

    const activeRefCode = storedAff?.user?.referralCode 
      || custUser?.user?.storeName
      || affApp?.referralCode 
      || affApp?.applicationId
      || `AFF-${partnerPrefix}100`;
    const affiliateUrl = `${window.location.origin}/product/${prod.id}?ref=${activeRefCode}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedId(prod.id);
    setCopiedToast(`Copied affiliate link for "${prod.title}"! (Ref: ${activeRefCode})`);

    setTimeout(() => {
      setCopiedId(null);
      setCopiedToast('');
    }, 2500);
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/20 min-h-screen pb-32">
      {/* TopAppBar - Full Width */}
      <header className="w-full top-0 sticky z-50 bg-[#F8F9FB] border-b border-gray-100">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-transform duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#191C1E] text-2xl">arrow_back</span>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-lg sm:text-xl tracking-tight text-[#191C1E]">
              Earn with Us
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold text-[#FF3F6C]">Affiliate Program</span>
            <button 
              onClick={() => navigate('/affiliate-panel')} 
              className="active:scale-95 transition-transform duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#191C1E]" data-icon="help_outline">help_outline</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        {copiedToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-2xl text-center shadow-lg animate-fade-in">
            ✅ {copiedToast}
          </div>
        )}

        {/* Wallet / Available Balance Section */}
        <section className="relative overflow-hidden rounded-3xl bg-secondary-container p-6 md:p-8 text-on-secondary-container shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <p className="font-label text-xs uppercase tracking-widest opacity-80 font-bold">
                Available Balance
              </p>
              <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-white">
                ₹{walletBalance.toLocaleString('en-IN')}
              </h2>
              <p className="text-sm opacity-90 text-white/90 font-medium">
                {walletBalance > 0 ? '✓ Ready for withdrawal to linked bank' : 'Share product links below to start earning your custom profit margin'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/withdraw-earnings')}
              className="w-full md:w-auto bg-white text-secondary font-bold px-8 py-4 rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-secondary-container/20 cursor-pointer text-sm"
            >
              Withdraw Commission
            </button>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        </section>

        {/* Overview Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <span className="font-headline font-bold text-on-surface-variant text-sm">Total Sales Generated</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-on-surface">{affiliateStats.totalOrders || 0}</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">Verified partner orders</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="font-headline font-bold text-on-surface-variant text-sm">Lifetime Commission</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-on-surface">₹{(affiliateStats.totalCommission || 0).toLocaleString('en-IN')}</p>
              <p className="text-emerald-600 text-xs font-bold mt-1">Custom Margin Model</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800">
                <span className="material-symbols-outlined">ads_click</span>
              </div>
              <span className="font-headline font-bold text-on-surface-variant text-sm">Link Clicks</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-on-surface">{affiliateStats.clicks || 0}</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">Real-time tracked link visits</p>
            </div>
          </div>
        </section>

        {/* Performance Chart Section */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_12px_32px_rgba(25,28,30,0.04)] border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold">Commission Performance</h3>
              <p className="text-on-surface-variant text-xs mt-0.5">
                {chartPeriod === 'weekly' ? 'Commission earned over the last 7 days' : 'Last 30 days breakdown'}
              </p>
            </div>
            <div className="flex gap-2 bg-surface-container-low p-1 rounded-full">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  chartPeriod === 'daily' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  chartPeriod === 'weekly' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Visualization Bars (Dynamic) */}
          {(() => {
            const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
            const todayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
            const dailyComms = affiliateStats?.dailyCommissions || {};
            const maxDayVal = Math.max(...DAYS.map((d) => dailyComms[d] || 0), 1);
            const hasAnyEarnings = (affiliateStats?.totalCommission || 0) > 0;

            const chartBars = DAYS.map((day) => {
              const val = dailyComms[day] || 0;
              const heightPercent = hasAnyEarnings && val > 0 
                ? Math.max(22, Math.round((val / maxDayVal) * 88)) + '%' 
                : '8%';
              return {
                day,
                height: heightPercent,
                val: `₹${val.toLocaleString('en-IN')}`,
                active: day === todayName,
                hasValue: val > 0
              };
            });

            return (
              <>
                <div className="h-56 w-full flex items-end justify-between gap-2 md:gap-4 px-2 pt-6">
                  {chartBars.map((item) => (
                    <div key={item.day} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                      <span className={`text-[10px] font-bold mb-1.5 transition-opacity ${item.hasValue ? 'opacity-100 text-emerald-600 font-extrabold' : 'opacity-0 group-hover:opacity-100 text-on-surface-variant'}`}>
                        {item.val}
                      </span>
                      <div 
                        style={{ height: item.height }} 
                        className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ${
                          item.hasValue
                            ? (item.active ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-emerald-500 hover:bg-emerald-600')
                            : (item.active ? 'bg-primary/30' : 'bg-surface-container-high group-hover:bg-primary/20')
                        }`}
                      />
                      <p className={`text-[11px] text-center mt-2 font-bold ${item.active ? 'text-primary font-black' : 'text-on-surface-variant'}`}>
                        {item.day}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Status Insight Banner */}
                {!hasAnyEarnings ? (
                  <div className="mt-5 p-3.5 bg-surface-container-low rounded-2xl border border-gray-100 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">insights</span>
                    <span>No margin earned yet this week. Share any product link below to start earning your custom margin on every purchase!</span>
                  </div>
                ) : (
                  <div className="mt-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base text-emerald-600">trending_up</span>
                    <span>Live Performance: ₹{affiliateStats.totalCommission.toLocaleString('en-IN')} earned across {affiliateStats.convertedOrders || 1} verified referral sale(s)!</span>
                  </div>
                )}
              </>
            );
          })()}
        </section>

        {/* Active High-Commission Products */}
        <section className="space-y-4">
          <div>
            <h3 className="font-headline text-xl font-bold">Trending for Affiliates</h3>
            <p className="text-on-surface-variant text-xs">Products with highest commission multiplier</p>
          </div>

          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-slate-400">
                Loading live catalog products for affiliate links...
              </div>
            ) : (
              products.map((prod) => {
                const isCopied = copiedId === prod.id;
                const prodImage = prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
                const estCommission = 150;

                return (
                  <div
                    key={prod.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md"
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" alt={prod.title} src={prodImage} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface text-sm truncate">{prod.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Custom Margin
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          Set margin (e.g. +₹{estCommission}) • Base: ₹{prod.price}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink(prod)}
                      className={`transition-all px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isCopied ? 'check' : 'link'}
                      </span>
                      {isCopied ? 'Copied!' : 'Get Link'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
