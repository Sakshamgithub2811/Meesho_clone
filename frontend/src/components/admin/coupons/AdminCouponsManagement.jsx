import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Ticket,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import CouponStatsGrid from './CouponStatsGrid';
import CouponsTable from './CouponsTable';
import CouponFormModal from './CouponFormModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Coupons' },
  { id: 'ACTIVE', label: 'Active ⚡' },
  { id: 'EXPIRED', label: 'Expired ⌛' },
  { id: 'DISABLED', label: 'Disabled 🚫' },
];

export default function AdminCouponsManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to obtain token
  const getAuthToken = async () => {
    return (await auth.currentUser?.getIdToken()) || currentUser?.id;
  };

  // 1. Fetch Coupons from backend
  const fetchCoupons = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = await getAuthToken();
      const res = await axios.get('http://localhost:5000/api/admin-coupons', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const list = res.data.coupons || res.data.data || [];
        setCoupons(list);
        setStats(res.data.stats || {});
      } else {
        toast.error(res.data.message || 'Failed to load coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(
        error.response?.data?.message || 'Error connecting to coupon server'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 2. Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  // 3. Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  // 4. Create or Update Coupon
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      if (editingCoupon) {
        // UPDATE
        const res = await axios.put(
          `http://localhost:5000/api/admin-coupons/${editingCoupon.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          toast.success(res.data.message || 'Coupon updated successfully');
          setModalOpen(false);
          fetchCoupons(true);
        } else {
          toast.error(res.data.message || 'Failed to update coupon');
        }
      } else {
        // CREATE
        const res = await axios.post(
          'http://localhost:5000/api/admin-coupons',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          toast.success(res.data.message || 'Coupon created successfully');
          setModalOpen(false);
          fetchCoupons(true);
        } else {
          toast.error(res.data.message || 'Failed to create coupon');
        }
      }
    } catch (error) {
      console.error('Save coupon error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to save coupon'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Toggle Active Status
  const handleToggleStatus = async (coupon) => {
    try {
      const token = await getAuthToken();
      const res = await axios.patch(
        `http://localhost:5000/api/admin-coupons/${coupon.id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Status updated');
        // Optimistic update local state
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isActive: res.data.isActive } : c
          )
        );
      } else {
        toast.error(res.data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update coupon status'
      );
    }
  };

  // 6. Delete Coupon
  const handleDeleteCoupon = async (coupon) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete coupon "${coupon.code}"?`
      )
    ) {
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await axios.delete(
        `http://localhost:5000/api/admin-coupons/${coupon.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Coupon deleted');
        fetchCoupons(true);
      } else {
        toast.error(res.data.message || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Delete coupon error:', error);
      toast.error(
        error.response?.data?.message || 'Error deleting coupon'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <CouponStatsGrid stats={stats} />

      {/* Filter Tabs + Search Toolbar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search code, title or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => fetchCoupons(true)}
              disabled={refreshing}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5"
              title="Refresh list"
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin' : ''}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <CouponsTable
        coupons={coupons}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCoupon}
        onToggleStatus={handleToggleStatus}
        statusFilter={statusFilter}
        searchTerm={searchTerm}
      />

      {/* Form Modal */}
      <CouponFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCoupon}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
