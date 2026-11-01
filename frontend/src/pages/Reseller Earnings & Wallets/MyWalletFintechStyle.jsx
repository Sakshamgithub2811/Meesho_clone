import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';

export default function MyWalletFintechStyle() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('mshoppy_customer_wallet');
      return stored ? parseFloat(stored) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem('mshoppy_wallet_txns');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'income') return tx.type === 'income';
    if (filter === 'withdrawal') return tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="text-on-background bg-background min-h-screen pb-32 font-sans selection:bg-primary/20">
      {/* Top Navigation - Full Width */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_32px_64px_-4px_rgba(26,28,29,0.06)] border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-4 w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="active:scale-95 duration-200 ease-in-out text-slate-500 dark:text-slate-400 cursor-pointer p-1.5 rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <h1 className="text-slate-900 dark:text-slate-50 font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-lg sm:text-xl">
              My Wallet
            </h1>
          </div>
          <button 
            onClick={() => navigate('/notifications')} 
            className="active:scale-95 duration-200 ease-in-out text-slate-500 dark:text-slate-400 cursor-pointer p-1.5 rounded-full hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-2xl">help_outline</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 sm:px-6 md:px-10 lg:px-16 w-full max-w-7xl mx-auto space-y-8">
        {/* Balance Card Section */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 shadow-2xl transition-all hover:scale-[1.02] duration-500"
          style={{ background: 'linear-gradient(135deg, #4834D4 0%, #686DE0 100%)' }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-start gap-1">
            <span className="text-white/70 text-sm font-medium tracking-wide uppercase">Available Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-white text-4xl font-extrabold tracking-tight">
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-8 flex w-full gap-4">
              <button
                onClick={() => navigate('/withdraw-earnings')}
                className="flex-1 bg-white/15 backdrop-blur-md border border-white/20 text-white py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">vertical_align_bottom</span>
                Withdraw Funds
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/payout-settings')}
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-lowest p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Add Bank</span>
          </button>
          <button 
            onClick={() => navigate('/payout-settings')}
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-lowest p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">contactless</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">UPI Setup</span>
          </button>
          <button 
            onClick={() => navigate('/reseller-wallet')}
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-lowest p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">description</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Tax Info</span>
          </button>
        </section>

        {/* Filters Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-on-surface font-bold text-lg">Transactions</h2>
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-outline">tune</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'income', label: 'Income' },
              { id: 'withdrawal', label: 'Withdrawals' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Transaction History List */}
        <section className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-8 text-center border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">account_balance_wallet</span>
              <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your wallet credits, referral rewards, and withdrawals will appear here in real time.
              </p>
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <div
                key={tx.id}
                className="bg-surface-container-lowest rounded-3xl p-4 flex items-center justify-between shadow-sm border border-outline-variant/10 transition-all hover:bg-surface-container-low cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${tx.color}15` }}
                  >
                    <span 
                      className="material-symbols-outlined text-xl"
                      style={{ color: tx.color, fontVariationSettings: "'FILL' 1" }}
                    >
                      {tx.type === 'income' ? 'add_circle' : 'do_not_disturb_on'}
                    </span>
                  </div>
                  <div>
                    <p className="text-on-surface font-bold text-sm">{tx.title}</p>
                    <p className="text-xs text-outline font-medium mt-0.5">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className="font-extrabold text-sm"
                    style={{ color: tx.color }}
                  >
                    {tx.amount}
                  </p>
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter inline-block mt-1"
                    style={{ 
                      backgroundColor: tx.status === 'Settled' ? (tx.type === 'income' ? '#00A38915' : '#ba1a1a15') : '#675df925',
                      color: tx.status === 'Settled' ? (tx.type === 'income' ? '#00A389' : '#ba1a1a') : '#675df9'
                    }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Summary Insights (Bento-style Card) */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-5 rounded-3xl flex flex-col justify-between">
            <p className="text-[10px] font-bold text-outline uppercase tracking-[0.1em]">Available Funds</p>
            <div>
              <h3 className="text-xl font-extrabold text-on-surface">
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Instant Bank IMPS</p>
            </div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-3xl flex flex-col justify-between">
            <p className="text-[10px] font-bold text-outline uppercase tracking-[0.1em]">Total Savings</p>
            <div>
              <h3 className="text-xl font-extrabold text-on-surface">
                ₹{(walletBalance * 0.15).toFixed(2)}
              </h3>
              <div className="w-full bg-outline-variant/20 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary w-[30%] h-full rounded-full"></div>
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
