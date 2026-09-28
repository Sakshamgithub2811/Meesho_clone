import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';

export default function ResellAndEarn({ onBack }) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const supplierPrice = 480;
  const [customerPrice, setCustomerPrice] = useState(600);
  const [activeNav, setActiveNav] = useState('orders');

  // Live Profit Calculation
  const numericPrice = Number(customerPrice) || 0;
  const profit = Math.max(0, numericPrice - supplierPrice);

  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomerPrice(val);
  };

  const handleWhatsAppShare = () => {
    const finalPrice = numericPrice < supplierPrice ? supplierPrice : numericPrice;
    const message = `✨ Premium Silk Handblock Print Anarkali ✨\n\nPrice: ₹${finalPrice} only (Free Delivery + 7-Day Easy Returns)\n\nReply to place your order!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDownloadImages = () => {
    // Download catalog images
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen pb-28 font-sans selection:bg-[#b90041]/20">
      {/* 1. TOP HEADER - Full Width */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack ? onBack : () => navigate('/reseller-home')}
              aria-label="Go Back"
              className="text-[#191c1e] cursor-pointer active:scale-95 transition-transform p-1.5 hover:bg-gray-100 rounded-full"
            >
              {/* Arrow Back SVG */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <span 
              onClick={() => navigate('/reseller-home')}
              className="text-xl sm:text-2xl font-black text-[#FF3F6C] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight cursor-pointer"
            >
              The Digital Curator
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#191C1E]">
            <button
              onClick={() => navigate('/reseller-home')}
              aria-label="Search"
              className="cursor-pointer active:scale-95 transition-transform p-2 hover:bg-gray-100 rounded-full hover:text-[#b90041]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              className="cursor-pointer active:scale-95 transition-transform p-2 hover:bg-gray-100 rounded-full hover:text-[#b90041]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT (Centered with max-w-6xl) */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6 space-y-8">
        {/* Product Preview Card */}
        <section className="relative group">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 aspect-[4/5] relative overflow-hidden">
                <img
                  alt="Premium Ethnic Wear"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0ZnPCaQs1V-mDSDM7ur2kI3Dz5Nbk7XDFuZH3o4lRL3dsUn6O1yaEEHy-VLMCln7Sd6be5Qrq94Zfg63DDyBzVhYJePlmHDXghznQTyuuKMUm5Mm87Ajqce1Y0O-aCUAclPK1J3ONzX2FEjylGuRwxAPi7MjwxctToYvQMizwARfCrJZ5eBA2dlEycS3G6fvLnnmrYBrguUZ5NFiw9091KDpVXtHLkqcVjyakyCacLuB5sq9QG0-dXjlee_MI1KD7fzfqJZ9hE7U"
                />
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <svg className="w-3.5 h-3.5 fill-current text-[#b90041]" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-xs font-bold font-sans">4.5</span>
                </div>
              </div>

              <div className="p-6 md:w-1/2 flex flex-col justify-between">
                <div>
                  <p className="text-[#b90041] font-bold text-xs uppercase tracking-widest mb-2">
                    Exclusive Collection
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#191c1e] leading-tight mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    Silk Handblock Print Anarkali
                  </h2>
                  <p className="text-[#5b4042] text-sm line-clamp-2 mb-4 leading-relaxed">
                    Handcrafted by master artisans with premium silk-blend fabric and traditional floral motifs.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#5b4042] text-xs">Supplier Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#191c1e]">₹480</span>
                    <span className="text-[#5b4042] line-through text-sm">₹899</span>
                    <span className="text-[#006a34] font-bold text-sm">45% OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Chip */}
        <div className="flex items-center gap-3 bg-[#4d41df]/5 p-4 rounded-2xl">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Reseller 1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu1i3UcAw_mLKDXnyxXC6ZQF9coPpy-EaFt1EiyMosqnXottVZqCbLK-UBa28UFae5dPjUuTj1ZD0U3IXgmV8lsvvORbHbsdEkeMxZgmQjx-4UTYMxIxoBFZIszTQCRkvnx4R0787kL1KjkYN-sN6Z4uU1p1HbIvzM590hQHMZ2417d_hhn1esV1JTn8hROyl8mDr-h1giiBwDz0pJ_6l4y3WS-5QKrefLhrciANDGdH8riEsi6NEyBMeDza8m6qjAjYMTMxQOL1s"
              />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Reseller 2"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7t5Ne6EZqqBz-A00YXILg702dJUAsR2sAMnamzc516YhUu0LALx1Ri3B0P4BsOqgatzGjZ1IdZXYAY5OgL-DzNxtCFFvh07nUv8iUFXAYhjO4nHpDwltRaaqiPYN50KGEmQ54V3-MxRDyRDd3Gn_V09CCryfWD_q-Ats7wd6H_LqVs_QnNcNLGLHy7LNWMeA-URDcr96z4Kq4Exs1lFkXHYLH9HEuJgJrJCXOgtLYUNZeDwdeQmamEm1Iy1J8Q6jvPCvyU_Ymf_8"
              />
            </div>
          </div>
          <p className="text-sm font-semibold text-[#4d41df]">1,240+ Resellers shared this today</p>
        </div>

        {/* Profit Calculation Section */}
        <section className="bg-white rounded-t-[2.5rem] shadow-[0_-12px_48px_rgba(0,0,0,0.08)] p-8 space-y-6 relative -mx-4 md:mx-0">
          <div className="w-12 h-1.5 bg-[#e7e8ea] rounded-full mx-auto mb-2"></div>
          <header className="text-center space-y-1">
            <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#191c1e]">
              Set Your Reselling Price
            </h3>
            <p className="text-[#5b4042] text-sm">
              Enter the price you want to sell to your customer
            </p>
          </header>

          <div className="space-y-6">
            {/* Price Input Container */}
            <div className="bg-[#f2f4f6] rounded-2xl p-6 transition-all border-2 border-transparent focus-within:border-[#b90041]/20">
              <div className="flex justify-between items-center mb-4">
                <label
                  className="text-xs font-bold uppercase tracking-wider text-[#5b4042]"
                  htmlFor="price-input"
                >
                  Customer Price (₹)
                </label>
                <span className="text-xs font-semibold text-[#b90041] bg-[#b90041]/10 px-2 py-1 rounded-md">
                  Min. ₹480
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-0 text-3xl font-black text-[#191c1e]">₹</span>
                <input
                  id="price-input"
                  type="text"
                  inputMode="numeric"
                  value={customerPrice}
                  onChange={handlePriceChange}
                  placeholder="000"
                  className="w-full bg-transparent border-none text-4xl font-black p-0 pl-7 focus:ring-0 text-[#191c1e] outline-none"
                />
              </div>
            </div>

            {/* Live Profit Dashboard */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f8f9fb] p-5 rounded-2xl space-y-1">
                <p className="text-xs font-medium text-[#5b4042]">Supplier Cost</p>
                <p className="text-lg font-bold text-[#191c1e]">₹{supplierPrice}</p>
              </div>
              <div className="bg-[#006a34]/10 p-5 rounded-2xl space-y-1 border-b-4 border-[#006a34]">
                <p className="text-xs font-medium text-[#006a34]">Your Profit</p>
                <p className="text-2xl font-black text-[#006a34]">₹{profit}</p>
              </div>
            </div>

            {/* Incentive Banner */}
            <div className="bg-gradient-to-r from-[#4d41df] to-[#675df9] p-4 rounded-2xl flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a6 6 0 016 6c0 2.22-1.21 4.15-3 5.19V22l-3-2-3 2v-8.81A6.002 6.002 0 016 8a6 6 0 016-6zm0 2a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <p className="text-sm font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  You earn ₹{profit} per sale
                </p>
              </div>
              <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleDownloadImages}
                className="w-full py-4 px-6 bg-[#e7e8ea] text-[#191c1e] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#e1e2e4] transition-colors active:scale-95 duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Images
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#b90041] to-[#df2457] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#b90041]/20 hover:opacity-90 transition-opacity active:scale-95 duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                Share on WhatsApp
              </button>
            </div>
          </div>
        </section>

        {/* Product Details Bento */}
        <section className="grid grid-cols-2 gap-4 pb-12">
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
            <svg className="w-6 h-6 text-[#4d41df]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h2.25" />
            </svg>
            <p className="text-xs font-bold text-[#5b4042] uppercase">Free Delivery</p>
            <p className="text-xs text-[#5b4042]">Estimated: 3-5 Days</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
            <svg className="w-6 h-6 text-[#006a34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            <p className="text-xs font-bold text-[#5b4042] uppercase">Easy Returns</p>
            <p className="text-xs text-[#5b4042]">7-day return policy</p>
          </div>
        </section>
      </main>

      {/* Universal Bottom Navigation Bar */}
      <AppBottomNav activeNav="orders" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}