import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";
import { getOrders } from "../../services/ecommerceService";

const EarningsDashboard2 = ({ onNavigate, onBack }) => {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith("/") ? target : `/${target}`);
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('mshoppy_customer_wallet');
      return stored ? parseFloat(stored) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOrdersCount = orders.length;
  const pendingAmount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length * 150;

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-sans selection:bg-primary/20">
      {/* TopAppBar - Full Width across Desktop and Mobile */}
      <header className="bg-white dark:bg-slate-900 relative w-full shadow-sm dark:shadow-none border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 h-16 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : handleNav("/admin-panel"))}
              className="text-slate-700 dark:text-slate-300 hover:text-rose-600 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              aria-label="Back to Admin Panel"
              title="Back to Admin Panel"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="text-slate-700 dark:text-slate-300 hover:text-rose-600 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h1 className="text-rose-600 dark:text-rose-400 font-extrabold tracking-tight font-headline text-lg sm:text-xl">
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
              className="text-slate-700 dark:text-slate-300 hover:text-rose-600 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas - Full Desktop Width & Mobile Responsive */}
      <main className="pt-6 sm:pt-8 px-4 sm:px-6 md:px-10 lg:px-16 w-full max-w-7xl mx-auto space-y-8">
        {/* Total Earnings Card (Editorial Hero) */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-3xl p-6 sm:p-8 text-on-primary shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="font-label text-xs sm:text-sm font-semibold uppercase tracking-widest opacity-80">
                Total Available Earnings
              </span>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-2 tracking-tight">
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/withdraw-earnings")}
                className="bg-surface-container-lowest text-primary font-bold px-8 py-3 rounded-xl shadow-lg active:scale-95 hover:bg-white/95 transition-transform cursor-pointer"
              >
                Withdraw
              </button>
              <div className="flex items-center gap-1 text-tertiary-fixed font-bold bg-tertiary/20 px-3.5 py-1.5 rounded-full text-sm">
                <span className="material-symbols-outlined text-sm font-bold">verified</span>
                Instant IMPS
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Stats - Bento Style (Horizontal Pair) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col gap-2 transition-transform hover:scale-[1.01] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-slate-500 font-medium text-sm">Pending</span>
            <span className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col gap-2 transition-transform hover:scale-[1.01] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">package_2</span>
            </div>
            <span className="text-slate-500 font-medium text-sm">Total Orders</span>
            <span className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
              {totalOrdersCount}
            </span>
          </div>
        </div>

        {/* Monthly Earnings Visualization */}
        <section className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">Earnings Overview</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Last 6 Months
            </span>
          </div>
          <div className="flex items-end justify-between h-44 sm:h-56 gap-3 sm:gap-6 md:gap-10 px-2 sm:px-6">
            {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((m, idx) => {
              const heights = [20, 35, 45, 60, walletBalance > 0 ? 80 : 25, walletBalance > 0 ? 100 : 30];
              return (
                <div key={m} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-full rounded-t-lg transition-all ${idx === 5 ? 'bg-primary shadow-[0_0_15px_rgba(185,0,65,0.35)]' : 'bg-primary/20 hover:bg-primary'}`}
                    style={{ height: `${heights[idx]}%` }}
                  ></div>
                  <span className={`text-[10px] sm:text-xs font-bold ${idx === 5 ? 'text-primary' : 'text-slate-400'}`}>{m}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Transaction History (Vertical List Underneath) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">Transaction History</h3>
            <button
              type="button"
              onClick={() => navigate("/reseller-wallet")}
              className="text-primary font-bold text-sm sm:text-base cursor-pointer hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl text-center border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">receipt_long</span>
                <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  When your customers receive delivered items, margin settlements will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/resell-earn')}
                  className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90 active:scale-95"
                >
                  Start Reselling
                </button>
              </div>
            ) : (
              orders.slice(0, 3).map((ord) => (
                <div key={ord.id} className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">receipt_long</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface text-sm sm:text-base">Order #{ord.orderNumber || ord.id.slice(0, 8)}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {ord.status || 'Settled'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-headline font-bold text-tertiary text-sm sm:text-base">
                      +₹{ord.marginAmount || 150}.00
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Margin Earned
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default EarningsDashboard2;