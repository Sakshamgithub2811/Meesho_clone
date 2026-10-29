import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';

import CategoryStatsGrid from './CategoryStatsGrid';
import CategoriesTable from './CategoriesTable';
import CategoryFormModal from './CategoryFormModal';

export default function AdminCategoriesManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    emptyCategories: 0,
    activeCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      console.error('Error fetching categories:', error);
      toast.error(
        error.response?.data?.message || 'Error connecting to categories server'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  // 3. Open Edit Modal
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  // 4. Submit Create or Update
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

  // 5. Delete Category with Confirmation & Safety Guard
  const handleDeleteCategory = async (category) => {
    const productCount = category._count?.products ?? 0;
    const subcategoryCount = category._count?.subcategories ?? 0;

    if (subcategoryCount > 0) {
      toast.error(
        `Cannot delete: "${category.name}" has ${subcategoryCount} subcategories attached. Reassign or delete those subcategories first.`
      );
      return;
    }

    if (productCount > 0) {
      toast.error(
        `Cannot delete: "${category.name}" has ${productCount} active products. Reassign or delete those products first.`
      );
      return;
    }

    const typeLabel = category.parentId ? 'subcategory' : 'category';
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${typeLabel} "${category.name}"?`
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

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <CategoryStatsGrid stats={stats} />

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search categories, subcategories, slugs..."
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

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Category / Subcategory</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <CategoriesTable
        categories={categories}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCategory}
        searchTerm={searchTerm}
      />

      {/* Form Modal */}
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
