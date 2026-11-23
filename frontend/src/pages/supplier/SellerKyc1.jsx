import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import {
  SUPPLIER_MENU,
  SUPPLIER_ROLES,
  getStoredSupplierSubRole,
  getSupplierMenuForRole,
  isTabAllowedForRole,
} from './supplierNavConfig';
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

// Modular Sub-Components
import KycStatusBanner from '../../components/supplier/kyc/KycStatusBanner';
import KycStep1Business from '../../components/supplier/kyc/KycStep1Business';
import KycStep2Tax from '../../components/supplier/kyc/KycStep2Tax';
import KycStep3Bank from '../../components/supplier/kyc/KycStep3Bank';
import KycStep4Warehouse from '../../components/supplier/kyc/KycStep4Warehouse';
import KycDocPreviewModal from '../../components/supplier/kyc/KycDocPreviewModal';

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

export default function SellerKyc1({ onNavigate, embedded = false, onNavigateTab }) {
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
  const [currentSubRole, setCurrentSubRole] = useState(getStoredSupplierSubRole);

  useEffect(() => {
    const handleRole = (e) => setCurrentSubRole(e?.detail || getStoredSupplierSubRole());
    window.addEventListener('supplier_subrole_changed', handleRole);
    return () => window.removeEventListener('supplier_subrole_changed', handleRole);
  }, []);

  const isAllowed = isTabAllowedForRole('kyc', currentSubRole);
  const currentRoleCfg = SUPPLIER_ROLES[currentSubRole] || SUPPLIER_ROLES.OWNER;

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
    if (onNavigateTab) return onNavigateTab(tabId);
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
  const kycStatus = (
    kycData?.status ||
    kycData?.kyc?.status ||
    (profile?.tierLabel?.toLowerCase().includes('verified') ? 'APPROVED' : null) ||
    'PENDING'
  ).toUpperCase();
  const isApproved =
    kycStatus === 'APPROVED' ||
    kycData?.isVerified === true ||
    Boolean(profile?.tierLabel?.toLowerCase().includes('verified'));
  const isUnderReview = !isApproved && (kycStatus === 'UNDER_REVIEW' || kycStatus === 'PENDING');
  const isRejected = !isApproved && kycStatus === 'REJECTED';
  const isNotSubmitted = !isApproved && (!kycData || kycStatus === 'NOT_SUBMITTED');

  const mainContent = (
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
              onClick={() => loadKyc(true)}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh KYC Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Status Banner */}
        <KycStatusBanner
          isApproved={isApproved}
          isUnderReview={isUnderReview}
          isRejected={isRejected}
          isNotSubmitted={isNotSubmitted}
          kycData={kycData}
        />

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
          {activeStep === 1 && (
            <KycStep1Business
              formData={formData}
              onChange={handleChange}
              onNext={() => setActiveStep(2)}
            />
          )}

          {activeStep === 2 && (
            <KycStep2Tax
              formData={formData}
              onChange={handleChange}
              onDocUpload={handleDocUpload}
              onPreviewDoc={setPreviewDoc}
              onBack={() => setActiveStep(1)}
              onNext={() => setActiveStep(3)}
            />
          )}

          {activeStep === 3 && (
            <KycStep3Bank
              formData={formData}
              onChange={handleChange}
              onDocUpload={handleDocUpload}
              onPreviewDoc={setPreviewDoc}
              onBack={() => setActiveStep(2)}
              onNext={() => setActiveStep(4)}
            />
          )}

          {activeStep === 4 && (
            <KycStep4Warehouse
              formData={formData}
              onChange={handleChange}
              submitting={submitting}
              onBack={() => setActiveStep(3)}
            />
          )}
        </form>

        {/* Document Zoom / Preview Modal */}
        <KycDocPreviewModal
          previewDoc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
    </div>
  );

  if (embedded) {
    if (!isAllowed) {
      return (
        <div className="max-w-2xl mx-auto my-10 bg-white rounded-2xl border border-rose-200 p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Access Restricted: Business KYC Protected
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your role <strong className="text-slate-900 font-bold">{currentRoleCfg.label}</strong> does not have permission to view or edit Business KYC, Bank Account Verification & GSTIN records.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('staff') : handleNav('/seller-web-dashboard1?tab=staff')}
              className="px-5 py-2.5 rounded-xl bg-[#b7004d] text-white font-bold text-xs hover:bg-[#92003d] transition cursor-pointer shadow-xs"
            >
              Open RBAC & Staff Management
            </button>
          </div>
        </div>
      );
    }
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={getSupplierMenuForRole(currentSubRole)}
      activeTab="kyc"
      onTabChange={handleTabChange}
      roleName={`SUPPLIER • ${currentRoleCfg.shortLabel}`}
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {!isAllowed ? (
        <div className="max-w-2xl mx-auto my-10 bg-white rounded-2xl border border-rose-200 p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Access Restricted: Business KYC Protected
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your role <strong className="text-slate-900 font-bold">{currentRoleCfg.label}</strong> does not have permission to view or edit Business KYC, Bank Account Verification & GSTIN records.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/seller-web-dashboard1?tab=staff')}
              className="px-5 py-2.5 rounded-xl bg-[#b7004d] text-white font-bold text-xs hover:bg-[#92003d] transition cursor-pointer shadow-xs"
            >
              Open RBAC & Staff Management
            </button>
          </div>
        </div>
      ) : (
        mainContent
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
