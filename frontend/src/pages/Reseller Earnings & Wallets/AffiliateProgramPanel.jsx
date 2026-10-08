import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';
import { getStoredAffiliate, logoutAffiliate, subscribeAffiliateAuth } from '../../services/affiliateAuthService';

export default function AffiliateProgramPanel() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBanner, setCopiedBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Affiliate Authentication State
  const [affiliateSession, setAffiliateSession] = useState(() => getStoredAffiliate());

  useEffect(() => {
    const unsub = subscribeAffiliateAuth((sess) => {
      setAffiliateSession(sess);
    });
    return unsub;
  }, []);

  const currentAffiliate = affiliateSession?.user;
  const affiliateStats = affiliateSession?.stats;
  const referralCode = currentAffiliate?.referralCode || "MEESHO500";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyBannerLink = (category) => {
    const link = `https://meesho.com/campaign/${category.toLowerCase()}?aff=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedBanner(category);
    setTimeout(() => setCopiedBanner(null), 2000);
  };

  const handleLogout = () => {
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
              {currentAffiliate?.fullName ? currentAffiliate.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-[0.05em] uppercase text-[#f6b630] font-['Plus_Jakarta_Sans'] block leading-none">
                {currentAffiliate?.fullName || 'SOVEREIGN'}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {currentAffiliate?.kycStatus ? `KYC: ${currentAffiliate.kycStatus}` : 'Verified Partner'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="material-symbols-outlined text-[#f6b630] hover:bg-[#282430] transition-colors duration-300 p-2 rounded-full active:scale-95 transition-transform cursor-pointer"
              title="Notifications"
            >
              notifications
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
              title="Logout Partner Session"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto space-y-8">
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
            <div className="bg-[#1c1724] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
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
          <div className="md:col-span-2 bg-[#1c1724]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
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
                <p className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  ₹12,450.50
                </p>
                <p className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +₹2,450 earned in the last 7 days
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
                <p className="text-3xl font-black text-white mt-0.5">1,240</p>
              </div>
            </div>

            <div className="bg-[#1c1724]/80 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:border-white/20 transition-all">
              <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Converted Orders</p>
                <p className="text-3xl font-black text-white mt-0.5">84</p>
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
          <div className="bg-[#1c1724]/90 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
            <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <span className="material-symbols-outlined text-lg">person_add</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">New registration via link</p>
                <p className="text-xs text-gray-400">10m ago • Referral Network</p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Order placed by Rahul V.</p>
                <p className="text-xs text-gray-400">2h ago • Kurti Catalog</p>
              </div>
              <span className="text-sm font-black text-[#f6b630]">+₹150</span>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Order placed by Priya S.</p>
                <p className="text-xs text-gray-400">5h ago • Silk Saree Catalog</p>
              </div>
              <span className="text-sm font-black text-[#f6b630]">+₹250</span>
            </div>
          </div>
        </section>

        {/* Marketing Material: Promote Now */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">Promote High-Conversion Campaigns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Campaign Banner 1 */}
            <div className="h-64 relative rounded-3xl overflow-hidden group border border-white/10 shadow-xl">
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Fashion Campaign"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJBu2Q0VHbgQcCdjY9oKLJTtMW9mnbg56JY2XvO2mPM7uJ7LM4K-Q_BAyfcIflU5Nw4UStZ5p8dBDgvVcVIeP6IRTow2G-cEVJjkNfMagoj8tp6cDJ0CBIs58ck8Nns2LEpRm4dnudeY9mheaR6h8_rNoyUG0NDcGuQvimcDp0xfs_mMQOK9Mz_F1mNxCFPXigHyU1Icegk54RiNs7igqXiDR7WMwQZ_Ap8D54rFksf8hLzAiBFTluSfWUE1LUXGrLYrDM2UNJSXU"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 p-6 w-full space-y-3">
                <span className="bg-[#b7004d] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Ethnic Festive '26
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">
                  Grand Festive Ethnic Wear (15% Commission)
                </h4>
                <button
                  onClick={() => handleCopyBannerLink('FestiveFashion')}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedBanner === 'FestiveFashion' ? 'check' : 'link'}
                  </span>
                  {copiedBanner === 'FestiveFashion' ? 'Link Copied!' : 'Copy Campaign Link'}
                </button>
              </div>
            </div>

            {/* Campaign Banner 2 */}
            <div className="h-64 relative rounded-3xl overflow-hidden group border border-white/10 shadow-xl">
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Home Living Campaign"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHqKClIM-SdwJTWo2EKQbZ5UcZLq50pmwHKw_Rj8hQiuPwDrHomg_bIfFz__z3jhw8C0Y5fZWuGPIGz2EFgxWC4oS33OUGNynw8DK4ViJmqkd53YtPRcEdRnkKEMvNEHFfCCS9UPOycYszZ3GdPP04O6o0-tWPfCIGVhH5nY0ADvwnE9-dSVAu8x6F1Ca_GIAeNSrFXM4aGp0OHYB6Jjk_eO1n2Frf2Qpt5PfkN_ferdZmZ4HFpAhFKrJvkC6buR5a_hso3WVyeJs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 p-6 w-full space-y-3">
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Home Decor
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">
                  Modern Living & Decor Essentials (18% Comm)
                </h4>
                <button
                  onClick={() => handleCopyBannerLink('HomeLiving')}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedBanner === 'HomeLiving' ? 'check' : 'link'}
                  </span>
                  {copiedBanner === 'HomeLiving' ? 'Link Copied!' : 'Copy Campaign Link'}
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
    </div>
  );
}
