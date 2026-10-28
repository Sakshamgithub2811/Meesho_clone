import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Plus, RefreshCw, Search, X } from 'lucide-react';

import BannerStatsGrid from './BannerStatsGrid';
import BannersVisualGrid from './BannersVisualGrid';
import BannerFormModal from './BannerFormModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Banners' },
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
      const res = await axios.get('http://localhost:5000/api/admin-banners', {
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
        error.response?.data?.message || 'Error connecting to banner server'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      if (editingBanner) {
        const res = await axios.put(
          `http://localhost:5000/api/admin-banners/${editingBanner.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success(res.data.message || 'Banner updated successfully');
          setModalOpen(false);
          fetchBanners(true);
        } else {
          toast.error(res.data.message || 'Failed to update banner');
        }
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/admin-banners',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success(res.data.message || 'Banner created successfully');
          setModalOpen(false);
          fetchBanners(true);
        } else {
          toast.error(res.data.message || 'Failed to create banner');
        }
      }
    } catch (error) {
      console.error('Save banner error:', error);
      toast.error(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const token = await getAuthToken();
      const res = await axios.patch(
        `http://localhost:5000/api/admin-banners/${banner.id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message || 'Status updated');
        setBanners((prev) =>
          prev.map((b) =>
            b.id === banner.id ? { ...b, isActive: res.data.isActive } : b
          )
        );
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
      const res = await axios.delete(
        `http://localhost:5000/api/admin-banners/${banner.id}`,
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

  return (
    <div className="space-y-6">
      <BannerStatsGrid stats={stats} />

      <div className="space-y-3">
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

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search headline or redirect link..."
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
              onClick={() => fetchBanners(true)}
              disabled={refreshing}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5"
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
              <span>Add Banner</span>
            </button>
          </div>
        </div>
      </div>

      <BannersVisualGrid
        banners={banners}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteBanner}
        onToggleStatus={handleToggleStatus}
        statusFilter={statusFilter}
        searchTerm={searchTerm}
      />

      <BannerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingBanner}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
