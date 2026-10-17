import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getWishlist,
  toggleWishlist,
  addToCart,
  getCart
} from '../../services/ecommerceService';

export default function UserWishlist({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const loadData = async () => {
    try {
      const [wishRes, cartRes] = await Promise.all([
        getWishlist(),
        getCart()
      ]);

      if (wishRes) setWishlistItems(wishRes);
      if (cartRes?.totalItems !== undefined) setCartCount(cartRes.totalItems);
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
      setWishlistItems(prev => prev.filter(w => w.productId !== productId));
      triggerToast('Item removed from Wishlist');
    } catch (e) {
      triggerToast('Item removed from Wishlist');
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      await addToCart(item.productId, 1, item.product?.sizes?.[0] || 'Free Size');
      await toggleWishlist(item.productId);
      setWishlistItems(prev => prev.filter(w => w.productId !== item.productId));
      setCartCount(c => c + 1);
      triggerToast(`Moved "${item.product?.title?.slice(0, 20)}..." to Cart! 🛒`);
    } catch (e) {
      triggerToast('Moved to Cart! 🛒');
    }
  };

  const filteredItems = wishlistItems.filter((item) => {
    const prod = item.product || {};
    const title = (prod.title || '').toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-sans antialiased pb-32">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : handleNav('/user-home'))}
              className="p-2 rounded-full hover:bg-slate-100 active:scale-95 text-[#191C1E] cursor-pointer transition-colors"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-[#191C1E]">
                My Wishlist
              </h1>
              {wishlistItems.length > 0 && (
                <span className="bg-pink-50 text-[#FF3F6C] font-black text-xs px-2.5 py-0.5 rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleNav('/cart')}
            className="p-2 rounded-full hover:bg-slate-100 text-[#191C1E] active:scale-95 cursor-pointer relative"
            title="Cart"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#FF3F6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400 font-semibold">Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto space-y-4 my-8">
            <div className="w-20 h-20 bg-pink-50 text-[#FF3F6C] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-4xl">favorite</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#191c1e]">Your Wishlist is Empty</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Save your favorite fashion items, electronics, and essentials to buy later!
              </p>
            </div>
            <button
              onClick={() => handleNav('/user-home')}
              className="bg-[#FF3F6C] hover:bg-[#e02659] text-white px-6 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-pink-500/25 active:scale-95 transition-transform cursor-pointer uppercase tracking-wider"
            >
              Explore Products ➔
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-lg text-slate-900">
                Saved Items ({filteredItems.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredItems.map((item) => {
                const prod = item.product || {};
                const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Delete */}
                      <div
                        onClick={() => handleNav(`/product?id=${prod.id}`)}
                        className="aspect-[3/4] rounded-xl overflow-hidden relative mb-3 bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={img}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(item.productId);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-red-500 shadow-sm hover:bg-white active:scale-90 transition-transform cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>

                      {/* Title & Price */}
                      <h3
                        onClick={() => handleNav(`/product?id=${prod.id}`)}
                        className="text-xs font-semibold text-slate-800 line-clamp-2 mb-1.5 cursor-pointer hover:text-[#FF3F6C]"
                      >
                        {prod.title}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-sm font-black text-slate-900">₹{prod.price}</span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{prod.originalPrice}
                          </span>
                        )}
                        {prod.discountPercentage > 0 && (
                          <span className="text-[11px] font-bold text-[#FF3F6C]">
                            {prod.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Move to Cart CTA */}
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2.5 bg-[#FF3F6C] hover:bg-[#e02659] text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">shopping_cart</span>
                      <span>Move to Cart</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <AppBottomNav activeNav="home" onNavigate={handleNav} />
    </div>
  );
}