import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';
import { getStoredAffiliate, logoutAffiliate, subscribeAffiliateAuth, getAffiliateStats, fetchAffiliateStats } from '../../services/affiliateAuthService';
import { getAffiliateApp } from '../../services/affiliateSessionStore';
import { getStoredCustomer } from '../../services/customerAuthService';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import { getUnreadCount, subscribeNotifications } from '../../services/notificationService';

export default function AffiliateProgramPanel() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBanner, setCopiedBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Affiliate Authentication State
  const [affiliateSession, setAffiliateSession] = useState(() => getStoredAffiliate());

  useEffect(() => {
    const unsub = subscribeAffiliateAuth((sess) => {
      setAffiliateSession(sess || { stats: getAffiliateStats() });
    });
    fetchAffiliateStats().catch(() => {});
    return unsub;
  }, []);

  // KYC Access Guard: User must have Approved KYC to access this panel
  useEffect(() => {
    const customer = getStoredCustomer()?.user;
    const app = getAffiliateApp();
    const storedUser = affiliateSession?.user;

    // Strict ownership check: prevent other users' leftover affiliate sessions
    if (customer) {
      if (app && app.userId && app.userId !== customer.id) {
        logoutAffiliate();
        navigate('/affiliate-kyc', { replace: true });
        return;
      }
      if (
        storedUser &&
        storedUser.id &&
        storedUser.id !== `affiliate_${customer.phone}` &&
        storedUser.email !== customer.email &&
        storedUser.id !== customer.id
      ) {
        logoutAffiliate();
        navigate('/affiliate-kyc', { replace: true });
        return;
      }
    }

    const currentStatus = app?.status || app?.kycStatus || storedUser?.kycStatus;

    if (!app && (!storedUser || storedUser?.kycStatus === 'NOT_SUBMITTED' || !storedUser?.kycStatus)) {
      // User has not submitted KYC yet
      navigate('/affiliate-kyc', { replace: true });
    } else if (currentStatus === 'Under Review' || currentStatus === 'Pending' || currentStatus === 'PENDING') {
      // Submitted but waiting for admin approval
      navigate('/affiliate-kyc-status', { replace: true });
    } else if (currentStatus === 'Rejected' || currentStatus === 'REJECTED') {
      // KYC was rejected
      navigate('/affiliate-kyc-status', { replace: true });
    }
  }, [affiliateSession, navigate]);

  const [unreadNotifs, setUnreadNotifs] = useState(() => getUnreadCount());

  useEffect(() => {
    const unsub = subscribeNotifications(() => {
      setUnreadNotifs(getUnreadCount());
    });
    return unsub;
  }, []);

  const currentAffiliate = affiliateSession?.user;
  const affiliateStats = affiliateSession?.stats || getAffiliateStats();
  
  const affiliateApp = getAffiliateApp();
  const customerUser = getStoredCustomer();
  const customer = customerUser?.user;

  // Resolve real partner name dynamically from KYC submission or customer profile (NO HARDCODED DUMMY)
  const partnerName = (
    affiliateApp?.fullName ||
    currentAffiliate?.fullName ||
    customer?.fullName ||
    customer?.name ||
    JSON.parse(localStorage.getItem('mshoppy_customer_user') || '{}')?.fullName ||
    JSON.parse(localStorage.getItem('user') || '{}')?.fullName ||
    JSON.parse(localStorage.getItem('user') || '{}')?.name ||
    (affiliateApp?.email ? affiliateApp.email.split('@')[0] : '') ||
    (customer?.email ? customer.email.split('@')[0] : '') ||
    'Partner'
  );

  const partnerInitial = partnerName ? partnerName.trim().charAt(0).toUpperCase() : 'P';

  const dynamicFallbackCode = (() => {
    const existing = localStorage.getItem('mshoppy_affiliate_dyn_code');
    if (existing) return existing;
    const prefix = partnerName 
      ? partnerName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()
      : (customer?.email ? customer.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() : 'PARTNER');
    const gen = `AFF-${prefix}${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem('mshoppy_affiliate_dyn_code', gen);
    return gen;
  })();

  const computedCode = currentAffiliate?.referralCode 
    || affiliateApp?.applicationId 
    || dynamicFallbackCode;
  const referralCode = computedCode;

  // Sync real partner identity to affiliate session so all reseller pages use real name
  useEffect(() => {
    if (partnerName && (!currentAffiliate?.fullName || currentAffiliate?.fullName === 'SOVEREIGN' || currentAffiliate?.fullName === 'Sovereign Partner')) {
      const updatedUser = {
        ...(currentAffiliate || {}),
        id: currentAffiliate?.id || affiliateApp?.userId || customer?.id || `affiliate_${Date.now()}`,
        fullName: partnerName,
        email: currentAffiliate?.email || affiliateApp?.email || customer?.email || '',
        phone: currentAffiliate?.phone || affiliateApp?.phone || customer?.phone || '',
        referralCode: referralCode,
        kycStatus: affiliateApp?.status || currentAffiliate?.kycStatus || 'Approved',
        role: 'AFFILIATE',
      };
      localStorage.setItem('mshoppy_affiliate_user', JSON.stringify(updatedUser));
      setAffiliateSession((prev) => ({
        ...(prev || {}),
        user: updatedUser,
      }));
    }
  }, [partnerName, referralCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyBannerLink = (category) => {
    const link = `${window.location.origin}/explorer?ref=${referralCode}&category=${category.toLowerCase()}`;
    navigator.clipboard.writeText(link);
    setCopiedBanner(category);
    setTimeout(() => setCopiedBanner(null), 2000);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutAffiliate();
    navigate('/login?role=affiliate');
  };

  return (
    <div className="bg-[#100d15] text-slate-100 font-sans min-h-screen pb-32 selection:bg-[#f6b630]/30">
      {/* Top Navigation Bar - Full Width */}
      <header className="fixed top-0 z-50 w-full bg-[#100d15]/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-10 lg:px-16 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#f6b630] active:scale-95 transition-transform cursor-pointer"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-[#f6b630] overflow-hidden flex items-center justify-center bg-[#251f33] font-bold text-sm text-[#f6b630]">
              {partnerInitial}
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-[0.05em] uppercase text-[#f6b630] font-['Plus_Jakarta_Sans'] block leading-none">
                {partnerName}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {currentAffiliate?.kycStatus === 'Approved' || affiliateApp?.status === 'Approved' ? 'Verified Partner' : (currentAffiliate?.kycStatus || affiliateApp?.status || 'Verified Partner')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-full hover:bg-[#282430] transition-colors duration-300 active:scale-95 cursor-pointer text-[#f6b630]"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3F6C] rounded-full ring-2 ring-[#100d15] animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
              title="Logout Partner Session"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-16 px-3.5 sm:px-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 min-w-0 w-full max-w-full overflow-hidden">
        {/* Hero: Affiliate Title & Referral Code */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-[#f6b630] font-bold tracking-widest text-xs uppercase">
              Exclusive Affiliate Suite
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Affiliate Partner Panel
            </h1>
          </div>

          {/* Referral Card */}
          <div className="p-[1px] rounded-2xl bg-gradient-to-r from-[#f6b630] via-[#d384f2] to-[#ff6c95] group shadow-2xl">
            <div className="bg-[#1c1724] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 min-w-0 w-full max-w-full">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-gray-400 text-xs font-bold tracking-wider uppercase">
                  Your Unique Referral Partner Code
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-widest font-mono">
                  {referralCode}
                </h2>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-full sm:w-auto bg-gradient-to-r from-[#f6b630] to-[#d49906] text-black font-extrabold px-8 py-4 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg hover:shadow-[#f6b630]/20 cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  {copiedCode ? 'check' : 'content_copy'}
                </span>
                {copiedCode ? 'Copied to Clipboard!' : 'Tap to Copy'}
              </button>
            </div>
          </div>
        </section>

        {/* Performance Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Commission Card */}
          <div className="md:col-span-2 bg-[#1c1724]/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group min-w-0 w-full max-w-full">
            <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#b7004d]/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="bg-[#b7004d]/20 text-[#ff7293] w-fit p-3 rounded-2xl mb-3">
                    <span className="material-symbols-outlined text-2xl">payments</span>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    Earned Commission (Net)
                  </p>
                </div>
                <button
                  onClick={() => navigate('/withdraw-earnings')}
                  className="bg-[#b7004d] hover:bg-[#b7004d]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Withdraw Now →
                </button>
              </div>
              <div>
                <p className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight break-all sm:break-normal">
                  ₹{(affiliateStats?.totalCommission || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  {affiliateStats?.totalCommission > 0
                    ? `₹${affiliateStats.totalCommission} earned via referral sales`
                    : 'Share your referral code to start earning weekly commissions'}
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Stack for smaller stats */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="bg-[#1c1724]/80 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="bg-purple-500/20 text-purple-400 p-3 rounded-2xl">
                <span className="material-symbols-outlined text-2xl">ads_click</span>
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Total Link Clicks</p>
                <p className="text-3xl font-black text-white mt-0.5">{affiliateStats?.clicks || 0}</p>
              </div>
            </div>

            <div className="bg-[#1c1724]/80 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Converted Orders</p>
                <p className="text-3xl font-black text-white mt-0.5">{affiliateStats?.convertedOrders || 0}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity List */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
            <span className="text-xs text-gray-400">Real-time tracker</span>
          </div>
          {Array.isArray(affiliateStats?.recentOrders) && affiliateStats.recentOrders.length > 0 ? (
            <div className="bg-[#1c1724]/90 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
              {affiliateStats.recentOrders.map((act, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                    <span className="material-symbols-outlined text-lg">shopping_bag</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{act.title || 'Referral Order'}</p>
                    <p className="text-xs text-gray-400">{act.time || 'Recently'}</p>
                  </div>
                  <span className="text-sm font-black text-[#f6b630]">+₹{act.commission}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1c1724]/90 border border-white/10 rounded-2xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 text-[#f6b630] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">insights</span>
              </div>
              <p className="text-white font-bold text-sm">No Referral Activity Yet</p>
              <p className="text-gray-400 text-xs">
                Share your referral code <strong className="text-[#f6b630] font-mono">{referralCode}</strong> or promote the campaign links below. Your tracked clicks and commissions will update here in real-time!
              </p>
            </div>
          )}
        </section>

        {/* Marketing Material: Promote Now */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">Promote High-Conversion Campaigns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Campaign Banner 1 */}
            <div className="h-64 relative rounded-3xl overflow-hidden group border border-white/10 shadow-xl">
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Festive Fashion Campaign"
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 p-6 w-full space-y-3">
                <span className="bg-[#b7004d] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Ethnic Festive '26
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">
                  Grand Festive Ethnic Wear (Custom Margin)
                </h4>
                <button
                  onClick={() => handleCopyBannerLink('Ethnic Wear')}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedBanner === 'Ethnic Wear' ? 'check' : 'link'}
                  </span>
                  {copiedBanner === 'Ethnic Wear' ? 'Link Copied!' : 'Copy Campaign Link'}
                </button>
              </div>
            </div>

            {/* Campaign Banner 2 */}
            <div className="h-64 relative rounded-3xl overflow-hidden group border border-white/10 shadow-xl">
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Home Living Campaign"
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 p-6 w-full space-y-3">
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Home Decor
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">
                  Modern Living & Decor Essentials (Custom Margin)
                </h4>
                <button
                  onClick={() => handleCopyBannerLink('Home Decor')}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedBanner === 'Home Decor' ? 'check' : 'link'}
                  </span>
                  {copiedBanner === 'Home Decor' ? 'Link Copied!' : 'Copy Campaign Link'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Shadcn Logout Confirmation Dialog for Affiliate */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Affiliate Partner"
        title="Log out of Affiliate Partner Account?"
        description="Are you sure you want to end your affiliate session? You can sign back in anytime to access your dashboard."
        onConfirm={confirmLogout}
      />
    </div>
  );
}
