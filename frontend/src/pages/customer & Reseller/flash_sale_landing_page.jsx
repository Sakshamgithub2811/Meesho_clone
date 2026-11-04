import React, { useState, useEffect } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getProducts,
  addToCart,
  getCart,
  getWishlist,
  toggleWishlist,
  getFlashSaleConfig
} from '../../services/ecommerceService';

export default function FlashSaleLandingPage({ onNavigate = () => { }, onBack }) {
  const [activeFilter, setActiveFilter] = useState('All Deals');
  const [sortBy, setSortBy] = useState('discount');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [dbProducts, setDbProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [saleConfig, setSaleConfig] = useState(null);
  const [targetEndTime, setTargetEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const isReseller = Boolean(
    typeof window !== 'undefined' &&
    (localStorage.getItem('mshoppy_reseller_token') || localStorage.getItem('mshoppy_affiliate_token'))
  );

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const calculateTimeRemaining = (targetTime) => {
    if (!targetTime) return { hours: 0, minutes: 0, seconds: 0, isExpired: false };
    const diff = Math.max(0, targetTime - Date.now());
    const totalSecs = Math.floor(diff / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return { hours, minutes, seconds, isExpired: diff <= 0 };
  };

  // Live countdown timer synced with Backend Sale End Time
  useEffect(() => {
    if (!targetEndTime) return;
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(targetEndTime);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetEndTime]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  const filterTabs = [
    'All Deals',
    'Ethnic Sarees',
    'Western Wear',
    'Footwear',
    'Accessories',
    'Bags & Wallets',
  ];

  const initialProducts = [
    {
      id: 1,
      title: 'Aurelia Royal Silk Banarasi Wrap Saree',
      category: 'Ethnic Sarees',
      price: 499,
      originalPrice: 1999,
      discount: 75,
      rating: 4.8,
      reviewsCount: '3.4k',
      margin: 250,
      stockTag: 'Only 4 left',
      claimedPct: 88,
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Urban Glide Ultra-Light Foam Sneakers',
      category: 'Footwear',
      price: 799,
      originalPrice: 2499,
      discount: 68,
      rating: 4.6,
      reviewsCount: '1.8k',
      margin: 220,
      stockTag: 'Selling Fast',
      claimedPct: 92,
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Handcrafted Vegan Leather Crossbody Bag',
      category: 'Bags & Wallets',
      price: 649,
      originalPrice: 2199,
      discount: 70,
      rating: 4.9,
      reviewsCount: '920',
      margin: 280,
      stockTag: 'Almost Gone',
      claimedPct: 95,
      image:
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Aviator 24K Gold Plated Polarized Sunglasses',
      category: 'Accessories',
      price: 299,
      originalPrice: 999,
      discount: 70,
      rating: 4.5,
      reviewsCount: '2.1k',
      margin: 110,
      stockTag: 'Only 2 left',
      claimedPct: 90,
      image:
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      title: 'French Floral Chiffon Maxi Sundress',
      category: 'Western Wear',
      price: 549,
      originalPrice: 1799,
      discount: 69,
      rating: 4.7,
      reviewsCount: '4.5k',
      margin: 190,
      stockTag: 'Deal of the Day',
      claimedPct: 82,
      image:
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      title: 'Rose Gold Minimalist Chrono Mesh Watch',
      category: 'Accessories',
      price: 489,
      originalPrice: 1899,
      discount: 74,
      rating: 4.7,
      reviewsCount: '1.1k',
      margin: 200,
      stockTag: 'Hot Seller',
      claimedPct: 79,
      image:
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 7,
      title: 'Kanchipuram Woven Zari Border Saree',
      category: 'Ethnic Sarees',
      price: 899,
      originalPrice: 3499,
      discount: 74,
      rating: 4.9,
      reviewsCount: '5.2k',
      margin: 380,
      stockTag: 'Only 3 left',
      claimedPct: 96,
      image:
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 8,
      title: 'Chunky Sole Streetwear High-Tops',
      category: 'Footwear',
      price: 949,
      originalPrice: 2999,
      discount: 68,
      rating: 4.6,
      reviewsCount: '780',
      margin: 310,
      stockTag: 'Flash Exclusive',
      claimedPct: 74,
      image:
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadFlashData() {
      try {
        const [prods, cart, wish, flashConfig] = await Promise.all([
          getProducts({ all: true }),
          getCart(),
          getWishlist(),
          getFlashSaleConfig()
        ]);
        if (isMounted) {
          if (flashConfig) {
            setSaleConfig(flashConfig);
            if (flashConfig.endTime) {
              const targetMs = new Date(flashConfig.endTime).getTime();
              setTargetEndTime(targetMs);
              setTimeLeft(calculateTimeRemaining(targetMs));
            }
          }

          if (cart?.totalItems !== undefined) setCartCount(cart.totalItems);
          if (wish) setCartCount(cart?.totalItems || 0);
          if (wish) setWishlistCount(wish.length);

          if (prods && prods.length > 0) {
            const minDisc = flashConfig?.minDiscount || 40;
            // Only products that meet flash discount criteria appear in Flash Sale
            const flashEligible = prods.filter(
              (p) => p.discountPercentage && p.discountPercentage >= minDisc
            );

            const mapped = flashEligible.map((p, idx) => ({
              id: p.id,
              title: p.title,
              category: p.category?.name || 'Flash Deals',
              price: p.price,
              originalPrice: p.originalPrice || Math.round(p.price * 1.8),
              discount: p.discountPercentage,
              rating: p.rating > 0 ? p.rating : 4.6,
              reviewsCount: p.reviewsCount > 0 ? `${p.reviewsCount}` : `${120 + idx * 45}`,
              margin: Math.round(p.price * 0.3),
              stockTag: idx % 3 === 0 ? 'Only 3 left' : 'Lightning Deal',
              claimedPct: 75 + (idx % 22),
              image: p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
            }));
            setDbProducts(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching flash sale data:', err);
      }
    }
    loadFlashData();
    return () => { isMounted = false; };
  }, []);

  // Share on WhatsApp
  const handleShareOnWhatsApp = (e, product) => {
    e.stopPropagation();
    const text = `⚡ *AMAZING FLASH SALE DEAL ON MSHOPPY!* ⚡\n\n*${product.title}*\n⭐ Special Deal Price: ₹${product.price}\n📉 MRP: ₹${product.originalPrice} (${product.discount}% OFF)\n🚚 Free Delivery & COD Available!\n\nCheck it out on MShoppy!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    triggerToast(`Opening WhatsApp to share "${product.title}" 🚀`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1, 'Free Size');
      setCartCount((c) => c + 1);
      triggerToast(`Added "${product.title.slice(0, 25)}..." to Cart! 🛒`);
    } catch (err) {
      triggerToast(`Added to Cart! 🛒`);
    }
  };

  const handleToggleWishlist = async (e, product) => {
    e.stopPropagation();
    try {
      await toggleWishlist(product.id);
      setWishlistCount((w) => w + 1);
      triggerToast(`Wishlist updated! ❤️`);
    } catch (err) {
      triggerToast(`Wishlist updated! ❤️`);
    }
  };

  const productSource = dbProducts.length > 0 ? dbProducts : initialProducts;

  const filteredProducts = productSource
    .filter((p) => {
      const matchesCategory = activeFilter === 'All Deals' || p.category === activeFilter;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'discount') return b.discount - a.discount;
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'margin') return b.margin - a.margin;
      return 0;
    });

  return (
    <div className="bg-[#f8f9fb] min-h-screen font-sans text-[#191c1e] antialiased selection:bg-pink-100 selection:text-pink-700">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">bolt</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 w-full z-50 border-b border-gray-100 shadow-xs">
        <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-14 sm:h-16 w-full max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => (onBack ? onBack() : onNavigate(isReseller ? '/reseller-home' : '/user-home'))}
              className="p-1.5 sm:p-2 -ml-1 hover:bg-slate-100 rounded-full transition-colors active:scale-95 text-[#FF3F6C] cursor-pointer shrink-0"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div
              onClick={() => onNavigate('reseller')}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group min-w-0"
            >
              <span className="text-xl sm:text-2xl animate-pulse shrink-0">⚡</span>
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg text-[#FF3F6C] tracking-tight group-hover:opacity-90 leading-tight whitespace-nowrap">
                  <span className="sm:hidden">Flash Drops</span>
                  <span className="hidden sm:inline">Lightning Flash Drops</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block whitespace-nowrap leading-none mt-0.5">
                  <span className="sm:hidden">Live Deals</span>
                  <span className="hidden sm:inline">Live Deals &amp; Free Delivery</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flash deals, sarees, dresses, sneakers..."
                className="w-full bg-[#f2f4f6] text-slate-800 placeholder:text-slate-400 pl-10 pr-4 py-2 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all border border-transparent focus:border-pink-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-[#FF3F6C] hover:bg-pink-50 rounded-full transition-colors cursor-pointer"
              title="Wishlist"
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
              <span className="absolute top-1 right-1 bg-[#FF3F6C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-[#FF3F6C] hover:bg-pink-50 rounded-full transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              <span className="absolute top-1 right-1 bg-[#FF3F6C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        {/* Mobile Search Bar */}
        <div className="md:hidden">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flash deals..."
              className="w-full bg-white text-slate-800 placeholder:text-slate-400 pl-9 pr-4 py-2.5 rounded-2xl text-xs shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* Hero Section with Live Countdown */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8a002e] via-[#df2457] to-[#4d41df] text-white shadow-xl p-6 sm:p-10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                {saleConfig?.bannerBadge || 'Live Lightning Drops'}
              </span>
              <span className="px-3 py-1 bg-black/25 backdrop-blur-md rounded-full text-[11px] font-bold text-yellow-300">
                {saleConfig?.dealBadge || '⚡ Limited Stock • Extra 15% Off'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              {saleConfig?.title || 'Midnight Flash Sale'} <br />
              <span className="text-yellow-300 drop-shadow-md">{saleConfig?.subtitle || 'Up to 75% Off Everything'}</span>
            </h2>

            <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
              Lowest prices of the season. Guaranteed factory-direct pricing + instant discounts on lightning deals!
            </p>

            {/* Ticking Countdown Timer */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80">
                {timeLeft.isExpired ? 'Flash Status:' : 'Deals Expire In:'}
              </span>
              {timeLeft.isExpired ? (
                <div className="bg-white/20 backdrop-blur-md text-yellow-300 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider border border-white/20">
                  ⚡ Flash Sale Ended • Refreshing Next Drop...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-white text-[#b90041] px-3 py-1.5 rounded-xl font-black text-base sm:text-xl shadow-md flex flex-col items-center">
                    <span>{formatNumber(timeLeft.hours)}</span>
                    <span className="text-[8px] font-extrabold uppercase text-slate-400 -mt-1">
                      Hours
                    </span>
                  </div>
                  <span className="font-black text-xl text-yellow-300">:</span>
                  <div className="bg-white text-[#b90041] px-3 py-1.5 rounded-xl font-black text-base sm:text-xl shadow-md flex flex-col items-center">
                    <span>{formatNumber(timeLeft.minutes)}</span>
                    <span className="text-[8px] font-extrabold uppercase text-slate-400 -mt-1">
                      Mins
                    </span>
                  </div>
                  <span className="font-black text-xl text-yellow-300">:</span>
                  <div className="bg-white text-[#b90041] px-3 py-1.5 rounded-xl font-black text-base sm:text-xl shadow-md flex flex-col items-center">
                    <span className="animate-pulse">{formatNumber(timeLeft.seconds)}</span>
                    <span className="text-[8px] font-extrabold uppercase text-slate-400 -mt-1">
                      Secs
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background Decorative Graphic */}
          <div className="absolute right-2 -bottom-6 opacity-20 sm:opacity-40 select-none text-9xl sm:text-[14rem] pointer-events-none font-black text-white">
            ⚡
          </div>
        </section>

        {/* Filters and Sorting Toolbar */}
        <section className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                      ? 'bg-[#b90041] text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
            >
              <option value="discount">Highest Discount</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </section>

        {/* Product Grid */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="font-extrabold text-base text-slate-800">No flash deals found</h3>
              <p className="text-xs text-slate-400 mt-1">Try switching categories or search query.</p>
              <button
                onClick={() => {
                  setActiveFilter('All Deals');
                  setSearchQuery('');
                }}
                className="mt-4 px-5 py-2 bg-[#FF3F6C] text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onNavigate(`/product?id=${product.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col group cursor-pointer justify-between"
                >
                  {/* Image & Badges */}
                  <div>
                    <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Flash Deal Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-[#b90041] to-[#df2457] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
                        <span>⚡ {product.discount}% OFF</span>
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(e, product)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 hover:text-[#FF3F6C] hover:bg-white transition-all shadow-xs cursor-pointer active:scale-90"
                        title="Add to Wishlist"
                      >
                        <span className="material-symbols-outlined text-lg">favorite</span>
                      </button>

                      {/* Stock Urgency Tag */}
                      {product.stockTag && (
                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-md text-amber-300 text-[9px] font-black rounded-md">
                          {product.stockTag}
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold">{product.category}</span>
                        <div className="flex items-center gap-1 bg-green-50 text-[#008644] px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                          <span>★ {product.rating}</span>
                          <span className="text-slate-400">({product.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#FF3F6C] transition-colors">
                        {product.title}
                      </h3>

                      {/* Price Row */}
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          ₹{product.price}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 ml-auto">
                          Save ₹{product.originalPrice - product.price}
                        </span>
                      </div>

                      {/* Stock Claim Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>{product.claimedPct}% Claimed</span>
                          <span className="text-[#b90041]">Hurry!</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-[#df2457] h-full rounded-full transition-all"
                            style={{ width: `${product.claimedPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Product Value/Trust Pill */}
                      <div className="bg-emerald-50/90 border border-emerald-100/70 py-1.5 px-2 sm:px-2.5 rounded-xl flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0">local_shipping</span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 whitespace-nowrap">
                            Free Delivery
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 whitespace-nowrap shrink-0">
                          7-Day Returns
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 pt-0 grid grid-cols-2 gap-2 border-t border-slate-50 mt-1">
                    <button
                      type="button"
                      onClick={(e) => handleShareOnWhatsApp(e, product)}
                      className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Share with Friends on WhatsApp"
                    >
                      <span className="text-sm">💬</span>
                      <span>Share</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="py-2 px-2 bg-[#FF3F6C] hover:bg-[#e02659] text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} role={isReseller ? 'reseller' : 'customer'} />
    </div>
  );
}