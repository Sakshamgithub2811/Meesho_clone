import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { API_V1_BASE } from '../../../config/apiConfig';
import FlashSaleCountdownBanner from './FlashSaleCountdownBanner';
import FlashSaleSettingsForm from './FlashSaleSettingsForm';
import FlashSaleProductSelector from './FlashSaleProductSelector';
import FlashSalePreviewMockup from './FlashSalePreviewMockup';

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

  // Load initial data from API
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
    toast.info(`Status changed to ${nextStatus}. Click "Save & Publish Live" to apply.`);
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

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ── 1. Top Countdown Controller Banner ────────────────────── */}
      <FlashSaleCountdownBanner
        status={status}
        title={title}
        subtitle={subtitle}
        timeLeft={timeLeft}
        onQuickExtend={handleQuickExtend}
        extending={extending}
      />

      {/* ── 2. Form Settings & Preview Split Layout ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Campaign Form & Product Selector */}
        <div className="lg:col-span-8 space-y-6">
          <FlashSaleSettingsForm
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            bannerBadge={bannerBadge}
            setBannerBadge={setBannerBadge}
            dealBadge={dealBadge}
            setDealBadge={setDealBadge}
            minDiscount={minDiscount}
            setMinDiscount={setMinDiscount}
            endTime={endTime}
            setEndTime={setEndTime}
            resellerBonusNote={resellerBonusNote}
            setResellerBonusNote={setResellerBonusNote}
            status={status}
            onToggleStatus={handleToggleStatus}
            onSave={handleSave}
            saving={saving}
          />

          <FlashSaleProductSelector
            featuredProducts={featuredProducts}
            candidates={candidates}
            searchQuery={searchQuery}
            onSearchChange={handleSearchProducts}
            searchResults={searchResults}
            isSearching={isSearching}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            minDiscount={minDiscount}
          />
        </div>

        {/* Right Column (4 cols): Live Storefront Mockup Preview */}
        <div className="lg:col-span-4">
          <FlashSalePreviewMockup
            title={title}
            subtitle={subtitle}
            bannerBadge={bannerBadge}
            dealBadge={dealBadge}
            resellerBonusNote={resellerBonusNote}
            minDiscount={minDiscount}
            timeLeft={timeLeft}
            sampleProduct={featuredProducts[0] || null}
          />
        </div>
      </div>
    </div>
  );
}
