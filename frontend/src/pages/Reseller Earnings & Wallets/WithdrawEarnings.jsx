import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavDrawer from '../../components/NavDrawer';

// Initial realistic withdrawal records if none exist in localStorage
const INITIAL_WITHDRAWALS = [
  {
    id: "WTH-984210",
    amount: 3200.00,
    method: "bank",
    accountLabel: "HDFC Bank (•••• 4321)",
    date: "Today, 10:15 AM",
    status: "PROCESSING", // "PROCESSING" | "COMPLETED" | "PENDING"
    statusLabel: "Processing (24 - 48 Hrs)",
    estimatedArrival: "24 to 48 Hours",
    progress: 50
  },
  {
    id: "WTH-972104",
    amount: 4500.00,
    method: "bank",
    accountLabel: "HDFC Bank (•••• 4321)",
    date: "24 Oct 2026, 11:15 AM",
    status: "COMPLETED",
    statusLabel: "Credited to Bank",
    estimatedArrival: "Completed",
    progress: 100
  },
  {
    id: "WTH-960182",
    amount: 1850.00,
    method: "upi",
    accountLabel: "partner@upi",
    date: "18 Oct 2026, 02:40 PM",
    status: "COMPLETED",
    statusLabel: "Credited via UPI",
    estimatedArrival: "Completed",
    progress: 100
  }
];

export default function WithdrawEarnings() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user || {});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Dynamic Balance State
  const [withdrawableBalance, setWithdrawableBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('meesho_dropshipper_balance');
      return stored ? parseFloat(stored) : 8450.50;
    } catch (e) {
      return 8450.50;
    }
  });

  const [amount, setAmount] = useState('2500');
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Withdrawals List (with localStorage persistence)
  const [withdrawals, setWithdrawals] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_withdrawals');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_WITHDRAWALS;
  });

  // Sync withdrawals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('meesho_dropshipper_withdrawals', JSON.stringify(withdrawals));
    } catch (e) {}
  }, [withdrawals]);

  // Find active withdrawal (currently in PROCESSING state)
  const activeWithdrawal = withdrawals.find((w) => w.status === 'PROCESSING');

  // Amount input handler
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(val);
    if (error) setError('');
  };

  // Quick Amount Selectors
  const setQuickAmount = (val) => {
    setAmount(val.toString());
    if (error) setError('');
  };

  // Copy transaction ID
  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // Proceed Withdraw
  const handleProceedWithdraw = () => {
    const numAmount = parseFloat(amount) || 0;

    if (numAmount < 100) {
      setError('Minimum withdrawal amount is ₹100.00');
      return;
    }

    if (numAmount > withdrawableBalance) {
      setError(
        `Amount cannot exceed available balance of ₹${withdrawableBalance.toLocaleString()}`
      );
      return;
    }

    // Generate new unique transaction
    const newTxnId = `WTH-${Math.floor(100000 + Math.random() * 900000)}`;
    const destination = payoutMethod === 'bank' ? 'HDFC Bank (•••• 4321)' : 'partner@upi';

    const newRecord = {
      id: newTxnId,
      amount: numAmount,
      method: payoutMethod,
      accountLabel: destination,
      date: 'Just now',
      status: 'PROCESSING',
      statusLabel: 'Processing (24 - 48 Hrs)',
      estimatedArrival: '24 to 48 Hours',
      progress: 35
    };

    // Update state and deduct balance
    const updatedBalance = Number((withdrawableBalance - numAmount).toFixed(2));
    setWithdrawableBalance(updatedBalance);
    try {
      localStorage.setItem('meesho_dropshipper_balance', updatedBalance.toString());
    } catch (e) {}

    const updatedList = [newRecord, ...withdrawals];
    setWithdrawals(updatedList);

    // Redirect to payout confirmation receipt screen with 24-48 hr ETA
    navigate('/payout-confirmation', {
      state: {
        txnId: newTxnId,
        amount: numAmount,
        method: payoutMethod,
        bankName: payoutMethod === 'bank' ? 'HDFC Bank' : 'UPI ID',
        accountEnding: payoutMethod === 'bank' ? '•••• 4321' : 'partner@upi',
        estimatedArrival: 'Within 24 to 48 Hours',
        status: 'PROCESSING',
        statusLabel: 'Processing (24 - 48 Hrs)'
      }
    });
  };

  const numericAmount = parseFloat(amount) || 0;

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] font-sans min-h-screen selection:bg-[#b90041]/20">
      {/* Top App Bar - Full Width */}
      <header className="flex items-center w-full px-4 sm:px-6 md:px-10 lg:px-16 h-16 sticky top-0 z-50 bg-[#fcf9f8] dark:bg-[#1c1b1b] border-b border-[#f0edec] dark:border-slate-800">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="p-1.5 rounded-full active:scale-95 transition-transform text-[#b90041] hover:bg-[#b90041]/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg sm:text-xl text-[#1c1b1b] dark:text-white">
              Withdraw Earnings
            </h1>
          </div>
          <button 
            type="button"
            onClick={() => alert("Payouts are securely processed to verified accounts within 24 to 48 hours via RBI NEFT/IMPS clearing.")}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#1c1b1b] cursor-pointer"
            aria-label="Help"
            title="Estimated Arrival: 24 to 48 Hours"
          >
            <span className="material-symbols-outlined text-2xl">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content - Strictly Vertical Stream */}
      <main className="max-w-xl md:max-w-2xl mx-auto px-4 pb-16 pt-6 space-y-6">
        
        {/* 1. Balance Header */}
        <section className="text-center relative overflow-hidden p-8 rounded-3xl bg-[#f6f3f2] dark:bg-slate-800/60 border border-gray-100">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#b90041]/5 rounded-full blur-3xl pointer-events-none"></div>
          <p className="text-[#5b4042] dark:text-slate-400 font-medium text-xs sm:text-sm uppercase tracking-widest mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
            Withdrawable Balance
          </p>
          <h2 className="text-[3rem] sm:text-[3.5rem] font-extrabold leading-none tracking-tighter text-[#1c1b1b] dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[#b90041] text-[2.2rem] sm:text-[2.5rem]">₹</span>
            {withdrawableBalance.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </h2>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007432]/10 text-[#007432] dark:text-emerald-400">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="text-xs font-bold uppercase tracking-wide">Available for Payout</span>
          </div>
        </section>

        {/* 2. Active Withdrawal Status Tracker Card (if an active withdrawal is processing) */}
        {activeWithdrawal && (
          <section className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 border border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">hourglass_top</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Active Withdrawal in Progress</h4>
                  <p className="text-xs text-gray-500 font-mono">Ref: #{activeWithdrawal.id}</p>
                </div>
              </div>

              {/* Status Tag */}
              <div className="self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Processing (24 - 48 Hrs)</span>
                </span>
              </div>
            </div>

            {/* Amount & ETA Info */}
            <div className="grid grid-cols-2 gap-3 pt-2 pb-1 border-t border-amber-200/60">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">Requested Amount</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  ₹{activeWithdrawal.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">Estimated Arrival</span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-lg inline-block">
                  24 to 48 Hours
                </span>
              </div>
            </div>

            {/* 3-Step Live Timeline Tracker */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1.5">
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">check</span> Request Placed
                </span>
                <span className="text-amber-800 font-extrabold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">sync</span> Bank Clearing (24-48h)
                </span>
                <span className="text-gray-400">Direct Credit</span>
              </div>
              <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${activeWithdrawal.progress || 50}%` }}
                ></div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Payout Method Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base sm:text-lg text-[#1c1b1b] dark:text-white">
              Payout Destination
            </h3>
            <button
              type="button"
              onClick={() => navigate('/dropshipper-dashboard?tab=profile')}
              className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
            >
              Manage in Settings
            </button>
          </div>

          {/* Bank Option */}
          <div
            onClick={() => setPayoutMethod('bank')}
            className={`p-5 rounded-2xl cursor-pointer transition-all ${
              payoutMethod === 'bank'
                ? 'bg-white dark:bg-slate-800 shadow-md border-2 border-[#b90041] ring-4 ring-[#b90041]/5'
                : 'bg-[#f6f3f2] dark:bg-slate-800/40 border border-transparent hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ede9e8] dark:bg-slate-700 flex items-center justify-center text-[#1c1b1b] dark:text-white">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base text-[#1c1b1b] dark:text-white">HDFC Bank</p>
                  <p className="text-xs sm:text-sm text-slate-500">Verified Payout Account •••• 4321</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${payoutMethod === 'bank' ? 'border-[#b90041]' : 'border-slate-300'}`}>
                {payoutMethod === 'bank' && <div className="w-3 h-3 rounded-full bg-[#b90041]"></div>}
              </div>
            </div>
          </div>

          {/* UPI Option */}
          <div
            onClick={() => setPayoutMethod('upi')}
            className={`p-5 rounded-2xl cursor-pointer transition-all ${
              payoutMethod === 'upi'
                ? 'bg-white dark:bg-slate-800 shadow-md border-2 border-[#b90041] ring-4 ring-[#b90041]/5'
                : 'bg-[#f6f3f2] dark:bg-slate-800/40 border border-transparent hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ede9e8] dark:bg-slate-700 flex items-center justify-center text-[#1c1b1b] dark:text-white">
                  <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base text-[#1c1b1b] dark:text-white">UPI VPA</p>
                  <p className="text-xs sm:text-sm text-slate-500">partner@upi (Instant Routing)</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${payoutMethod === 'upi' ? 'border-[#b90041]' : 'border-slate-300'}`}>
                {payoutMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-[#b90041]"></div>}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Withdrawal Input Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-base sm:text-lg text-[#1c1b1b] dark:text-white">
              Amount to Withdraw
            </h3>
            <span className="text-xs text-slate-500 font-medium">Min: ₹100.00</span>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">₹</div>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="w-full h-20 pl-12 pr-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#b90041] font-extrabold text-3xl text-[#1c1b1b] dark:text-white outline-none shadow-xs"
              placeholder="0.00"
            />
          </div>

          {error && <p className="text-rose-600 text-xs font-bold pl-2">{error}</p>}

          {/* Quick Preset Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setQuickAmount(1000)}
              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-rose-100 hover:text-[#b90041] transition-colors cursor-pointer"
            >
              ₹1,000
            </button>
            <button
              type="button"
              onClick={() => setQuickAmount(5000)}
              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-rose-100 hover:text-[#b90041] transition-colors cursor-pointer"
            >
              ₹5,000
            </button>
            <button
              type="button"
              onClick={() => setQuickAmount(withdrawableBalance)}
              className="px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-900/30 text-[#b90041] text-xs sm:text-sm font-bold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Withdraw All
            </button>
          </div>
        </section>

        {/* 5. Transaction Summary (Card with 24-48 Hours Arrival) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Processing Fee</span>
            <span className="text-emerald-700 font-bold">₹0.00 (Zero Fee)</span>
          </div>

          {/* ESTIMATED ARRIVAL: 24 to 48 Hours */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Estimated Arrival Time</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full text-xs">
              <span className="material-symbols-outlined text-sm">schedule</span>
              24 to 48 Hours
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-[#1c1b1b] dark:text-white font-bold text-sm sm:text-base">Net Payout to Account</span>
            <span className="text-[#b90041] font-extrabold text-xl sm:text-2xl">
              ₹{numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </section>

        {/* 6. Primary Withdraw Earnings Action Button */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleProceedWithdraw}
            className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#b90041] to-[#df2457] hover:from-[#a00037] hover:to-[#c71e4c] text-white font-extrabold text-base sm:text-lg rounded-2xl active:scale-95 shadow-[0_8px_32px_rgba(185,0,65,0.25)] hover:shadow-xl hover:shadow-pink-500/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <span>Request Payout ({payoutMethod === 'bank' ? 'Bank Account' : 'UPI ID'})</span>
            <span className="material-symbols-outlined text-xl">trending_flat</span>
          </button>
          <p className="text-center text-[11px] text-slate-500 font-medium">
            Payouts are processed in bank batches and cleared between <strong>24 to 48 hours</strong>.
          </p>
        </div>

        {/* 7. Recent Withdrawals & Payout Status Tags History */}
        <section className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base sm:text-lg text-[#1c1b1b] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#b90041]">receipt_long</span>
              <span>Recent Withdrawal Requests</span>
            </h3>
            <span className="text-xs text-gray-500">{withdrawals.length} Total</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200">#{w.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(w.id)}
                      className="text-gray-400 hover:text-[#b90041] cursor-pointer"
                      title="Copy Reference ID"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {copiedId === w.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                    
                    {/* Status Tag / Badge */}
                    {w.status === 'PROCESSING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        <span>Processing (24 - 48 Hrs)</span>
                      </span>
                    )}

                    {w.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Credited</span>
                      </span>
                    )}

                    {w.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{w.date}</span>
                    <span>•</span>
                    <span className="font-medium">{w.accountLabel}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    ₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    {w.status === 'PROCESSING' ? (
                      <span className="text-amber-700 font-semibold">ETA: 24 to 48 Hrs</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Settled via {w.method === 'bank' ? 'NEFT/IMPS' : 'UPI'}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}