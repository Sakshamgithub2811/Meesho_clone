import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import BankAutocompleteSelect from '../../components/BankAutocompleteSelect';
import { getAffiliateApp, saveAffiliateApp } from '../../services/affiliateSessionStore';

export default function AffiliateKYC({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (onNavigate) {
      try {
        onNavigate('/user-dashboard');
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/user-dashboard');
    if (window.location.pathname !== '/user-dashboard') {
      window.location.href = '/user-dashboard';
    }
  };

  const handleGoHome = () => {
    if (onNavigate) {
      try {
        onNavigate('/user-dashboard');
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/user-dashboard');
    if (window.location.pathname !== '/user-dashboard') {
      window.location.href = '/user-dashboard';
    }
  };

  // Step state: 1: Personal, 2: Govt ID, 3: Bank Details, 4: Review & Declarations
  const [currentStep, setCurrentStep] = useState(1);

  // Check if user already submitted KYC
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [estOrders, setEstOrders] = useState(25);
  const [estAvgPrice, setEstAvgPrice] = useState(799);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // File Previews
  const [panPreviewUrl, setPanPreviewUrl] = useState(null);
  const [aadhaarPreviewUrl, setAadhaarPreviewUrl] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Step 2: Govt ID
    panNumber: '',
    panDocName: '',
    aadhaarNumber: '',
    aadhaarDocName: '',
    // Step 3: Bank Details
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: '',
    chequeDocName: '',
    // Step 4: Declarations
    agreeInfoCorrect: false,
    agreeAdminApproval: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const app = getAffiliateApp();
      const searchParams = new URLSearchParams(location.search);
      const isEditRequested = searchParams.get('edit') === 'true';

      if (app) {
        setExistingSubmission(app);
        setFormData((prev) => ({ ...prev, ...app }));

        if (isEditRequested) {
          setIsEditing(true);
        } else {
          // If already submitted and not explicitly editing, redirect to the new dedicated status page
          if (onNavigate) {
            onNavigate('/affiliate-kyc-status');
          } else {
            navigate('/affiliate-kyc-status', { replace: true });
          }
        }
      } else {
        setExistingSubmission(null);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Error loading KYC application', e);
    }
  }, [location.search]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field, previewSetter, file) => {
    if (!file) return;

    // File Size Check (Max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      triggerToast('File exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file.name }));

    // Create Image Preview URL if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        previewSetter(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      previewSetter('PDF_DOC');
    }

    triggerToast(`Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  const removeFile = (field, previewSetter) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
    previewSetter(null);
  };

  // Step-wise Validation
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full legal name is required';
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Valid email address is required';
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        newErrors.phone = 'Valid 10-digit mobile number is required';
      }
      if (!formData.address.trim()) newErrors.address = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim() || formData.pincode.length !== 6) {
        newErrors.pincode = 'Valid 6-digit PIN code is required';
      }
    }

    if (stepNumber === 2) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!formData.panNumber.trim() || !panRegex.test(formData.panNumber.toUpperCase())) {
        newErrors.panNumber = 'Valid 10-digit PAN required (e.g. ABCDE1234F)';
      }

      const cleanAadhaar = formData.aadhaarNumber.replace(/\s+/g, '');
      if (!cleanAadhaar || cleanAadhaar.length !== 12 || !/^\d+$/.test(cleanAadhaar)) {
        newErrors.aadhaarNumber = 'Valid 12-digit Aadhaar number required';
      }
    }

    if (stepNumber === 3) {
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
      if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        newErrors.confirmAccountNumber = 'Account numbers do not match';
      }
      if (!formData.ifscCode.trim() || formData.ifscCode.length < 8) {
        newErrors.ifscCode = 'Valid IFSC code required (e.g. HDFC0001234)';
      }
    }

    if (stepNumber === 4) {
      if (!formData.agreeInfoCorrect) {
        newErrors.agreeInfoCorrect = 'You must declare that provided details are accurate';
      }
      if (!formData.agreeAdminApproval) {
        newErrors.agreeAdminApproval = 'You must acknowledge that Admin approval is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      triggerToast('Please fill all required fields correctly to continue');
    }
  };

  const handlePrevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) {
      triggerToast('Please accept the required declarations to proceed');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const submission = {
        ...formData,
        panNumber: formData.panNumber.toUpperCase(),
        ifscCode: formData.ifscCode.toUpperCase(),
        applicationId: existingSubmission?.applicationId || `KYC-AFF-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'PENDING_ADMIN_APPROVAL',
        submittedAt: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      try {
        localStorage.setItem('affiliate_kyc_application', JSON.stringify(submission));
        saveAffiliateApp(submission);

        // Save to admin pending applications registry for admin review
        const adminQueue = JSON.parse(localStorage.getItem('admin_kyc_applications') || '[]');
        const existingIdx = adminQueue.findIndex((item) => item.applicationId === submission.applicationId);
        if (existingIdx >= 0) {
          adminQueue[existingIdx] = submission;
        } else {
          adminQueue.push(submission);
        }
        localStorage.setItem('admin_kyc_applications', JSON.stringify(adminQueue));
      } catch (err) {
        console.error('Storage error', err);
      }

      setExistingSubmission(submission);
      setIsEditing(false);
      setIsSubmitting(false);
      triggerToast('KYC application submitted successfully! Opening Live Verification Desk...');
      setTimeout(() => {
        if (onNavigate) onNavigate('/affiliate-kyc-status');
        else navigate('/affiliate-kyc-status');
      }, 1000);
    }, 1200);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const stepsList = [
    { number: 1, title: 'Personal Details', icon: 'person' },
    { number: 2, title: 'Government ID', icon: 'badge' },
    { number: 3, title: 'Bank Account', icon: 'account_balance' },
    { number: 4, title: 'Review & Submit', icon: 'verified' },
  ];

  const faqs = [
    {
      q: 'How long does Admin verification and approval take?',
      a: 'Admin verification is typically completed within 24 to 48 business hours. You can return to this page at any time to check your live application status.',
    },
    {
      q: 'When and how are affiliate commissions paid?',
      a: 'Commissions are credited upon successful order delivery after the standard return window closes, and transferred weekly directly into your verified bank account.',
    },
    {
      q: 'Is there any registration or joining fee?',
      a: 'No, joining the Affiliate Program is 100% free with zero registration fees or hidden charges.',
    },
    {
      q: 'Why are PAN and Aadhaar details required?',
      a: 'As per regulatory and tax guidelines, PAN and Aadhaar details are required for identity verification and TDS (Tax Deducted at Source) compliance on payout disbursements.',
    },
  ];

  // Estimated Earnings Formula (approx 12% commission)
  const estimatedCommission = Math.round(estOrders * estAvgPrice * 0.12);

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800 pb-28 font-['Inter',sans-serif]">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1c1724] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce text-xs font-bold">
          <span className="material-symbols-outlined text-rose-400 text-base">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={currentStep > 1 && (!existingSubmission || isEditing) ? handlePrevStep : handleGoBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors cursor-pointer"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans']">
                Become an Affiliate
              </h1>
              <span className="bg-rose-50 text-[#b90041] border border-rose-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                KYC Step {currentStep} of 4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Submit details for Admin verification & approval
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Calculator Toggle */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showCalculator
                ? 'bg-rose-50 text-[#FF3F6C] border-rose-200 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base text-[#FF3F6C]">calculate</span>
            <span className="hidden sm:inline">Earnings Calculator</span>
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#b90041] px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="hidden sm:inline">User Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Interactive Earnings Calculator Drawer */}
        {showCalculator && (
          <div className="rounded-3xl bg-gradient-to-tr from-[#1c1724] via-[#2f192b] to-[#120e18] p-5 sm:p-6 text-white border border-rose-500/20 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3F6C] to-[#b90041] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold font-['Plus_Jakarta_Sans'] text-white">
                    Affiliate Earnings Estimator
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Average affiliate commission is ~12% on delivered orders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Expected Monthly Orders Promoted</span>
                  <span className="font-extrabold text-rose-300">{estOrders} orders</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={estOrders}
                  onChange={(e) => setEstOrders(Number(e.target.value))}
                  className="w-full accent-[#FF3F6C] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Average Product Price</span>
                  <span className="font-extrabold text-rose-300">₹{estAvgPrice}</span>
                </div>
                <input
                  type="range"
                  min="299"
                  max="2499"
                  step="50"
                  value={estAvgPrice}
                  onChange={(e) => setEstAvgPrice(Number(e.target.value))}
                  className="w-full accent-[#FF3F6C] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] uppercase font-black text-rose-300 tracking-wider block">
                  Estimated Monthly Payout
                </span>
                <span className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
                  ₹{estimatedCommission.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl">
                Weekly Direct Bank Transfer
              </span>
            </div>
          </div>
        )}

        {/* Important Admin Disclaimer Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xs sm:text-sm font-black text-amber-900 font-['Plus_Jakarta_Sans'] uppercase tracking-wide">
              Official Admin Approval Notice
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              All submitted KYC documents are directly queued for <strong>Admin Verification & Approval</strong>.
              Approval will be granted exclusively by the Admin team after verification.
            </p>
          </div>
        </div>

        {/* If in edit mode, show banner with quick cancel */}
        {isEditing && (
          <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <span className="material-symbols-outlined text-[#FF3F6C] text-lg">edit_document</span>
              <span>
                Editing Submitted Application ({formData.applicationId || existingSubmission?.applicationId || 'KYC'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('/affiliate-kyc-status') : navigate('/affiliate-kyc-status'))}
              className="text-xs text-[#FF3F6C] font-extrabold hover:text-[#b90041] underline cursor-pointer self-start sm:self-auto"
            >
              Cancel Edit & Return to Status Desk →
            </button>
          </div>
        )}

        {/* Multi-Step Wizard Flow */}
        <div className="space-y-6">
            {/* Step Progress Bar Header */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="grid grid-cols-4 gap-2 relative">
                {stepsList.map((step) => {
                  const isDone = currentStep > step.number;
                  const isCurrent = currentStep === step.number;
                  return (
                    <div
                      key={step.number}
                      onClick={() => {
                        if (isDone) setCurrentStep(step.number);
                      }}
                      className={`flex flex-col items-center text-center cursor-pointer transition-all ${
                        isDone ? 'cursor-pointer hover:opacity-80' : isCurrent ? 'cursor-default' : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black transition-all mb-1.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-gradient-to-tr from-[#FF3F6C] to-[#b90041] text-white shadow-md shadow-[#FF3F6C]/30 ring-4 ring-[#FF3F6C]/15 scale-105'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-base">check</span>
                        ) : (
                          <span>{step.number}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold tracking-tight line-clamp-1 ${
                          isCurrent
                            ? 'text-[#b90041] font-black'
                            : isDone
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar line */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF3F6C] to-[#b90041] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* SCREEN 1: Personal & Contact Information */}
            {currentStep === 1 && (
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b90041] flex items-center justify-center font-bold text-base">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-base sm:text-lg text-slate-900">
                      Step 1: Personal & Contact Information
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enter your identity details exactly as printed on your government documents
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul.sharma@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#FF3F6C]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Residential Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Flat / House No., Building Name, Street / Area"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                          errors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                        }`}
                      />
                      {errors.state && <p className="text-[10px] text-red-500 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6 digits"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-3 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                          errors.pincode ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                        }`}
                      />
                      {errors.pincode && <p className="text-[10px] text-red-500 mt-1">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF3F6C] to-[#b90041] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-[#FF3F6C]/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Continue to Government ID</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {/* SCREEN 2: Government Identity Documents with Live Preview */}
            {currentStep === 2 && (
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b90041] flex items-center justify-center font-bold text-base">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-base sm:text-lg text-slate-900">
                      Step 2: Government Identity Verification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Provide your PAN & Aadhaar details with optional photo verification (Max 5MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PAN Card Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#b90041]">credit_card</span>
                        PAN Card Number <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">10 Chars</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs uppercase font-mono tracking-wider bg-white focus:outline-none ${
                        errors.panNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.panNumber && <p className="text-[10px] text-red-500">{errors.panNumber}</p>}

                    {/* PAN Upload with Live Thumbnail Preview */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Upload PAN Document / Photo (Optional)
                      </label>
                      {formData.panDocName ? (
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {panPreviewUrl && panPreviewUrl !== 'PDF_DOC' ? (
                              <img
                                src={panPreviewUrl}
                                alt="PAN Preview"
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">description</span>
                              </div>
                            )}
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{formData.panDocName}</p>
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified</span> Ready to verify
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('panDocName', setPanPreviewUrl)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer border border-dashed border-slate-300 hover:border-[#FF3F6C] rounded-xl px-3 py-3 text-center text-xs bg-white text-slate-600 hover:text-[#b90041] transition-all flex flex-col items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xl text-slate-400">cloud_upload</span>
                          <span className="font-semibold text-xs">Choose PAN Image / PDF</span>
                          <span className="text-[10px] text-slate-400">JPG, PNG or PDF (Max 5MB)</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload('panDocName', setPanPreviewUrl, e.target.files[0])
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Card Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#b90041]">fingerprint</span>
                        Aadhaar Number <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">12 Digits</span>
                    </div>
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="e.g. 1234 5678 9012"
                      value={formData.aadhaarNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                        handleInputChange('aadhaarNumber', formatted);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono tracking-wider bg-white focus:outline-none ${
                        errors.aadhaarNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.aadhaarNumber && <p className="text-[10px] text-red-500">{errors.aadhaarNumber}</p>}

                    {/* Aadhaar Upload with Live Thumbnail Preview */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Upload Aadhaar Document / Photo (Optional)
                      </label>
                      {formData.aadhaarDocName ? (
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {aadhaarPreviewUrl && aadhaarPreviewUrl !== 'PDF_DOC' ? (
                              <img
                                src={aadhaarPreviewUrl}
                                alt="Aadhaar Preview"
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">description</span>
                              </div>
                            )}
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{formData.aadhaarDocName}</p>
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified</span> Ready to verify
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('aadhaarDocName', setAadhaarPreviewUrl)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer border border-dashed border-slate-300 hover:border-[#FF3F6C] rounded-xl px-3 py-3 text-center text-xs bg-white text-slate-600 hover:text-[#b90041] transition-all flex flex-col items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xl text-slate-400">cloud_upload</span>
                          <span className="font-semibold text-xs">Choose Aadhaar Image / PDF</span>
                          <span className="text-[10px] text-slate-400">JPG, PNG or PDF (Max 5MB)</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload('aadhaarDocName', setAadhaarPreviewUrl, e.target.files[0])
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF3F6C] to-[#b90041] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-[#FF3F6C]/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Continue to Bank Details</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {/* SCREEN 3: Bank Account Details */}
            {currentStep === 3 && (
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b90041] flex items-center justify-center font-bold text-base">
                    <span className="material-symbols-outlined">account_balance</span>
                  </div>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-base sm:text-lg text-slate-900">
                      Step 3: Bank Account for Payouts
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Commissions will be transferred directly to this bank account upon Admin approval
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    error={errors.bankName}
                    placeholder="Search or type bank (e.g. HDFC, SBI, ICICI)"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Must match with PAN name"
                      value={formData.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.accountHolderName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.accountHolderName && <p className="text-[10px] text-red-500 mt-1">{errors.accountHolderName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bank Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter bank account number"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.accountNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.accountNumber && <p className="text-[10px] text-red-500 mt-1">{errors.accountNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Re-enter bank account number"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.confirmAccountNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.confirmAccountNumber && <p className="text-[10px] text-red-500 mt-1">{errors.confirmAccountNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bank IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="e.g. HDFC0001234"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs uppercase font-mono bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                        errors.ifscCode ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#FF3F6C]'
                      }`}
                    />
                    {errors.ifscCode && <p className="text-[10px] text-red-500 mt-1">{errors.ifscCode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      UPI ID (Optional for faster transfers)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. rahul@okaxis"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#FF3F6C]"
                    />
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF3F6C] to-[#b90041] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-[#FF3F6C]/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Continue to Review & Declarations</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {/* SCREEN 4: Review Summary & Declarations */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                {/* Summary Card for Review */}
                <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b90041] flex items-center justify-center font-bold text-base">
                        <span className="material-symbols-outlined">rate_review</span>
                      </div>
                      <div>
                        <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-base sm:text-lg text-slate-900">
                          Step 4: Review Your Details
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Please verify your entered KYC details before submitting to Admin
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Bento Box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Personal Summary */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#b90041] uppercase tracking-wide">
                          1. Personal Details
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{formData.fullName || '-'}</p>
                      <p className="text-[11px] text-slate-600">{formData.phone || '-'}</p>
                      <p className="text-[11px] text-slate-600">{formData.email || '-'}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {formData.address ? `${formData.city}, ${formData.state} - ${formData.pincode}` : '-'}
                      </p>
                    </div>

                    {/* ID Summary */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#b90041] uppercase tracking-wide">
                          2. Government ID
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        PAN:{' '}
                        <span className="font-mono font-bold text-slate-800">
                          {formData.panNumber || '-'}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Aadhaar:{' '}
                        <span className="font-mono font-bold text-slate-800">
                          {formData.aadhaarNumber || '-'}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Documents:{' '}
                        {formData.panDocName || formData.aadhaarDocName ? 'Attached' : 'Not attached'}
                      </p>
                    </div>

                    {/* Bank Summary */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#b90041] uppercase tracking-wide">
                          3. Bank Account
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{formData.bankName || '-'}</p>
                      <p className="text-[11px] text-slate-600">
                        A/C:{' '}
                        <span className="font-bold text-slate-800">
                          •••• {formData.accountNumber ? formData.accountNumber.slice(-4) : '••••'}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono">IFSC: {formData.ifscCode || '-'}</p>
                    </div>
                  </div>
                </section>

                {/* Declarations Card */}
                <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base">
                      <span className="material-symbols-outlined">gavel</span>
                    </div>
                    <div>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm sm:text-base text-slate-900">
                        Declarations & Verification Agreement
                      </h3>
                      <p className="text-[11px] text-slate-400">Please confirm before submitting for Admin approval</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.agreeInfoCorrect}
                        onChange={(e) => handleInputChange('agreeInfoCorrect', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#FF3F6C] rounded border-slate-300 focus:ring-[#FF3F6C]"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        I declare and confirm that all the personal, identity (PAN/Aadhaar), and banking details provided by me
                        are genuine, complete, and belong to me.
                      </span>
                    </label>
                    {errors.agreeInfoCorrect && (
                      <p className="text-[10px] text-red-500 pl-7">{errors.agreeInfoCorrect}</p>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.agreeAdminApproval}
                        onChange={(e) => handleInputChange('agreeAdminApproval', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-[#FF3F6C] rounded border-slate-300 focus:ring-[#FF3F6C]"
                      />
                      <span className="text-xs text-slate-800 leading-relaxed font-semibold">
                        I understand that submitting this application does NOT give automatic approval. My application will be reviewed
                        and approved exclusively by Admin.
                      </span>
                    </label>
                    {errors.agreeAdminApproval && (
                      <p className="text-[10px] text-red-500 pl-7">{errors.agreeAdminApproval}</p>
                    )}
                  </div>
                </section>

                {/* Final Submission Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back to Bank Details</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3F6C] to-[#b90041] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-[#FF3F6C]/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Submitting KYC to Admin...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        <span>Submit KYC Details for Admin Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Helpful FAQs Accordion */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="material-symbols-outlined text-[#FF3F6C] text-xl">help_outline</span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm text-slate-900">
                  Frequently Asked Questions (FAQs)
                </h3>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/70 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span
                          className={`material-symbols-outlined text-slate-400 text-base transition-transform ${
                            isOpen ? 'rotate-180 text-[#FF3F6C]' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
      </main>

      {/* Printable / Downloadable Application Slip Modal */}
      {showReceiptModal && existingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3F6C] to-[#b90041] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-base">receipt_long</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm text-slate-900">
                  KYC Application Receipt Slip
                </h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans text-[11px]">Status</span>
                <span className="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                  PENDING ADMIN APPROVAL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ref ID:</span>
                <span className="font-bold text-slate-900">{existingSubmission.applicationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{existingSubmission.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PAN Number:</span>
                <span className="font-bold text-slate-900">{existingSubmission.panNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank:</span>
                <span className="font-bold text-slate-900">{existingSubmission.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank A/C:</span>
                <span className="font-bold text-slate-900">
                  •••• •••• {existingSubmission.accountNumber ? existingSubmission.accountNumber.slice(-4) : '••••'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted On:</span>
                <span className="font-bold text-slate-900">{existingSubmission.submittedAt}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans">
                Keep this Application Reference ID for all future support inquiries.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print / Save Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AppBottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
}
