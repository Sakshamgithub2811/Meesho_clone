import React, { useState, useEffect } from 'react';
import { getWishlist, toggleWishlist as apiToggleWishlist } from '../../services/ecommerceService';
import AppBottomNav from '../../components/AppBottomNav';

export default function HomeUserReseller({ onNavigate = () => {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500); 
  };

  useEffect(() => {
    async function loadWish() {
      try {
        const wish = await getWishlist();
        if (Array.isArray(wish)) {
          const map = {};
          wish.forEach(w => {
            const pid = w.productId || w.id;
            if (pid) map[pid] = true;
          });
          setWishlist(map);
        }
      } catch (e) {}
    }
    loadWish();
  }, []);

  const toggleWishlist = async (e, id) => {
    e.stopPropagation();
    const next = !wishlist[id];
    setWishlist((prev) => ({ ...prev, [id]: next }));
    triggerToast(next ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
    try {
      await apiToggleWishlist(id);
    } catch (err) {
      console.warn('apiToggleWishlist fallback:', err);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        onNavigate('search');
      } else {
        onNavigate('explorer');
      }
    }
  };

  const categories = [
    { id: 'women', name: 'Sarees', icon: 'checkroom', target: 'sarees' },
    { id: 'western', name: 'Western', icon: 'styler', target: 'western' },
    { id: 'spotlight', name: 'Spotlight', icon: 'auto_awesome', target: 'spotlight' },
    { id: 'explorer', name: 'All Categories', icon: 'grid_view', target: 'explorer' },
    { id: 'kids', name: 'Kids', icon: 'child_care', target: 'explorer' },
    { id: 'jewelry', name: 'Jewelry', icon: 'diamond', target: 'explorer' },
    { id: 'brands', name: 'Brands', icon: 'verified', target: 'explorer' },
  ];

  const products = [
    {
      id: 1,
      title: 'Premium Floral Embroidered Kurti',
      price: 459,
      originalPrice: 1299,
      discount: '64% OFF',
      margin: 65,
      tag: 'NEW',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: "Men's Vintage Denim Jacket",
      price: 899,
      originalPrice: 2499,
      discount: '64% OFF',
      margin: 120,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Retro Square Sunglasses',
      price: 249,
      originalPrice: 999,
      discount: '75% OFF',
      margin: 35,
      tag: 'BESTSELLER',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Air Cushion Sneakers',
      price: 1249,
      originalPrice: 3499,
      discount: '64% OFF',
      margin: 180,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="bg-[#f8f9fb] min-h-screen font-sans text-[#191c1e] selection:bg-pink-100 selection:text-pink-700">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="relative flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 w-full bg-white border-b border-gray-100 shadow-2xs gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => onNavigate('reseller')}
            className="text-base sm:text-xl md:text-2xl font-black text-[#FF3F6C] tracking-tight cursor-pointer whitespace-nowrap"
          >
            The Digital Curator
          </button>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative group">
            <span
              onClick={handleSearch}
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products, kurtis, sarees... (Press Enter)"
              className="w-full bg-[#e7e8ea] border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#b90041] focus:bg-white transition-all text-sm outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('user_dashboard')}
            title="Curator Hub Dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 text-[#b90041] hover:bg-pink-100 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="hidden sm:inline">Curator Hub</span>
          </button>
          <button
            onClick={() => onNavigate('wishlist')}
            title="Wishlist"
            className="text-[#191C1E] active:scale-95 duration-200 hover:text-[#FF3F6C] p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button
            onClick={() => onNavigate('cart')}
            title="Shopping Cart"
            className="text-[#191C1E] active:scale-95 duration-200 hover:text-[#FF3F6C] p-1 cursor-pointer relative"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="absolute -top-1 -right-1 bg-[#FF3F6C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32">
        {/* Mobile Search Input */}
        <div className="md:hidden pt-3 pb-4">
          <div className="relative">
            <span
              onClick={handleSearch}
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products, brands and more..."
              className="w-full bg-[#e7e8ea] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#b90041] focus:bg-white outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Hero Carousel Section */}
        <section className="mt-2 relative group">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4">
            {/* Slide 1 */}
            <div className="min-w-[85%] md:min-w-full snap-center">
              <div className="h-52 md:h-80 rounded-3xl bg-linear-to-br from-[#b90041] to-[#df2457] relative overflow-hidden flex items-center px-8 text-white shadow-md">
                <div className="relative z-10 max-w-xs">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                    Flash Sale
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black leading-tight">
                    UP TO 80% OFF
                  </h2>
                  <p className="mt-2 text-xs md:text-sm opacity-90">
                    Curated ethnic wear for the festive season.
                  </p>
                  <button
                    onClick={() => onNavigate('explorer')}
                    className="mt-5 inline-block bg-white text-[#b90041] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-transform cursor-pointer hover:bg-pink-50"
                  >
                    Shop All Deals ➔
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-30 md:opacity-100 flex items-center justify-end pr-8 select-none text-8xl md:text-9xl">
                  👗
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="min-w-[85%] md:min-w-full snap-center">
              <div className="h-52 md:h-80 rounded-3xl bg-linear-to-br from-[#4d41df] to-[#675df9] relative overflow-hidden flex items-center px-8 text-white shadow-md">
                <div className="relative z-10 max-w-xs">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                    Spotlight Collections
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black leading-tight">
                    CURATED DROPS
                  </h2>
                  <p className="mt-2 text-xs md:text-sm opacity-90">
                    Discover editorial collections and looks.
                  </p>
                  <button
                    onClick={() => onNavigate('spotlight')}
                    className="mt-5 inline-block bg-white text-[#4d41df] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-transform cursor-pointer hover:bg-indigo-50"
                  >
                    Explore Spotlight ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Grid / Horizontal Scroll */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black tracking-tight text-[#191c1e]">
              Browse Categories
            </h3>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-[#FF3F6C] font-semibold text-sm hover:underline cursor-pointer"
            >
              See All ➔
            </button>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-6 py-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate(cat.target)}
                className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#f2f4f6] flex items-center justify-center group-hover:bg-[#ffd9dc] group-hover:scale-110 transition-all shadow-2xs">
                  <span className="material-symbols-outlined text-[#b90041] text-3xl">
                    {cat.icon}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#5b4042] uppercase tracking-tighter group-hover:text-[#FF3F6C] transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 bg-[#FF3F6C] rounded-full"></div>
            <h3 className="text-2xl font-black tracking-tight text-[#191c1e]">
              Curated Picks
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => {
              const isFav = wishlist[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => onNavigate('product')}
                  className="group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden rounded-3xl aspect-3/4 mb-3 bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {product.tag && (
                      <div className="absolute top-3 left-3 max-w-[calc(100%-44px)]">
                        <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#191c1e] shadow-sm truncate whitespace-nowrap block">
                          {product.tag}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-sm ${isFav ? 'text-[#FF3F6C]' : 'text-gray-600'}`}
                        style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  <div className="px-1 space-y-1 min-w-0">
                    <h4 
                      className="text-xs sm:text-sm font-semibold text-[#191c1e] line-clamp-2 mb-1 leading-snug min-h-[2.25rem] sm:min-h-[2.5rem] break-words hover:text-[#FF3F6C] transition"
                      title={product.title}
                    >
                      {product.title}
                    </h4>

                    <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-base font-black text-[#191c1e]">₹{product.price}</span>
                      <span className="text-[11px] sm:text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                      <span className="text-[11px] sm:text-xs font-bold text-[#FF3F6C] whitespace-nowrap">{product.discount}</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5 flex items-center justify-between mt-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Earn ₹{product.margin}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-emerald-800">
                        share
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bento Grid Offer Section */}
        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reseller Club Banner */}
            <div className="md:col-span-2 h-64 bg-[#F2F4F6] rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10 max-w-sm">
                <h3 className="text-3xl font-black text-[#191c1e] mb-2">The Reseller Club</h3>
                <p className="text-gray-600 text-xs mb-6 leading-relaxed">
                  Unlock exclusive factory prices, marketing materials, and priority payouts for your reselling business.
                </p>
                <button
                  onClick={() => onNavigate('spotlight')}
                  className="bg-[#FF3F6C] text-white px-6 py-3 rounded-2xl font-bold text-xs inline-flex items-center gap-2 group-hover:shadow-xl transition-all cursor-pointer hover:bg-[#e0305a]"
                >
                  Explore Spotlight Looks
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                </button>
              </div>
              <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-10 flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-[180px] text-[#b90041]">
                  groups
                </span>
              </div>
            </div>

            {/* Weekly Mission Card */}
            <div
              onClick={() => onNavigate('explorer')}
              className="h-64 bg-[#4D41DF] rounded-3xl p-8 flex flex-col justify-between text-white overflow-hidden relative group shadow-md cursor-pointer hover:bg-[#3f34c7] transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                  Catalog Explorer
                </span>
                <h3 className="text-2xl font-black mt-1">Explore Collections 🗂️</h3>
              </div>
              <div className="relative z-10">
                <p className="text-xs opacity-80 mb-3">
                  Check out all wholesale categories direct from suppliers.
                </p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[60%] rounded-full"></div>
                </div>
              </div>
              <div className="absolute -right-6 -top-6 opacity-20 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-[110px]">payments</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FAB Floating Share Button */}
      <button
        onClick={() => triggerToast('Catalog shared to WhatsApp! 📲')}
        className="fixed right-6 bottom-24 w-14 h-14 bg-linear-to-tr from-[#b90041] to-[#df2457] text-white rounded-full flex items-center justify-center shadow-xl z-40 active:scale-90 transition-transform md:hidden cursor-pointer"
        title="Share Catalog"
      >
        <span className="material-symbols-outlined">share</span>
      </button>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}