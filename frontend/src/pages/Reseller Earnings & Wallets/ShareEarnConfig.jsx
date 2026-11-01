import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';
import { getProducts } from '../../services/ecommerceService';

export default function ShareEarnConfig() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [activeProduct, setActiveProduct] = useState({
    title: 'Banarasi Silk Saree with Gold Zari Work',
    price: 500,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
  });

  const supplierPrice = activeProduct.price || 500;
  const [profitMargin, setProfitMargin] = useState(150);
  const [shareMode, setShareMode] = useState('with-prices'); // 'images', 'desc', 'with-prices'
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    getProducts().then((prods) => {
      if (prods && prods.length > 0) {
        const queryParams = new URLSearchParams(location.search);
        const prodId = queryParams.get('id');
        const matched = prodId ? prods.find(p => p.id === prodId) : prods[0];
        const selected = matched || prods[0];
        
        setActiveProduct({
          title: selected.title || 'Banarasi Silk Saree with Gold Zari Work',
          price: selected.price || 500,
          image: selected.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
        });
      }
    }).catch(() => {});
  }, [location.search]);

  const numericMargin = Number(profitMargin) || 0;
  const finalPrice = supplierPrice + numericMargin;
  const marginPercentage = Math.round((numericMargin / supplierPrice) * 100);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleProfitChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setProfitMargin(val === '' ? '' : Math.max(0, parseInt(val, 10)));
  };

  const applyPreset = (percent) => {
    const margin = Math.round((supplierPrice * percent) / 100);
    setProfitMargin(margin);
  };

  const handleShareToWhatsApp = () => {
    let msg = '';
    if (shareMode === 'images') {
      msg = `📸 ${activeProduct.title}!\nPure quality fabric with exquisite craftsmanship. Reply to see details or book!`;
    } else if (shareMode === 'desc') {
      msg = `✨ *${activeProduct.title}*\n\nVerified authentic marketplace quality.\nDirect supplier dispatch with Free Shipping! DM to order.`;
    } else {
      msg = `✨ *${activeProduct.title}*\n\nSpecial Price: ₹${finalPrice} only (Free Shipping!)\n\n✅ 7-Day Easy Replacement Guarantee\n✅ Cash on Delivery Available\n\nReply directly with your address to place order!`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    showToast('Catalog shared to WhatsApp successfully!');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans selection:bg-primary/20">
      {/* TopAppBar - Full Width */}
      <header className="bg-[#fff4f6] w-full relative border-b border-primary/10">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="hover:bg-[#ff7293]/10 transition-colors p-1.5 rounded-full active:scale-95 text-[#b7004d] cursor-pointer"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-2xl text-[#b7004d]">arrow_back</span>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-lg sm:text-xl text-[#b7004d]">
              Set Profit Margin
            </h1>
          </div>
          <button 
            type="button"
            onClick={() => alert("Set your desired selling price. The difference from the supplier price is your direct profit margin.")}
            className="hover:bg-[#ff7293]/10 transition-colors p-1.5 rounded-full cursor-pointer text-[#b7004d]"
            aria-label="Help"
          >
            <span className="material-symbols-outlined text-2xl">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Container - Single Column Vertical Flow Preserved */}
      <main className="w-full max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-2xl text-center shadow-lg animate-fade-in">
            {toastMsg}
          </div>
        )}

        {/* 1. Product Preview Section */}
        <section className="relative group">
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_12px_40px_rgba(74,33,53,0.06)] flex flex-col sm:flex-row gap-4 items-center border border-gray-100">
            <div className="w-full sm:w-28 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low">
              <img
                alt={activeProduct.title}
                className="w-full h-full object-cover"
                src={activeProduct.image}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="flex-grow w-full">
              <h2 className="font-bold text-base leading-snug">{activeProduct.title}</h2>
              <p className="text-on-surface-variant text-xs mt-1">
                Supplier Base Price: <span className="font-bold text-on-surface text-sm">₹{supplierPrice}</span>
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                High Demand (500+ sold)
              </div>
            </div>
          </div>
        </section>

        {/* 2. Profit Margin Configuration Input */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block font-bold text-on-surface-variant tracking-wider uppercase text-xs">
              Your Profit Margin
            </label>
            <span className="text-xs font-bold text-primary">
              +{marginPercentage}% Profit
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="text-3xl font-extrabold text-primary">₹</span>
            </div>
            <input
              type="text"
              value={profitMargin}
              onChange={handleProfitChange}
              className="w-full bg-white border border-primary/20 rounded-2xl py-5 pl-14 pr-24 text-3xl font-black text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm"
              placeholder="0"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-extrabold text-xs">
                Margin
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex gap-2 pt-1">
            {[10, 20, 30, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => applyPreset(pct)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  marginPercentage === pct
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                +{pct}%
              </button>
            ))}
          </div>
        </section>

        {/* 3. Live Price Calculation Cards (Bento Style) */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Supplier Price</span>
            <span className="text-xl font-bold mt-2 text-on-surface">₹{supplierPrice}</span>
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Your Margin</span>
            <span className="text-xl font-bold mt-2 text-primary">+ ₹{numericMargin}</span>
          </div>
          <div className="col-span-2 bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">
                  Final Customer Selling Price
                </span>
                <h3 className="text-3xl sm:text-4xl font-black mt-1">₹{finalPrice}</h3>
              </div>
              <span className="material-symbols-outlined text-white/30 text-5xl" data-icon="payments">
                payments
              </span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          </div>
        </section>

        {/* 4. Share Options (What to share) */}
        <section className="space-y-3">
          <label className="block font-bold text-on-surface-variant tracking-widest uppercase text-xs">
            What to share
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'images', label: 'Only Images' },
              { id: 'desc', label: 'Images + Desc' },
              { id: 'with-prices', label: 'With Prices' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setShareMode(opt.id)}
                className={`px-5 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 cursor-pointer ${
                  shareMode === opt.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 5. Growth Tip Card */}
        <section className="bg-tertiary/5 border border-tertiary/10 p-5 rounded-2xl flex gap-4 items-start">
          <div className="bg-tertiary-container/30 p-2 rounded-xl text-tertiary">
            <span className="material-symbols-outlined" data-icon="lightbulb">lightbulb</span>
          </div>
          <div>
            <h4 className="font-bold text-tertiary text-sm">Pro Reseller Tip</h4>
            <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
              Resellers who add <span className="text-tertiary font-bold">20-30% margin</span> sell 5x more than those with higher margins!
            </p>
          </div>
        </section>

        {/* 6. Action Button: Share to WhatsApp */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleShareToWhatsApp}
            className="w-full py-4 sm:py-5 px-4 sm:px-6 rounded-2xl bg-[#25D366] text-white font-black text-sm sm:text-base md:text-lg flex items-center justify-center gap-2.5 sm:gap-3 shadow-[0_12px_40px_rgba(37,211,102,0.3)] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="truncate">Share to WhatsApp with My Margin</span>
          </button>
        </div>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
