import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  Star,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Camera,
  Download,
  X,
  User,
  Package,
  Send,
  Edit2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { exportReviewsToCsv } from '../../utils/csvExport';

export default function SellerReviews1({ onNavigate, embedded = false, onNavigateTab }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    totalCustomerPhotos: 0,
    pendingRepliesCount: 0,
  });
  const [profile, setProfile] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('ALL'); // 'ALL' | 5 | 4 | 3 | 2 | 1
  const [photosOnly, setPhotosOnly] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);

  // Active Reply Editing: { [reviewId]: string }
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState(null);
  const [submittingReplyId, setSubmittingReplyId] = useState(null);

  // Photo Lightbox Modal
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch reviews from backend
  const loadReviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [reviewsRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierReviews(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      if (reviewsRes.status === 'fulfilled' && reviewsRes.value) {
        const data = reviewsRes.value;
        const list = Array.isArray(data.reviews) ? data.reviews : (Array.isArray(data) ? data : []);
        setReviews(list);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setReviews([]);
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        setProfile(getCurrentSupplier());
      }

      if (isRefresh) {
        toast.success('Customer reviews and ratings updated');
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      toast.error('Failed to load reviews from server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleTabChange = (tabId) => {
    if (onNavigateTab) return onNavigateTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn(err);
    } finally {
      clearAuthSession();
      toast.success('Logged out successfully');
      handleNav('/supplier-login');
    }
  };

  // Submit Official Seller Reply
  const handleSubmitReply = async (reviewId) => {
    const text = (replyInputs[reviewId] || '').trim();
    if (!text) {
      toast.error('Please enter reply text before submitting');
      return;
    }

    setSubmittingReplyId(reviewId);
    try {
      await supplierApiService.replyToSupplierReview(reviewId, text);

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, adminReply: text, hasReply: true }
            : r
        )
      );

      setStats((prev) => ({
        ...prev,
        pendingRepliesCount: Math.max(0, prev.pendingRepliesCount - 1),
      }));

      toast.success('Official seller reply posted successfully!');
      setActiveReplyBoxId(null);
    } catch (err) {
      console.error('Failed to submit reply:', err);
      toast.error(err.message || 'Failed to submit seller reply');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const prodTitle = (r.product?.title || '').toLowerCase();
    const custName = (r.customer?.name || '').toLowerCase();
    const commentText = (r.comment || '').toLowerCase();
    const titleText = (r.title || '').toLowerCase();

    const matchesSearch = !q || prodTitle.includes(q) || custName.includes(q) || commentText.includes(q) || titleText.includes(q);
    const matchesRating = selectedRating === 'ALL' || r.rating === Number(selectedRating);
    const matchesPhotos = !photosOnly || (r.customerPhotos && r.customerPhotos.length > 0);
    const matchesPending = !pendingOnly || !r.hasReply;

    return matchesSearch && matchesRating && matchesPhotos && matchesPending;
  });

  const handleExportReviews = () => {
    const listToExport = filteredReviews.length > 0 ? filteredReviews : reviews;
    if (listToExport.length === 0) {
      toast.error('No customer reviews available to export');
      return;
    }
    const count = exportReviewsToCsv(listToExport);
    toast.success(`Exported ${count} customer review(s) to CSV spreadsheet!`);
  };

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold tracking-wide uppercase mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            Buyer Feedback & Reputation Hub
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Ratings & Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View verified customer feedback, examine delivery unboxing photos, and post official seller responses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportReviews}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition active:scale-95 cursor-pointer"
            title="Download full customer feedback report in CSV format"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Export Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Refresh Reviews"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Overall Rating</span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-black text-slate-900">{loading ? '...' : (stats.avgRating || '0.0')}</p>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(stats.avgRating || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Reviews</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : (stats.totalReviews ?? reviews.length)}</p>
          <span className="text-[11px] text-slate-500">Verified buyer submissions</span>
        </div>

        {/* Card 3: Unboxing Photos */}
        <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">Customer Photos</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : stats.totalCustomerPhotos}</p>
          <span className="text-[11px] text-pink-600 font-medium">Real unboxing images</span>
        </div>

        {/* Card 4: Pending Replies */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Pending Replies</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : stats.pendingRepliesCount}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Awaiting seller response</span>
        </div>
      </div>

      {/* Rating Breakdown Bars & Quick Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 space-y-2 text-center md:text-left">
          <h3 className="text-sm font-black text-slate-900">Customer Sentiment Breakdown</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ratings are collected exclusively from buyers whose orders have been successfully marked as delivered.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Verified Order Reviews</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.ratingBreakdown?.[stars] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 flex items-center gap-1 justify-end">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stars >= 4 ? 'bg-emerald-500' : stars === 3 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 font-mono text-slate-400 text-right">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar: Search & Filter Pills */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, customer, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition bg-slate-50/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Star Filter */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
            {['ALL', 5, 4, 3, 2, 1].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedRating(st)}
                className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  selectedRating === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{st === 'ALL' ? 'All' : st}</span>
                {st !== 'ALL' && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
              </button>
            ))}
          </div>

          {/* With Photos Filter */}
          <button
            type="button"
            onClick={() => setPhotosOnly((prev) => !prev)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              photosOnly
                ? 'bg-pink-50 border-pink-200 text-[#b7004d]'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photos Only</span>
          </button>

          {/* Pending Reply Filter */}
          <button
            type="button"
            onClick={() => setPendingOnly((prev) => !prev)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              pendingOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Needs Reply</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-40" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          /* Empty State */
          <div className="bg-white py-16 px-6 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <Star className="w-8 h-8 fill-amber-300 text-amber-500 opacity-90" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-800">
                {searchQuery || selectedRating !== 'ALL' || photosOnly || pendingOnly
                  ? 'No Reviews Match Current Filters'
                  : 'Zero Customer Reviews Yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery || selectedRating !== 'ALL' || photosOnly || pendingOnly
                  ? 'Try clearing your rating or photo filters to see all customer feedback.'
                  : 'When customers receive their delivered orders, their star ratings, comments, and real unboxing photos will appear here.'}
              </p>
            </div>
            {(searchQuery || selectedRating !== 'ALL' || photosOnly || pendingOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRating('ALL');
                  setPhotosOnly(false);
                  setPendingOnly(false);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isReplying = activeReplyBoxId === rev.id;
            const currentReplyText = replyInputs[rev.id] !== undefined ? replyInputs[rev.id] : (rev.adminReply || '');

            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 transition-all hover:border-slate-200"
              >
                {/* Top Bar: Product Mini-Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    {rev.product?.image ? (
                      <img
                        src={rev.product.image}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate max-w-sm">
                        {rev.product?.title || 'Merchandise Item'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Listed Price: ₹{Number(rev.product?.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Review Body */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {/* Star Rating Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black text-white ${
                          rev.rating >= 4 ? 'bg-emerald-600' : rev.rating === 3 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      >
                        <span>{rev.rating}</span>
                        <Star className="w-3 h-3 fill-white text-white" />
                      </span>

                      {rev.title && (
                        <h5 className="font-extrabold text-sm text-slate-900">{rev.title}</h5>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rev.customer?.name || 'Verified Buyer'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    </div>
                  </div>

                  {/* Customer Comment Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {rev.comment || 'Customer provided rating without detailed remarks.'}
                  </p>

                  {/* Customer Uploaded Unboxing Photos Strip */}
                  {rev.customerPhotos && rev.customerPhotos.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-pink-600" />
                        <span>Customer Delivery Unboxing Photos ({rev.customerPhotos.length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {rev.customerPhotos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewPhoto(photoUrl)}
                            className="group relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer shadow-xs hover:border-[#b7004d] transition"
                          >
                            <img
                              src={photoUrl}
                              alt={`Customer unboxing proof #${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Official Seller Response Section */}
                <div className="pt-2">
                  {rev.adminReply ? (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Official Seller Response</span>
                          <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded-md">
                            Verified Store
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyInputs((prev) => ({ ...prev, [rev.id]: rev.adminReply }));
                            setActiveReplyBoxId(rev.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Response</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        "{rev.adminReply}"
                      </p>
                    </div>
                  ) : null}

                  {/* Inline Reply Input Box (When clicked or opened) */}
                  {isReplying ? (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#b7004d]" />
                          <span>Post Public Seller Response to Customer</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveReplyBoxId(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={currentReplyText}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [rev.id]: e.target.value }))
                        }
                        placeholder="e.g. Dear buyer, thank you for your feedback! We are glad you loved the fabric. For the size issue, we have updated our measurement guide..."
                        className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 outline-none bg-white transition"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReplyBoxId(null)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingReplyId === rev.id || !currentReplyText.trim()}
                          onClick={() => handleSubmitReply(rev.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>{submittingReplyId === rev.id ? 'Posting...' : 'Post Official Reply'}</span>
                        </button>
                      </div>
                    </div>
                  ) : !rev.adminReply ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyInputs((prev) => ({ ...prev, [rev.id]: '' }));
                        setActiveReplyBoxId(rev.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reply to Customer</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Unboxing Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center cursor-default"
          >
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="High-resolution customer delivery unboxing photo"
              className="max-h-[80vh] w-auto object-contain rounded-2xl"
            />
            <div className="p-3 text-center text-xs text-slate-300 font-medium">
              Verified Customer Unboxing Photo Evidence
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="reviews"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {mainContent}

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
