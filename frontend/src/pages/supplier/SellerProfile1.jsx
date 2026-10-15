import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  Store,
  User,
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Building2,
  Save,
  Phone,
  Mail,
  MapPin,
  Landmark
} from 'lucide-react';

export default function SellerProfile1({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('general'); // 'general' | 'bank' | 'gst'
  const [profile, setProfile] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Editable Form States
  const [generalForm, setGeneralForm] = useState({
    storeName: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [bankForm, setBankForm] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  });

  const [gstForm, setGstForm] = useState({
    gstin: '',
    pan: '',
    registeredState: '',
  });

  // Load real profile from backend
  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const res = await supplierApiService.fetchSupplierProfile().catch(() => null);
      const supplier = res || getCurrentSupplier() || {};

      setProfile(supplier);

      setGeneralForm({
        storeName: supplier.storeName || `${supplier.fullName || supplier.name || 'My'}'s Store`,
        fullName: supplier.fullName || supplier.name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || 'Industrial Area Phase 2',
        city: supplier.city || 'Surat',
        state: supplier.state || 'Gujarat',
        pincode: supplier.pincode || '395002',
      });

      if (supplier.bankDetails) {
        setBankForm({
          accountHolder: supplier.bankDetails.accountHolder || supplier.fullName || '',
          bankName: supplier.bankDetails.bankName || 'HDFC Bank',
          accountNumber: supplier.bankDetails.accountNumber || '•••• •••• 4912',
          ifsc: supplier.bankDetails.ifsc || 'HDFC0001234',
          upiId: supplier.bankDetails.upiId || `${supplier.phone || 'supplier'}@upi`,
        });
      }

      if (supplier.gstDetails) {
        setGstForm({
          gstin: supplier.gstDetails.gstin || '29ABCDE1234F1Z5',
          pan: supplier.gstDetails.pan || 'ABCDE1234F',
          registeredState: supplier.gstDetails.registeredState || 'Gujarat',
        });
      }

      if (isRefresh) {
        toast.success('Supplier profile synced');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleTabChange = (tabId) => {
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn(err);
    } finally {
      clearAuthSession();
      toast.success('Logged out successfully');
      handleNav('/supplier-login');
    }
  };

  // 1. Save General Info
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await supplierApiService.updateSupplierProfile(generalForm);
      setProfile((prev) => ({ ...prev, ...updated }));
      toast.success('Store & contact profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update store info');
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Bank Info
  const handleSaveBank = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supplierApiService.updateBankDetails(bankForm);
      toast.success('Direct settlement bank details updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  // 3. Save GST Info
  const handleSaveGst = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supplierApiService.updateGstDetails(gstForm);
      toast.success('GST & Tax compliance details updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update GST info');
    } finally {
      setSaving(false);
    }
  };

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="profile"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Profile Card Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#b7004d] to-[#ff7293] text-white font-black text-2xl flex items-center justify-center shadow-md">
              {supplierDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {supplierDisplayName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Supplier
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                {profile?.email && <span>📧 {profile.email}</span>}
                {profile?.phone && <span>📞 +91 {profile.phone}</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadProfile(true)}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Profile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'general', label: 'Store & Contact Profile', icon: Store },
            { id: 'bank', label: 'Bank & Settlement UPI', icon: Landmark },
            { id: 'gst', label: 'GST & Tax Identification', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#b7004d] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: General & Contact Info */}
        {activeSubTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Store Details & Business Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={generalForm.storeName}
                  onChange={(e) => setGeneralForm({ ...generalForm, storeName: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Authorized Contact Person</label>
                <input
                  type="text"
                  value={generalForm.fullName}
                  onChange={(e) => setGeneralForm({ ...generalForm, fullName: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={generalForm.phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Business Email</label>
                <input
                  type="email"
                  value={generalForm.email}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Warehouse Pickup Address</label>
              <textarea
                rows={2}
                value={generalForm.address}
                onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                className="w-full p-3 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">City</label>
                <input
                  type="text"
                  value={generalForm.city}
                  onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-2xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">State</label>
                <input
                  type="text"
                  value={generalForm.state}
                  onChange={(e) => setGeneralForm({ ...generalForm, state: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-2xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={generalForm.pincode}
                  onChange={(e) => setGeneralForm({ ...generalForm, pincode: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-2xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save General Details'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Bank & Payouts */}
        {activeSubTab === 'bank' && (
          <form onSubmit={handleSaveBank} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Direct Settlement Bank Account & UPI
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-mono font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifsc}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-mono font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Instant Payout UPI ID</label>
                <input
                  type="text"
                  placeholder="e.g. supplier@okhdfcbank"
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Update Settlement Account'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: GST & Tax */}
        {activeSubTab === 'gst' && (
          <form onSubmit={handleSaveGst} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              GSTIN & Tax Compliance Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">15-Digit GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={gstForm.gstin}
                  onChange={(e) => setGstForm({ ...gstForm, gstin: e.target.value.toUpperCase() })}
                  className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">PAN Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={gstForm.pan}
                  onChange={(e) => setGstForm({ ...gstForm, pan: e.target.value.toUpperCase() })}
                  className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">GST Registered State</label>
                <input
                  type="text"
                  value={gstForm.registeredState}
                  onChange={(e) => setGstForm({ ...gstForm, registeredState: e.target.value })}
                  className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save GST & Tax Details'}</span>
            </button>
          </form>
        )}
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
