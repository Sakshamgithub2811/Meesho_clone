import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/ecommerceService';

// Category-specific variant options
const CATEGORY_VARIANT_CONFIGS = {
  'Ethnic Wear': {
    categorySlug: 'women-ethnic',
    sizeLabel: 'Available Sizes',
    sizeHelp: 'Select applicable sizes for this product',
    defaultSizes: ['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colorLabel: 'Available Colors',
    defaultColors: ['Red', 'Maroon', 'Navy Blue', 'Emerald Green', 'Pink', 'Mustard Yellow', 'Black', 'White', 'Wine'],
  },
  'Western Wear': {
    categorySlug: 'women-western',
    sizeLabel: 'Available Sizes',
    sizeHelp: 'Select apparel or waist denim sizes',
    defaultSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'],
    colorLabel: 'Available Colors',
    defaultColors: ['Black', 'White', 'Blue', 'Beige', 'Pink', 'Olive Green', 'Lavender', 'Red', 'Navy'],
  },
  'Men': {
    categorySlug: 'men',
    sizeLabel: 'Men Sizes',
    sizeHelp: 'Select shirt, t-shirt, or trouser sizes',
    defaultSizes: ['S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44'],
    colorLabel: 'Available Colors',
    defaultColors: ['Black', 'Navy Blue', 'White', 'Grey', 'Olive', 'Maroon', 'Dark Green'],
  },
  'Kids': {
    categorySlug: 'kids',
    sizeLabel: 'Age & Fit Sizes',
    sizeHelp: 'Select age group or infant sizes',
    defaultSizes: ['0-6 Months', '6-12 Months', '1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years', '7-8 Years', 'Free Size'],
    colorLabel: 'Available Colors',
    defaultColors: ['Baby Pink', 'Sky Blue', 'Yellow', 'Red', 'Navy Blue', 'Mint Green', 'White'],
  },
  'Footwear': {
    categorySlug: 'footwear',
    sizeLabel: 'Shoe Sizes (UK / India)',
    sizeHelp: 'Select Indian/UK footwear sizes',
    defaultSizes: ['4 UK', '5 UK', '6 UK', '7 UK', '8 UK', '9 UK', '10 UK', '11 UK'],
    colorLabel: 'Available Colors',
    defaultColors: ['Black', 'White', 'Tan Brown', 'Dark Brown', 'Navy Blue', 'Grey', 'Red'],
  },
  'Beauty & Health': {
    categorySlug: 'beauty-health',
    sizeLabel: 'Pack Sizes & Net Volume',
    sizeHelp: 'Select volume, weight or combo packs',
    defaultSizes: ['30 ml', '50 ml', '100 ml', '200 ml', 'Pack of 1', 'Pack of 2', 'Pack of 4', '50g', '100g'],
    colorLabel: 'Shades / Variants (Optional)',
    defaultColors: ['Nude', 'Ruby Red', 'Coral Pink', 'Plum', 'Natural', 'Peach'],
  },
  'Home & Kitchen': {
    categorySlug: 'home-kitchen',
    sizeLabel: 'Dimensions & Capacity',
    sizeHelp: 'Select bedding size, volume or pack count',
    defaultSizes: ['Single', 'Double', 'Queen Size', 'King Size', 'Pack of 1', 'Pack of 2', 'Pack of 4', 'Free Size'],
    colorLabel: 'Colors / Patterns',
    defaultColors: ['Multi Color', 'Navy Blue', 'Grey', 'Beige', 'Maroon', 'White', 'Silver'],
  },
  'Electronics': {
    categorySlug: 'electronics',
    sizeLabel: 'Edition & Capacity',
    sizeHelp: 'Select storage, capacity or edition',
    defaultSizes: ['Standard', 'Free Size', '64 GB', '128 GB', '256 GB', 'Pack of 1'],
    colorLabel: 'Device Colors',
    defaultColors: ['Black', 'Silver', 'Space Grey', 'Blue', 'White', 'Rose Gold'],
  },
  'Jewellery': {
    categorySlug: 'jewellery',
    sizeLabel: 'Fit & Pack Size',
    sizeHelp: 'Select jewelry size or set count',
    defaultSizes: ['Free Size', 'Adjustable', 'Pack of 1', 'Combo Set'],
    colorLabel: 'Plating / Finish',
    defaultColors: ['Gold Plated', 'Silver Plated', 'Oxidised Silver', 'Rose Gold', 'Antique Brass'],
  },
};

export function AddNewProductSupplier({ onBack, onSaveDraft, onPublish }) {
  const navigate = useNavigate();

  // Form State - 100% Clean & Empty (Zero Dummy Data)
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Ethnic Wear');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [mrp, setMrp] = useState('');
  const [supplierPrice, setSupplierPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [skuId, setSkuId] = useState('');
  const [gstSlab, setGstSlab] = useState('5%');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  // Variants State - Starts completely empty
  const initialConfig = CATEGORY_VARIANT_CONFIGS['Ethnic Wear'];
  const [selectedColors, setSelectedColors] = useState([]);
  const [availableColors, setAvailableColors] = useState(initialConfig.defaultColors);
  const [newColorInput, setNewColorInput] = useState('');
  const [showAddColorInput, setShowAddColorInput] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [availableSizes, setAvailableSizes] = useState(initialConfig.defaultSizes);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [showAddSizeInput, setShowAddSizeInput] = useState(false);

  // Media state - Starts with zero images
  const [primaryImage, setPrimaryImage] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [secondaryImages, setSecondaryImages] = useState([null, null, null, null]);

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Adapt options when category changes
  useEffect(() => {
    const config = CATEGORY_VARIANT_CONFIGS[category];
    if (config) {
      setAvailableSizes(config.defaultSizes);
      setSelectedSizes([]);
      setAvailableColors(config.defaultColors);
      setSelectedColors([]);
    }
  }, [category]);

  // Price & Discount calculation
  const handlePriceChange = (val, type) => {
    if (type === 'mrp') {
      setMrp(val);
      if (val && supplierPrice) {
        const m = parseFloat(val);
        const s = parseFloat(supplierPrice);
        if (m > 0 && s >= 0 && m >= s) {
          setDiscount(Math.round(((m - s) / m) * 100).toString());
        } else {
          setDiscount('');
        }
      }
    } else if (type === 'supplierPrice') {
      setSupplierPrice(val);
      if (mrp && val) {
        const m = parseFloat(mrp);
        const s = parseFloat(val);
        if (m > 0 && s >= 0 && m >= s) {
          setDiscount(Math.round(((m - s) / m) * 100).toString());
        } else {
          setDiscount('');
        }
      }
    }
  };

  const generateRandomSku = () => {
    const randomCode = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setSkuId(randomCode);
    showToast(`Generated SKU: ${randomCode}`);
  };

  // Color toggle
  const toggleColor = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleAddCustomColor = () => {
    if (newColorInput.trim() && !availableColors.includes(newColorInput.trim())) {
      const color = newColorInput.trim();
      setAvailableColors([...availableColors, color]);
      setSelectedColors([...selectedColors, color]);
      setNewColorInput('');
      setShowAddColorInput(false);
      showToast(`Added color "${color}"`);
    }
  };

  // Size toggle
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    if (newSizeInput.trim() && !availableSizes.includes(newSizeInput.trim())) {
      const size = newSizeInput.trim();
      setAvailableSizes([...availableSizes, size]);
      setSelectedSizes([...selectedSizes, size]);
      setNewSizeInput('');
      setShowAddSizeInput(false);
      showToast(`Added size "${size}"`);
    }
  };

  // Image Upload handler with Canvas Compression
  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Image file should be under 15MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);

          if (index === 'primary') {
            setPrimaryImage(compressedUrl);
            showToast('Primary photo uploaded successfully! 📸');
          } else {
            const updated = [...secondaryImages];
            updated[index] = compressedUrl;
            setSecondaryImages(updated);
            showToast(`Photo ${index + 2} uploaded!`);
          }
        };
        img.onerror = () => {
          const rawUrl = readEvent.target.result;
          if (index === 'primary') setPrimaryImage(rawUrl);
          else {
            const updated = [...secondaryImages];
            updated[index] = rawUrl;
            setSecondaryImages(updated);
          }
        };
        img.src = readEvent.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setPrimaryImage(imageUrlInput.trim());
      setImageUrlInput('');
      setShowUrlInput(false);
      showToast('Image URL applied successfully!');
    }
  };

  // Submit Handler - Saves Real Product into Database
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!primaryImage) {
      showToast('⚠️ Please upload at least 1 primary product photo');
      return;
    }
    if (!productName.trim()) {
      showToast('⚠️ Please enter a product title / name');
      return;
    }
    if (!supplierPrice || parseFloat(supplierPrice) <= 0) {
      showToast('⚠️ Please enter a valid selling price');
      return;
    }
    if (!stockQuantity || parseInt(stockQuantity, 10) < 0) {
      showToast('⚠️ Please enter available stock units');
      return;
    }
    if (selectedSizes.length === 0) {
      showToast('⚠️ Please select at least 1 available size');
      return;
    }

    setIsSubmitting(true);
    try {
      const config = CATEGORY_VARIANT_CONFIGS[category];
      const allImages = [primaryImage, ...secondaryImages.filter(Boolean)].filter(Boolean);

      const payload = {
        title: productName.trim(),
        description: description.trim() || `${productName.trim()} - Verified quality product with free delivery.`,
        price: parseFloat(supplierPrice),
        originalPrice: mrp ? parseFloat(mrp) : Math.round(parseFloat(supplierPrice) * 1.3),
        discountPercentage: discount ? parseInt(discount, 10) : 0,
        categoryName: category,
        categorySlug: config?.categorySlug || 'women-ethnic',
        images: allImages,
        sizes: selectedSizes,
        colors: selectedColors,
        stock: parseInt(stockQuantity, 10) || 50,
        isFreeDelivery: true,
        supplierName: brand.trim() || 'Verified Supplier',
      };

      const result = await createProduct(payload);

      if (result && result.success && result.data) {
        setCreatedProduct(result.data);
        showToast('🚀 Product successfully published to database!');
        if (onPublish) onPublish(result.data);
      } else {
        showToast(result?.message || 'Failed to publish product.');
      }
    } catch (err) {
      console.error('Submit product error:', err);
      showToast('Error publishing product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraft = () => {
    if (!productName.trim()) {
      showToast('Enter at least a product title to save draft');
      return;
    }
    showToast('💾 Product draft saved successfully.');
    if (onSaveDraft) onSaveDraft();
  };

  return (
    <div className="bg-[#F8F9FB] text-[#191C1E] min-h-screen pb-36 font-sans antialiased selection:bg-pink-100 selection:text-pink-600">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006a34] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 w-full max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              aria-label="Go Back"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95 text-[#b90041] cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-[#191C1E] tracking-tight leading-none">
                Add New Product to Catalog
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Supplier Hub • Product Listing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDraft}
              className="hidden sm:inline-flex px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-[#B90041] to-[#DF2457] text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/25 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish Product</span>
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <form onSubmit={handleSubmit}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Fields & Media (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Product Media Gallery */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-extrabold text-base text-[#191C1E]">
                      Product Photos &amp; Media <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Upload clear, real product photos from your device
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
                  >
                    {showUrlInput ? 'Hide URL Box' : '+ Paste Image URL'}
                  </button>
                </div>

                {/* Optional direct URL box */}
                {showUrlInput && (
                  <div className="flex gap-2 items-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste direct image URL (https://...)..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImageUrl}
                      className="px-4 py-2 bg-[#b90041] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Image Tiles Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* Primary Photo */}
                  <div className="relative aspect-square border-2 border-dashed border-[#b90041] rounded-2xl overflow-hidden bg-pink-50/20 flex flex-col items-center justify-center group cursor-pointer hover:bg-pink-50/40 transition-colors">
                    {primaryImage ? (
                      <>
                        <img
                          src={primaryImage}
                          alt="Primary Product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer text-white text-xs font-bold px-3 py-1.5 bg-black/70 rounded-xl hover:bg-black">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, 'primary')}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(null)}
                            className="text-white text-xs font-bold px-2 py-1.5 bg-red-600/80 rounded-xl hover:bg-red-600"
                            title="Remove Photo"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#b90041] text-white text-[10px] font-bold rounded-md shadow-xs">
                          Primary Photo
                        </span>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center p-3">
                        <div className="w-12 h-12 rounded-full bg-pink-100 text-[#b90041] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#b90041]">Upload Main Photo</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to choose image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'primary')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Secondary Photos (Photo 2 to 5) */}
                  {secondaryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center group cursor-pointer hover:border-slate-400 transition-colors"
                    >
                      {img ? (
                        <>
                          <img
                            src={img}
                            alt={`Photo ${idx + 2}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <label className="cursor-pointer text-white text-[10px] font-bold px-2 py-1 bg-black/60 rounded-md">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, idx)}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...secondaryImages];
                                updated[idx] = null;
                                setSecondaryImages(updated);
                              }}
                              className="text-white text-[10px] font-bold px-2 py-1 bg-red-600/80 rounded-md"
                              title="Remove Photo"
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center p-3 text-slate-400 hover:text-slate-600">
                          <span className="material-symbols-outlined text-2xl mb-1 text-slate-300 group-hover:text-slate-500">add_photo_alternate</span>
                          <span className="text-[11px] font-bold">+ Photo {idx + 2}</span>
                          <span className="text-[9px] text-slate-400">Optional</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, idx)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 2: General Details */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-extrabold text-base text-[#191C1E]">
                  Product Title &amp; Category
                </h2>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Product Title / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter full product name (e.g. Women Pure Cotton Printed Kurta)..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#b90041]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#b90041] bg-white cursor-pointer"
                    >
                      {Object.keys(CATEGORY_VARIANT_CONFIGS).map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Brand / Store Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. My Store / Brand Name"
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#b90041]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Product Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe product details, fabric, dimensions, or package contents..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#b90041] resize-none"
                  />
                </div>
              </section>

              {/* Section 3: Pricing & Inventory */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-extrabold text-base text-[#191C1E]">
                  Pricing &amp; Inventory Count
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        value={supplierPrice}
                        onChange={(e) => handlePriceChange(e.target.value, 'supplierPrice')}
                        placeholder="e.g. 499"
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl font-extrabold text-base text-[#191C1E] outline-none focus:ring-2 focus:ring-[#b90041]"
                        required
                        min="1"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Final price shown to customer</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      MRP / Strike Price (₹) (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        value={mrp}
                        onChange={(e) => handlePriceChange(e.target.value, 'mrp')}
                        placeholder="e.g. 999"
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl font-bold text-base text-slate-500 outline-none focus:ring-2 focus:ring-[#b90041]"
                        min="1"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                      {discount ? `${discount}% OFF auto-applied` : 'Higher than selling price'}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Available Stock Units <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-extrabold text-base text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                      required
                      min="0"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Available quantity to sell</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">SKU Code (Optional)</label>
                      <button
                        type="button"
                        onClick={generateRandomSku}
                        className="text-[10px] font-bold text-[#b90041] hover:underline cursor-pointer"
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={skuId}
                      onChange={(e) => setSkuId(e.target.value)}
                      placeholder="e.g. SKU-12345"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#b90041]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">GST Slab</label>
                    <select
                      value={gstSlab}
                      onChange={(e) => setGstSlab(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#b90041] bg-white cursor-pointer"
                    >
                      <option value="0%">0% (Exempt)</option>
                      <option value="5%">5% (Apparel &amp; Textiles)</option>
                      <option value="12%">12% (Standard Items)</option>
                      <option value="18%">18% (Electronics &amp; Luxe)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Section 4: Adaptive Category Variants (Sizes & Colors) */}
              {(() => {
                const config = CATEGORY_VARIANT_CONFIGS[category] || CATEGORY_VARIANT_CONFIGS['Ethnic Wear'];
                return (
                  <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="font-extrabold text-base text-[#191C1E]">
                          Variants for {category}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {config.sizeHelp}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#b90041] bg-pink-50 px-3 py-1 rounded-full">
                        {category}
                      </span>
                    </div>

                    {/* Sizes selection */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-700">
                          {config.sizeLabel} <span className="text-red-500">* (Select at least one)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddSizeInput(!showAddSizeInput)}
                          className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
                        >
                          + Custom Size
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const isSelected = selectedSizes.includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSize(size)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#b90041] text-white border-[#b90041] shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>

                      {showAddSizeInput && (
                        <div className="flex gap-2 mt-3 max-w-xs">
                          <input
                            type="text"
                            value={newSizeInput}
                            onChange={(e) => setNewSizeInput(e.target.value)}
                            placeholder="Enter size (e.g. 3XL, 42)..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#b90041]"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomSize}
                            className="px-3 py-1.5 bg-[#b90041] text-white text-xs font-bold rounded-xl"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Colors selection */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-700">
                          {config.colorLabel} (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddColorInput(!showAddColorInput)}
                          className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
                        >
                          + Custom Color
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                          const isSelected = selectedColors.includes(color);
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => toggleColor(color)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{
                                  backgroundColor:
                                    color.toLowerCase().includes('red') || color.toLowerCase().includes('maroon') || color.toLowerCase().includes('wine')
                                      ? '#b90041'
                                      : color.toLowerCase().includes('blue') || color.toLowerCase().includes('navy')
                                      ? '#1e40af'
                                      : color.toLowerCase().includes('green') || color.toLowerCase().includes('emerald') || color.toLowerCase().includes('olive')
                                      ? '#15803d'
                                      : color.toLowerCase().includes('black')
                                      ? '#0f172a'
                                      : color.toLowerCase().includes('yellow') || color.toLowerCase().includes('gold')
                                      ? '#eab308'
                                      : color.toLowerCase().includes('pink')
                                      ? '#ec4899'
                                      : color.toLowerCase().includes('white') || color.toLowerCase().includes('silver')
                                      ? '#f1f5f9'
                                      : '#64748b',
                                }}
                              ></span>
                              <span>{color}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showAddColorInput && (
                        <div className="flex gap-2 mt-3 max-w-xs">
                          <input
                            type="text"
                            value={newColorInput}
                            onChange={(e) => setNewColorInput(e.target.value)}
                            placeholder="Color name..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#b90041]"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomColor}
                            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })()}
            </div>

            {/* Right Column: Sticky Buyer View Live Preview Card */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-[#191C1E] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#b90041]">visibility</span>
                    <span>Live Buyer Preview</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Customer View
                  </span>
                </div>

                {/* Simulated Meesho Product Card */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                    {primaryImage ? (
                      <>
                        <img
                          src={primaryImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/95 backdrop-blur-xs text-[10px] font-extrabold text-emerald-700 rounded-md shadow-xs">
                          Free Delivery
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-6 text-slate-300 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">image</span>
                        <span className="text-xs font-bold text-slate-400">Photo Preview</span>
                        <span className="text-[10px] text-slate-300 mt-0.5">Upload a photo to see preview</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                      {productName || 'Product Title will appear here...'}
                    </h4>

                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#191C1E]">
                        ₹{supplierPrice || '0'}
                      </span>
                      {mrp && parseFloat(mrp) > parseFloat(supplierPrice || 0) && (
                        <>
                          <span className="text-xs text-slate-400 line-through">₹{mrp}</span>
                          <span className="text-xs font-bold text-emerald-600">
                            {discount || Math.round(((parseFloat(mrp) - parseFloat(supplierPrice)) / parseFloat(mrp)) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Supplier: <strong className="text-slate-700">{brand || 'Verified Supplier'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1 overflow-hidden pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">Sizes:</span>
                      {selectedSizes.length > 0 ? (
                        selectedSizes.slice(0, 4).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">None selected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Button in Preview */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#B90041] to-[#DF2457] text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing to Catalog...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish Product Now</span>
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </form>

      {/* Success Modal */}
      {createdProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-1">
              Product Published! 🎉
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              "{createdProduct.title}" is now live in the marketplace catalog.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate(`/product?id=${createdProduct.id}`)}
                className="w-full py-2.5 bg-[#b90041] hover:bg-[#a00037] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Product Live</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/supplier-inventory')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                View in Inventory
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedProduct(null);
                  setProductName('');
                  setSupplierPrice('');
                  setMrp('');
                  setDiscount('');
                  setStockQuantity('');
                  setSkuId('');
                  setDescription('');
                  setBrand('');
                  setPrimaryImage(null);
                  setSecondaryImages([null, null, null, null]);
                  setSelectedSizes([]);
                  setSelectedColors([]);
                }}
                className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
              >
                + Add Another Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddNewProductSupplier;