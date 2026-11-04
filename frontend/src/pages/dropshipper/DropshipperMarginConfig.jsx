import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { logout } from '../../redux/userSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DROPSHIPPER_MENU } from './dropshipperMenu';
import {
  getDropshipperMarginConfigApi,
  saveDropshipperMarginConfigApi,
  resetDropshipperMarginConfigApi,
  getStoreCategoriesApi
} from '../../services/dropshipperService';
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
  Check,
  Loader2,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const DEFAULT_CONFIG = {
  pricingStrategy: 'FIXED', // 'FIXED' | 'PERCENTAGE'
  fixedMarkup: 200,
  percentageMarkup: 25,
  smartRounding: true, // e.g. 749 instead of 750
  categoryRules: [], // Clean by default: 100% dynamic, no fake pre-filled categories
  shippingMode: 'FREE_TO_CUSTOMER', // 'FREE_TO_CUSTOMER' (markup covers shipping) | 'SEPARATE'
  estimatedShippingFee: 60
};

export default function DropshipperMarginConfig() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const userUid = currentUser?.uid || currentUser?.id || '';

  // Config state (loaded from PostgreSQL database via API)
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCustomRule, setIsCustomRule] = useState(false);

  // Real Database Categories & Dynamic Category Rule Form
  const [dbCategories, setDbCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [catMarkupInput, setCatMarkupInput] = useState(250);

  // Simulator Interactive States
  const [sampleWholesale, setSampleWholesale] = useState(699);
  const [sampleShipping, setSampleShipping] = useState(60);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Fetch Dropshipper Margin Config & Real Categories on Mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoadingConfig(true);
      try {
        // Fetch Real Categories from PostgreSQL
        try {
          const catRes = await getStoreCategoriesApi();
          if (catRes?.success && Array.isArray(catRes.data) && isMounted) {
            setDbCategories(catRes.data);
          }
        } catch (catErr) {
          console.warn("Could not load categories:", catErr);
        }

        // Fetch User Margin Config from PostgreSQL
        if (userUid) {
          const res = await getDropshipperMarginConfigApi(userUid);
          if (res?.success && res.config && isMounted) {
            setConfig({
              ...res.config,
              categoryRules: Array.isArray(res.config.categoryRules) ? res.config.categoryRules : []
            });
            setIsCustomRule(Boolean(res.isCustom));
          }
        }
      } catch (err) {
        console.warn("Could not load margin rules from database:", err);
      } finally {
        if (isMounted) setIsLoadingConfig(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [userUid]);

  // Handler: Add a Category Override (Auto-persists to PostgreSQL)
  const handleAddCategoryRule = async () => {
    if (!selectedCatId) {
      toast.error("Please select a product category from the list.");
      return;
    }
    const targetCat = dbCategories.find(c => c.id === selectedCatId);
    if (!targetCat) return;

    // Check duplicate
    if (config.categoryRules.some(r => r.id === selectedCatId || r.slug === targetCat.slug)) {
      toast.error(`${targetCat.name} already has an active override rule.`);
      return;
    }

    const newRule = {
      id: targetCat.id,
      name: targetCat.name,
      slug: targetCat.slug,
      markup: Number(catMarkupInput) || 200,
      active: true
    };

    const updatedRules = [...config.categoryRules, newRule];

    setConfig(prev => ({
      ...prev,
      categoryRules: updatedRules
    }));

    setIsAddingCategory(false);
    setSelectedCatId('');
    setCatMarkupInput(250);

    // Auto-save immediately to PostgreSQL so refresh never loses it!
    if (userUid) {
      try {
        await saveDropshipperMarginConfigApi({
          firebaseUid: userUid,
          pricingStrategy: config.pricingStrategy,
          fixedMarkup: config.fixedMarkup,
          percentageMarkup: config.percentageMarkup,
          smartRounding: config.smartRounding,
          shippingMode: config.shippingMode,
          estimatedShippingFee: config.estimatedShippingFee,
          categoryRules: updatedRules
        });
        setIsCustomRule(true);
        toast.success(`Override rule for ${targetCat.name} saved to Database!`);
      } catch (e) {
        console.error("Auto-save category rule error:", e);
        toast.error("Rule added to view, but failed to auto-save to DB. Please click 'Save Margin Rules'.");
      }
    }
  };

  // Handler: Delete Category Override (Auto-persists deletion to PostgreSQL)
  const handleDeleteCategoryRule = async (ruleId) => {
    const updatedRules = config.categoryRules.filter(r => r.id !== ruleId);
    setConfig(prev => ({
      ...prev,
      categoryRules: updatedRules
    }));

    if (userUid) {
      try {
        await saveDropshipperMarginConfigApi({
          firebaseUid: userUid,
          pricingStrategy: config.pricingStrategy,
          fixedMarkup: config.fixedMarkup,
          percentageMarkup: config.percentageMarkup,
          smartRounding: config.smartRounding,
          shippingMode: config.shippingMode,
          estimatedShippingFee: config.estimatedShippingFee,
          categoryRules: updatedRules
        });
        toast.info("Category override removed and updated in Database.");
      } catch (e) {
        console.error("Auto-save delete error:", e);
      }
    }
  };

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

  // Handle Save (Persists directly to PostgreSQL Database)
  const handleSaveConfig = async () => {
    if (!userUid) {
      toast.error("User session missing. Please re-login.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await saveDropshipperMarginConfigApi({
        firebaseUid: userUid,
        pricingStrategy: config.pricingStrategy,
        fixedMarkup: config.fixedMarkup,
        percentageMarkup: config.percentageMarkup,
        smartRounding: config.smartRounding,
        shippingMode: config.shippingMode,
        estimatedShippingFee: config.estimatedShippingFee,
        categoryRules: config.categoryRules
      });

      if (res?.success) {
        setIsCustomRule(true);
        toast.success("Margin & Pricing Rules saved to PostgreSQL Database!", {
          description: "All future product shares, orders, and channel syncs will apply this rule."
        });
      }
    } catch (e) {
      console.error("Save Margin Config Error:", e);
      toast.error(e.response?.data?.error || "Failed to save configuration to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default (Resets in PostgreSQL Database)
  const handleResetDefaults = async () => {
    if (!userUid) return;
    setIsResetting(true);
    try {
      const res = await resetDropshipperMarginConfigApi(userUid);
      if (res?.success) {
        setConfig(res.config || DEFAULT_CONFIG);
        setIsCustomRule(false);
        toast.info("Rules reset to standard B2B defaults in database.");
      }
    } catch (e) {
      console.error("Reset Error:", e);
      toast.error("Failed to reset rules in database.");
    } finally {
      setIsResetting(false);
    }
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
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#b7004d]/10 border border-[#b7004d]/20 text-[#b7004d]">
                  <Percent className="w-3.5 h-3.5" />
                  <span>Automated Profit Engine</span>
                </div>
                {isCustomRule ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100/90 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PostgreSQL Custom Rule Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/70 text-gray-600 border border-gray-300">
                    <span>Platform Default Rules</span>
                  </span>
                )}
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
        {isLoadingConfig ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#b7004d]" />
            <p className="text-sm font-semibold text-gray-700">Loading your margin configuration from database...</p>
            <span className="text-xs text-gray-400">PostgreSQL Cloud Synced</span>
          </div>
        ) : (
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

            {/* 2. Category-Level Override Rules (100% Dynamic & Connected to PostgreSQL DB) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Niche / Category Markup Rules</h3>
                  <p className="text-xs text-gray-500">
                    Fine-tune margins for specific product niches. All unlisted categories automatically follow your default markup above.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    config.categoryRules.length > 0 ? 'text-[#b7004d] bg-pink-50' : 'text-gray-500 bg-gray-100'
                  }`}>
                    {config.categoryRules.length} Overrides Active
                  </span>

                  {!isAddingCategory && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsAddingCategory(true)}
                      className="bg-pink-50 hover:bg-pink-100 text-[#b7004d] rounded-xl text-xs font-bold px-3 py-1.5 h-8 border border-pink-200 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Override</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* In-line Add Category Override Form */}
              {isAddingCategory && (
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#b7004d] uppercase tracking-wider">
                      Add New Category Override
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsAddingCategory(false); setSelectedCatId(''); }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <Label className="text-xs font-semibold text-gray-700">Select Product Category (from Database)</Label>
                      <select
                        value={selectedCatId}
                        onChange={(e) => setSelectedCatId(e.target.value)}
                        className="mt-1.5 w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#b7004d]"
                      >
                        <option value="">-- Choose a Category --</option>
                        {dbCategories
                          .filter(c => !config.categoryRules.some(r => r.id === c.id || r.slug === c.slug))
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <Label className="text-xs font-semibold text-gray-700">Flat Markup Per Item (₹)</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                        <Input
                          type="number"
                          value={catMarkupInput}
                          onChange={(e) => setCatMarkupInput(Number(e.target.value))}
                          placeholder="e.g. 250"
                          className="h-10 pl-7 pr-3 text-xs font-bold rounded-xl border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsAddingCategory(false); setSelectedCatId(''); }}
                      className="text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCategoryRule}
                      className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-4 rounded-xl cursor-pointer"
                    >
                      Add Override Rule
                    </Button>
                  </div>
                </div>
              )}

              {/* Category Rules List or Clean Empty State */}
              {config.categoryRules.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#b7004d] mx-auto flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-800">No Category Overrides Configured</h4>
                    <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                      All products currently inherit your default markup (
                      {config.pricingStrategy === 'FIXED' ? `Flat ₹${config.fixedMarkup}` : `+${config.percentageMarkup}%`}
                      ). Click "+ Add Override" above if you wish to define special margins for specific niches (e.g. Jewellery, Footwear).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.categoryRules.map((cat, idx) => (
                    <div key={cat.id || idx} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-gray-800">{cat.name}</h5>
                        <span className="text-[11px] text-gray-400">Custom Category Override</span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600">Markup:</span>
                          <div className="relative w-28">
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

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategoryRule(cat.id)}
                          className="w-8 h-8 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Save Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefaults}
                disabled={isResetting || isSaving}
                className="rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold px-5 py-5 cursor-pointer"
              >
                {isResetting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-gray-500" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>Reset Defaults</span>
              </Button>

              <Button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving || isResetting}
                className="bg-[#b7004d] hover:bg-[#92003d] text-white rounded-2xl px-8 py-5 text-xs font-bold shadow-lg shadow-[#b7004d]/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? "Saving to Database..." : "Save Margin Rules"}</span>
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
        )}

      </div>
    </DashboardLayout>
  );
}
