import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { logout } from '../../redux/userSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DROPSHIPPER_MENU } from './dropshipperMenu';
import { 
  Percent, 
  SlidersHorizontal, 
  Sparkles, 
  Calculator, 
  Share2, 
  Download, 
  Save, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function DropshipperMarginConfig() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Initial config with localStorage persistence
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_margin_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      pricingStrategy: 'FIXED', // 'FIXED' | 'PERCENTAGE'
      fixedMarkup: 200,
      percentageMarkup: 25,
      smartRounding: true, // e.g. 749 instead of 750
      categoryRules: [
        { id: 'ethnic', name: 'Sarees & Ethnic Kurtis', wholesaleAvg: 850, markup: 250, marginPercent: 30, active: true },
        { id: 'western', name: 'Western Tops & Dresses', wholesaleAvg: 550, markup: 180, marginPercent: 32, active: true },
        { id: 'men', name: 'Men Denim & Casual Wear', wholesaleAvg: 650, markup: 200, marginPercent: 30, active: true },
        { id: 'accessories', name: 'Jewelry & Handbags', wholesaleAvg: 299, markup: 150, marginPercent: 50, active: true },
        { id: 'footwear', name: 'Footwear & Sneakers', wholesaleAvg: 799, markup: 250, marginPercent: 31, active: true },
      ],
      shippingMode: 'FREE_TO_CUSTOMER', // 'FREE_TO_CUSTOMER' (markup covers shipping) | 'SEPARATE'
      estimatedShippingFee: 60
    };
  });

  // Simulator Interactive States
  const [sampleWholesale, setSampleWholesale] = useState(699);
  const [sampleShipping, setSampleShipping] = useState(60);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate live simulator pricing
  const calculateSellingPrice = () => {
    let price = sampleWholesale;
    if (config.pricingStrategy === 'FIXED') {
      price += Number(config.fixedMarkup || 0);
    } else {
      price += (price * Number(config.percentageMarkup || 0)) / 100;
    }

    if (config.shippingMode === 'FREE_TO_CUSTOMER') {
      price += Number(sampleShipping || 0);
    }

    price = Math.round(price);
    if (config.smartRounding) {
      // Round to 99 or 49
      const rem = price % 100;
      if (rem < 49) price = price - rem + 49;
      else price = price - rem + 99;
    }
    return price;
  };

  const sellingPrice = calculateSellingPrice();
  const netDropshipperMargin = sellingPrice - sampleWholesale - (config.shippingMode === 'FREE_TO_CUSTOMER' ? sampleShipping : 0);
  const marginPercentage = sampleWholesale > 0 ? ((netDropshipperMargin / sampleWholesale) * 100).toFixed(1) : 0;

  // Handle Save
  const handleSaveConfig = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('meesho_dropshipper_margin_config', JSON.stringify(config));
      setTimeout(() => {
        setIsSaving(false);
        toast.success("Margin & Pricing Rules saved successfully!", {
          description: "All future product shares and order margins will apply this rule."
        });
      }, 500);
    } catch (e) {
      setIsSaving(false);
      toast.error("Failed to save configuration.");
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    setConfig({
      pricingStrategy: 'FIXED',
      fixedMarkup: 200,
      percentageMarkup: 25,
      smartRounding: true,
      categoryRules: [
        { id: 'ethnic', name: 'Sarees & Ethnic Kurtis', wholesaleAvg: 850, markup: 250, marginPercent: 30, active: true },
        { id: 'western', name: 'Western Tops & Dresses', wholesaleAvg: 550, markup: 180, marginPercent: 32, active: true },
        { id: 'men', name: 'Men Denim & Casual Wear', wholesaleAvg: 650, markup: 200, marginPercent: 30, active: true },
        { id: 'accessories', name: 'Jewelry & Handbags', wholesaleAvg: 299, markup: 150, marginPercent: 50, active: true },
        { id: 'footwear', name: 'Footwear & Sneakers', wholesaleAvg: 799, markup: 250, marginPercent: 31, active: true },
      ],
      shippingMode: 'FREE_TO_CUSTOMER',
      estimatedShippingFee: 60
    });
    toast.info("Rules reset to standard B2B defaults.");
  };

  // Export Shopify CSV Feed
  const handleExportShopifyCSV = () => {
    const csvRows = [
      ['Handle', 'Title', 'Wholesale Price', 'Markup', 'Customer Selling Price', 'Dropshipper Margin', 'Stock Status'],
      ['banarasi-silk-pink-kurti', 'Banarasi Silk Embroidered Kurti - Pink', '849', '250', '1099', '250', 'In Stock (Surat Hub)'],
      ['men-stretch-dark-blue-denim', 'Men Slim Fit Stretchable Denim Jeans - 32', '649', '200', '849', '200', 'In Stock (Tirupur Hub)'],
      ['floral-georgette-gown-anarkali', 'Floral Print Georgette Anarkali Gown', '1050', '350', '1400', '350', 'In Stock (Delhi Hub)'],
      ['traditional-kundan-necklace', 'Handcrafted Kundan Choker Necklace Set', '299', '200', '499', '200', 'In Stock (Jaipur Hub)']
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MShoppy_Dropship_Shopify_Feed_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Shopify Product Catalog CSV exported!", {
      description: "You can directly upload this feed to your Shopify / WooCommerce store."
    });
  };

  // Copy Catalog Link
  const handleCopyCatalogLink = () => {
    const storeName = currentUser?.storeName || 'auratrends';
    const link = `https://mshoppy.in/store/${storeName.toLowerCase().replace(/\s+/g, '-')}/catalog?src=ds_auto_margin`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Catalog link copied!", { description: "Share this link with customers on WhatsApp/Instagram." });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Tab change
  const handleTabChange = (tabId) => {
    const findPath = (items) => {
      for (const item of items) {
        if (item.id === tabId && item.path) return item.path;
        if (item.children) {
          const sub = item.children.find(c => c.id === tabId);
          if (sub && sub.path) return sub.path;
        }
      }
      return null;
    };
    const target = findPath(DROPSHIPPER_MENU);
    if (target) navigate(target);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      localStorage.removeItem('meesho_dropshipper_session');
      toast.success("Successfully logged out!");
      navigate('/dropshipper-login');
    } catch (e) {
      toast.error("Logout failed.");
    }
  };

  const dropshipperName = currentUser?.fullName || "Verified Dropshipper";

  return (
    <DashboardLayout
      menuItems={DROPSHIPPER_MENU}
      activeTab="margin-rules"
      onTabChange={handleTabChange}
      roleName="DROPSHIPPER"
      userName={dropshipperName}
      onLogout={handleLogout}
      pageTitle="Margin & Price Markup Rules"
      pageSubtitle="Automate your profit margins, smart price rounding, and catalog feeds"
    >
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full font-['Inter',sans-serif]">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#ffe4ec] via-[#fff0f4] to-[#ffdae3] border border-[#ffb3c6] shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#b7004d]/10 border border-[#b7004d]/20 text-[#b7004d]">
                <Percent className="w-3.5 h-3.5" />
                <span>Automated Profit Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#4a2135] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Global Margin & Price Rule Engine
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Set uniform markup rules across all wholesale supplier items. When you push orders or sync products to your Shopify/WooCommerce store, customer prices calculate automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Button
                type="button"
                onClick={handleExportShopifyCSV}
                variant="outline"
                className="rounded-2xl border-rose-300 text-[#b7004d] hover:bg-rose-50 text-xs font-bold py-2.5 px-4 cursor-pointer flex items-center gap-2 bg-white/80 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Shopify CSV</span>
              </Button>

              <Button
                type="button"
                onClick={handleCopyCatalogLink}
                className="rounded-2xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold py-2.5 px-5 cursor-pointer shadow-md shadow-[#b7004d]/20 flex items-center gap-2 transition-all active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied!" : "Share Store Catalog"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 2-Column Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Pricing Strategy Configuration (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Global Strategy Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-[#b7004d]">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Default Markup Method</h3>
                    <p className="text-xs text-gray-500">Choose how your margin is added on supplier wholesale price</p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, pricingStrategy: 'FIXED' })}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    config.pricingStrategy === 'FIXED'
                      ? 'bg-white text-[#b7004d] shadow-sm border border-pink-100'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Fixed Markup (₹ Flat)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, pricingStrategy: 'PERCENTAGE' })}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    config.pricingStrategy === 'PERCENTAGE'
                      ? 'bg-white text-[#b7004d] shadow-sm border border-pink-100'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span>Percentage (% Markup)</span>
                </button>
              </div>

              {/* Input Slider / Value Row */}
              {config.pricingStrategy === 'FIXED' ? (
                <div className="space-y-3 bg-pink-50/40 p-5 rounded-2xl border border-pink-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Flat Markup Per Item
                    </Label>
                    <span className="text-lg font-black text-[#b7004d]">₹{config.fixedMarkup}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                    value={config.fixedMarkup}
                    onChange={(e) => setConfig({ ...config, fixedMarkup: Number(e.target.value) })}
                    className="w-full accent-[#b7004d] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>₹50 (Fast Turnover)</span>
                    <span>₹200 (Recommended)</span>
                    <span>₹1,000 (Luxury Items)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-pink-50/40 p-5 rounded-2xl border border-pink-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Percentage Markup Over Wholesale
                    </Label>
                    <span className="text-lg font-black text-[#b7004d]">+{config.percentageMarkup}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={config.percentageMarkup}
                    onChange={(e) => setConfig({ ...config, percentageMarkup: Number(e.target.value) })}
                    className="w-full accent-[#b7004d] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>10% (Bulk Vol)</span>
                    <span>25% - 35% (Healthy Margin)</span>
                    <span>100% (High Ticket)</span>
                  </div>
                </div>
              )}

              {/* Smart Psychological Price Rounding Toggle */}
              <div className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="space-y-1 pr-4">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#b7004d]" />
                    <span>Psychological Price Rounding (.99 / .49)</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Auto-rounds calculated customer selling prices to end with ₹49 or ₹99 (e.g. ₹752 becomes ₹749), improving customer conversion rate by ~18%.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.smartRounding}
                  onChange={(e) => setConfig({ ...config, smartRounding: e.target.checked })}
                  className="w-5 h-5 accent-[#b7004d] rounded cursor-pointer mt-1"
                />
              </div>

              {/* Shipping Fee Inclusion */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Customer Shipping Presentation
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setConfig({ ...config, shippingMode: 'FREE_TO_CUSTOMER' })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      config.shippingMode === 'FREE_TO_CUSTOMER'
                        ? 'border-[#b7004d] bg-pink-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        config.shippingMode === 'FREE_TO_CUSTOMER' ? 'border-[#b7004d] bg-[#b7004d]' : 'border-gray-400'
                      }`}>
                        {config.shippingMode === 'FREE_TO_CUSTOMER' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <span>Show "FREE Delivery"</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 pl-5">
                      Est. ₹60 shipping is baked inside the product retail price. Highest conversion!
                    </p>
                  </div>

                  <div
                    onClick={() => setConfig({ ...config, shippingMode: 'SEPARATE' })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      config.shippingMode === 'SEPARATE'
                        ? 'border-[#b7004d] bg-pink-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        config.shippingMode === 'SEPARATE' ? 'border-[#b7004d] bg-[#b7004d]' : 'border-gray-400'
                      }`}>
                        {config.shippingMode === 'SEPARATE' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                      <span>Charge Shipping Separately</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 pl-5">
                      Product shows lower price; courier charges added at checkout.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Category-Level Override Rules */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Niche / Category Markup Rules</h3>
                  <p className="text-xs text-gray-500">Fine-tune margins for high-margin vs high-volume product categories</p>
                </div>
                <span className="text-[11px] font-bold text-[#b7004d] bg-pink-50 px-2.5 py-1 rounded-full">
                  5 Categories Active
                </span>
              </div>

              <div className="space-y-3">
                {config.categoryRules.map((cat, idx) => (
                  <div key={cat.id} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-gray-800">{cat.name}</h5>
                      <span className="text-[11px] text-gray-400">Avg Wholesale: ₹{cat.wholesaleAvg}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">Markup:</span>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                          <Input
                            type="number"
                            value={cat.markup}
                            onChange={(e) => {
                              const newRules = [...config.categoryRules];
                              newRules[idx].markup = Number(e.target.value);
                              setConfig({ ...config, categoryRules: newRules });
                            }}
                            className="h-8 pl-6 pr-2 text-xs font-bold rounded-xl border-gray-200 focus:border-[#b7004d]"
                          />
                        </div>
                      </div>

                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        +{((cat.markup / cat.wholesaleAvg) * 100).toFixed(0)}% Margin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefaults}
                className="rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold px-5 py-5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reset Defaults</span>
              </Button>

              <Button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-[#b7004d] hover:bg-[#92003d] text-white rounded-2xl px-8 py-5 text-xs font-bold shadow-lg shadow-[#b7004d]/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Margin Rules"}</span>
              </Button>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Simulator & Earnings Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Pricing Simulator Card */}
            <div className="bg-gradient-to-br from-[#0a101f] to-[#131b2e] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Profit Calculator</h3>
                    <p className="text-[11px] text-slate-400">Interactive pricing simulation</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-500/30">
                  Real-time
                </span>
              </div>

              {/* Interactive Wholesale Input */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Supplier Wholesale Price</span>
                  <span className="font-mono text-rose-400 font-bold">₹{sampleWholesale}</span>
                </Label>
                <input
                  type="range"
                  min="199"
                  max="2999"
                  step="50"
                  value={sampleWholesale}
                  onChange={(e) => setSampleWholesale(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Price Breakdown Stack */}
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-xs font-medium">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Wholesale Base (Supplier Gets)</span>
                  <span className="text-slate-200 font-bold">₹{sampleWholesale}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Applied Markup ({config.pricingStrategy === 'FIXED' ? `Flat ₹${config.fixedMarkup}` : `+${config.percentageMarkup}%`})</span>
                  <span className="text-rose-400 font-bold">+₹{config.pricingStrategy === 'FIXED' ? config.fixedMarkup : Math.round((sampleWholesale * config.percentageMarkup) / 100)}</span>
                </div>
                {config.shippingMode === 'FREE_TO_CUSTOMER' && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Est. Courier Freight (Covered)</span>
                    <span className="text-slate-300">+₹{sampleShipping}</span>
                  </div>
                )}
                {config.smartRounding && (
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="italic text-slate-500">Psychological Rounding</span>
                    <span className="text-emerald-400">Applied (.99)</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                  <span className="text-white font-bold">Customer Selling Price</span>
                  <span className="text-xl font-black text-rose-400 font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹{sellingPrice}
                  </span>
                </div>
              </div>

              {/* Net Profit Margin Spotlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                    Your Net Profit Margin
                  </span>
                  <h4 className="text-2xl font-black text-emerald-200 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹{netDropshipperMargin}
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    +{marginPercentage}% ROI per unit
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Payout Security Notice */}
              <div className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  Customer payments are collected by MShoppy via Prepaid / COD. The supplier base (₹{sampleWholesale}) is automatically disbursed, and your net margin (₹{netDropshipperMargin}) credits directly into your Escrow Wallet.
                </span>
              </div>
            </div>

            {/* Quick Sourcing CTA Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-[#b7004d]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Ready to Source Products?</h4>
                  <p className="text-xs text-gray-500">Browse verified suppliers with instant dispatch</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Access over 10,000+ ready-to-ship wholesale SKUs in Surat, Tirupur, Jaipur, and Delhi hubs with your configured margins pre-applied.
              </p>

              <Button
                type="button"
                onClick={() => navigate('/supplier-products')}
                className="w-full bg-[#b7004d] hover:bg-[#92003d] text-white rounded-2xl py-3 text-xs font-bold shadow-md shadow-[#b7004d]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Browse Wholesale Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
