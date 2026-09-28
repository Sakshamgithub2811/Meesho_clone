import React, { useState } from 'react';

const TIMEFRAME_DATA = {
  '30days': {
    label: 'Last 30 Days',
    gmv: '₹4,28,45,200',
    gmvDiff: '+12.5%',
    gmvSub: 'vs. ₹3,80,12,000 MoM',
    orders: '128,450',
    ordersDiff: '+8.2%',
    ordersSub: 'vs. 118,600 WoW',
    users: '1.2M',
    usersDiff: '-2.4%',
    usersDiffType: 'down',
    usersSub: 'vs. 1.25M MoM',
    convRate: '4.28%',
    convDiff: '+0.8%',
    convSub: 'vs. 3.48% MoM',
    resellerRev: '68%',
    resellerRevVal: '₹2.91 Cr',
    directRev: '32%',
    directRevVal: '₹1.37 Cr',
    chartGmv: [25, 40, 35, 50, 60, 80, 92],
    chartOrders: [30, 25, 42, 50, 62, 52, 70],
  },
  quarter: {
    label: 'Last Quarter',
    gmv: '₹12,85,60,000',
    gmvDiff: '+18.4%',
    gmvSub: 'vs. ₹10.8 Cr prev Qtr',
    orders: '382,900',
    ordersDiff: '+14.1%',
    ordersSub: 'vs. 335,000 prev Qtr',
    users: '3.4M',
    usersDiff: '+6.8%',
    usersDiffType: 'up',
    usersSub: 'vs. 3.18M prev Qtr',
    convRate: '4.62%',
    convDiff: '+1.2%',
    convSub: 'vs. 3.42% prev Qtr',
    resellerRev: '71%',
    resellerRevVal: '₹9.12 Cr',
    directRev: '29%',
    directRevVal: '₹3.73 Cr',
    chartGmv: [30, 48, 52, 65, 75, 88, 96],
    chartOrders: [35, 40, 50, 60, 70, 65, 85],
  },
  ytd: {
    label: 'Year to Date',
    gmv: '₹48,90,00,000',
    gmvDiff: '+34.2%',
    gmvSub: 'vs. ₹36.4 Cr FY25',
    orders: '1,450,000',
    ordersDiff: '+28.5%',
    ordersSub: 'vs. 1.12M FY25',
    users: '8.7M',
    usersDiff: '+15.2%',
    usersDiffType: 'up',
    usersSub: 'vs. 7.55M FY25',
    convRate: '4.75%',
    convDiff: '+1.4%',
    convSub: 'vs. 3.35% FY25',
    resellerRev: '73%',
    resellerRevVal: '₹35.7 Cr',
    directRev: '27%',
    directRevVal: '₹13.2 Cr',
    chartGmv: [40, 55, 62, 70, 82, 90, 100],
    chartOrders: [45, 52, 58, 68, 76, 80, 92],
  },
};

const SUPPLIERS_DATA = [
  {
    id: '#SUP-9902',
    name: 'Vardhman Fabrics',
    category: 'Women Ethnic',
    orders: '12,450',
    revenue: '₹42.5L',
    rating: 4.8,
    status: 'Top Rated',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA2PL0cfsYUGOw32XJdmMDef2VYVzHqYPFvFPk-Z6iKTN-sgNy03dwZ0jth_C8lcNIF2s76h6sxnVrmY3yvETMo-woQT4BLGpMA_YYdYcS_j6VQiq2WmbUZrY3d_UWW2ceJUqD8c0EzDTA2eDUPzdu2BJzqC7V7qZ7VrKnmz0nzUMpsUoOvM2R6dFvwdC6moT1a3g2vrvc-S31Pn2Ib5Q358pzUfpp30VfB1Ky00MiK8R14kpZRQWPw1iAkVpSrEHda7uX-t1F9MU',
  },
  {
    id: '#SUP-7721',
    name: 'NexGen Electronics',
    category: 'Accessories',
    orders: '8,120',
    revenue: '₹38.2L',
    rating: 4.6,
    status: 'Growing',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB72pPn8fCDvbmXln8_xjNx6cjhONMZkwXCcNXcxviAx1ABLbBygfl8MHNIfhOICTTgfubomye_TuF4YhS9syUj4Up9kNqvsOZdThwdoKCAAKiVFgrzuqW-8HYzJ-GT3GM5pqRVKWRhl-65-z-dxv_45Fx6kq2XKE8Q6EpQIDbkfbxhAC5cs1ItREja9msttRLY1PvymUpqHlZlBwz-ABAvk2nj4qbYvnx3MVyFt-MKKm4tD0tN5BNewSs2kc-qdlCIS4wr9JpT5QY',
  },
  {
    id: '#SUP-5541',
    name: 'Glow Lifestyle',
    category: 'Beauty',
    orders: '7,600',
    revenue: '₹18.9L',
    rating: 4.9,
    status: 'Top Rated',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX0yfpcCfqD-VMXp8DYja2GvwFwkCUdLFrXi03ufJiaiAgszbIUeascEjSgzu9wBVVZdZavz_Eg40mJTjNgmyTiadbr0KngtAE2FIYcHihkjh3Np9DGDrks3v0NFmeQtvaZHWYlFDO9gj8LV6xs1d2_5at6eT362OrSJWhXCllf_kund-MQ6wGSCtOMYE77VbD5hlTEpMhAjggsTdTC31tkKA9Lc5-5vSz4-hBopOlcHsw7_kLmtRs-ONr4oL0cMdhDE8J-SCjfPM',
  },
  {
    id: '#SUP-4190',
    name: 'Surat Silk Mills',
    category: 'Sarees',
    orders: '15,890',
    revenue: '₹56.4L',
    rating: 4.7,
    status: 'Top Rated',
    logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&auto=format&fit=crop&q=80',
  },
];

export function PerformanceAnalyticsDashboardAdmin({ onNavigate, onBack }) {
  const [timeframe, setTimeframe] = useState('30days');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeData = TIMEFRAME_DATA[timeframe];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast(`Exported ${activeData.label} analytics report (PDF/CSV)!`);
    }, 1200);
  };

  const filteredSuppliers = SUPPLIERS_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">insights</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="sticky top-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200/70">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('/admin-panel') : window.history.back())}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700 cursor-pointer shrink-0 transition-colors flex items-center justify-center"
                aria-label="Back to Admin Panel"
                title="Back to Admin Panel"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onNavigate && onNavigate('/admin-panel')}
              >
                <span className="text-xl font-bold tracking-tight text-[#FF3F6C]">
                  Digital Curator Admin
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  Analytics
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-xl gap-2 w-80">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-700"
                placeholder="Search analytics, GMV, suppliers..."
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast('All systems operating at 99.98% uptime.')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Curator Enterprise Analytics documentation')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 ml-1">
              <img
                alt="Admin profile photo"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3HrgApGfJfAyWfi8T0VNTrBTX9pfFhoFHWlA3F3qQUInZVC9bIqXLHbXzTBmB4OZ5shrBMdYGdSNqVIKHs4Oa2RHNwSk5mYfBNHsoT5MNmqlj7dcdkPSb3TCjIIUDgPvBS09pPbjkF9HZ5gBEBYh4j6AbH2VFlyfswsivN01Tf6jlHBcZ-hPSSDXMVUi44h9emOeTu_uwPRJRet6-4PKDJgHmxOZApGrBu3DpFWFvruhH0JVjHCYEOv0kJTDf6coZ5Qeby4eYp38"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ===================== SideNavBar ===================== */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-slate-50 dark:bg-slate-950 p-4 space-y-2 sticky top-[61px] h-[calc(100vh-61px)] flex-shrink-0 z-30 font-['Inter',sans-serif] text-sm">
          <div className="px-4 mb-6 pt-2">
            <h2 className="text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Curator Admin
            </h2>
            <p className="text-xs text-slate-500">Enterprise Suite</p>
          </div>

          <nav className="flex-1 space-y-1.5 px-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/admin-panel')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-all cursor-pointer font-medium text-left"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Overview Dashboard</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-rose-50 text-[#FF3F6C] rounded-xl font-bold cursor-pointer text-left shadow-xs"
            >
              <span className="material-symbols-outlined text-xl">analytics</span>
              <span>Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('orders')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-all cursor-pointer font-medium text-left"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              <span>Orders</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('catalog')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-all cursor-pointer font-medium text-left"
            >
              <span className="material-symbols-outlined text-xl">inventory_2</span>
              <span>Suppliers & Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('resellers')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-all cursor-pointer font-medium text-left"
            >
              <span className="material-symbols-outlined text-xl">group</span>
              <span>Resellers</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('campaigns')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-all cursor-pointer font-medium text-left"
            >
              <span className="material-symbols-outlined text-xl">campaign</span>
              <span>Marketing Campaigns</span>
            </button>
          </nav>

          <div className="px-2 mt-auto space-y-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-[#FF3F6C] hover:bg-[#e0355e] text-white py-2.5 rounded-xl font-bold shadow-md shadow-rose-200/50 transition-all active:scale-95 cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-sm">
                {isExporting ? 'hourglass_top' : 'download'}
              </span>
              <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Settings panel')}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>Exit Console</span>
            </button>
          </div>
        </aside>

        {/* ===================== Main Content ===================== */}
        <main className="flex-1 p-6 md:p-10 bg-[#f2f4f6]/60 overflow-y-auto">
          {/* Header section with Timeframe switcher */}
          <header className="mb-8 flex flex-wrap justify-between items-end gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  Performance Analytics
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Live Data
                </span>
              </div>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Real-time ecosystem health and growth metrics across reseller transactions.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200">
              {[
                { id: '30days', label: 'Last 30 Days' },
                { id: 'quarter', label: 'Last Quarter' },
                { id: 'ytd', label: 'Year to Date' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeframe(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeframe === tab.id
                      ? 'bg-[#b90041] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* 1. Overview Metrics (Bento Grid) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Real-time GMV */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 border-b-4 border-b-[#b90041] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-rose-50 rounded-xl text-[#b90041]">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  {activeData.gmvDiff}
                </span>
              </div>
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Real-time GMV
              </h3>
              <p className="text-2xl font-black text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                {activeData.gmv}
              </p>
              <p className="text-xs text-slate-400 mt-1">{activeData.gmvSub}</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 border-b-4 border-b-[#4d41df] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-[#4d41df]">
                  <span className="material-symbols-outlined text-xl">shopping_bag</span>
                </div>
                <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  {activeData.ordersDiff}
                </span>
              </div>
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Total Orders
              </h3>
              <p className="text-2xl font-black text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                {activeData.orders}
              </p>
              <p className="text-xs text-slate-400 mt-1">{activeData.ordersSub}</p>
            </div>

            {/* Active Users */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 border-b-4 border-b-[#008644] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-[#008644]">
                  <span className="material-symbols-outlined text-xl">group</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                    activeData.usersDiffType === 'down'
                      ? 'text-rose-700 bg-rose-50'
                      : 'text-emerald-700 bg-emerald-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {activeData.usersDiffType === 'down' ? 'trending_down' : 'trending_up'}
                  </span>
                  {activeData.usersDiff}
                </span>
              </div>
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Active Resellers
              </h3>
              <p className="text-2xl font-black text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                {activeData.users}
              </p>
              <p className="text-xs text-slate-400 mt-1">{activeData.usersSub}</p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 border-b-4 border-b-amber-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <span className="material-symbols-outlined text-xl">ads_click</span>
                </div>
                <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  {activeData.convDiff}
                </span>
              </div>
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Conversion Rate
              </h3>
              <p className="text-2xl font-black text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                {activeData.convRate}
              </p>
              <p className="text-xs text-slate-400 mt-1">{activeData.convSub}</p>
            </div>
          </section>

          {/* 2. Growth Trends Chart & Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Multi-line / Interactive Growth Trends */}
            <section className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-xs border border-slate-100">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Growth Trends (GMV & Orders)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Showing daily velocity across selected timeframe
                  </p>
                </div>
                <div className="flex gap-4 items-center bg-slate-50 px-3 py-1.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#b90041]"></span>
                    <span className="font-semibold text-slate-700">GMV Trajectory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4d41df]"></span>
                    <span className="font-semibold text-slate-700">Order Volume</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Simulated Chart */}
              <div className="relative h-64 w-full bg-slate-50/80 rounded-2xl overflow-hidden border border-slate-100 flex items-end px-6 gap-3 pt-6">
                {activeData.chartGmv.map((heightPercent, idx) => {
                  const ordersPercent = activeData.chartOrders[idx];
                  const dayLabels = ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Today'];
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Tooltip */}
                      {hoveredPoint === idx && (
                        <div className="absolute -top-14 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none">
                          <div className="font-bold text-pink-300">{dayLabels[idx]}</div>
                          <div>GMV: ~₹{(heightPercent * 60000).toLocaleString('en-IN')}</div>
                          <div>Orders: {ordersPercent * 180}</div>
                        </div>
                      )}

                      {/* Bar 1: GMV */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-[#b90041]/20 to-[#b90041] rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs relative"
                      >
                        <div className="absolute inset-x-0 -top-1.5 h-1.5 bg-[#b90041] rounded-full shadow-xs"></div>
                      </div>

                      {/* Bar 2 / Marker: Orders Line overlay */}
                      <div
                        style={{ bottom: `${ordersPercent}%` }}
                        className="absolute w-3 h-3 bg-[#4d41df] rounded-full ring-2 ring-white shadow-xs pointer-events-none transition-all duration-300"
                      ></div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-4 px-3 text-[11px] font-bold text-slate-400">
                <span>DAY 1</span>
                <span>DAY 5</span>
                <span>DAY 10</span>
                <span>DAY 15</span>
                <span>DAY 20</span>
                <span>DAY 25</span>
                <span className="text-[#b90041] font-black">TODAY (LIVE)</span>
              </div>
            </section>

            {/* Revenue Breakdown */}
            <section className="bg-white p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6 text-slate-900 font-['Plus_Jakarta_Sans']">
                  Revenue Breakdown
                </h2>

                <div className="space-y-6">
                  {/* Resellers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="py-0.5 px-2 uppercase rounded-full text-[#b90041] bg-rose-50 tracking-wide">
                        Resellers Channel
                      </span>
                      <span className="text-[#b90041] text-sm font-black">{activeData.resellerRev}</span>
                    </div>
                    <div className="overflow-hidden h-2.5 rounded-full bg-rose-50">
                      <div
                        className="h-full bg-[#b90041] rounded-full transition-all duration-500"
                        style={{ width: activeData.resellerRev }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500">
                      {activeData.resellerRevVal} processed via 15,200 active resellers
                    </p>
                  </div>

                  {/* Direct Customers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="py-0.5 px-2 uppercase rounded-full text-[#4d41df] bg-indigo-50 tracking-wide">
                        Direct Marketplace
                      </span>
                      <span className="text-[#4d41df] text-sm font-black">{activeData.directRev}</span>
                    </div>
                    <div className="overflow-hidden h-2.5 rounded-full bg-indigo-50">
                      <div
                        className="h-full bg-[#4d41df] rounded-full transition-all duration-500"
                        style={{ width: activeData.directRev }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500">
                      {activeData.directRevVal} from organic search and app traffic
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof Impact Card */}
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mt-6 border border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#b90041] shadow-xs flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">share_reviews</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Social Commerce Impact</p>
                  <p className="text-[11px] text-slate-500">
                    Reseller WhatsApp catalogs drove 42% of total conversions this week.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* 3. Category Distribution & 4. Regional Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Performance */}
            <section className="bg-white p-7 rounded-3xl shadow-xs border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Category Distribution
                  </h2>
                  <p className="text-xs text-slate-400">Order share across main product categories</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">pie_chart</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#b90041] to-[#df2457] p-5 rounded-2xl text-white relative overflow-hidden group shadow-xs">
                  <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-15 rotate-12 transition-transform group-hover:scale-110">
                    styler
                  </span>
                  <p className="text-xs text-pink-100 font-semibold">Women Ethnic</p>
                  <p className="text-3xl font-black mt-1 font-['Plus_Jakarta_Sans']">42%</p>
                  <p className="text-[11px] mt-2 font-medium bg-black/20 px-2 py-0.5 rounded-md w-fit">
                    +12% MoM growth
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#4d41df] to-[#675df9] p-5 rounded-2xl text-white relative overflow-hidden group shadow-xs">
                  <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-15 rotate-12 transition-transform group-hover:scale-110">
                    smartphone
                  </span>
                  <p className="text-xs text-indigo-100 font-semibold">Electronics</p>
                  <p className="text-3xl font-black mt-1 font-['Plus_Jakarta_Sans']">18%</p>
                  <p className="text-[11px] mt-2 font-medium bg-black/20 px-2 py-0.5 rounded-md w-fit">
                    +5% MoM growth
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#008644] to-[#00a855] p-5 rounded-2xl text-white relative overflow-hidden group shadow-xs">
                  <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-15 rotate-12 transition-transform group-hover:scale-110">
                    home_iot_device
                  </span>
                  <p className="text-xs text-emerald-100 font-semibold">Home & Kitchen</p>
                  <p className="text-3xl font-black mt-1 font-['Plus_Jakarta_Sans']">15%</p>
                  <p className="text-[11px] mt-2 font-medium bg-black/20 px-2 py-0.5 rounded-md w-fit">
                    +18% MoM growth
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl text-white relative overflow-hidden group shadow-xs">
                  <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-15 rotate-12 transition-transform group-hover:scale-110">
                    more_horiz
                  </span>
                  <p className="text-xs text-slate-300 font-semibold">Accessories & Other</p>
                  <p className="text-3xl font-black mt-1 font-['Plus_Jakarta_Sans']">25%</p>
                  <p className="text-[11px] mt-2 font-medium bg-white/20 px-2 py-0.5 rounded-md w-fit">
                    Stable Demand
                  </p>
                </div>
              </div>
            </section>

            {/* Regional Sales Heatmap */}
            <section className="bg-white p-7 rounded-3xl shadow-xs border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Regional Sales Heatmap
                    </h2>
                    <p className="text-xs text-slate-400">Pan-India delivery density</p>
                  </div>
                  <div className="bg-pink-50 px-3 py-1 rounded-full text-[10px] font-bold text-[#b90041] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#b90041] animate-ping"></span>
                    LIVE TRAFFIC
                  </div>
                </div>

                {/* Radar Mock Map container */}
                <div className="h-44 w-full bg-slate-100 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-slate-200/60">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 grayscale"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')",
                    }}
                  ></div>

                  {/* Pulsating animated radar spots */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-around pointer-events-none">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#b90041]/40 animate-ping"></div>
                    </div>
                    <div className="flex justify-start ml-24">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/40 animate-ping"></div>
                    </div>
                    <div className="flex justify-end mr-16">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/40 animate-ping"></div>
                    </div>
                  </div>

                  <div className="relative z-10 bg-white/90 backdrop-blur-xs px-4 py-2 rounded-xl text-center shadow-xs border border-white">
                    <div className="text-xs font-bold text-slate-800">Surat & Jaipur Hubs</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Highest Dispatch Density</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Metro
                  </p>
                  <p className="text-lg font-black text-slate-800">32%</p>
                  <span className="text-[10px] text-slate-400">Delhi, Mumbai, BLR</span>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Tier 2
                  </p>
                  <p className="text-lg font-black text-[#b90041]">48%</p>
                  <span className="text-[10px] text-rose-500 font-bold">Core Market</span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Tier 3+
                  </p>
                  <p className="text-lg font-black text-slate-800">20%</p>
                  <span className="text-[10px] text-emerald-600 font-bold">+22% YoY</span>
                </div>
              </div>
            </section>
          </div>

          {/* 5. Top Performing Suppliers Table */}
          <section className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Top Performing Suppliers
                </h2>
                <p className="text-xs text-slate-400">
                  Ranked by order fulfillment, revenue generation and seller rating
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    placeholder="Filter suppliers..."
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 pl-8 focus:ring-2 focus:ring-[#b90041]"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-slate-400 text-sm">
                    search
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('catalog')}
                  className="text-[#b90041] hover:text-[#df2457] font-bold text-xs hover:underline cursor-pointer"
                >
                  View All in Catalog →
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Supplier</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Orders (30d)</th>
                    <th className="px-6 py-3.5">Rev Contribution</th>
                    <th className="px-6 py-3.5">Rating</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                            <img
                              alt={sup.name}
                              className="h-full w-full object-cover"
                              src={sup.logo}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{sup.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {sup.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {sup.category}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-900">
                        {sup.orders}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-[#008644]">
                        {sup.revenue}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="text-xs font-black text-slate-800">{sup.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            sup.status === 'Top Rated'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {sup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Opening analytics for ${sup.name}`)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Contextual FAB for AI Insights */}
      <button
        type="button"
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-[#b90041] hover:bg-[#df2457] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 cursor-pointer group"
        title="Open AI Curator Insights"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
          auto_awesome
        </span>
      </button>

      {/* AI Insights Modal Drawer */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b90041]">auto_awesome</span>
                <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  AI Curator Insights & Recommendations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-pink-50 rounded-2xl border border-pink-100 flex gap-3">
                <span className="material-symbols-outlined text-[#b90041] text-lg flex-shrink-0">
                  trending_up
                </span>
                <div>
                  <h4 className="font-bold text-[#b90041]">Festive Demand Surge in Tier 2</h4>
                  <p className="text-slate-600 mt-0.5">
                    Women Ethnic saree demand is up +24% in Jaipur and Surat. Recommend boosting reseller
                    commission by 5% to maximize stock liquidation.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <span className="material-symbols-outlined text-amber-700 text-lg flex-shrink-0">
                  inventory_2
                </span>
                <div>
                  <h4 className="font-bold text-amber-800">Inventory Alert: NexGen Electronics</h4>
                  <p className="text-slate-600 mt-0.5">
                    Fast-moving smart watch accessories are at 3 days of remaining stock. Supplier has
                    been notified to expedite replenishment.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-lg flex-shrink-0">
                  groups
                </span>
                <div>
                  <h4 className="font-bold text-emerald-800">Reseller Retention Opportunity</h4>
                  <p className="text-slate-600 mt-0.5">
                    Re-engagement campaign targeted at 14,000 inactive sellers could yield an estimated
                    ₹18L GMV over next 14 days.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  onNavigate && onNavigate('campaigns');
                }}
                className="px-4 py-2 rounded-xl bg-[#b90041] hover:bg-[#df2457] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Create Target Campaign →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceAnalyticsDashboardAdmin;
