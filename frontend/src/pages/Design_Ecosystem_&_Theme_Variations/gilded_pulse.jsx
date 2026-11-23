import { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const MARKETING_BANNERS = [
  {
    id: 'banner-1',
    category: 'Fashion',
    title: "Summer Essentials '24",
    tagColor: 'bg-[#ff6c95]/90 text-white',
    link: 'https://app.mshoppy.com/category/fashion',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJBu2Q0VHbgQcCdjY9oKLJTtMW9mnbg56JY2XvO2mPM7uJ7LM4K-Q_BAyfcIflU5Nw4UStZ5p8dBDgvVcVIeP6IRTow2G-cEVJjkNfMagoj8tp6cDJ0CBIs58ck8Nns2LEpRm4dnudeY9mheaR6h8_rNoyUG0NDcGuQvimcDp0xfs_mMQOK9Mz_F1mNxCFPXigHyU1Icegk54RiNs7igqXiDR7WMwQZ_Ap8D54rFksf8hLzAiBFTluSfWUE1LUXGrLYrDM2UNJSXU',
  },
  {
    id: 'banner-2',
    category: 'Home Decor',
    title: 'Artisan Interiors',
    tagColor: 'bg-[#d384f2]/90 text-white',
    link: 'https://app.mshoppy.com/category/home-decor',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHqKClIM-SdwJTWo2EKQbZ5UcZLq50pmwHKw_Rj8hQiuPwDrHomg_bIfFz__z3jhw8C0Y5fZWuGPIGz2EFgxWC4oS33OUGNynw8DK4ViJmqkd53YtPRcEdRnkKEMvNEHFfCCS9UPOycYszZ3GdPP04O6o0-tWPfCIGVhH5nY0ADvwnE9-dSVAu8x6F1Ca_GIAeNSrFXM4aGp0OHYB6Jjk_eO1n2Frf2Qpt5PfkN_ferdZmZ4HFpAhFKrJvkC6buR5a_hso3WVyeJs',
  },
  {
    id: 'banner-3',
    category: 'Electronics',
    title: 'The Tech Edit',
    tagColor: 'bg-[#f6b630]/90 text-[#513800]',
    link: 'https://app.mshoppy.com/category/electronics',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCpdgQyV7Ci5uKJv3HZuZ1PSS0q_93YL7dC6T4s3QiqfMjNaJcDRyNya8jnKNMaNhLmNwQUpz1Ow8PmiT6SFKFEpq5dI68S8aEH9iAOv07QWDjRhf-BDpiiBQVfBVb7538jvwYtsGl0hkTEknRYkX47bzlvK4atuyTXC1GI4mNcrQG42SpmKOQDOgvfvzLwkutQ3dXDkveY3yq9RXf8Qgt1WTHDZKNP1M0mL0M7jVyrofDtENV2jqwNf-yoLnTb65sUOZ0dGzs7Jo8',
  },
];

const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'New registration via link',
    subtitle: '10m ago • Referral Network',
    icon: 'person_add',
    iconColor: 'text-[#f6b630]',
    amount: null,
  },
  {
    id: 'act-2',
    title: 'Order placed by Rahul V.',
    subtitle: '2h ago • Product Purchase',
    icon: 'shopping_bag',
    iconColor: 'text-[#d384f2]',
    amount: '+₹150',
  },
  {
    id: 'act-3',
    title: 'Order placed by Priya S.',
    subtitle: '5h ago • Product Purchase',
    icon: 'shopping_bag',
    iconColor: 'text-[#d384f2]',
    amount: '+₹250',
  },
  {
    id: 'act-4',
    title: 'Affiliate Tier Bonus Credited',
    subtitle: '1d ago • Sovereign Club',
    icon: 'workspace_premium',
    iconColor: 'text-[#f6b630]',
    amount: '+₹1,000',
  },
];

export default function GildedPulse({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('insight');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [showAllActivities, setShowAllActivities] = useState(false);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('mshoppy_customer_user') || localStorage.getItem('mshoppy_affiliate_user') || localStorage.getItem('user') || '{}');
    } catch (_) { return {}; }
  })();
  const referralCode = storedUser?.storeName || (storedUser?.phone ? `MSHOPPY${storedUser.phone.slice(-4)}` : 'MSHOPPYVIP');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const copyToClipboard = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCode(true);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const displayedActivities = showAllActivities
    ? INITIAL_ACTIVITIES
    : INITIAL_ACTIVITIES.slice(0, 3);

  return (
    <div className="bg-[#100d15] text-[#f6eefa] min-h-screen selection:bg-[#f6b630]/30 font-['Plus_Jakarta_Sans'] relative antialiased pb-36">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-50 w-full bg-[#100d15]/85 backdrop-blur-2xl border-b border-[#282430]/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#f6b630] overflow-hidden shadow-[0_0_15px_rgba(246,182,48,0.3)]">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK9YSzbRRSYTaQiWJZ1dm_Ye5gldfqy5u0Z0etgsxeMtwjplczxXy70QTK8Qy52xs8fkz-3AJ3nNh5YFYite-g888hA9W9UZ7oOqgdkOIT_O9V67f27v1P2ybtEwsnIoFwuSs_Pji9FnQpXcgoz1yb31vUTkvo5RIxmZPDMkjDgFKkg7X5RCaoUuU9pcwp31zCd_AiMlZrOYi3Wsl5mKnfSZpwskBiNESpFDbYuwlDhOotskYOvmsucDjG1VwNv0qys41yaVo7qaY"
              />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-[0.08em] uppercase text-[#f6b630] leading-none block">
                SOVEREIGN
              </span>
              <span className="text-[9px] font-bold text-[#afa9b4] uppercase tracking-widest">
                Gilded Pulse • Elite Partner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Gold Tier privileges active: 15% Extra Margin')}
              className="hidden sm:flex items-center gap-1.5 bg-[#f6b630]/10 border border-[#f6b630]/30 text-[#f6b630] px-3 py-1 rounded-full text-xs font-bold"
            >
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>Gold Member</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('You have 2 new commission alerts!')}
              className="material-symbols-outlined text-[#f6b630] hover:bg-[#282430] p-2.5 rounded-full active:scale-95 transition-all relative cursor-pointer"
              title="Alerts"
            >
              notifications
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff6c95]"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        {/* Hero: Affiliate Title & Referral Code */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[#f6b630] font-extrabold tracking-widest text-xs uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f6b630] animate-ping"></span>
                Premium Partner Network
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
                Affiliate Program
              </h1>
            </div>

            {/* Time Filter Chips */}
            <div className="flex items-center bg-[#1c1822] p-1 rounded-xl border border-[#282430] text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTimeRange('last7')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  timeRange === 'last7' ? 'bg-[#f6b630] text-[#513800]' : 'text-[#afa9b4]'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('thisMonth')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  timeRange === 'thisMonth' ? 'bg-[#f6b630] text-[#513800]' : 'text-[#afa9b4]'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('allTime')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  timeRange === 'allTime' ? 'bg-[#f6b630] text-[#513800]' : 'text-[#afa9b4]'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Referral Card (Gradient Border with High-End Night Interior) */}
          <div className="bg-gradient-to-br from-[#f6b630] via-[#d49906] to-[#8E44AD] p-[1.5px] rounded-3xl group shadow-[0_12px_35px_rgba(0,0,0,0.6)]">
            <div className="bg-[#15121b] rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-[#afa9b4] text-xs font-bold tracking-wider uppercase">
                  Your Unique Referral Code
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-widest font-mono">
                    {referralCode}
                  </h2>
                  <span className="bg-[#ff6c95]/20 text-[#ff6c95] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    10% Bonus Rate
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(referralCode, 'Referral code')}
                className="w-full sm:w-auto bg-gradient-to-r from-[#f6b630] to-[#d49906] hover:from-[#f7c048] hover:to-[#e0a40d] text-[#513800] font-black px-8 py-4 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_10px_25px_rgba(246,182,48,0.25)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {copiedCode ? 'check' : 'content_copy'}
                </span>
                <span>{copiedCode ? 'Copied!' : 'Tap to Copy'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Performance Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Commission Card - Large (Glass Hero) */}
          <div className="md:col-span-2 bg-[#221e29]/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden group border border-[#4b4650]/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#f6b630]/15 rounded-full blur-3xl group-hover:bg-[#f6b630]/25 transition-all pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="bg-[#f6b630]/15 text-[#f6b630] w-fit p-3 rounded-2xl mb-3 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">payments</span>
                  </div>
                  <p className="text-[#afa9b4] font-extrabold uppercase tracking-widest text-xs">
                    Earned Commission
                  </p>
                </div>

                <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+28.4% this week</span>
                </span>
              </div>

              <div>
                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter">
                  {timeRange === 'last7'
                    ? '₹3,840.00'
                    : timeRange === 'allTime'
                    ? '₹48,920.80'
                    : '₹12,450.50'}
                </p>
                <p className="text-xs text-[#afa9b4] mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#f6b630]">
                    account_balance_wallet
                  </span>
                  <span>Next payout automatically dispatches on Tuesday</span>
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Stack for smaller stats */}
          <div className="space-y-4 sm:space-y-6 flex flex-col justify-between">
            <div className="bg-[#221e29]/70 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 flex items-center gap-4 border border-[#4b4650]/20 hover:bg-[#2f2a37] transition-all shadow-md">
              <div className="bg-[#d384f2]/15 text-[#d384f2] p-3 rounded-2xl">
                <span className="material-symbols-outlined text-2xl">analytics</span>
              </div>
              <div>
                <p className="text-[#afa9b4] text-[10px] font-bold uppercase tracking-widest">
                  Link Clicks
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white">1,240</p>
                <span className="text-[10px] text-emerald-400 font-bold">+14% conversion pace</span>
              </div>
            </div>

            <div className="bg-[#221e29]/70 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 flex items-center gap-4 border border-[#4b4650]/20 hover:bg-[#2f2a37] transition-all shadow-md">
              <div className="bg-[#ff6c95]/15 text-[#ff6c95] p-3 rounded-2xl">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div>
                <p className="text-[#afa9b4] text-[10px] font-bold uppercase tracking-widest">
                  Completed Conversions
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white">84</p>
                <span className="text-[10px] text-[#f6b630] font-bold">6.8% conversion rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity List */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
              <p className="text-xs text-[#afa9b4]">Real-time commission and click stream</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllActivities(!showAllActivities)}
              className="text-[#f6b630] hover:text-[#ffd276] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              {showAllActivities ? 'Show Less' : 'View All'}
            </button>
          </div>

          <div className="bg-[#221e29]/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-[#4b4650]/20 shadow-lg">
            <div className="divide-y divide-[#4b4650]/15">
              {displayedActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 sm:p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#282430] flex items-center justify-center shrink-0">
                    <span className={`material-symbols-outlined ${act.iconColor}`}>
                      {act.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{act.title}</p>
                    <p className="text-xs text-[#afa9b4] truncate">{act.subtitle}</p>
                  </div>
                  {act.amount && (
                    <div className="text-right shrink-0">
                      <span className="text-[#f6b630] font-black text-base">{act.amount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marketing Material: Promote Now (Horizontal Snap Carousel) */}
        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Promote Now</h3>
            <p className="text-xs text-[#afa9b4]">
              High-converting curated campaign packs ready to share
            </p>
          </div>

          <div className="flex overflow-x-auto gap-5 hide-scrollbar pb-3 snap-x scroll-smooth">
            {MARKETING_BANNERS.map((banner) => (
              <div
                key={banner.id}
                className="snap-start flex-shrink-0 w-72 sm:w-80 h-96 relative rounded-3xl overflow-hidden group shadow-xl border border-[#4b4650]/20"
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={banner.title}
                  src={banner.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#100d15]/50 to-transparent"></div>

                <div className="absolute bottom-0 p-6 w-full space-y-3">
                  <div>
                    <span
                      className={`${banner.tagColor} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm inline-block`}
                    >
                      {banner.category}
                    </span>
                    <h4 className="text-xl font-black text-white mt-2 leading-tight">
                      {banner.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(banner.link, `${banner.title} link`)}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-3 rounded-full hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    <span>Copy Share Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Share Action Button */}
      <div className="fixed bottom-24 left-0 w-full px-6 z-40 max-w-lg left-1/2 -translate-x-1/2">
        <button
          type="button"
          onClick={() => {
            copyToClipboard(
              `https://meesho.com/app?ref=${referralCode}`,
              'Affiliate invite link'
            );
          }}
          className="w-full bg-gradient-to-r from-[#f6b630] via-[#e5a61e] to-[#d49906] hover:brightness-110 text-[#513800] font-black py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(246,182,48,0.4)] active:scale-95 transition-all cursor-pointer text-sm sm:text-base tracking-wide uppercase"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            share
          </span>
          <span>Share Referral Link</span>
        </button>
      </div>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" onNavigate={onNavigate} />
    </div>
  );
}
