import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  CreditCard,
  FileText,
  Upload,
  Eye,
  RefreshCw,
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  Store,
  Landmark,
  MapPin,
  Phone,
  User,
  Check,
  Sparkles,
  FileCheck,
  Download,
  AlertCircle
} from 'lucide-react';

// Canvas image compressor to optimize uploaded docs to ~100KB
const compressDocImage = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export default function SellerKyc1({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1: Business, 2: GST & PAN, 3: Bank, 4: Warehouse
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessName: '',
    tradeName: '',
    businessType: 'Sole Proprietorship',
    businessAddress: '',
    city: '',
    state: '',
    pincode: '',

    // Step 2: GST & PAN
    gstin: '',
    gstCertificate: '',
    panNumber: '',
    panName: '',
    panImage: '',
    aadhaarNumber: '',
    aadhaarName: '',
    aadhaarFrontImage: '',

    // Step 3: Bank & Settlement
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    accountHolder: '',
    upiId: '',
    chequeImage: '',

    // Step 4: Warehouse & Pickup
    warehouseAddress: '',
    warehousePincode: '',
    warehouseContactPerson: '',
    warehousePhone: '',
  });

  // Load KYC application & profile from backend
  const loadKyc = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const [kycRes, profRes] = await Promise.allSettled([
        supplierApiService.fetchSupplierKyc(),
        supplierApiService.fetchSupplierProfile(),
      ]);

      const prof = (profRes.status === 'fulfilled' && profRes.value) ? profRes.value : getCurrentSupplier();
      setProfile(prof);

      if (kycRes.status === 'fulfilled' && kycRes.value?.kyc) {
        const k = kycRes.value.kyc;
        setKycData(k);
        const docs = k.documents || {};

        setFormData({
          businessName: docs.businessName || prof?.storeName || '',
          tradeName: docs.tradeName || prof?.storeName || '',
          businessType: docs.businessType || 'Sole Proprietorship',
          businessAddress: docs.businessAddress || prof?.address || '',
          city: docs.city || prof?.city || '',
          state: docs.state || prof?.state || '',
          pincode: docs.pincode || prof?.pincode || '',

          gstin: docs.gstin || prof?.gstDetails?.gstin || prof?.gstin || '',
          gstCertificate: docs.gstCertificate || '',
          panNumber: docs.pan?.number || prof?.gstDetails?.pan || prof?.pan || '',
          panName: docs.pan?.nameOnDoc || prof?.fullName || '',
          panImage: docs.pan?.image || '',
          aadhaarNumber: docs.aadhaar?.number || '',
          aadhaarName: docs.aadhaar?.nameOnDoc || '',
          aadhaarFrontImage: docs.aadhaar?.image || '',

          bankName: docs.bank?.bankName || prof?.bankDetails?.bankName || '',
          accountNumber: docs.bank?.accountNumber || prof?.bankDetails?.accountNumber || '',
          confirmAccountNumber: docs.bank?.accountNumber || prof?.bankDetails?.accountNumber || '',
          ifsc: docs.bank?.ifsc || prof?.bankDetails?.ifsc || '',
          accountHolder: docs.bank?.holderName || prof?.bankDetails?.accountHolder || prof?.fullName || '',
          upiId: docs.bank?.upiId || prof?.bankDetails?.upiId || '',
          chequeImage: docs.bank?.chequeImage || '',

          warehouseAddress: docs.warehouse?.address || docs.businessAddress || prof?.address || '',
          warehousePincode: docs.warehouse?.pincode || docs.pincode || prof?.pincode || '',
          warehouseContactPerson: docs.warehouse?.contactPerson || prof?.fullName || '',
          warehousePhone: docs.warehouse?.phone || prof?.phone || '',
        });
      } else if (prof) {
        // Pre-fill from existing profile if available
        setFormData((prev) => ({
          ...prev,
          businessName: prof.storeName || `${prof.fullName || 'My'}'s Enterprise`,
          tradeName: prof.storeName || 'My Store',
          accountHolder: prof.fullName || '',
          bankName: prof.bankDetails?.bankName || 'State Bank of India',
          accountNumber: prof.bankDetails?.accountNumber || '',
          confirmAccountNumber: prof.bankDetails?.accountNumber || '',
          ifsc: prof.bankDetails?.ifsc || '',
          gstin: prof.gstDetails?.gstin || prof.gstin || '',
          panNumber: prof.gstDetails?.pan || prof.pan || '',
          panName: prof.fullName || '',
          warehouseContactPerson: prof.fullName || '',
          warehousePhone: prof.phone || '',
        }));
      }

      if (isRefresh) {
        toast.success('KYC status synchronized');
      }
    } catch (err) {
      console.error('Failed to load KYC:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Document Upload Handler (Single file to compressed data URL)
  const handleDocUpload = async (field, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image (JPEG, PNG) or PDF document');
      return;
    }

    const toastId = toast.loading('Uploading and optimizing document...');
    try {
      let dataUrl = '';
      if (file.type.startsWith('image/')) {
        dataUrl = await compressDocImage(file);
      } else {
        // Read PDF
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      setFormData((prev) => ({ ...prev, [field]: dataUrl }));
      toast.success('Document uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload document', { id: toastId });
    }
  };

  // Quick Demo Autofill
  const handleAutofillDemo = () => {
    setFormData({
      businessName: 'Shree Balaji Textile Mills Pvt Ltd',
      tradeName: 'Balaji Fashion Hub',
      businessType: 'Private Limited Company',
      businessAddress: 'Plot 42, GIDC Textile Park, Ring Road',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395002',

      gstin: '24AAACB1234F1Z8',
      gstCertificate: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      panNumber: 'AAACB1234F',
      panName: 'Shree Balaji Textile Mills',
      panImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      aadhaarNumber: '9876 5432 1098',
      aadhaarName: 'Ramesh Patel',
      aadhaarFrontImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',

      bankName: 'HDFC Bank',
      accountNumber: '50200012345678',
      confirmAccountNumber: '50200012345678',
      ifsc: 'HDFC0000128',
      accountHolder: 'Shree Balaji Textile Mills Pvt Ltd',
      upiId: 'balajitex@hdfcbank',
      chequeImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600',

      warehouseAddress: 'Balaji Logistics Hub, Shed #8, GIDC Industrial Estate',
      warehousePincode: '395002',
      warehouseContactPerson: 'Mahesh Sharma (Dispatch Head)',
      warehousePhone: '9876543210',
    });
    toast.success('Sample verified company details autofilled!');
  };

  // Submit KYC Application
  const handleSubmitKyc = async (e) => {
    e.preventDefault();

    if (!formData.businessName.trim() && !formData.tradeName.trim()) {
      toast.error('Please enter your business or trade name');
      setActiveStep(1);
      return;
    }

    if (!formData.gstin.trim() && !formData.panNumber.trim()) {
      toast.error('GSTIN or PAN card number is required for verification');
      setActiveStep(2);
      return;
    }

    if (formData.accountNumber && formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error('Bank Account numbers do not match');
      setActiveStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const res = await supplierApiService.submitSupplierKyc(formData);
      setKycData(res.kyc);
      toast.success('🎉 KYC documents submitted successfully! Compliance team is reviewing your profile.');
    } catch (err) {
      console.error('KYC submission error:', err);
      toast.error(err.message || 'Failed to submit KYC application');
    } finally {
      setSubmitting(false);
    }
  };

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';
  const kycStatus = kycData?.status || 'PENDING';
  const isApproved = kycStatus === 'APPROVED';
  const isUnderReview = kycStatus === 'UNDER_REVIEW' || (kycData && kycStatus === 'PENDING');
  const isRejected = kycStatus === 'REJECTED';
  const isNotSubmitted = !kycData;

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="kyc"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#b7004d] text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Supplier Trust & Verification
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Supplier KYC & Compliance Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your business entity, GSTIN, PAN, and settlement bank account to unlock unlimited wholesale syndication and instant daily payouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition border border-amber-200 cursor-pointer"
              title="Autofill verified business sample data for quick demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Autofill Demo</span>
            </button>

            <button
              type="button"
              onClick={() => loadKyc(true)}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh KYC Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Status Banner */}
        {isApproved && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-emerald-950">
                    KYC Verified Merchant
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Level 1 Verified
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
                  Your business identity and bank accounts have been verified by Meesho Compliance. Your products receive verified trust badges and daily payouts are active.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                Ref: #{kycData?.id?.slice(-8) || 'VERIFIED'}
              </span>
            </div>
          </div>
        )}

        {isUnderReview && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-amber-950">
                    KYC Under Compliance Review
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                    Verification In Progress
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                  Your documents are currently being checked by the Meesho merchant verification desk. Verification typically completes within 4–12 business hours.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-amber-800 block">
                Application #{kycData?.id?.slice(-8) || 'KYC-SUBMITTED'}
              </span>
              <span className="text-[11px] text-amber-600">Priority Processing</span>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950">
                  Verification Action Needed (KYC Rejected)
                </h3>
                <p className="text-xs text-rose-700">
                  Please review compliance feedback below, update the highlighted documents, and re-submit.
                </p>
              </div>
            </div>

            {kycData?.adminNotes && (
              <div className="p-3.5 rounded-2xl bg-white border border-rose-200 text-xs text-rose-900">
                <span className="font-bold block mb-0.5">Admin Compliance Officer Remarks:</span>
                <p className="italic">{kycData.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        {isNotSubmitted && (
          <div className="p-5 rounded-3xl bg-pink-50/60 border border-pink-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#d82a62] text-white flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  KYC Verification Pending
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complete the 4 sections below to unlock wholesale inventory dropshipping and auto-payouts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="text-xs font-bold text-[#b7004d] hover:underline cursor-pointer shrink-0"
            >
              Load Demo Details ➔
            </button>
          </div>
        )}

        {/* 4-Step Wizard Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          {[
            { step: 1, label: '1. Business Info', icon: Building2 },
            { step: 2, label: '2. GST & PAN', icon: FileText },
            { step: 3, label: '3. Bank & Payout', icon: Landmark },
            { step: 4, label: '4. Warehouse', icon: MapPin },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStep === item.step
                  ? 'bg-white text-[#b7004d] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Multi-Step Form */}
        <form onSubmit={handleSubmitKyc} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          
          {/* ───────────────── STEP 1: BUSINESS & LEGAL ENTITY ───────────────── */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#d82a62]" />
                  <span>Step 1: Business Identity & Store Registration</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter registered business identity details as recognized by state authorities and tax departments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Business Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    placeholder="e.g. Shree Balaji Textile Mills Pvt Ltd"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Trade Name / Store Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tradeName"
                    placeholder="e.g. Balaji Fashion Hub"
                    value={formData.tradeName}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Business Entity Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full h-11 px-3 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none"
                  >
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Private Limited Company">Private Limited Company (Pvt Ltd)</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Individual / Unregistered">Individual / Artisan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    placeholder="e.g. 395002"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Registered Business Address
                </label>
                <textarea
                  name="businessAddress"
                  rows={2}
                  placeholder="Street address, building number, industrial zone..."
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Surat"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Gujarat"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-black transition cursor-pointer shadow-md shadow-pink-600/20"
                >
                  <span>Continue to GST & PAN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 2: GST & PAN VERIFICATION ───────────────── */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#d82a62]" />
                  <span>Step 2: Tax Registration (GSTIN & PAN Verification)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  GSTIN and PAN are required by law for inter-state wholesale e-commerce fulfillment.
                </p>
              </div>

              {/* GSTIN Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      15-Digit GSTIN Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      maxLength={15}
                      placeholder="e.g. 24AAACB1234F1Z8"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full h-11 px-4 text-xs font-mono font-bold uppercase rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white"
                      required
                    />
                  </div>

                  {/* GST Document Upload */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      GST Registration Certificate Proof
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 h-11 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="truncate">
                          {formData.gstCertificate ? 'Certificate Attached ✅' : 'Choose GST Photo/PDF'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleDocUpload('gstCertificate', e.target.files[0])}
                          className="hidden"
                        />
                      </label>

                      {formData.gstCertificate && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ title: 'GST Certificate', url: formData.gstCertificate })}
                          className="w-11 h-11 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#b7004d] flex items-center justify-center shrink-0 cursor-pointer"
                          title="Preview GST Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAN Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      10-Digit PAN Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      maxLength={10}
                      placeholder="e.g. AAACB1234F"
                      value={formData.panNumber}
                      onChange={handleChange}
                      className="w-full h-11 px-4 text-xs font-mono font-bold uppercase rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Name on PAN Card
                    </label>
                    <input
                      type="text"
                      name="panName"
                      placeholder="Exact name on PAN"
                      value={formData.panName}
                      onChange={handleChange}
                      className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white"
                    />
                  </div>

                  {/* PAN Document Upload */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      PAN Card Photo Proof
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 h-11 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="truncate">
                          {formData.panImage ? 'PAN Photo Attached ✅' : 'Upload PAN Card'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDocUpload('panImage', e.target.files[0])}
                          className="hidden"
                        />
                      </label>

                      {formData.panImage && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ title: 'PAN Card Photo', url: formData.panImage })}
                          className="w-11 h-11 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#b7004d] flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aadhaar Box (Optional) */}
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Aadhaar Card (Optional for Individuals)</span>
                  <span className="text-[10px] text-slate-400">Owner Verification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="aadhaarNumber"
                    maxLength={14}
                    placeholder="12-digit Aadhaar Number (Optional)"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white"
                  />

                  <label className="h-11 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="truncate">
                      {formData.aadhaarFrontImage ? 'Aadhaar Attached ✅' : 'Upload Aadhaar Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDocUpload('aadhaarFrontImage', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Business Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-black transition cursor-pointer shadow-md shadow-pink-600/20"
                >
                  <span>Continue to Bank & Payout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 3: BANK & PAYOUT SETTLEMENT ───────────────── */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#d82a62]" />
                  <span>Step 3: Settlement Bank Account & NEFT Payouts</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily wholesale orders payments and customer dispatch reconciliations are credited to this verified account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Beneficiary Account Holder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    placeholder="e.g. Shree Balaji Textile Mills Pvt Ltd"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="e.g. HDFC Bank / State Bank of India"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Bank Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="accountNumber"
                    placeholder="Enter bank account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="confirmAccountNumber"
                    placeholder="Re-enter bank account number"
                    value={formData.confirmAccountNumber}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifsc"
                    maxLength={11}
                    placeholder="e.g. HDFC0000128"
                    value={formData.ifsc}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono font-bold uppercase rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Settlement UPI VPA (Optional)
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    placeholder="e.g. storename@hdfcbank"
                    value={formData.upiId}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>
              </div>

              {/* Cancelled Cheque upload */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Cancelled Cheque or Bank Passbook Proof Photo
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 h-12 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="truncate">
                      {formData.chequeImage ? 'Bank Proof Attached ✅' : 'Upload Cancelled Cheque / Passbook Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDocUpload('chequeImage', e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  {formData.chequeImage && (
                    <button
                      type="button"
                      onClick={() => setPreviewDoc({ title: 'Cancelled Cheque Proof', url: formData.chequeImage })}
                      className="w-12 h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#b7004d] flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to GST & PAN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-black transition cursor-pointer shadow-md shadow-pink-600/20"
                >
                  <span>Continue to Warehouse Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 4: WAREHOUSE & PICKUP LOCATION ───────────────── */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#d82a62]" />
                  <span>Step 4: Dispatch Warehouse & Pickup Location</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Courier logistics partners (Delhivery, Shadowfax, Xpressbees) pick up packed wholesale parcels from this hub.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Warehouse Physical Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="warehouseAddress"
                  rows={3}
                  placeholder="Complete dispatch hub address with landmark, gate number..."
                  value={formData.warehouseAddress}
                  onChange={handleChange}
                  className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Pickup Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="warehousePincode"
                    maxLength={6}
                    placeholder="e.g. 395002"
                    value={formData.warehousePincode}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Dispatch Manager Name
                  </label>
                  <input
                    type="text"
                    name="warehouseContactPerson"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.warehouseContactPerson}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Dispatch Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    name="warehousePhone"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={formData.warehousePhone}
                    onChange={handleChange}
                    className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>
              </div>

              {/* Review summary box */}
              <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs text-[#880e4f] space-y-1.5">
                <p className="font-bold">📋 Legal Declaration & Merchant Agreement:</p>
                <p className="text-pink-900/80 leading-relaxed text-[11px]">
                  By clicking Submit KYC Verification, you certify that the provided GSTIN, PAN, and Bank details are true and belong to the registered legal merchant. False submissions are subject to account suspension per IT Act compliance rules.
                </p>
              </div>

              <div className="flex justify-between items-center pt-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Bank Details</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] hover:opacity-95 text-white text-sm font-black transition cursor-pointer shadow-lg shadow-pink-600/25 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Submitting KYC Documents...' : 'Submit KYC for Verification'}</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>

      {/* Document Zoom / Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-slate-900 text-sm">{previewDoc.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-80 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
