import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";

const EarningsDashboard2 = ({ onNavigate, onBack }) => {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith("/") ? target : `/${target}`);
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
                Total Earnings
              </span>
              <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-2 tracking-tight">
                ₹42,850
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
                <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
                12%
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
              ₹4,200
            </span>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col gap-2 transition-transform hover:scale-[1.01] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">package_2</span>
            </div>
            <span className="text-slate-500 font-medium text-sm">Total Orders</span>
            <span className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
              128
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
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary"
                style={{ height: "40%" }}
              ></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">JAN</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary"
                style={{ height: "65%" }}
              ></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">FEB</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-primary rounded-t-lg transition-all shadow-[0_0_15px_rgba(185,0,65,0.35)]"
                style={{ height: "90%" }}
              ></div>
              <span className="text-[10px] sm:text-xs font-bold text-primary">MAR</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary"
                style={{ height: "55%" }}
              ></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">APR</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary"
                style={{ height: "75%" }}
              ></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">MAY</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary"
                style={{ height: "45%" }}
              ></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">JUN</span>
            </div>
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
            {/* Transaction Item 1 */}
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-container-low rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover opacity-90"
                    alt="Modern minimalist product shot"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu5fCWm6DJkZiWx37cq0ErcicOdT50QNcBbu3Z6LNZ489k17yessnn0vmnkfJUEy6n3xKStWs8sAxm0tchboz0gTCDMas2HqKj_JsfbzNO_8eUw8dcw-H8ZRnMu95kUxFqXTKZDZI04KG8VZF1jF4vk9D_DM_vWCyj6m_d1NjbbUQWsOMEmZd8jZhdci75dnGXATFA-VUnHYM3ajE69scVpMDyjNZ6VWSiZZVzud13rxNaecQgh4yT9eoJvEAWqw3X4GRRQTVAq_4"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-sm sm:text-base">Order #OR-8821</span>
                  <span className="text-xs text-slate-400 font-medium">Oct 24, 2023 • Paid</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-headline font-bold text-tertiary text-sm sm:text-base">
                  +₹240.00
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Margin Earned
                </span>
              </div>
            </div>

            {/* Transaction Item 2 */}
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-container-low rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover opacity-90"
                    alt="Vibrant red athletic shoe"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCftyXyC5Df__g-RJn4AknauOs3kwPVeCzG6MwUVSZQAHCPEtj5itgV9pJmA2NI0yPU_eb7uO_-QWXJVJ0WX3pLkWdesPs-wTaavlYVj1sEkT66bxFmgCmEC7bm6ZrVGi0gMSuiW2LuSYJM8UGd5_9uiohF1O-cb86T4bX4SEXXXgJ2Bb5lYQYvpaMyiFAExmikK4wrfMkc7bFFFhrhGAmjteKsCd5NSK6t4dWO-RbTVe0Tx8yhVdqSYHPwxv1kY7ou45rttGXEy2w"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-sm sm:text-base">Order #OR-7910</span>
                  <span className="text-xs text-slate-400 font-medium">Oct 22, 2023 • Pending</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-headline font-bold text-secondary text-sm sm:text-base">
                  +₹185.50
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Projected
                </span>
              </div>
            </div>

            {/* Transaction Item 3 */}
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-container-low rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover opacity-90"
                    alt="Stylish casual footwear"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuVxRQs1a84aICF30bjt51xFm7h2pNDrh81ZB4Dc1Mv0zRnzO2RBgCykxXbsBASpj9RnGIRYpfnLgL8EyYlZT6k7QkpNkFzmbCdyDoytULXcGCrxZ39tEVXnFyYbyLJVHXI401NjUikQxIHA4_S7O4BwSfcQjR2K8oxV5OHuLDz1zHFYg2rjbWOkq3wsR3agvzKR72P7N7_wUH_S8Z9r67kUDd1-XZ9zZPteO0DvJt3b1BjU4RtmI_WpEecor0pKwGwjFCFdPfjwg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface text-sm sm:text-base">Order #OR-7855</span>
                  <span className="text-xs text-slate-400 font-medium">Oct 20, 2023 • Paid</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-headline font-bold text-tertiary text-sm sm:text-base">
                  +₹520.00
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Margin Earned
                </span>
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
};

export default EarningsDashboard2;