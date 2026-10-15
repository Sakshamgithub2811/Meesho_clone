import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../auth/logout';
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";

const initialProducts = [
  {
    id: 1,
    title: "Premium Floral Embroidered Kurti",
    category: "Women",
    brand: "Libas",
    price: 459,
    originalPrice: 1299,
    discount: "64% OFF",
    rating: 4.4,
    reviewsCount: 1284,
    tag: "NEW",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0zqmw7ba_XFDIMO6oyX-ILUKOJgIMuPHjQHmER1KSXi4yclRGSPaFRWJJc7uqCXrLyuOZB5pF6W9WnzFkT4T60VwY7uLrFzTvD9dwE04M23l7pGMu2N9_mNh3dIciAjlMaq4CCNHCtjsjPsAXVnUWIzuy88jS-AXIyF662WcDdlDcTQBqikiQkpbng2C7siDr0Cfpn4tI2OPGK5ut0GiQ2urqGnEEsMeCKdoSG60Mzopnd90gu9Axj_jDhaDAqbSN79R6G9BIo88"
  },
  {
    id: 2,
    title: "Men's Vintage Denim Jacket",
    category: "Men",
    brand: "Roadster",
    price: 899,
    originalPrice: 2499,
    discount: "64% OFF",
    rating: 4.6,
    reviewsCount: 940,
    tag: "HOT",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDPmD9-ovlIa-MD4BO39HPO96wxIRmWrYe8qYWvqkgptxYMCtQfivT9lWRbcMeXNi-Be7aT1fSOpzmtPE6QJMQbmsK-caGrrcQyM1aGztg5q70fVH5vVSd-huuv4T10VbeNArAzmgX_bWCzTnnnzDjfxd0bhLnV1OjRGwViGcBWLwJ0r76tf9TqTUqy3kSdVBeusII5UfWmQaFa2mxVvqsetPyMOBZibBWGA9Jw1D2ZeqkjFgFCzihuFUgTfa_BFgo9W_AOQ8dQP8"
  },
  {
    id: 3,
    title: "Retro Square Sunglasses",
    category: "Gadgets",
    brand: "Vincent Chase",
    price: 249,
    originalPrice: 999,
    discount: "75% OFF",
    rating: 4.3,
    reviewsCount: 520,
    tag: "BESTSELLER",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1RPNZ5nwbtLEh9sRMXLEaAEIdTk4Rz87Q3LYHQACDChwDYaR8qhBMhkVXuJkluTpsA_aaidWyOn_Upemc_IEw654SWRijV6kdGXhbsCPZ3UhkejAz4FIrdnhjgG1ifYPo0YdbnGt5COpD-LQQyqfDwSnkJ0dkPcTaNVzH115l9iYi5Pc9TiAWEMNhbEpfNrAygCBaT0wKcRpJ2lTs8T3YWfNEVx_G2PSS9BSwywJKSOx1KzmuJzD-O2_IlBG3VUOyDDgmMHnV9lg"
  },
  {
    id: 4,
    title: "Air Cushion Sneakers",
    category: "Men",
    brand: "Puma",
    price: 1249,
    originalPrice: 3499,
    discount: "64% OFF",
    rating: 4.7,
    reviewsCount: 2310,
    tag: "TRENDING",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnLVYeQpmW-W1dgZwHUgCQvF69izifWPEnVWhThVqzW-CIir5KRuUKR24bNfPIWDaQDUHLUUES63-xwoI5c5J6s9tRYCALvPPQFLXnY4vrcRNjR_rmp-ahMXmBFoMRAAHYmDnK_G91roDCgOjgFgmQuoYXoEbt-P6qlh70aroZJkRr6MSNVJgIcN5lweJDacGDeM9VzRY7bb6c6lFGvb2j12eevSjL676RRot4COi_sM79j9zSxTuFr0F6aZx2vsyTnOPggmoL9m4"
  },
  {
    id: 5,
    title: "boAt Rockerz 450 Headphones",
    category: "Brands",
    brand: "boAt",
    price: 1499,
    originalPrice: 3990,
    discount: "62% OFF",
    rating: 4.5,
    reviewsCount: 4210,
    tag: "VERIFIED BRAND",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    title: "Puma Leather Sneakers",
    category: "Brands",
    brand: "Puma",
    price: 1899,
    originalPrice: 4499,
    discount: "58% OFF",
    rating: 4.8,
    reviewsCount: 1890,
    tag: "TOP BRAND",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    title: "Embroidered Silk Anarkali Kurta Set",
    category: "Women",
    brand: "Libas",
    price: 1249,
    originalPrice: 2499,
    discount: "50% OFF",
    rating: 4.6,
    reviewsCount: 864,
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    title: "Vintage Rose Floral Cotton Kurta",
    category: "Women",
    brand: "Anouk",
    price: 899,
    originalPrice: 1799,
    discount: "50% OFF",
    rating: 4.3,
    reviewsCount: 650,
    tag: "TRENDING",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 9,
    title: "Men's Classic Khadi Festive Kurta",
    category: "Men",
    brand: "FabIndia",
    price: 999,
    originalPrice: 1999,
    discount: "50% OFF",
    rating: 4.4,
    reviewsCount: 310,
    tag: "HOT",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 10,
    title: "Handblock Pure Cotton Kurti & Pant Set",
    category: "Women",
    brand: "Sangria",
    price: 699,
    originalPrice: 1599,
    discount: "56% OFF",
    rating: 4.5,
    reviewsCount: 1120,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 11,
    title: "Kanjeevaram Banarasi Silk Saree",
    category: "Women",
    brand: "SareeMall",
    price: 1899,
    originalPrice: 4299,
    discount: "56% OFF",
    rating: 4.7,
    reviewsCount: 2450,
    tag: "TOP RATED",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
  }
];

const categories = [
  { name: "All", icon: "dashboard" },
  { name: "Women", icon: "checkroom" },
  { name: "Men", icon: "styler" },
  { name: "Kids", icon: "child_care" },
  { name: "Home", icon: "home_iot_device" },
  { name: "Gadgets", icon: "earbuds" },
  { name: "Beauty", icon: "shopping_basket" },
  { name: "Jewelry", icon: "diamond" },
  { name: "Brands", icon: "verified" }
];

export default function HomeUserCustomer() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([1]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
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

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

  const normalize = (text) => (text || '').toLowerCase().replace(/kurtas?|kurti/g, 'kurt').replace(/sarees?/g, 'saree').trim();

  const filteredProducts = initialProducts.filter(p => {
    const q = normalize(searchQuery);
    const titleNorm = normalize(p.title);
    const brandNorm = normalize(p.brand);
    const catNorm = normalize(p.category);

    const matchesSearch = !q || titleNorm.includes(q) || brandNorm.includes(q) || catNorm.includes(q);
    const matchesCat = selectedCategory === "All" || 
      (selectedCategory.toLowerCase() === "brands" || selectedCategory.toLowerCase() === "brand"
        ? (p.category.toLowerCase() === "brands" || p.category.toLowerCase() === "brand" || !!p.brand)
        : p.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

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

          {/* Desktop Search Bar with Working Search Button & Auto-Suggest */}
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
                placeholder="Search sarees, kurtas, jackets, sneakers..." 
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

            {/* Smart Suggestions & Live Preview Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Popular Keywords / Trends */}
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Kurta", "Anarkali Kurti", "Saree", "Denim Jacket", "Sneakers", "Headphones"].map((tag) => (
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

                {/* Instant Matches Preview (Customer Mode: NO MARGINS!) */}
                {searchQuery.trim() && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                      Matching Products
                    </span>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {filteredProducts.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate('/product');
                          }}
                          className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#FF3F6C]">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">₹{item.price}</span>
                              <span className="text-[#FF3F6C] font-semibold">{item.discount}</span>
                              <span className="text-emerald-600 font-medium">Free Delivery 🚚</span>
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-[#FF3F6C] text-sm">
                            chevron_right
                          </span>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-xs text-slate-400 py-2 px-1">
                          No direct matches found. Press enter to search full catalog.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full mt-2 py-2 bg-[#FF3F6C]/10 hover:bg-[#FF3F6C]/20 text-[#FF3F6C] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">search</span>
                      Search all products for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => navigate('/notifications')} 
              className="text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>
            <button 
              onClick={() => navigate('/cart')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="Shopping Bag"
            >
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#b90041] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              className="w-full bg-[#f2f4f6] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-10 text-sm focus:ring-2 focus:ring-[#FF3F6C] focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium" 
              placeholder="Search sarees, kurtas, jackets, sneakers..." 
              type="text" 
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all text-xs cursor-pointer"
                title="Clear"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </form>
        </div>

        {/* Hero Carousel Section (Dual Cards: Pink & Blue) */}
        <section className="mt-2 relative group">
          <div 
            ref={bannerRef}
            onScroll={handleBannerScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-2 scroll-smooth"
          >
            {/* Card 1: Flash Sale (Pink / Magenta #b90041 to #df2457) */}
            <div 
              onClick={() => navigate('/flash')}
              className="min-w-[85%] md:min-w-[100%] snap-center shrink-0 cursor-pointer"
            >
              <div className="h-48 md:h-80 rounded-3xl bg-gradient-to-br from-[#b90041] to-[#df2457] relative overflow-hidden flex items-center px-8 text-white shadow-xl shadow-[#b90041]/20">
                <div className="relative z-10 max-w-xs md:max-w-md">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                    Flash Sale
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black font-headline leading-tight">
                    UP TO 80% OFF
                  </h2>
                  <p className="mt-2 text-sm opacity-90">
                    Curated ethnic wear for the festive season.
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/flash');
                    }} 
                    className="mt-6 bg-white text-[#b90041] px-6 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform hover:bg-opacity-95 cursor-pointer"
                  >
                    Shop Now
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-80 md:opacity-100 mix-blend-overlay pointer-events-none">
                  <img 
                    className="w-full h-full object-cover rounded-l-full" 
                    alt="Stylish traditional clothing display" 
                    src="/banner_img.jpg"
                    onError={(e) => {
                      e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuDN93jQ_xg0f6-zb955ibV_Vb2ULlDkhzoh7rBba28sFScTWcts5B8jpHC7NtiNzGHNpKedaH-un9MEt5W8QLlyc-8DRZe845t9OpyidNTC3c31yU08q_1eSgxokC3S-EUFIdI20bFmysBA9yl1WBRExCen1GgQwViLxACjnMTO3dwAWldb4zfUxOtAMqcj6ShvldTXqHqmr58GN8GVS4fFtQ04e6FhQzFO6xmhnB3GechbsrGchpdGqVEAUjcQN5CjVnyhiv2MxCg";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Customer Special Deals (Royal Blue / Indigo #4d41df to #675df9) */}
            <div 
              onClick={() => navigate('/explorer')}
              className="min-w-[85%] md:min-w-[100%] snap-center shrink-0 cursor-pointer"
            >
              <div className="h-48 md:h-80 rounded-3xl bg-gradient-to-br from-[#4d41df] to-[#675df9] relative overflow-hidden flex items-center px-8 text-white shadow-xl shadow-[#4d41df]/20">
                <div className="relative z-10 max-w-xs md:max-w-md">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                    SPECIAL OFFER
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black font-headline leading-tight">
                    MEGA SAVINGS FESTIVAL
                  </h2>
                  <p className="mt-2 text-sm opacity-90">
                    Free Delivery & Extra 20% off on your first order.
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/explorer');
                    }} 
                    className="mt-6 bg-white text-[#4d41df] px-6 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform hover:bg-opacity-95 cursor-pointer"
                  >
                    Explore Deals
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Chevrons for Desktop */}
          {activeSlide > 0 && (
            <button
              onClick={() => scrollToSlide(0)}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 items-center justify-center text-white z-20 transition-all shadow-lg cursor-pointer"
              aria-label="Previous Banner"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}
          {activeSlide < 1 && (
            <button
              onClick={() => scrollToSlide(1)}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 items-center justify-center text-white z-20 transition-all shadow-lg cursor-pointer"
              aria-label="Next Banner"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}

          {/* Carousel Indicator Dots */}
          <div className="flex justify-center gap-2 mt-2">
            <button 
              onClick={() => scrollToSlide(0)} 
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === 0 ? 'w-6 bg-[#b90041]' : 'w-2 bg-gray-300'}`} 
              aria-label="Slide 1: Flash Sale"
            />
            <button 
              onClick={() => scrollToSlide(1)} 
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === 1 ? 'w-6 bg-[#4d41df]' : 'w-2 bg-gray-300'}`} 
              aria-label="Slide 2: Special Offers"
            />
          </div>
        </section>

        {/* Customer Trust & Assurance Strip */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-[#b90041] shrink-0">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Free Delivery</h4>
              <p className="text-[10px] text-slate-400">On all online orders</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Cash On Delivery</h4>
              <p className="text-[10px] text-slate-400">Pay at your doorstep</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-[#4d41df] shrink-0">
              <span className="material-symbols-outlined text-xl">published_with_changes</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">7-Day Returns</h4>
              <p className="text-[10px] text-slate-400">Instant easy refunds</p>
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

        {/* Category Carousel */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg text-[#191c1e] dark:text-slate-100">
              Top Categories
            </h3>
            <button 
              onClick={() => navigate('/explorer')} 
              className="text-[#b90041] text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline"
            >
              See All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, idx) => (
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
                <span className={`text-xs font-medium ${selectedCategory === cat.name ? 'font-bold text-[#FF3F6C]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Product Grid (NO RESELL MARGIN) */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-extrabold text-2xl text-[#191c1e] dark:text-slate-100">
                Curated For You
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top rated fashion, electronics & essentials at unbeatable prices
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{filteredProducts.length} items</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">inventory_2</span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No products found in {selectedCategory}</p>
                <p className="text-xs text-slate-400 mt-1">Explore other categories or check back soon for new arrivals.</p>
                <button 
                  onClick={() => setSelectedCategory("All")} 
                  className="mt-4 px-4 py-2 text-xs font-bold text-[#b90041] bg-[#b90041]/10 rounded-xl hover:bg-[#b90041]/20 transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isFav = favorites.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div onClick={() => navigate('/product')} className="cursor-pointer" title="View Product Details">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={p.image} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        {p.tag && (
                          <span className="absolute top-2 left-2 max-w-[calc(100%-44px)] truncate whitespace-nowrap bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider text-slate-800 dark:text-slate-200">
                            {p.tag}
                          </span>
                        )}
                        <button 
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer"
                        >
                          <span 
                            className={`material-symbols-outlined text-sm ${isFav ? 'text-[#b90041]' : 'text-slate-400'}`}
                            style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      <div className="px-1 min-w-0">
                        {p.brand && (
                          <span className="text-[10px] font-bold text-[#b90041] uppercase tracking-wider block mb-0.5 truncate">
                            {p.brand}
                          </span>
                        )}
                        <h4 
                          className="text-[11.5px] sm:text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1 font-body leading-snug min-h-[2.25rem] sm:min-h-[2.5rem] break-words"
                          title={p.title}
                        >
                          {p.title}
                        </h4>
                        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mb-2">
                          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">₹{p.price}</span>
                          <span className="text-[11px] sm:text-xs text-slate-400 line-through">₹{p.originalPrice}</span>
                          <span className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] whitespace-nowrap">{p.discount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Bottom Action: FREE DELIVERY & VIEW (NO RESELL MARGIN) */}
                    <div 
                      onClick={() => navigate('/product')}
                      className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-colors group/btn"
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
              })
            )}
          </div>
        </section>
      </main>

      {/* Customer Bottom Navigation */}
      <AppBottomNav activeNav="home" role="customer" homePath="/user-home" />
    </div>
  );
}
