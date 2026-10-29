import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import RoleBadge from '../../common/RoleBadge';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'Standard shopping buyer' },
  { value: 'SUPPLIER', label: 'Supplier / Vendor', desc: 'Can list products & manage catalog' },
  { value: 'RESELLER', label: 'Reseller', desc: 'Earns commission sharing products' },
  { value: 'DROPSHIPPER', label: 'Dropshipper', desc: 'Direct merchant fulfillments' },
  { value: 'DRIVER', label: 'Delivery Driver', desc: 'Assigned shipment deliveries' },
  { value: 'ADMIN', label: 'Administrator', desc: 'Full system control & access' },
];

export default function EditUserModal({
  isOpen,
  onClose,
  onSave,
  user = null,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'CUSTOMER',
        password: '', // Clear password field on open
      });
      setShowPassword(false);
      setErrors({});
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.password && formData.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      role: formData.role,
    };

    if (formData.password && formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-pink-50/60 to-purple-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#b7004d] flex items-center justify-center font-bold text-base">
              {(formData.fullName || formData.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Edit User Account</h2>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                UID: {user.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-gray-500" />
              <span>Full Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={formData.fullName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
              }}
              disabled={isSaving}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                errors.fullName
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-gray-500" />
              <span>Email Address</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              disabled={isSaving}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-gray-500" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all"
            />
          </div>

          {/* Account Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Shield size={13} className="text-gray-500" />
              <span>Account Role</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} ({r.desc})
                </option>
              ))}
            </select>
          </div>

          {/* Password Reset / Change Section */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={13} className="text-amber-700" />
                <span>Reset / Change Password</span>
              </label>
              <span className="text-[11px] text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password (min 6 characters)"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                disabled={isSaving}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border text-sm focus:outline-none transition-all ${
                  errors.password
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                    : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-rose-500">{errors.password}</p>
            )}

            <p className="text-[11px] text-amber-800">
              💡 Leave blank to keep existing password. If you enter a new password, it will be updated in Firebase Authentication immediately.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#b7004d] hover:bg-[#96003e] active:scale-95 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Save User Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
