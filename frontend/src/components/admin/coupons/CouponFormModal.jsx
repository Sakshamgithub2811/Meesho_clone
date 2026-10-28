import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';

export default function CouponFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'FLAT',
    value: '',
    minOrder: '199',
    maxDiscount: '',
    expiresAt: '',
    usageLimit: '500',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Format expiry date for input type="date"
      let expFormatted = '';
      if (initialData.expiresAt) {
        try {
          expFormatted = new Date(initialData.expiresAt).toISOString().split('T')[0];
        } catch {
          expFormatted = '';
        }
      }

      setFormData({
        code: initialData.code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'FLAT',
        value: initialData.value ?? '',
        minOrder: initialData.minOrder ?? '199',
        maxDiscount: initialData.maxDiscount ?? '',
        expiresAt: expFormatted,
        usageLimit: initialData.usageLimit ?? '500',
        isActive: initialData.isActive !== false,
      });
    } else {
      // Default expiry date: 30 days from now
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      setFormData({
        code: '',
        title: '',
        description: '',
        type: 'FLAT',
        value: '',
        minOrder: '199',
        maxDiscount: '',
        expiresAt: thirtyDays,
        usageLimit: '500',
        isActive: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Random code generator
  const handleGenerateRandomCode = () => {
    const prefixes = ['MEESHO', 'SUPER', 'FESTIVE', 'SAVE', 'VIP', 'OFFER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const code = `${prefix}${num}`;
    setFormData((prev) => ({ ...prev, code }));
    if (errors.code) setErrors((prev) => ({ ...prev, code: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valid discount value is required';
    }
    if (formData.type === 'PERCENT' && parseFloat(formData.value) > 90) {
      newErrors.value = 'Percentage discount cannot exceed 90%';
    }
    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Expiry date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      code: formData.code.trim().toUpperCase().replace(/\s+/g, ''),
      value: parseFloat(formData.value),
      minOrder: parseFloat(formData.minOrder) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: parseInt(formData.usageLimit, 10) || 500,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-pink-50/60 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? 'Edit Coupon Code' : 'Create Promo Code'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating rules for "${initialData?.code}"`
                : 'Configure promotional discount vouchers for buyers'}
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
          {/* Coupon Code + Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleGenerateRandomCode}
                  className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Sparkles size={12} />
                  Auto Generate
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. MEESHO100"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono uppercase tracking-wider focus:outline-none transition-all ${
                errors.code
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            />
            {errors.code && (
              <p className="text-xs text-rose-500 mt-1">{errors.code}</p>
            )}
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Display Title
              </label>
              <input
                type="text"
                placeholder="e.g. Super Saver ₹100 Off"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description / Condition
              </label>
              <input
                type="text"
                placeholder="e.g. Flat ₹100 instant discount on orders above ₹399"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, type: 'FLAT' }))}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    formData.type === 'FLAT'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Flat (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, type: 'PERCENT' }))}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    formData.type === 'PERCENT'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Percent (%)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Discount Value <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                  {formData.type === 'FLAT' ? '₹' : '%'}
                </span>
                <input
                  type="number"
                  placeholder={formData.type === 'FLAT' ? '50' : '15'}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  disabled={isSubmitting}
                  className={`w-full pl-8 pr-3.5 py-2 rounded-xl border text-sm focus:outline-none transition-all ${
                    errors.value
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                  }`}
                />
              </div>
              {errors.value && (
                <p className="text-xs text-rose-500 mt-1">{errors.value}</p>
              )}
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Min Order Amount (₹)
              </label>
              <input
                type="number"
                placeholder="199"
                value={formData.minOrder}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, minOrder: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                placeholder={formData.type === 'PERCENT' ? '150' : 'Same as value'}
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Expiry Date & Usage Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none transition-all ${
                  errors.expiresAt
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
              />
              {errors.expiresAt && (
                <p className="text-xs text-rose-500 mt-1">{errors.expiresAt}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Total Usage Limit
              </label>
              <input
                type="number"
                placeholder="500"
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="text-xs font-semibold text-gray-700">
                Activate this coupon immediately for customer checkout
              </span>
            </label>
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
                  {isEdit ? 'Save Changes' : 'Create Coupon'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
