import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, Loader2, Check } from 'lucide-react';

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        imageUrl: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug when name changes in Add mode
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isEdit
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : prev.slug,
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const handleSlugChange = (e) => {
    const slug = e.target.value.toLowerCase().replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, slug }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating "${initialData?.name}" taxonomy`
                : 'Define a new product classification for the catalog'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Women Ethnic Wear"
              value={formData.name}
              onChange={handleNameChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. women-ethnic-wear"
                value={formData.slug}
                onChange={handleSlugChange}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-all ${
                  errors.slug
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-rose-500 mt-1">{errors.slug}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              Used in routes and product filtering: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">/category/{formData.slug || 'slug'}</code>
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Category Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            />
          </div>

          {/* Image Preview Box */}
          {formData.imageUrl && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-gray-800">Preview</span>
                <p className="text-[11px] text-gray-400 truncate max-w-xs">
                  {formData.imageUrl}
                </p>
              </div>
            </div>
          )}

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
                  {isEdit ? 'Save Changes' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
