import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { API_V1_BASE } from '../../../config/apiConfig';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import ReviewLightboxModal from './ReviewLightboxModal';
import ReviewReplyModal from './ReviewReplyModal';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  Search,
  RefreshCw,
  Camera,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck
} from 'lucide-react';

const STAR_TABS = [
  { id: 'all', label: 'All Ratings' },
  { id: '5', label: '5 ★' },
  { id: '4', label: '4 ★' },
  { id: '3', label: '3 ★' },
  { id: '2', label: '2 ★' },
  { id: '1', label: '1 ★' }
];

export default function AdminReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Stats & KPIs
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    hiddenReviews: 0,
    mediaReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStarTab, setActiveStarTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, hidden
  const [hasImagesOnly, setHasImagesOnly] = useState(false);

  // Modals
  const [lightboxData, setLightboxData] = useState(null); // { images, initialIndex }
  const [replyingReview, setReplyingReview] = useState(null); // review obj
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Confirmation for Delete
  const [deleteConfirmReview, setDeleteConfirmReview] = useState(null);

  // Fetch reviews from API
  const fetchReviews = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const token = await auth.currentUser?.getIdToken();
      const params = {
        page,
        limit: 15,
        rating: activeStarTab,
        status: statusFilter,
        hasImages: hasImagesOnly ? 'true' : 'false',
        search: searchTerm.trim() || undefined
      };

      const response = await axios.get(`${API_V1_BASE}/admin-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setReviews(response.data.data.reviews || []);
        setStats(response.data.data.stats || {});
        setTotalPages(response.data.data.pagination.totalPages || 1);
        setTotalCount(response.data.data.pagination.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch admin reviews:', error);
      toast.error('Failed to load reviews. Please verify credentials.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, activeStarTab, statusFilter, hasImagesOnly, searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Toggle Visibility (Hide / Delist or Unhide / Approve)
  const handleToggleVisibility = async (review) => {
    try {
      setActionLoadingId(review.id);
      const token = await auth.currentUser?.getIdToken();
      const newHiddenState = !review.isHidden;

      const response = await axios.patch(
        `${API_V1_BASE}/admin-reviews/${review.id}/visibility`,
        { isHidden: newHiddenState },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(
          newHiddenState
            ? 'Review hidden from customer storefront'
            : 'Review approved and published'
        );
        // Optimistic local update
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id
              ? { ...r, isHidden: newHiddenState, status: newHiddenState ? 'HIDDEN' : 'APPROVED' }
              : r
          )
        );
        // Refresh stats silently
        fetchReviews(true);
      }
    } catch (error) {
      console.error('Error toggling review visibility:', error);
      toast.error('Failed to update review visibility');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Official Reply
  const handleSaveReply = async (replyText) => {
    if (!replyingReview) return;
    try {
      setIsSubmittingReply(true);
      const token = await auth.currentUser?.getIdToken();

      const response = await axios.post(
        `${API_V1_BASE}/admin-reviews/${replyingReview.id}/reply`,
        { adminReply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(replyText ? 'Official response published' : 'Official response removed');
        setReviews((prev) =>
          prev.map((r) =>
            r.id === replyingReview.id ? { ...r, adminReply: replyText || null } : r
          )
        );
        setReplyingReview(null);
      }
    } catch (error) {
      console.error('Error saving admin reply:', error);
      toast.error('Failed to save official response');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete Review Permanently
  const handleConfirmDelete = async () => {
    if (!deleteConfirmReview) return;
    try {
      setActionLoadingId(deleteConfirmReview.id);
      const token = await auth.currentUser?.getIdToken();

      const response = await axios.delete(
        `${API_V1_BASE}/admin-reviews/${deleteConfirmReview.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Review permanently deleted');
        setReviews((prev) => prev.filter((r) => r.id !== deleteConfirmReview.id));
        setDeleteConfirmReview(null);
        fetchReviews(true);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* ── 1. Top KPI Summary Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <Card className="border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reviews</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Across all product listings</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Avg Platform Rating */}
        <Card className="border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Platform Rating</p>
              <div className="flex items-center gap-1.5 mt-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.avgRating || 0}</h3>
                <span className="text-amber-500 text-lg">★</span>
                <span className="text-xs text-gray-400 font-medium">/ 5.0</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified buyer aggregate</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        {/* Hidden Reviews */}
        <Card className="border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hidden / Delisted</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.hiddenReviews}</h3>
              <p className="text-[11px] text-rose-500 font-medium mt-0.5">Excluded from storefront</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Reviews with Media */}
        <Card className="border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unboxing Photos</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.mediaReviews}</h3>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Reviews with user photos</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Filter & Search Controls ─────────────────────────── */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 space-y-3">
          {/* Top row: Search + Status + Media + Refresh */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by product, customer, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    fetchReviews();
                  }
                }}
                className="pl-9 text-xs h-9 bg-gray-50/50 border-gray-200 rounded-lg focus:bg-white"
              />
            </div>

            {/* Dropdown Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-pink-500"
              >
                <option value="all">All Moderation Status</option>
                <option value="published">Published / Visible Only</option>
                <option value="hidden">Hidden / Suppressed Only</option>
              </select>

              {/* Has Photos Toggle */}
              <button
                type="button"
                onClick={() => {
                  setHasImagesOnly(!hasImagesOnly);
                  setPage(1);
                }}
                className={`text-xs h-9 px-3.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasImagesOnly
                    ? 'bg-pink-50 border-pink-200 text-pink-700 font-semibold'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>With Photos</span>
              </button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviews(true)}
                disabled={refreshing}
                className="h-9 px-3 text-xs border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Bottom row: Star Rating Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Rating:
            </span>
            {STAR_TABS.map((tab) => {
              const count = tab.id === 'all' ? stats.totalReviews : stats.breakdown?.[tab.id] || 0;
              const isActive = activeStarTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveStarTab(tab.id);
                    setPage(1);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-pink-700/80 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Reviews Feed List ───────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton cards
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded-sm w-36" />
                  <div className="h-4 bg-gray-200 rounded-sm w-20" />
                </div>
                <div className="h-3 bg-gray-200 rounded-sm w-full" />
                <div className="h-3 bg-gray-200 rounded-sm w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
              <Star className="w-7 h-7 text-gray-300" />
            </div>
            <h4 className="text-base font-semibold text-gray-800">No customer reviews found</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              There are no reviews matching the selected filter criteria. Try adjusting the search term or rating filter.
            </p>
          </div>
        ) : (
          // Review Cards
          reviews.map((review) => {
            const isDelisting = actionLoadingId === review.id;
            const hasPhotos = review.images && review.images.length > 0;

            return (
              <div
                key={review.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs space-y-4 ${
                  review.isHidden
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Header: Customer Info & Moderation Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-pink-500 to-rose-400 text-white font-bold flex items-center justify-center text-sm shadow-xs uppercase">
                      {review.user?.fullName?.charAt(0) || review.user?.email?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {review.user?.fullName || 'Customer'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                          <UserCheck className="w-3 h-3" />
                          Verified Buyer
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {review.user?.email || 'No email'} • Reviewed on {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {review.isHidden ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        <EyeOff className="w-3.5 h-3.5" />
                        Hidden from Storefront
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Live on Storefront
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating & Review Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <Star
                          key={starVal}
                          className={`w-4 h-4 ${
                            starVal <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200 fill-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {review.rating}.0 / 5.0
                    </span>
                    {review.title && (
                      <>
                        <span className="text-gray-300">•</span>
                        <h5 className="font-semibold text-sm text-gray-800">{review.title}</h5>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-normal bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                    {review.comment || <span className="italic text-gray-400">Customer left a star rating with no written text.</span>}
                  </p>
                </div>

                {/* Unboxing Photos (if attached) */}
                {hasPhotos && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-pink-600" />
                      Customer Uploaded Photos ({review.images.length}):
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {review.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxData({ images: review.images, initialIndex: idx })}
                          className="relative group w-18 h-18 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer shadow-xs shrink-0"
                        >
                          <img
                            src={imgUrl}
                            alt="Unboxing preview"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Context Strip */}
                {review.product && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                        <img
                          src={review.product.images?.[0] || 'https://placehold.co/100x100?text=Product'}
                          alt={review.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <a
                          href={`/product/${review.product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-gray-900 hover:text-pink-600 line-clamp-1 flex items-center gap-1 group"
                        >
                          <span>{review.product.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="font-semibold text-gray-700">₹{review.product.price}</span>
                          <span>•</span>
                          <span>Supplier: {review.product.supplierName || 'Mshoppy Vendor'}</span>
                          <span>•</span>
                          <span className="text-amber-600 font-medium">★ {review.product.rating || '—'} ({review.product.reviewsCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Official Admin Reply (if present) */}
                {review.adminReply && (
                  <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-700">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Official Platform Response:</span>
                      </div>
                      <button
                        onClick={() => setReplyingReview(review)}
                        className="text-[11px] text-pink-600 hover:text-pink-800 font-medium hover:underline cursor-pointer"
                      >
                        Edit Response
                      </button>
                    </div>
                    <p className="text-xs text-gray-700 italic pl-5">
                      "{review.adminReply}"
                    </p>
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {/* Hide / Unhide Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(review)}
                      disabled={isDelisting}
                      className={`text-xs h-8 cursor-pointer transition-colors ${
                        review.isHidden
                          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      {review.isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                          Approve & Unhide
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                          Hide from Storefront
                        </>
                      )}
                    </Button>

                    {/* Official Response Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingReview(review)}
                      className="text-xs h-8 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                      {review.adminReply ? 'Update Reply' : 'Add Reply'}
                    </Button>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmReview(review)}
                    disabled={isDelisting}
                    className="text-xs h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete Review
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 4. Bottom Pagination Controls ───────────────────────── */}
      {!loading && reviews.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-800">{reviews.length}</span> of{' '}
            <span className="font-semibold text-gray-800">{totalCount}</span> reviews
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="text-xs h-8 px-3 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-gray-600 font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="text-xs h-8 px-3 cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── 5. Lightbox Modal for Unboxing Photos ───────────────── */}
      {lightboxData && (
        <ReviewLightboxModal
          images={lightboxData.images}
          initialIndex={lightboxData.initialIndex}
          onClose={() => setLightboxData(null)}
        />
      )}

      {/* ── 6. Official Admin Reply Modal ──────────────────────── */}
      {replyingReview && (
        <ReviewReplyModal
          review={replyingReview}
          onClose={() => setReplyingReview(null)}
          onSubmit={handleSaveReply}
          isSubmitting={isSubmittingReply}
        />
      )}

      {/* ── 7. Permanent Delete Confirmation Dialog ───────────── */}
      {deleteConfirmReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Delete Review Permanently?</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete this review by{' '}
                <span className="font-semibold text-gray-800">
                  {deleteConfirmReview.user?.fullName || 'Customer'}
                </span>
                ? This action cannot be undone, and the product's average rating will be recalculated.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmReview(null)}
                className="text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4 rounded-lg cursor-pointer"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
