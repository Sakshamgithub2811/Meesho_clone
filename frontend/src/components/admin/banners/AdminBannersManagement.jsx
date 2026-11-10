import { API_BASE, API_V1_BASE } from '../../../config/apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Plus, Image } from 'lucide-react';
import { Button } from '../../ui/button';

import BannerStatsGrid from './BannerStatsGrid';
import FilterBar from '../../common/FilterBar';
import BannersVisualGrid from './BannersVisualGrid';
import BannerFormModal from './BannerFormModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Banners 🎨' },
  { id: 'ACTIVE', label: 'Live on Carousel ⚡' },
  { id: 'INACTIVE', label: 'Hidden / Drafts 👁️' },
];

export default function AdminBannersManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthToken = async () => {
    return (await auth.currentUser?.getIdToken()) || currentUser?.id;
  };

  const fetchBanners = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = await getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_BASE}/admin-banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setBanners(res.data.banners || res.data.data || []);
        setStats(res.data.stats || {});
      } else {
        toast.error(res.data.message || 'Failed to load banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load banners from server'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser || currentUser?.id) {
      fetchBanners();
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchBanners();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = await getAuthToken();
      if (!token) return;

      if (editingBanner) {
        const res = await axios.put(
          `${API_BASE}/admin-banners/${editingBanner.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          toast.success('Banner updated successfully!');
          setModalOpen(false);
          fetchBanners(true);
        } else {
          toast.error(res.data.message || 'Failed to update banner');
        }
      } else {
        const res = await axios.post(
          `${API_BASE}/admin-banners`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          toast.success('Banner added to carousel!');
          setModalOpen(false);
          fetchBanners(true);
        } else {
          toast.error(res.data.message || 'Failed to create banner');
        }
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(
        error.response?.data?.message || 'Error occurred while saving banner'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (bannerOrId) => {
    const id = typeof bannerOrId === 'object' ? bannerOrId?.id : bannerOrId;
    if (!id) return;
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await axios.patch(
`${API_BASE}/admin-banners/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Status updated');
        fetchBanners(true);
      } else {
        toast.error(res.data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle status');
    }
  };

  const handleDeleteBanner = async (banner) => {
    if (
      !window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)
    ) {
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await axios.delete(
        `${API_BASE}/admin-banners/${banner.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Banner deleted');
        fetchBanners(true);
      }
    } catch (error) {
      toast.error('Error deleting banner');
    }
  };

  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.targetUrl && b.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && b.isActive) ||
      (statusFilter === 'INACTIVE' && !b.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Standard Metrics Grid using StatCard */}
      <BannerStatsGrid stats={stats} />

      {/* 2. Top Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 text-[#b7004d] rounded-xl">
            <Image size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Carousel &amp; Promotional Sliders
            </h2>
            <p className="text-xs text-gray-500">
              Manage live homepage banners, click track campaigns, and seasonal promotions.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#b7004d] hover:bg-[#96003f] text-white rounded-xl text-xs font-bold gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Banner</span>
        </Button>
      </div>

      {/* 3. Reusable FilterBar */}
      <FilterBar
        searchPlaceholder="Search headline, subtitle or redirect link..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        totalCount={filteredBanners.length}
        countLabel="Banners"
        onRefresh={() => fetchBanners(true)}
        refreshing={refreshing}
      />

      {/* 4. Visual Card Grid */}
      <BannersVisualGrid
        banners={filteredBanners}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteBanner}
        onToggleStatus={handleToggleStatus}
      />

      {/* 5. Modal */}
      <BannerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingBanner={editingBanner}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
