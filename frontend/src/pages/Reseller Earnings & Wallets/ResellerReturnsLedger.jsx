import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';

// Mock Reseller Margin Reversal Records (Connected to Panel 1 Customer Returns)
const INITIAL_REVERSALS = [
  {
    id: 'REV-9921',
    returnId: 'RET-8921',
    orderId: 'ORD-88210',
    customerName: 'Priya Sharma',
    customerCity: 'Jaipur, RJ',
    productName: 'Banarasi Silk Embroidered Kurti - Pink (M)',
    productSku: 'BSK-PNK-M',
    originalOrderPrice: 1299,
    originalMargin: 300,
    reversedMargin: 300,
    formattedReversed: '-₹300.00',
    returnReason: 'Size too small / Fitting issue',
    returnDate: '24 Oct 2024',
    reversalDate: '25 Oct 2024',
    status: 'Deducted', // 'Deducted' | 'Pending Reversal' | 'Dispute Under Review'
    walletDeductionStatus: 'Debited from Current Balance',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    sharedOn: 'WhatsApp Catalog',
    customerNotes: 'Customer ordered M, but shoulders were tight. Picked up by Rider RID-4402.',
  },
  {
    id: 'REV-9920',
    returnId: 'RET-8890',
    orderId: 'ORD-88002',
    customerName: 'Ritu Verma',
    customerCity: 'Lucknow, UP',
    productName: 'Designer Cotton Tee - Navy (L)',
    productSku: 'TEE-NVY-L',
    originalOrderPrice: 699,
    originalMargin: 150,
    reversedMargin: 150,
    formattedReversed: '-₹150.00',
    returnReason: 'Fabric color variation from photo',
    returnDate: '23 Oct 2024',
    reversalDate: '24 Oct 2024',
    status: 'Deducted',
    walletDeductionStatus: 'Debited from Current Balance',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    sharedOn: 'Instagram Story Link',
    customerNotes: 'Navy shade appeared darker than expected.',
  },
  {
    id: 'REV-9919',
    returnId: 'RET-8812',
    orderId: 'ORD-87941',
    customerName: 'Ananya Rao',
    customerCity: 'Bengaluru, KA',
    productName: 'Georgette Printed Saree - Royal Blue',
    productSku: 'SAR-GEO-BLU',
    originalOrderPrice: 849,
    originalMargin: 200,
    reversedMargin: 200,
    formattedReversed: '-₹200.00',
    returnReason: 'Customer changed mind at delivery',
    returnDate: '22 Oct 2024',
    reversalDate: 'Pending Warehouse Delivery',
    status: 'Pending Reversal',
    walletDeductionStatus: 'Will be adjusted upon warehouse intake',
    imageUrl:
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    sharedOn: 'Facebook Group Share',
    customerNotes: 'Courier reverse pickup completed. Parcel in-transit to Surat Hub.',
  },
  {
    id: 'REV-9880',
    returnId: 'RET-8701',
    orderId: 'ORD-87720',
    customerName: 'Neha Gupta',
    customerCity: 'South Delhi, DL',
    productName: 'Floral Chiffon Maxi Dress',
    productSku: 'DRS-CHI-MAX',
    originalOrderPrice: 1499,
    originalMargin: 450,
    reversedMargin: 450,
    formattedReversed: '-₹450.00',
    returnReason: 'Defective zipper / Fabric tear',
    returnDate: '19 Oct 2024',
    reversalDate: '21 Oct 2024',
    status: 'Deducted',
    walletDeductionStatus: 'Debited from Current Balance',
    imageUrl:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    sharedOn: 'Direct WhatsApp Chat',
    customerNotes: 'Manufacturer defect verified by QC. Full refund issued to buyer.',
  },
  {
    id: 'REV-9842',
    returnId: 'RET-8619',
    orderId: 'ORD-87401',
    customerName: 'Pooja Mishra',
    customerCity: 'Patna, BR',
    productName: 'Minimalist Gold Chrono Watch',
    productSku: 'GLD-WTC-01',
    originalOrderPrice: 2499,
    originalMargin: 350,
    reversedMargin: 350,
    formattedReversed: '-₹350.00',
    returnReason: 'Customer claims dial was damaged in transit',
    returnDate: '16 Oct 2024',
    reversalDate: '18 Oct 2024',
    status: 'Dispute Under Review',
    walletDeductionStatus: 'Margin withheld pending dispute audit',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    sharedOn: 'WhatsApp Broadcast List',
    customerNotes: 'Reseller submitted ticket #TKT-REV-8619 questioning courier packaging condition.',
  },
];

export default function ResellerReturnsLedger({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'deducted' | 'pending' | 'disputed'
  const [searchQuery, setSearchQuery] = useState('');
  const [reversals, setReversals] = useState(INITIAL_REVERSALS);
  const [toastMessage, setToastMessage] = useState(null);

  // Inquiry / Dispute Modal State
  const [disputeItem, setDisputeItem] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Customer confirmed size beforehand on WhatsApp');
  const [disputeRemarks, setDisputeRemarks] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Return Reduction Toolkit Expand Toggle
  const [showTips, setShowTips] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNav = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
  };

  // Submit Reseller Dispute Inquiry
  const handleSubmitDispute = (e) => {
    e.preventDefault();
    if (!disputeItem) return;

    setIsSubmittingDispute(true);
    setTimeout(() => {
      const ticketId = `TKT-REV-${Math.floor(1000 + Math.random() * 9000)}`;
      setReversals((prev) =>
        prev.map((r) =>
          r.id === disputeItem.id
            ? { ...r, status: 'Dispute Under Review', customerNotes: `Dispute filed (${ticketId}): ${disputeReason}. ${disputeRemarks}` }
            : r
        )
      );
      setIsSubmittingDispute(false);
      setDisputeItem(null);
      setDisputeRemarks('');
      showToast(`🛡️ Inquiry ${ticketId} Raised! Support will review within 24 hours.`);
    }, 600);
  };

  // Export CSV Statement
  const handleExportCSV = () => {
    const headers = ['Reversal ID', 'Order ID', 'Return ID', 'Customer Name', 'City', 'Product', 'Original Margin', 'Reversed Amount', 'Status', 'Reversal Date'];
    const rows = reversals.map((r) => [
      r.id,
      r.orderId,
      r.returnId,
      r.customerName,
      r.customerCity,
      r.productName,
      `₹${r.originalMargin}`,
      r.formattedReversed,
      r.status,
      r.reversalDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MShoppy_Reseller_Margin_Reversals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Downloaded Reversal Ledger Statement successfully!');
  };

  // Copy WhatsApp Sizing Guide
  const handleCopySizeGuide = () => {
    const guideText = `🛍️ *MShoppy Sizing Guide for Kurti & Western Wear*:\n\n📏 *Bust Size Tips*:\n• S: 36 inches | M: 38 inches\n• L: 40 inches | XL: 42 inches | XXL: 44 inches\n\n💡 *Tip for perfect fit*: Please pick 1 size larger if you prefer relaxed ethnic fitting. 100% replacement available within 7 days!`;
    navigator.clipboard.writeText(guideText);
    showToast('📋 Copied WhatsApp Size Guide! Paste and send to customers to reduce returns.');
  };

  // Filtered Items
  const filteredReversals = reversals.filter((item) => {
    if (activeTab === 'deducted' && item.status !== 'Deducted') return false;
    if (activeTab === 'pending' && item.status !== 'Pending Reversal') return false;
    if (activeTab === 'disputed' && item.status !== 'Dispute Under Review') return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.orderId.toLowerCase().includes(q) ||
      item.returnId.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q)
    );
  });

  const totalGrossMargins = 28450;
  const totalReversed = reversals.reduce((acc, curr) => acc + curr.reversedMargin, 0);
  const netSettled = totalGrossMargins - totalReversed;
  const returnRatePercent = ((totalReversed / totalGrossMargins) * 100).toFixed(1);

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-sans antialiased pb-28 selection:bg-rose-500/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 max-w-[90vw] animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
          <span className="text-xs sm:text-sm font-bold truncate">{toastMessage}</span>
        </div>
      )}

      {/* ================= Header (Mobile Responsive) ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => (onBack ? onBack() : handleNav('/reseller-wallet'))}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="Go to Reseller Wallet"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-[#FF3F6C] flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                <span className="material-symbols-outlined text-base sm:text-lg">assignment_return</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-extrabold text-xs sm:text-base text-slate-900 font-headline truncate">
                    Returned Orders &amp; Margin Reversals
                  </h1>
                  <span className="bg-rose-100 text-rose-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    Panel 5
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate hidden xs:block">
                  Reseller Margin Deductions • Customer Returns Breakdown • Net Earnings Audit
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => handleNav('/dropshipper-rot-manager')}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="ROT Liability & Policy Manager"
            >
              <span>🛡️</span>
              <span className="hidden sm:inline">ROT Policy</span>
            </button>

            <button
              onClick={() => handleNav('/dropshipper-settlements')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Full Order Settlement & Tracking"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Settlement</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Download Statement"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="hidden md:inline">Statement</span>
            </button>

            <button
              onClick={() => handleNav('/reseller-wallet')}
              className="bg-[#FF3F6C] hover:bg-[#e0355f] text-white px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <span className="hidden sm:inline">My Wallet</span>
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* ================= Hero Financial Impact Ribbon (Mobile 2x2 Grid) ================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Gross Margins */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                Gross Margins
              </p>
              <span className="text-base sm:text-xl">💰</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 font-headline">
              ₹{totalGrossMargins.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 truncate">
              Before return deductions
            </p>
          </div>

          {/* Reversed Margins */}
          <div className="bg-rose-50/70 p-3.5 sm:p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-700">
                Reversed Margins
              </p>
              <span className="text-base sm:text-xl">🔄</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-rose-700 font-headline">
              -₹{totalReversed.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-rose-600 font-bold mt-0.5 truncate">
              {reversals.length} Customer Returns
            </p>
          </div>

          {/* Net Settled Wallet */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                Net Settled
              </p>
              <span className="text-base sm:text-xl">🏦</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-emerald-700 font-headline">
              ₹{netSettled.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-0.5 truncate">
              Eligible for Bank Transfer
            </p>
          </div>

          {/* Return Impact Rate */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                Reversal Impact
              </p>
              <span className="text-base sm:text-xl">📊</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 font-headline">
              {returnRatePercent}%
            </h3>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 truncate">
              Healthy benchmark (&lt; 8%)
            </p>
          </div>
        </section>

        {/* ================= Policy Clarification Banner ================= */}
        <section className="bg-gradient-to-r from-amber-50 via-white to-rose-50/50 p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0 mt-0.5 sm:mt-0">
              💡
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 font-headline">
                Why was my margin reversed?
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                As per MShoppy Reseller Guidelines, if a buyer returns a product within the 7-day window, the profit margin is canceled. If you believe the customer kept the item or the return was invalid, you can raise an inquiry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="self-stretch sm:self-auto px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap text-center"
          >
            {showTips ? 'Hide Tips' : 'Tips to Reduce Returns ➔'}
          </button>
        </section>

        {/* ================= Return Reduction Guide (Expandable) ================= */}
        {showTips && (
          <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-xl shrink-0">psychology</span>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 font-headline">
                  Reseller Toolkit: 3 Ways to Reduce Customer Returns by 40%
                </h4>
              </div>
              <button
                onClick={handleCopySizeGuide}
                className="self-start sm:self-auto px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span>Copy WhatsApp Sizing Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 font-bold block">1. Confirm Bust / Waist Before Booking</strong>
                <p className="text-slate-500">65% of clothing returns happen due to size guesswork. Ask customer their exact inch size before placing order.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 font-bold block">2. Share Real Daylight Photos</strong>
                <p className="text-slate-500">Studio lighting can shift saree hues. Mention in chat: "Color is rich Banarasi pink with gold zari sheen".</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 font-bold block">3. Encourage Size Exchange over Return</strong>
                <p className="text-slate-500">If buyer has fit issues, guide them to request an Exchange in the MShoppy app so your margin remains intact!</p>
              </div>
            </div>
          </section>
        )}

        {/* ================= Tabs & Search Toolbar ================= */}
        <section className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Tab buttons horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Adjustments', count: reversals.length },
              { id: 'deducted', label: 'Deducted 🔄', count: reversals.filter((r) => r.status === 'Deducted').length },
              { id: 'pending', label: 'Pending Reversals ⏳', count: reversals.filter((r) => r.status === 'Pending Reversal').length },
              { id: 'disputed', label: 'Under Review 🛡️', count: reversals.filter((r) => r.status === 'Dispute Under Review').length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#FF3F6C] text-white shadow-md shadow-pink-500/25 scale-[1.01]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Return ID, Buyer, Item..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3F6C] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* ================= Reversals Cards Queue ================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-slate-500">
              Margin Deductions Ledger ({filteredReversals.length})
            </h4>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Linked with MShoppy Returns Pipeline
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredReversals.map((item) => {
              const isDeducted = item.status === 'Deducted';
              const isDisputed = item.status === 'Dispute Under Review';

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left: Product & Buyer Details */}
                  <div className="flex items-start gap-3 w-full md:w-auto">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900">
                          {item.id}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                          Ord: {item.orderId}
                        </span>
                        <span className="bg-rose-50 text-rose-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-md">
                          {item.returnId}
                        </span>
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                            isDeducted
                              ? 'bg-rose-100 text-rose-700'
                              : isDisputed
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {item.productName}
                      </h5>

                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-medium flex-wrap">
                        <span>
                          Customer: <strong className="text-slate-800">{item.customerName}</strong> ({item.customerCity})
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">Channel: {item.sharedOn}</span>
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-slate-500">
                        Reason: <strong className="text-rose-600 font-semibold">{item.returnReason}</strong>
                      </p>

                      <p className="text-[10px] text-slate-400 italic">
                        "{item.customerNotes}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Margin Deduction Amount & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-base sm:text-lg font-black text-rose-600 font-headline">
                        {item.formattedReversed}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        Original Margin: +₹{item.originalMargin}.00
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.walletDeductionStatus}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Date: {item.reversalDate}
                      </div>
                    </div>

                    <div>
                      {isDisputed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
                          <span className="material-symbols-outlined text-sm">hourglass_top</span>
                          <span>Inquiry Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setDisputeItem(item);
                            setDisputeRemarks('');
                          }}
                          className="px-3 sm:px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-sm">support_agent</span>
                          <span>Inquire / Dispute</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ================= Reseller Dispute Inquiry Modal ================= */}
      {disputeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDisputeItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold shrink-0">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-headline">
                    Inquire on Margin Reversal
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Order #{disputeItem.orderId} • Return #{disputeItem.returnId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDisputeItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitDispute} className="flex-1 overflow-y-auto py-3 sm:py-4 space-y-3.5 pr-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-500">
                  Item: <strong className="text-slate-800">{disputeItem.productName}</strong>
                </p>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Deducted Margin:</span>
                  <span className="text-rose-600">{disputeItem.formattedReversed}</span>
                </div>
                <p className="text-slate-500">
                  Buyer Reason: <span className="text-slate-700">{disputeItem.returnReason}</span>
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Why do you want to dispute this reversal?
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#FF3F6C]"
                >
                  <option value="Customer confirmed size beforehand on WhatsApp">Customer confirmed size beforehand on WhatsApp</option>
                  <option value="Customer claims non-receipt but courier shows delivered">Customer claims non-receipt but courier shows delivered</option>
                  <option value="Suspected fraudulent return / buyer returned different item">Suspected fraudulent return / buyer returned different item</option>
                  <option value="Incorrect margin amount deducted from wallet">Incorrect margin amount deducted from wallet</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Explanation / WhatsApp Chat Screenshot Reference:
                </label>
                <textarea
                  rows={3}
                  value={disputeRemarks}
                  onChange={(e) => setDisputeRemarks(e.target.value)}
                  placeholder="Provide any order details or customer communication notes to help Partner Support review..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3F6C]"
                  required
                />
              </div>

              <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl text-[11px] leading-relaxed">
                ℹ️ Our Reseller Advocate team will audit the courier delivery record and WhatsApp details within 24 hours. If approved, the reversed margin (+{disputeItem.formattedReversed.replace('-', '')}) will be refunded back to your wallet.
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDisputeItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-4 py-2 bg-[#FF3F6C] hover:bg-[#e0355f] text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isSubmittingDispute ? 'Submitting...' : 'Submit Inquiry ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Bottom Navigation */}
      <AppBottomNav activeNav="earnings" onNavChange={(id) => handleNav(id)} />
    </div>
  );
}
