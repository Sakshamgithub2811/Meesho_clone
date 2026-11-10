import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Mail, User, Check, AlertCircle } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

const ALL_SYSTEM_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'returns', label: 'Returns & Refunds' },
  { id: 'support', label: 'Support Desk' },
  { id: 'products', label: 'Products Catalog' },
  { id: 'categories', label: 'Categories' },
  { id: 'reviews', label: 'Reviews & Ratings' },
  { id: 'flash-sale', label: 'Flash Sale & Deals' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'banners', label: 'Banners' },
  { id: 'cms', label: 'CMS Legal Pages' },
  { id: 'seo', label: 'SEO & Sitemap' },
  { id: 'sellers', label: 'Sellers & Suppliers' },
  { id: 'finance', label: 'Finance & Payouts' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'broadcast', label: 'Broadcast & Push' },
  { id: 'settings', label: 'Platform Settings' },
  { id: 'staff', label: 'Staff Management' },
  { id: 'audit', label: 'Audit Logs' }
];

export default function StaffModal({
  isOpen = false,
  onClose,
  onSubmit,
  loading = false,
  editingStaff = null
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SUPPORT_AGENT');
  const [customPermissions, setCustomPermissions] = useState([
    'orders',
    'returns',
    'support'
  ]);

  useEffect(() => {
    if (editingStaff) {
      setFullName(editingStaff.fullName || '');
      setEmail(editingStaff.email || '');
      setRole(editingStaff.role || 'SUPPORT_AGENT');
      setCustomPermissions(editingStaff.permissions || ['orders', 'returns', 'support']);
    } else {
      setFullName('');
      setEmail('');
      setRole('SUPPORT_AGENT');
      setCustomPermissions(['orders', 'returns', 'support']);
    }
  }, [editingStaff, isOpen]);

  if (!isOpen) return null;

  const handleToggleTab = (tabId) => {
    setCustomPermissions((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    onSubmit({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      customPermissions: role === 'CUSTOM' ? customPermissions : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-pink-50 text-[#b7004d] rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {editingStaff ? 'Edit Staff Member Permissions' : 'Create New Staff Member'}
              </h3>
              <p className="text-xs text-gray-500">
                Assign functional roles and tab-level access rights.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Full Name</label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="text-xs rounded-xl"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Staff Email</label>
              <Input
                type="email"
                required
                disabled={Boolean(editingStaff)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul.support@mshoppy.in"
                className="text-xs rounded-xl disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Role Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Assign Operational Role</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'SUPPORT_AGENT',
                  label: 'Support Agent 🎧',
                  desc: 'Orders, Returns, Customer Tickets'
                },
                {
                  id: 'CATALOG_MODERATOR',
                  label: 'Catalog Moderator 📦',
                  desc: 'Products, Categories, Reviews, Banners'
                },
                {
                  id: 'FINANCE_OFFICER',
                  label: 'Finance Officer 💰',
                  desc: 'Finance, Payouts, Sellers, Orders'
                },
                {
                  id: 'CUSTOM',
                  label: 'Custom Role ⚙️',
                  desc: 'Manually select allowed tabs'
                }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setRole(opt.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    role === opt.id
                      ? 'border-[#b7004d] bg-pink-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs font-bold text-gray-900">{opt.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Tab Permission Checkboxes (Shown only when role === 'CUSTOM') */}
          {role === 'CUSTOM' && (
            <div className="space-y-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Select Accessible Navigation Tabs
                </span>
                <span className="text-[11px] text-gray-500">
                  {customPermissions.length} tabs enabled
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto">
                {ALL_SYSTEM_TABS.map((tab) => {
                  const checked = customPermissions.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#b7004d] bg-white text-[#b7004d]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleTab(tab.id)}
                        className="w-3.5 h-3.5 rounded accent-[#b7004d]"
                      />
                      <span className="truncate">{tab.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="flex items-start gap-2 bg-blue-50/80 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              Staff members can only view and modify the functional tabs permitted above. Access to Super Admin security features remains strictly restricted.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !fullName.trim() || !email.trim()}
              className="rounded-xl bg-[#b7004d] hover:bg-[#9a0041] text-white text-xs font-bold h-9 px-4 cursor-pointer"
            >
              {loading ? 'Saving...' : editingStaff ? 'Update Permissions' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
