import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';

export default function ResellerWallet() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Dynamic States
  const [balance, setBalance] = useState(24850.50);
  const [pendingAmount, setPendingAmount] = useState(1240.00);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'paid'
  const [activeNav, setActiveNav] = useState('earnings');
  const [toastMessage, setToastMessage] = useState('');

  // 2. Transactions Data
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      orderId: '#MEE-9921',
      customer: 'Ananya S.',
      amount: 150.00,
      status: 'Settled', // Paid
      date: '24 Oct, 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzLz_6mINpsei7j9fUb1DtaZAT9Se1hHfHPyAUKv0oR9uShZYyjWaFbabmybIzXgY0cYLebI_rWWZTgEhTK_ZRkHRDUOSQznTYgNTIiX53bC3zZkpR208EOZ5GHHqLuDk0oe01Z3q_I_nVWJY9nT_fnDq-BG2gAvts-EEqra3iT6eoPdPvRigqcnEg4TLy3IVRhYLNv2npDgrVvKis2lfqtn2-oaAyTEcmNDScSwaJ0O-onoMgJSDJd1t4WEC0Ar-sLjWnH7rTAeQ',
    },
    {
      id: 5,
      orderId: 'ORD-88210',
      customer: 'Priya Sharma',
      amount: -300.00,
      status: 'Reversed',
      date: '25 Oct, 2024',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      reason: 'Customer Return - Size Fitting Issue'
    },
    {
      id: 2,
      orderId: '#MEE-9845',
      customer: 'Rahul Verma',
      amount: 320.00,
      status: 'Settled', // Paid
      date: '22 Oct, 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiv03o9Kg49EypPJsnjdMAUtau3ughXptaldM-oDDzjYMZUu_tTnCzk0PyZPqdsR-13EzZllzITwNg6Gyo5KH2ylw4yKFK4D9g6xzQ9uJWuM2twcxdsDHZIxm52Mvn4P0zUqa5Q-m_o9pzW6ceGpNQpv3xppRDzJ-fwePSrcTu7pV6c918xxvynJZifoi7jRn8Hjl2YsgEb5Rwo_bNvL6FF8Oc3wzkElfU2KjBXqjBlHiAdd31mQzNVz-FfU5FsFz6d0us9cpOQyU',
    },
    {
      id: 6,
      orderId: 'ORD-88002',
      customer: 'Ritu Verma',
      amount: -150.00,
      status: 'Reversed',
      date: '24 Oct, 2024',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      reason: 'Customer Return - Color Variation'
    },
    {
      id: 3,
      orderId: '#MEE-9712',
      customer: 'Priya K.',
      amount: 210.00,
      status: 'Pending', // Pending
      date: '20 Oct, 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp0MfZbC6oMWAC_o5vJYiu2YANsKtgmFkC36fROI0B2mwZ_dWwfupqQn5yXF25loVMeSqdi4I7IzpQUnzRd3aiabSS_dObg1YF7xEzNcC9d4xYJYkN8PIAleE-FMZqTC3Lkg5jQiA2UlJ3GgVPRHKjOMMm8_ZiVrGtWz78QPEu3Ffg6zt1rI_72SRKFiPpscrxpHUSchrgF4DmI4sbsvvraBjFf1XGlLDZpl3GaZtTNczPPDDcnB1KSRylzxlBF5ucywY5XVhZOMY',
    },
    {
      id: 4,
      orderId: '#MEE-9654',
      customer: 'Karan Singh',
      amount: 85.00,
      status: 'Settled', // Paid
      date: '18 Oct, 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2ZZb2McKSDeydFUEJLZSN7q5yAG0LQQQjD-3w7XjpGz8zBkCqzRxRAW8xFsflv2wknXbXTTOrs9pi7UvwQg_0SMxAVz1SI82qbVbu-PkcL121IWtHY1VUPWTI5_fRf-cWE9v6hSAlM0NIG1DxiKRAZrlzGaIx-F9a_bnlQQEsWFWlODm-TVo3jMRvjjguJc1bQ0gYXv4Ul14K2yKKhNzAhOvhVQj1wLa-px2RQjLc0ndrvnRyzlDswAzyFipiwPi8yCbE-O-Hyow',
    },
  ]);

  // 3. Dynamic Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'pending') return tx.status === 'Pending';
    if (activeTab === 'paid') return tx.status === 'Settled';
    if (activeTab === 'reversals') return tx.status === 'Reversed';
    return true;
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 📥 Real Monthly Report Download
  const handleDownloadReport = () => {
    const reportHeader = 'Order ID,Customer,Amount,Status,Date\n';
    const reportRows = transactions
      .map((t) => `${t.orderId},${t.customer},₹${Math.abs(t.amount)},${t.status},${t.date}`)
      .join('\n');

    const fullContent =
      `=========================================\nMSHOPPY RESELLER MONTHLY EARNINGS REPORT\nMonth: October 2023\nTotal Balance: ₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nPending Amount: ₹${pendingAmount.toFixed(2)}\nOrders Delivered: 184\n=========================================\n\n` +
      reportHeader +
      reportRows;

    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MShoppy_Earnings_Report_Oct2023.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] antialiased min-h-screen pb-32 font-sans relative selection:bg-[#FF3F6C]/20">
      {/* 1. TopAppBar - Full Width */}
      <header className="bg-white dark:bg-[#191C1E] relative border-b border-gray-100 dark:border-slate-800">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[#FF3F6C] cursor-pointer active:scale-95 duration-150 p-1.5 hover:bg-rose-50 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg sm:text-xl tracking-tight text-[#191C1E] dark:text-white">
              My Earnings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/withdraw-earnings')}
              className="flex items-center gap-2 bg-[#FF3F6C] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#b90041] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              Withdraw
            </button>
            <span
              onClick={() => alert("Earnings are automatically transferred on the payout date.")}
              className="material-symbols-outlined text-[#191C1E]/60 dark:text-white/60 cursor-pointer transition-colors hover:bg-[#F2F4F6] p-2 rounded-full"
            >
              help
            </span>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 2. Main Content - Full Width Desktop & Mobile Responsive (Strict Vertical Flow) */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pt-6 pb-24 space-y-8">
        {/* Return Margin Reversals Alert Banner */}
        <div 
          onClick={() => navigate('/reseller-returns')}
          className="bg-amber-50/90 border border-amber-200/80 hover:border-amber-300 rounded-2xl p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer shadow-xs transition-all hover:bg-amber-100/70 group"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">assignment_return</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-bold text-amber-950">
                  5 Customer Returns Processed
                </p>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  -₹1,450 Reversed
                </span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium hidden sm:block mt-0.5">
                Customer returns reverse credited margins from upcoming payouts. View deduction audit trail & inquiry hub.
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/reseller-returns'); }}
            className="shrink-0 text-xs font-bold text-[#b90041] bg-white px-3 py-1.5 rounded-xl border border-rose-100 shadow-xs group-hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
          >
            Ledger
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        {/* Total Earnings Card */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-br from-[#b90041] to-[#df2457]">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div>
              <p className="text-white/80 font-medium text-sm tracking-wide mb-1">Total Earnings</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Pending Amount</p>
                <p className="text-lg sm:text-xl font-bold">₹{pendingAmount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Next Payout Date</p>
                <p className="text-lg sm:text-xl font-bold">28th Oct</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid (2 Horizontal Cards) */}
        <section className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#4d41df]/10 flex items-center justify-center mb-4 text-[#4d41df]">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <p className="text-slate-500 text-xs font-medium">Growth this month</p>
            <p className="text-[#191c1e] font-bold text-lg sm:text-xl mt-0.5">+12.5%</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#008644]/10 flex items-center justify-center mb-4 text-[#008644]">
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <p className="text-slate-500 text-xs font-medium">Orders Delivered</p>
            <p className="text-[#191c1e] font-bold text-lg sm:text-xl mt-0.5">184</p>
          </div>
        </section>

        {/* Tabs Section */}
        <section>
          <div className="flex gap-1.5 sm:gap-2 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-[#b90041] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-white text-[#b90041] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'paid'
                  ? 'bg-white text-[#b90041] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settled
            </button>
            <button
              onClick={() => setActiveTab('reversals')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reversals'
                  ? 'bg-white text-rose-700 shadow-xs font-bold border border-rose-100'
                  : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              Reversals 🔄
            </button>
          </div>
        </section>

        {/* Transaction List (Strict Vertical Flow) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#191c1e] font-bold text-base sm:text-lg">Recent Activity</h3>
            <button
              onClick={handleDownloadReport}
              className="text-[#b90041] text-xs sm:text-sm font-semibold hover:underline cursor-pointer"
            >
              Download Monthly Report
            </button>
          </div>

          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md border ${
                  tx.status === 'Reversed'
                    ? 'bg-rose-50/40 border-rose-100'
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt={tx.customer}
                    src={tx.image}
                  />
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[#191c1e] font-bold text-sm sm:text-base truncate">
                      {tx.orderId} • {tx.customer}
                    </p>
                    <span
                      className={`font-bold text-sm sm:text-base tracking-tight ${
                        tx.status === 'Reversed'
                          ? 'text-rose-600 font-extrabold'
                          : tx.status === 'Settled'
                          ? 'text-emerald-700'
                          : 'text-[#4d41df]'
                      }`}
                    >
                      {tx.amount < 0 ? `-₹${Math.abs(tx.amount).toFixed(2)}` : `+₹${tx.amount.toFixed(2)}`}
                    </span>
                  </div>
                  {tx.reason && (
                    <p className="text-xs text-rose-600 font-medium truncate mb-1">
                      {tx.reason}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tx.status === 'Reversed'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : tx.status === 'Settled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-[#4d41df]'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className="text-slate-400 text-[11px]">{tx.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bank Details Status Card */}
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-[#b90041] rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">account_balance</span>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#191c1e]">HDFC Bank •••• 4321</h4>
              <p className="text-xs text-slate-500">Auto-credited every Wednesday</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/payout-settings')}
            className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
          >
            Manage
          </button>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}