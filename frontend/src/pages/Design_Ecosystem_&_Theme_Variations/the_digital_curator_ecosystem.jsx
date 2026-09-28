import { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'women', name: 'Women', icon: 'checkroom' },
  { id: 'men', name: 'Men', icon: 'styler' },
  { id: 'kids', name: 'Kids', icon: 'child_care' },
  { id: 'home', name: 'Home', icon: 'home_iot_device' },
  { id: 'gadgets', name: 'Gadgets', icon: 'earbuds' },
  { id: 'beauty', name: 'Beauty', icon: 'shopping_basket' },
  { id: 'jewelry', name: 'Jewelry', icon: 'diamond' },
  { id: 'brands', name: 'Brands', icon: 'verified' },
];

const PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Premium Floral Embroidered Kurti',
    category: 'women',
    price: 459,
    originalPrice: 1299,
    discount: '64% OFF',
    earnAmount: 65,
    tag: 'NEW',
    rating: 4.3,
    reviews: 1240,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0zqmw7ba_XFDIMO6oyX-ILUKOJgIMuPHjQHmER1KSXi4yclRGSPaFRWJJc7uqCXrLyuOZB5pF6W9WnzFkT4T60VwY7uLrFzTvD9dwE04M23l7pGMu2N9_mNh3dIciAjlMaq4CCNHCtjsjPsAXVnUWIzuy88jS-AXIyF662WcDdlDcTQBqikiQkpbng2C7siDr0Cfpn4tI2OPGK5ut0GiQ2urqGnEEsMeCKdoSG60Mzopnd90gu9Axj_jDhaDAqbSN79R6G9BIo88',
  },
  {
    id: 'prod-2',
    title: "Men's Vintage Denim Jacket",
    category: 'men',
    price: 899,
    originalPrice: 2499,
    discount: '64% OFF',
    earnAmount: 120,
    tag: null,
    rating: 4.5,
    reviews: 870,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDPmD9-ovlIa-MD4BO39HPO96wxIRmWrYe8qYWvqkgptxYMCtQfivT9lWRbcMeXNi-Be7aT1fSOpzmtPE6QJMQbmsK-caGrrcQyM1aGztg5q70fVH5vVSd-huuv4T10VbeNArAzmgX_bWCzTnnnzDjfxd0bhLnV1OjRGwViGcBWLwJ0r76tf9TqTUqy3kSdVBeusII5UfWmQaFa2mxVvqsetPyMOBZibBWGA9Jw1D2ZeqkjFgFCzihuFUgTfa_BFgo9W_AOQ8dQP8',
  },
  {
    id: 'prod-3',
    title: 'Retro Square Polarized Sunglasses',
    category: 'gadgets',
    price: 249,
    originalPrice: 999,
    discount: '75% OFF',
    earnAmount: 35,
    tag: 'BESTSELLER',
    rating: 4.6,
    reviews: 2150,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RPNZ5nwbtLEh9sRMXLEaAEIdTk4Rz87Q3LYHQACDChwDYaR8qhBMhkVXuJkluTpsA_aaidWyOn_Upemc_IEw654SWRijV6kdGXhbsCPZ3UhkejAz4FIrdnhjgG1ifYPo0YdbnGt5COpD-LQQyqfDwSnkJ0dkPcTaNVzH115l9iYi5Pc9TiAWEMNhbEpfNrAygCBaT0wKcRpJ2lTs8T3YWfNEVx_G2PSS9BSwywJKSOx1KzmuJzD-O2_IlBG3VUOyDDgmMHnV9lg',
  },
  {
    id: 'prod-4',
    title: 'Air Cushion Lightweight Sneakers',
    category: 'men',
    price: 1249,
    originalPrice: 3499,
    discount: '64% OFF',
    earnAmount: 180,
    tag: null,
    rating: 4.2,
    reviews: 640,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnLVYeQpmW-W1dgZwHUgCQvF69izifWPEnVWhThVqzW-CIir5KRuUKR24bNfPIWDaQDUHLUUES63-xwoI5c5J6s9tRYCALvPPQFLXnY4vrcRNjR_rmp-ahMXmBFoMRAAHYmDnK_G91roDCgOjgFgmQuoYXoEbt-P6qlh70aroZJkRr6MSNVJgIcN5lweJDacGDeM9VzRY7bb6c6lFGvb2j12eevSjL676RRot4COi_sM79j9zSxTuFr0F6aZx2vsyTnOPggmoL9m4',
  },
  {
    id: 'prod-5',
    title: 'Silver Plated Choker Necklace Set',
    category: 'jewelry',
    price: 389,
    originalPrice: 1499,
    discount: '74% OFF',
    earnAmount: 55,
    tag: 'TRENDING',
    rating: 4.7,
    reviews: 3100,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDN93jQ_xg0f6-zb955ibV_Vb2ULlDkhzoh7rBba28sFScTWcts5B8jpHC7NtiNzGHNpKedaH-un9MEt5W8QLlyc-8DRZe845t9OpyidNTC3c31yU08q_1eSgxokC3S-EUFIdI20bFmysBA9yl1WBRExCen1GgQwViLxACjnMTO3dwAWldb4zfUxOtAMqcj6ShvldTXqHqmr58GN8GVS4fFtQ04e6FhQzFO6xmhnB3GechbsrGchpdGqVEAUjcQN5CjVnyhiv2MxCg',
  },
  {
    id: 'prod-6',
    title: 'Pure Cotton Printed Double Bedsheet',
    category: 'home',
    price: 499,
    originalPrice: 1699,
    discount: '70% OFF',
    earnAmount: 80,
    tag: 'SUPER SAVER',
    rating: 4.4,
    reviews: 980,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0zqmw7ba_XFDIMO6oyX-ILUKOJgIMuPHjQHmER1KSXi4yclRGSPaFRWJJc7uqCXrLyuOZB5pF6W9WnzFkT4T60VwY7uLrFzTvD9dwE04M23l7pGMu2N9_mNh3dIciAjlMaq4CCNHCtjsjPsAXVnUWIzuy88jS-AXIyF662WcDdlDcTQBqikiQkpbng2C7siDr0Cfpn4tI2OPGK5ut0GiQ2urqGnEEsMeCKdoSG60Mzopnd90gu9Axj_jDhaDAqbSN79R6G9BIo88',
  },
  {
    id: 'prod-7',
    title: 'boAt Rockerz 450 Bluetooth Headphones',
    category: 'brands',
    brand: 'boAt',
    price: 1499,
    originalPrice: 3990,
    discount: '62% OFF',
    earnAmount: 220,
    tag: 'VERIFIED BRAND',
    rating: 4.6,
    reviews: 4210,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-8',
    title: 'Puma Smashic Unisex Leather Sneakers',
    category: 'brands',
    brand: 'Puma',
    price: 1899,
    originalPrice: 4499,
    discount: '58% OFF',
    earnAmount: 280,
    tag: 'TOP BRAND',
    rating: 4.8,
    reviews: 2150,
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
];

export default function TheDigitalCuratorEcosystem({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set(['prod-1']));
  const [toastMsg, setToastMsg] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [shareCount, setShareCount] = useState(6);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from favorites');
      } else {
        next.add(id);
        showToast('Added to curated wishlist! ❤️');
      }
      return next;
    });
  };

  const handleShare = (product, e) => {
    e.stopPropagation();
    setShareCount((prev) => Math.min(10, prev + 1));
    showToast(`Shared "${product.title}"! Potential margin: ₹${product.earnAmount}`);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' ||
      p.category === activeCategory ||
      (activeCategory === 'brands' && (p.category === 'brands' || p.brand));
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#f8f9fb] font-['Inter'] text-[#191c1e] min-h-screen relative antialiased selection:bg-[#FF3F6C]/20 selection:text-[#b90041]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-[#191c1e]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-[#FF3F6C]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3.5 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div 
          onClick={() => onNavigate && onNavigate('reseller')} 
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#b90041] to-[#FF3F6C] flex items-center justify-center text-white shadow-md shadow-[#FF3F6C]/30">
            <span className="material-symbols-outlined text-lg">interests</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#FF3F6C] font-['Plus_Jakarta_Sans'] tracking-tight block leading-tight">
              The Digital Curator
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase hidden sm:block">
              Meesho Premier Ecosystem
            </span>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f2f4f6] border border-transparent rounded-xl py-2 pl-10 pr-9 focus:ring-2 focus:ring-[#b90041] focus:bg-white transition-all text-sm outline-none placeholder:text-slate-400"
              placeholder="Search curated products, fabrics, styles..."
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('notifications') : showToast('Notifications up to date!')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#191C1E] hover:bg-slate-100 active:scale-95 transition-all relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF3F6C]"></span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('cart') : showToast('Opening shopping bag...')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#191C1E] hover:bg-slate-100 active:scale-95 transition-all relative cursor-pointer"
            title="Bag"
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            <span className="absolute -top-0.5 -right-0.5 bg-[#b90041] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32 pt-2">
        {/* Mobile Search Anchor */}
        <div className="md:hidden pt-2 pb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f2f4f6] border border-transparent rounded-2xl py-3 pl-12 pr-10 text-sm focus:ring-2 focus:ring-[#b90041] focus:bg-white outline-none shadow-sm transition-all"
              placeholder="Search products, brands and more"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Carousel Section */}
        <section className="mt-2 relative">
          <div className="relative overflow-hidden rounded-3xl shadow-lg">
            {activeSlide === 0 ? (
              <div className="h-56 sm:h-72 md:h-80 bg-gradient-to-br from-[#b90041] via-[#d01552] to-[#df2457] relative flex items-center px-6 sm:px-12 text-white transition-all duration-500">
                <div className="relative z-10 max-w-sm">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 inline-block shadow-sm">
                    Flash Sale
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Plus_Jakarta_Sans'] leading-tight drop-shadow-sm">
                    UP TO 80% OFF
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-rose-50/90 leading-relaxed">
                    Curated ethnic wear, designer collections & festive must-haves.
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('flash');
                        }
                      }}
                      className="bg-white text-[#b90041] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-all hover:bg-rose-50 cursor-pointer"
                    >
                      Shop Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(1)}
                      className="text-white/80 hover:text-white text-xs font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      Next Offer →
                    </button>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 h-full w-3/5 sm:w-1/2 opacity-35 md:opacity-90 mix-blend-screen pointer-events-none">
                  <img
                    className="w-full h-full object-cover object-left-top"
                    alt="Festive collection"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN93jQ_xg0f6-zb955ibV_Vb2ULlDkhzoh7rBba28sFScTWcts5B8jpHC7NtiNzGHNpKedaH-un9MEt5W8QLlyc-8DRZe845t9OpyidNTC3c31yU08q_1eSgxokC3S-EUFIdI20bFmysBA9yl1WBRExCen1GgQwViLxACjnMTO3dwAWldb4zfUxOtAMqcj6ShvldTXqHqmr58GN8GVS4fFtQ04e6FhQzFO6xmhnB3GechbsrGchpdGqVEAUjcQN5CjVnyhiv2MxCg"
                  />
                </div>
              </div>
            ) : (
              <div className="h-56 sm:h-72 md:h-80 bg-gradient-to-br from-[#4d41df] via-[#5c50ea] to-[#675df9] relative flex items-center px-6 sm:px-12 text-white transition-all duration-500">
                <div className="relative z-10 max-w-sm">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 inline-block shadow-sm">
                    Reseller Program
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Plus_Jakarta_Sans'] leading-tight drop-shadow-sm">
                    BECOME A RESELLER
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                    Start your digital boutique today with zero investment and instant margins.
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('dropshipper-register');
                        }
                      }}
                      className="bg-white text-[#4d41df] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-all hover:bg-indigo-50 cursor-pointer"
                    >
                      Join Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(0)}
                      className="text-white/80 hover:text-white text-xs font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      ← Flash Sale
                    </button>
                  </div>
                </div>
                <div className="absolute right-4 md:right-12 bottom-0 top-0 flex items-center opacity-25 md:opacity-40 pointer-events-none">
                  <span className="material-symbols-outlined text-[160px] md:text-[220px]">
                    storefront
                  </span>
                </div>
              </div>
            )}

            {/* Slide Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={() => setActiveSlide(0)}
                className={`h-2 rounded-full transition-all ${activeSlide === 0 ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                aria-label="Slide 1"
              />
              <button
                type="button"
                onClick={() => setActiveSlide(1)}
                className={`h-2 rounded-full transition-all ${activeSlide === 1 ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                aria-label="Slide 2"
              />
            </div>
          </div>
        </section>

        {/* Category Grid / Horizontal Scroll */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black font-['Plus_Jakarta_Sans'] tracking-tight text-[#191c1e]">
                Browse Categories
              </h3>
              <p className="text-xs text-slate-500">Pick a department to filter live curation</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="text-[#FF3F6C] hover:text-[#b90041] font-bold text-xs transition-colors cursor-pointer"
            >
              {activeCategory === 'all' ? 'Showing All' : 'Reset Filter'}
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 sm:gap-6 py-2 pb-3 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform active:scale-95 focus:outline-none"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isActive
                        ? 'bg-[#b90041] text-white shadow-[#b90041]/30 scale-105 ring-4 ring-[#ffd9dc]'
                        : 'bg-[#f2f4f6] text-[#b90041] group-hover:bg-[#ffd9dc] group-hover:scale-105'
                      }`}
                  >
                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-tight transition-colors ${isActive ? 'text-[#b90041] font-bold' : 'text-slate-600 group-hover:text-[#191c1e]'
                      }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Grid */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 bg-[#FF3F6C] rounded-full"></div>
              <div>
                <h3 className="text-2xl font-black font-['Plus_Jakarta_Sans'] tracking-tight text-[#191c1e]">
                  Curated Picks
                </h3>
                <span className="text-xs text-slate-500">
                  {filteredProducts.length} high-margin trending products
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
              <span>Quality Inspected</span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 my-4">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">search_off</span>
              <h4 className="font-bold text-slate-700">No products found</h4>
              <p className="text-xs text-slate-400 mt-1">Try resetting your search query or category filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-[#b90041] text-white text-xs font-bold rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((prod) => {
                const isFav = favorites.has(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-3xl p-2.5 sm:p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div 
                      onClick={() => onNavigate && onNavigate('product')}
                      className="cursor-pointer"
                      title="View Product Details"
                    >
                      {/* Product Image Frame */}
                      <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-3 bg-slate-100">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={prod.title}
                          src={prod.imageUrl}
                          loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {prod.tag && (
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${prod.tag === 'NEW'
                                  ? 'bg-white/90 backdrop-blur-md text-[#191c1e]'
                                  : prod.tag === 'BESTSELLER'
                                    ? 'bg-[#4d41df] text-white'
                                    : 'bg-[#FF3F6C] text-white'
                                }`}
                            >
                              {prod.tag}
                            </span>
                          )}
                          <span className="bg-emerald-600/90 text-white backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 w-fit">
                            ★ {prod.rating}
                          </span>
                        </div>

                        {/* Heart / Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(prod.id, e)}
                          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 hover:bg-white transition-all cursor-pointer"
                          aria-label="Wishlist"
                        >
                          <span
                            className={`material-symbols-outlined text-lg transition-colors ${isFav ? 'text-[#b90041]' : 'text-slate-500'
                              }`}
                            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      {/* Details */}
                      <div className="px-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1 mb-1 group-hover:text-[#b90041] transition-colors">
                          {prod.title}
                        </h4>
                        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2.5 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-slate-900">
                            ₹{prod.price}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{prod.originalPrice}
                          </span>
                          <span className="text-[10px] font-bold text-[#FF3F6C]">
                            {prod.discount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reseller Margin & Share Action */}
                    <div className="mt-1">
                      <div
                        onClick={(e) => handleShare(prod, e)}
                        className="bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100 rounded-xl px-2.5 sm:px-3 py-2 flex items-center justify-between cursor-pointer transition-colors"
                        title="Click to share with customers"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-700 text-sm">
                            monetization_on
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 font-['Inter'] uppercase tracking-wider">
                            Earn ₹{prod.earnAmount}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900">
                          <span className="text-[10px] font-bold hidden sm:inline">Share</span>
                          <span className="material-symbols-outlined text-sm">share</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bento Grid Offer Section */}
        <section className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* The Reseller Club Card */}
            <div className="md:col-span-2 bg-[#F2F4F6] rounded-3xl p-6 sm:p-8 relative overflow-hidden group border border-slate-200/50 shadow-sm flex flex-col justify-between">
              <div className="relative z-10">
                <span className="bg-[#b90041]/10 text-[#b90041] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                  VIP Seller Community
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] text-[#191c1e] mb-2">
                  The Reseller Club
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                  Unlock exclusive discounts, personalized WhatsApp catalog links, and dedicated
                  account manager support for your business.
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Opening Reseller Club Benefits & Toolkit...')}
                  className="bg-[#FF3F6C] hover:bg-[#b90041] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 group-hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Learn More
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                </button>
              </div>

              <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-10 group-hover:scale-105 transition-transform duration-700 pointer-events-none flex items-end justify-end">
                <span className="material-symbols-outlined text-[160px] sm:text-[200px] text-[#b90041]">
                  groups
                </span>
              </div>
            </div>

            {/* Weekly Mission Card */}
            <div className="bg-[#4D41DF] rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white overflow-hidden relative group shadow-md">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-200">
                  Weekly Mission
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans'] mt-1">
                  Earn Bonus ₹5,000
                </h3>
              </div>

              <div className="relative z-10 my-4">
                <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
                  Complete 10 product shares today to unlock your silver tier booster badge.
                </p>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${(shareCount / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-indigo-200 mt-1.5 font-bold">
                  <span>{shareCount} of 10 shares completed</span>
                  <span>{shareCount >= 10 ? 'Unlocked! 🎉' : `${10 - shareCount} remaining`}</span>
                </div>
              </div>

              <div className="absolute -right-8 -top-8 opacity-20 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">payments</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FAB for Quick Resell Share */}
      <button
        type="button"
        onClick={() => {
          setShareCount((prev) => Math.min(10, prev + 1));
          showToast('Quick Share triggered! Progress recorded.');
        }}
        className="fixed right-5 bottom-24 w-14 h-14 bg-gradient-to-tr from-[#b90041] to-[#FF3F6C] text-white rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(185,0,65,0.4)] z-40 active:scale-90 hover:scale-105 transition-all cursor-pointer md:hidden"
        title="Quick Share"
      >
        <span className="material-symbols-outlined text-2xl">share</span>
      </button>

      {/* Universal Responsive Bottom Navigation Bar with Screens Navigator */}
      <AppBottomNav activeNav={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
