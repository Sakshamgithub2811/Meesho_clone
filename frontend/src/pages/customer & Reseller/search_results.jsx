import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getProducts,
  getCategories,
  addToCart,
  toggleWishlist,
  getCart,
  getWishlist
} from '../../services/ecommerceService';

export default function SearchResults({ onNavigate, onBack }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Load products from database matching query & filters
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods, cart, wish] = await Promise.all([
          getCategories(),
          getProducts({
            search: searchQuery,
            category: activeFilter === 'All' ? '' : activeFilter,
            sort: selectedSort
          }),
          getCart(),
          getWishlist()
        ]);

        if (isMounted) {
          if (cats) setDbCategories(cats);
          if (prods) setProducts(prods);
          if (cart?.totalItems !== undefined) setCartCount(cart.totalItems);
          if (wish) setWishlist(new Set(wish.map(w => w.productId)));
        }
      } catch (e) {
        console.error('Failed to load search results:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [searchQuery, activeFilter, selectedSort]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchParams({ q });
    } else {
      setSearchParams({});
    }
  };

  const handleToggleWishlist = async (e, id) => {
    e.stopPropagation();
    try {
      await toggleWishlist(id);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          triggerToast('Removed from Wishlist');
        } else {
          next.add(id);
          triggerToast('Added to Wishlist ❤️');
        }
        return next;
      });
    } catch (err) {
      triggerToast('Updated Wishlist');
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1, product.sizes?.[0] || 'Free Size');
      setCartCount(c => c + 1);
      triggerToast(`Added "${product.title.slice(0, 20)}..." to Cart! 🛒`);
    } catch (err) {
      triggerToast('Added to Cart! 🛒');
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-sans antialiased pb-32">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : handleNav('/user-home'))}
            className="p-2 rounded-full hover:bg-slate-100 active:scale-95 text-[#191C1E] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>

          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and more..."
              className="w-full bg-[#f2f4f6] border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3F6C]"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF3F6C]"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </form>

          <button
            onClick={() => handleNav('/cart')}
            className="p-2 rounded-full hover:bg-slate-100 text-[#191C1E] active:scale-95 cursor-pointer relative"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#FF3F6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter & Sort Bar */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar border-t border-slate-50 text-xs">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-bold transition-colors cursor-pointer ${
                activeFilter === 'All'
                  ? 'bg-[#FF3F6C] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {dbCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveFilter(c.name)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-bold transition-colors cursor-pointer ${
                  activeFilter === c.name
                    ? 'bg-[#FF3F6C] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400 font-semibold text-[11px]">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'} ({products.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400 font-semibold">Searching products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            <h3 className="font-bold text-base text-slate-800">No matching products found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We couldn't find any products matching your search term. Try a different keyword or browse all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="mt-2 bg-[#FF3F6C] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer"
            >
              Clear Search &amp; View All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => {
              const isFav = wishlist.has(p.id);
              const img = p.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div
                    onClick={() => handleNav(`/product?id=${p.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 bg-slate-100">
                      <img
                        src={img}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {p.rating > 0 && (
                        <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-800 flex items-center gap-0.5 shadow-sm">
                          <span className="text-amber-500 font-bold text-xs">★</span> {p.rating}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleToggleWishlist(e, p.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer hover:bg-white"
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${isFav ? 'text-[#FF3F6C]' : 'text-slate-400'}`}
                          style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 mb-1.5 leading-snug">
                      {p.title}
                    </h3>

                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{p.originalPrice}
                        </span>
                      )}
                      {p.discountPercentage > 0 && (
                        <span className="text-[11px] font-bold text-[#FF3F6C]">
                          {p.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, p)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AppBottomNav activeNav="search" onNavigate={handleNav} />
    </div>
  );
}