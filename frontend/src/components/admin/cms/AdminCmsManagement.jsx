import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../../ui/button';

import CmsStatsGrid from './CmsStatsGrid';
import FilterBar from '../../common/FilterBar';
import CmsPagesTable from './CmsPagesTable';
import CmsPageModal from './CmsPageModal';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Pages 📄' },
  { id: 'PUBLISHED', label: 'Published ⚡' },
  { id: 'DRAFT', label: 'Drafts 📝' },
];

export default function AdminCmsManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [pages, setPages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthToken = async () => {
    return (await auth.currentUser?.getIdToken()) || currentUser?.id;
  };

  const fetchPages = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = await getAuthToken();
      const res = await axios.get('http://localhost:5000/api/admin-cms', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setPages(res.data.data || []);
        setStats(res.data.stats || {});
      } else {
        toast.error(res.data.message || 'Failed to load CMS pages');
      }
    } catch (error) {
      console.error('Error fetching CMS pages:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load CMS pages from server'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPage(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (page) => {
    setEditingPage(page);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      if (editingPage) {
        const res = await axios.put(
          `http://localhost:5000/api/admin-cms/${editingPage.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          toast.success('Page updated successfully!');
          setModalOpen(false);
          fetchPages();
        } else {
          toast.error(res.data.message || 'Failed to update page');
        }
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/admin-cms',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          toast.success('CMS page published successfully!');
          setModalOpen(false);
          fetchPages();
        } else {
          toast.error(res.data.message || 'Failed to create page');
        }
      }
    } catch (error) {
      console.error('Error saving CMS page:', error);
      toast.error(
        error.response?.data?.message || 'Error occurred while saving page'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = await getAuthToken();
      const res = await axios.patch(
        `http://localhost:5000/api/admin-cms/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Status updated');
        setPages((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: res.data.data.status } : p
          )
        );
      } else {
        toast.error(res.data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling page status:', error);
      toast.error('Failed to change page status');
    }
  };

  const handleDeletePage = async (page) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${page.title}" (/p/${page.slug})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await axios.delete(
        `http://localhost:5000/api/admin-cms/${page.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`"${page.title}" deleted successfully`);
        setPages((prev) => prev.filter((p) => p.id !== page.id));
      } else {
        toast.error(res.data.message || 'Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting CMS page:', error);
      toast.error('Failed to delete CMS page');
    }
  };

  // Filtered dataset for DataTable
  const filteredPages = pages.filter((page) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      page.title.toLowerCase().includes(q) ||
      page.slug.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'ALL' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Standard Metrics Grid using StatCard */}
      <CmsStatsGrid stats={stats} pages={pages} />

      {/* 2. Top Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 text-[#b7004d] rounded-xl">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Legal &amp; Storefront Documentation
            </h2>
            <p className="text-xs text-gray-500">
              Manage return policies, privacy terms, shipping rules, and custom SEO pages.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#b7004d] hover:bg-[#96003f] text-white rounded-xl text-xs font-bold gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create New Page</span>
        </Button>
      </div>

      {/* 3. Reusable Standard FilterBar */}
      <FilterBar
        searchPlaceholder="Search pages by title or slug..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        totalCount={filteredPages.length}
        countLabel="Pages"
        onRefresh={() => fetchPages(true)}
        refreshing={refreshing}
      />

      {/* 4. Reusable DataTable */}
      <CmsPagesTable
        pages={filteredPages}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDeletePage}
        onToggleStatus={handleToggleStatus}
      />

      {/* 5. Create / Edit Modal */}
      <CmsPageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingPage={editingPage}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
