import React, { useState, useEffect } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import supplierApiService from '../../services/supplierApiService';

// Default mock supplier data matching design specifications
const DEFAULT_SUPPLIER = {
  name: 'Global Exports Ltd.',
  tier: 'Platinum',
  tierLabel: 'Platinum Supplier',
  rating: 4.8,
  followers: '12.4k',
  experienceYears: '3+',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCE6OlPX9YKVVbJ5AIgZEDbdtzFjReTsS5S2x2JB4eoaKy_M9Yd4NPrnbAOOhjk9BUmv8KsVyyP-1Cho819G1JOHHPWcwCbAsW1K0pU30z09DRyw_nKxSPz9JuFJw1jEsSysFPpGWSk4gZNd32ypS-NwCa87KXYqyvim4V0AReUXWfD8j5W0sGXyCAc1_2Ie1UDAMHEhyMQPP9qwvQJ1sJJAErayaCyqMBnOyC_UIu-EWs5KITx9_wXI1kWGaDtzlKJFesbgpHrC7Q',
  bankDetails: {
    accountHolder: 'Global Exports Ltd.',
    bankName: 'HDFC Bank',
    accountNumber: '•••• •••• 4912',
    ifsc: 'HDFC0001234',
    upiId: 'globalexports@hdfcbank',
  },
  gstDetails: {
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    registeredState: 'Karnataka',
  },
};

const BOTTOM_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'orders', label: 'Orders', icon: 'shopping_bag' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
  { id: 'profile', label: 'Profile', icon: 'person', active: true },
];

export function SupplierProfile({ onBack, onNavigate, onLogout, supplier: propSupplier }) {
  const [supplier, setSupplier] = useState(propSupplier || DEFAULT_SUPPLIER);
  const [activeModal, setActiveModal] = useState(null); // 'bank' | 'gst' | 'business' | 'support' | 'settings' | 'logout' | null
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Bank Form State
  const [bankForm, setBankForm] = useState(supplier.bankDetails || DEFAULT_SUPPLIER.bankDetails);
  // GST Form State
  const [gstForm, setGstForm] = useState(supplier.gstDetails || DEFAULT_SUPPLIER.gstDetails);
  // Store Form State
  const [storeName, setStoreName] = useState(supplier.storeName || supplier.name || '');

  // Load verified live profile from backend on mount
  useEffect(() => {
    supplierApiService.fetchSupplierProfile()
      .then((data) => {
        if (data) {
          setSupplier((prev) => ({ ...prev, ...data }));
          if (data.bankDetails) setBankForm(data.bankDetails);
          if (data.gstDetails) setGstForm(data.gstDetails);
          if (data.storeName || data.name) setStoreName(data.storeName || data.name);
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-[#F8F9FB] text-[#191C1E] min-h-screen pb-32 font-['Inter',sans-serif] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006a34] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================== TopAppBar Navigation Shell ===================== */}
      <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack || (() => window.history.back())}
            aria-label="Go Back"
            className="text-[#FF3F6C] active:scale-95 duration-200 transition-opacity hover:opacity-80 cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] dark:text-white">
            Supplier Profile
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('settings')}
          aria-label="Settings"
          className="text-[#FF3F6C] active:scale-95 duration-200 transition-opacity hover:opacity-80 cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </header>

      {/* Divider */}
      <div className="bg-[#F2F4F6] dark:bg-gray-800 h-[2px] w-full"></div>

      <main className="max-w-md mx-auto pb-8">
        {/* ===================== Profile Header Section ===================== */}
        <section className="px-6 pt-8 pb-10 bg-white dark:bg-gray-900 shadow-xs">
          <div className="flex flex-col items-center">
            {/* Avatar with Gradient border */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#b90041] to-[#4d41df] shadow-md">
                <img
                  alt={supplier.name}
                  src={supplier.avatarUrl}
                  className="w-full h-full rounded-full object-cover border-4 border-white"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#b90041] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg select-none">
                {supplier.tier}
              </div>
            </div>

            <h2 className="mt-6 font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-2xl text-[#191C1E] dark:text-white text-center">
              {supplier.name}
            </h2>

            <div className="flex items-center mt-2 gap-2">
              <div className="flex items-center bg-[#006a34]/10 text-[#006a34] px-2 py-0.5 rounded-lg text-sm font-bold">
                <span
                  className="material-symbols-outlined text-sm mr-1"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                {supplier.rating}
              </div>
              <span className="text-slate-400 text-sm">•</span>
              <span className="text-slate-500 text-sm font-medium italic">
                {supplier.tierLabel}
              </span>
            </div>
          </div>

          {/* Bento Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-10">
            <div className="bg-[#f2f4f6] dark:bg-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xs">
              <span className="text-[#b90041] font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-xl">
                {supplier.rating}
              </span>
              <span className="text-slate-500 text-[10px] font-semibold mt-1 uppercase tracking-wider">
                Avg Rating
              </span>
            </div>

            <div className="bg-[#f2f4f6] dark:bg-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xs">
              <span className="text-[#4d41df] font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-xl">
                {supplier.followers}
              </span>
              <span className="text-slate-500 text-[10px] font-semibold mt-1 uppercase tracking-wider">
                Followers
              </span>
            </div>

            <div className="bg-[#f2f4f6] dark:bg-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xs">
              <span className="text-[#191c1e] dark:text-slate-200 font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-xl">
                {supplier.experienceYears}
              </span>
              <span className="text-slate-500 text-[10px] font-semibold mt-1 uppercase tracking-wider">
                Years
              </span>
            </div>
          </div>
        </section>

        {/* ===================== Menu List Section ===================== */}
        <section className="mt-4 px-6 space-y-3">
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs text-slate-500 uppercase tracking-widest px-1 mb-3">
            Account Settings
          </h3>

          {/* Menu Item: Bank & UPI */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal('bank')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7e8ea] dark:bg-slate-800 flex items-center justify-center text-[#b90041] group-hover:bg-[#b90041] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="font-semibold text-[#191c1e] dark:text-white text-sm">
                  Bank &amp; UPI Details
                </p>
                <p className="text-xs text-slate-500">Manage your payouts</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          {/* Menu Item: GST & Tax */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal('gst')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7e8ea] dark:bg-slate-800 flex items-center justify-center text-[#b90041] group-hover:bg-[#b90041] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <p className="font-semibold text-[#191c1e] dark:text-white text-sm">
                  GST &amp; Tax Info
                </p>
                <p className="text-xs text-slate-500">Tax documents &amp; certificates</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          {/* Menu Item: Business Settings */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal('business')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7e8ea] dark:bg-slate-800 flex items-center justify-center text-[#b90041] group-hover:bg-[#b90041] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <p className="font-semibold text-[#191c1e] dark:text-white text-sm">
                  Business Settings
                </p>
                <p className="text-xs text-slate-500">Store info &amp; preferences</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs text-slate-500 uppercase tracking-widest px-1 pt-6 mb-3">
            Support &amp; System
          </h3>

          {/* Menu Item: Support */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal('support')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7e8ea] dark:bg-slate-800 flex items-center justify-center text-[#4d41df] group-hover:bg-[#4d41df] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">headset_mic</span>
              </div>
              <div>
                <p className="font-semibold text-[#191c1e] dark:text-white text-sm">
                  Customer Support
                </p>
                <p className="text-xs text-slate-500">Help center &amp; ticket history</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          {/* Menu Item: App Settings */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal('settings')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7e8ea] dark:bg-slate-800 flex items-center justify-center text-[#4d41df] group-hover:bg-[#4d41df] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div>
                <p className="font-semibold text-[#191c1e] dark:text-white text-sm">
                  App Settings
                </p>
                <p className="text-xs text-slate-500">Notifications &amp; Privacy</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          {/* Menu Item: Logout */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveModal('logout')}
            className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all mt-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div>
                <p className="font-bold text-[#ba1a1a] text-sm">Logout</p>
                <p className="text-xs text-[#ba1a1a]/70">Sign out of your account</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-red-300">chevron_right</span>
          </div>
        </section>
      </main>

      {/* ===================== Modals ===================== */}

      {/* Bank & UPI Modal */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] mb-1">
              Bank &amp; UPI Details
            </h3>
            <p className="text-xs text-slate-500 mb-4">Edit verified payout accounts</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const updated = await supplierApiService.updateBankDetails(bankForm);
                  setSupplier((prev) => ({ ...prev, bankDetails: updated || bankForm }));
                  showToast('Bank details saved to backend! 💳');
                  setActiveModal(null);
                } catch (err) {
                  showToast('Failed to save bank details: ' + err.message);
                } finally {
                  setIsSaving(false);
                }
              }}
              className="space-y-3 mb-5"
            >
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Account Holder</label>
                <input
                  type="text"
                  value={bankForm.accountHolder || ''}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName || ''}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber || ''}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifsc || ''}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">UPI ID</label>
                <input
                  type="text"
                  value={bankForm.upiId || ''}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#4d41df] outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#FF3F6C] text-white text-xs font-bold rounded-xl hover:bg-[#e0305a] disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GST & Tax Modal */}
      {activeModal === 'gst' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] mb-1">
              GST &amp; Tax Documents
            </h3>
            <p className="text-xs text-slate-500 mb-4">Edit registered credentials</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const updated = await supplierApiService.updateGstDetails(gstForm);
                  setSupplier((prev) => ({ ...prev, gstDetails: updated || gstForm }));
                  showToast('GST details saved to backend! 📄');
                  setActiveModal(null);
                } catch (err) {
                  showToast('Failed to save GST: ' + err.message);
                } finally {
                  setIsSaving(false);
                }
              }}
              className="space-y-3 mb-5"
            >
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstForm.gstin || ''}
                  onChange={(e) => setGstForm({ ...gstForm, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">PAN Number</label>
                <input
                  type="text"
                  value={gstForm.pan || ''}
                  onChange={(e) => setGstForm({ ...gstForm, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Registered State</label>
                <input
                  type="text"
                  value={gstForm.registeredState || ''}
                  onChange={(e) => setGstForm({ ...gstForm, registeredState: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#FF3F6C] text-white text-xs font-bold rounded-xl hover:bg-[#e0305a] disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save GST Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Settings Modal */}
      {activeModal === 'business' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] mb-1">
              Business Settings
            </h3>
            <p className="text-xs text-slate-500 mb-4">Store details and preferences</p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-bold text-slate-700 block">
                Store Name
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                />
              </label>
              <label className="text-xs font-bold text-slate-700 block">
                Contact Email
                <input
                  type="email"
                  defaultValue={supplier.email || 'contact@globalexports.com'}
                  disabled
                  className="mt-1 w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    await supplierApiService.updateSupplierProfile({ name: storeName, storeName });
                    setSupplier((prev) => ({ ...prev, name: storeName, storeName }));
                    showToast('Store settings updated in backend! 🎉');
                    setActiveModal(null);
                  } catch (err) {
                    showToast('Failed to update store: ' + err.message);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-[#FF3F6C] text-white text-xs font-bold rounded-xl"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] mb-1">
              Supplier Support
            </h3>
            <p className="text-xs text-slate-500 mb-4">24/7 dedicated support team</p>

            <div className="space-y-3 mb-5 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-[#4d41df]">call</span>
                <div>
                  <p className="font-bold text-slate-800">Toll Free Helpline</p>
                  <p className="text-xs text-slate-500">1800-890-1222 (9 AM - 7 PM)</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006a34]">chat</span>
                <div>
                  <p className="font-bold text-slate-800">WhatsApp Support</p>
                  <p className="text-xs text-slate-500">+91 98765 43210</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#4d41df] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* App Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] mb-1">
              App Settings
            </h3>
            <p className="text-xs text-slate-500 mb-4">Notifications &amp; Preferences</p>

            <div className="space-y-3 mb-5">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <span className="text-xs font-bold text-slate-700">Order Sound Alerts</span>
                <input type="checkbox" defaultChecked className="accent-[#FF3F6C] w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <span className="text-xs font-bold text-slate-700">Daily Digest Email</span>
                <input type="checkbox" defaultChecked className="accent-[#FF3F6C] w-4 h-4" />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast('Settings saved.');
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-[#FF3F6C] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 text-center">
            <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center text-[#ba1a1a] mb-3">
              <span className="material-symbols-outlined text-3xl">logout</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-[#191C1E] mb-1">
              Logout Account?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to sign out of {supplier.name}?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setActiveModal(null);
                  await supplierApiService.logoutSupplier();
                  if (onLogout) onLogout();
                  else if (onNavigate) onNavigate('/supplier-login');
                  else window.location.href = '/supplier-login';
                }}
                className="flex-1 py-2.5 bg-[#ba1a1a] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-red-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== BottomNavBar Navigation Shell ===================== */}
      <AppBottomNav activeNav="profile" onNavigate={onNavigate} />
    </div>
  );
}

export default SupplierProfile;
