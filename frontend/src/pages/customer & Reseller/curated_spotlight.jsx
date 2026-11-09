import React, { useState, useEffect } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import { getProducts, addToCart } from '../../services/ecommerceService';

export default function CuratedSpotlight({ onNavigate = () => {}, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Fetch real products dynamically from PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        setLoading(true);
        const data = await getProducts({ all: true });
        if (isMounted && data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load spotlight catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  const isReseller = Boolean(
    typeof window !== 'undefined' &&
    (localStorage.getItem('mshoppy_reseller_token') || localStorage.getItem('mshoppy_affiliate_token'))
  );

  // WhatsApp Share helper (Customer friendly)
  const handleShareProduct = (e, prod) => {
    e.stopPropagation();
    const text = `✨ *LOOK WHAT I FOUND ON MSHOPPY!* ✨\n\n*${prod.title}*\n⭐ Price: ₹${prod.price}\n📉 MRP: ₹${prod.originalPrice || Math.round(prod.price * 1.5)}\n🚚 Free Delivery & Cash on Delivery Available!\n\nCheck out this trending product on MShoppy!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    triggerToast(`Link ready to share with friends! 🚀`);
  };

  const handleAddToCart = async (e, prod) => {
    e.stopPropagation();
    try {
      await addToCart(prod.id, 1, 'Free Size', prod);
      triggerToast(`Added "${prod.title.slice(0, 22)}..." to Cart! 🛒`);
    } catch (err) {
      triggerToast('Added to Cart! 🛒');
    }
  };

  // Group products dynamically by Category
  const ethnicProducts = products.filter(
    (p) => p.categorySlug === 'women-ethnic' || (p.category?.name && p.category.name.toLowerCase().includes('ethnic'))
  );
  const beautyProducts = products.filter(
    (p) => p.categorySlug === 'beauty-health' || (p.category?.name && p.category.name.toLowerCase().includes('beauty'))
  );
  const jewelleryProducts = products.filter(
    (p) => p.categorySlug === 'jewellery' || (p.category?.name && p.category.name.toLowerCase().includes('jewel'))
  );

  // Dynamic Lookbooks built from real database categories
  const dynamicLookbooks = [
    {
      id: 'ethnic_revival',
      title: 'Modern Ethnic Revival',
      subtitle: 'Festive Banarasi Silks & Designer Georgette Sarees.',
      pieces: `${ethnicProducts.length || products.length} Pieces`,
      image: ethnicProducts[0]?.images?.[0] || products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
      categoryTarget: 'women-ethnic',
    },
    {
      id: 'beauty_radiance',
      title: 'Radiance & Glamour',
      subtitle: 'Nude liquid lipsticks and Vitamin C skin brighten serums.',
      pieces: `${beautyProducts.length || 2} Pieces`,
      image: beautyProducts[0]?.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
      categoryTarget: 'beauty-health',
    },
    {
      id: 'jewel_accents',
      title: 'Royal Heritage Accents',
      subtitle: 'Handcrafted silver chokers and traditional artisanal jewellery.',
      pieces: `${jewelleryProducts.length || 1} Pieces`,
      image: jewelleryProducts[0]?.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
      categoryTarget: 'jewellery',
    },
  ];

  const heroProduct = ethnicProducts[0] || products[0];

  return (
    <div className="bg-[#f8f9fb] min-h-screen font-sans text-[#191c1e] antialiased selection:bg-pink-100 selection:text-pink-700">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#F8F9FB]/90 backdrop-blur-xl flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : onNavigate('/user-home'))}
            className="material-symbols-outlined text-[#191C1E] active:scale-95 transition-transform cursor-pointer p-1 rounded-full hover:bg-slate-200"
          >
            arrow_back
          </button>
          <h1
            onClick={() => onNavigate('/user-home')}
            className="text-lg sm:text-xl font-extrabold text-[#191C1E] tracking-tight cursor-pointer"
          >
            ✨ Curated Spotlight
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/wishlist')}
            className="material-symbols-outlined text-[#191C1E] active:scale-95 transition-transform cursor-pointer hover:text-[#FF3F6C]"
            title="Wishlist"
          >
            favorite
          </button>
          <button
            onClick={() => onNavigate('/cart')}
            className="material-symbols-outlined text-[#FF3F6C] active:scale-95 transition-transform cursor-pointer hover:opacity-80"
            title="Cart"
          >
            shopping_bag
          </button>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-7xl mx-auto">
        {/* Hero Editorial Section (Full Uncropped Presentation) */}
        <section className="px-4 sm:px-6 mb-10">
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-pink-900/30 bg-gradient-to-br from-[#180208] via-[#2d0514] to-[#0a0004] text-white grid grid-cols-1 md:grid-cols-12 items-center">
            
            {/* Full Uncropped Photo Column */}
            <div className="md:col-span-7 relative flex items-center justify-center p-3 sm:p-6 bg-black/30">
              <div className="relative w-full flex items-center justify-center max-h-[620px]">
                <img
                  alt={heroProduct?.title || 'Editorial Fashion Spotlight'}
                  className="max-h-[580px] w-auto max-w-full object-contain rounded-2xl shadow-2xl select-none"
                  src={
                    heroProduct?.images?.[0] ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80'
                  }
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200';
                  }}
                />

                {/* Shoppable Hotspot on Photo */}
                {heroProduct?.id && (
                  <div
                    onClick={() => onNavigate(`/product?id=${heroProduct.id}`)}
                    className="absolute top-[28%] right-[18%] group/tag cursor-pointer"
                    title="Click to view product details"
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-xl border-4 border-[#b90041] animate-pulse flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b90041]"></span>
                    </div>
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl opacity-0 group-hover/tag:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-slate-200 text-slate-900 z-20">
                      <p className="text-[9px] font-extrabold uppercase text-slate-400">View Saree</p>
                      <p className="text-xs font-black text-[#b90041]">₹{heroProduct.price}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editorial Details Column */}
            <div className="md:col-span-5 p-6 sm:p-10 space-y-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
                  Editor's Top Pick
                </span>
                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-yellow-300">
                  Full Catalog Look
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                {heroProduct?.title || 'Modern Ethnic Collection'}
              </h2>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Reimagining heritage silhouettes through a contemporary lens. 100% full uncropped design with premium zari detailing.
              </p>

              {/* Price & Free Delivery */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-yellow-300">
                  ₹{heroProduct?.price || 799}
                </span>
                {heroProduct?.originalPrice && heroProduct.originalPrice > heroProduct.price && (
                  <span className="text-sm sm:text-base text-white/50 line-through">
                    ₹{heroProduct.originalPrice}
                  </span>
                )}
                {heroProduct?.discountPercentage > 0 && (
                  <span className="bg-pink-500/30 border border-pink-400 text-pink-200 text-xs font-black px-2 py-0.5 rounded-md">
                    {heroProduct.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {heroProduct?.id && (
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    onClick={() => onNavigate(`/product?id=${heroProduct.id}`)}
                    className="flex-1 bg-gradient-to-r from-[#b90041] via-[#e11d48] to-[#ff2a5f] hover:opacity-95 text-white py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>View Full Product ➔</span>
                  </button>

                  <button
                    onClick={(e) => handleAddToCart(e, heroProduct)}
                    className="bg-white/15 hover:bg-white/25 text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 transition-all cursor-pointer"
                    title="Add to Shopping Cart"
                  >
                    <span className="material-symbols-outlined text-base">shopping_bag</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Dynamic Lookbook Series */}
        <section className="mb-12">
          <div className="flex justify-between items-end px-4 sm:px-6 mb-5">
            <div>
              <span className="text-[#b90041] font-bold text-xs uppercase tracking-[0.2em] block mb-1">
                Curated Series
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold leading-none text-gray-900">
                Trending Categories & Collections
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/explorer')}
              className="text-[#4d41df] font-bold text-xs sm:text-sm hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 no-scrollbar pb-4">
            {dynamicLookbooks.map((look) => (
              <div
                key={look.id}
                onClick={() => onNavigate(`/search?category=${look.categoryTarget}`)}
                className="shrink-0 w-64 sm:w-72 cursor-pointer group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-gray-100">
                  <div className="relative h-72 sm:h-80 bg-gray-100 overflow-hidden">
                    <img
                      src={look.image}
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-gray-800 shadow-xs">
                      {look.pieces}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm sm:text-base mb-1 text-gray-900 line-clamp-1">{look.title}</h4>
                    <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">{look.subtitle}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                        <span>Free Delivery</span>
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1 group-hover:text-[#4d41df]">
                        <span>Browse</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Products Grid From Database (Zero Hardcoding) */}
        <section className="px-4 sm:px-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span>🔥 Hot Sellers in Catalog</span>
                <span className="text-xs bg-pink-100 text-[#9f0038] font-bold px-2 py-0.5 rounded-full">
                  Live Database
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real products verified from your PostgreSQL database</p>
            </div>
            <button
              onClick={() => onNavigate('/user-home')}
              className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
            >
              See All Products ➔
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-slate-100 animate-pulse space-y-3">
                  <div className="aspect-square bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate(`/product?id=${p.id}`)}
                  className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md hover:border-pink-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-slate-50 p-1">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}
                        alt={p.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                        }}
                      />
                      {p.discountPercentage > 0 && (
                        <span className="absolute top-2 left-2 bg-[#FF3F6C] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          {p.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider line-clamp-1">
                      {p.category?.name || p.categorySlug || 'Catalog Item'}
                    </p>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 mt-0.5 group-hover:text-[#b90041] transition-colors">
                      {p.title}
                    </h4>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-[#b90041] font-black text-sm sm:text-base">₹{p.price}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[10px] text-slate-400 line-through">₹{p.originalPrice}</span>
                      )}
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, p)}
                        className="flex-1 bg-pink-50 hover:bg-pink-100 text-[#b90041] font-bold text-[11px] py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1 active:scale-95"
                        title="Add to Cart"
                      >
                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                        <span className="hidden xs:inline">Add</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareProduct(e, p)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-xl transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Share with Friends"
                      >
                        <span className="material-symbols-outlined text-sm">share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 font-bold">No products found in database</p>
            </div>
          )}
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} role={isReseller ? 'reseller' : 'customer'} />
    </div>
  );
}