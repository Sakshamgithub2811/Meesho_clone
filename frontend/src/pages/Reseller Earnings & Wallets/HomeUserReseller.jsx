import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";
import { getUnreadCount, subscribeNotifications } from '../../services/notificationService';
import { getProducts } from '../../services/ecommerceService';
import { getAffiliateApp } from '../../services/affiliateSessionStore';
import { buildAffiliateProductUrl } from '../../utils/affiliateLinkHelper';

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

export default function HomeUserReseller() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([1]);
  const [activeNav, setActiveNav] = useState("home");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(() => getUnreadCount());
  const [quickShareProduct, setQuickShareProduct] = useState(null);
  const [quickShareMargin, setQuickShareMargin] = useState(100);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const getReferralCode = () => {
    try {
      const affApp = getAffiliateApp();
      if (affApp?.referralCode) return affApp.referralCode;
      const cust = JSON.parse(localStorage.getItem('mshoppy_customer_user') || '{}');
      if (cust?.fullName) return (cust.fullName.slice(0, 5).toUpperCase() + 'AFF');
    } catch (e) {}
    return 'MSHOPPYAFF';
  };

  const handleQuickShare = (p) => {
    setQuickShareProduct(p);
    setQuickShareMargin(Number(p.margin) || 100);
  };

  const handleWhatsAppSend = (prod, margin) => {
    const refCode = getReferralCode();
    const numericMargin = Number(margin) || 0;
    const finalPrice = prod.price + numericMargin;
    const orderLink = buildAffiliateProductUrl({ productId: prod.id, refCode, margin: numericMargin });
    const msg = `✨ *${prod.title}*\n\nSpecial Price: ₹${finalPrice} only (Free Shipping!)\n\n✅ 7-Day Easy Replacement Guarantee\n✅ Cash on Delivery Available\n\n👉 Order directly online:\n${orderLink}\n\nOr reply with your delivery address & size to book!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setToastMessage('Shared to WhatsApp successfully!');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopyQuickLink = (prod, margin) => {
    const refCode = getReferralCode();
    const numericMargin = Number(margin) || 0;
    const orderLink = buildAffiliateProductUrl({ productId: prod.id, refCode, margin: numericMargin });
    navigator.clipboard.writeText(orderLink);
    setCopiedLink(true);
    setToastMessage('Referral link with margin copied!');
    setTimeout(() => {
      setCopiedLink(false);
      setToastMessage('');
    }, 2000);
  };

  useEffect(() => {
    const unsub = subscribeNotifications(() => {
      setUnreadNotifs(getUnreadCount());
    });
    return unsub;
  }, []);

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

  const [products, setProducts] = useState(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem('mshoppy_cached_reseller_prods') || localStorage.getItem('mshoppy_cached_catalog_prods') || '[]');
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch (_) {}
    return [];
  });
  const [loading, setLoading] = useState(() => products.length === 0);
  const [visibleCount, setVisibleCount] = useState(32);

  // High-performance paginated product loader (Loads in < 200ms with instant cache-first)
  useEffect(() => {
    let isMounted = true;
    if (products.length === 0) setLoading(true);

    getProducts({ limit: 48, sort: 'popular' })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => {
            const rawCat = (typeof item.category === 'object' ? item.category?.name : item.category) || item.categorySlug || 'Women';
            const basePrice = Number(item.price) || 499;
            const originalPrice = Number(item.originalPrice) || Math.round(basePrice * 1.8);
            const discount = item.discount || (item.discountPercentage ? `${item.discountPercentage}% OFF` : '45% OFF');
            const defaultMargin = Number(item.margin) || Math.max(50, Math.round(basePrice * 0.2));

            return {
              id: item.id || idx + 1,
              title: item.title || item.name || 'MShoppy Product',
              category: rawCat,
              brand: item.brand || item.supplierName || 'Official Store',
              price: basePrice,
              originalPrice: originalPrice,
              discount: discount,
              margin: defaultMargin,
              tag: item.tag || (idx % 3 === 0 ? 'BESTSELLER' : idx % 3 === 1 ? 'HOT' : 'TRENDING'),
              image: (Array.isArray(item.images) && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
            };
          });
          setProducts(mapped);
          try {
            sessionStorage.setItem('mshoppy_cached_reseller_prods', JSON.stringify(mapped));
            localStorage.setItem('mshoppy_cached_catalog_prods', JSON.stringify(mapped.slice(0, 24)));
          } catch (_) {}
        }
      })
      .catch((err) => {
        console.error('Failed to load live reseller products:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset pagination count when category or search changes
  useEffect(() => {
    setVisibleCount(32);
  }, [selectedCategory, searchQuery]);

  const normalize = (text) => {
    if (!text) return '';
    const str = typeof text === 'object' ? (text.name || text.title || text.slug || '') : String(text);
    return str.toLowerCase().replace(/kurtas?|kurti/g, 'kurt').replace(/sarees?/g, 'saree').trim();
  };

  const matchesCategoryFilter = (pCatRaw, selCat) => {
    if (!selCat || selCat === 'All') return true;
    const sel = selCat.toLowerCase().trim();
    const cat = String(pCatRaw || '').toLowerCase().trim();

    if (sel === 'women') {
      return cat.includes('women');
    }
    if (sel === 'men') {
      return cat.includes('men') && !cat.includes('women');
    }
    if (sel === 'kids') {
      return cat.includes('kid');
    }
    if (sel === 'home') {
      return cat.includes('home') || cat.includes('kitchen');
    }
    if (sel === 'gadgets' || sel === 'electronics') {
      return cat.includes('gadget') || cat.includes('electronic');
    }
    if (sel === 'beauty') {
      return cat.includes('beauty') || cat.includes('health');
    }
    if (sel === 'jewelry' || sel === 'jewellery') {
      return cat.includes('jewel');
    }
    if (sel === 'brands' || sel === 'brand') {
      return true;
    }
    return cat.includes(sel);
  };

  const filteredProducts = products.filter(p => {
    const q = normalize(searchQuery);
    const titleNorm = normalize(p.title);
    const brandNorm = normalize(p.brand);
    const catNorm = normalize(p.category);

    const matchesSearch = !q || titleNorm.includes(q) || brandNorm.includes(q) || catNorm.includes(q);
    const matchesCat = matchesCategoryFilter(p.category, selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="relative w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 z-40">
        <div className="w-full px-3.5 sm:px-6 md:px-10 lg:px-16 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div 
              onClick={() => navigate('/reseller-home')}
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

                {/* Instant Matches Preview if user typed */}
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
                            navigate(`/product?id=${item.id}&source=reseller`);
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
                            <p className="text-[11px] text-slate-400">
                              ₹{item.price} • <span className="text-[#FF3F6C] font-semibold">{item.discount}</span> • Margin ₹{item.margin}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-[#FF3F6C] text-sm">
                            chevron_right
                          </span>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-xs text-slate-400 py-2 px-1">
                          No direct matches found in preview. Press search to browse all catalogs.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full mt-2 py-2 bg-[#FF3F6C]/10 hover:bg-[#FF3F6C]/20 text-[#FF3F6C] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">search</span>
                      Search all catalog for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/notifications')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3F6C] rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>
            <button onClick={() => navigate('/cart')} className="text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" title="Shopping Cart">
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32">
        {/* Mobile Search with Working Search Button */}
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
              placeholder="Search products, brands and more..." 
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

        {/* Hero Carousel Section */}
        <section className="mt-2 relative group">
          <div 
            ref={bannerRef}
            onScroll={handleBannerScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-2 scroll-smooth"
          >
            {/* Card 1: Trending Deals (Pink / Magenta) */}
            <div 
              onClick={() => navigate('/explorer')}
              className="min-w-[85%] md:min-w-[100%] snap-center shrink-0 cursor-pointer"
            >
              <div className="h-48 md:h-80 rounded-3xl bg-gradient-to-br from-[#b90041] to-[#df2457] relative overflow-hidden flex items-center px-8 text-white shadow-lg shadow-[#b90041]/20">
                <div className="relative z-10 max-w-xs md:max-w-md">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                    Mega Collection
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
                      navigate('/explorer');
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
                      e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Become a Reseller (Blue / Purple) */}
            <div 
              onClick={() => navigate('/dropshipper-register')}
              className="min-w-[85%] md:min-w-[100%] snap-center shrink-0 cursor-pointer"
            >
              <div className="h-48 md:h-80 rounded-3xl bg-gradient-to-br from-[#4d41df] to-[#675df9] relative overflow-hidden flex items-center px-8 text-white shadow-lg shadow-[#4d41df]/20">
                <div className="relative z-10 max-w-xs md:max-w-md">
                  <h2 className="text-3xl md:text-5xl font-black font-headline leading-tight">
                    BECOME A RESELLER
                  </h2>
                  <p className="mt-2 text-sm opacity-90">
                    Start your business with zero investment.
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/dropshipper-register');
                    }} 
                    className="mt-6 bg-white text-[#4d41df] px-6 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform hover:bg-opacity-95 cursor-pointer"
                  >
                    Join Now
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
              aria-label="Slide 2: Become a Reseller"
            />
          </div>
        </section>


        {/* Category Carousel */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg text-on-surface">Categories</h3>
            <button onClick={() => navigate('/explorer')} className="text-[#b90041] text-xs font-bold font-label uppercase tracking-wider cursor-pointer hover:underline">See All</button>
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
                    ? 'bg-[#FF3F6C] text-white shadow-lg shadow-[#FF3F6C]/20 scale-105' 
                    : 'bg-surface-container-high group-hover:bg-[#ffd9dc] text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <span className={`text-xs font-medium ${selectedCategory === cat.name ? 'font-bold text-[#FF3F6C]' : 'text-on-surface'}`}>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Product Grid */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-extrabold text-2xl text-on-surface">Curated For You</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">High margin products trending among top resellers</p>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#FF3F6C] animate-ping inline-block"></span>
                  Loading live catalog...
                </span>
              ) : (
                <span className="font-bold text-slate-700">{filteredProducts.length} items available</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/10 animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-full" />
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-8">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-2">inventory_2</span>
                <p className="text-sm font-semibold text-on-surface">No products found in {selectedCategory}</p>
                <p className="text-xs text-on-surface-variant mt-1">Explore other categories or check back soon for new arrivals.</p>
                <button 
                  onClick={() => setSelectedCategory("All")} 
                  className="mt-4 px-4 py-2 text-xs font-bold text-[#b90041] bg-[#b90041]/10 rounded-xl hover:bg-[#b90041]/20 transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : (
              filteredProducts.slice(0, visibleCount).map((p) => {
                const isFav = favorites.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div onClick={() => navigate(`/product?id=${p.id}&source=reseller`)} className="cursor-pointer" title="View Product Details">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 bg-surface-container-high">
                        <img 
                          src={p.image} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        {p.tag && (
                          <span className="absolute top-2 left-2 max-w-[calc(100%-44px)] truncate whitespace-nowrap bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider text-on-surface">
                            {p.tag}
                          </span>
                        )}
                        <button 
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer"
                        >
                          <span 
                            className={`material-symbols-outlined text-sm ${isFav ? 'text-[#b90041]' : 'text-on-surface-variant'}`}
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
                          className="text-[11.5px] sm:text-xs md:text-sm font-semibold text-on-surface line-clamp-2 mb-1 font-body leading-snug min-h-[2.25rem] sm:min-h-[2.5rem] break-words"
                          title={p.title}
                        >
                          {p.title}
                        </h4>
                        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mb-2">
                          <span className="text-sm sm:text-base font-black text-on-surface">₹{p.price}</span>
                          <span className="text-[11px] sm:text-xs text-on-surface-variant line-through">₹{p.originalPrice}</span>
                          <span className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] whitespace-nowrap">{p.discount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reseller WhatsApp Share Action */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickShare(p);
                        }}
                        className="w-full py-2 px-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Share on WhatsApp with Margin"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="truncate">Share & Earn ₹{p.margin}</span>
                      </button>

                      <div className="flex items-center justify-between px-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/share-earn-config?id=${p.id}`);
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-[#b90041] transition-colors cursor-pointer"
                        >
                          Custom Margin ➔
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyQuickLink(p, p.margin);
                          }}
                          className="text-[10px] font-bold text-[#b90041] hover:underline flex items-center gap-0.5 cursor-pointer"
                          title="Copy tracked referral link"
                        >
                          <span className="material-symbols-outlined text-xs">link</span>
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Scalable Load More Pagination */}
            {!loading && filteredProducts.length > visibleCount && (
              <div className="col-span-full py-8 text-center flex flex-col items-center justify-center gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <strong>{Math.min(visibleCount, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> products
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 32)}
                  className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Load More Products</span>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bento Grid Offer Section */}
        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* The Reseller Club Card */}
            <div className="md:col-span-2 h-64 bg-[#F2F4F6] rounded-3xl p-8 relative overflow-hidden group">
              <div className="relative z-10 max-w-sm">
                <h3 className="text-3xl font-black font-headline text-on-surface mb-2">The Reseller Club</h3>
                <p className="text-on-surface-variant max-w-xs mb-6 text-sm">Unlock exclusive prices and marketing kits for your business.</p>
                <button
                  onClick={() => navigate('/affiliate-program')}
                  className="bg-[#FF3F6C] hover:bg-[#e0355e] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 group-hover:shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  Learn More
                  <span className="material-symbols-outlined">trending_up</span>
                </button>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-end pr-4 sm:pr-8 opacity-10 group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none overflow-hidden">
                <span 
                  className="material-symbols-outlined text-[#FF3F6C] select-none"
                  style={{ fontSize: '190px', lineHeight: 1 }}
                >
                  groups
                </span>
              </div>
            </div>

            {/* Weekly Mission Card */}
            <div 
              onClick={() => navigate('/earnings-dashboard-1')}
              className="h-64 bg-[#4D41DF] rounded-3xl p-8 flex flex-col justify-between text-white overflow-hidden relative group shadow-lg shadow-[#4D41DF]/20 cursor-pointer hover:shadow-2xl transition-all active:scale-[0.99]"
              title="View Earnings & Missions Dashboard"
            >
              <div className="relative z-10">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Weekly Mission</span>
                <h3 className="text-2xl font-black font-headline mt-1 text-white">Earn Bonus ₹5,000</h3>
              </div>
              <div className="relative z-10">
                <p className="text-xs opacity-80 mb-4">Complete 10 shares today to unlock your silver badge.</p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[60%] rounded-full"></div>
                </div>
              </div>
              <div className="absolute -right-6 -top-6 opacity-20 group-hover:rotate-12 transition-transform duration-500 pointer-events-none select-none">
                <span 
                  className="material-symbols-outlined text-white select-none"
                  style={{ fontSize: '130px', lineHeight: 1 }}
                >
                  payments
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Quick Share to WhatsApp Modal */}
      {quickShareProduct && (
        <div 
          onClick={() => setQuickShareProduct(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Share to WhatsApp</h3>
                  <p className="text-[11px] text-slate-400">Add profit margin & send to customer</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setQuickShareProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
              <img 
                src={quickShareProduct.image} 
                alt={quickShareProduct.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">{quickShareProduct.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Supplier Base: <span className="font-bold text-slate-700 dark:text-slate-300">₹{quickShareProduct.price}</span></p>
                <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md font-bold mt-1">Free Delivery Included</span>
              </div>
            </div>

            {/* Profit Margin Presets */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Profit Margin</label>
                <span className="text-xs font-black text-emerald-600">+₹{quickShareMargin} Profit</span>
              </div>
              <div className="flex gap-2">
                {[50, 100, 150, 200, 300].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQuickShareMargin(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      quickShareMargin === m 
                        ? 'bg-[#25D366] text-white shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    +₹{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-emerald-500/20">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-90 block">Customer Selling Price</span>
                <span className="text-2xl font-black">₹{quickShareProduct.price + (Number(quickShareMargin) || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] opacity-80 block">Your Direct Earning</span>
                <span className="text-base font-extrabold bg-white/20 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">₹{quickShareMargin}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleWhatsAppSend(quickShareProduct, quickShareMargin);
                  setQuickShareProduct(null);
                }}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Share to WhatsApp Now</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyQuickLink(quickShareProduct, quickShareMargin)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">{copiedLink ? 'check' : 'content_copy'}</span>
                  <span>{copiedLink ? 'Copied!' : 'Copy Referral Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = quickShareProduct.id;
                    setQuickShareProduct(null);
                    navigate(`/share-earn-config?id=${id}`);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#b90041] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  <span>Studio Options</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Universal Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
