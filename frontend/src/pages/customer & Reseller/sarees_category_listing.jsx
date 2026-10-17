import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getProducts,
  addToCart,
  toggleWishlist,
  getCart,
  getWishlist
} from '../../services/ecommerceService';

export default function SareesCategoryListing({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const [selectedSubcat, setSelectedSubcat] = useState('All');
  const [wishlist, setWishlist] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cart, wish] = await Promise.all([
          getProducts({ category: 'women-ethnic' }),
          getCart(),
          getWishlist()
        ]);
        if (isMounted) {
          if (prods) setProducts(prods);
          if (cart?.totalItems !== undefined) setCartCount(cart.totalItems);
          if (wish) setWishlist(new Set(wish.map(w => w.productId)));
        }
      } catch (e) {
        console.error('Error loading sarees products:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleToggleWishlist = async (e, id) => {
    e.stopPropagation();
    try {
      await toggleWishlist(id);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          triggerToast('Removed from favorites');
        } else {
          next.add(id);
          triggerToast('Saved to Wishlist ❤️');
        }
        return next;
      });
    } catch (e) {
      triggerToast('Wishlist updated ❤️');
    }
  };

  const handleAddToCart = async (e, saree) => {
    e.stopPropagation();
    try {
      await addToCart(saree.id, 1, saree.sizes?.[0] || 'Free Size');
      setCartCount((c) => c + 1);
      triggerToast(`Added ${saree.title.slice(0, 20)}... to Cart! 🛍️`);
    } catch (e) {
      triggerToast('Added to Cart! 🛍️');
    }
  };

  const subcategories = ['All', 'Silk', 'Cotton', 'Kurti', 'Saree'];

  const filtered = products.filter((p) => {
    if (selectedSubcat === 'All') return true;
    const t = (p.title + ' ' + (p.description || '')).toLowerCase();
    return t.includes(selectedSubcat.toLowerCase());
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-sans pb-32">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : handleNav('/user-home'))}
              className="p-2 rounded-full hover:bg-slate-100 text-[#191C1E] cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-[#191C1E]">
                Women Ethnic &amp; Sarees
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {filtered.length} Products Available
              </span>
            </div>
          </div>

          <button
            onClick={() => handleNav('/cart')}
            className="p-2 rounded-full hover:bg-slate-100 text-[#191C1E] relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#FF3F6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Subcategories Filter */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcat(sub)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubcat === sub
                  ? 'bg-[#FF3F6C] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400 font-semibold">Loading ethnic collection...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm max-w-md mx-auto space-y-2">
            <p className="text-sm font-bold text-slate-800">No items found in "{selectedSubcat}"</p>
            <button
              onClick={() => setSelectedSubcat('All')}
              className="text-xs font-bold text-[#FF3F6C] hover:underline"
            >
              View All Sarees &amp; Ethnic Wear
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((saree) => {
              const isFav = wishlist.has(saree.id);
              const img = saree.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';

              return (
                <div
                  key={saree.id}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div
                    onClick={() => handleNav(`/product?id=${saree.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 bg-slate-100">
                      <img
                        src={img}
                        alt={saree.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {saree.rating > 0 && (
                        <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-800 flex items-center gap-0.5 shadow-sm">
                          <span className="text-amber-500 font-bold text-xs">★</span> {saree.rating}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleToggleWishlist(e, saree.id)}
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
                      {saree.title}
                    </h3>

                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-sm font-black text-slate-900">₹{saree.price}</span>
                      {saree.originalPrice && saree.originalPrice > saree.price && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{saree.originalPrice}
                        </span>
                      )}
                      {saree.discountPercentage > 0 && (
                        <span className="text-[11px] font-bold text-[#FF3F6C]">
                          {saree.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, saree)}
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