import React, { useState } from 'react';
import { X, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';

export default function ReviewReplyModal({ review, onClose, onSubmit, isSubmitting }) {
  const [replyText, setReplyText] = useState(review.adminReply || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(replyText.trim());
  };

  const handleRemoveReply = () => {
    onSubmit('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {review.adminReply ? 'Edit Official Response' : 'Reply to Customer Review'}
              </h3>
              <p className="text-xs text-gray-500">
                Visible to all storefront shoppers under this review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Review snippet context */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-700">{review.user?.fullName || 'Customer'}</span>
              <span className="text-amber-500 font-bold">★ {review.rating}/5</span>
            </div>
            <p className="text-xs text-gray-600 italic line-clamp-2">
              "{review.comment || review.title || 'No comment provided'}"
            </p>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Official Admin Response
            </label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Dear customer, we sincerely apologize for the inconvenience. Our team has dispatched a replacement..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none"
            />
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              This response will appear with a verified "Mshoppy Team" badge on the product page.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            {review.adminReply ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveReply}
                disabled={isSubmitting}
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-9 cursor-pointer"
              >
                Remove Response
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-600 text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs h-9 px-4 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                {isSubmitting ? 'Saving...' : 'Publish Response'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
