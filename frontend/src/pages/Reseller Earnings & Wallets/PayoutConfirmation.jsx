import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';

export default function PayoutConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copiedTxn, setCopiedTxn] = useState(false);

  const [payoutInfo, setPayoutInfo] = useState(() => {
    if (location.state && location.state.amount) {
      return location.state;
    }
    try {
      const stored = sessionStorage.getItem('mshoppy_last_payout');
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    try {
      const history = localStorage.getItem('mshoppy_payout_history');
      if (history) {
        const list = JSON.parse(history);
        if (Array.isArray(list) && list.length > 0) return list[0];
      }
    } catch (e) {}

    try {
      const txns = localStorage.getItem('mshoppy_wallet_txns');
      if (txns) {
        const list = JSON.parse(txns);
        const wTx = list.find(t => t.type === 'withdrawal');
        if (wTx) {
          return {
            amount: Math.abs(wTx.amount || 1200),
            method: 'bank',
            destination: 'Verified Bank Account (•••• 4921)',
            txnId: wTx.id || `TXN-${Date.now().toString().slice(-7)}`
          };
        }
      }
    } catch (e) {}

    return {
      amount: 1450,
      method: 'bank',
      destination: 'HDFC Bank (•••• 4921)',
      txnId: `TXN-${Date.now().toString().slice(-7)}`
    };
  });

  const txnId = payoutInfo.txnId || `TXN-${Date.now().toString().slice(-7)}`;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(txnId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const formattedAmount = (payoutInfo.amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans selection:bg-primary/20">
      {/* TopAppBar - Full Width */}
      <header className="w-full top-0 sticky z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center px-4 sm:px-6 md:px-10 lg:px-16 h-16 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/reseller-wallet')} 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-[#FF3F6C] cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-lg sm:text-xl text-[#191C1E] dark:text-white">
            Payout Success
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-10 pt-8 pb-32 max-w-xl mx-auto w-full overflow-y-auto">
        {/* Success Animation/Icon Area */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-25"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface mb-2">
            ₹{formattedAmount} Transferred!
          </h2>
          <p className="text-on-surface-variant font-medium max-w-[280px] mx-auto text-sm leading-relaxed">
            Your withdrawal is being processed to your account.
          </p>
        </div>

        {/* Transaction Summary Bento Card */}
        <div className="space-y-5">
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant/60 mb-6">
              Transaction Summary
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                  </div>
                  <span className="text-on-surface-variant font-medium">Amount</span>
                </div>
                <span className="font-headline font-bold text-on-surface">₹{formattedAmount}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                  </div>
                  <span className="text-on-surface-variant font-medium">Destination</span>
                </div>
                <div className="text-right">
                  <span className="block font-headline font-bold text-on-surface">{payoutInfo.destination || 'Settlement Account'}</span>
                  <span className="text-[10px] font-bold text-emerald-600 tracking-tighter">IMPS / Instant RTGS</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  </div>
                  <span className="text-on-surface-variant font-medium">Arrival</span>
                </div>
                <span className="font-headline font-bold text-emerald-600">Within 24 hours</span>
              </div>

              <div className="h-px bg-surface-container-high w-full"></div>

              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                  Reference ID
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-on-surface">{txnId}</span>
                  <span onClick={handleCopyTxn} className="material-symbols-outlined text-xs text-secondary cursor-pointer">
                    {copiedTxn ? 'check' : 'content_copy'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Alert */}
          <div className="bg-secondary-fixed/30 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-lg mt-0.5">info</span>
            <p className="text-xs text-on-secondary-fixed-variant leading-relaxed">
              A confirmation email has been sent to your registered ID. Please keep this for your records.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-12 px-2">
          <button
            onClick={() => navigate('/earnings-dashboard-1')}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Back to Earnings
          </button>
        </div>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" />
    </div>
  );
}

