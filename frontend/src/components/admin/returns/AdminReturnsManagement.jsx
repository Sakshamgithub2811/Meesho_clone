import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import ReturnsStatsGrid from './ReturnsStatsGrid';
import FilterBar from '../../common/FilterBar';
import ReturnsTable from './ReturnsTable';
import ReturnReviewModal from './ReturnReviewModal';

const RETURN_STATUS_TABS = [
  { id: 'ALL', label: 'All Requests' },
  { id: 'requested', label: 'Pending Review ⏳' },
  { id: 'approved', label: 'Pickup Scheduled 🚚' },
  { id: 'picked_up', label: 'Picked Up 📦' },
  { id: 'refunded', label: 'Refunded ✅' },
  { id: 'rejected', label: 'Rejected ❌' }
];

export default function AdminReturnsManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState({
    totalReturns: 0,
    pendingApproval: 0,
    approvedForPickup: 0,
    pickedUp: 0,
    refunded: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Return for review modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Format currency helper
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // Format date helper
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

  // Fetch return requests from backend
  const fetchReturns = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-returns?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setReturns(res.data.returnRequests || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (isManual) {
          toast.success("Returns Synced", {
            description: "Return requests refreshed from database."
          });
        }
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast.error('Failed to load return requests', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReturns();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchReturns();
      }
    });
    return () => unsubscribe();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchReturns();
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update return status handler
  const handleUpdateStatus = async (returnId, newStatus) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.patch(
        `http://localhost:5000/api/v1/admin-returns/${returnId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success(`Claim marked as ${newStatus}`, {
          description: `Return #${returnId.slice(0, 8)} status updated successfully.`
        });

        // Update local state
        const updated = res.data.returnRequest;
        setReturns((prev) =>
          prev.map((r) => (r.id === returnId ? { ...r, ...updated } : r))
        );

        setSelectedReturn(null);
        // Refresh aggregate counts
        fetchReturns(true);
      }
    } catch (error) {
      console.error('Error updating return request:', error);
      toast.error('Failed to update claim', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS CARDS ────────────────────────────────────────── */}
      <ReturnsStatsGrid stats={stats} />

      {/* ── 2. FILTER & SEARCH BAR ────────────────────────────────────── */}
      <FilterBar
        searchPlaceholder="Search by claim ID, order ID, customer, or reason..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={RETURN_STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        totalCount={returns.length}
        countLabel="Return Claims"
        onRefresh={() => fetchReturns(true)}
        refreshing={refreshing}
      />

      {/* ── 3. RETURNS DATA TABLE ─────────────────────────────────────── */}
      <ReturnsTable
        returns={returns}
        loading={loading}
        onOpenReview={(ret) => setSelectedReturn(ret)}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* ── 4. RETURN REVIEW & CLAIM MODAL ────────────────────────────── */}
      {selectedReturn && (
        <ReturnReviewModal
          returnReq={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onUpdateStatus={handleUpdateStatus}
          actionLoading={actionLoading}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
