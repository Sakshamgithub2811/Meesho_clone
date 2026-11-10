import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getDropshipperRotDataApi,
  updateDropshipperRotPlanApi,
  submitRotDisputeApi
} from '../../services/dropshipperService';
import { 
  ShieldCheck, 
  RotateCcw, 
  RefreshCw, 
  Loader2, 
  ArrowLeft, 
  Receipt, 
  Gavel, 
  Send, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Package,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export default function DropshipperRotManager() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Derive Dropshipper UID
  let userUid = currentUser?.uid || currentUser?.id || '';
  if (!userUid) {
    try {
      const sessionStr = localStorage.getItem('meesho_dropshipper_session');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        userUid = parsed.dropshipperId || parsed.uid || '';
      }
    } catch (e) {
      // ignore
    }
  }
  const effectiveUid = userUid;

  // Live State from PostgreSQL Database
  const [activePlan, setActivePlan] = useState('Shared Shield'); // 'Zero-Risk Lite' | 'Shared Shield' | 'High Margin Pro'
  const [returnsList, setReturnsList] = useState([]);
  const [serverMetrics, setServerMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(effectiveUid));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const [filterType, setFilterType] = useState('ALL');
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [disputeNote, setDisputeNote] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Break-even calculator state
  const [calcSellingPrice, setCalcSellingPrice] = useState(999);
  const [calcSupplierPrice, setCalcSupplierPrice] = useState(649);
  const [calcEstReturnRate, setCalcEstReturnRate] = useState(8); // %

  const grossMargin = calcSellingPrice - calcSupplierPrice;
  const avgRotPerReturn = activePlan === 'Zero-Risk Lite' ? 0 : activePlan === 'Shared Shield' ? 35 : 65;
  const planInsuranceFee = activePlan === 'Zero-Risk Lite' ? 15 : 0;
  const expectedReturnCostPer100Orders = (calcEstReturnRate * (grossMargin + avgRotPerReturn));
  const netEstimatedProfitPer100Orders = (100 * grossMargin) - expectedReturnCostPer100Orders - (100 * planInsuranceFee);
  const netProfitPerOrder = Math.round(netEstimatedProfitPer100Orders / 100);

  const totalRotPaid = returnsList.reduce((acc, curr) => acc + curr.rotAmount, 0);
  const totalMarginReversed = returnsList.reduce((acc, curr) => acc + curr.reversedMargin, 0);

  // Filtered returns
  const filteredReturns = useMemo(() => {
    return returnsList.filter((item) =>
      filterType === 'ALL'
        ? true
        : filterType === 'ROT_CHARGED'
        ? item.rotAmount > 0
        : item.rotAmount === 0
    );
  }, [returnsList, filterType]);

  // Trigger Toast helper
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // 1. Fetch Real Database ROT Data & Return Orders
  const fetchRotData = async (silent = false) => {
    if (!effectiveUid) {
      setReturnsList([]);
      setServerMetrics(null);
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await getDropshipperRotDataApi(effectiveUid);
      if (res && res.success) {
        setActivePlan(res.activePlan || 'Shared Shield');
        setReturnsList(res.returns || []);
        setServerMetrics(res.metrics || null);
      }
    } catch (err) {
      console.error('Failed to fetch dropshipper ROT data:', err);
      triggerToast(err.response?.data?.message || 'Failed to sync ROT data from database');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRotData();
  }, [effectiveUid]);

  // 2. Select & Save ROT Protection Plan in Database
  const handleSelectPlan = async (planId) => {
    if (activePlan === planId) return;
    setActivePlan(planId);

    if (!effectiveUid) {
      triggerToast(`Plan switched to ${planId}`);
      return;
    }

    setIsUpdatingPlan(true);
    try {
      const res = await updateDropshipperRotPlanApi({
        firebaseUid: effectiveUid,
        planName: planId
      });
      if (res && res.success) {
        triggerToast(`ROT Protection Plan updated to '${planId}' in database!`);
        fetchRotData(true);
      }
    } catch (err) {
      console.error('Failed to update ROT plan:', err);
      triggerToast(err.response?.data?.message || 'Failed to update ROT plan in database');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // 3. Submit ROT Reverse Freight Dispute Ticket
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setIsSubmittingDispute(true);
    try {
      const res = await submitRotDisputeApi({
        firebaseUid: effectiveUid,
        orderId: selectedReturn.dbOrderId || selectedReturn.orderId,
        returnId: selectedReturn.returnId,
        reason: 'Inaccurate Return Reason / Customer Remorse Contested',
        description: disputeNote
      });

      if (res && res.success) {
        setReturnsList((prev) =>
          prev.map((item) =>
            item.id === selectedReturn.id
              ? {
                  ...item,
                  disputeStatus: 'Admin Reviewing (Dispute Raised)',
                  claimId: res.claimId
                }
              : item
          )
        );
        triggerToast(`Dispute #${res.claimId} submitted! ROT reverse freight debit placed on hold.`);
      }
    } catch (err) {
      console.error('Failed to submit ROT dispute:', err);
      triggerToast(err.response?.data?.message || 'Failed to submit dispute ticket');
    } finally {
      setIsSubmittingDispute(false);
      setDisputeModalOpen(false);
      setDisputeNote('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900 pb-32 sm:pb-24 font-sans antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4">
          
          {/* Top Row: Back button + Title & Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate('/dropshipper-settlements')}
              className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer transition"
              title="Back to Settlements"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Settlement Hub</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-200 shrink-0"></div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                  Dropshipper Policy
                </span>
                <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                  <span className="truncate">ROT & Return Liability Policy</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block truncate">
                Configure return liability tier, audit margin reversals, and dispute wrongful ROT reverse freight.
              </p>
            </div>
          </div>

          {/* Action Buttons Row (Responsive horizontal scroll on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0 shrink-0">
            <button
              onClick={() => fetchRotData(true)}
              disabled={isLoading || isRefreshing}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => navigate('/dropshipper-settlements')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
              <span>Settlements</span>
            </button>

            <button
              onClick={() => navigate('/dropshipper-margin-config')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#b90041]" />
              <span>Margins</span>
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toastMsg && (
          <div className="bg-emerald-50 border-t border-b border-emerald-200 px-4 py-2 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* 1. KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Active Return Plan */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">Active Plan</div>
              <div className="text-sm sm:text-lg font-black text-slate-900 truncate">{activePlan}</div>
              <div className="text-[10px] sm:text-[11px] text-purple-600 font-medium truncate">
                {activePlan === 'Zero-Risk Lite' ? '100% Platform Shield' : activePlan === 'Shared Shield' ? '50% ROT Remorse Shield' : '100% Dropshipper Liability'}
              </div>
            </div>
          </div>

          {/* Card 2: Total Margin Reversals */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">Margin Reversals</div>
              <div className="text-sm sm:text-xl font-black text-rose-600 truncate">₹{totalMarginReversed}.00</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">{returnsList.length} Returned Items</div>
            </div>
          </div>

          {/* Card 3: ROT Debited from Wallet */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">ROT Freight Debit</div>
              <div className="text-sm sm:text-xl font-black text-amber-600 truncate">₹{totalRotPaid}.00</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Reverse Courier Share</div>
            </div>
          </div>

          {/* Card 4: Wallet Balance */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">Wallet Balance</div>
              <div className="text-sm sm:text-xl font-black text-emerald-600 truncate">
                ₹{(serverMetrics?.walletBalance || 0).toLocaleString('en-IN')}.00
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium truncate">
                {returnsList.length > 0 ? (totalRotPaid > 0 ? 'ROT Adjusted' : '100% Protected') : 'Clean Ledger'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. PLAN SELECTION CARDS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <span>Select Your Dropshipper Return & ROT Protection Plan</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Choose how return reverse logistics costs are handled for your customer orders (Auto-saved to database).
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5 shrink-0">
              {isUpdatingPlan && <Loader2 className="w-3 h-3 animate-spin text-purple-600" />}
              <span>Current Tier: {activePlan}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1">
            {[
              {
                id: 'Zero-Risk Lite',
                name: 'Zero-Risk Lite Plan',
                tag: '100% Peace of Mind',
                cost: '₹15 / Shipped Order',
                rotOnRemorse: '₹0 (100% Platform Covered)',
                rotOnDefect: '₹0 (Supplier Pays)',
                bestFor: 'Beginners & High-Volume Resellers',
                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              },
              {
                id: 'Shared Shield',
                name: 'Shared Shield (Standard)',
                tag: 'Recommended Default',
                cost: '₹0 Upfront Fee',
                rotOnRemorse: '50% ROT (Avg ₹35 / Return)',
                rotOnDefect: '₹0 (Supplier Pays)',
                bestFor: 'Standard Fashion & Home Catalogs',
                badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
              },
              {
                id: 'High Margin Pro',
                name: 'High Margin Pro',
                tag: 'Max Profit Potential',
                cost: '₹0 Upfront + Lowest Base Price',
                rotOnRemorse: '100% ROT (Avg ₹65 / Return)',
                rotOnDefect: '₹0 (Supplier Pays)',
                bestFor: 'Electronics & High-Margin Premium',
                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
              },
            ].map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                  activePlan === plan.id
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {activePlan === plan.id && (
                  <span className="absolute -top-2.5 right-4 bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                    Active Plan
                  </span>
                )}
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1.5 ${plan.badgeColor}`}>
                    {plan.tag}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900">{plan.name}</h3>
                  <div className="text-xs font-bold text-purple-700 mt-0.5">{plan.cost}</div>

                  <div className="space-y-1.5 mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Buyer Remorse ROT:</span>
                      <span className="font-bold text-slate-800">{plan.rotOnRemorse}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Supplier Defect ROT:</span>
                      <span className="font-bold text-emerald-600">{plan.rotOnDefect}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1.5">Best for: {plan.bestFor}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-3.5 w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activePlan === plan.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isUpdatingPlan && activePlan === plan.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{activePlan === plan.id ? 'Selected Tier' : 'Switch to this Plan'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RETURN ORDERS & ROT DEDUCTION LEDGER (100% RESPONSIVE) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Row with Filter Buttons */}
          <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                <span>Returned Orders & Margin Reversal Audit</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Exact mathematical breakdown of reversed margins and applicable ROT reverse freight.
              </p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
              {[
                { id: 'ALL', label: 'All Returns' },
                { id: 'ROT_CHARGED', label: 'ROT Debited' },
                { id: 'ZERO_ROT', label: '₹0 ROT Protected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    filterType === tab.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          {isLoading ? (
            /* Loading State */
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="text-xs font-bold text-slate-700">Connecting to PostgreSQL Return Ledger...</span>
              <p className="text-[11px] text-slate-400">Loading verified returns, margin debits and ROT coverage.</p>
            </div>
          ) : returnsList.length === 0 ? (
            /* Enterprise Clean Empty State (Fully Centered, Zero Horizontal Scroll!) */
            <div className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mb-3.5 border border-purple-100 shadow-inner">
                🛡️
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">No Return Claims or ROT Debits</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Your dropshipper orders currently have zero returns. If a customer initiates a return or an order is marked RTO, the exact reverse freight and margin breakdown will appear here under your active policy.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                <button
                  onClick={() => navigate('/dropshipper-margin-config')}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  Configure Margins
                </button>
                <button
                  onClick={() => navigate('/dropshipper-settlements')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Settlement Hub
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order & Return ID</th>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Customer Reason & Fault</th>
                      <th className="py-3 px-4 text-center">Margin Reversed</th>
                      <th className="py-3 px-4 text-center">ROT Charged</th>
                      <th className="py-3 px-4 text-center">Total Net Debit</th>
                      <th className="py-3 px-4">Status & Dispute</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReturns.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{item.orderId}</div>
                          <div className="text-[11px] text-purple-600 font-semibold">{item.returnId}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.returnDate}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.productImg}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">SKU: {item.productSku}</div>
                              <div className="text-[10px] text-slate-600 font-medium">
                                Sell: ₹{item.sellingPrice} | Base: ₹{item.supplierPrice}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-800">{item.customerReturnReason}</div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${
                              item.rotAmount > 0
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {item.faultAttribution}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-600">
                          -₹{item.reversedMargin}.00
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {item.rotAmount > 0 ? (
                            <span className="text-amber-600">-₹{item.rotAmount}.00</span>
                          ) : (
                            <span className="text-emerald-600">₹0.00</span>
                          )}
                          <div className="text-[9px] text-slate-400">{item.rotLiability}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                          -₹{item.netResellerDebit}.00
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-700">{item.walletStatus}</div>
                          {item.disputeStatus && (
                            <div className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mt-1 inline-block">
                              {item.disputeStatus}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReturn(item);
                              setDisputeModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Dispute</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< 768px) - 100% Touch & Mobile Optimized */}
              <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
                {filteredReturns.map((item) => (
                  <div key={item.id} className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
                    {/* Top: Order & Return ID + Dispute Button */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                      <div>
                        <div className="font-black text-xs text-slate-900">{item.orderId}</div>
                        <div className="text-[10px] text-purple-700 font-bold">{item.returnId} • {item.returnDate}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReturn(item);
                          setDisputeModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Gavel className="w-3 h-3 text-purple-600" />
                        <span>Dispute</span>
                      </button>
                    </div>

                    {/* Middle: Product Details */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.productImg}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-800 truncate">{item.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {item.productSku}</div>
                        <div className="text-[10px] text-slate-600">Sell: ₹{item.sellingPrice} | Wholesale: ₹{item.supplierPrice}</div>
                      </div>
                    </div>

                    {/* Reason & Fault Attribution */}
                    <div className="text-xs bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                      <div className="text-[11px] text-slate-700"><strong>Reason:</strong> {item.customerReturnReason}</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.rotAmount > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.faultAttribution}
                      </span>
                    </div>

                    {/* Bottom: Financial Debits & Net Math */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/70">
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Margin Loss</span>
                        <strong className="text-rose-600 font-bold">-₹{item.reversedMargin}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">ROT Freight</span>
                        <strong className={item.rotAmount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {item.rotAmount > 0 ? `-₹${item.rotAmount}` : '₹0'}
                        </strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Total Debit</span>
                        <strong className="text-slate-900 font-black">-₹{item.netResellerDebit}</strong>
                      </div>
                    </div>

                    {item.disputeStatus && (
                      <div className="text-[10px] text-purple-700 font-bold bg-purple-50 p-2 rounded-xl border border-purple-200 text-center">
                        {item.disputeStatus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 4. BREAK-EVEN PROFITABILITY CALCULATOR (RESPONSIVE) */}
        <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white p-4 sm:p-6 rounded-2xl shadow-lg space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-800/60 pb-3 gap-1.5">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-purple-300">
                <span className="text-base sm:text-lg">🧮</span>
                <span>Dropshipper Net Margin & Return Break-Even Simulator</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-purple-200/70 mt-0.5">
                Calculate expected net profit after accounting for return rates and ROT liability.
              </p>
            </div>
            <span className="text-[10px] sm:text-xs bg-purple-400/20 text-purple-300 font-bold px-2.5 py-1 rounded-full border border-purple-400/30 self-start sm:self-auto">
              Live Projections
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-1">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-purple-200 mb-1">Customer Price (₹)</label>
                <input
                  type="number"
                  value={calcSellingPrice}
                  onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                  className="w-full bg-purple-900/40 border border-purple-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-purple-200 mb-1">Supplier Base Price (₹)</label>
                <input
                  type="number"
                  value={calcSupplierPrice}
                  onChange={(e) => setCalcSupplierPrice(Number(e.target.value))}
                  className="w-full bg-purple-900/40 border border-purple-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-purple-200 mb-1">Est. Return Rate (%)</label>
                <input
                  type="number"
                  value={calcEstReturnRate}
                  onChange={(e) => setCalcEstReturnRate(Number(e.target.value))}
                  className="w-full bg-purple-900/40 border border-purple-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-purple-900/50 border border-purple-700/60 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] sm:text-xs text-purple-300 font-semibold">Net Expected Profit / Order</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  ₹{netProfitPerOrder}.00
                </div>
                <div className="text-[10px] sm:text-[11px] text-purple-200/80 mt-1">
                  Gross: ₹{grossMargin} | Avg ROT Risk: ₹{Math.round((calcEstReturnRate / 100) * avgRotPerReturn)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] sm:text-xs text-purple-300 font-semibold">Profit / 100 Orders</div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
                  ₹{netEstimatedProfitPer100Orders.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* DISPUTE MODAL (RESPONSIVE) */}
      {disputeModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 truncate">
                <Gavel className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">Dispute Return: {selectedReturn.orderId}</span>
              </h3>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product & Customer Claim
                </label>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1 border border-slate-100">
                  <div className="truncate"><strong>Item:</strong> {selectedReturn.productName}</div>
                  <div><strong>Customer Claimed:</strong> "{selectedReturn.customerReturnReason}"</div>
                  <div><strong>ROT Debit Applied:</strong> ₹{selectedReturn.rotAmount}.00</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispute Grounds & Evidence
                </label>
                <textarea
                  required
                  rows="3"
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder="Explain why customer return reason was inaccurate (e.g. Catalog clearly specified fabric type, WhatsApp chat screenshot attached)."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingDispute && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingDispute ? 'Submitting Dispute...' : 'Submit Dispute'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav */}
      <AppBottomNav activeNav="earnings" />
    </div>
  );
}
