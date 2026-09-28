import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    margin: 65,
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
    margin: 120,
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
    margin: 35,
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
    margin: 180,
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
    margin: 220,
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
    margin: 280,
    tag: "TOP BRAND",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
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

export default function HomeUserReseller() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([1]);
  const [activeNav, setActiveNav] = useState("home");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || 
      (selectedCategory.toLowerCase() === "brands" || selectedCategory.toLowerCase() === "brand"
        ? (p.category.toLowerCase() === "brands" || p.category.toLowerCase() === "brand" || !!p.brand)
        : p.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="relative w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
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
            <span 
              onClick={() => navigate('/reseller-home')}
              className="text-base sm:text-xl md:text-2xl font-black text-[#FF3F6C] font-headline tracking-tight cursor-pointer whitespace-nowrap"
            >
              The Digital Curator
            </span>
          </div>

          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary transition-all text-sm outline-none" 
                placeholder="Search for products..." 
                type="text" 
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/notifications')} className="text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button onClick={() => navigate('/cart')} className="text-[#191C1E] dark:text-slate-200 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" title="Shopping Cart">
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32">
        {/* Mobile Search Anchor */}
        <div className="md:hidden pt-2 pb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
              placeholder="Search products, brands and more" 
              type="text" 
            />
          </div>
        </div>

        {/* Hero Carousel Section */}
        <section className="mt-2 relative group">
          <div 
            ref={bannerRef}
            onScroll={handleBannerScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-2 scroll-smooth"
          >
            {/* Card 1: Flash Sale (Pink / Magenta) */}
            <div 
              onClick={() => navigate('/flash')}
              className="min-w-[85%] md:min-w-[100%] snap-center shrink-0 cursor-pointer"
            >
              <div className="h-48 md:h-80 rounded-3xl bg-gradient-to-br from-primary to-primary-container relative overflow-hidden flex items-center px-8 text-white">
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
                    className="mt-6 bg-white text-primary px-6 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform hover:bg-opacity-95 cursor-pointer"
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

            {/* Card 2: Become a Reseller (Blue / Purple) */}
            <div 
              onClick={() => navigate('/dropshipper-register')}
              className="min-w-[85%] md:min-w-[100%] snap-center shrink-0 cursor-pointer"
            >
              <div className="h-48 md:h-80 rounded-3xl bg-gradient-to-br from-secondary to-secondary-container relative overflow-hidden flex items-center px-8 text-white">
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
                    className="mt-6 bg-white text-secondary px-6 py-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform hover:bg-opacity-95 cursor-pointer"
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
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === 0 ? 'w-6 bg-primary' : 'w-2 bg-gray-300'}`} 
              aria-label="Slide 1: Flash Sale"
            />
            <button 
              onClick={() => scrollToSlide(1)} 
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === 1 ? 'w-6 bg-secondary' : 'w-2 bg-gray-300'}`} 
              aria-label="Slide 2: Become a Reseller"
            />
          </div>
        </section>


        {/* Category Carousel */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg text-on-surface">Categories</h3>
            <button onClick={() => navigate('/explorer')} className="text-primary text-xs font-bold font-label uppercase tracking-wider cursor-pointer">See All</button>
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
                    : 'bg-surface-container-high group-hover:bg-primary-fixed text-on-surface-variant'
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
            <span className="text-xs text-on-surface-variant font-medium">{filteredProducts.length} items</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-8">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-2">inventory_2</span>
                <p className="text-sm font-semibold text-on-surface">No products found in {selectedCategory}</p>
                <p className="text-xs text-on-surface-variant mt-1">Explore other categories or check back soon for new arrivals.</p>
                <button 
                  onClick={() => setSelectedCategory("All")} 
                  className="mt-4 px-4 py-2 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
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
                    className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div onClick={() => navigate('/product')} className="cursor-pointer" title="View Product Details">
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
                            className={`material-symbols-outlined text-sm ${isFav ? 'text-primary' : 'text-on-surface-variant'}`}
                            style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      <div className="px-1 min-w-0">
                        {p.brand && (
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5 truncate">
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

                    <div 
                      onClick={() => navigate('/share-earn-config')}
                      className="bg-tertiary-container/10 border border-tertiary/10 rounded-xl px-3 py-1.5 flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-tertiary font-label uppercase tracking-wider">Earn ₹{p.margin}</span>
                      <span className="material-symbols-outlined text-[16px] text-tertiary">share</span>
                    </div>
                  </div>
                );
              })
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
                  onClick={() => navigate('/community-hub')}
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


      {/* Responsive Universal Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
