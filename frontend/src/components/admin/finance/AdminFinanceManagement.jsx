import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import FinanceStatsGrid from './FinanceStatsGrid';
import FilterBar from '../../common/FilterBar';
import WalletsTable from './WalletsTable';
import TransactionsTable from './TransactionsTable';
import WalletAdjustModal from './WalletAdjustModal';

const VIEW_TABS = [
  { id: 'wallets', label: 'Partner Escrow Wallets 💳' },
  { id: 'transactions', label: 'Transaction Audit Ledger 🧾' }
];

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Partner Roles' },
  { value: 'DROPSHIPPER', label: 'Dropshippers' },
  { value: 'SUPPLIER', label: 'Suppliers' }
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Transaction Types' },
  { value: 'credit', label: 'Credits (+)' },
  { value: 'debit', label: 'Debits (-)' }
];

export default function AdminFinanceManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalEscrowBalance: 0,
    totalPendingWithdrawals: 0,
    platformCommissions: 0,
    grossMarketplaceVolume: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Tabs
  const [activeView, setActiveView] = useState('wallets');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected wallet for adjustment modal
  const [selectedWallet, setSelectedWallet] = useState(null);
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

  // Fetch finance data from backend
  const fetchFinance = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-finance?${params.toString()}`,
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

        if (isManual) {
          toast.success("Finance Records Synced", {
            description: "Latest escrow balances & ledger entries refreshed."
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch finance overview:", err);
      toast.error("Failed to load finance data", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchFinance();
      }
    });
    return () => unsubscribe();
  }, [roleFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFinance();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Adjust Wallet Balance handler
  const handleAdjustWallet = async (walletId, payload) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.post(
        `http://localhost:5000/api/v1/admin-finance/wallets/${walletId}/adjust`,
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
        fetchFinance();
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

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS SUMMARY ────────────────────────────────────── */}
      <FinanceStatsGrid stats={stats} />

      {/* ── 2. FILTER & SEARCH TOOLBAR ─────────────────────────────── */}
      <FilterBar
        searchPlaceholder="Search by partner name, store name, email or phone..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={VIEW_TABS}
        activeTab={activeView}
        onTabChange={setActiveView}
        dropdowns={
          activeView === 'wallets'
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
        totalCount={activeView === 'wallets' ? wallets.length : transactions.length}
        countLabel={activeView === 'wallets' ? 'Wallets' : 'Transactions'}
        onRefresh={() => fetchFinance(true)}
        refreshing={refreshing}
      />

      {/* ── 3. DATA TABLES ─────────────────────────────────────────── */}
      {activeView === 'wallets' ? (
        <WalletsTable
          wallets={wallets}
          loading={loading}
          onOpenAdjust={setSelectedWallet}
          formatCurrency={formatCurrency}
        />
      ) : (
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* ── 4. ADJUSTMENT MODAL ────────────────────────────────────── */}
      {selectedWallet && (
        <WalletAdjustModal
          wallet={selectedWallet}
          onClose={() => setSelectedWallet(null)}
          onSubmit={handleAdjustWallet}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
