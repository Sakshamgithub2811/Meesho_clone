import { API_BASE, API_V1_BASE } from '../../../config/apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Ticket, Plus } from 'lucide-react';
import { Button } from '../../ui/button';

import CouponStatsGrid from './CouponStatsGrid';
import FilterBar from '../../common/FilterBar';
import CouponsTable from './CouponsTable';
import CouponFormModal from './CouponFormModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Coupons 🎟️' },
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
      const res = await axios.get(`${API_BASE}/admin-coupons`, {
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
      console.error('Coupons fetch error:', error);
      toast.error(
        error.response?.data?.message || 'Error occurred while loading coupons'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  // 2. Submit Create / Update
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      if (editingCoupon) {
        // UPDATE
        const res = await axios.put(
          `${API_BASE}/admin-coupons/${editingCoupon.id}`,
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
          `${API_BASE}/admin-coupons`,
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
      console.error('Coupon save error:', error);
      toast.error(
        error.response?.data?.message || 'Error occurred while saving coupon'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Toggle Status (Active / Disabled)
  const handleToggleStatus = async (coupon) => {
    try {
      const token = await getAuthToken();
      const res = await axios.patch(
        `${API_BASE}/admin-coupons/${coupon.id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Coupon status toggled');
        fetchCoupons(true);
      } else {
        toast.error(res.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Toggle coupon status error:', error);
      toast.error(
        error.response?.data?.message || 'Error toggling coupon status'
      );
    }
  };

  // 4. Delete Coupon
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
        `${API_BASE}/admin-coupons/${coupon.id}`,
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

  const now = new Date();

  // Filter coupons by search term and status tab
  const filteredCoupons = coupons.filter((coupon) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      coupon.code?.toLowerCase().includes(q) ||
      coupon.title?.toLowerCase().includes(q) ||
      coupon.description?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const isExpired = new Date(coupon.expiresAt) <= now;
    const isDisabled = coupon.isActive === false;

    if (statusFilter === 'ACTIVE') {
      return !isExpired && !isDisabled;
    }
    if (statusFilter === 'EXPIRED') {
      return isExpired;
    }
    if (statusFilter === 'DISABLED') {
      return isDisabled;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Reusable StatCard Grid */}
      <CouponStatsGrid stats={stats} />

      {/* 2. Top Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 text-[#b7004d] rounded-xl">
            <Ticket size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Promotional Discount Codes &amp; Vouchers
            </h2>
            <p className="text-xs text-gray-500">
              Configure checkout discounts, customer cart minimums, validity dates, and campaign redemptions.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#b7004d] hover:bg-[#96003f] text-white rounded-xl text-xs font-bold gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* 3. Reusable FilterBar */}
      <FilterBar
        searchPlaceholder="Search code, title or condition..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        totalCount={filteredCoupons.length}
        countLabel="Coupons"
        onRefresh={() => fetchCoupons(true)}
        refreshing={refreshing}
      />

      {/* 4. Reusable DataTable */}
      <CouponsTable
        coupons={filteredCoupons}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCoupon}
        onToggleStatus={handleToggleStatus}
      />

      {/* 5. Form Modal */}
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
