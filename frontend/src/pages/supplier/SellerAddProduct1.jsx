import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { supabase } from '../../utils/supabase';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  PlusCircle,
  Package,
  Layers,
  Image as ImageIcon,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Eye,
  Box,
  Upload,
  Trash2,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';

// Preset sample images for rapid supplier testing
const SAMPLE_PRESETS = [
  {
    name: '👗 Silk Saree Set (3 Photos)',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: '👕 Cotton Kurti (2 Photos)',
    images: [
      'https://images.unsplash.com/photo-1583391733975-087023d8544e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: '👞 Casual Shoes (3 Photos)',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

// Client-side image compressor: Resizes device images to max 1280px & 0.75 JPEG quality (~90-150KB)
const compressImageFile = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(readerEvent.target.result);
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export default function SellerAddProduct1({ onNavigate }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorySlug: '',
    customCategory: '',
    price: '',
    mrp: '',
    stock: '',
    sku: '',
  });

  // Multiple Images State: array of URLs or base64 strings
  const [images, setImages] = useState(['']);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Fetch real categories and profile
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, prof] = await Promise.allSettled([
          supplierApiService.fetchCategories(),
          supplierApiService.fetchSupplierProfile(),
        ]);

        if (cats.status === 'fulfilled' && cats.value) {
          const list = Array.isArray(cats.value) ? cats.value : [];
          setCategories(list);
          if (list.length > 0) {
            setFormData((prev) => ({ ...prev, categorySlug: list[0].slug || list[0].name }));
          }
        }

        if (prof.status === 'fulfilled' && prof.value) {
          setProfile(prof.value);
        } else {
          setProfile(getCurrentSupplier());
        }
      } catch (err) {
        console.warn('Initialization notice:', err);
      }
    };
    init();
  }, []);

  const handleTabChange = (tabId) => {
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Multiple Images Handlers
  const handleImageUrlChange = (index, value) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addImageUrlSlot = () => {
    if (images.length >= 8) {
      toast.warning('Maximum 8 images allowed per product listing');
      return;
    }
    setImages((prev) => [...prev, '']);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [''];
    });
    if (activePreviewIndex >= index && activePreviewIndex > 0) {
      setActivePreviewIndex((prev) => prev - 1);
    }
  };

  const setAsCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [target] = updated.splice(index, 1);
      updated.unshift(target);
      return updated;
    });
    setActivePreviewIndex(0);
    toast.success('Selected image set as Primary Cover');
  };

  // File Upload Handler (device gallery / camera) with automatic compression
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.filter(Boolean).length + files.length > 8) {
      toast.warning('You can upload up to 8 images in total');
    }

    const toastId = toast.loading('Processing & optimizing image(s)...');
    const selectedFiles = files.slice(0, 8 - images.filter(Boolean).length);

    try {
      const compressedList = [];
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          toast.error(`"${file.name}" is not an image file`);
          continue;
        }
        const dataUrl = await compressImageFile(file);
        if (dataUrl) {
          compressedList.push(dataUrl);
        }
      }

      if (compressedList.length > 0) {
        setImages((prev) => {
          let updated = [...prev];
          for (const item of compressedList) {
            const emptyIdx = updated.findIndex((url) => !url.trim());
            if (emptyIdx !== -1) {
              updated[emptyIdx] = item;
            } else {
              updated.push(item);
            }
          }
          return updated;
        });
        toast.success(`Optimized and added ${compressedList.length} photo(s)!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.warn('File upload compression notice:', err);
      toast.error('Failed to process one or more images', { id: toastId });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick Preset Loader
  const applyPreset = (presetImages) => {
    setImages([...presetImages]);
    setActivePreviewIndex(0);
    toast.success('Sample images applied to listing');
  };

  // Valid, non-empty images
  const validImages = images.map((u) => u.trim()).filter(Boolean);
  const currentPreviewImage = validImages[activePreviewIndex] || validImages[0] || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a product title');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid selling price');
      return;
    }
    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategory = formData.categorySlug === 'CUSTOM'
        ? (formData.customCategory.trim() || 'General')
        : (formData.categorySlug || 'general');

      const finalImages = validImages.length > 0 ? validImages : [];

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: priceNum,
        mrp: formData.mrp ? parseFloat(formData.mrp) : Math.round(priceNum * 1.3),
        stock: stockNum,
        sku: formData.sku.trim() || `MSH-${Date.now().toString().slice(-6)}`,
        categorySlug: selectedCategory.toLowerCase().replace(/\s+/g, '-'),
        categoryName: selectedCategory,
        images: finalImages,
        imageUrl: finalImages[0] || '',
      };

      // 1. Submit product to backend API (handles file writing and deduplication)
      const createdProduct = await supplierApiService.createSupplierProduct(payload);

      // 2. Direct Supabase sync with the final images
      try {
        if (supabase) {
          const syncedImages = createdProduct?.images || payload.images;
          await supabase.from('products').insert([
            {
              title: payload.title,
              description: payload.description,
              price: payload.price,
              stock: payload.stock,
              images: syncedImages,
              category_slug: payload.categorySlug,
              supplier_name: supplierDisplayName,
            }
          ]).select().catch(() => {});
        }
      } catch (sbErr) {
        console.warn('Supabase client insert note:', sbErr);
      }

      toast.success(`🎉 Product "${formData.title}" with ${finalImages.length} image(s) published successfully to live catalog!`);
      setTimeout(() => {
        handleNav('/supplier-inventory1');
      }, 600);
    } catch (err) {
      console.error('Failed to create product:', err);
      toast.error(err.message || 'Failed to publish product. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="add-product"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header Title */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#b7004d] text-xs font-bold tracking-wide uppercase mb-1">
              <PlusCircle className="w-3.5 h-3.5" />
              Listing Creation
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Add New Wholesale Product
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish a new merchandise listing into your live warehouse catalog with pricing, stock units, and multiple high-resolution images.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleNav('/supplier-inventory1')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory</span>
          </button>
        </div>

        {/* 2-Column Form Layout with Real-Time Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column (8 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            {/* 1. Title */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Pure Cotton Floral Print Anarkali Kurti Set with Dupatta"
                value={formData.title}
                onChange={handleChange}
                className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition"
                required
              />
            </div>

            {/* 2. Category & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Product Category
                </label>
                <select
                  name="categorySlug"
                  value={formData.categorySlug}
                  onChange={handleChange}
                  className="w-full h-11 px-3 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug || c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="ethnic-wear">Ethnic Wear</option>
                  <option value="western-wear">Western Wear</option>
                  <option value="accessories">Jewellery & Accessories</option>
                  <option value="footwear">Footwear & Bags</option>
                  <option value="home-kitchen">Home & Kitchen</option>
                  <option value="CUSTOM">+ Add Custom Category</option>
                </select>

                {formData.categorySlug === 'CUSTOM' && (
                  <input
                    type="text"
                    name="customCategory"
                    placeholder="Type custom category name..."
                    value={formData.customCategory}
                    onChange={handleChange}
                    className="w-full h-10 px-3 mt-2 text-xs rounded-xl border border-pink-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  SKU Code (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="e.g. ETH-KRT-042 (Optional)"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                />
              </div>
            </div>

            {/* 3. Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    name="price"
                    placeholder="799"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full h-11 pl-9 pr-3 text-xs font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  MRP / Strike Price (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="mrp"
                    placeholder="1299"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="w-full h-11 pl-9 pr-3 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Available Stock Units <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  placeholder="50"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full h-11 px-4 text-xs font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>
            </div>

            {/* 4. MULTIPLE PRODUCT IMAGES & MEDIA SECTION */}
            <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#d82a62]" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Product Images Gallery ({validImages.length}/8)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add multiple high-resolution photos (Front, Back, Close-up, Lifestyle).
                  </p>
                </div>

                {/* Upload & Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-[#d82a62] hover:text-[#d82a62] text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={addImageUrlSlot}
                    disabled={images.length >= 8}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#d82a62] text-white hover:bg-[#b7004d] text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>
              </div>

              {/* Sample Presets Helper */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-400 font-semibold shrink-0">Quick Fill:</span>
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset.images)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-pink-300 text-slate-600 hover:text-[#b7004d] font-medium transition shrink-0 cursor-pointer shadow-2xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Image Input Rows */}
              <div className="space-y-2.5">
                {images.map((url, idx) => {
                  const isCover = idx === 0;
                  const isValid = Boolean(url && url.trim());

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border transition ${
                        isCover ? 'border-pink-300 shadow-xs ring-1 ring-pink-100' : 'border-slate-200'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center relative">
                        {isValid ? (
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                        {isCover && (
                          <span className="absolute bottom-0 inset-x-0 bg-[#d82a62] text-white text-[8px] font-black text-center py-0.5 leading-none uppercase">
                            Cover
                          </span>
                        )}
                      </div>

                      {/* URL Input */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {isCover ? 'Primary Cover Photo' : `Gallery Image #${idx + 1}`}
                          </span>
                          {!isCover && isValid && (
                            <button
                              type="button"
                              onClick={() => setAsCoverImage(idx)}
                              className="text-[10px] font-bold text-[#b7004d] hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
                              <span>Set as Cover</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder={isCover ? 'Enter primary image URL or upload above...' : `Enter gallery photo #${idx + 1} URL...`}
                          value={url}
                          onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                          className="w-full h-8 px-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
                        />
                      </div>

                      {/* Delete Button */}
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="w-8 h-8 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shrink-0 cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add more button */}
              {images.length < 8 && (
                <button
                  type="button"
                  onClick={addImageUrlSlot}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-pink-300 hover:bg-pink-50/40 text-slate-600 hover:text-[#b7004d] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Product Image ({images.length}/8)</span>
                </button>
              )}
            </div>

            {/* 5. Description */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Product Description & Specifications
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Include fabric details, dimensions, pack contents, washing instructions, etc."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] hover:opacity-95 text-white font-black text-sm shadow-lg shadow-pink-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{isSubmitting ? 'Publishing Listing...' : `Publish Product to Catalog (${validImages.length} Image${validImages.length === 1 ? '' : 's'})`}</span>
              </button>
            </div>
          </form>

          {/* Real-Time Live Preview Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#b7004d]" />
                  <span>Real-Time Catalog Preview</span>
                </div>
                {validImages.length > 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#b7004d]">
                    {validImages.length} Photos
                  </span>
                )}
              </div>

              {/* Card Rendering with Multiple Photos Preview */}
              <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs bg-white">
                {/* Main Image Display */}
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                  {currentPreviewImage ? (
                    <img
                      src={currentPreviewImage}
                      alt="Catalog Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center">
                      <Box className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-[11px]">Product Photo Preview</span>
                    </div>
                  )}

                  {/* Stock Tag */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-emerald-700 shadow-xs">
                    {Number(formData.stock || 0) > 0 ? 'In Stock' : 'Draft'}
                  </span>

                  {/* Multiple Images Counter Badge */}
                  {validImages.length > 1 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
                      {activePreviewIndex + 1} / {validImages.length}
                    </span>
                  )}
                </div>

                {/* Multiple Images Thumbnail Strip */}
                {validImages.length > 1 && (
                  <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                    {validImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePreviewIndex(i)}
                        className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                          activePreviewIndex === i
                            ? 'border-[#d82a62] scale-105 shadow-xs'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold text-[#b7004d] uppercase tracking-wide">
                    {formData.categorySlug || 'Category'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {formData.title || 'Product Title Appears Here'}
                  </h4>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-slate-900">
                      ₹{formData.price ? Number(formData.price).toLocaleString('en-IN') : '0.00'}
                    </span>
                    {formData.mrp && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{Number(formData.mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 border-t border-slate-100">
                    {formData.description || 'Product specifications and details will appear here.'}
                  </p>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 text-[11px] text-[#880e4f] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#d82a62]" />
                  <span>Instant Multi-Image Catalog:</span>
                </div>
                <p className="text-pink-900/80 leading-relaxed">
                  All photos sync directly to the customer product page carousel and warehouse dropship inventory in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
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
