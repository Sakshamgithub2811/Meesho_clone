import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
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
  ExternalLink
} from 'lucide-react';

export default function SellerInventory1({ onNavigate }) {
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

  // Edit stock/price modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      handleNav('/supplier-login');
    }
  };

  // Update Product Price & Stock
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

    setIsSubmitting(true);
    try {
      await supplierApiService.updateSupplierProduct(editingProduct.id, {
        price: priceNum,
        stock: stockNum,
      });

      // Update local state directly
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, price: priceNum, stock: stockNum } : p))
      );

      toast.success(`Updated "${editingProduct.title}" stock and price`);
      setEditingProduct(null);
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

  // Filtered products list (Pure Dynamic Logic)
  const filteredProducts = products.filter((prod) => {
    const titleMatch = (prod.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (prod.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const catMatch = selectedCategory === 'ALL' || 
                     (prod.categorySlug === selectedCategory) ||
                     (prod.category?.name === selectedCategory) ||
                     (prod.category?.slug === selectedCategory);

    let stockMatch = true;
    const stock = Number(prod.stock || 0);
    if (stockFilter === 'IN_STOCK') stockMatch = stock > 0;
    else if (stockFilter === 'LOW_STOCK') stockMatch = stock > 0 && stock < 10;
    else if (stockFilter === 'OUT_OF_STOCK') stockMatch = stock === 0;

    return titleMatch && catMatch && stockMatch;
  });

  // Calculate real inventory statistics
  const totalItems = products.length;
  const inStockItems = products.filter((p) => Number(p.stock) > 0).length;
  const lowStockItems = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 10).length;
  const outOfStockItems = products.filter((p) => Number(p.stock) === 0).length;

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="inventory"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
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

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleNav('/supplier-add-product1')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white hover:opacity-95 font-bold text-sm shadow-md shadow-pink-600/20 transition-all active:scale-95 cursor-pointer"
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

        {/* 4 Metric KPI Cards (Calculated Dynamically from Real Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Listings</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : totalItems}</p>
            <span className="text-[11px] text-slate-500">Live products in catalog</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">In Stock</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{loading ? '...' : inStockItems}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for dispatch</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Low Stock Alert</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{loading ? '...' : lowStockItems}</p>
            <span className="text-[11px] text-amber-600 font-medium">Below 10 units</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Out of Stock</span>
            <p className="text-2xl font-black text-rose-700 mt-1">{loading ? '...' : outOfStockItems}</p>
            <span className="text-[11px] text-rose-600 font-medium">Inactive listings</span>
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
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Stock Level Filter Pills */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'IN_STOCK', label: 'In Stock' },
                { id: 'LOW_STOCK', label: 'Low Stock' },
                { id: 'OUT_OF_STOCK', label: 'Out of Stock' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStockFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    stockFilter === pill.id
                      ? 'bg-white text-[#b7004d] shadow-xs'
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
                    <th className="py-4 px-5">Product Details</th>
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

                    const thumb =
                      (prod.images && prod.images[0]) ||
                      prod.imageUrl ||
                      null;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-3.5 px-5">
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
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                SKU: {prod.sku || `MSH-${String(prod.id).slice(-6)}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {prod.category?.name || prod.categorySlug || 'General'}
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
                                In Stock
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prod);
                                setEditPrice(String(prod.price || ''));
                                setEditStock(String(prod.stock || '0'));
                              }}
                              className="p-2 rounded-xl text-slate-600 hover:text-[#b7004d] hover:bg-pink-50 border border-slate-200 transition cursor-pointer"
                              title="Edit Stock & Price"
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

        {/* Edit Stock & Price Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Quick Edit Inventory</h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{editingProduct.title}</p>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Selling Price (₹ INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-sm font-semibold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Warehouse Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full h-11 px-4 text-sm font-semibold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Products with less than 10 units are automatically marked as "Low Stock".
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
