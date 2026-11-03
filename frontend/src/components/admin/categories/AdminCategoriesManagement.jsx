import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Layers, Plus } from 'lucide-react';
import { Button } from '../../ui/button';

import CategoryStatsGrid from './CategoryStatsGrid';
import FilterBar from '../../common/FilterBar';
import CategoriesTable from './CategoriesTable';
import CategoryFormModal from './CategoryFormModal';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Taxonomies 🏷️' },
  { id: 'main', label: 'Main Categories 📁' },
  { id: 'sub', label: 'Subcategories 🌿' },
];

export default function AdminCategoriesManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    mainCategories: 0,
    subCategories: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth token helper
  const getAuthToken = async () => {
    return (await auth.currentUser?.getIdToken()) || currentUser?.id;
  };

  // 1. Fetch Categories & Stats
  const fetchCategories = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = await getAuthToken();
      const res = await axios.get('http://localhost:5000/api/admin-categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const list = res.data.categories || res.data.data || [];
        setCategories(list);
        setStats(res.data.stats || {});
      } else {
        toast.error(res.data.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Category fetch error:', error);
      toast.error(
        error.response?.data?.message || 'Error loading categories'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Modal triggers
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  // 2. Create or Update handler
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      if (editingCategory) {
        // UPDATE
        const res = await axios.put(
          `http://localhost:5000/api/admin-categories/${editingCategory.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          toast.success(res.data.message || 'Category updated successfully');
          setModalOpen(false);
          fetchCategories(true);
        } else {
          toast.error(res.data.message || 'Failed to update category');
        }
      } else {
        // CREATE
        const res = await axios.post(
          'http://localhost:5000/api/admin-categories',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          toast.success(res.data.message || 'Category created successfully');
          setModalOpen(false);
          fetchCategories(true);
        } else {
          toast.error(res.data.message || 'Failed to create category');
        }
      }
    } catch (error) {
      console.error('Category save error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to save category. Please check duplicate name or slug.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Delete handler
  const handleDeleteCategory = async (category) => {
    const productCount = category._count?.products ?? 0;
    const subcategoryCount = category._count?.subcategories ?? 0;

    if (productCount > 0 || subcategoryCount > 0) {
      toast.error(
        `Cannot delete "${category.name}". It still contains ${productCount} products and ${subcategoryCount} subcategories.`
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete category "${category.name}"?`
      )
    ) {
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await axios.delete(
        `http://localhost:5000/api/admin-categories/${category.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Category deleted');
        fetchCategories(true);
      } else {
        toast.error(res.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error(
        error.response?.data?.message || 'Error occurred while deleting category'
      );
    }
  };

  // Filter categories by Tab & Search
  const filteredCategories = categories.filter((cat) => {
    if (activeTab === 'main' && Boolean(cat.parentId)) return false;
    if (activeTab === 'sub' && !Boolean(cat.parentId)) return false;

    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.parent?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Category Stats Grid using StatCard */}
      <CategoryStatsGrid stats={stats} />

      {/* 2. Top Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 text-[#b7004d] rounded-xl">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Taxonomy &amp; Hierarchy Master
            </h2>
            <p className="text-xs text-gray-500">
              Organize root departments, map subcategories, and structure product catalogs.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#b7004d] hover:bg-[#96003f] text-white rounded-xl text-xs font-bold gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Category / Subcategory</span>
        </Button>
      </div>

      {/* 3. Reusable FilterBar */}
      <FilterBar
        searchPlaceholder="Search categories, subcategories, slugs..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={CATEGORY_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={filteredCategories.length}
        countLabel="Categories"
        onRefresh={() => fetchCategories(true)}
        refreshing={refreshing}
      />

      {/* 4. Main Reusable DataTable */}
      <CategoriesTable
        categories={filteredCategories}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCategory}
      />

      {/* 5. Form Modal */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        isSubmitting={isSubmitting}
        parentCategories={categories.filter((c) => !c.parentId)}
      />
    </div>
  );
}
