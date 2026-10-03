import React, { useState } from 'react';

const INITIAL_COLORS = ['Red', 'Navy Blue', 'Emerald Green', 'Black', 'Wine', 'Mustard Yellow'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export function AddNewProductSupplier({ onBack, onSaveDraft, onPublish }) {
  // Form State
  const [productName, setProductName] = useState('Royal Embroidered Banarasi Silk Saree');
  const [category, setCategory] = useState('Ethnic Wear');
  const [brand, setBrand] = useState('Aurelia Luxe');
  const [description, setDescription] = useState(
    'Premium quality woven zari work with rich pallu and matching unstitched blouse piece. Soft, breathable silk blend ideal for festive occasions and weddings.'
  );
  const [mrp, setMrp] = useState('1999');
  const [supplierPrice, setSupplierPrice] = useState('499');
  const [discount, setDiscount] = useState('75');
  const [stockQuantity, setStockQuantity] = useState('120');
  const [skuId, setSkuId] = useState('AUR-SILK-2024-01');
  const [gstSlab, setGstSlab] = useState('5%');

  // Variants State
  const [selectedColors, setSelectedColors] = useState(['Wine', 'Emerald Green']);
  const [availableColors, setAvailableColors] = useState(INITIAL_COLORS);
  const [newColorInput, setNewColorInput] = useState('');
  const [showAddColorInput, setShowAddColorInput] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState(['Free Size']);

  // Media state
  const [primaryImage, setPrimaryImage] = useState(
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
  );
  const [secondaryImages, setSecondaryImages] = useState([
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
    null,
    null,
  ]);

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculate discount automatically if MRP and Supplier Price are provided
  const handlePriceChange = (val, type) => {
    if (type === 'mrp') {
      setMrp(val);
      if (val && supplierPrice) {
        const m = parseFloat(val);
        const s = parseFloat(supplierPrice);
        if (m > 0 && s >= 0 && m >= s) {
          setDiscount(Math.round(((m - s) / m) * 100).toString());
        }
      }
    } else if (type === 'supplierPrice') {
      setSupplierPrice(val);
      if (mrp && val) {
        const m = parseFloat(mrp);
        const s = parseFloat(val);
        if (m > 0 && s >= 0 && m >= s) {
          setDiscount(Math.round(((m - s) / m) * 100).toString());
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

  // Image Upload handler
  const handleImageUpload = (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (index === 'primary') {
        setPrimaryImage(url);
        showToast('Primary photo updated! 📸');
      } else {
        const updated = [...secondaryImages];
        updated[index] = url;
        setSecondaryImages(updated);
        showToast(`Secondary photo ${index + 1} uploaded!`);
      }
    }
  };

  // Listing Quality Score Calculation
  const calculateQualityScore = () => {
    let score = 0;
    if (productName.length > 5) score += 20;
    if (primaryImage) score += 20;
    if (secondaryImages.filter(Boolean).length >= 2) score += 15;
    if (description.length > 20) score += 15;
    if (supplierPrice && mrp) score += 15;
    if (selectedColors.length > 0 && selectedSizes.length > 0) score += 15;
    return score;
  };

  const qualityScore = calculateQualityScore();

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      showToast('Please enter a Product Name.');
      return;
    }

    const newProduct = {
      name: productName,
      category,
      brand,
      description,
      mrp,
      price: `₹${supplierPrice || '0'}`,
      stock: parseInt(stockQuantity, 10) || 0,
      sku: skuId || `SKU-${Date.now().toString().slice(-6)}`,
      colors: selectedColors,
      sizes: selectedSizes,
      image: primaryImage,
    };

    if (onPublish) {
      onPublish(newProduct);
    } else {
      showToast('🚀 Product successfully published to your MShoppy catalog!');
    }
  };

  const handleDraft = () => {
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
                Supplier Hub • Inventory Manager
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
              className="px-5 py-2 bg-gradient-to-r from-[#B90041] to-[#DF2457] text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/25 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
            >
              <span>Publish Product</span>
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
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
                      Product Photos &amp; Media
                    </h2>
                    <p className="text-xs text-slate-400">
                      Add up to 5 high-resolution photos for maximum buyer appeal
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    HD Recommended
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Primary Large Photo */}
                  <label className="col-span-2 aspect-[4/5] bg-slate-50 rounded-3xl border-2 border-dashed border-pink-300 hover:border-[#b90041] flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative shadow-xs">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'primary')}
                    />
                    {primaryImage ? (
                      <>
                        <img
                          src={primaryImage}
                          alt="Primary Product"
                          className="w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                          <span className="material-symbols-outlined text-lg">edit</span> Change
                          Primary Photo
                        </div>
                        <div className="absolute top-3 left-3 bg-[#b90041] text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg">
                          Cover Photo
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-[#b90041]/10 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[#b90041] text-3xl">
                            add_a_photo
                          </span>
                        </div>
                        <span className="font-extrabold text-sm text-[#b90041]">
                          Add Primary Cover Photo
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Recommended: 1080 x 1350 px
                        </p>
                      </>
                    )}
                  </label>

                  {/* Secondary Placeholders */}
                  {[0, 1, 2, 3].map((idx) => (
                    <label
                      key={idx}
                      className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#b90041] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, idx)}
                      />
                      {secondaryImages[idx] ? (
                        <>
                          <img
                            src={secondaryImages[idx]}
                            alt={`Photo ${idx + 2}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-[#b90041] transition-colors text-2xl">
                            add_photo_alternate
                          </span>
                          <span className="text-[10px] text-slate-400 block font-bold mt-1">
                            Angle {idx + 2}
                          </span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </section>

              {/* Section 2: Basic Info */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#191C1E] border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-[#b90041]">info</span>
                  <h2 className="font-extrabold text-base">Basic Product Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                      Product Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Royal Embroidered Banarasi Silk Saree"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                      Primary Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                    >
                      <option value="Ethnic Wear">Ethnic Wear (Sarees, Kurtis)</option>
                      <option value="Western Wear">Western Wear (Dresses, Tops)</option>
                      <option value="Footwear">Footwear (Sneakers, Heels)</option>
                      <option value="Jewellery">Jewellery &amp; Accessories</option>
                      <option value="Bags & Wallets">Bags &amp; Wallets</option>
                      <option value="Home Decor">Home &amp; Kitchen</option>
                      <option value="Beauty">Beauty &amp; Cosmetics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                      Brand Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Aurelia Luxe"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Description & Material */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#191C1E] border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-[#b90041]">description</span>
                  <h2 className="font-extrabold text-base">Product Description &amp; Fabric</h2>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail fabric composition, care instructions, stitching quality, sleeve style, and occasion..."
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none leading-relaxed"
                />
              </section>

              {/* Section 4: Pricing & Inventory */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#191C1E] border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-[#b90041]">payments</span>
                  <h2 className="font-extrabold text-base">Pricing, Inventory &amp; Taxes</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">
                      MRP (₹) *
                    </label>
                    <input
                      type="number"
                      value={mrp}
                      onChange={(e) => handlePriceChange(e.target.value, 'mrp')}
                      placeholder="1999"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">
                      Supplier Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={supplierPrice}
                      onChange={(e) => handlePriceChange(e.target.value, 'supplierPrice')}
                      placeholder="499"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-black text-[#b90041] focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">
                      Auto Discount (%)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="75"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">
                      Stock Units *
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="120"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">
                      GST Slab
                    </label>
                    <select
                      value={gstSlab}
                      onChange={(e) => setGstSlab(e.target.value)}
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="5%">5% (Apparel &lt; ₹1,000)</option>
                      <option value="12%">12% (Apparel &gt; ₹1,000)</option>
                      <option value="18%">18% (Accessories &amp; Electronics)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-600 ml-1">SKU ID</label>
                      <button
                        type="button"
                        onClick={generateRandomSku}
                        className="text-[10px] text-[#b90041] font-bold hover:underline cursor-pointer"
                      >
                        Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={skuId}
                      onChange={(e) => setSkuId(e.target.value)}
                      placeholder="AUR-SILK-2024"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>
              </section>

              {/* Section 5: Variants */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#191C1E] border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-[#b90041]">palette</span>
                  <h2 className="font-extrabold text-base">Product Color &amp; Size Variants</h2>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 ml-1">
                    Available Colors ({selectedColors.length} Selected)
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {availableColors.map((color) => {
                      const isSelected = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#b90041] text-white shadow-md shadow-pink-500/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{color}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })}

                    {showAddColorInput ? (
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                        <input
                          type="text"
                          value={newColorInput}
                          onChange={(e) => setNewColorInput(e.target.value)}
                          placeholder="Color name..."
                          className="text-xs bg-transparent outline-none w-24"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomColor}
                          className="text-xs font-bold text-[#b90041] cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddColorInput(true)}
                        className="px-3 py-2 rounded-xl border-2 border-dashed border-slate-300 text-[#b90041] font-bold text-xs hover:bg-pink-50 transition-colors cursor-pointer"
                      >
                        + Add Color
                      </button>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-600 ml-1">
                    Available Sizes ({selectedSizes.length} Selected)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`min-w-[48px] h-10 px-3 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#4d41df] text-white shadow-md shadow-indigo-500/25'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Live Buyer & Reseller Preview + Quality Score (4 cols, sticky) */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
              {/* Quality Score Meter */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Listing Quality Score
                  </h3>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      qualityScore >= 80
                        ? 'bg-emerald-50 text-[#008644]'
                        : qualityScore >= 50
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {qualityScore}% Complete
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      qualityScore >= 80
                        ? 'bg-emerald-500'
                        : qualityScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${qualityScore}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  High quality listings with multiple photos and exact dimensions receive{' '}
                  <strong className="text-slate-800">3x more reseller shares</strong> on WhatsApp.
                </p>
              </div>

              {/* Live MShoppy Product Card Preview */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Feed Preview
                  </span>
                  <span className="text-[10px] font-black text-[#b90041] bg-pink-50 px-2 py-0.5 rounded">
                    Buyer View
                  </span>
                </div>

                {/* Preview Card */}
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-xs bg-[#fafbfc]">
                  <div className="aspect-[3/4] relative bg-slate-200">
                    <img
                      src={
                        primaryImage ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#b90041] text-white text-[9px] font-black px-2 py-0.5 rounded">
                      {discount}% OFF
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {productName || 'Product Title'}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-slate-900">
                        ₹{supplierPrice || '0'}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{mrp || '0'}
                      </span>
                    </div>
                    <div className="bg-[#4d41df]/10 p-1.5 rounded-lg flex items-center justify-between mt-1">
                      <span className="text-[9px] font-bold text-[#4d41df] uppercase">
                        Resell &amp; Earn
                      </span>
                      <span className="text-[10px] font-black text-[#4d41df]">
                        +₹{Math.round(Number(supplierPrice || 0) * 0.3) || 120}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#B90041] to-[#DF2457] hover:from-[#a00037] hover:to-[#c71e4d] text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <span>Publish to MShoppy Catalog</span>
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                </button>
                <button
                  type="button"
                  onClick={handleDraft}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}

export default AddNewProductSupplier;
