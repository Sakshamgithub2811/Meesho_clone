import React, { useState, useEffect } from 'react';
import { X, Loader2, Check, Image as ImageIcon } from 'lucide-react';

export default function BannerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    targetUrl: '',
    badgeText: 'MEGA SALE',
    displayOrder: 1,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        imageUrl: initialData.imageUrl || '',
        targetUrl: initialData.targetUrl || '',
        badgeText: initialData.badgeText || 'MEGA SALE',
        displayOrder: initialData.displayOrder ?? 1,
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        imageUrl: '',
        targetUrl: '/category/women-ethnic',
        badgeText: 'MEGA SALE',
        displayOrder: 1,
        isActive: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Banner title is required';
    if (!formData.imageUrl.trim()) errs.imageUrl = 'Image URL is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      displayOrder: parseInt(formData.displayOrder, 10) || 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-pink-50/60 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? 'Edit Promotional Banner' : 'Create Homepage Banner'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating "${initialData?.title}"`
                : 'Add an interactive hero banner to customer slider'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Banner Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Banner Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mega Blockbuster Festive Sale"
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 70% Off on Sarees, Kurtis & Ethnic Sets"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData((p) => ({ ...p, subtitle: e.target.value }))
              }
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Banner Image URL (Landscape 16:9) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((p) => ({ ...p, imageUrl: e.target.value }))
              }
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                errors.imageUrl
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            />
            {errors.imageUrl && (
              <p className="text-xs text-rose-500 mt-1">{errors.imageUrl}</p>
            )}
          </div>

          {/* Live Visual Preview */}
          {formData.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 aspect-[16/7] shadow-inner group">
              <img
                src={formData.imageUrl}
                alt="Banner Preview"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white w-max mb-1">
                  {formData.badgeText || 'LIVE PREVIEW'}
                </span>
                <h4 className="text-sm font-bold truncate">
                  {formData.title || 'Your Headline Here'}
                </h4>
                <p className="text-xs text-gray-300 truncate">
                  {formData.subtitle || 'Your subtitle tagline'}
                </p>
              </div>
            </div>
          )}

          {/* Target URL & Badge Text */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Redirect Link
              </label>
              <input
                type="text"
                placeholder="e.g. /category/women-ethnic"
                value={formData.targetUrl}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, targetUrl: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Badge Tag
              </label>
              <input
                type="text"
                placeholder="e.g. MEGA SALE"
                value={formData.badgeText}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    badgeText: e.target.value.toUpperCase(),
                  }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-semibold uppercase focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Display Order & Active Checkbox */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Slider Position Order
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, displayOrder: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Show live on app
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={14} />
                  {isEdit ? 'Save Changes' : 'Publish Banner'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
