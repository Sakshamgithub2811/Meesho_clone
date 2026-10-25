import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import SellersStatsGrid from './SellersStatsGrid';
import FilterBar from '../../common/FilterBar';
import SellersTable from './SellersTable';
import SellerDetailModal from './SellerDetailModal';

const SELLER_TIER_TABS = [
  { id: 'ALL', label: 'All Suppliers 🏬' },
  { id: 'Platinum', label: 'Platinum 👑' },
  { id: 'Gold', label: 'Gold ⭐' },
  { id: 'Silver', label: 'Silver 🛡️' }
];

export default function AdminSellersManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [sellers, setSellers] = useState([]);
  const [stats, setStats] = useState({
    totalSellers: 0,
    platinumSellers: 0,
    goldSellers: 0,
    totalProducts: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [tierFilter, setTierFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Seller for detail modal
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Helper: Format Currency (INR)
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // Fetch sellers from backend
  const fetchSellers = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (tierFilter !== 'ALL') params.append('tier', tierFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-sellers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setSellers(res.data.sellers || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }

        if (isManual) {
          toast.success("Suppliers Synced", {
            description: "Latest vendor records refreshed from database."
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin sellers:", err);
      toast.error("Failed to load sellers", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Listen to auth state to handle cold page reloads
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSellers();
      }
    });
    return () => unsubscribe();
  }, [tierFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSellers();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handler: Inspect single seller with full product catalog
  const handleOpenSeller = async (seller) => {
    try {
      setSelectedSeller(seller);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-sellers/${seller.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success && res.data.seller) {
        setSelectedSeller(res.data.seller);
      }
    } catch (err) {
      console.error("Failed to fetch full seller details:", err);
    }
  };

  // Handler: Update Seller Tier
  const handleUpdateTier = async (sellerId, newTier) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.patch(
        `http://localhost:5000/api/v1/admin-sellers/${sellerId}/tier`,
        { tier: newTier },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success("Partner Tier Updated", {
          description: `Seller upgraded to ${newTier} Tier.`
        });

        // Update locally
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, tier: newTier } : s))
        );

        if (selectedSeller && selectedSeller.id === sellerId) {
          setSelectedSeller((prev) => ({ ...prev, tier: newTier }));
        }

        fetchSellers();
      }
    } catch (err) {
      console.error("Failed to update tier:", err);
      toast.error("Update Failed", {
        description: err.response?.data?.message || "Could not update tier."
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS SUMMARY ────────────────────────────────────── */}
      <SellersStatsGrid stats={stats} />

      {/* ── 2. FILTER & SEARCH TOOLBAR ─────────────────────────────── */}
      <FilterBar
        searchPlaceholder="Search by store name, proprietor, GSTIN, phone, or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={SELLER_TIER_TABS}
        activeTab={tierFilter}
        onTabChange={setTierFilter}
        totalCount={sellers.length}
        countLabel="Suppliers"
        onRefresh={() => fetchSellers(true)}
        refreshing={refreshing}
      />

      {/* ── 3. SELLERS DATA TABLE ──────────────────────────────────── */}
      <SellersTable
        sellers={sellers}
        loading={loading}
        onOpenSeller={handleOpenSeller}
      />

      {/* ── 4. SELLER DETAIL & MANAGEMENT MODAL ────────────────────── */}
      {selectedSeller && (
        <SellerDetailModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          onUpdateTier={handleUpdateTier}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
