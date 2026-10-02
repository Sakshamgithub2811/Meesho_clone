import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';

export default function SearchResults({ onNavigate = () => {}, onBack }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery || 'Kurta');
  const [selectedSort, setSelectedSort] = useState('Popularity');
  const [activeFilter, setActiveFilter] = useState('All');
  const [wishlist, setWishlist] = useState(new Set([1, 4]));
  const [cartCount, setCartCount] = useState(2);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSearchSubmit = (override) => {
    const q = (override !== undefined ? override : searchQuery).trim();
    if (q) {
      setSearchParams({ q });
    } else {
      setSearchParams({});
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
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
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    setCartCount((c) => c + 1);
    triggerToast(`Added "${product.title}" to Cart! 🛒`);
  };

  const shareToWhatsapp = (e, product) => {
    e.stopPropagation();
    const msg = encodeURIComponent(
      `🛍️ *${product.title}*\n\n` +
      `✨ *Special Offer Price:* ₹${product.price} (${product.discount})\n` +
      `⭐ *Rating:* ${product.rating} (${product.reviews} reviews)\n` +
      `🚚 Free Shipping & Cash on Delivery Available!\n\n` +
      `👉 *Order Here:* ${window.location.origin}/product`
    );
    triggerToast(`Opening WhatsApp to share "${product.title}"... 🚀`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const products = [
    {
      id: 1,
      title: 'Embroidered Silk Kurta',
      price: 1249,
      originalPrice: 2499,
      discount: '50% OFF',
      rating: 4.2,
      reviews: '1.2k',
      resellMargin: 150,
      badge: 'Bestseller',
      category: 'Silk',
      image:
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Botanical Chiffon Set',
      price: 2199,
      originalPrice: 4399,
      discount: '50% OFF',
      rating: 4.8,
      reviews: '840',
      resellMargin: 250,
      badge: 'Luxe Pick',
      category: 'Chiffon',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Vintage Rose Cotton Kurta',
      price: 899,
      originalPrice: 1799,
      discount: '50% OFF',
      rating: 4.5,
      reviews: '3.1k',
      resellMargin: 80,
      badge: 'Trending',
      category: 'Cotton',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Midnight Bloom Anarkali Kurta',
      price: 1599,
      originalPrice: 3199,
      discount: '50% OFF',
      rating: 4.0,
      reviews: '450',
      resellMargin: 180,
      badge: 'Festive Special',
      category: 'Anarkali',
      image:
        'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      title: 'Pastel Lilac Georgette Kurti',
      price: 1099,
      originalPrice: 2199,
      discount: '50% OFF',
      rating: 4.7,
      reviews: '1.9k',
      resellMargin: 130,
      badge: 'High Margin',
      category: 'Georgette',
      image:
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      title: 'Handblock Printed Kurta Set',
      price: 1399,
      originalPrice: 2799,
      discount: '50% OFF',
      rating: 4.6,
      reviews: '620',
      resellMargin: 190,
      badge: 'Artisan',
      category: 'Cotton',
      image:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 7,
      title: 'Classic Banarasi Brocade Saree',
      price: 1899,
      originalPrice: 3499,
      discount: '45% OFF',
      rating: 4.9,
      reviews: '2.4k',
      resellMargin: 350,
      badge: 'Top Rated',
      category: 'Silk',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 8,
      title: 'Luxe Chiffon Embroidered Dupatta Suit Kurta',
      price: 1699,
      originalPrice: 3299,
      discount: '48% OFF',
      rating: 4.4,
      reviews: '710',
      resellMargin: 220,
      badge: 'New Arrival',
      category: 'Chiffon',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    }
  ];

  const filterOptions = ['All', 'Under ₹1000', 'Silk', 'Cotton', 'Chiffon', 'High Margin'];

  const normalize = (text) => (text || '').toLowerCase().replace(/kurtas?|kurti/g, 'kurt').replace(/sarees?/g, 'saree').trim();

  const filteredProducts = products.filter((p) => {
    const q = normalize(searchQuery);
    const matchesSearch = !q || 
      normalize(p.title).includes(q) || 
      normalize(p.category).includes(q) || 
      normalize(p.badge).includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'Under ₹1000') return p.price < 1000;
    if (activeFilter === 'Silk') return p.category === 'Silk';
    if (activeFilter === 'Cotton') return p.category === 'Cotton';
    if (activeFilter === 'Chiffon') return p.category === 'Chiffon';
    if (activeFilter === 'High Margin') return p.resellMargin >= 180;
    return true;
  }).sort((a, b) => {
    if (selectedSort === 'Price: Low to High') return a.price - b.price;
    if (selectedSort === 'Price: High to Low') return b.price - a.price;
    if (selectedSort === 'Rating') return b.rating - a.rating;
    return 0; // Popularity
  });

  return (
    <div className="bg-[#f8f9fb] min-h-screen text-[#191c1e] font-sans antialiased selection:bg-rose-100 selection:text-rose-600">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('reseller'))}
              className="hover:bg-slate-100 transition-colors rounded-full p-2 active:scale-95 duration-150 cursor-pointer text-[#FF3F6C]"
              title="Go Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span
              onClick={() => onNavigate('reseller')}
              className="font-black text-xl tracking-tight text-[#FF3F6C] cursor-pointer hidden sm:inline"
            >
              Meesho
            </span>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="bg-[#f2f4f6] hover:bg-slate-200/60 focus-within:bg-white flex items-center px-3.5 py-1.5 rounded-full gap-2 border border-transparent focus-within:border-pink-300 transition-all shadow-inner"
            >
              <button 
                type="submit"
                className="text-slate-400 hover:text-[#FF3F6C] flex items-center cursor-pointer transition-colors"
                title="Search"
                aria-label="Submit search"
              >
                <span className="material-symbols-outlined text-lg">search</span>
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="Search sarees, kurtas, western dresses, jewelry..."
                className="w-full bg-transparent text-xs md:text-sm font-medium text-[#191c1e] focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('wishlist')}
              className="hover:bg-slate-100 transition-colors rounded-full p-2 active:scale-95 duration-150 cursor-pointer text-slate-700 hidden sm:flex"
              title="Wishlist"
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="hover:bg-slate-100 transition-colors rounded-full p-2 active:scale-95 duration-150 cursor-pointer relative text-[#FF3F6C]"
              title="Shopping Bag"
            >
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#FF3F6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Horizontal Filters Bar */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex overflow-x-auto gap-2 no-scrollbar items-center py-1">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center gap-1 px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF3F6C] text-white shadow-md shadow-pink-500/20'
                      : 'bg-[#f2f4f6] text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {filteredProducts.length} Results
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-[#f2f4f6] border-none text-slate-700 text-xs font-bold py-1.5 px-3 rounded-full focus:outline-none cursor-pointer"
            >
              <option value="Popularity">Sort: Popularity</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Rating">Highest Rated</option>
            </select>
          </div>
        </section>

        {/* Product Grid: 2 cols on mobile, 3 on md, 4 on lg, 5 on xl */}
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm my-4">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">search_off</span>
            <h3 className="text-base font-bold text-slate-800">No products found matching "{searchQuery}"</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              We couldn't find any items matching your search. Try checking your spelling or search for popular terms below.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['Kurta', 'Kurti', 'Saree', 'Anarkali', 'Cotton', 'Silk', 'Chiffon'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearchSubmit(tag);
                  }}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF3F6C] transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
                setActiveFilter('All');
              }}
              className="mt-4 text-xs font-bold text-slate-600 hover:text-[#FF3F6C] underline cursor-pointer"
            >
              Clear all filters & see all products
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const isFav = wishlist.has(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onNavigate('product')}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-pink-200 group transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all"
                      title="Add to Wishlist"
                    >
                      <span
                        className={`material-symbols-outlined text-lg ${
                          isFav ? 'text-[#FF3F6C]' : 'text-slate-400'
                        }`}
                        style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        favorite
                      </span>
                    </button>

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute bottom-2 left-2 bg-[#FF3F6C]/90 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[9px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className="material-symbols-outlined text-amber-400 text-xs"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-[10.5px] font-extrabold text-[#191c1e]">
                          {product.rating}
                        </span>
                        <span className="text-[10px] text-slate-400">({product.reviews})</span>
                      </div>

                      <h3 className="text-xs md:text-sm font-bold text-[#191c1e] line-clamp-1 leading-tight mb-1 group-hover:text-[#FF3F6C] transition-colors">
                        {product.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mb-2.5">
                        <span className="text-sm md:text-base font-extrabold text-[#191c1e]">
                          ₹{product.price}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                        <span className="text-[10px] font-bold text-[#FF3F6C]">
                          {product.discount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {/* Resell Margin Highlight (WhatsApp Redirect) */}
                      <div
                        onClick={(e) => shareToWhatsapp(e, product)}
                        title="Share product with margin on WhatsApp"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl py-1.5 px-2.5 flex items-center justify-between cursor-pointer transition-colors border border-emerald-100"
                      >
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-emerald-700 text-sm">
                            payments
                          </span>
                          <span className="text-[9.5px] font-extrabold uppercase tracking-tight">
                            Resell & Earn ₹{product.resellMargin}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-emerald-700 text-sm">
                          share
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => addToCart(e, product)}
                        className="w-full bg-[#FF3F6C] hover:bg-[#e02659] active:scale-95 text-white py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="categories" onNavigate={onNavigate} />
    </div>
  );
}