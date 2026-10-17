import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../auth/logout';
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";
import {
  getProducts,
  getCategories,
  getWishlist,
  toggleWishlist,
  getCart
} from "../../services/ecommerceService";

export default function HomeUserCustomer() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load Categories & Initial Products from Database
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [catsData, prodsData, wishData, cartData] = await Promise.all([
          getCategories(),
          getProducts(),
          getWishlist(),
          getCart()
        ]);

        if (isMounted) {
          if (catsData && catsData.length > 0) {
            setDbCategories(catsData);
          }
          if (prodsData) {
            setProducts(prodsData);
          }
          if (wishData) {
            setFavorites(wishData.map(w => w.productId));
          }
          if (cartData?.totalItems !== undefined) {
            setCartCount(cartData.totalItems);
          }
        }
      } catch (err) {
        console.error("Error loading initial ecommerce data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Fetch when category changes
  useEffect(() => {
    let isMounted = true;
    async function filterByCategory() {
      setLoading(true);
      try {
        const prods = await getProducts({
          category: selectedCategory === "All" ? "" : selectedCategory,
          search: searchQuery
        });
        if (isMounted) {
          setProducts(prods);
        }
      } catch (err) {
        console.error("Error filtering products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    filterByCategory();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBannerScroll = () => {
    if (bannerRef.current) {
      const { scrollLeft, clientWidth } = bannerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSlide(index);
    }
  };

  const scrollToSlide = (index) => {
    if (bannerRef.current) {
      bannerRef.current.scrollTo({
        left: index * bannerRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      setFavorites(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
      await toggleWishlist(id);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleSearchSubmit = (overrideQuery) => {
    const term = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    setShowSuggestions(false);
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate('/search');
    }
  };

  const defaultCategoryIcons = {
    'All': 'dashboard',
    'Women Ethnic': 'checkroom',
    'Women Western': 'styler',
    'Men': 'man',
    'Kids': 'child_care',
    'Home & Kitchen': 'flatware',
    'Beauty & Health': 'face',
    'Jewellery & Accessories': 'diamond',
    'Footwear': 'steps',
    'Electronics & Gadgets': 'earbuds'
  };

  // Map category list with "All" option
  const categoryChips = [
    { name: "All", slug: "All", icon: "dashboard" },
    ...dbCategories.map(c => ({
      name: c.name,
      slug: c.slug,
      icon: defaultCategoryIcons[c.name] || 'sell'
    }))
  ];

  return (
    <div className="bg-[#f8f9fb] font-sans text-[#191c1e] min-h-screen">
      {/* Drawer */}
      <NavDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        role="customer"
        isCustomer={true}
      />

      {/* TopAppBar Header */}
      <header className="sticky top-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-40 shadow-xs">
        <div className="w-full px-3.5 sm:px-6 md:px-10 lg:px-16 py-3 sm:py-4 flex items-center justify-between gap-2">
          {/* Logo & Drawer trigger */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer shrink-0 transition-transform"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div 
              onClick={() => navigate('/user-home')}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <img 
                src="/mshoppy-logo.png" 
                alt="MShoppy" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105" 
              />
              <span className="text-lg sm:text-2xl font-black text-[#FF3F6C] font-headline tracking-tight whitespace-nowrap">
                MShoppy
              </span>
            </div>
          </div>

          {/* Desktop Search Bar with Auto-Suggest */}
          <div ref={searchContainerRef} className="flex-1 max-w-lg mx-4 lg:mx-6 hidden md:block relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="relative flex items-center"
            >
              <button 
                type="submit"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF3F6C] transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full"
                title="Search"
                aria-label="Submit search"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>

              <input 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="w-full bg-[#f2f4f6] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full py-2.5 pl-11 pr-10 focus:ring-2 focus:ring-[#FF3F6C] focus:bg-white dark:focus:bg-slate-900 transition-all text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium shadow-inner" 
                placeholder="Search for Sarees, Kurtis, Electronics & more..." 
                type="text" 
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all text-xs cursor-pointer"
                  title="Clear"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </form>

            {/* Smart Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Saree", "Kurti", "Denim Jacket", "Sneakers", "Headphones", "Bedsheet"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          handleSearchSubmit(tag);
                        }}
                        className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-[#FF3F6C]/10 hover:text-[#FF3F6C] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px] text-slate-400">trending_up</span>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {searchQuery.trim() && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                      Matching Real Products
                    </span>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {products.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate(`/product?id=${item.id}`);
                          }}
                          className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                        >
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200'}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#FF3F6C]">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">₹{item.price}</span>
                              {item.discountPercentage > 0 && (
                                <span className="text-[#FF3F6C] font-semibold">{item.discountPercentage}% OFF</span>
                              )}
                              <span className="text-emerald-600 font-medium">Free Delivery 🚚</span>
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-[#FF3F6C] text-sm">
                            chevron_right
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => navigate('/wishlist')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="My Wishlist"
            >

              <span className="material-symbols-outlined text-2xl">favorite</span>
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF3F6C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/cart')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#b90041] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Logout />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32">
        {/* Mobile Search */}
        <div className="md:hidden pt-2 pb-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="relative flex items-center"
          >
            <button 
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF3F6C] transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full"
              title="Search"
              aria-label="Submit search"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f2f4f6] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-[#FF3F6C] outline-none text-slate-900 dark:text-white"
              placeholder="Search sarees, kurtas, jackets..." 
              type="text" 
            />
          </form>
        </div>

        {/* Hero Carousel */}
        <div className="relative mt-2">
          <div 
            ref={bannerRef}
            onScroll={handleBannerScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl sm:rounded-3xl shadow-sm"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Slide 1 */}
            <div className="min-w-full snap-start relative h-48 sm:h-64 md:h-80 overflow-hidden bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 flex items-center px-6 sm:px-12 md:px-16 text-white">
              <div className="max-w-md z-10">
                <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 inline-block">
                  Special Festive Deals 🛍️
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight mb-2">
                  Grand Festive Sale! Up to 70% Off
                </h2>
                <p className="text-xs sm:text-sm text-pink-100 mb-4 line-clamp-2">
                  100% verified factory direct prices with Free Delivery & Easy 7-day returns.
                </p>
                <button 
                  onClick={() => navigate('/explorer')}
                  className="bg-white text-pink-600 font-bold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-pink-50 transition-colors shadow-md cursor-pointer active:scale-95"
                >
                  Explore Catalog
                </button>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800" 
                alt="Festive Fashion" 
                className="absolute right-0 top-0 h-full w-1/2 object-cover mask-gradient-left opacity-90 hidden sm:block"
              />
            </div>

            {/* Slide 2 */}
            <div className="min-w-full snap-start relative h-48 sm:h-64 md:h-80 overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 flex items-center px-6 sm:px-12 md:px-16 text-white">
              <div className="max-w-md z-10">
                <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 inline-block">
                  Lowest Price Guarantee
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight mb-2">
                  Trending Menswear & Gadgets
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 mb-4 line-clamp-2">
                  Casual shirts, sneakers, audio gear & everyday essentials directly at wholesale rates.
                </p>
                <button 
                  onClick={() => setSelectedCategory("Men")}
                  className="bg-white text-indigo-700 font-bold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-indigo-50 transition-colors shadow-md cursor-pointer active:scale-95"
                >
                  Shop Men
                </button>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800" 
                alt="Men Collection" 
                className="absolute right-0 top-0 h-full w-1/2 object-cover mask-gradient-left opacity-90 hidden sm:block"
              />
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-6 bg-[#FF3F6C]' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Feature Badges */}
        <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-[#FF3F6C] shrink-0">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Free Delivery</h4>
              <p className="text-[10px] text-slate-400">On all orders</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Cash on Delivery</h4>
              <p className="text-[10px] text-slate-400">Pay when delivered</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 shrink-0">
              <span className="material-symbols-outlined text-xl">autorenew</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">7 Days Return</h4>
              <p className="text-[10px] text-slate-400">Hassle free policy</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lowest Prices</h4>
              <p className="text-[10px] text-slate-400">Direct factory rates</p>
            </div>
          </div>
        </section>

        {/* Database Categories Bar */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg text-[#191c1e] dark:text-slate-100">
              Categories
            </h3>
            <button 
              onClick={() => navigate('/explorer')} 
              className="text-[#b90041] text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline"
            >
              See All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categoryChips.map((cat, idx) => (
              <div
                key={idx} 
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  selectedCategory === cat.name 
                    ? 'bg-[#FF3F6C] text-white shadow-lg shadow-[#FF3F6C]/25 scale-105' 
                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-[#FF3F6C]/40 text-slate-700 dark:text-slate-300'
                }`}>
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <span className={`text-xs font-medium max-w-[76px] truncate text-center ${selectedCategory === cat.name ? 'font-bold text-[#FF3F6C]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Real Products Grid from PostgreSQL Database */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-extrabold text-2xl text-[#191c1e] dark:text-slate-100">
                Products For You
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lowest prices, verified suppliers & top quality products
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {products.length} products
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 animate-pulse">
                  <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-xl mb-3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">inventory_2</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No products found in "{selectedCategory}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Explore other categories or check all available items.
              </p>
              <button 
                onClick={() => setSelectedCategory("All")} 
                className="mt-4 px-4 py-2 text-xs font-bold text-[#b90041] bg-[#b90041]/10 rounded-xl hover:bg-[#b90041]/20 transition-colors cursor-pointer"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => {
                const isFav = favorites.includes(p.id);
                const mainImg = p.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600';

                return (
                  <div 
                    key={p.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div 
                      onClick={() => navigate(`/product?id=${p.id}`)} 
                      className="cursor-pointer" 
                      title={`View ${p.title}`}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={mainImg} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';
                          }}
                        />
                        {p.rating > 0 && (
                          <span className="absolute bottom-2 left-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-0.5 shadow-sm">
                            <span className="text-amber-500 font-bold text-xs">★</span> {p.rating}
                            {p.reviewsCount > 0 && <span className="text-slate-400 text-[9px]">({p.reviewsCount})</span>}
                          </span>
                        )}
                        <button 
                          onClick={(e) => handleToggleFavorite(p.id, e)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer hover:bg-white"
                          title="Wishlist"
                        >
                          <span 
                            className={`material-symbols-outlined text-sm ${isFav ? 'text-[#FF3F6C]' : 'text-slate-400'}`}
                            style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      <div className="px-1 min-w-0">
                        {p.supplierName && (
                          <span className="text-[10px] font-bold text-[#b90041] uppercase tracking-wider block mb-0.5 truncate">
                            {p.supplierName}
                          </span>
                        )}
                        <h4 
                          className="text-[11.5px] sm:text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1 leading-snug min-h-[2.25rem] break-words"
                          title={p.title}
                        >
                          {p.title}
                        </h4>
                        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mb-2">
                          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            ₹{p.price}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                              ₹{p.originalPrice}
                            </span>
                          )}
                          {p.discountPercentage > 0 && (
                            <span className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] whitespace-nowrap">
                              {p.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer Bottom Action: Free Delivery & View Details */}
                    <div 
                      onClick={() => navigate(`/product?id=${p.id}`)}
                      className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-colors group/btn mt-1"
                    >
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                        Free Delivery
                      </span>
                      <span className="text-[10px] font-bold text-[#b90041] flex items-center gap-0.5 group-hover/btn:translate-x-0.5 transition-transform">
                        Shop <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Customer Bottom Navigation */}
      <AppBottomNav activeNav="home" role="customer" homePath="/user-home" />
    </div>
  );
}
