import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";

const EarningsDashboard1 = ({ onNavigate, onBack }) => {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith("/") ? target : `/${target}`);
  };
  const [chartView, setChartView] = useState("6M");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32 font-sans selection:bg-primary/20">
      {/* TopAppBar - Full Width across Desktop and Mobile */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none border-b border-slate-100 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : handleNav("/admin-panel"))}
            className="text-slate-700 dark:text-slate-300 hover:text-rose-600 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full hover:bg-rose-50 flex items-center justify-center"
            aria-label="Back to Admin Panel"
            title="Back to Admin Panel"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-rose-600 dark:text-rose-400 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full hover:bg-rose-50"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="text-rose-600 dark:text-rose-400 font-extrabold tracking-tight text-lg sm:text-xl font-headline">
            Earnings Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleNav("/admin-panel")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            title="Return to Admin Console"
          >
            <span className="material-symbols-outlined text-sm text-rose-400">admin_panel_settings</span>
            <span>Admin Console</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="text-rose-600 dark:text-rose-400 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full hover:bg-rose-50"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-20 pb-32 px-4 sm:px-6 md:px-10 lg:px-16 w-full max-w-7xl mx-auto space-y-8">
        {/* Hero Section: Total Earnings */}
        <section className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-[0_12px_32px_rgba(25,28,30,0.04)] border border-white/20">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest font-semibold mb-1">
                Total Earnings
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline leading-tight">
                ₹48,250.00
              </h2>
              <p className="text-tertiary font-medium flex items-center gap-1 mt-2">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trending_up
                </span>
                +12% from last month
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/withdraw-earnings")}
              className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold font-headline shadow-lg hover:opacity-90 active:scale-95 transition-all text-center cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">payments</span>
              </div>
              <span className="text-on-surface-variant material-symbols-outlined text-sm">
                info
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Pending
              </p>
              <h3 className="text-xl font-bold font-headline mt-1">₹4,120</h3>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <span className="material-symbols-outlined text-tertiary">package_2</span>
              </div>
              <span className="text-on-surface-variant material-symbols-outlined text-sm">
                trending_up
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-xl font-bold font-headline mt-1">1,284</h3>
            </div>
          </div>
        </section>

        {/* Returns & Margin Reversals Impact Card (Panel 5 Ecosystem Entry) */}
        <section 
          onClick={() => navigate('/reseller-returns')}
          className="bg-rose-50/70 border border-rose-200/70 hover:border-rose-300 rounded-3xl p-5 sm:p-6 transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">assignment_return</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-headline font-bold text-base sm:text-lg text-slate-900">
                    Returns & Margin Deductions
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800">
                    5.1% Return Rate
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  5 Customer returns • ₹1,450 margin reversed this month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs font-bold text-rose-700 bg-white px-3.5 py-2 rounded-xl border border-rose-100 shadow-xs group-hover:bg-rose-50 flex items-center gap-1.5">
                View Ledger
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </div>
        </section>

        {/* Simple Monthly Chart Visualization */}
        <section className="bg-white rounded-3xl p-6 border border-white/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-bold text-lg">Earnings Performance</h3>
            <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setChartView("6M")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  chartView === "6M"
                    ? "bg-white shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                6M
              </button>
              <button
                type="button"
                onClick={() => setChartView("1Y")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  chartView === "1Y"
                    ? "bg-white shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                1Y
              </button>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2 mb-4">
            <div className="w-full flex flex-col items-center gap-2">
              <div
                className="w-full bg-surface-container-high rounded-t-lg transition-all"
                style={{ height: "40%" }}
              ></div>
              <span className="text-[10px] font-bold text-on-surface-variant">JAN</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div
                className="w-full bg-surface-container-high rounded-t-lg transition-all"
                style={{ height: "60%" }}
              ></div>
              <span className="text-[10px] font-bold text-on-surface-variant">FEB</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div
                className="w-full bg-secondary-container/20 rounded-t-lg transition-all"
                style={{ height: "50%" }}
              ></div>
              <span className="text-[10px] font-bold text-on-surface-variant">MAR</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div
                className="w-full bg-secondary-container/40 rounded-t-lg transition-all"
                style={{ height: "85%" }}
              ></div>
              <span className="text-[10px] font-bold text-on-surface-variant">APR</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div
                className="w-full bg-secondary-container/60 rounded-t-lg transition-all"
                style={{ height: "70%" }}
              ></div>
              <span className="text-[10px] font-bold text-on-surface-variant">MAY</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary-container rounded-t-lg transition-all shadow-[0_4px_12px_rgba(223,36,87,0.2)]"
                style={{ height: "100%" }}
              ></div>
              <span className="text-[10px] font-bold text-primary">JUN</span>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-headline font-bold text-lg">Transaction History</h3>
            <button
              type="button"
              onClick={() => navigate("/earnings-dashboard-2")}
              className="text-primary font-bold text-sm cursor-pointer hover:underline"
            >
              See All
            </button>
          </div>
          <div className="space-y-4">
            {/* Transaction Item 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:bg-white transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">Order #M-29384</p>
                  <p className="text-xs text-on-surface-variant font-medium">12 Jun 2024 • 02:30 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-tertiary">+₹450.00</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                  Margin Earned
                </p>
              </div>
            </div>

            {/* Transaction Item 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:bg-white transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">Order #M-29312</p>
                  <p className="text-xs text-on-surface-variant font-medium">10 Jun 2024 • 11:15 AM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-tertiary">+₹120.00</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                  Margin Earned
                </p>
              </div>
            </div>

            {/* Transaction Item 3 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:bg-white transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">Order #M-28945</p>
                  <p className="text-xs text-on-surface-variant font-medium">08 Jun 2024 • 04:45 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-tertiary">+₹890.00</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                  Margin Earned
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default EarningsDashboard1;