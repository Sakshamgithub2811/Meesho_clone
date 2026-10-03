import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

export default function HomeScreenFlutterLuxe({ onNavigate = () => {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Sarees');
  const [activeTab, setActiveTab] = useState('Home');

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
    { name: 'Sarees', icon: 'dry_cleaning', target: 'sarees' },
    { name: 'Kurtis', icon: 'apparel', target: 'sarees' },
    { name: 'Western', icon: 'styler', target: 'western' },
    { name: 'Jewellery', icon: 'diamond', target: 'explorer' },
    { name: 'Home', icon: 'home', target: 'explorer' },
    { name: 'Beauty', icon: 'face_3', target: 'explorer' },
  ];

  const products = [
    {
      id: 1,
      title: 'Embroidered Silk Saree',
      price: 999,
      originalPrice: 1999,
      discount: '50% OFF',
      margin: 150,
      rating: '4.2',
      reviews: '1.5k',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Floral Printed Kurti',
      price: 649,
      originalPrice: 1299,
      discount: '50% OFF',
      margin: 120,
      rating: '4.5',
      reviews: '2k',
      image:
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Casual Western Co-ord',
      price: 1249,
      originalPrice: 2499,
      discount: '50% OFF',
      margin: 200,
      rating: '4.0',
      reviews: '850',
      image:
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Gold-Plated Choker Set',
      price: 499,
      originalPrice: 999,
      discount: '50% OFF',
      margin: 80,
      rating: '4.8',
      reviews: '3k',
      image:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="bg-[#F8F9FB] min-h-screen font-sans text-[#191C1E] antialiased selection:bg-pink-100 selection:text-pink-700">
      {/* TopAppBar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#F8F9FB]/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('reseller')}
            className="material-symbols-outlined text-pink-600 cursor-pointer"
          >
            arrow_back
          </button>
          <div
            onClick={() => onNavigate('reseller')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img 
              src="/mshoppy-logo.png" 
              alt="MShoppy" 
              className="w-8 h-8 rounded-xl object-contain shadow-xs" 
            />
            <span className="font-extrabold italic text-2xl tracking-tight text-pink-600">
              MShoppy Luxe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div onClick={() => onNavigate('wishlist')} className="relative cursor-pointer">
            <span className="material-symbols-outlined text-pink-600">favorite</span>
          </div>
          <div onClick={() => onNavigate('cart')} className="relative cursor-pointer">
            <span className="material-symbols-outlined text-pink-600">shopping_cart</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b90041] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[#F8F9FB]">
              3
            </span>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-32 max-w-7xl mx-auto">
        {/* Search Field */}
        <section className="px-6 mb-8">
          <div className="flex items-center bg-[#e7e8ea] rounded-2xl px-4 py-3 gap-3 shadow-2xs">
            <span
              onClick={handleSearch}
              className="material-symbols-outlined text-gray-400 cursor-pointer"
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent border-none focus:outline-none w-full text-gray-800 placeholder-gray-400 font-medium text-sm"
              placeholder="Search ethnic wear, kurtis, sarees... (Press Enter)"
            />
            <span
              onClick={() => onNavigate('explorer')}
              className="material-symbols-outlined text-[#b90041] cursor-pointer"
            >
              tune
            </span>
          </div>
        </section>

        {/* Categories Horizontal Scroll */}
        <section className="mb-10">
          <div className="flex overflow-x-auto no-scrollbar px-6 gap-6">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    onNavigate(cat.target);
                  }}
                  className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                      isSelected
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-[#e7e8ea] text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-pink-600 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Promotional Banners Slider */}
        <section className="px-6 mb-10">
          <div
            onClick={() => onNavigate('flash')}
            className="relative overflow-hidden rounded-3xl h-52 sm:h-64 bg-[#b90041] shadow-lg cursor-pointer group"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              alt="Silk Saree Mega Sale"
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center p-8">
              <span className="bg-[#b90041] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-xs">
                Limited Offer
              </span>
              <h2 className="text-white font-extrabold text-2xl sm:text-4xl leading-tight mb-1">
                Flash Mega Sale: Up to 70% Off ⚡
              </h2>
              <p className="text-white/90 font-medium text-xs sm:text-sm">
                Festive essentials start at ₹299 • Click to view
              </p>
            </div>
          </div>
        </section>

        {/* Product Grid Title */}
        <div className="px-6 mb-6 flex justify-between items-end">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Curated For You</h3>
            <p className="text-gray-500 text-sm">Based on your recent interest</p>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="text-[#b90041] font-bold text-sm hover:underline cursor-pointer"
          >
            View All ➔
          </button>
        </div>

        {/* Product Grid (2-column Bento style) */}
        <section className="px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => onNavigate('product')}
              className="group flex flex-col justify-between cursor-pointer"
            >
              <div className="relative bg-white rounded-2xl overflow-hidden mb-3 aspect-3/4 shadow-xs">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={product.title}
                  src={product.image}
                />
                <div className="absolute top-3 left-3 bg-[#008644] text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                  <span
                    className="material-symbols-outlined text-[12px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    payments
                  </span>
                  Resell &amp; Earn ₹{product.margin}
                </div>
              </div>

              <div className="px-1 space-y-1">
                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-[#FF3F6C] transition-colors">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-extrabold text-gray-900">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-[#b90041]">
                    {product.discount}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#005227] bg-[#7dfca2]/30 px-2 py-0.5 rounded-full">
                    <span
                      className="material-symbols-outlined text-[10px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    {product.rating} ({product.reviews})
                  </div>
                  <span className="text-[10px] font-bold text-[#006a34] uppercase tracking-tighter">
                    Free Delivery
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}