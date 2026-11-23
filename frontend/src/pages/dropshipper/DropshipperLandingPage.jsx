import React, { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
  Boxes,
  ShoppingBag,
  Share2,
  RefreshCw,
  Sliders,
  DollarSign,
  Compass,
  Check,
  Star
} from 'lucide-react';
import { getDropshipperLandingMetricsApi } from '../../services/dropshipperService';

const FALLBACK_CATEGORIES = [
  { slug: 'women-ethnic', name: 'Women Ethnic & Sarees', icon: '👗', avgWholesalePrice: 349, suggestedRetailPrice: 899, avgMarginPercent: 61 },
  { slug: 'women-western', name: 'Women Western & Tops', icon: '👚', avgWholesalePrice: 229, suggestedRetailPrice: 699, avgMarginPercent: 67 },
  { slug: 'men-fashion', name: 'Men Fashion & Shirts', icon: '👕', avgWholesalePrice: 299, suggestedRetailPrice: 799, avgMarginPercent: 63 },
  { slug: 'footwear', name: 'Shoes & Footwear', icon: '👟', avgWholesalePrice: 399, suggestedRetailPrice: 999, avgMarginPercent: 60 },
  { slug: 'jewellery', name: 'Fashion Jewellery', icon: '💍', avgWholesalePrice: 149, suggestedRetailPrice: 499, avgMarginPercent: 70 },
  { slug: 'home-kitchen', name: 'Home & Kitchen Essentials', icon: '🍳', avgWholesalePrice: 280, suggestedRetailPrice: 750, avgMarginPercent: 62 },
];

const FAQS = [
  {
    q: 'What is MShoppy Dropshipping and how does it work?',
    a: 'MShoppy Dropshipping allows entrepreneurs and creators to sell wholesale products on their own Shopify, WooCommerce, or social media store without buying any advance inventory. You pick items from our 1,500+ factory-direct catalog, set your own selling price, and when a customer orders, our verified suppliers ship it directly to your customer with your custom store brand label.'
  },
  {
    q: 'Do I need advance investment to start dropshipping?',
    a: 'Zero! You never pay for stock upfront. You only pay the wholesale price to the supplier after your retail customer places an order with you. Your retail profit margin is credited directly to your bank account.'
  },
  {
    q: 'Will my customers know the package came from MShoppy or a supplier?',
    a: 'Never. MShoppy operates on a 100% White-Label Fulfillment model. The shipping label and outer parcel packaging show only your store name and your business details. Neither MShoppy nor the manufacturer brand is ever disclosed to your buyer.'
  },
  {
    q: 'How do I export products to Shopify or WooCommerce?',
    a: 'In your Dropshipper Wholesale Catalog, simply multi-select any products and click "Export Catalog". You get ready-to-import Shopify 2024 CSVs, WooCommerce feeds, and universal B2B spreadsheets complete with high-resolution images, variants, and psychological .99 retail price formatting.'
  },
  {
    q: 'What happens if a customer returns or cancels an order (RTO)?',
    a: 'MShoppy provides dedicated Zero-Penalty Return & RTO Protection. If an order is returned due to courier failure, you face zero handling penalty. For damaged or defective returns, you can submit an unboxing photo dispute and receive an instant margin waiver.'
  },
  {
    q: 'When and how do I receive my profit margin payments?',
    a: 'We run an automated 48-Hour Escrow Payout cycle. As soon as courier partners deliver the parcel to your customer, your profit margin is released from escrow and deposited directly into your verified bank account via NEFT/IMPS.'
  },
  {
    q: 'Do I need a GSTIN to start as a dropshipper?',
    a: 'No! While having a GSTIN is beneficial for business expansion, you can start dropshipping on MShoppy right away with basic PAN and Aadhaar identity verification.'
  }
];

export default function DropshipperLandingPage({ onNavigate }) {
  const navigate = useNavigate();

  // Fast-track phone registration lead state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Live dynamic data from Backend API & PostgreSQL Database
  const [landingData, setLandingData] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Interactive Dropshipper Margin Calculator States
  const [calcCategory, setCalcCategory] = useState('women-ethnic');
  const [calcWholesalePrice, setCalcWholesalePrice] = useState(349);
  const [calcSellingPrice, setCalcSellingPrice] = useState(899);
  const [calcOrders, setCalcOrders] = useState(150);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleNav = (path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  // 1. Fetch live metrics from PostgreSQL via Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        setIsLoadingMetrics(true);
        const res = await getDropshipperLandingMetricsApi();
        if (isMounted && res?.success) {
          setLandingData(res);
          // Set initial calculator category from live DB categories
          if (res.calculatorCategories?.length > 0) {
            const firstCat = res.calculatorCategories[0];
            setCalcCategory(firstCat.slug);
            setCalcWholesalePrice(firstCat.avgWholesalePrice || 299);
            setCalcSellingPrice(firstCat.suggestedRetailPrice || 799);
          }
        }
      } catch (err) {
        console.warn('Failed to load live dropshipper metrics:', err.message);
      } finally {
        if (isMounted) setIsLoadingMetrics(false);
      }
    }

    loadMetrics();
    return () => { isMounted = false; };
  }, []);

  // When category changes in calculator, update default wholesale and retail prices
  const categoriesList = useMemo(() => {
    return landingData?.calculatorCategories?.length > 0
      ? landingData.calculatorCategories
      : FALLBACK_CATEGORIES;
  }, [landingData]);

  const handleCategoryChange = (slug) => {
    setCalcCategory(slug);
    const found = categoriesList.find((c) => c.slug === slug);
    if (found) {
      setCalcWholesalePrice(found.avgWholesalePrice);
      setCalcSellingPrice(found.suggestedRetailPrice);
    }
  };

  const handleStartDropshipping = (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');
    if (cleanPhone) {
      try {
        sessionStorage.setItem('mshoppy_dropshipper_prefill_phone', cleanPhone);
      } catch (_) {}
    }
    handleNav('/dropshipper-register');
  };

  // Real-time Dropshipper Profit Calculation Logic
  const calcResults = useMemo(() => {
    const wholesale = Number(calcWholesalePrice) || 299;
    const retail = Number(calcSellingPrice) || 799;
    const orders = Number(calcOrders) || 100;

    // Per order margin calculation
    const perOrderGrossProfit = Math.max(0, retail - wholesale);
    const estCourierCharge = 45; // average standard freight
    const perOrderNetProfit = Math.max(0, perOrderGrossProfit - estCourierCharge);

    const monthlyGrossRevenue = retail * orders;
    const monthlyWholesaleCost = wholesale * orders;
    const monthlyNetProfit = Math.round(perOrderNetProfit * orders);
    const yearlyNetProfit = monthlyNetProfit * 12;
    const profitMarginPercentage = retail > 0 ? Math.round((perOrderNetProfit / retail) * 100) : 0;

    return {
      perOrderGrossProfit,
      perOrderNetProfit,
      monthlyGrossRevenue,
      monthlyWholesaleCost,
      monthlyNetProfit,
      yearlyNetProfit,
      profitMarginPercentage
    };
  }, [calcWholesalePrice, calcSellingPrice, calcOrders]);

  const liveMetrics = landingData?.metrics || {
    totalProducts: 1502,
    totalSuppliers: 45,
    totalOrdersProcessed: 15800,
    avgDispatchHours: 24,
    payoutSpeedHours: 48,
    rtoProtectionRate: '100% Zero-Penalty Policy'
  };

  const trendingProducts = landingData?.sampleProducts || [];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans antialiased selection:bg-[#d82a62] selection:text-white">
      {/* ======================================================== */}
      {/* 1. TOP STICKY DROPSHIPPER NAVIGATION HEADER (Meesho Style)*/}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Identifier */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5a0624] via-[#850d3a] to-[#d82a62] flex items-center justify-center shadow-sm shadow-pink-900/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#b7004d] tracking-tight">MShoppy</span>
                <span className="px-2 py-0.5 rounded-md bg-pink-100 text-[#b7004d] text-[10px] font-black uppercase tracking-wider">
                  Dropshipper
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">₹0 Investment Sourcing Hub</p>
            </div>
          </div>

          {/* Center Anchor Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#why-dropship" className="hover:text-[#b7004d] transition-colors">Why MShoppy</a>
            <a href="#calculator" className="hover:text-[#b7004d] transition-colors flex items-center gap-1">
              <span>Earnings Calculator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </a>
            <a href="#how-it-works" className="hover:text-[#b7004d] transition-colors">How It Works</a>
            <a href="#catalog-preview" className="hover:text-[#b7004d] transition-colors">Wholesale Catalog</a>
            <a href="#categories" className="hover:text-[#b7004d] transition-colors">High Demand</a>
            <a href="#faqs" className="hover:text-[#b7004d] transition-colors">FAQs</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/dropshipper-login')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#b7004d] hover:bg-pink-50/60 border border-slate-200 transition-all cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleNav('/dropshipper-register')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#850d3a] to-[#d82a62] hover:from-[#6b082e] hover:to-[#b7004d] text-white text-xs font-black shadow-md shadow-pink-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Dropshipping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HIGH-IMPACT HERO SECTION (Meesho Rich Wine Theme)     */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#5a0624] via-[#850d3a] to-[#2c0311] text-white pt-12 pb-24 sm:pt-16 sm:pb-32">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-rose-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left 7 Columns: Hero Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span>India's Most Trusted 100% White-Label Dropshipping Ecosystem</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-black tracking-tight leading-[1.15]">
                Start Dropshipping with <span className="text-amber-300">₹0 Investment</span> & Sell to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200">14 Cr+ Customers</span>
              </h1>

              <p className="text-base sm:text-lg text-pink-100/90 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Source directly from {isLoadingMetrics ? '1,500+' : `${liveMetrics.totalProducts}+`} factory catalogs at zero inventory risk. 1-click export to your Shopify store, 100% white-label customer delivery, and 48-hour automated bank payouts.
              </p>

              {/* Fast-Track Phone Input Lead Card (Meesho Signature Lead Capture) */}
              <div className="bg-white/10 backdrop-blur-lg p-2.5 sm:p-3 rounded-3xl border border-white/20 shadow-2xl max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleStartDropshipping} className="flex flex-col sm:flex-row items-center gap-2">
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
                    <span>Start Dropshipping</span>
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
                  <span>₹0 Advance Inventory Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Click Shopify & Woo Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% White-Label Fulfillment</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Visual Live Trust Matrix Card (Meesho Style) */}
            <div className="lg:col-span-5">
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
                
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-pink-200">MShoppy Dropship Network</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                    Live Verified Data
                  </span>
                </div>

                {/* 4 Pillars of Scale */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {liveMetrics.totalProducts}+
                    </div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Factory Catalogs</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-amber-300">
                      14 Crore+
                    </div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Active Buyers</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                      48 Hours
                    </div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Escrow Payout SLA</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-black text-rose-300">
                      ₹0
                    </div>
                    <p className="text-xs text-pink-200/80 mt-1 font-medium">Inventory Risk</p>
                  </div>
                </div>

                {/* Trust Seal */}
                <div className="pt-2 p-4 rounded-2xl bg-black/20 border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">100% White-Label Packaging Guarantee</p>
                    <p className="text-pink-200/80 text-[11px] mt-0.5">Your store name & brand on the box. Supplier is 100% invisible.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2.5 OVERLAPPING ELEVATED STATS STRIP (Meesho Benchmark)  */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-slate-100 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-black text-[#b7004d]">
              {liveMetrics.totalProducts}+
            </div>
            <p className="text-xs font-bold text-slate-500">Live Factory Products</p>
            <span className="text-[10px] font-semibold text-emerald-600 block">✓ Direct Wholesale Sourcing</span>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {liveMetrics.totalSuppliers}+
            </div>
            <p className="text-xs font-bold text-slate-500">Verified Manufacturers</p>
            <span className="text-[10px] font-semibold text-emerald-600 block">✓ Strict Quality Check</span>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-r-0">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              28,000+
            </div>
            <p className="text-xs font-bold text-slate-500">Indian Pincodes Served</p>
            <span className="text-[10px] font-semibold text-emerald-600 block">✓ Express Courier Delivery</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              ₹0
            </div>
            <p className="text-xs font-bold text-slate-500">Advance Capital Needed</p>
            <span className="text-[10px] font-semibold text-emerald-600 block">✓ 100% Risk-Free Model</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CORE VALUE PROPOSITION (Why Dropship on MShoppy)     */}
      {/* ======================================================== */}
      <section id="why-dropship" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
            Why Dropshippers Prefer MShoppy
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Built for High Profit, Zero Hassle Selling
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Unlike foreign platforms with high shipping delays or complex customs, MShoppy connects you directly with domestic Indian factories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: ₹0 Advance Inventory */}
          <div className="bg-white p-7 rounded-3xl border border-pink-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#b7004d] group-hover:text-white transition-all">
                <Percent className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">₹0 Advance Inventory</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Zero dead stock risk. You never purchase goods upfront. Order fulfillment starts only when your customer places an order on your Shopify or Instagram store.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Pay wholesale only after you get paid</span>
            </div>
          </div>

          {/* Card 2: 1-Click Shopify Sync */}
          <div className="bg-white p-7 rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">1-Click Shopify & Woo Sync</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Seamless CSV and REST API catalog export with psychology pricing (.99 formats), multi-variant options, and auto-generated commercial descriptions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Ready-to-import CSVs with high-res photos</span>
            </div>
          </div>

          {/* Card 3: 100% White-Label */}
          <div className="bg-white p-7 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">100% White-Label Sourcing</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Build your own brand. Suppliers ship orders directly to your customers with your store name on the shipping label. MShoppy is never mentioned.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Customer only sees your custom brand</span>
            </div>
          </div>

          {/* Card 4: Zero RTO Penalty */}
          <div className="bg-white p-7 rounded-3xl border border-amber-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Zero RTO Liability & Cover</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Tired of losing money on customer returns? MShoppy provides integrated RTO dispute claims, carrier CCTV verification, and full margin protection.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zero cancellation fines on returns</span>
            </div>
          </div>

          {/* Card 5: 48-Hour Escrow Payout */}
          <div className="bg-white p-7 rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">48-Hour Bank Margin Payout</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Direct NEFT/IMPS bank transfer within 48 hours of successful customer delivery. No 30-day payout holding periods or hidden reserve fees.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Automated direct deposit settlements</span>
            </div>
          </div>

          {/* Card 6: Pan-India Express Logistics */}
          <div className="bg-white p-7 rounded-3xl border border-sky-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Pan-India Express Logistics</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Real-time AWB sync across 28,000+ Indian pincodes with Delhivery, Shadowfax, and Xpressbees. Automated WhatsApp alerts keep delivery rates high.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Cash on Delivery (COD) pre-enabled</span>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. DYNAMIC INTERACTIVE PROFIT CALCULATOR (Meesho Special) */}
      {/* ======================================================== */}
      <section id="calculator" className="py-20 bg-gradient-to-b from-white to-pink-50/50 border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Live Margin Simulator</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              See How Much You Can Earn Every Month
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Select your product category and sliders to simulate your monthly take-home profit on MShoppy.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-200 shadow-xl max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Interactive Sliders & Category Pickers */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. Category Selection */}
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
                    <span>1. Select Sourcing Category</span>
                    <span className="text-[11px] text-[#b7004d] font-bold lowercase">from live catalog</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                          calcCategory === cat.slug
                            ? 'bg-pink-50 border-[#b7004d] text-[#b7004d] shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <div className="min-w-0">
                          <p className="truncate">{cat.name.split('&')[0]}</p>
                          <span className="text-[10px] text-slate-400 font-medium block">Avg ₹{cat.avgWholesalePrice}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sourcing Price Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      2. Factory Wholesale Cost
                    </label>
                    <span className="text-base font-black text-slate-900">₹{calcWholesalePrice}</span>
                  </div>
                  <input
                    type="range"
                    min="99"
                    max="1500"
                    step="10"
                    value={calcWholesalePrice}
                    onChange={(e) => setCalcWholesalePrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#b7004d]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                    <span>₹99 (Accessories)</span>
                    <span>₹750</span>
                    <span>₹1,500 (Apparel)</span>
                  </div>
                </div>

                {/* 3. Retail Selling Price Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      3. Your Selling Price (Shopify / Store)
                    </label>
                    <span className="text-base font-black text-[#b7004d]">₹{calcSellingPrice}</span>
                  </div>
                  <input
                    type="range"
                    min={Number(calcWholesalePrice) + 100}
                    max="3500"
                    step="20"
                    value={calcSellingPrice}
                    onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#b7004d]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                    <span>Break-even</span>
                    <span>₹1,800</span>
                    <span>₹3,500 (Premium)</span>
                  </div>
                </div>

                {/* 4. Monthly Orders Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      4. Estimated Monthly Orders
                    </label>
                    <span className="text-base font-black text-emerald-600">{calcOrders} Orders / month</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={calcOrders}
                    onChange={(e) => setCalcOrders(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                    <span>10 (Beginner)</span>
                    <span>500 (Pro)</span>
                    <span>1,000+ (Brand)</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Comparative Results & Profit Callout (Meesho Dark Wine Style) */}
              <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-[#420417] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-bold text-pink-200 uppercase tracking-wider">Monthly Profit Audit</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold text-xs">
                    {calcResults.profitMarginPercentage}% Profit Margin
                  </span>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Sourcing Cost */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Sourcing Cost</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-200 mt-1">
                      ₹{calcResults.monthlyWholesaleCost.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Paid only after customer order
                    </p>
                  </div>

                  {/* Monthly Net Profit */}
                  <div className="bg-emerald-500/15 rounded-2xl p-4 border border-emerald-400/30">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase block">Your Net Profit</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                      ₹{calcResults.monthlyNetProfit.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-emerald-200/80 mt-1">
                      ₹{calcResults.perOrderNetProfit}/order clean profit
                    </p>
                  </div>

                </div>

                {/* Highlighted Net Monthly Difference */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg space-y-1 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
                      Net Take-Home Earnings
                    </span>
                    <div className="text-2xl font-black tracking-tight">
                      ₹{calcResults.monthlyNetProfit.toLocaleString('en-IN')} <span className="text-sm font-normal text-emerald-100">/ month</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNav('/dropshipper-register')}
                    className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs transition active:scale-95 cursor-pointer shrink-0 shadow-sm"
                  >
                    Start Free ➔
                  </button>
                </div>

                <div className="text-center text-[11px] text-pink-200/70 font-medium">
                  Annualized projected revenue: <strong className="text-white">₹{calcResults.yearlyNetProfit.toLocaleString('en-IN')}</strong> per year with MShoppy.
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. LIVE WHOLESALE CATALOG SHOWCASE (Direct from DB)      */}
      {/* ======================================================== */}
      <section id="catalog-preview" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
              Live Sourcing Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Trending Factory Products Ready to Export
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct factory pricing with high resale profit potential. Click export to sync with Shopify.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleNav('/dropshipper-wholesale-catalog')}
            className="px-5 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#b7004d] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 border border-pink-200"
          >
            <span>Explore All {liveMetrics.totalProducts}+ Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleNav('/dropshipper-wholesale-catalog')}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-pink-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col group"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                  +₹{p.estMargin} Profit
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#b7004d] transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.supplierName}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Wholesale</span>
                    <span className="text-xs font-black text-slate-900">₹{p.wholesalePrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase">Sell At</span>
                    <span className="text-xs font-bold text-[#b7004d]">₹{p.suggestedShopifyPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. HOW DROPSHIPPING WORKS (4-Step Pipeline - Meesho UI)  */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How MShoppy Dropshipping Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Start earning within 24 hours of registering your dropshipper account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#5a0624] text-white flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="text-base font-black text-slate-900">Pick Wholesale Catalog</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse 1,500+ top-rated apparel, jewellery, and footwear items with factory-direct bulk pricing.
              </p>
              <div className="text-[11px] font-bold text-[#b7004d] pt-2 border-t border-slate-100">
                Explore catalog ➔
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#850d3a] text-white flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="text-base font-black text-slate-900">1-Click Shopify Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download formatted Shopify CSVs or sync via API. Add your profit margin (e.g. 50-70%) automatically.
              </p>
              <div className="text-[11px] font-bold text-[#b7004d] pt-2 border-t border-slate-100">
                1-Click sync ready ➔
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#b7004d] text-white flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Orders Online</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When your retail customer orders from your store, push the order to MShoppy and pay only wholesale cost.
              </p>
              <div className="text-[11px] font-bold text-[#b7004d] pt-2 border-t border-slate-100">
                Zero inventory needed ➔
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="text-base font-black text-slate-900">Factory Ships & You Profit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manufacturer packs the parcel under your brand name and ships. Within 48 hours, your margin is in your bank!
              </p>
              <div className="text-[11px] font-bold text-emerald-600 pt-2 border-t border-slate-100">
                48-hour escrow payout ➔
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. HIGH-DEMAND CATEGORIES SPOTLIGHT                      */}
      {/* ======================================================== */}
      <section id="categories" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-black text-[#b7004d] uppercase tracking-wider block mb-1">
              Trending Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              High-Demand Dropshipping Categories
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Top segments in India with highest margin potential and low return rates across Shopify stores.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Women Ethnic', margin: '65% Margin', icon: '👗', badge: '🔥 Hot' },
            { name: 'Men Fashion', margin: '60% Margin', icon: '👕', badge: 'Trending' },
            { name: 'Footwear & Shoes', margin: '58% Margin', icon: '👟', badge: 'High Volume' },
            { name: 'Home & Kitchen', margin: '62% Margin', icon: '🍳', badge: 'Popular' },
            { name: 'Electronics & Audio', margin: '55% Margin', icon: '🎧', badge: 'Fast Moving' },
            { name: 'Jewellery & Beauty', margin: '70% Margin', icon: '💍', badge: '🔥 Bestseller' },
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
                  {cat.margin}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (Accordion - Meesho Style) */}
      {/* ======================================================== */}
      <section id="faqs" className="py-20 bg-slate-50/70 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-pink-100 text-[#b7004d] text-xs font-black uppercase tracking-wider">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about launching your dropshipping business on MShoppy.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-6 text-left font-black text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:text-[#b7004d] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="w-8 h-8 rounded-full bg-pink-50 text-[#b7004d] flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. HIGH-CONVERSION BOTTOM CTA (Meesho Deep Wine Theme)   */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#5a0624] via-[#850d3a] to-[#2c0311] text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-pink-200 text-xs font-black uppercase tracking-wider border border-white/20">
            Join 10,000+ Active Dropshippers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Ready to Launch Your ₹0 Investment E-Commerce Business?
          </h2>
          <p className="text-sm sm:text-base text-pink-100 max-w-2xl mx-auto leading-relaxed">
            Get instant access to 1,500+ factory catalogs, white-label packaging, and automated Shopify sync today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/dropshipper-register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#850d3a] hover:bg-pink-50 text-sm font-black shadow-xl shadow-black/20 active:scale-95 transition cursor-pointer"
            >
              Register as Dropshipper Free
            </button>
            <button
              type="button"
              onClick={() => handleNav('/dropshipper-wholesale-catalog')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition cursor-pointer"
            >
              Browse Wholesale Catalog
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. CLEAN MSHOPPY FOOTER                                 */}
      {/* ======================================================== */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5a0624] to-[#d82a62] flex items-center justify-center text-white font-black text-sm">
              M
            </div>
            <span className="text-base font-black text-white">MShoppy Dropshipping</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-white cursor-pointer" onClick={() => handleNav('/p/terms')}>Terms of Service</span>
            <span className="hover:text-white cursor-pointer" onClick={() => handleNav('/p/privacy')}>Privacy Policy</span>
            <span className="hover:text-white cursor-pointer" onClick={() => handleNav('/p/returns')}>RTO Dispute Rules</span>
            <span className="hover:text-white cursor-pointer" onClick={() => handleNav('/dropshipper-dashboard')}>Portal Dashboard</span>
          </div>
          <div>
            © {new Date().getFullYear()} MShoppy Sourcing & Logistics Technologies. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
