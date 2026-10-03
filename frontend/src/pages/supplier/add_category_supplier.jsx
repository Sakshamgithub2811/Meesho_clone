import React, { useState } from 'react';

export function AddCategorySupplier({ onBack, onSaveCategory }) {
  const [categoryName, setCategoryName] = useState('Festive Kurtis & Anarkalis');
  const [parentCategory, setParentCategory] = useState('Ethnic Wear');
  const [categorySlug, setCategorySlug] = useState('festive-kurtis-anarkalis');
  const [description, setDescription] = useState(
    'Traditional and contemporary ethnic kurtis, long anarkalis, festive kurta sets with dupatta and embroidery work for weddings and special occasions.'
  );
  const [iconImage, setIconImage] = useState(
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80'
  );
  const [isActive, setIsActive] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNameChange = (val) => {
    setCategoryName(val);
    setCategorySlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setIconImage(url);
      showToast('Category icon uploaded! 📸');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast('Please enter a Category Name.');
      return;
    }

    const categoryData = {
      name: categoryName,
      parent: parentCategory || 'None',
      slug: categorySlug,
      description,
      icon: iconImage,
      isActive,
    };

    if (onSaveCategory) {
      onSaveCategory(categoryData);
    } else {
      showToast(`Category "${categoryName}" created successfully! 🎉`);
    }
  };

  const existingCategories = [
    { name: 'Ethnic Wear', count: '14,280 products', icon: '🥻' },
    { name: 'Western Wear', count: '9,840 products', icon: '👗' },
    { name: 'Footwear', count: '5,120 products', icon: '👠' },
    { name: 'Jewellery & Watches', count: '7,340 products', icon: '💍' },
    { name: 'Bags & Luggage', count: '3,890 products', icon: '👜' },
    { name: 'Home & Kitchen', count: '6,450 products', icon: '🛋️' },
  ];

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-sans antialiased pb-36 selection:bg-pink-100 selection:text-pink-600">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006a34] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-xs">
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
                Create New Category
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Supplier Hub • Catalog Taxonomy
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-gradient-to-r from-[#b90041] to-[#df2457] text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/25 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Save Category</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Category Creation Form (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Icon & Banner Upload */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="font-extrabold text-base text-[#191C1E] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b90041]">image</span>
                    <span>Category Visuals</span>
                  </h2>
                  <span className="text-[11px] text-slate-400 font-bold">1:1 Aspect Ratio</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <label className="relative group cursor-pointer flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="w-32 h-32 rounded-3xl bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-pink-300 hover:border-[#b90041] transition-all overflow-hidden relative shadow-xs">
                      {iconImage ? (
                        <>
                          <img
                            src={iconImage}
                            alt="Category Preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <span className="material-symbols-outlined text-base">edit</span> Change
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[#b90041] text-3xl mb-1 group-hover:scale-110 transition-transform">
                            add_a_photo
                          </span>
                          <span className="text-xs font-bold text-[#b90041]">Upload Icon</span>
                        </>
                      )}
                    </div>
                  </label>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <h3 className="font-extrabold text-sm text-slate-800">
                      Category Display Icon &amp; Thumbnail
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      This icon will appear on the MShoppy Mobile App Categories Bar and the
                      Explorer navigation menu. Recommended size: 400x400 px PNG/JPG.
                    </p>
                  </div>
                </div>
              </section>

              {/* Main Category Form Details */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#191C1E]">
                  <span className="material-symbols-outlined text-[#b90041]">category</span>
                  <h2 className="font-extrabold text-base">Category Information</h2>
                </div>

                <div className="space-y-4">
                  {/* Category Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                      Category Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={categoryName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Festive Kurtis & Anarkalis"
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    />
                  </div>

                  {/* Slug and Parent Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                        Parent Category
                      </label>
                      <select
                        value={parentCategory}
                        onChange={(e) => setParentCategory(e.target.value)}
                        className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                      >
                        <option value="">None (Top-Level Category)</option>
                        <option value="Ethnic Wear">Ethnic Wear</option>
                        <option value="Western Wear">Western Wear</option>
                        <option value="Footwear">Footwear</option>
                        <option value="Jewellery & Watches">Jewellery &amp; Watches</option>
                        <option value="Bags & Luggage">Bags &amp; Luggage</option>
                        <option value="Home & Kitchen">Home &amp; Kitchen</option>
                        <option value="Beauty & Health">Beauty &amp; Health</option>
                        <option value="Electronics">Electronics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                        URL Slug (Auto-Generated)
                      </label>
                      <input
                        type="text"
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        placeholder="festive-kurtis"
                        className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                      Category Description
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what items belong to this category for SEO and catalog filters..."
                      className="w-full bg-[#f8f9fb] border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">
                        Publish to Live App Immediately
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Category will be visible to all customers and suppliers
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                        isActive ? 'bg-[#008644]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          isActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Live Tile Preview & Taxonomy Tree (5 cols, sticky) */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
              {/* Category Explorer Tile Preview */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Explorer Tile Preview
                  </h3>
                  <span className="text-[10px] font-black text-[#b90041] bg-pink-50 px-2 py-0.5 rounded">
                    App View
                  </span>
                </div>

                {/* Simulated Tile */}
                <div className="bg-[#f8f9fb] p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shadow-xs border border-slate-200 flex-shrink-0">
                    <img
                      src={
                        iconImage ||
                        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80'
                      }
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {parentCategory || 'Top Level Category'}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                      {categoryName || 'Category Name'}
                    </h4>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                      New Category • 0 Products
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Categories Directory */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Existing Top Categories
                </h3>
                <div className="space-y-2">
                  {existingCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-bold text-slate-800">{cat.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#b90041] to-[#df2457] hover:from-[#a00037] hover:to-[#c71e4d] text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Save &amp; Create Category</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddCategorySupplier;
