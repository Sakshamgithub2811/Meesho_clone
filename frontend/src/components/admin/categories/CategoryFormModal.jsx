import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, Loader2, Check, FolderTree, GitBranch } from 'lucide-react';

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  parentCategories = [],
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    parentId: '',
  });

  const [isSubcategory, setIsSubcategory] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const hasParent = Boolean(initialData.parentId);
      setIsSubcategory(hasParent);
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        imageUrl: initialData.imageUrl || '',
        parentId: initialData.parentId || '',
      });
    } else {
      setIsSubcategory(false);
      setFormData({
        name: '',
        slug: '',
        imageUrl: '',
        parentId: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Filter out current category from eligible parents so it can't be its own parent
  const eligibleParents = parentCategories.filter(
    (p) => !initialData?.id || p.id !== initialData.id
  );

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

  const handleTypeSelect = (isSub) => {
    setIsSubcategory(isSub);
    if (!isSub) {
      setFormData((prev) => ({ ...prev, parentId: '' }));
      if (errors.parentId) {
        setErrors((prev) => ({ ...prev, parentId: null }));
      }
    } else if (!formData.parentId && eligibleParents.length > 0) {
      setFormData((prev) => ({ ...prev, parentId: eligibleParents[0].id }));
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
    if (isSubcategory && !formData.parentId) {
      newErrors.parentId = 'Please select a parent category for this subcategory';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      parentId: isSubcategory && formData.parentId ? formData.parentId : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit
                ? isSubcategory
                  ? 'Edit Subcategory'
                  : 'Edit Category'
                : isSubcategory
                ? 'Create New Subcategory'
                : 'Create New Category'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating "${initialData?.name}" in catalog taxonomy`
                : 'Define a root department or nested subcategory for products'}
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
          {/* Taxonomy Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Taxonomy Classification <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeSelect(false)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  !isSubcategory
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    !isSubcategory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <FolderTree size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Main Category</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Root department (e.g. Women, Men)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect(true)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isSubcategory
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isSubcategory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <GitBranch size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Subcategory</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Child branch under a main parent
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Parent Category Selection (Only if isSubcategory is selected) */}
          {isSubcategory && (
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wider">
                Select Parent Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, parentId: e.target.value }));
                  if (errors.parentId) setErrors((prev) => ({ ...prev, parentId: null }));
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 bg-white rounded-lg border text-sm focus:outline-none transition-all ${
                  errors.parentId
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                    : 'border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              >
                <option value="">-- Choose Parent Category --</option>
                {eligibleParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} (/{parent.slug})
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="text-xs text-rose-500">{errors.parentId}</p>
              )}
              {eligibleParents.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ No main categories available. Please create a main root category first.
                </p>
              )}
            </div>
          )}

          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {isSubcategory ? 'Subcategory Name' : 'Category Name'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={isSubcategory ? 'e.g. Sarees or Kurtis' : 'e.g. Women Ethnic'}
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
                placeholder={isSubcategory ? 'e.g. sarees' : 'e.g. women-ethnic'}
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
              Thumbnail Image URL (Optional)
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
                  {isEdit
                    ? 'Save Changes'
                    : isSubcategory
                    ? 'Create Subcategory'
                    : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

