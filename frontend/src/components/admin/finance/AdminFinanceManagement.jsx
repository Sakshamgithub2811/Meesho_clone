import { API_BASE, API_V1_BASE } from '../../../config/apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { exportToCsv } from '../../../utils/csvExporter';

import FinanceStatsGrid from './FinanceStatsGrid';
import FilterBar from '../../common/FilterBar';
import WalletsTable from './WalletsTable';
import TransactionsTable from './TransactionsTable';
import WithdrawalsQueueTable from './WithdrawalsQueueTable';
import WalletAdjustModal from './WalletAdjustModal';
import PayoutApproveModal from './PayoutApproveModal';
import PayoutRejectModal from './PayoutRejectModal';

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Partner Roles' },
  { value: 'DROPSHIPPER', label: 'Dropshippers' },
  { value: 'SUPPLIER', label: 'Suppliers' },
  { value: 'AFFILIATE', label: 'Affiliates' }
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Transaction Types' },
  { value: 'credit', label: 'Credits (+)' },
  { value: 'debit', label: 'Debits (-)' },
  { value: 'reversed', label: 'Reversals (↺)' }
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending Payouts ⏳' },
  { value: 'PAID', label: 'Settled / Paid ✅' },
  { value: 'REJECTED', label: 'Rejected ❌' }
];

export default function AdminFinanceManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [stats, setStats] = useState({
    totalEscrowBalance: 0,
    totalPendingWithdrawals: 0,
    platformCommissions: 0,
    grossMarketplaceVolume: 0
  });

  const [withdrawalsStats, setWithdrawalsStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
    rejectedCount: 0,
    pendingAmount: 0,
    totalPaidAmount: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Tabs
  const [activeView, setActiveView] = useState('withdrawals'); // default to actionable queue
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected modals
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedApprovePayout, setSelectedApprovePayout] = useState(null);
  const [selectedRejectPayout, setSelectedRejectPayout] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. Fetch Wallets & Ledger Overview
  const fetchFinanceOverview = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `${API_V1_BASE}/admin-finance?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setWallets(res.data.wallets || []);
        setTransactions(res.data.transactions || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch finance overview:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Fetch Withdrawals & Payouts Queue
  const fetchWithdrawalsQueue = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `${API_V1_BASE}/admin-finance/withdrawals?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setWithdrawals(res.data.withdrawals || []);
        if (res.data.stats) {
          setWithdrawalsStats(res.data.stats);
          // Sync pending settlement stat
          setStats((prev) => ({
            ...prev,
            totalPendingWithdrawals: res.data.stats.pendingAmount
          }));
        }
        if (isManual) {
          toast.success("Payout Queue Synced", {
            description: "Latest bank withdrawal requests refreshed."
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch withdrawals queue:", err);
      toast.error("Failed to load withdrawals queue", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Master refresh dispatcher
  const refreshAllData = (isManual = false) => {
    fetchFinanceOverview(isManual);
    fetchWithdrawalsQueue(isManual);
  };

  // Trigger loads on filter change
  useEffect(() => {
    if (activeView === 'withdrawals') {
      fetchWithdrawalsQueue();
    } else {
      fetchFinanceOverview();
    }
  }, [activeView, statusFilter, roleFilter, typeFilter]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        refreshAllData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeView === 'withdrawals') fetchWithdrawalsQueue();
      else fetchFinanceOverview();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 3. Action Handlers: Approve & Reject Payouts
  const handleApprovePayout = async (txId, { utrNumber, adminNotes }) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.post(
        `${API_V1_BASE}/admin-finance/withdrawals/${txId}/approve`,
        { utrNumber, adminNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success("Payout Disbursed Successfully", {
          description: `Disbursement confirmed with Bank UTR: ${utrNumber}`
        });
        setSelectedApprovePayout(null);
        refreshAllData(true);
      }
    } catch (err) {
      console.error("Failed to approve payout:", err);
      toast.error("Disbursement Failed", {
        description: err.response?.data?.message || "Could not record payout."
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayout = async (txId, { reason }) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.post(
        `${API_V1_BASE}/admin-finance/withdrawals/${txId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success("Withdrawal Rejected", {
          description: "Funds automatically refunded back to partner wallet."
        });
        setSelectedRejectPayout(null);
        refreshAllData(true);
      }
    } catch (err) {
      console.error("Failed to reject payout:", err);
      toast.error("Rejection Failed", {
        description: err.response?.data?.message || "Could not process rejection."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Adjust Wallet Balance handler
  const handleAdjustWallet = async (walletId, payload) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.post(
        `${API_V1_BASE}/admin-finance/wallets/${walletId}/adjust`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success("Balance Adjusted", {
          description: res.data.message
        });
        setSelectedWallet(null);
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to adjust wallet:", err);
      toast.error("Adjustment Failed", {
        description: err.response?.data?.message || "Could not adjust balance."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Universal CSV Exporter
  const handleExportFinance = () => {
    if (activeView === 'withdrawals') {
      exportToCsv({
        data: withdrawals,
        filename: `withdrawals_queue_${statusFilter.toLowerCase()}`,
        columns: [
          { key: 'id', label: 'Withdrawal Ref ID' },
          { key: 'createdAt', label: 'Requested Date', formatter: (val) => formatDate(val) },
          { key: 'user.fullName', label: 'Partner Name' },
          { key: 'user.storeName', label: 'Store Name' },
          { key: 'user.role', label: 'Role' },
          { key: 'amount', label: 'Requested Amount (₹)' },
          { key: 'status', label: 'Payout Status' },
          { key: 'destination', label: 'Target Account' },
          { key: 'user.bankDetails.accountNumber', label: 'Bank Account' },
          { key: 'user.bankDetails.ifsc', label: 'IFSC' },
          { key: 'utrNumber', label: 'Bank UTR / Reference' },
          { key: 'description', label: 'Ledger Description' }
        ]
      });
    } else if (activeView === 'wallets') {
      exportToCsv({
        data: wallets,
        filename: `finance_wallets_${roleFilter.toLowerCase()}`,
        columns: [
          { key: 'user.fullName', label: 'Partner Name' },
          { key: 'user.storeName', label: 'Store Name' },
          { key: 'user.role', label: 'Role' },
          { key: 'user.email', label: 'Email' },
          { key: 'user.phone', label: 'Phone' },
          { key: 'balance', label: 'Current Escrow Balance (₹)' },
          { key: 'pending', label: 'Pending Settlement (₹)' },
          { key: 'user.bankDetails.accountNumber', label: 'Bank Account Number' },
          { key: 'user.bankDetails.ifsc', label: 'IFSC Code' }
        ]
      });
    } else {
      exportToCsv({
        data: transactions,
        filename: `finance_ledger_${typeFilter.toLowerCase()}`,
        columns: [
          { key: 'id', label: 'Transaction ID' },
          { key: 'createdAt', label: 'Date & Time', formatter: (val) => formatDate(val) },
          { key: 'wallet.user.fullName', label: 'Partner Name' },
          { key: 'wallet.user.role', label: 'Partner Role' },
          { key: 'type', label: 'Type (Credit/Debit/Reversed)', formatter: (val) => String(val || '').toUpperCase() },
          { key: 'amount', label: 'Amount (₹)' },
          { key: 'description', label: 'Description / Purpose' },
          { key: 'orderId', label: 'Linked Order ID' }
        ]
      });
    }
  };

  const viewTabsWithCount = [
    {
      id: 'withdrawals',
      label: `Withdrawal Requests Queue 🏦${
        withdrawalsStats.pendingCount > 0 ? ` (${withdrawalsStats.pendingCount})` : ''
      }`
    },
    { id: 'wallets', label: 'Partner Escrow Wallets 💳' },
    { id: 'transactions', label: 'Transaction Audit Ledger 🧾' }
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS SUMMARY ────────────────────────────────────── */}
      <FinanceStatsGrid stats={stats} />

      {/* ── 2. FILTER & SEARCH TOOLBAR ─────────────────────────────── */}
      <FilterBar
        searchPlaceholder={
          activeView === 'withdrawals'
            ? 'Search by partner name, store name, phone or UTR...'
            : 'Search by partner name, store name, email or phone...'
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={viewTabsWithCount}
        activeTab={activeView}
        onTabChange={setActiveView}
        dropdowns={
          activeView === 'withdrawals'
            ? [
                {
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: STATUS_OPTIONS
                },
                {
                  value: roleFilter,
                  onChange: setRoleFilter,
                  options: ROLE_OPTIONS
                }
              ]
            : activeView === 'wallets'
            ? [
                {
                  value: roleFilter,
                  onChange: setRoleFilter,
                  options: ROLE_OPTIONS
                }
              ]
            : [
                {
                  value: typeFilter,
                  onChange: setTypeFilter,
                  options: TYPE_OPTIONS
                }
              ]
        }
        totalCount={
          activeView === 'withdrawals'
            ? withdrawals.length
            : activeView === 'wallets'
            ? wallets.length
            : transactions.length
        }
        countLabel={
          activeView === 'withdrawals'
            ? 'Requests'
            : activeView === 'wallets'
            ? 'Wallets'
            : 'Transactions'
        }
        onRefresh={() => refreshAllData(true)}
        refreshing={refreshing}
        onExport={handleExportFinance}
        exportLabel={
          activeView === 'withdrawals'
            ? 'Export Payouts'
            : activeView === 'wallets'
            ? 'Export Wallets'
            : 'Export Ledger'
        }
      />

      {/* ── 3. DATA TABLES ─────────────────────────────────────────── */}
      {activeView === 'withdrawals' && (
        <WithdrawalsQueueTable
          withdrawals={withdrawals}
          loading={loading}
          onOpenApprove={setSelectedApprovePayout}
          onOpenReject={setSelectedRejectPayout}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {activeView === 'wallets' && (
        <WalletsTable
          wallets={wallets}
          loading={loading}
          onOpenAdjust={setSelectedWallet}
          formatCurrency={formatCurrency}
        />
      )}

      {activeView === 'transactions' && (
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* ── 4. MODALS ──────────────────────────────────────────────── */}
      {/* Wallet Adjustment Modal */}
      {selectedWallet && (
        <WalletAdjustModal
          wallet={selectedWallet}
          onClose={() => setSelectedWallet(null)}
          onSubmit={handleAdjustWallet}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Payout Disbursement Approve Modal */}
      {selectedApprovePayout && (
        <PayoutApproveModal
          payout={selectedApprovePayout}
          onClose={() => setSelectedApprovePayout(null)}
          onConfirmApprove={handleApprovePayout}
          loading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Payout Rejection & Reversal Modal */}
      {selectedRejectPayout && (
        <PayoutRejectModal
          payout={selectedRejectPayout}
          onClose={() => setSelectedRejectPayout(null)}
          onConfirmReject={handleRejectPayout}
          loading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
