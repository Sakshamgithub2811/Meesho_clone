import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  Truck,
  RotateCcw,
  Clock,
  Layers,
  Store,
  Phone,
  HelpCircle,
  PackageCheck,
  BarChart3,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  Percent,
  Calculator,
  Building2,
  Lock,
  ExternalLink
} from 'lucide-react';

const CATEGORY_MARGIN_DATA = {
  'women_ethnic': { name: 'Women Ethnic & Sarees', otherComm: 19, avgShip: 45, icon: '👗' },
  'men_fashion': { name: 'Men Western & Casuals', otherComm: 18, avgShip: 50, icon: '👕' },
  'footwear': { name: 'Shoes & Footwear', otherComm: 17, avgShip: 55, icon: '👟' },
  'home_kitchen': { name: 'Home & Kitchen Appliances', otherComm: 16, avgShip: 60, icon: '🍳' },
  'electronics': { name: 'Electronics & Audio', otherComm: 15, avgShip: 45, icon: '🎧' },
  'beauty_health': { name: 'Beauty & Personal Care', otherComm: 20, avgShip: 40, icon: '✨' },
};

const FAQS = [
  {
    q: 'Why should I sell on MShoppy instead of other platforms?',
    a: 'MShoppy offers 0% Commission across all 700+ categories. You take home 100% of your selling price (deducting only mandatory government 1% TCS/TDS). Plus, we charge ₹0 penalty on RTO/customer cancellations and provide 7-day automated bank payouts.'
  },
  {
    q: 'Do I need a GSTIN to register as a supplier?',
    a: 'Yes, as per Indian GST regulations for inter-state e-commerce supply, a valid GSTIN (Regular or Composition) along with an active bank account is required to register and receive automated payouts.'
  },
  {
    q: 'How does shipping and order pickup work?',
    a: 'You simply pack the product and paste our 1-click printable shipping label. Our trusted courier partners (Delhivery, Shadowfax, Xpressbees) will pick up the parcel directly from your warehouse or doorstep.'
  },
  {
    q: 'What happens if a customer returns or cancels an order (RTO)?',
    a: 'Unlike Amazon or other platforms that impose heavy return handling fines on sellers, MShoppy has a strict ₹0 Penalty policy for RTO (Return to Origin). Unopened packets are returned to your warehouse safely at zero penalty.'
  },
  {
    q: 'When do I receive my payments?',
    a: 'MShoppy runs an automated 7-day payment cycle. Payments for delivered orders are credited directly into your registered bank account via NEFT/IMPS within 7 to 10 days of successful delivery.'
  },
  {
    q: 'Can I upload products in bulk (Excel / CSV)?',
    a: 'Yes! You can either add products one-by-one with our adaptive size/color matrix, or download our ready-made CSV/Excel template, fill product details, and upload 50+ catalogs in just 1 click.'
  }
];

export default function SupplierLandingPage({ onNavigate }) {
  const navigate = useNavigate();

  // Fast-track phone registration lead state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Interactive Profit Calculator States
  const [calcCategory, setCalcCategory] = useState('women_ethnic');
  const [calcPrice, setCalcPrice] = useState(650);
  const [calcOrders, setCalcOrders] = useState(120);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleNav = (path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  const handleStartSelling = (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');
    if (cleanPhone) {
      try {
        sessionStorage.setItem('mshoppy_supplier_prefill_phone', cleanPhone);
      } catch (_) {}
    }
    handleNav('/supplier-register');
  };

  // Real-time calculation logic
  const calcResults = useMemo(() => {
    const selectedCat = CATEGORY_MARGIN_DATA[calcCategory] || CATEGORY_MARGIN_DATA['women_ethnic'];
    const price = Number(calcPrice) || 500;
    const orders = Number(calcOrders) || 100;

    // MShoppy: 0% Comm, 1% TCS, 1% TDS = 2% total statutory deduction
    const mshoppyPerOrderTaxes = price * 0.02;
    const mshoppyTakeHomePerOrder = Math.max(0, price - mshoppyPerOrderTaxes);
    const mshoppyMonthlyNet = Math.round(mshoppyTakeHomePerOrder * orders);

    // Other Platforms: otherComm% (15-20%) + Closing Fee (~₹15) + Fixed Handling (~₹20) + 2% Taxes
    const otherCommRate = selectedCat.otherComm / 100;
    const otherDeductionPerOrder = (price * otherCommRate) + 35 + (price * 0.02);
    const otherTakeHomePerOrder = Math.max(0, price - otherDeductionPerOrder);
    const otherMonthlyNet = Math.round(otherTakeHomePerOrder * orders);

    const monthlyDifference = Math.max(0, mshoppyMonthlyNet - otherMonthlyNet);
    const yearlyExtra = monthlyDifference * 12;

    return {
      mshoppyTakeHomePerOrder: Math.round(mshoppyTakeHomePerOrder),
      mshoppyMonthlyNet,
      otherTakeHomePerOrder: Math.round(otherTakeHomePerOrder),
      otherMonthlyNet,
      monthlyDifference,
      yearlyExtra,
      otherComm: selectedCat.otherComm
    };
  }, [calcCategory, calcPrice, calcOrders]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans antialiased selection:bg-[#d82a62] selection:text-white">
      {/* ======================================================== */}
      {/* 1. TOP STICKY SUPPLIER NAVIGATION HEADER                 */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Portal Identifier */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5a0624] via-[#850d3a] to-[#d82a62] flex items-center justify-center shadow-sm shadow-pink-900/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#b7004d] tracking-tight">MShoppy</span>
                <span className="px-2 py-0.5 rounded-md bg-pink-100 text-[#b7004d] text-[10px] font-black uppercase tracking-wider">
                  Supplier
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Sell Wholesale Pan-India</p>
            </div>
          </div>

          {/* Center Anchor Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#why-sell" className="hover:text-[#b7004d] transition-colors">Why MShoppy</a>
            <a href="#calculator" className="hover:text-[#b7004d] transition-colors flex items-center gap-1">
              <span>Earnings Calculator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </a>
            <a href="#how-it-works" className="hover:text-[#b7004d] transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-[#b7004d] transition-colors">High Demand</a>
            <a href="#faqs" className="hover:text-[#b7004d] transition-colors">FAQs</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/supplier-login')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#b7004d] hover:bg-pink-50/60 border border-slate-200 transition-all cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleNav('/supplier-register')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#850d3a] to-[#d82a62] hover:from-[#6b082e] hover:to-[#b7004d] text-white text-xs font-black shadow-md shadow-pink-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Selling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HIGH-IMPACT HERO SECTION (Conversion Lead Form)       */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#5a0624] via-[#850d3a] to-[#2c0311] text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-rose-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left 7 Columns: Hero Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span>India's Most Supplier-Friendly E-Commerce Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-black tracking-tight leading-[1.15]">
                Sell Online to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200">14 Cr+ Customers</span> at <span className="underline decoration-pink-400 decoration-wavy decoration-2">0% Commission</span>
              </h1>

              <p className="text-base sm:text-lg text-pink-100/90 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Grow your wholesale & manufacturing business pan-India. List with just a GSTIN, get 7-day automated bank payouts, and pay zero commission on every order.
              </p>

              {/* Fast-Track Phone Input Lead Card */}
              <div className="bg-white/10 backdrop-blur-lg p-2.5 sm:p-3 rounded-3xl border border-white/20 shadow-2xl max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleStartSelling} className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-pink-200 font-bold text-sm">
                      <span>🇮🇳 +91</span>
                      <span className="text-white/40">|</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        setPhoneError('');
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-pink-200/60 rounded-2xl py-3.5 pl-22 pr-4 text-sm font-semibold outline-none transition-all border border-white/20 focus:border-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>Start Selling</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                {phoneError && (
                  <p className="text-xs text-rose-300 font-bold mt-2 text-left pl-3">{phoneError}</p>
                )}
              </div>

              {/* Key Trust Micro-Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-pink-200/90">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GSTIN & Bank Account Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No UPC Barcode Mandate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Doorstep Courier Pickup</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Visual Live Trust Matrix Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
                
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-pink-200">MShoppy Ecosystem</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                    Verified Payouts
                  </span>
                </div>

                {/* 4 Pillars of Scale */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-white">11 Lakh+</div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Trusted Suppliers</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-amber-300">14 Crore+</div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Active Customers</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-300">28,000+</div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Pincodes Served</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-rose-300">0%</div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Commission Rate</p>
                  </div>
                </div>

                {/* Trust Seal */}
                <div className="pt-2 p-4 rounded-2xl bg-black/20 border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">7-Day Payment Guarantee</p>
                    <p className="text-pink-200/80 text-[11px] mt-0.5">Automated NEFT transfer straight into your verified bank account.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. WHY SELL ON MSHOPPY (4 Core USPs vs Others)          */}
      {/* ======================================================== */}
      <section id="why-sell" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
            Why Wholesalers Prefer MShoppy
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Built for High Profit, Zero Hassle Selling
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Unlike legacy marketplaces that squeeze suppliers with heavy commissions and unfair cancellation penalties, MShoppy maximizes your profit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: 0% Commission */}
          <div className="bg-white p-7 rounded-3xl border border-pink-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#b7004d] group-hover:text-white transition-all">
                <Percent className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">0% Commission Rate</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Keep 100% of your listing base price. Other platforms deduct 15% to 28% in referral fees, closing fees, and collection charges.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zero referral fee across 700+ categories</span>
            </div>
          </div>

          {/* Card 2: 0 Penalty on RTO */}
          <div className="bg-white p-7 rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">₹0 Penalty on RTO</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                If a customer refuses the parcel at doorstep or cancels before delivery, we charge zero penalty fees. Unopened packages return safely.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Full compensation on damaged transit</span>
            </div>
          </div>

          {/* Card 3: 7-Day Payment Cycle */}
          <div className="bg-white p-7 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">7-Day Payment Cycle</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Enjoy fast cashflow with automated payments credited directly to your bank account within 7 to 10 days of order delivery.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Direct NEFT / IMPS settlements</span>
            </div>
          </div>

          {/* Card 4: No Brand Gatekeeping */}
          <div className="bg-white p-7 rounded-3xl border border-amber-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No Barcode / UPC Mandate</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Sell directly with your valid GSTIN. No expensive GS1 barcodes, trademark certificates, or Brand Registry approvals required.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Instant catalog listing approval</span>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE EARNINGS / PROFIT CALCULATOR (MEESHO SPECIAL)*/}
      {/* ======================================================== */}
      <section id="calculator" className="py-20 bg-gradient-to-b from-white to-pink-50/50 border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Live Earnings Comparison</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              See How Much More You Earn on MShoppy
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Compare your exact take-home profit against other marketplace platforms charging 15-20% commissions.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-200 shadow-xl max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Interactive Sliders & Category Pickers */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. Category Selection */}
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                    1. Select Your Product Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(CATEGORY_MARGIN_DATA).map(([key, data]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCalcCategory(key)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                          calcCategory === key
                            ? 'bg-pink-50 border-[#b7004d] text-[#b7004d] shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{data.icon}</span>
                        <span className="truncate">{data.name.split('&')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Selling Price Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      2. Product Selling Price (MRP/Wholesale)
                    </label>
                    <span className="text-base font-black text-[#b7004d]">₹{calcPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="3000"
                    step="50"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#b7004d]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                    <span>₹150</span>
                    <span>₹1,500</span>
                    <span>₹3,000</span>
                  </div>
                </div>

                {/* 3. Monthly Orders Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      3. Estimated Orders Per Month
                    </label>
                    <span className="text-base font-black text-[#b7004d]">{calcOrders} Orders</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={calcOrders}
                    onChange={(e) => setCalcOrders(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#b7004d]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                    <span>20</span>
                    <span>500</span>
                    <span>1,000+ orders</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Comparative Results & Profit Callout */}
              <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-[#420417] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-bold text-pink-200 uppercase tracking-wider">Monthly Profit Audit</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold text-xs">
                    0% Comm vs {calcResults.otherComm}% Comm
                  </span>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Other Marketplaces */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Other Platforms</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-200 mt-1">
                      ₹{calcResults.otherMonthlyNet.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      ₹{calcResults.otherTakeHomePerOrder}/order after {calcResults.otherComm}% commission + fees
                    </p>
                  </div>

                  {/* MShoppy Payout */}
                  <div className="bg-emerald-500/15 rounded-2xl p-4 border border-emerald-400/30">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase block">On MShoppy</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                      ₹{calcResults.mshoppyMonthlyNet.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-emerald-200/80 mt-1">
                      ₹{calcResults.mshoppyTakeHomePerOrder}/order with 0% Commission
                    </p>
                  </div>

                </div>

                {/* Highlighted Net Monthly Difference */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg space-y-1 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
                      Extra Money In Your Bank
                    </span>
                    <div className="text-2xl font-black tracking-tight">
                      +₹{calcResults.monthlyDifference.toLocaleString('en-IN')} <span className="text-sm font-normal text-emerald-100">/ month</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/supplier-register')}
                    className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs transition active:scale-95 cursor-pointer shrink-0 shadow-sm"
                  >
                    Claim Profit ➔
                  </button>
                </div>

                <div className="text-center text-[11px] text-pink-200/70 font-medium">
                  Annualized extra revenue: <strong className="text-white">+₹{calcResults.yearlyExtra.toLocaleString('en-IN')}</strong> per year with MShoppy.
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW SELLING ON MSHOPPY WORKS (4 Step Pipeline)        */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Selling on MShoppy Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Start selling in less than 10 minutes with our simplified onboarding experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#5a0624] text-white flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="text-base font-black text-slate-900">Sign Up in 2 Mins</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All you need is a valid GSTIN, an active bank account for daily settlements, and your pickup address.
            </p>
            <div className="text-[11px] font-bold text-[#b7004d] pt-2 border-t border-slate-100">
              Instant KYC verification ➔
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#850d3a] text-white flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="text-base font-black text-slate-900">Upload Your Catalog</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add products one-by-one with size/color switches, or upload 50+ items in 1 click using our bulk Excel sheet.
            </p>
            <div className="text-[11px] font-bold text-[#b7004d] pt-2 border-t border-slate-100">
              Zero barcode requirements ➔
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#b7004d] text-white flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="text-base font-black text-slate-900">Receive Orders & Pack</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get an automatic sound chime when orders arrive. Download the shipping slip & handover to courier pickup.
            </p>
            <div className="text-[11px] font-bold text-[#b7004d] pt-2 border-t border-slate-100">
              Lowest shipping partner rates ➔
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              04
            </div>
            <h3 className="text-base font-black text-slate-900">7-Day Direct Payout</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Payments are deposited directly into your bank account within 7 to 10 days of successful delivery.
            </p>
            <div className="text-[11px] font-bold text-emerald-600 pt-2 border-t border-slate-100">
              Live escrow passbook ➔
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. HIGH-DEMAND CATEGORIES SPOTLIGHT                      */}
      {/* ======================================================== */}
      <section id="categories" className="py-20 bg-slate-50/70 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black text-[#b7004d] uppercase tracking-wider block mb-1">
                Trending Opportunities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                High-Demand Categories on MShoppy
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Over 14 Crore buyers shop across these top segments every single week with rising order volume.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Women Ethnic', orders: '4.2x Growth', icon: '👗', badge: '🔥 Hot' },
              { name: 'Men Western', orders: '3.6x Growth', icon: '👕', badge: 'Trending' },
              { name: 'Shoes & Footwear', orders: '2.8x Growth', icon: '👟', badge: 'High Volume' },
              { name: 'Home & Kitchen', orders: '3.1x Growth', icon: '🍳', badge: 'Popular' },
              { name: 'Electronics & Audio', orders: '2.9x Growth', icon: '🎧', badge: 'Fast Moving' },
              { name: 'Jewellery & Beauty', orders: '4.5x Growth', icon: '💍', badge: '🔥 Bestseller' },
            ].map((cat, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-between group"
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {cat.orders}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. REAL WHOLESALER SUCCESS STORIES                       */}
      {/* ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            Wholesaler Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hear from Suppliers Growing with Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
              "We run a textile manufacturing unit in Surat. On other marketplaces, we were paying ₹80 commission per kurti. With MShoppy's 0% commission, our profit margin shot up by 25% in the first month."
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#850d3a] text-white flex items-center justify-center font-black text-xs">
                RP
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Ramesh Patel</h4>
                <p className="text-[11px] text-slate-500">Patel Fabrics, Surat (Surat Textile Market)</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
              "The 7-day automated payment cycle is a game-changer for wholesalers. We never have to follow up for our money. We now dispatch 400+ daily orders across all northern states."
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b7004d] text-white flex items-center justify-center font-black text-xs">
                SM
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Sunita Meena</h4>
                <p className="text-[11px] text-slate-500">Jaipur Heritage Kurtis, Jaipur</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Award key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
              "No UPC barcode gatekeeping meant we could add 120 electronic accessories in one weekend. The live order chime alert on the seller dashboard keeps our warehouse packing team hyper-productive."
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                AV
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Alok Verma</h4>
                <p className="text-[11px] text-slate-500">Verma Tech & Cables, Delhi</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. SUPPLIER FAQS ACCORDION                               */}
      {/* ======================================================== */}
      <section id="faqs" className="py-20 bg-slate-50/70 border-t border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-black text-slate-900">{faq.q}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                    {openFaqIndex === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. HIGH-CONVERSION BOTTOM CALL TO ACTION                 */}
      {/* ======================================================== */}
      <section className="py-16 bg-gradient-to-r from-[#5a0624] via-[#850d3a] to-[#d82a62] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Ready to Grow Your Business Pan-India?
          </h2>
          <p className="text-base text-pink-100 max-w-xl mx-auto">
            Join 11 Lakh+ suppliers selling with 0% commission and guaranteed 7-day automated bank settlements.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleNav('/supplier-register')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#b7004d] hover:bg-pink-50 font-black text-sm shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <span>Start Selling Now (0% Commission)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. COMPREHENSIVE SUPPLIER FOOTER                        */}
      {/* ======================================================== */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-5 h-5 text-[#d82a62]" />
                <span className="text-white font-black text-base">MShoppy Supplier Central</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Empowering India's micro-entrepreneurs, wholesalers, and textile manufacturers with zero-commission e-commerce infrastructure.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Sell Online</h5>
              <ul className="space-y-2">
                <li><a href="#why-sell" className="hover:text-white transition">Why MShoppy</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Profit Calculator</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><button onClick={() => handleNav('/supplier-register')} className="hover:text-white transition">Register as Supplier</button></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Supplier Hub</h5>
              <ul className="space-y-2">
                <li><button onClick={() => handleNav('/supplier-login')} className="hover:text-white transition">Supplier Login</button></li>
                <li><button onClick={() => handleNav('/seller-web-dashboard1')} className="hover:text-white transition">Seller Operations Dashboard</button></li>
                <li><button onClick={() => handleNav('/support-center')} className="hover:text-white transition">Supplier Support Desk</button></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Policies & Trust</h5>
              <ul className="space-y-2">
                <li><button onClick={() => handleNav('/policy?tab=terms')} className="hover:text-white transition">Supplier Code of Conduct</button></li>
                <li><button onClick={() => handleNav('/policy?tab=privacy')} className="hover:text-white transition">Privacy & Data Security</button></li>
                <li><span className="text-emerald-400 font-semibold">✓ 100% Escrow Protected</span></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} MShoppy Technologies Pvt. Ltd. All rights reserved.</p>
            <p>Designed for Indian Wholesalers & Manufacturers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
