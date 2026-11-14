import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getCategories,
  getCategoryBySlug,
  toggleWishlist,
  getWishlist
} from '../../services/ecommerceService';
import { useCart } from '../../hooks/useCart';

// Dynamic category icon resolver based on semantic matching
function getCategoryIcon(slug = '', name = '') {
  const text = `${slug} ${name}`.toLowerCase();
  if (text.includes('ethnic') || text.includes('saree') || text.includes('kurti')) return 'styler';
  if (text.includes('western') || text.includes('dress') || text.includes('top') || text.includes('jeans')) return 'checkroom';
  if (text.includes('men')) return 'man';
  if (text.includes('kid') || text.includes('child') || text.includes('baby') || text.includes('toy')) return 'child_care';
  if (text.includes('kitchen') || text.includes('home') || text.includes('cookware') || text.includes('decor')) return 'flatware';
  if (text.includes('beauty') || text.includes('health') || text.includes('skin') || text.includes('makeup')) return 'face';
  if (text.includes('jewel') || text.includes('watch') || text.includes('necklace') || text.includes('ring')) return 'diamond';
  if (text.includes('footwear') || text.includes('shoe') || text.includes('sneaker') || text.includes('sandal')) return 'steps';
  if (text.includes('electronic') || text.includes('gadget') || text.includes('earbud') || text.includes('phone')) return 'earbuds';
  if (text.includes('accessori') || text.includes('bag') || text.includes('belt')) return 'shopping_bag';
  return 'grid_view';
}

const CATEGORY_GRADIENTS = {
  'women-ethnic': 'bg-gradient-to-r from-[#831843] via-[#9d174d] to-[#be185d]',
  'women-western': 'bg-gradient-to-r from-[#4c1d95] via-[#5b21b6] to-[#7c3aed]',
  'men': 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155]',
  'kids': 'bg-gradient-to-r from-[#9a3412] via-[#c2410c] to-[#ea580c]',
  'home-kitchen': 'bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669]',
  'beauty-health': 'bg-gradient-to-r from-[#881337] via-[#be123c] to-[#e11d48]',
  'jewellery': 'bg-gradient-to-r from-[#78350f] via-[#b45309] to-[#d97706]',
  'footwear': 'bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca]',
  'electronics': 'bg-gradient-to-r from-[#0f172a] via-[#0c4a6e] to-[#0284c7]',
  'default': 'bg-gradient-to-r from-[#831843] via-[#be185d] to-[#db2777]'
};

export default function SearchCategoriesExplorer({ onNavigate = () => {}, onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategoryParam = searchParams.get('category');

  // Dynamic States
  const [categories, setCategories] = useState([]);
  const [activeSlug, setActiveSlug] = useState(initialCategoryParam || 'women-ethnic');
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSubcat, setSelectedSubcat] = useState('All');
  const [wishlist, setWishlist] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { cartCount, addItem } = useCart();

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // 1. Initial Load: Fetch categories from Database
  useEffect(() => {
    let isMounted = true;
    async function initCategories() {
      setLoading(true);
      try {
        const [catsRes, wishRes] = await Promise.all([
          getCategories(),
          getWishlist()
        ]);

        if (isMounted) {
          if (catsRes && catsRes.length > 0) {
            setCategories(catsRes);
            // Default to param or first category slug
            if (!initialCategoryParam) {
              setActiveSlug(catsRes[0].slug);
            }
          }
          if (wishRes) {
            setWishlist(new Set(wishRes.map(w => w.productId)));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initCategories();
    return () => { isMounted = false; };
  }, [initialCategoryParam]);

  // 2. Load active category details & products from database
  useEffect(() => {
    if (!activeSlug) return;
    let isMounted = true;

    async function loadCategoryContent() {
      setLoadingProducts(true);
      setSelectedSubcat('All');
      try {
        const catDetail = await getCategoryBySlug(activeSlug);
        if (isMounted && catDetail) {
          setCategoryData(catDetail);
          setProducts(catDetail.products || []);
        }
      } catch (err) {
        console.error(`Error loading category ${activeSlug}:`, err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    loadCategoryContent();
    return () => { isMounted = false; };
  }, [activeSlug]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleSubcategoryClick = (subName) => {
    if (subName === 'All') {
      setSelectedSubcat('All');
      return;
    }
    setSelectedSubcat(subName);
  };

  const handleExploreAllSearch = () => {
    if (categoryData?.slug) {
      navigate(`/search?category=${categoryData.slug}`);
    } else {
      navigate('/search');
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      await toggleWishlist(productId);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
          triggerToast('Removed from favorites');
        } else {
          next.add(productId);
          triggerToast('Saved to Wishlist ❤️');
        }
        return next;
      });
    } catch (e) {
      triggerToast('Wishlist updated ❤️');
    }
  };

  const handleQuickAddToCart = async (e, prod) => {
    e.stopPropagation();
    try {
      const sizeToUse = (prod.sizes && prod.sizes[0]) || 'Free Size';
      await addItem(prod.id, 1, sizeToUse);
      triggerToast(`Added ${prod.title.slice(0, 20)}... to Cart! 🛍️`);
    } catch (err) {
      triggerToast('Added to Cart! 🛍️');
    }
  };

  // Filter products by selected subcategory chip
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedSubcat === 'All') return products;
    const term = selectedSubcat.toLowerCase().trim();
    return products.filter((p) => {
      const pSub = (p.subCategory || '').toLowerCase().trim();
      if (pSub === term) return true;
      if (pSub) return false;
      const fullText = `${p.title || ''} ${p.description || ''}`.toLowerCase();
      return fullText.includes(term);
    });
  }, [products, selectedSubcat]);

  const currentCategory = categories.find(c => c.slug === activeSlug) || categoryData || {
    name: 'Categories',
    slug: activeSlug
  };

  const bannerImage =
    currentCategory?.imageUrl ||
    (products[0]?.images && products[0].images[0]) ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';

  // 100% Dynamic Subcategories extracted directly from PostgreSQL Category & Products
  const dynamicSubcategories = useMemo(() => {
    const fromCategory = Array.isArray(currentCategory?.subcategories) ? currentCategory.subcategories : [];
    const fromCategoryData = Array.isArray(categoryData?.subcategories) ? categoryData.subcategories : [];
    const fromProducts = (products || []).map(p => p.subCategory?.trim()).filter(Boolean);

    const combinedSet = new Set([
      ...fromCategory,
      ...fromCategoryData,
      ...fromProducts
    ]);

    const cleanList = Array.from(combinedSet).filter(s => s && s.toLowerCase() !== 'all');
    cleanList.sort((a, b) => a.localeCompare(b));

    return ['All', ...cleanList];
  }, [currentCategory, categoryData, products]);

  // Dynamic Taglines and Metadata derived from category object (no product count numbers shown)
  const categoryTitle = currentCategory?.name ? `${currentCategory.name} Collection` : 'All Categories';
  const categorySubtitle = currentCategory?.description || 'Explore verified wholesale styles direct from manufacturers';
  const bannerTag = 'Factory Direct';

  return (
    <div className="bg-[#f8f9fb] font-sans text-[#191c1e] h-screen max-h-screen overflow-hidden flex flex-col antialiased selection:bg-pink-100 selection:text-pink-700">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Back button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => (onBack ? onBack() : navigate('/user-home'))}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div 
              onClick={() => navigate('/user-home')}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <img 
                src="/mshoppy-logo.png" 
                alt="MShoppy" 
                className="w-8 h-8 object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105" 
              />
              <span className="text-xl font-black text-[#FF3F6C] font-headline tracking-tight hidden sm:inline">
                MShoppy
              </span>
            </div>
          </div>

          {/* Search input */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="bg-[#f2f4f6] hover:bg-slate-200/60 focus-within:bg-white flex items-center px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full gap-2 border border-slate-200/60 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-[#FF3F6C]/20 transition-all shadow-inner h-9 sm:h-10">
                <button
                  type="submit"
                  className="text-slate-400 hover:text-[#FF3F6C] flex items-center shrink-0 cursor-pointer transition-colors"
                  title="Search"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">search</span>
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in all categories..."
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#191c1e] focus:outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/50 shrink-0 text-xs font-bold transition-all cursor-pointer"
                    title="Clear"
                  >
                    <span className="material-symbols-outlined text-sm sm:text-base">close</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Cart & Wishlist */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/wishlist')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-all cursor-pointer hidden sm:flex"
              title="Wishlist"
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="p-2 rounded-full hover:bg-pink-50 text-[#FF3F6C] active:scale-95 transition-all cursor-pointer relative"
              title="Shopping Bag"
            >
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF3F6C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="max-w-7xl w-full mx-auto flex-1 min-h-0 flex overflow-hidden px-0 sm:px-4 lg:px-8 py-1 sm:py-3">
        {/* Category Navigation Sidebar */}
        <aside className="h-full w-20 sm:w-52 md:w-60 lg:w-64 flex flex-col bg-[#F2F4F6] sm:rounded-2xl border-r sm:border border-slate-200/60 overflow-y-auto overscroll-contain shrink-0 select-none shadow-sm pb-20 md:pb-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="p-3 hidden sm:block border-b border-slate-200/50">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
              Categories
            </span>
          </div>

          <nav className="flex flex-col py-2 space-y-1 w-full">
            {loading ? (
              // Skeleton loading sidebar
              [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-12 bg-slate-200/60 rounded-xl mx-2 animate-pulse mb-1" />
              ))
            ) : (
              categories.map((cat) => {
                const isActive = activeSlug === cat.slug;
                const iconName = getCategoryIcon(cat.slug, cat.name);

                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => setActiveSlug(cat.slug)}
                    className={`py-2.5 px-1 sm:px-4 flex sm:flex-row flex-col items-center sm:gap-3 gap-1 transition-all cursor-pointer relative text-left rounded-xl mx-1 sm:mx-1.5 w-[calc(100%-8px)] sm:w-[calc(100%-12px)] ${
                      isActive
                        ? 'bg-white text-[#FF3F6C] font-extrabold shadow-sm'
                        : 'text-slate-600 opacity-80 hover:opacity-100 hover:bg-white/50'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#FF3F6C] rounded-r-full sm:hidden" />
                    )}
                    <span
                      className="material-symbols-outlined text-2xl sm:text-xl shrink-0 pointer-events-none"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {iconName}
                    </span>
                    <div className="w-full min-w-0 text-center sm:text-left px-0.5">
                      <span className="text-[10px] sm:text-xs leading-[13px] sm:leading-tight font-bold block break-words line-clamp-2">
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </nav>
        </aside>

        {/* Dynamic Category Content Canvas */}
        <section className="flex-1 min-h-0 h-full w-full bg-white sm:rounded-2xl sm:border border-slate-200/60 sm:ml-4 overflow-y-auto overscroll-contain p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 shadow-sm [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
          {/* Category Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 sm:pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-2xl md:text-3xl font-black text-[#191c1e] leading-snug">
                  {currentCategory.name}
                </h2>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                {categorySubtitle}
              </p>
            </div>
            <button
              onClick={handleExploreAllSearch}
              className="text-xs font-bold text-[#FF3F6C] bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full cursor-pointer transition-all self-start sm:self-auto shadow-xs shrink-0 whitespace-nowrap active:scale-95"
            >
              Explore All in Search ➔
            </button>
          </div>

          {/* Dynamic Hero Banner Card - Modern Split Layout */}
          <div
            onClick={handleExploreAllSearch}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl ${CATEGORY_GRADIENTS[activeSlug] || CATEGORY_GRADIENTS['default']} w-full min-h-[165px] sm:h-52 md:h-60 mb-5 sm:mb-6 shadow-md border border-white/10 active:scale-[0.99] transition-all flex items-center justify-between text-white isolate`}
          >
            {/* Ambient background glows */}
            <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/15 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            {/* Left Column: Rich Typography and Taglines */}
            <div className="relative z-10 p-4 sm:p-7 md:p-8 flex-1 max-w-[58%] sm:max-w-[62%] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[9px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/25 shadow-xs">
                  {bannerTag}
                </span>
                <span className="text-[10px] sm:text-xs text-white/80 font-bold hidden md:inline">
                  • Verified Direct
                </span>
              </div>
              <h3 className="text-white font-black text-base sm:text-2xl md:text-3xl leading-tight drop-shadow-sm line-clamp-2">
                {categoryTitle}
              </h3>
              <p className="text-white/85 text-[11px] sm:text-xs md:text-sm mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
                {categorySubtitle}
              </p>
              <div className="mt-3 sm:mt-4 flex items-center gap-2">
                <span className="bg-white text-slate-900 font-extrabold text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full shadow-md group-hover:bg-pink-50 transition-colors flex items-center gap-1.5">
                  Shop {currentCategory.name} <span className="text-xs">➔</span>
                </span>
              </div>
            </div>

            {/* Right Column: Premium Showcase Card with EXACT 2:3 Portrait Aspect (Zero Cropping, Full Head & Body Visible) */}
            <div className="relative shrink-0 flex items-center justify-center p-3 sm:p-5 md:p-6 z-10 self-center">
              <div 
                key={`banner-card-${activeSlug}`}
                className="relative h-32 sm:h-44 md:h-50 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40 ring-4 ring-black/10 bg-black/20 group-hover:scale-[1.02] transition-transform duration-300"
              >
                <img
                  key={`hero-img-${activeSlug}`}
                  src={bannerImage}
                  alt={currentCategory.name}
                  className="w-full h-full object-cover object-top transition-all duration-300"
                  onError={(e) => {
                    const fallback = (products[0]?.images && products[0].images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Subcategory Chips Filter */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dynamicSubcategories.map((sub, idx) => {
              const isSelected = selectedSubcat === sub;
              return (
                <button
                  key={idx}
                  onClick={() => handleSubcategoryClick(sub)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-[#FF3F6C] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Live Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {selectedSubcat === 'All' ? 'Available Products' : `${selectedSubcat} Styles`}
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                Verified Direct
              </span>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center my-4">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
                <p className="text-sm font-bold text-slate-700">No products found matching "{selectedSubcat}"</p>
                <p className="text-xs text-slate-400 mt-1">Showing all products in this category instead:</p>
                <button
                  onClick={() => setSelectedSubcat('All')}
                  className="mt-3 px-4 py-1.5 bg-[#FF3F6C] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer active:scale-95"
                >
                  View All {currentCategory.name}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((prod) => {
                  const isFav = wishlist.has(prod.id);
                  const image = (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600';
                  const discount = prod.discountPercentage || Math.round(((prod.originalPrice - prod.price) / (prod.originalPrice || prod.price)) * 100) || 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => navigate(`/product?id=${prod.id}`)}
                      className="group bg-white rounded-2xl border border-slate-100 hover:border-pink-200 hover:shadow-lg transition-[border-color,box-shadow,transform] duration-200 overflow-hidden flex flex-col cursor-pointer relative hover:-translate-y-0.5"
                    >
                      {/* Thumbnail & Wishlist Button */}
                      <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                        <img
                          src={image}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-[#008644] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            {discount}% OFF
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleToggleWishlist(e, prod.id)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-[#FF3F6C] active:scale-90 transition-all shadow-xs cursor-pointer"
                          title="Save to Wishlist"
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={isFav ? { color: '#FF3F6C', fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#FF3F6C] transition-colors line-clamp-2 mt-0.5 leading-snug">
                            {prod.title}
                          </h4>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm sm:text-base font-black text-slate-900">
                                ₹{prod.price}
                              </span>
                              {prod.originalPrice && prod.originalPrice > prod.price && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹{prod.originalPrice}
                                </span>
                              )}
                            </div>
                            {prod.rating > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="bg-[#008644] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  {prod.rating} ★
                                </span>
                                {prod.reviewsCount > 0 && (
                                  <span className="text-[9px] text-slate-400">
                                    ({prod.reviewsCount})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleQuickAddToCart(e, prod)}
                            className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-[#FF3F6C] text-[#FF3F6C] hover:text-white transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
                            title="Add to Cart"
                          >
                            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Universal Bottom Navigation Bar */}
      <AppBottomNav activeNav="categories" onNavigate={onNavigate} role="customer" homePath="/user-home" />
    </div>
  );
}