import React, { useState, useRef, useEffect } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import BankAutocompleteSelect from '../../components/BankAutocompleteSelect';
import { getDropshipperApp, saveDropshipperApp, subscribeDropshipperApp } from '../../services/dropshipperSessionStore';

export default function DropshipperKYCRegister({ onNavigate = () => {}, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  // Sample in-memory application for status tracker preview (resets on refresh)
  const SAMPLE_APPLICATION = {
    id: 'DSP-KYC-9421',
    brandName: 'Aura Trends Luxe',
    proprietorName: 'Sarah James',
    phone: '+91 98765 43210',
    email: 'sarah.james@auratrends.in',
    storeUrl: 'https://auratrends.shop',
    platform: 'Shopify',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '4829 1920 3810',
    businessRegType: 'gstin',
    gstin: '29ABCDE1234F1Z5',
    msmeNumber: 'UDYAM-KR-03-0019482',
    bankName: 'HDFC Bank',
    accountNumber: '50100482910291',
    ifscCode: 'HDFC0001248',
    upiId: 'sarahjames@okaxis',
    submittedAt: 'Today, 02:45 PM',
    status: 'Under Review',
  };

  const [existingApp, setExistingApp] = useState(() => getDropshipperApp() || SAMPLE_APPLICATION);
  const [showStatusTracker, setShowStatusTracker] = useState(false);

  // Step 1: Store & Business Details
  const [formData, setFormData] = useState({
    proprietorName: 'Sarah James',
    email: 'sarah.james@auratrends.in',
    phone: '+91 98765 43210',
    brandName: 'Aura Trends Luxe',
    storeUrl: 'https://auratrends.shop',
    platform: 'Shopify',
    expectedOrders: '50 - 200 orders/month',
    niche: ['Women Western Wear', 'Ethnic Sarees & Kurtis'],

    // Step 2: KYC & Identification
    businessType: 'Individual Dropshipper',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '4829 1920 3810',
    businessRegType: 'gstin', // 'gstin' | 'msme'
    gstin: '29ABCDE1234F1Z5',
    msmeNumber: 'UDYAM-KR-03-0019482',

    // Step 3: Bank & UPI Payouts
    accountHolder: 'Sarah James',
    bankName: 'HDFC Bank',
    accountNumber: '50100482910291',
    confirmAccountNumber: '50100482910291',
    ifscCode: 'HDFC0001248',
    upiId: 'sarahjames@okaxis',

    // Step 4: Terms
    agreedTerms: false,
    agreedRotPolicy: false,
  });

  // Uploaded Document Proofs
  const [panFile, setPanFile] = useState({
    name: 'sarah_james_pan_card.jpg',
    size: '1.8 MB',
    type: 'image/jpeg',
    previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  });
  const [aadhaarFile, setAadhaarFile] = useState({
    name: 'sarah_aadhaar_front_back.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  });
  const [businessRegFile, setBusinessRegFile] = useState({
    name: 'gst_registration_reg06.pdf',
    size: '2.1 MB',
    type: 'application/pdf',
    previewUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80',
  });

  const panInputRef = useRef(null);
  const aadhaarInputRef = useRef(null);
  const businessRegInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const app = getDropshipperApp();
    if (app) setExistingApp(app);
    const unsubscribe = subscribeDropshipperApp((updatedApp) => {
      if (updatedApp) setExistingApp(updatedApp);
    });
    return unsubscribe;
  }, []);

  const refreshApplicationStatus = () => {
    const app = getDropshipperApp();
    if (app) setExistingApp(app);
    showToast('Live KYC status updated from desk!');
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNiche = (item) => {
    setFormData((prev) => {
      const exists = prev.niche.includes(item);
      return {
        ...prev,
        niche: exists ? prev.niche.filter((n) => n !== item) : [...prev.niche, item],
      };
    });
  };

  const handlePanUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPanFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    });
    showToast(`Uploaded PAN proof: ${file.name}`);
  };

  const handleAadhaarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAadhaarFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    });
    showToast(`Uploaded Aadhaar proof: ${file.name}`);
  };

  const handleRegTypeSwitch = (type) => {
    handleInputChange('businessRegType', type);
    // If user has default sample proof, auto-swap the placeholder proof name cleanly
    if (businessRegFile && (businessRegFile.name.includes('gst_') || businessRegFile.name.includes('udyam_'))) {
      if (type === 'gstin') {
        setBusinessRegFile({
          name: 'gst_registration_reg06.pdf',
          size: '2.1 MB',
          type: 'application/pdf',
          previewUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80',
        });
      } else {
        setBusinessRegFile({
          name: 'udyam_registration_certificate.pdf',
          size: '1.9 MB',
          type: 'application/pdf',
          previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        });
      }
    }
  };

  const handleBusinessRegUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusinessRegFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    });
    showToast(`Uploaded ${formData.businessRegType === 'gstin' ? 'GST Certificate' : 'MSME Certificate'} proof: ${file.name}`);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.brandName.trim() || !formData.storeUrl.trim()) {
        showToast('Please enter your Brand Name and Website URL');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      if (!formData.panNumber.trim() || !formData.aadhaarNumber.trim()) {
        showToast('Please provide valid PAN and Aadhaar numbers');
        return;
      }
      if (!panFile) {
        showToast('Please upload your PAN card document proof');
        return;
      }
      if (!aadhaarFile) {
        showToast('Please upload your Aadhaar card document proof');
        return;
      }
      if (formData.businessRegType === 'gstin') {
        if (!formData.gstin.trim()) {
          showToast('Please enter your 15-digit GSTIN number');
          return;
        }
      } else {
        if (!formData.msmeNumber.trim()) {
          showToast('Please enter your Udyam/MSME Registration number');
          return;
        }
      }
      if (!businessRegFile) {
        showToast(`Please upload proof for your ${formData.businessRegType === 'gstin' ? 'GST Certificate' : 'MSME Certificate'}`);
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 3) {
      if (!formData.accountNumber.trim() || !formData.ifscCode.trim()) {
        showToast('Please fill in bank account and IFSC details');
        return;
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        showToast('Bank Account Numbers do not match');
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handleSubmitApplication = () => {
    if (!formData.agreedTerms || !formData.agreedRotPolicy) {
      showToast('Please agree to the Dropshipper Terms & ROT Policy');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `DSP-KYC-${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);
      setIsSubmitting(false);
      setIsSubmitted(true);

      const newApp = {
        id: generatedId,
        brandName: formData.brandName,
        proprietorName: formData.proprietorName,
        phone: formData.phone,
        email: formData.email,
        storeUrl: formData.storeUrl,
        platform: formData.platform,
        panNumber: formData.panNumber,
        aadhaarNumber: formData.aadhaarNumber,
        businessType: formData.businessType,
        businessRegType: formData.businessRegType,
        gstin: formData.businessRegType === 'gstin' ? formData.gstin : '',
        msmeNumber: formData.businessRegType === 'msme' ? formData.msmeNumber : '',
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId,
        panFile,
        aadhaarFile,
        businessRegFile,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Under Review',
      };
      setExistingApp(newApp);
      saveDropshipperApp(newApp);
    }, 1200);
  };

  const steps = [
    { num: 1, title: 'Store Details', icon: 'storefront' },
    { num: 2, title: 'KYC & Identity', icon: 'badge' },
    { num: 3, title: 'Payout Bank & UPI', icon: 'account_balance' },
    { num: 4, title: 'Review & Agreement', icon: 'verified_user' },
  ];

  if (showStatusTracker && existingApp && !isSubmitted) {
    const isApproved = existingApp.status === 'Approved';
    const isRejected = existingApp.status === 'Rejected';

    return (
      <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased w-full max-w-full overflow-x-hidden">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#1e293b] text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
            <span className="material-symbols-outlined text-rose-400 text-lg">info</span>
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <button
                type="button"
                onClick={onBack || (() => onNavigate('/user-dashboard'))}
                aria-label="Back"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight truncate">
                    KYC Verification Status
                  </h1>
                  <span
                    className={`text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isApproved ? '✓ KYC Approved' : isRejected ? '⚠️ Action Required' : '⏳ Under Review'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden xs:block">
                  Live verification tracking for your connected dropshipping store
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowStatusTracker(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#b90041] border border-rose-200/70 text-xs font-bold transition-all cursor-pointer"
                title="Back to Registration Form"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                <span className="hidden xs:inline">Registration Form</span>
              </button>
              <button
                type="button"
                onClick={refreshApplicationStatus}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Refresh Live Status"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Tracker Body */}
        <main className="max-w-4xl w-full mx-auto p-3.5 sm:p-6 md:p-8 flex-1 space-y-6 pb-48 sm:pb-36 min-w-0">
          {/* Status Hero Card */}
          {isApproved ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-[#005a2b] p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/10 border border-emerald-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                      Application #{existingApp.id} • Approved
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif]">
                      Congratulations, {existingApp.brandName}! 🎉
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Dropshipper Partner
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Your store domain (<span className="font-mono text-emerald-300 font-bold break-all">{existingApp.storeUrl}</span>) and KYC documents have been fully verified. You are authorized to sync supplier products with 0 inventory investment.
              </p>
              {existingApp.apiKey && (
                <div className="p-3 bg-white/10 rounded-2xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-emerald-400 text-base shrink-0">key</span>
                    <span className="text-slate-300 font-medium shrink-0">Store Integration Key:</span>
                    <span className="font-mono font-bold text-white truncate">{existingApp.apiKey}</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold shrink-0">Connected • {existingApp.platform}</span>
                </div>
              )}
            </div>
          ) : isRejected ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-[#7f1d1d] p-5 sm:p-7 text-white shadow-xl shadow-red-950/10 border border-red-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
                    <span className="material-symbols-outlined text-2xl">error</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-rose-300 font-bold">
                      Application #{existingApp.id} • Action Needed
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif]">
                      Document Verification Rejected ⚠️
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusTracker(false);
                    setCurrentStep(2);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto min-h-[42px]"
                >
                  <span className="material-symbols-outlined text-sm">edit_document</span>
                  <span>Fix &amp; Resubmit KYC</span>
                </button>
              </div>
              <div className="p-3.5 bg-black/30 rounded-2xl border border-red-500/30 text-xs space-y-1">
                <span className="text-rose-300 font-bold block">Admin Feedback / Rejection Reason:</span>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {existingApp.rejectionReason || 'PAN or Aadhaar document proofs were blurred or invalid. Please re-upload clear photos/PDFs.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-[#78350f] p-5 sm:p-7 text-white shadow-xl shadow-amber-950/10 border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <span className="material-symbols-outlined text-2xl">hourglass_top</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                      Application #{existingApp.id} • Under Review
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif]">
                      KYC Verification in Progress ⏳
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 w-fit">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Compliance Review (24-48 hrs)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Submitted for <strong className="text-white">{existingApp.brandName}</strong> (<span className="font-mono text-amber-200 font-bold break-all">{existingApp.storeUrl}</span>). The merchant verification desk is cross-checking your PAN and Aadhaar records.
              </p>
            </div>
          )}

          {/* Visual 4-Stage Verification Stepper */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] uppercase tracking-wider">
              Verification Lifecycle Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 relative">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700">STAGE 1</span>
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Application Submitted</h4>
                <p className="text-[11px] text-slate-500">Store domain &amp; platform registered</p>
                <span className="text-[10px] text-emerald-800 font-bold block pt-1">
                  Done • {existingApp.submittedAt || 'Recent'}
                </span>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isApproved
                    ? 'bg-emerald-50/60 border-emerald-200/80'
                    : isRejected
                    ? 'bg-rose-50/60 border-rose-200/80'
                    : 'bg-amber-50/60 border-amber-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isApproved ? 'text-emerald-700' : isRejected ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  >
                    STAGE 2
                  </span>
                  <span
                    className={`material-symbols-outlined text-base ${
                      isApproved ? 'text-emerald-600' : isRejected ? 'text-rose-600' : 'text-amber-600 animate-pulse'
                    }`}
                  >
                    {isApproved ? 'check_circle' : isRejected ? 'cancel' : 'hourglass_bottom'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Document Cross-Verification</h4>
                <p className="text-[11px] text-slate-500">PAN &amp; Aadhaar government validation</p>
                <span
                  className={`text-[10px] font-bold block pt-1 ${
                    isApproved ? 'text-emerald-800' : isRejected ? 'text-rose-800' : 'text-amber-800'
                  }`}
                >
                  {isApproved ? 'Verified by Admin ✓' : isRejected ? 'Rejected by Admin ✗' : 'In Verification ⏳'}
                </span>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isApproved
                    ? 'bg-emerald-50/60 border-emerald-200/80'
                    : 'bg-slate-50 border-slate-200/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isApproved ? 'text-emerald-700' : 'text-slate-400'}`}>
                    STAGE 3
                  </span>
                  <span
                    className={`material-symbols-outlined text-base ${isApproved ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {isApproved ? 'check_circle' : 'account_balance'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Bank &amp; UPI Settlement</h4>
                <p className="text-[11px] text-slate-500">Margin payout account linkage</p>
                <span className={`text-[10px] font-bold block pt-1 ${isApproved ? 'text-emerald-800' : 'text-slate-400'}`}>
                  {isApproved ? 'Cleared for Payouts ✓' : 'Pending Stage 2'}
                </span>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isApproved
                    ? 'bg-gradient-to-tr from-pink-50 to-rose-50 border-rose-200'
                    : 'bg-slate-50 border-slate-200/60 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isApproved ? 'text-[#b90041]' : 'text-slate-400'}`}>
                    STAGE 4
                  </span>
                  <span
                    className={`material-symbols-outlined text-base ${isApproved ? 'text-[#b90041]' : 'text-slate-400'}`}
                  >
                    {isApproved ? 'rocket_launch' : 'lock'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Dropshipper Portal</h4>
                <p className="text-[11px] text-slate-500">Access supplier catalog &amp; orders</p>
                <span className={`text-[10px] font-bold block pt-1 ${isApproved ? 'text-[#b90041]' : 'text-slate-400'}`}>
                  {isApproved ? 'Ready to Resell 🚀' : 'Locked'}
                </span>
              </div>
            </div>
          </div>

          {/* Application Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store & Profile Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-rose-600 text-lg">storefront</span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Store &amp; Platform Profile
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Brand Name:</span>
                  <span className="font-bold text-slate-800">{existingApp.brandName}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className="text-slate-500">Website / Domain:</span>
                  <a
                    href={existingApp.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-rose-600 hover:underline flex items-center gap-1 break-all max-w-full"
                  >
                    <span className="break-all">{existingApp.storeUrl}</span>
                    <span className="material-symbols-outlined text-xs shrink-0">open_in_new</span>
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">eCommerce Platform:</span>
                  <span className="font-bold text-slate-800">{existingApp.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-800">{existingApp.proprietorName}</span>
                </div>
              </div>
            </div>

            {/* KYC & Settlement Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-emerald-600 text-lg">badge</span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  KYC &amp; Margin Payouts
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">PAN Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ••••••{existingApp.panNumber ? existingApp.panNumber.slice(-4) : '34F'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aadhaar Card:</span>
                  <span className="font-mono font-bold text-slate-800">
                    •••• •••• {existingApp.aadhaarNumber ? existingApp.aadhaarNumber.slice(-4) : '3810'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {existingApp.businessRegType === 'msme' ? 'MSME / Udyam:' : 'GSTIN:'}
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {existingApp.businessRegType === 'msme'
                      ? (existingApp.msmeNumber || 'UDYAM-KR-03-0019482')
                      : (existingApp.gstin || '29ABCDE1234F1Z5')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payout Bank:</span>
                  <span className="font-bold text-slate-800">
                    {existingApp.bankName} (••••{existingApp.accountNumber ? existingApp.accountNumber.slice(-4) : '0291'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement UPI:</span>
                  <span className="font-mono font-bold text-emerald-700">{existingApp.upiId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/user-dashboard')}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#b90041] to-[#df2457] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span>Back to User Dashboard</span>
            </button>

            {isRejected ? (
              <button
                type="button"
                onClick={() => {
                  setShowStatusTracker(false);
                  setCurrentStep(2);
                }}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">edit_document</span>
                <span>Update Documents</span>
              </button>
            ) : isApproved ? (
              <button
                type="button"
                onClick={() => onNavigate('explorer')}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">store</span>
                <span>Browse Products to Sell</span>
              </button>
            ) : null}
          </div>

          {/* Secondary Reset Option */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setShowStatusTracker(false);
                setCurrentStep(1);
              }}
              className="text-xs text-slate-400 hover:text-[#b90041] font-semibold underline cursor-pointer"
            >
              Want to edit application details or submit for a different store? Click here
            </button>
          </div>
        </main>

        <AppBottomNav activeNav="home" onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#1e293b] text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-rose-400 text-lg">info</span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={onBack || (() => onNavigate('/user-dashboard'))}
              aria-label="Back"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight truncate">
                  Dropshipper Onboarding &amp; KYC
                </h1>
                <span className="bg-rose-50 text-[#b90041] border border-rose-200/60 text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  Reseller B2B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden xs:block">
                Sell supplier products on your own store with 0 inventory investment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowStatusTracker(true)}
              className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 sm:px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
              title="Preview KYC Status Screen"
            >
              <span className="material-symbols-outlined text-xs">fact_check</span>
              <span className="hidden xs:inline">Status View</span>
            </button>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-2 sm:px-2.5 py-1 rounded-lg shrink-0">
              <span className="inline sm:hidden">{currentStep}/4</span>
              <span className="hidden sm:inline">Step {currentStep} of 4</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto p-3 sm:p-6 md:p-8 flex-1 space-y-4 sm:space-y-6 pb-48 sm:pb-36 min-w-0">
        {/* Step Progression Stepper */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 p-2 sm:p-5 shadow-xs">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {steps.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2.5 p-1 sm:p-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-rose-50/80 border border-rose-200/80 text-[#b90041]'
                      : isDone
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#b90041] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </div>
                  <div className="text-center sm:text-left min-w-0 w-full">
                    <p className="text-[9px] sm:text-xs font-bold truncate leading-tight">
                      {s.title}
                    </p>
                    <span className="hidden md:block text-[10px] text-slate-400 font-medium">
                      Step {s.num} of 4
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Step Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-4 sm:p-7 shadow-xs space-y-6 mb-10 sm:mb-6">
          {/* ===================== STEP 1: STORE & BUSINESS ===================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Step 1: Connected Store &amp; Brand Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter details of the online store/website where you intend to dropship products.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proprietor / Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.proprietorName}
                    onChange={(e) => handleInputChange('proprietorName', e.target.value)}
                    placeholder="Enter your legal full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    placeholder="e.g. Aura Trends Luxe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Connected Online Store Website / Domain URL *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      link
                    </span>
                    <input
                      type="url"
                      value={formData.storeUrl}
                      onChange={(e) => handleInputChange('storeUrl', e.target.value)}
                      placeholder="https://yourstore.com or https://yourstore.myshopify.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    This website URL will be verified by our team for product synchronization authorization.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store E-Commerce Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all cursor-pointer"
                  >
                    <option value="Shopify">Shopify (Recommended 1-Click Sync)</option>
                    <option value="WooCommerce">WooCommerce / WordPress</option>
                    <option value="Custom API">Custom E-Commerce Website (REST API)</option>
                    <option value="Dukaan">Dukaan Store</option>
                    <option value="Wix">Wix E-Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Monthly Order Volume
                  </label>
                  <select
                    value={formData.expectedOrders}
                    onChange={(e) => handleInputChange('expectedOrders', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all cursor-pointer"
                  >
                    <option value="10 - 50 orders/month">10 - 50 orders/month (Starter)</option>
                    <option value="50 - 200 orders/month">50 - 200 orders/month (Growing)</option>
                    <option value="200 - 1000 orders/month">200 - 1,000 orders/month (High Scale)</option>
                    <option value="1000+ orders/month">1,000+ orders/month (Enterprise)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Primary Sourcing Niches (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      'Women Western Wear',
                      'Ethnic Sarees & Kurtis',
                      'Footwear & Sneakers',
                      'Fashion Jewelry & Watches',
                      'Home & Kitchen Essentials',
                      'Men Streetwear & Polo',
                      'Beauty & Personal Care',
                    ].map((niche) => {
                      const selected = formData.niche.includes(niche);
                      return (
                        <button
                          key={niche}
                          type="button"
                          onClick={() => toggleNiche(niche)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            selected
                              ? 'bg-[#b90041] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                          }`}
                        >
                          <span>{selected ? '✓' : '+'}</span>
                          <span>{niche}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: KYC & IDENTITY ===================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Step 2: Legal KYC &amp; Identification
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide government-issued documents for B2B wholesale partner verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Entity / Business Registration Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      'Individual Dropshipper',
                      'Sole Proprietorship',
                      'LLP / Partnership',
                      'Private Limited',
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInputChange('businessType', type)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          formData.businessType === type
                            ? 'bg-rose-50 border-[#b90041] text-[#b90041] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PAN Card Number *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Aadhaar Card Number (12 Digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.aadhaarNumber}
                    onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                {/* Business Tax / Registration Switcher (GSTIN vs MSME) */}
                <div className="sm:col-span-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#b90041] text-base">verified</span>
                        Business Registration &amp; Tax Details *
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Choose either GSTIN or MSME (Udyam) registration to verify your business.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 self-start sm:self-auto px-2 py-0.5 rounded-full bg-rose-100/80 text-[#b90041] text-[10px] font-bold">
                      Mandatory (Choose 1)
                    </span>
                  </div>

                  {/* Radio Switcher */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: GSTIN */}
                    <label
                      onClick={() => handleRegTypeSwitch('gstin')}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.businessRegType === 'gstin'
                          ? 'border-[#b90041] bg-white shadow-xs ring-2 ring-rose-50'
                          : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="businessRegType"
                        value="gstin"
                        checked={formData.businessRegType === 'gstin'}
                        onChange={() => handleRegTypeSwitch('gstin')}
                        className="w-4 h-4 text-[#b90041] focus:ring-[#b90041] accent-[#b90041] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#b90041] text-base">receipt_long</span>
                          <span className="text-xs font-bold text-slate-900">GSTIN Number</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          Goods &amp; Services Tax (15 Digits)
                        </p>
                      </div>
                      {formData.businessRegType === 'gstin' && (
                        <span className="material-symbols-outlined text-[#b90041] text-sm shrink-0">check_circle</span>
                      )}
                    </label>

                    {/* Option 2: MSME */}
                    <label
                      onClick={() => handleRegTypeSwitch('msme')}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.businessRegType === 'msme'
                          ? 'border-[#b90041] bg-white shadow-xs ring-2 ring-rose-50'
                          : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="businessRegType"
                        value="msme"
                        checked={formData.businessRegType === 'msme'}
                        onChange={() => handleRegTypeSwitch('msme')}
                        className="w-4 h-4 text-[#b90041] focus:ring-[#b90041] accent-[#b90041] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#b90041] text-base">domain</span>
                          <span className="text-xs font-bold text-slate-900">MSME / Udyam</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          Udyam Registration Number
                        </p>
                      </div>
                      {formData.businessRegType === 'msme' && (
                        <span className="material-symbols-outlined text-[#b90041] text-sm shrink-0">check_circle</span>
                      )}
                    </label>
                  </div>

                  {/* Dynamic Registration Number Input */}
                  <div className="pt-1">
                    {formData.businessRegType === 'gstin' ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            GSTIN (Goods &amp; Services Tax Number) *
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">15 Characters</span>
                        </div>
                        <input
                          type="text"
                          maxLength={15}
                          value={formData.gstin}
                          onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                          placeholder="e.g. 29ABCDE1234F1Z5"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all shadow-xs"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Enter your active 15-character GSTIN registered with the GST Portal.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Udyam / MSME Registration Number *
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">Udyam No.</span>
                        </div>
                        <input
                          type="text"
                          maxLength={25}
                          value={formData.msmeNumber}
                          onChange={(e) => handleInputChange('msmeNumber', e.target.value.toUpperCase())}
                          placeholder="e.g. UDYAM-KR-03-0019482"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all shadow-xs"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Enter your valid Ministry of MSME Udyam Registration Certificate number.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Proof Uploads Section */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#b90041]">file_present</span>
                      Document Proof Uploads (3 Required) *
                    </h3>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Upload PAN Dropzone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                        1. PAN Card Proof *
                      </label>
                      <input
                        ref={panInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handlePanUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => panInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#b90041] bg-slate-50/70 hover:bg-rose-50/30 p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[110px]"
                      >
                        <span className="material-symbols-outlined text-2xl text-[#b90041]">
                          upload_file
                        </span>
                        <span className="text-xs font-bold text-slate-700 text-center">Choose PAN File</span>
                        <span className="text-[10px] text-slate-400 text-center">JPG, PNG or PDF</span>
                      </div>
                      {panFile && (
                        <div className="mt-2 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                            <span className="font-semibold text-slate-800 truncate">{panFile.name}</span>
                            <span className="text-slate-400 text-[10px] font-mono">({panFile.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPanFile(null)}
                            className="text-slate-400 hover:text-red-600 text-xs px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Upload Aadhaar Dropzone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                        2. Aadhaar Proof (Both Sides) *
                      </label>
                      <input
                        ref={aadhaarInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleAadhaarUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => aadhaarInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#b90041] bg-slate-50/70 hover:bg-rose-50/30 p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[110px]"
                      >
                        <span className="material-symbols-outlined text-2xl text-[#b90041]">
                          id_card
                        </span>
                        <span className="text-xs font-bold text-slate-700 text-center">Choose Aadhaar File</span>
                        <span className="text-[10px] text-slate-400 text-center">Front &amp; Back visible</span>
                      </div>
                      {aadhaarFile && (
                        <div className="mt-2 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                            <span className="font-semibold text-slate-800 truncate">{aadhaarFile.name}</span>
                            <span className="text-slate-400 text-[10px] font-mono">({aadhaarFile.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAadhaarFile(null)}
                            className="text-slate-400 hover:text-red-600 text-xs px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Upload GSTIN or MSME Certificate Dropzone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
                        3. {formData.businessRegType === 'gstin' ? 'GST Certificate (REG-06) *' : 'MSME / Udyam Certificate *'}
                      </label>
                      <input
                        ref={businessRegInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleBusinessRegUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => businessRegInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#b90041] bg-slate-50/70 hover:bg-rose-50/30 p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[110px]"
                      >
                        <span className="material-symbols-outlined text-2xl text-[#b90041]">
                          {formData.businessRegType === 'gstin' ? 'receipt_long' : 'domain'}
                        </span>
                        <span className="text-xs font-bold text-slate-700 text-center">
                          {formData.businessRegType === 'gstin' ? 'Choose GST File' : 'Choose MSME File'}
                        </span>
                        <span className="text-[10px] text-slate-400 text-center">
                          {formData.businessRegType === 'gstin' ? 'GST REG-06 Certificate' : 'Udyam Certificate PDF'}
                        </span>
                      </div>
                      {businessRegFile && (
                        <div className="mt-2 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                            <span className="font-semibold text-slate-800 truncate">{businessRegFile.name}</span>
                            <span className="text-slate-400 text-[10px] font-mono">({businessRegFile.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBusinessRegFile(null)}
                            className="text-slate-400 hover:text-red-600 text-xs px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 3: BANK & UPI SETTLEMENT ===================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Step 3: Settlement Bank &amp; UPI Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your store's net dropshipping profits and margins will be credited directly to this account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Beneficiary Name *
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                    placeholder="As per bank passbook"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <BankAutocompleteSelect
                  label="Bank Name"
                  required
                  value={formData.bankName}
                  onChange={(val) => handleInputChange('bankName', val)}
                  onSelectBank={(bank) => {
                    if (!formData.ifscCode && bank.code) {
                      handleInputChange('ifscCode', bank.code);
                    }
                  }}
                  placeholder="Search or type bank (e.g. HDFC, SBI, ICICI)"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="password"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="Enter account number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.confirmAccountNumber}
                    onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                    placeholder="Re-enter account number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001248"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Instant UPI ID *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      qr_code_2
                    </span>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      placeholder="e.g. username@okhdfcbank"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Guarantee Notice */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/70 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
                <span className="material-symbols-outlined text-2xl text-emerald-600 shrink-0">verified</span>
                <div>
                  <span className="font-bold">Zero Deduction Guarantee:</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Your dropshipping profits will be settled weekly via IMPS/NEFT without gateway processing cuts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: REVIEW & AGREEMENT ===================== */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Step 4: Application Summary &amp; Legal Policies
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your store configuration and accept the Return on Transaction (ROT) policy.
                </p>
              </div>

              {/* Application Snapshot Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Brand / Store</span>
                  <p className="font-bold text-slate-800 mt-0.5">{formData.brandName}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{formData.storeUrl}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Platform &amp; Capacity</span>
                  <p className="font-bold text-slate-800 mt-0.5">{formData.platform}</p>
                  <p className="text-slate-500 text-[11px]">{formData.expectedOrders}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">KYC Identifiers</span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">PAN: {formData.panNumber}</p>
                  <p className="text-slate-500 font-mono text-[11px]">Aadhaar: {formData.aadhaarNumber}</p>
                  <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#b90041] border border-rose-200">
                      {formData.businessRegType === 'gstin' ? 'GSTIN' : 'MSME'}
                    </span>
                    <span className="font-mono text-slate-700 text-[11px] font-semibold truncate">
                      {formData.businessRegType === 'gstin' ? formData.gstin : formData.msmeNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Payout Destination</span>
                  <p className="font-bold text-slate-800 mt-0.5">{formData.bankName} (****{formData.accountNumber.slice(-4)})</p>
                  <p className="text-emerald-700 font-mono text-[11px]">UPI: {formData.upiId}</p>
                </div>
              </div>

              {/* Terms Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.agreedTerms}
                    onChange={(e) => handleInputChange('agreedTerms', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#b90041] focus:ring-[#b90041]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Dropshipper Code of Conduct &amp; White-Label Fulfilment Consent
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      I authorize platform suppliers to pack and dispatch verified orders to my customers with my brand label.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.agreedRotPolicy}
                    onChange={(e) => handleInputChange('agreedRotPolicy', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#b90041] focus:ring-[#b90041]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      ROT (Return on Transaction) &amp; Margin Clawback Liability Agreement
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      I acknowledge that on non-fault customer returns (size mismatch / customer refusal), profit margins are clawed back and system-defined reverse freight charges apply according to platform business rules.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer min-h-[42px]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#b90041] hover:bg-[#a00037] text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all cursor-pointer flex items-center gap-1.5 min-h-[42px]"
              >
                <span>Proceed to Step {currentStep + 1}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-[#b90041] to-[#df2457] text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/30 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting KYC Verification...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ===================== SUCCESS SUBMISSION MODAL ===================== */}
      {isSubmitted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto my-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">task_alt</span>
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono font-bold rounded-full">
                Application #{applicationId}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2 font-['Plus_Jakarta_Sans',sans-serif]">
                Application Submitted! 🎉
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Your Dropshipper store credentials and KYC document proofs have been securely routed to the <strong>Meesho Merchant Verification Desk</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Brand Name:</span>
                <span className="font-bold text-slate-800">{formData.brandName}</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:justify-between gap-0.5">
                <span className="text-slate-400 shrink-0">Connected Store:</span>
                <span className="font-mono font-bold text-slate-800 break-all">{formData.storeUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification SLA:</span>
                <span className="font-bold text-emerald-700">Under Review (24-48 hrs)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setShowStatusTracker(true);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b90041] to-[#df2457] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <span className="material-symbols-outlined text-base">fact_check</span>
                <span>Track Verification Status</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/user-dashboard')}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px]"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span>Return to User Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!isSubmitted && <AppBottomNav activeNav="home" onNavigate={onNavigate} />}
    </div>
  );
}
