import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import {
  SUPPLIER_MENU,
  SUPPLIER_ROLES,
  getStoredSupplierSubRole,
  getSupplierMenuForRole,
  isTabAllowedForRole,
} from './supplierNavConfig';
import {
  Package,
  PlusCircle,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Box,
  Layers,
  IndianRupee,
  ArrowRight,
  Filter,
  X,
  ExternalLink,
  UploadCloud,
  Image as ImageIcon,
  Download,
  Video,
  Clock
} from 'lucide-react';
import { exportInventoryToCsv } from '../../utils/csvExport';
import BulkCatalogUploadModal from '../../components/supplier/catalog/BulkCatalogUploadModal';
import EditProductModal from '../../components/supplier/catalog/EditProductModal';
import BulkStockModal from '../../components/supplier/catalog/BulkStockModal';
import BulkPriceModal from '../../components/supplier/catalog/BulkPriceModal';
import VariantMatrixViewModal from '../../components/supplier/catalog/VariantMatrixViewModal';
import { resolveColorHex } from '../../components/supplier/catalog/MultiVariantMatrix';

export default function SellerInventory1({ onNavigate, embedded = false, onNavigateTab }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [profile, setProfile] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentSubRole, setCurrentSubRole] = useState(getStoredSupplierSubRole);

  useEffect(() => {
    const handleRole = (e) => setCurrentSubRole(e?.detail || getStoredSupplierSubRole());
    window.addEventListener('supplier_subrole_changed', handleRole);
    return () => window.removeEventListener('supplier_subrole_changed', handleRole);
  }, []);

  const isAllowed = isTabAllowedForRole('inventory', currentSubRole);
  const currentRoleCfg = SUPPLIER_ROLES[currentSubRole] || SUPPLIER_ROLES.OWNER;

  // Edit stock/price/image modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editVariants, setEditVariants] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Upload & Variant View Modal States
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [viewingVariantsProduct, setViewingVariantsProduct] = useState(null);

  // Multi-Select & Batch Operation States
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStockModalOpen, setBulkStockModalOpen] = useState(false);
  const [bulkStockMode, setBulkStockMode] = useState('SET'); // 'SET' | 'ADD' | 'OUT_OF_STOCK'
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [bulkPriceMode, setBulkPriceMode] = useState('SET'); // 'SET' | 'PERCENT_DISCOUNT' | 'FLAT_DISCOUNT'
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Load real data from backend
  const loadInventory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [prodsRes, catsRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierProducts({ limit: 100 }),
        supplierApiService.fetchCategories(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (prodsRes.status === 'fulfilled' && prodsRes.value) {
        const prodData = prodsRes.value.data || prodsRes.value.products || (Array.isArray(prodsRes.value) ? prodsRes.value : []);
        setProducts(prodData);
      } else {
        setProducts([]);
      }

      if (catsRes.status === 'fulfilled' && catsRes.value) {
        setCategories(Array.isArray(catsRes.value) ? catsRes.value : []);
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Inventory catalog refreshed');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Handle Menu Navigation
  const handleTabChange = (tabId) => {
    if (onNavigateTab) return onNavigateTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  // Safe Logout
  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn(err);
    } finally {
      clearAuthSession();
      toast.success('Logged out successfully');
      handleNav('/supplier/auth/login');
    }
  };

  // Image file handler for editing
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not a valid image file`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    setEditImages((prev) => [...prev, ...validFiles].slice(0, 8));
    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setEditImagePreviews((prev) => [...prev, ...previews].slice(0, 8));
  };

  const removeSelectedImage = (index) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Update Product Price, Stock & Images
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editPrice);
    const stockNum = parseInt(editStock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    const finalStock = editVariants.length > 0
      ? editVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
      : stockNum;

    setIsSubmitting(true);
    try {
      let updatedProd;
      if (editImages.length > 0) {
        const formData = new FormData();
        formData.append('price', priceNum);
        formData.append('stock', finalStock);
        if (editVariants.length > 0) {
          formData.append('variants', JSON.stringify(editVariants));
        }
        editImages.forEach((imgFile) => {
          formData.append('images', imgFile);
        });
        updatedProd = await supplierApiService.updateSupplierProduct(editingProduct.id, formData);
      } else {
        updatedProd = await supplierApiService.updateSupplierProduct(editingProduct.id, {
          price: priceNum,
          stock: finalStock,
          variants: editVariants.length > 0 ? editVariants : undefined,
        });
      }

      // Update local state directly
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                price: priceNum,
                stock: finalStock,
                variants: editVariants.length > 0 ? editVariants : p.variants,
                images: updatedProd?.images || p.images,
              }
            : p
        )
      );

      toast.success(`Updated "${editingProduct.title}" successfully!`);
      setEditingProduct(null);
      setEditVariants([]);
      setEditImages([]);
      setEditImagePreviews([]);
    } catch (err) {
      console.error('Update product error:', err);
      toast.error(err.message || 'Failed to update product details');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from your catalog?`)) {
      return;
    }

    try {
      await supplierApiService.deleteSupplierProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Product deleted from inventory');
    } catch (err) {
      console.error('Delete product error:', err);
      toast.error(err.message || 'Failed to delete product');
    }
  };

  // Helper to determine if product is under review (e.g. pending admin approval)
  const isProductUnderReview = (prod) => {
    return (
      prod?.approvalStatus === 'PENDING' ||
      (!prod?.isActive && prod?.approvalStatus !== 'REJECTED') ||
      prod?.category?.status === 'PENDING' ||
      prod?.category_status === 'PENDING'
    );
  };

  const isProductRejected = (prod) => {
    return prod?.approvalStatus === 'REJECTED';
  };

  // Filtered products list (Pure Dynamic Logic)
  const filteredProducts = products.filter((prod) => {
    const titleMatch = (prod.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (prod.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const catMatch = selectedCategory === 'ALL' || 
                     (prod.categorySlug === selectedCategory) ||
                     (prod.category?.name === selectedCategory) ||
                     (prod.category?.slug === selectedCategory);

    const underReview = isProductUnderReview(prod);
    const rejected = isProductRejected(prod);
    let stockMatch = true;
    const stock = Number(prod.stock || 0);

    if (stockFilter === 'UNDER_REVIEW') stockMatch = underReview && !rejected;
    else if (stockFilter === 'LIVE') stockMatch = !underReview && !rejected;
    else if (stockFilter === 'REJECTED') stockMatch = rejected;
    else if (stockFilter === 'IN_STOCK') stockMatch = stock > 0 && !underReview && !rejected;
    else if (stockFilter === 'LOW_STOCK') stockMatch = stock > 0 && stock < 10 && !underReview && !rejected;
    else if (stockFilter === 'OUT_OF_STOCK') stockMatch = stock === 0 && !underReview && !rejected;

    return titleMatch && catMatch && stockMatch;
  });

  // Calculate real inventory statistics
  const totalItems = products.length;
  const underReviewItems = products.filter((p) => isProductUnderReview(p) && !isProductRejected(p)).length;
  const rejectedItems = products.filter(isProductRejected).length;
  const liveItems = products.filter((p) => !isProductUnderReview(p) && !isProductRejected(p)).length;
  const inStockItems = products.filter((p) => Number(p.stock) > 0 && !isProductUnderReview(p) && !isProductRejected(p)).length;
  const lowStockItems = products.filter((p) => {
    const s = Number(p.stock || 0);
    return s > 0 && s < 10 && !isProductUnderReview(p) && !isProductRejected(p);
  }).length;
  const outOfStockItems = products.filter((p) => Number(p.stock) === 0 && !isProductUnderReview(p) && !isProductRejected(p)).length;

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  const handleExportInventory = () => {
    const listToExport = filteredProducts.length > 0 ? filteredProducts : products;
    if (listToExport.length === 0) {
      toast.error('No products available in catalog to export');
      return;
    }
    const count = exportInventoryToCsv(listToExport, supplierDisplayName);
    toast.success(`Exported ${count} inventory item(s) to CSV spreadsheet!`);
  };

  // Multi-Select Properties
  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  const isSomeSelected =
    filteredProducts.some((p) => selectedIds.has(p.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set();
      filteredProducts.forEach((p) => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk Stock Submit
  const handleExecuteBulkStock = async (e) => {
    e.preventDefault();
    if (selectedIds.size === 0) return;

    if (bulkStockMode !== 'OUT_OF_STOCK' && (!bulkStockValue || isNaN(bulkStockValue))) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setIsBulkSubmitting(true);
    try {
      const res = await supplierApiService.bulkUpdateSupplierProducts({
        productIds: Array.from(selectedIds),
        action: 'STOCK',
        stockMode: bulkStockMode,
        stockValue: bulkStockMode === 'OUT_OF_STOCK' ? 0 : parseInt(bulkStockValue, 10),
      });

      const updatedList = res?.data || [];
      const updatedMap = new Map(updatedList.map((p) => [p.id, p]));

      setProducts((prev) =>
        prev.map((p) => {
          if (updatedMap.has(p.id)) return { ...p, ...updatedMap.get(p.id) };
          if (selectedIds.has(p.id)) {
            let nextStock = p.stock;
            if (bulkStockMode === 'OUT_OF_STOCK') nextStock = 0;
            else if (bulkStockMode === 'SET') nextStock = Math.max(0, parseInt(bulkStockValue, 10));
            else if (bulkStockMode === 'ADD') nextStock = Math.max(0, p.stock + parseInt(bulkStockValue, 10));
            return { ...p, stock: nextStock };
          }
          return p;
        })
      );

      toast.success(`Successfully updated stock for ${selectedIds.size} products!`);
      setBulkStockModalOpen(false);
      setSelectedIds(new Set());
      setBulkStockValue('');
    } catch (err) {
      console.error('Bulk stock update error:', err);
      toast.error('Failed to bulk update stock');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Bulk Price Submit
  const handleExecuteBulkPrice = async (e) => {
    e.preventDefault();
    if (selectedIds.size === 0) return;

    if (!bulkPriceValue || isNaN(bulkPriceValue) || parseFloat(bulkPriceValue) <= 0) {
      toast.error('Please enter a valid price / discount amount');
      return;
    }

    setIsBulkSubmitting(true);
    try {
      const res = await supplierApiService.bulkUpdateSupplierProducts({
        productIds: Array.from(selectedIds),
        action: 'PRICE',
        priceMode: bulkPriceMode,
        priceValue: parseFloat(bulkPriceValue),
      });

      const updatedList = res?.data || [];
      const updatedMap = new Map(updatedList.map((p) => [p.id, p]));

      setProducts((prev) =>
        prev.map((p) => {
          if (updatedMap.has(p.id)) return { ...p, ...updatedMap.get(p.id) };
          if (selectedIds.has(p.id)) {
            let nextPrice = p.price;
            const val = parseFloat(bulkPriceValue);
            if (bulkPriceMode === 'SET') nextPrice = Math.max(1, val);
            else if (bulkPriceMode === 'PERCENT_DISCOUNT') nextPrice = Math.max(1, Math.round(p.price * (1 - val / 100)));
            else if (bulkPriceMode === 'FLAT_DISCOUNT') nextPrice = Math.max(1, Math.round(p.price - val));
            return { ...p, price: nextPrice };
          }
          return p;
        })
      );

      toast.success(`Successfully adjusted prices for ${selectedIds.size} products!`);
      setBulkPriceModalOpen(false);
      setSelectedIds(new Set());
      setBulkPriceValue('');
    } catch (err) {
      console.error('Bulk price update error:', err);
      toast.error('Failed to bulk adjust prices');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Quick 1-click Bulk Out of Stock
  const handleBulkOutOfStock = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Set all ${selectedIds.size} selected products to Out of Stock (0 units)?`)) return;

    setIsBulkSubmitting(true);
    try {
      await supplierApiService.bulkUpdateSupplierProducts({
        productIds: Array.from(selectedIds),
        action: 'STOCK',
        stockMode: 'OUT_OF_STOCK',
      });

      setProducts((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, stock: 0 } : p))
      );

      toast.success(`Marked ${selectedIds.size} products as Out of Stock!`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error('Failed to mark items as out of stock');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete / archive ${selectedIds.size} selected products? Existing completed customer orders will be preserved.`)) return;

    setIsBulkSubmitting(true);
    try {
      await supplierApiService.bulkDeleteSupplierProducts(Array.from(selectedIds));

      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));

      toast.success(`Successfully deleted ${selectedIds.size} products!`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error('Failed to delete selected products');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#b7004d] text-xs font-bold tracking-wide uppercase mb-1">
              <Package className="w-3.5 h-3.5" />
              Live Inventory Management
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Products & Catalog
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your live warehouse stock, unit pricing, SKU catalog, and listing availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportInventory}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition active:scale-95 cursor-pointer"
              title="Download full catalog stock and pricing report in CSV / Excel format"
            >
              <Download className="w-4 h-4 text-[#b7004d]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Bulk CSV Import Button */}
            <button
              type="button"
              onClick={() => setBulkUploadOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-[#b7004d] hover:bg-pink-100 font-bold text-xs transition active:scale-95 cursor-pointer shadow-xs"
              title="Bulk upload 50+ products via Excel / CSV template"
            >
              <UploadCloud className="w-4 h-4 text-[#b7004d]" />
              <span>Bulk CSV Import</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/supplier-add-product1')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white hover:opacity-95 font-bold text-xs shadow-md shadow-pink-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              type="button"
              onClick={() => loadInventory(true)}
              disabled={refreshing}
              title="Refresh Catalog"
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 Metric KPI Cards (Calculated Dynamically from Real Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Listings</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : totalItems}</p>
            <span className="text-[11px] text-slate-500">All supplier items</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/40 to-white shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              Under Review
            </span>
            <p className="text-2xl font-black text-amber-800 mt-1">{loading ? '...' : underReviewItems}</p>
            <span className="text-[11px] text-amber-700 font-medium">Category pending review</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Live in Catalog</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{loading ? '...' : liveItems}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Active on marketplace</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-blue-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">In Stock</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{loading ? '...' : inStockItems}</p>
            <span className="text-[11px] text-blue-600 font-medium">Ready for dispatch</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-rose-100 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Out / Low Stock</span>
            <p className="text-2xl font-black text-rose-700 mt-1">{loading ? '...' : lowStockItems + outOfStockItems}</p>
            <span className="text-[11px] text-rose-600 font-medium">{outOfStockItems} out, {lowStockItems} low</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product title or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 px-3 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.slug || cat.name}>
                    {cat.name} {cat.status === 'PENDING' ? '⏳ (In Review)' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Stock & Approval Level Filter Pills */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold overflow-x-auto">
              {[
                { id: 'ALL', label: 'All' },
                {
                  id: 'UNDER_REVIEW',
                  label: underReviewItems > 0 ? `⏳ Under Review (${underReviewItems})` : 'Under Review ⏳',
                },
                {
                  id: 'REJECTED',
                  label: rejectedItems > 0 ? `❌ Rejected (${rejectedItems})` : 'Rejected ❌',
                },
                { id: 'LIVE', label: 'Live Catalog ✅' },
                { id: 'IN_STOCK', label: 'In Stock' },
                { id: 'LOW_STOCK', label: 'Low Stock' },
                { id: 'OUT_OF_STOCK', label: 'Out of Stock' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStockFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    stockFilter === pill.id
                      ? pill.id === 'UNDER_REVIEW'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : pill.id === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-[#b7004d] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Products Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* REAL EMPTY STATE */
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#b7004d] flex items-center justify-center shadow-inner">
                <Box className="w-8 h-8 opacity-80" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery || stockFilter !== 'ALL' || selectedCategory !== 'ALL'
                    ? 'No Products Found Matching Filters'
                    : 'Your Inventory Catalog is Empty'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery || stockFilter !== 'ALL' || selectedCategory !== 'ALL'
                    ? 'Try adjusting your search terms or filters to find what you are looking for.'
                    : 'Start publishing your products with prices, stocks, and images to make them available across wholesale and retail networks.'}
                </p>
              </div>

              {searchQuery || stockFilter !== 'ALL' || selectedCategory !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('ALL');
                    setSelectedCategory('ALL');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Reset All Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('/supplier-add-product1')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white text-xs font-bold shadow-md shadow-pink-600/20 hover:opacity-95 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add First Product</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 accent-[#b7004d] cursor-pointer"
                        title={isAllSelected ? 'Deselect all' : 'Select all products'}
                      />
                    </th>
                    <th className="py-4 px-4">Product Details</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Current Stock</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => {
                    const stock = Number(prod.stock || 0);
                    const isLow = stock > 0 && stock < 10;
                    const isOut = stock === 0;
                    const isSelected = selectedIds.has(prod.id);

                    const thumb =
                      (prod.images && prod.images[0]) ||
                      prod.imageUrl ||
                      null;

                    return (
                      <tr
                        key={prod.id}
                        className={`transition-colors group ${
                          isSelected ? 'bg-pink-50/60 hover:bg-pink-50/80' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(prod.id)}
                            className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 accent-[#b7004d] cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {thumb ? (
                              <div className="relative shrink-0">
                                <img
                                  src={thumb}
                                  alt={prod.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                                {Array.isArray(prod.images) && prod.images.length > 1 && (
                                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold rounded-md leading-none shadow-xs">
                                    +{prod.images.length - 1}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center shrink-0">
                                <Box className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-xs">
                              <h4 className="font-bold text-slate-900 truncate text-[13px] group-hover:text-[#b7004d] transition-colors">
                                {prod.title}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[11px] text-slate-400 font-mono">
                                  SKU: {prod.sku || `MSH-${String(prod.id).slice(-6)}`}
                                </span>
                                {Boolean(prod.videoUrl || prod.video_url) && (
                                  <span className="text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1" title="Product has Video Demo Reel attached">
                                    <Video className="w-2.5 h-2.5 text-rose-600" />
                                    <span>Video</span>
                                  </span>
                                )}
                                {prod.thickness && (
                                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {prod.thickness}
                                  </span>
                                )}
                                {Array.isArray(prod.colors) && prod.colors.length > 0 && (
                                  <span className="text-[9.5px] font-bold text-[#b7004d] bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">
                                    {prod.colors.length} Color{prod.colors.length > 1 ? 's' : ''}
                                  </span>
                                )}
                                {Array.isArray(prod.variants) && prod.variants.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setViewingVariantsProduct(prod)}
                                    className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 transition cursor-pointer inline-flex items-center gap-1"
                                    title="Click to view full Color × Size Variant Matrix"
                                  >
                                    <Layers className="w-2.5 h-2.5" />
                                    <span>{prod.variants.length} Variants</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-800 font-semibold">
                              {prod.category?.name || prod.categorySlug || 'General'}
                            </span>
                            {prod.approvalStatus === 'REJECTED' ? (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                                title={`Rejection Reason: ${prod.rejectionReason || 'Violated catalog guidelines'}`}
                              >
                                ❌ Rejected {prod.rejectionReason ? `(${prod.rejectionReason})` : ''}
                              </span>
                            ) : Boolean(isProductUnderReview(prod)) ? (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                                title="Product is waiting for Admin approval before going live to customers"
                              >
                                ⏳ Review Pending
                              </span>
                            ) : (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
                                title="Product is live for customers to purchase"
                              >
                                ✅ Live
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          ₹{Number(prod.price || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          <span
                            className={`font-bold ${
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {stock} units
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isProductUnderReview(prod) ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs animate-pulse"
                              title="Under Review: This product's custom category is awaiting Admin approval. It will automatically go live in customer catalog once approved."
                            >
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Under Review ⏳</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isOut
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isOut ? (
                                'Out of Stock'
                              ) : isLow ? (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  Low Stock
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Live in Catalog
                                </>
                              )}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prod);
                                setEditPrice(String(prod.price || ''));
                                setEditStock(String(prod.stock || '0'));
                                setEditVariants(Array.isArray(prod.variants) ? prod.variants : []);
                                setEditImages([]);
                                setEditImagePreviews([]);
                              }}
                              className="p-2 rounded-xl text-slate-600 hover:text-[#b7004d] hover:bg-pink-50 border border-slate-200 transition cursor-pointer"
                              title="Edit Details & Images"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id, prod.title)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Stock, Price & Images Modal */}
        <EditProductModal
          editingProduct={editingProduct}
          onClose={() => {
            setEditingProduct(null);
            setEditImages([]);
            setEditImagePreviews([]);
          }}
          editPrice={editPrice}
          setEditPrice={setEditPrice}
          editStock={editStock}
          setEditStock={setEditStock}
          editVariants={editVariants}
          setEditVariants={setEditVariants}
          editImagePreviews={editImagePreviews}
          handleImageChange={handleImageChange}
          removeSelectedImage={removeSelectedImage}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdateProduct}
        />

        {/* FLOATING BATCH ACTION TOOLBAR */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-[95vw]">
            <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span className="text-xs font-black bg-pink-600 text-white px-2.5 py-1 rounded-xl shadow-xs">
                {selectedIds.size} Selected
              </span>
            </div>

            {/* Bulk Stock Button */}
            <button
              type="button"
              onClick={() => {
                setBulkStockMode('SET');
                setBulkStockValue('');
                setBulkStockModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-pink-400" />
              <span>Bulk Stock</span>
            </button>

            {/* Bulk Price Button */}
            <button
              type="button"
              onClick={() => {
                setBulkPriceMode('SET');
                setBulkPriceValue('');
                setBulkPriceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bulk Price</span>
            </button>

            {/* Quick Out of Stock */}
            <button
              type="button"
              disabled={isBulkSubmitting}
              onClick={handleBulkOutOfStock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition active:scale-95 cursor-pointer border border-amber-500/30 disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mark Out of Stock</span>
            </button>

            {/* Bulk Delete */}
            <button
              type="button"
              disabled={isBulkSubmitting}
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer border border-rose-500/30 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            {/* Deselect All */}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bulk Stock Modal */}
        <BulkStockModal
          isOpen={bulkStockModalOpen}
          onClose={() => setBulkStockModalOpen(false)}
          selectedCount={selectedIds.size}
          bulkStockMode={bulkStockMode}
          setBulkStockMode={setBulkStockMode}
          bulkStockValue={bulkStockValue}
          setBulkStockValue={setBulkStockValue}
          onSubmit={handleExecuteBulkStock}
          isSubmitting={isBulkSubmitting}
        />

        {/* Bulk Price Modal */}
        <BulkPriceModal
          isOpen={bulkPriceModalOpen}
          onClose={() => setBulkPriceModalOpen(false)}
          selectedCount={selectedIds.size}
          bulkPriceMode={bulkPriceMode}
          setBulkPriceMode={setBulkPriceMode}
          bulkPriceValue={bulkPriceValue}
          setBulkPriceValue={setBulkPriceValue}
          onSubmit={handleExecuteBulkPrice}
          isSubmitting={isBulkSubmitting}
        />

        {/* Color × Size Variant Matrix Inspection Modal */}
        <VariantMatrixViewModal
          product={viewingVariantsProduct}
          onClose={() => setViewingVariantsProduct(null)}
          resolveColorHex={resolveColorHex}
        />

        {/* Bulk Catalog Mass Import Modal */}
        <BulkCatalogUploadModal
          isOpen={bulkUploadOpen}
          onClose={() => setBulkUploadOpen(false)}
          onSuccess={() => {
            loadInventory(true);
          }}
        />
      </div>
  );

  if (embedded) {
    if (!isAllowed) {
      return (
        <div className="max-w-2xl mx-auto my-10 bg-white rounded-2xl border border-rose-200 p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Access Restricted: Catalog & Inventory Management
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your role <strong className="text-slate-900 font-bold">{currentRoleCfg.label}</strong> does not have permission to manage catalog products, variant matrices, or bulk uploads.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('staff') : handleNav('/seller-web-dashboard1?tab=staff')}
              className="px-5 py-2.5 rounded-xl bg-[#b7004d] text-white font-bold text-xs hover:bg-[#92003d] transition cursor-pointer shadow-xs"
            >
              Open RBAC & Staff Management
            </button>
          </div>
        </div>
      );
    }
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={getSupplierMenuForRole(currentSubRole)}
      activeTab="inventory"
      onTabChange={handleTabChange}
      roleName={`SUPPLIER • ${currentRoleCfg.shortLabel}`}
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {!isAllowed ? (
        <div className="max-w-2xl mx-auto my-10 bg-white rounded-2xl border border-rose-200 p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Access Restricted: Catalog & Inventory Management
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your role <strong className="text-slate-900 font-bold">{currentRoleCfg.label}</strong> does not have permission to manage catalog products, variant matrices, or bulk uploads.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/seller-web-dashboard1?tab=staff')}
              className="px-5 py-2.5 rounded-xl bg-[#b7004d] text-white font-bold text-xs hover:bg-[#92003d] transition cursor-pointer shadow-xs"
            >
              Open RBAC & Staff Management
            </button>
          </div>
        </div>
      ) : (
        mainContent
      )}

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
