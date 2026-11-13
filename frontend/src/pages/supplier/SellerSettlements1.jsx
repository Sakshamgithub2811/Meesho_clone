import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  Banknote,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  CreditCard,
  ArrowUpRight,
  Download,
  AlertCircle,
  Copy,
  Receipt,
  FileText,
  X,
  Wallet
} from 'lucide-react';

export default function SellerSettlements1({ onNavigate, embedded = false, onNavigateTab }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financeData, setFinanceData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const loadSettlementsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [financeRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierSettlements(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (financeRes.status === 'fulfilled' && financeRes.value) {
        setFinanceData(financeRes.value);
      } else {
        // Fallback calculation if backend endpoint is unavailable
        setFinanceData({
          lifetimeSettled: 0,
          escrowBalance: 0,
          nextPayoutAmount: 0,
          nextPayoutDate: 'Next Tuesday',
          totalRevenue: 0,
          totalDeductions: 0,
          totalOrders: 0,
          commissionRate: '0%',
          tdsRate: '1%',
          settlements: [],
        });
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Settlement ledger refreshed with latest database records');
      }
    } catch (err) {
      console.error('Error loading settlements:', err);
      toast.error('Failed to load settlement details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSettlementsData();
  }, [loadSettlementsData]);

  const handleTabChange = (tabId) => {
    if (onNavigateTab) return onNavigateTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      clearAuthSession();
      toast.success('Successfully logged out of Supplier portal');
      handleNav('/supplier-login');
    }
  };

  const bank = financeData?.bankDetails || profile?.bankDetails || {};
  const maskedAcc = bank?.accountNumber
    ? `•••• ${String(bank.accountNumber).slice(-4)}`
    : 'Not Registered';

  const maxAvailable = Number(
    financeData?.availableWithdrawable ??
    financeData?.nextPayoutAmount ??
    financeData?.escrowBalance ??
    0
  );

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || isNaN(amt) || amt < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }

    if (!bank?.accountNumber || !bank?.ifsc) {
      toast.error('Please register your Bank Account details first in Profile settings.');
      return;
    }

    if (amt > maxAvailable) {
      toast.error(`Requested amount exceeds available balance (₹${maxAvailable.toLocaleString('en-IN')})`);
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await supplierApiService.requestSupplierPayout(amt);
      toast.success(res?.message || `🎉 Payout request of ₹${amt.toLocaleString('en-IN')} submitted successfully!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      await loadSettlementsData(true);
    } catch (err) {
      console.error('Payout request error:', err);
      toast.error(err.message || 'Failed to submit payout request');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const supplierDisplayName =
    profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const settlementsList = financeData?.settlements || [];
  const filteredSettlements = settlementsList.filter((item) => {
    const matchesFilter =
      statusFilter === 'ALL' || item.status?.toUpperCase() === statusFilter;
    const matchesSearch =
      !searchQuery ||
      item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bankName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ======================================================== */}
        {/* 1. TOP HEADER BANNER */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e1b4b] via-[#311042] to-[#b7004d] p-6 sm:p-8 text-white shadow-xl shadow-pink-950/10 border border-pink-700/30">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase text-pink-200">
                <Banknote className="w-3.5 h-3.5 text-pink-300" />
                <span>Financial Settlements Ledger</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 normal-case font-medium text-[11px]">T+2 Automated Cycle</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Settlements & Payouts 💳
              </h1>
              <p className="text-sm text-pink-100/90 leading-relaxed max-w-xl">
                Track direct NEFT/RTGS bank payouts, escrow in-transit balances, and statutory 1% TDS u/s 194-O deductions with zero commission fees.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(maxAvailable > 0 ? String(Math.floor(maxAvailable)) : '');
                  setShowWithdrawModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-[#b7004d] hover:bg-pink-50 text-xs font-black transition shadow-lg shadow-pink-950/30 cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-[#b7004d]" />
                <span>Withdraw to Bank</span>
              </button>

              <button
                type="button"
                onClick={() => loadSettlementsData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Refresh Ledger'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. STATS OVERVIEW CARDS (4 Cards) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Lifetime Settled */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Settled</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{Number(financeData?.lifetimeSettled || 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                  0% Platform Fee
                </span>
                <span className="text-slate-400">Paid to Bank</span>
              </div>
            </div>
            {Number(financeData?.totalWithdrawn || 0) > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Total Withdrawn:</span>
                <span className="font-bold text-slate-700">₹{Number(financeData.totalWithdrawn).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Card 2: Available for Payout */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available for Payout</span>
                <div className="w-9 h-9 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#b7004d]">
                ₹{Number(financeData?.availableWithdrawable ?? financeData?.nextPayoutAmount ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>Cycle:</span>
                <span className="font-bold text-slate-800">{financeData?.nextPayoutDate || 'Instant / T+2'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setWithdrawAmount(String(Math.floor(maxAvailable)));
                setShowWithdrawModal(true);
              }}
              className="mt-3.5 w-full py-2 px-3 rounded-xl bg-[#b7004d]/10 hover:bg-[#b7004d]/20 text-[#b7004d] text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-pink-200 active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Request Direct Payout</span>
            </button>
          </div>

          {/* Card 3: Escrow In-Transit */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escrow In-Transit</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{Number(financeData?.escrowBalance || 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                  Dispatched Orders
                </span>
                <span className="text-slate-400">Release on Delivery</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setWithdrawAmount(String(Math.floor(maxAvailable)));
                setShowWithdrawModal(true);
              }}
              className="mt-3.5 w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-300/40 active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
              <span>Withdraw Escrow Balance</span>
            </button>
          </div>

          {/* Card 4: Verified Bank Details */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settlement Account</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-black text-slate-900 truncate">
                {bank?.bankName || 'Verified Bank Account'}
              </div>
              <div className="mt-1 text-xs font-mono text-slate-600">
                {maskedAcc} {bank?.ifsc ? `• ${bank.ifsc}` : ''}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Penny-Drop Verified</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNav('/supplier-profile1')}
              className="mt-3 text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              Change Bank ➔
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SETTLEMENTS LEDGER TABLE */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Settlement Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated batch disbursement records and bank UTR logs</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter Buttons */}
              {['ALL', 'PAID', 'PROCESSING'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#b7004d] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Batches' : st}
                </button>
              ))}

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search UTR / Batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#b7004d] w-48"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredSettlements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-3xl bg-pink-50 text-[#b7004d] mx-auto flex items-center justify-center mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Settlement Batches Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Settlement batches are generated automatically when customer orders are marked DELIVERED and dispatched.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Cycle Date</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Gross Sales</th>
                    <th className="py-3 px-4">TDS (1%)</th>
                    <th className="py-3 px-4">Net Remittance</th>
                    <th className="py-3 px-4">Bank & UTR</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSettlements.map((item, idx) => {
                    const isPaid = item.status === 'PAID';
                    return (
                      <tr key={item.id || idx} className="hover:bg-pink-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {item.id}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.date}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.ordersCount} items
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          ₹{Number(item.grossAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-rose-600 font-mono">
                          -₹{Number(item.tdsAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                          ₹{Number(item.netAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-bold">{item.bankName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{item.utrNumber}</span>
                            {item.utrNumber && !item.utrNumber.includes('Awaiting') && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.utrNumber, 'UTR Number')}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copy UTR"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. SETTLEMENT POLICIES & TAX INFORMATION */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Meesho 0% Commission & Fair Remittance Promise</span>
            </h4>
            <p className="text-xs text-slate-500 max-w-2xl">
              Payouts are transferred directly to your bank via NEFT every 7 business days following delivery. In accordance with Section 194-O of the Income Tax Act, 1% TDS is deposited directly to your PAN.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleNav('/supplier-profile1')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-[#b7004d] text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Update Bank Details ➔
          </button>
        </div>

      {/* Payout Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Request Bank Payout</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Direct Transfer to Settlement Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-4">
              {/* Balances Summary */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{Number(maxAvailable).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Escrow In-Transit</span>
                  <span className="text-lg font-black text-amber-900">
                    ₹{Number(financeData?.escrowBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Destination Bank Account Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Destination Bank</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs font-black text-slate-800">{bank?.bankName || 'Registered Bank Account'}</p>
                <p className="text-[11px] font-mono text-slate-600">
                  A/C: {maskedAcc} {bank?.ifsc ? `• IFSC: ${bank.ifsc}` : ''}
                </p>
                {bank?.beneficiaryName && (
                  <p className="text-[10px] text-slate-500">Beneficiary: {bank.beneficiaryName}</p>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Withdrawal Amount (₹)</label>
                  <span className="text-[10px] text-slate-400 font-medium">Min: ₹100</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={maxAvailable > 0 ? maxAvailable : 100}
                    step="1"
                    placeholder="Enter amount (min ₹100)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-900 focus:outline-hidden focus:border-[#b7004d]"
                  />
                </div>

                {/* Quick Select Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[500, 1000, 2000, 5000].map((amt) => {
                    if (amt > maxAvailable) return null;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(String(amt))}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    );
                  })}
                  {maxAvailable >= 100 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(Math.floor(maxAvailable)))}
                      className="px-2.5 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#b7004d] text-[10px] font-bold transition cursor-pointer"
                    >
                      Max (₹{Math.floor(maxAvailable).toLocaleString('en-IN')})
                    </button>
                  )}
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>0% Commission • Statutory 1% TDS u/s 194-O</span>
                </div>
                <p>Funds will be credited via IMPS/NEFT within 24 to 48 banking hours.</p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={isSubmittingWithdraw}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || !withdrawAmount || Number(withdrawAmount) < 100 || Number(withdrawAmount) > maxAvailable}
                  className="flex-1 py-2.5 rounded-2xl bg-[#b7004d] hover:bg-[#92003d] disabled:opacity-50 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-pink-900/20 cursor-pointer"
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="finance"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {mainContent}

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
        title="Log out of Supplier Portal?"
        description="Are you sure you want to end your supplier session?"
        confirmText="Yes, Logout"
      />
    </DashboardLayout>
  );
}

