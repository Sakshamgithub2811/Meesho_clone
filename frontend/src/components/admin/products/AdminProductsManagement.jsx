import { API_BASE, API_V1_BASE } from '../../../config/apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { exportToCsv } from '../../../utils/csvExporter';

import ProductsStatsGrid from './ProductsStatsGrid';
import FilterBar from '../../common/FilterBar';
import ProductsTable from './ProductsTable';
import ProductDetailModal from './ProductDetailModal';
import BulkActionBar from './BulkActionBar';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Products 📦' },
  { id: 'PENDING', label: 'Pending Approval ⏳' },
  { id: 'APPROVED', label: 'Live / Approved ✅' },
  { id: 'REJECTED', label: 'Rejected ❌' }
];

const STOCK_OPTIONS = [
  { value: 'ALL', label: 'All Stock Levels' },
  { value: 'in_stock', label: 'In Stock (>10)' },
  { value: 'low_stock', label: 'Low Stock (1-10)' },
  { value: 'out_of_stock', label: 'Out of Stock (0)' }
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
    totalCategories: 0,
    pendingApprovals: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Product for modal inspection & stock editing
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Multi-Selection State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;

    let reason = '';
    if (action === 'DELETE') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} selected products? This will also remove them from active carts and wishlists.`
      );
      if (!confirmed) return;
    } else if (action === 'REJECT') {
      const enteredReason = window.prompt(
        `Enter rejection reason for ${selectedIds.length} products:`,
        'Batch rejected by compliance team.'
      );
      if (!enteredReason || !enteredReason.trim()) return;
      reason = enteredReason.trim();
    }

    try {
      setBulkLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const res = await axios.patch(
        `${API_V1_BASE}/admin-products/bulk-status`,
        { productIds: selectedIds, action, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data?.success) {
        toast.success('Bulk Action Completed! ✅', {
          description: res.data.message || `Processed ${selectedIds.length} products successfully.`
        });
        setSelectedIds([]);
        fetchProducts();
      } else {
        throw new Error(res.data?.message || 'Server rejected bulk action');
      }
    } catch (err) {
      console.error('Error executing bulk product action:', err);
      toast.error('Bulk Action Failed', {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setBulkLoading(false);
    }
  };

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

      if (statusFilter !== 'ALL') params.append('approvalStatus', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (stockFilter !== 'ALL') params.append('stockStatus', stockFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `${API_V1_BASE}/admin-products?${params.toString()}`,
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
  }, [categoryFilter, stockFilter, statusFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handler: Approve Product
  const handleApproveProduct = async (productId) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const res = await axios.post(
        `${API_V1_BASE}/admin-products/${productId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data?.success) {
        toast.success("Product Approved! 🚀", {
          description: res.data.message || "Product is now live on customer catalog."
        });
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to approve product:", err);
      toast.error("Approval Failed", {
        description: err.response?.data?.message || "Could not approve product."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Reject Product
  const handleRejectProduct = async (productId, defaultReason = '') => {
    const reason = window.prompt(
      'Enter reason for product rejection (visible to supplier):',
      defaultReason || 'Product details or images do not comply with marketplace standards.'
    );
    if (!reason || !reason.trim()) return;

    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const res = await axios.post(
        `${API_V1_BASE}/admin-products/${productId}/reject`,
        { reason: reason.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data?.success) {
        toast.info("Product Rejected", {
          description: res.data.message || "Product marked as rejected."
        });
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to reject product:", err);
      toast.error("Rejection Failed", {
        description: err.response?.data?.message || "Could not reject product."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Update Stock
  const handleUpdateStock = async (productId, newStock) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.patch(
        `${API_V1_BASE}/admin-products/${productId}/stock`,
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

        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
        );

        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct((prev) => ({ ...prev, stock: Number(newStock) }));
        }

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
        `${API_V1_BASE}/admin-products/${productId}`,
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

  // Export Products Catalog to CSV
  const handleExportProducts = () => {
    exportToCsv({
      data: products,
      filename: `products_catalog_${statusFilter.toLowerCase()}`,
      columns: [
        { key: 'id', label: 'Product ID' },
        { key: 'title', label: 'Product Title' },
        { key: 'approvalStatus', label: 'Approval Status' },
        { key: 'category.name', label: 'Category' },
        { key: 'supplierName', label: 'Supplier Store' },
        { key: 'price', label: 'Customer Price (₹)' },
        { key: 'stock', label: 'Inventory Stock' },
        { key: 'rating', label: 'Rating' }
      ]
    });
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
        tabs={STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        dropdowns={[
          {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categoryOptions
          },
          {
            value: stockFilter,
            onChange: setStockFilter,
            options: STOCK_OPTIONS
          }
        ]}
        totalCount={products.length}
        countLabel="Products"
        onRefresh={() => fetchProducts(true)}
        refreshing={refreshing}
        onExport={handleExportProducts}
        exportLabel="Export Products"
      />

      {/* ── 3. PRODUCTS DATA TABLE ─────────────────────────────────── */}
      <ProductsTable
        products={products}
        loading={loading}
        onInspectProduct={setSelectedProduct}
        onApproveProduct={handleApproveProduct}
        onRejectProduct={handleRejectProduct}
        formatCurrency={formatCurrency}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* ── 4. STICKY BULK ACTIONS FLOATING BAR ────────────────────── */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={products.length}
        onClearSelection={handleClearSelection}
        onBulkApprove={() => handleBulkAction('APPROVE')}
        onBulkReject={() => handleBulkAction('REJECT')}
        onBulkActivate={() => handleBulkAction('ACTIVATE')}
        onBulkDeactivate={() => handleBulkAction('DEACTIVATE')}
        onBulkDelete={() => handleBulkAction('DELETE')}
        loading={bulkLoading}
      />

      {/* ── 5. PRODUCT INSPECT & EDIT MODAL ────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          onApproveProduct={handleApproveProduct}
          onRejectProduct={handleRejectProduct}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
