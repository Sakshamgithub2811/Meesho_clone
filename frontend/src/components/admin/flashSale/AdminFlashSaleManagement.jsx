import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { API_V1_BASE } from '../../../config/apiConfig';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Zap,
  Clock,
  Play,
  Pause,
  Plus,
  Trash2,
  Save,
  Search,
  ExternalLink,
  Flame,
  Tag,
  Percent,
  Sparkles,
  TrendingUp,
  Package,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function AdminFlashSaleManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extending, setExtending] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [dealBadge, setDealBadge] = useState('');
  const [resellerBonusNote, setResellerBonusNote] = useState('');
  const [minDiscount, setMinDiscount] = useState(40);
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Featured and Candidate Products
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Product Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Real-time Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Load initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${API_V1_BASE}/admin-flash-sale`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const { config, featuredProducts: feat, candidates: cand } = res.data.data;
        setTitle(config.title || '');
        setSubtitle(config.subtitle || '');
        setBannerBadge(config.bannerBadge || '');
        setDealBadge(config.dealBadge || '');
        setResellerBonusNote(config.resellerBonusNote || '');
        setMinDiscount(config.minDiscount || 40);
        setStatus(config.status || 'ACTIVE');

        if (config.endTime) {
          // Format ISO string to datetime-local value (YYYY-MM-DDTHH:mm)
          const d = new Date(config.endTime);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setEndTime(localIso);
        }

        setFeaturedProducts(feat || []);
        setCandidates(cand || []);
      }
    } catch (error) {
      console.error('Error fetching admin flash sale data:', error);
      toast.error('Failed to load flash sale configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live Countdown Calculation
  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      setTimeLeft({ hours, minutes, seconds, isExpired: diff <= 0 });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Save Settings
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();

      const payload = {
        title,
        subtitle,
        bannerBadge,
        dealBadge,
        resellerBonusNote,
        minDiscount: Number(minDiscount),
        endTime: new Date(endTime).toISOString(),
        status,
        featuredProductIds: featuredProducts.map((p) => p.id)
      };

      const res = await axios.put(`${API_V1_BASE}/admin-flash-sale`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Flash Sale configuration published live!');
        setFeaturedProducts(res.data.data.featuredProducts || []);
      }
    } catch (error) {
      console.error('Error saving flash sale config:', error);
      toast.error('Failed to save flash sale settings');
    } finally {
      setSaving(false);
    }
  };

  // Quick Extend Timer (+2h, +6h, +24h)
  const handleQuickExtend = async (hours) => {
    try {
      setExtending(true);
      const token = await auth.currentUser?.getIdToken();

      const res = await axios.post(
        `${API_V1_BASE}/admin-flash-sale/extend`,
        { hours },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const newEnd = res.data.data.endTime;
        const d = new Date(newEnd);
        const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setEndTime(localIso);
        setStatus('ACTIVE');
        toast.success(`Flash Sale timer extended by ${hours} hours!`);
      }
    } catch (error) {
      console.error('Error extending timer:', error);
      toast.error('Failed to extend timer');
    } finally {
      setExtending(false);
    }
  };

  // Toggle Active / Paused Status
  const handleToggleStatus = () => {
    const nextStatus = status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setStatus(nextStatus);
    toast.info(`Status changed to ${nextStatus}. Click "Save Configuration" to apply live.`);
  };

  // Add Product to Deal
  const handleAddProduct = (product) => {
    if (featuredProducts.some((p) => p.id === product.id)) {
      toast.warning('Product is already in the deal list');
      return;
    }
    setFeaturedProducts((prev) => [product, ...prev]);
    setCandidates((prev) => prev.filter((c) => c.id !== product.id));
    setSearchResults((prev) => prev.filter((s) => s.id !== product.id));
    toast.success(`Added "${product.title.slice(0, 25)}..." to Flash Sale`);
  };

  // Remove Product from Deal
  const handleRemoveProduct = (productId) => {
    const removed = featuredProducts.find((p) => p.id === productId);
    setFeaturedProducts((prev) => prev.filter((p) => p.id !== productId));
    if (removed) {
      setCandidates((prev) => [removed, ...prev]);
    }
    toast.info('Product removed from Flash Sale');
  };

  // Live Catalog Search
  const handleSearchProducts = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${API_V1_BASE}/admin-flash-sale/search-products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query.trim() }
      });
      if (res.data.success) {
        // Exclude products that are already in featuredProducts
        const currentIds = new Set(featuredProducts.map((p) => p.id));
        setSearchResults((res.data.data || []).filter((p) => !currentIds.has(p.id)));
      }
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ── 1. Top Banner: Live Status & Countdown Controller ───── */}
      <Card className="border border-pink-100 shadow-xs bg-linear-to-r from-pink-500 via-rose-500 to-amber-500 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' && !timeLeft.isExpired ? 'bg-emerald-400 animate-ping' : 'bg-amber-300'}`} />
                {status === 'ACTIVE' && !timeLeft.isExpired ? 'LIVE ON STOREFRONT' : status === 'PAUSED' ? 'CAMPAIGN PAUSED' : 'TIMER EXPIRED'}
              </span>
              <a
                href="/flash"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white font-medium underline underline-offset-2 ml-2"
              >
                <span>View Storefront (/flash)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <h2 className="text-2xl font-black tracking-tight drop-shadow-xs">{title || 'Flash Sale'}</h2>
            <p className="text-xs text-white/90 font-medium max-w-md">{subtitle || 'Limited-time discount campaign'}</p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time Remaining
              </p>
              <div className="flex items-center gap-1.5 mt-1 font-mono font-black text-2xl tracking-wider text-white">
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">{pad(timeLeft.hours)}</span>
                <span>:</span>
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">{pad(timeLeft.minutes)}</span>
                <span>:</span>
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-amber-300">{pad(timeLeft.seconds)}</span>
              </div>
            </div>

            {/* Quick Timer Extenders */}
            <div className="flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Quick Extend</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={extending}
                  onClick={() => handleQuickExtend(2)}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
                >
                  +2h
                </button>
                <button
                  type="button"
                  disabled={extending}
                  onClick={() => handleQuickExtend(6)}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
                >
                  +6h
                </button>
                <button
                  type="button"
                  disabled={extending}
                  onClick={() => handleQuickExtend(24)}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
                >
                  +24h
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Two-Column Layout: Form Configuration & Live Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Campaign Settings Editor */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-gray-100 shadow-xs">
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Campaign Settings</h3>
                      <p className="text-[11px] text-gray-500">Configure promotional headlines, timer, and minimum discount</p>
                    </div>
                  </div>

                  {/* Pause / Resume Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    className={`text-xs h-8 cursor-pointer ${
                      status === 'ACTIVE'
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {status === 'ACTIVE' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 mr-1" />
                        Pause Campaign
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Activate Campaign
                      </>
                    )}
                  </Button>
                </div>

                {/* Campaign Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Campaign Title</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Midnight Flash Sale"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Subtitle / Tagline</label>
                    <Input
                      type="text"
                      placeholder="e.g. Up to 75% Off Everything"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {/* Badges & Min Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Banner Headline Badge</label>
                    <Input
                      type="text"
                      placeholder="e.g. Live Lightning Drops"
                      value={bannerBadge}
                      onChange={(e) => setBannerBadge(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Deal Card Badge</label>
                    <Input
                      type="text"
                      placeholder="e.g. ⚡ Limited Stock • Extra 15% Off"
                      value={dealBadge}
                      onChange={(e) => setDealBadge(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">Min Discount (%)</label>
                    <Input
                      type="number"
                      min={5}
                      max={95}
                      value={minDiscount}
                      onChange={(e) => setMinDiscount(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {/* Target End Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-pink-600" />
                      Sale End Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Reseller Bonus Margin Note
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Earn up to ₹150 extra margin per order"
                      value={resellerBonusNote}
                      onChange={(e) => setResellerBonusNote(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {saving ? 'Publishing Changes...' : 'Save & Publish Live'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ── 3. Featured Deal Products Selection ──────────────── */}
          <Card className="border border-gray-100 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Featured Lightning Products ({featuredProducts.length})
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Selected items displayed prominently at the top of the Flash Sale page
                    </p>
                  </div>
                </div>

                {/* Search in catalog */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search catalog to add..."
                    value={searchQuery}
                    onChange={(e) => handleSearchProducts(e.target.value)}
                    className="pl-8 text-xs h-8 bg-gray-50 border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Search Results Dropdown / Panel */}
              {searchQuery.trim() && (
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-indigo-900">
                    Search Results {isSearching && <span className="text-gray-400">(Searching...)</span>}:
                  </p>
                  {searchResults.length === 0 && !isSearching ? (
                    <p className="text-xs text-gray-500 italic">No available products found matching "{searchQuery}".</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {searchResults.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={prod.images?.[0] || 'https://placehold.co/60x60?text=Item'}
                              alt={prod.title}
                              className="w-8 h-8 rounded-md object-cover border border-gray-100 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-gray-800 truncate">{prod.title}</p>
                              <p className="text-[10px] text-gray-500">₹{prod.price} • Stock: {prod.stock}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddProduct(prod)}
                            className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50 shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 mr-0.5" /> Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Currently Selected Featured Products */}
              {featuredProducts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-600">No specific products pinned to Flash Sale</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-0.5">
                    Storefront will showcase catalog items with discount &gt;= {minDiscount}%. You can pin specific products below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-pink-200 transition-all shadow-2xs group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <img
                          src={prod.images?.[0] || 'https://placehold.co/80x80?text=Item'}
                          alt={prod.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 truncate">{prod.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                            <span className="font-semibold text-pink-600">₹{prod.price}</span>
                            <span>•</span>
                            <span>Stock: {prod.stock || 0}</span>
                            <span>•</span>
                            <span className="text-amber-600">★ {prod.rating || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(prod.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-2"
                        title="Remove from Flash Sale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Candidate Products to Add */}
              {candidates.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Recommended Top Products from Catalog:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {candidates.slice(0, 4).map((cand) => (
                      <div
                        key={cand.id}
                        className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 flex flex-col justify-between space-y-2 hover:bg-white hover:border-pink-200 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={cand.images?.[0] || 'https://placehold.co/60x60?text=Item'}
                            alt={cand.title}
                            className="w-9 h-9 rounded-md object-cover border border-gray-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-[11px] font-semibold text-gray-800 truncate">{cand.title}</p>
                            <p className="text-[10px] text-pink-600 font-bold">₹{cand.price}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddProduct(cand)}
                          className="w-full text-[11px] h-7 border-dashed border-gray-300 text-gray-700 hover:border-pink-400 hover:text-pink-600 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add to Deal
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Live Storefront Mockup Preview */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-gray-100 shadow-xs sticky top-24">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  Live Storefront Preview
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Mobile / App View
                </span>
              </div>

              {/* Mockup phone frame */}
              <div className="rounded-2xl border-4 border-gray-800 bg-slate-900 text-white p-4 shadow-xl space-y-3">
                {/* Badge header */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500 text-white">
                    {bannerBadge || 'Live Drops'}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-amber-300 font-bold">
                    <span>{pad(timeLeft.hours)}h</span>:
                    <span>{pad(timeLeft.minutes)}m</span>:
                    <span>{pad(timeLeft.seconds)}s</span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h4 className="font-extrabold text-sm text-white tracking-tight">{title || 'Flash Sale'}</h4>
                  <p className="text-[11px] text-gray-300">{subtitle || 'Limited discounts'}</p>
                </div>

                {/* Deal badge callout */}
                <div className="bg-white/10 rounded-lg p-2 border border-white/10 text-[10px] text-amber-200 font-medium flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{dealBadge || 'Special limited drop'}</span>
                </div>

                {/* Reseller margin callout */}
                {resellerBonusNote && (
                  <div className="bg-emerald-950/70 border border-emerald-500/30 rounded-lg p-2 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{resellerBonusNote}</span>
                  </div>
                )}

                {/* Sample product pill */}
                <div className="bg-white rounded-xl p-2.5 text-gray-900 flex items-center gap-2.5 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={featuredProducts[0]?.images?.[0] || 'https://placehold.co/60x60?text=Deal'}
                      alt="Sample"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-gray-900 truncate">
                      {featuredProducts[0]?.title || 'Featured Lightning Item'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-black text-pink-600">₹{featuredProducts[0]?.price || 299}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                        {minDiscount}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 text-center pt-1">
                Any changes saved here reflect instantly on the customer's <code className="text-pink-600 font-medium">/flash</code> landing page.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
