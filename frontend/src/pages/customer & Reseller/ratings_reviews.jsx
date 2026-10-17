import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductReviews, checkCanReview } from '../../services/ecommerceService';

export default function RatingsReviews({ onNavigate = () => {}, onBack }) {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [customerPhotos, setCustomerPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All');
  const [helpfulCounts, setHelpfulCounts] = useState({});
  const [helpfulClicked, setHelpfulClicked] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    if (!productId) return;

    const loadReviews = async () => {
      setLoading(true);
      try {
        const data = await getProductReviews(productId);
        if (data) {
          if (data.product) setProduct(data.product);
          if (data.averageRating) setAverageRating(data.averageRating);
          if (data.reviewsCount !== undefined) setReviewsCount(data.reviewsCount);
          if (data.breakdown) setBreakdown(data.breakdown);
          if (Array.isArray(data.customerPhotos)) setCustomerPhotos(data.customerPhotos);
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(
              data.reviews.map((r) => ({
                id: r.id,
                name: r.user?.fullName || 'Verified Buyer',
                initials: (r.user?.fullName || 'VB').slice(0, 2).toUpperCase(),
                rating: r.rating,
                verified: true,
                time: new Date(r.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
                comment: r.comment || r.title || 'Verified purchase review',
                photos: Array.isArray(r.images) ? r.images : [],
                type: r.rating >= 4 ? 'positive' : 'critical',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load product reviews:', err);
      } finally {
        setLoading(false);
      }

      // Check if user has an order delivered for this product and has NOT already reviewed it
      try {
        const elig = await checkCanReview(productId);
        if (elig && elig.canReview && !elig.hasReviewed) {
          setCanReview(true);
        }
      } catch (e) {}

    };

    loadReviews();
  }, [productId]);

  const handleHelpful = (id) => {
    if (helpfulClicked.has(id)) {
      setHelpfulClicked((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setHelpfulCounts((prev) => ({ ...prev, [id]: (prev[id] || 1) - 1 }));
      triggerToast('Removed feedback');
    } else {
      setHelpfulClicked((prev) => new Set(prev).add(id));
      setHelpfulCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      triggerToast('Marked review as Helpful! 👍');
    }
  };

  const filterOptions = ['All', 'With Photos', 'Verified Purchases', 'Positive', 'Critical'];

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'With Photos') return r.photos && r.photos.length > 0;
    if (activeFilter === 'Verified Purchases') return r.verified;
    if (activeFilter === 'Positive') return r.rating >= 4;
    if (activeFilter === 'Critical') return r.rating < 4;
    return true;
  });



  return (
    <div className="bg-[#f8f9fb] font-sans text-[#191c1e] min-h-screen antialiased selection:bg-pink-100 selection:text-pink-600 pb-32">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 h-16 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : onNavigate('product'))}
            className="p-2 hover:bg-slate-100 transition-colors rounded-full active:scale-95 text-[#191c1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div onClick={() => onNavigate(productId ? `/product?id=${productId}` : 'product')} className="cursor-pointer">
            <h1 className="font-extrabold text-base md:text-lg text-[#191c1e]">
              Ratings &amp; Reviews
            </h1>
            <p className="text-[11px] text-slate-400 line-clamp-1">{product?.title || 'Verified Catalog Product'} ➔</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('cart')}
            className="p-2 hover:bg-slate-100 rounded-full active:scale-95 text-slate-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          </button>
          <button
            onClick={() => triggerToast('Review link copied!')}
            className="p-2 hover:bg-slate-100 rounded-full active:scale-95 text-slate-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">share</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 px-4 max-w-3xl mx-auto space-y-6">
        {/* Ratings Overview Section */}
        <section className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Average Rating Block */}
            <div className="flex flex-col items-center justify-center p-5 bg-[#f8f9fb] rounded-2xl md:w-48 border border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black text-[#191c1e]">
                  {reviewsCount > 0 ? averageRating : '0.0'}
                </span>
                <span className="text-lg font-bold text-slate-400">/5</span>
              </div>
              <div className="flex items-center gap-0.5 my-2 text-[#FF3F6C]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg">
                    {reviewsCount > 0 && star <= Math.round(averageRating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold">{reviewsCount.toLocaleString()} Customer Ratings</p>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="flex-1 space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown[star] || 0;
                const pct = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-4 text-slate-700">{star}★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 w-12 text-right font-medium">
                      {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* Popular Filters */}
        <section className="space-y-3">
          <h3 className="font-extrabold text-sm text-[#191c1e]">Popular Filters</h3>
          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF3F6C] text-white shadow-md shadow-pink-500/20 scale-102'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        {/* Real Customer Photos Gallery (Only if actual customer photos exist) */}
        {customerPhotos.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#191c1e]">
                Customer Photos ({customerPhotos.length})
              </h3>
            </div>
            <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1">
              {customerPhotos.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="flex-none w-32 h-40 bg-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-200 shadow-sm"
                >
                  <img
                    src={imgUrl}
                    alt="Customer review photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <span className="text-[10px] text-white font-bold">Verified Buyer Photo</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vertical Helpful Review Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#191c1e]">
              Customer Reviews ({filteredReviews.length})
            </h3>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto text-[#b90041]">
                <span className="material-symbols-outlined text-2xl">rate_review</span>
              </div>
              <h4 className="font-extrabold text-base text-slate-800">No Reviews Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Be the first verified customer to rate and review this product once your order has been delivered!
              </p>
              <button
                type="button"
                onClick={() => onNavigate(productId ? `/write-review?productId=${productId}` : '/write-review')}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#b90041] font-bold text-xs cursor-pointer transition-colors"
              >
                <span>Write a Review</span>
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const isHelpful = helpfulClicked.has(review.id);
              const count = helpfulCounts[review.id] || 0;
              return (
                <div
                  key={review.id}
                  className="p-5 bg-white rounded-3xl shadow-sm border border-slate-100 space-y-3.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-pink-100 text-[#FF3F6C] font-black flex items-center justify-center text-xs">
                        {review.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#191c1e]">{review.name}</span>
                          {review.verified && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              <span
                                className="material-symbols-outlined text-green-700 text-xs"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                verified
                              </span>
                              <span className="text-[10px] font-bold text-green-700">
                                Verified Buyer
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{review.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg text-xs font-black text-[#FF3F6C]">
                      <span>{review.rating}</span>
                      <span>★</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {review.comment}
                  </p>

                  {/* Customer Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 pt-1 overflow-x-auto no-scrollbar">
                      {review.photos.map((p, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
                        >
                          <img
                            src={p}
                            alt="Buyer review photo"
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 italic">
                      {count > 0 ? `${count} people found this helpful` : 'Was this review helpful?'}
                    </p>
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                        isHelpful
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">thumb_up</span>
                      <span>{isHelpful ? 'Helpful ✓' : 'Helpful'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Floating Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-[#191c1e]">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`text-2xl cursor-pointer ${
                        star <= newRating ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Your Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Share details of your experience regarding fabric quality, fit, and customer satisfaction..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#FF3F6C] hover:bg-[#e02659] text-white font-bold text-xs shadow-md shadow-pink-500/25 cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action - ONLY SHOWN IF PRODUCT IS DELIVERED TO USER */}
      {canReview && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-md z-40 border-t border-slate-100 max-w-3xl mx-auto shadow-[0_-8px_30px_rgba(0,0,0,0.06)] animate-in fade-in">
          <button
            onClick={() => onNavigate(productId ? `/write-review?productId=${productId}` : '/write-review')}
            className="w-full bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white py-3.5 rounded-2xl font-extrabold text-sm md:text-base shadow-lg shadow-pink-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">rate_review</span>
            <span>Write a Detailed Review ⭐</span>
          </button>
        </div>
      )}
    </div>
  );
}