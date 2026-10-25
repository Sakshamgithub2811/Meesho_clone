import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import ProductsStatsGrid from './ProductsStatsGrid';
import FilterBar from '../../common/FilterBar';
import ProductsTable from './ProductsTable';
import ProductDetailModal from './ProductDetailModal';

const STOCK_TABS = [
  { id: 'ALL', label: 'All Inventory 📦' },
  { id: 'in_stock', label: 'In Stock ✅' },
  { id: 'low_stock', label: 'Low Stock ⚠️' },
  { id: 'out_of_stock', label: 'Out of Stock ❌' }
];

export default function AdminProductsManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalCategories: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [stockFilter, setStockFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Product for modal inspection & stock editing
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Helper: Format Currency (INR)
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // Fetch products from backend API
  const fetchProducts = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (stockFilter !== 'ALL') params.append('stockStatus', stockFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-products?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setProducts(res.data.products || []);
        if (res.data.categories) {
          setCategories(res.data.categories);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }

        if (isManual) {
          toast.success("Catalog Synced", {
            description: "Latest product catalog refreshed from database."
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin products:", err);
      toast.error("Failed to load products", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Listen to auth state to prevent race conditions during Firebase initialization
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProducts();
      }
    });
    return () => unsubscribe();
  }, [categoryFilter, stockFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handler: Update Stock
  const handleUpdateStock = async (productId, newStock) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.patch(
        `http://localhost:5000/api/v1/admin-products/${productId}/stock`,
        { stock: newStock },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success("Stock Updated", {
          description: `Inventory updated to ${newStock} units.`
        });

        // Update product in local state
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
        );

        // Update selected product in modal
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) => ({ ...prev, stock: Number(newStock) }));
        }

        // Re-fetch stats quietly
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error("Update Failed", {
        description: err.response?.data?.message || "Could not update stock."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete Product
  const handleDeleteProduct = async (productId, productTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.delete(
        `http://localhost:5000/api/v1/admin-products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success("Product Deleted", {
          description: `"${productTitle}" removed from catalog.`
        });
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Delete Failed", {
        description: err.response?.data?.message || "Could not delete product."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Category Dropdown options
  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    ...categories.map((c) => ({
      value: c.slug,
      label: c.name
    }))
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS SUMMARY ────────────────────────────────────── */}
      <ProductsStatsGrid stats={stats} />

      {/* ── 2. FILTER & SEARCH TOOLBAR ─────────────────────────────── */}
      <FilterBar
        searchPlaceholder="Search by product name, supplier, or category..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={STOCK_TABS}
        activeTab={stockFilter}
        onTabChange={setStockFilter}
        dropdowns={[
          {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categoryOptions
          }
        ]}
        totalCount={products.length}
        countLabel="Products"
        onRefresh={() => fetchProducts(true)}
        refreshing={refreshing}
      />

      {/* ── 3. PRODUCTS DATA TABLE ─────────────────────────────────── */}
      <ProductsTable
        products={products}
        loading={loading}
        onInspectProduct={setSelectedProduct}
        formatCurrency={formatCurrency}
      />

      {/* ── 4. PRODUCT INSPECT & EDIT MODAL ────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
