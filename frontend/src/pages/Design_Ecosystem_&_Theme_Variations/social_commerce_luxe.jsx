import { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'auto_awesome' },
  { id: 'sarees', name: 'Sarees', icon: 'dry_cleaning' },
  { id: 'kurtis', name: 'Kurtis', icon: 'apparel' },
  { id: 'western', name: 'Western', icon: 'styler' },
  { id: 'jewellery', name: 'Jewellery', icon: 'diamond' },
  { id: 'home', name: 'Home', icon: 'home' },
  { id: 'beauty', name: 'Beauty', icon: 'face_3' },
];

const PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Embroidered Silk Saree',
    category: 'sarees',
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    margin: 150,
    rating: 4.2,
    reviews: '1.5k',
    isFreeDelivery: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBVwMKwGfO_olKEXbwiTpDXzsOlZSJgCzlnddCLAvySbIuHn2Pkm6I2PG2cD7jhUIndi3q9YnWvU86XEfPypV22P100hgtYjL1M_dzEzJ3ZPLn-rJ1aipHYcNGGRliLuWTA8_5yrizNVsKV4-As6tduVNIVfj1GSlt2K15gqxEO5tLXzeJsf87cWKUnUpDKzxh2IGnTYQfoBVDFDF6ByY9tru7xkEafk7KutQwGxEtgdikl3UdKahK3Sykk7-Y5TGOkKQSgcrlfLV8',
  },
  {
    id: 'prod-2',
    title: 'Floral Printed Kurti',
    category: 'kurtis',
    price: 649,
    originalPrice: 1299,
    discount: '50% OFF',
    margin: 120,
    rating: 4.5,
    reviews: '2k',
    isFreeDelivery: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qGazLygai4Jpf9ecB8lGFGE4Fh74pvhqMcPu-u0WawpSbrKtkXAfZtsLcYNnn8w0xoJAYk01OOtWj_BlgeabKxsoaQj6THH4-inOUHBlAnEvqyeFqoNoHRg3QEkrGZcQcnSdsNqPDPK1FZg_CJ5dB5Dvu_kz9uE5ttw2vkjGnI1YQ7ZzyTcVaL1XEiydI3odXerulDBLBZ8jh66-dd286xPCX7dormNRfLokj9HyWptKSTBhAJWF93D_RnTWkGqQ_-wJWrjJv4c',
  },
  {
    id: 'prod-3',
    title: 'Casual Western Co-ord',
    category: 'western',
    price: 1249,
    originalPrice: 2499,
    discount: '50% OFF',
    margin: 200,
    rating: 4.0,
    reviews: '850',
    isFreeDelivery: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMQN5LQn3Qb0zve4l1Jk1hLMjnERBJn0L7dBzsy6-fkVsqAzYbFLbv5mZy1PZAcoibJqt9bOqNpYbhiWvqEM-U1lqeNcdeVbvtigwWCb3XJShvnwBE8HN0Pro9uUQHndRgZXADoQN66BLmaVLG6nbIMGa5Lcar2RQV63PsI4GmUP_aM1jQ1QeoWjGltxjQ1Fi4yC4GB94oBTnzUI8G4-ntBVu0q46uc7KzbgBRZLFo9mZeUY4kIe-vEzBA77HCSEJx-9obvB5u338',
  },
  {
    id: 'prod-4',
    title: 'Gold-Plated Choker Set',
    category: 'jewellery',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    margin: 80,
    rating: 4.8,
    reviews: '3k',
    isFreeDelivery: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDN-LXo6dxKUFf5SwPDmAU-wwYRpFqtjKQKnPdZLuYfttCBL8A9dAJn4WjtsvdFAZmLk9fWD2_0LG7rjsqTdHhwMu1wHNk10S7IGOZGLB9mOMorHVpyaJtYBb_DpCFUqWnLHwlKpeVD6lfLZsHNs8-qFY_HohwExXcbijjymE-2YOoU9lr8OYYC8hTdUCSS-id33Flm3KKnlwU78syK3NNPih2IZtgZlJfFSN7YRapHd3VrV34lO4X_4fOtbJ_NZCD0smbh6kM6MsQ',
  },
  {
    id: 'prod-5',
    title: 'Geometric Printed Double Bedsheet',
    category: 'home',
    price: 549,
    originalPrice: 1499,
    discount: '63% OFF',
    margin: 95,
    rating: 4.3,
    reviews: '1.2k',
    isFreeDelivery: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHqKClIM-SdwJTWo2EKQbZ5UcZLq50pmwHKw_Rj8hQiuPwDrHomg_bIfFz__z3jhw8C0Y5fZWuGPIGz2EFgxWC4oS33OUGNynw8DK4ViJmqkd53YtPRcEdRnkKEMvNEHFfCCS9UPOycYszZ3GdPP04O6o0-tWPfCIGVhH5nY0ADvwnE9-dSVAu8x6F1Ca_GIAeNSrFXM4aGp0OHYB6Jjk_eO1n2Frf2Qpt5PfkN_ferdZmZ4HFpAhFKrJvkC6buR5a_hso3WVyeJs',
  },
  {
    id: 'prod-6',
    title: 'Matte Liquid Lipstick Trio',
    category: 'beauty',
    price: 349,
    originalPrice: 799,
    discount: '56% OFF',
    margin: 60,
    rating: 4.6,
    reviews: '4.1k',
    isFreeDelivery: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0zqmw7ba_XFDIMO6oyX-ILUKOJgIMuPHjQHmER1KSXi4yclRGSPaFRWJJc7uqCXrLyuOZB5pF6W9WnzFkT4T60VwY7uLrFzTvD9dwE04M23l7pGMu2N9_mNh3dIciAjlMaq4CCNHCtjsjPsAXVnUWIzuy88jS-AXIyF662WcDdlDcTQBqikiQkpbng2C7siDr0Cfpn4tI2OPGK5ut0GiQ2urqGnEEsMeCKdoSG60Mzopnd90gu9Axj_jDhaDAqbSN79R6G9BIo88',
  },
];

export default function SocialCommerceLuxe({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(3);
  const [toastMsg, setToastMsg] = useState(null);
  const [activeBannerSlide, setActiveBannerSlide] = useState(0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleShare = (prod, e) => {
    e.stopPropagation();
    showToast(`Shared "${prod.title}" to WhatsApp! Customer Price: ₹${prod.price + prod.margin}`);
  };

  const handleAddToCart = (prod, e) => {
    e.stopPropagation();
    setCartCount((c) => c + 1);
    showToast(`Added "${prod.title}" to Cart!`);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#F8F9FB] font-['Inter'] text-[#191c1e] min-h-screen antialiased selection:bg-[#b90041]/20 selection:text-[#b90041] relative">
      {/* TopAppBar */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#F8F9FB]/85 backdrop-blur-md flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('Navigation Menu')}
            className="text-pink-600 hover:bg-pink-50 p-1.5 rounded-xl cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <span className="font-['Plus_Jakarta_Sans'] font-black italic text-2xl tracking-tight text-pink-600 cursor-pointer">
            The Curator
          </span>
          <span className="text-[10px] font-bold text-pink-400 tracking-wider uppercase hidden sm:block">
            Luxe Edition
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => showToast('You have 2 new buyer alerts!')}
            className="relative text-pink-600 hover:bg-pink-50 p-2 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 bg-[#b90041] text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
              2
            </span>
          </button>

          <button
            type="button"
            onClick={() => showToast(`Shopping bag has ${cartCount} items`)}
            className="relative text-pink-600 hover:bg-pink-50 p-2 rounded-full transition-colors cursor-pointer"
            title="Cart"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#b90041] text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>

      <main className="pt-20 pb-32 max-w-7xl mx-auto">
        {/* Search Field */}
        <section className="px-4 sm:px-6 mb-6">
          <div className="flex items-center bg-[#e7e8ea] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#b90041] rounded-2xl px-4 py-3 gap-3 transition-all shadow-inner">
            <span className="material-symbols-outlined text-[#5b4042]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full text-[#191c1e] placeholder-[#5b4042] font-medium text-sm outline-none"
              placeholder="Search ethnic wear, kurtis, sarees, jewellery..."
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => showToast('Voice search listening...')}
              className="text-[#b90041] hover:scale-110 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
          </div>
        </section>

        {/* Categories Horizontal Scroll */}
        <section className="mb-8">
          <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-6 gap-4 sm:gap-6 pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group focus:outline-none transition-transform active:scale-95"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isActive
                        ? 'bg-pink-600 text-white shadow-pink-600/30 scale-105 ring-4 ring-pink-100'
                        : 'bg-[#e7e8ea] text-slate-600 group-hover:bg-pink-100 group-hover:text-pink-600'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive ? 'text-pink-600 font-bold' : 'text-slate-600 group-hover:text-slate-900'
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
        <section className="px-4 sm:px-6 mb-10">
          <div className="relative overflow-hidden rounded-3xl h-52 sm:h-64 bg-[#b90041] group shadow-xl">
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              alt="Model in luxury silk saree"
              src={
                activeBannerSlide === 0
                  ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAiYbOBIL9qy1g9qoBh275Q8FkigISG3YgF03wDbcovBxZgPw0vZ6bdJkb_yR_GYwwwt9-skAZwYpOMHGmAys3j8yAQxn1iTy9OUAfVAuWARibYHCor-G_d6B0mDWC9KdCRTkj-BKdS30FTNIPsKZaRErMtg66yWvseqIjtsn5MiqQNDrGFrOXS2pRcXy0psXnXDNFufESheokqqqrbpfXABfhJ0-VLcc8bcEqrQZaJSahEoaD6duikl91tysp7qZ32WtFKma5Bjs'
                  : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJBu2Q0VHbgQcCdjY9oKLJTtMW9mnbg56JY2XvO2mPM7uJ7LM4K-Q_BAyfcIflU5Nw4UStZ5p8dBDgvVcVIeP6IRTow2G-cEVJjkNfMagoj8tp6cDJ0CBIs58ck8Nns2LEpRm4dnudeY9mheaR6h8_rNoyUG0NDcGuQvimcDp0xfs_mMQOK9Mz_F1mNxCFPXigHyU1Icegk54RiNs7igqXiDR7WMwQZ_Ap8D54rFksf8hLzAiBFTluSfWUE1LUXGrLYrDM2UNJSXU'
              }
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center p-6 sm:p-10">
              <span className="bg-[#b90041] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-md">
                {activeBannerSlide === 0 ? 'Limited Offer' : 'Trending Now'}
              </span>
              <h2 className="text-white font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-4xl leading-tight mb-1">
                {activeBannerSlide === 0 ? (
                  <>
                    Mega Sale:
                    <br />
                    Up to 70% Off
                  </>
                ) : (
                  <>
                    Luxe Wedding:
                    <br />
                    High Margin Edits
                  </>
                )}
              </h2>
              <p className="text-white/85 font-medium text-xs sm:text-sm mt-1">
                Festive essentials start at ₹299 • Earn up to ₹300 margin
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('sarees');
                    showToast('Viewing Mega Sale Sarees');
                  }}
                  className="bg-white text-pink-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-50 transition-colors shadow-lg active:scale-95 cursor-pointer"
                >
                  Shop Collection
                </button>
              </div>
            </div>

            {/* Slide Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              <button
                type="button"
                onClick={() => setActiveBannerSlide(0)}
                className={`h-2 rounded-full transition-all ${
                  activeBannerSlide === 0 ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label="Slide 1"
              />
              <button
                type="button"
                onClick={() => setActiveBannerSlide(1)}
                className={`h-2 rounded-full transition-all ${
                  activeBannerSlide === 1 ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label="Slide 2"
              />
            </div>
          </div>
        </section>

        {/* Product Grid Title */}
        <div className="px-4 sm:px-6 mb-6 flex justify-between items-end">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#191c1e]">
              Curated For You
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              {filteredProducts.length} hand-picked high-conversion pieces
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-pink-600 font-bold text-sm hover:underline cursor-pointer"
          >
            {selectedCategory === 'all' ? 'View All' : 'Reset Filter'}
          </button>
        </div>

        {/* Product Grid (2-column Bento style) */}
        <section className="px-4 sm:px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={(e) => handleAddToCart(prod, e)}
              className="group bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="relative bg-[#ffffff] rounded-2xl overflow-hidden mb-3 aspect-[3/4]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={prod.title}
                    src={prod.imageUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  {/* Resell Margin Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-emerald-700/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      payments
                    </span>
                    <span>Resell &amp; Earn ₹{prod.margin}</span>
                  </div>

                  {/* Quick Share Button */}
                  <button
                    type="button"
                    onClick={(e) => handleShare(prod, e)}
                    className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-pink-600 shadow-md active:scale-90 transition-all cursor-pointer"
                    title="Share to WhatsApp"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                </div>

                <div className="px-1">
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-xs sm:text-sm mb-1 truncate group-hover:text-pink-600 transition-colors">
                    {prod.title}
                  </h4>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className="text-base sm:text-lg font-extrabold text-[#191c1e]">
                      ₹{prod.price}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{prod.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-pink-600">{prod.discount}</span>
                  </div>
                </div>
              </div>

              <div className="px-1 pt-1 flex items-center justify-between border-t border-slate-50 mt-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span
                    className="material-symbols-outlined text-[10px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>
                    {prod.rating} ({prod.reviews})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">
                  Free Delivery
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav={activeTab === 'categories' ? 'categories' : activeTab === 'orders' ? 'orders' : activeTab === 'account' ? 'profile' : 'home'} onNavigate={onNavigate} />
    </div>
  );
}
