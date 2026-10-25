import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';

const RETURN_REASONS = [
  {
    id: 'size_fit',
    title: 'Size & Fit Issue',
    icon: '📏',
    description: 'Item is either too small, tight, or too loose for you',
    subReasons: ['Too small / tight overall', 'Too loose / baggy', 'Length is too long', 'Length is too short', 'Chest / Waist doesn’t fit'],
  },
  {
    id: 'quality_defect',
    title: 'Defective or Damaged Product',
    icon: '⚠️',
    description: 'Torn fabric, stitching broken, stains or transit damage',
    subReasons: ['Fabric torn or stitching opened', 'Stain or marks on product', 'Buttons/zipper broken', 'Damaged during courier transit'],
  },
  {
    id: 'wrong_item',
    title: 'Received Wrong Item or Color',
    icon: '📦',
    description: 'Item delivered is completely different from what was shown',
    subReasons: ['Completely different product delivered', 'Color is different from catalog photo', 'Wrong size sent by seller (e.g. ordered M, got XL)'],
  },
  {
    id: 'quality_mismatch',
    title: 'Quality Not as Expected',
    icon: '🧵',
    description: 'Material is transparent, rough, or cheap quality',
    subReasons: ['Fabric is see-through / thin', 'Material is rough / uncomfortable', 'Print or embroidery quality is poor'],
  },
];

export default function ReturnRequest({ onNavigate, onBack }) {
  const location = useLocation();

  // Parse query params if any
  const searchParams = new URLSearchParams(location.search);
  const orderIdParam = searchParams.get('orderId') || '';
  const itemParam = searchParams.get('item') || 'Delivered Product';
  const priceParam = searchParams.get('price') || '799';
  const imageParam = searchParams.get('image') || '';
  const sizeParam = searchParams.get('size') || 'Free Size';
  const deliveredDateParam = searchParams.get('deliveredDate') || 'Recently Delivered';

  // Step state (1: Mode & Reason, 2: Proof & Photos, 3: Refund/Exchange, 4: Pickup Slot, 5: Success)
  const [currentStep, setCurrentStep] = useState(1);
  const [actionType, setActionType] = useState('return'); // 'return' | 'exchange'

  // Reason state
  const [selectedReasonId, setSelectedReasonId] = useState('size_fit');
  const [selectedSubReason, setSelectedSubReason] = useState('Too small / tight overall');
  const [comments, setComments] = useState('');

  // Exchange options
  const [selectedExchangeSize, setSelectedExchangeSize] = useState('M');

  // Photo proof state - starts completely empty, no dummy photos!
  const [proofs, setProofs] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showMobileSourceModal, setShowMobileSourceModal] = useState(false);
  const [isChecklistAgreed, setIsChecklistAgreed] = useState(true);

  // Refund state - starts clean
  const [refundMethod, setRefundMethod] = useState('upi'); // 'upi' | 'bank' | 'wallet'
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    reAccountNumber: '',
    ifsc: '',
    holderName: '',
  });

  // Pickup slot state
  const [pickupSlot, setPickupSlot] = useState('slot_tomorrow_morning');
  const [pickupAddress, setPickupAddress] = useState(
    searchParams.get('address') || 'Your Delivery Address'
  );

  // UI Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger device native gallery/file picker (mobile opens source sheet, desktop opens file picker)
  const handleOpenFileDialog = () => {
    if (window.innerWidth <= 768) {
      setShowMobileSourceModal(true);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Handle actual file upload from user device / gallery
  const handleRealFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newProofs = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast(`"${file.name}" is not an image! Please select JPG, PNG, or WebP images.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`"${file.name}" exceeds 10MB limit!`);
        continue;
      }

      const localUrl = URL.createObjectURL(file);
      const sizeInKb = Math.round(file.size / 1024);
      const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

      newProofs.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        url: localUrl,
        size: formattedSize,
        type: proofs.length === 0 && newProofs.length === 0 ? 'Product Photo' : 'Tag / Defect Detail',
        isLocal: true,
      });
    }

    if (newProofs.length > 0) {
      setProofs((prev) => [...prev, ...newProofs]);
      showToast(`${newProofs.length} photo(s) selected from your gallery! 📸`);
    }

    // Reset input so same file can be chosen again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id) => {
    setProofs((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && target.isLocal && target.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((p) => p.id !== id);
    });
    showToast('Photo removed');
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
      return;
    }
    setIsUpiVerified(true);
    showToast('✓ UPI ID verified: PRIYA SHARMA (HDFC Bank)');
  };

  const handleSubmitReturn = () => {
    if (actionType === 'return' && refundMethod === 'upi' && !upiId) {
      showToast('Please provide your UPI ID for refund');
      return;
    }
    if (!isChecklistAgreed) {
      showToast('Please confirm the return quality checklist');
      return;
    }

    setCurrentStep(5); // Show success screen
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen text-[#191c1e] font-['Inter',sans-serif] pb-52 sm:pb-36 antialiased w-full max-w-full overflow-x-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-[#0f172a] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => {
                if (currentStep > 1 && currentStep < 5) {
                  setCurrentStep(currentStep - 1);
                } else if (onBack) {
                  onBack();
                } else if (onNavigate) {
                  onNavigate('/orders');
                } else {
                  window.history.back();
                }
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Back"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">{actionType === 'return' ? 'Return & Refund' : 'Exchange Item'}</span>
                <span className="text-[10px] sm:text-xs font-bold bg-pink-100 text-[#9f0038] px-2 py-0.5 rounded-full shrink-0">
                  #{orderIdParam}
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                Step {currentStep} of 4 • 100% Doorstep Moneyback Guarantee
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('supportCenter')}
            className="text-[11px] sm:text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full cursor-pointer transition-colors shrink-0"
          >
            Help?
          </button>
        </div>

        {/* Stepper Progress Bar (Only during steps 1-4) */}
        {currentStep < 5 && (
          <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-2.5 sm:pb-3">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-[9px] sm:text-[10px] font-extrabold text-slate-400">
              {[
                { step: 1, label: '1. Action & Reason', short: 'Reason' },
                { step: 2, label: '2. Photo Proof', short: 'Proof' },
                { step: 3, label: '3. Refund / Size', short: 'Refund' },
                { step: 4, label: '4. Pickup Slot', short: 'Slot' },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;

                return (
                  <div key={s.step} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isPassed
                          ? 'bg-emerald-500'
                          : isActive
                          ? 'bg-gradient-to-r from-[#9f0038] to-[#e11d48]'
                          : 'bg-slate-200'
                      }`}
                    ></div>
                    <span className={isActive ? 'text-[#9f0038]' : isPassed ? 'text-emerald-700' : ''}>
                      <span className="sm:hidden">{s.step}. {s.short}</span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-3 sm:px-4 py-3.5 sm:py-6 space-y-3.5 sm:space-y-6 min-w-0">
        {/* Product Being Returned Header Card */}
        {currentStep < 5 && (
          <section className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 sm:gap-4">
            <img
              src={imageParam || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80'}
              alt={itemParam}
              className="w-14 h-18 sm:w-20 sm:h-24 object-cover rounded-xl sm:rounded-2xl border border-slate-200 shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
              }}
            />
            <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                Delivered on {deliveredDateParam}
              </span>
              <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{itemParam}</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">
                Size: <strong className="text-slate-800">{sizeParam}</strong> • Qty: <strong>1</strong> • Refund:{' '}
                <strong className="text-[#9f0038] font-black">₹{priceParam}</strong>
              </p>
            </div>
          </section>
        )}

        {/* STEP 1: Action Type & Return Reason */}
        {currentStep === 1 && (
          <div className="space-y-3.5 sm:space-y-6 animate-in fade-in duration-200">
            {/* Action Toggle (Return vs Exchange) */}
            <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-2.5 sm:space-y-3">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">What would you like to do?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActionType('return')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 sm:gap-3 ${
                    actionType === 'return'
                      ? 'border-[#9f0038] bg-rose-50/50 shadow-sm shadow-pink-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0 ${
                      actionType === 'return' ? 'bg-[#9f0038] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    💰
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900">Return &amp; Get 100% Refund</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Rider will pick up item from your doorstep &amp; ₹{priceParam} will be credited to UPI/Bank.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('exchange')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 sm:gap-3 ${
                    actionType === 'exchange'
                      ? 'border-[#9f0038] bg-rose-50/50 shadow-sm shadow-pink-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0 ${
                      actionType === 'exchange' ? 'bg-[#9f0038] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    🔄
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900">Exchange for Different Size</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Exchange for another size with Zero extra delivery charges.
                    </p>
                  </div>
                </button>
              </div>
            </section>

            {/* If Exchange: Select New Size */}
            {actionType === 'exchange' && (
              <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-2.5 sm:space-y-3">
                <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Select New Size you want</span>
                  <span className="text-[11px] text-slate-400 font-normal">(Current: Free Size)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { size: 'XS', stock: 'In Stock' },
                    { size: 'S', stock: 'In Stock' },
                    { size: 'M', stock: '2 left' },
                    { size: 'L', stock: 'In Stock' },
                    { size: 'XL', stock: 'In Stock' },
                    { size: 'XXL', stock: 'In Stock' },
                  ].map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => setSelectedExchangeSize(item.size)}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 font-black text-xs text-center min-w-14 sm:min-w-16 transition-all cursor-pointer ${
                        selectedExchangeSize === item.size
                          ? 'border-[#9f0038] bg-[#9f0038] text-white shadow-sm shadow-pink-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                      }`}
                    >
                      <p className="text-xs sm:text-sm">{item.size}</p>
                      <p
                        className={`text-[9px] font-semibold ${
                          selectedExchangeSize === item.size ? 'text-pink-100' : 'text-slate-400'
                        }`}
                      >
                        {item.stock}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Select Reason */}
            <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-2.5 sm:space-y-3">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">Why are you returning/exchanging this item?</h3>

              <div className="space-y-2">
                {RETURN_REASONS.map((r) => {
                  const isSelected = selectedReasonId === r.id;

                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReasonId(r.id);
                        setSelectedSubReason(r.subReasons[0]);
                      }}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#9f0038] bg-pink-50/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="text-lg sm:text-xl shrink-0">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">{r.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{r.description}</p>
                        </div>
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#9f0038] bg-[#9f0038]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>}
                        </div>
                      </div>

                      {/* Sub-reasons expansion */}
                      {isSelected && (
                        <div className="mt-2.5 pt-2.5 border-t border-rose-100/70 space-y-1.5 animate-in fade-in">
                          <p className="text-[11px] font-extrabold text-[#9f0038]">Select specific detail:</p>
                          <div className="space-y-1">
                            {r.subReasons.map((sub) => (
                              <label
                                key={sub}
                                className="flex items-start gap-2 py-1 text-xs text-slate-700 font-semibold cursor-pointer hover:text-slate-900 leading-snug"
                              >
                                <input
                                  type="radio"
                                  name="subReason"
                                  checked={selectedSubReason === sub}
                                  onChange={() => setSelectedSubReason(sub)}
                                  className="accent-[#9f0038] mt-0.5 shrink-0"
                                />
                                <span>{sub}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Extra Comments */}
              <div className="pt-1.5">
                <label className="text-[11px] sm:text-xs font-bold text-slate-700 block mb-1">
                  Additional Comments / Defect Description (Optional):
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="e.g. Length is 4 inches longer than chart; cloth quality is transparent..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-xs font-medium focus:outline-none focus:border-[#9f0038] focus:bg-white transition-all shadow-inner"
                ></textarea>
              </div>
            </section>

            {/* CTA Continue to Step 2 */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-[#9f0038] to-[#e11d48] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide min-h-[46px]"
            >
              <span>Continue to Photo Proof</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {/* STEP 2: Photo Proof & Doorstep Checklist */}
        {currentStep === 2 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-3 sm:space-y-4">
              {/* Hidden Native File & Camera Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleRealFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleRealFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span>Upload Product Photos</span>
                    <span className="text-[10px] font-bold bg-pink-100 text-[#9f0038] px-2 py-0.5 rounded-full shrink-0">
                      Gallery / Camera
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Upload at least 1 photo of the product &amp; 1 photo showing brand tag or defect.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenFileDialog}
                    className="text-xs font-bold text-white bg-[#9f0038] hover:bg-[#85002f] active:scale-95 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-pink-500/20"
                  >
                    <span>📁</span>
                    <span>Browse Gallery</span>
                  </button>
                </div>
              </div>

              {/* Photos Grid or Empty State */}
              {proofs.length === 0 ? (
                <div className="border-2 border-dashed border-pink-300 bg-rose-50/30 hover:bg-rose-50/70 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-center transition-all space-y-2.5">
                  <div
                    onClick={handleOpenFileDialog}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm text-[#9f0038] cursor-pointer hover:scale-105 transition-transform"
                  >
                    📷
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Tap to Choose Photos from your Gallery or Camera
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Select JPG, PNG, or WebP images from your phone or computer (Max 10MB each)
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleOpenFileDialog}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9f0038] hover:bg-[#85002f] text-white text-xs font-extrabold shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
                    >
                      <span>Choose from Device</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {proofs.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs flex flex-col justify-between"
                    >
                      <div className="w-full h-32 sm:h-36 overflow-hidden bg-slate-100 relative">
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover object-center" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(p.id)}
                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white w-6 h-6 rounded-full shadow-md flex items-center justify-center text-xs font-black cursor-pointer transition-transform active:scale-90"
                          title="Remove Photo"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-2 bg-white space-y-0.5 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-800 truncate" title={p.name}>
                          {p.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="text-[#9f0038] font-bold">{p.type}</span>
                          <span>{p.size || 'Attached'}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add More Photos Card */}
                  <div
                    onClick={handleOpenFileDialog}
                    className="border-2 border-dashed border-slate-300 hover:border-[#9f0038] hover:bg-pink-50/40 rounded-xl sm:rounded-2xl h-32 sm:h-36 flex flex-col items-center justify-center text-slate-500 hover:text-[#9f0038] transition-all cursor-pointer p-3 text-center space-y-1"
                  >
                    <span className="text-xl sm:text-2xl">➕</span>
                    <span className="text-xs font-black">Add More</span>
                    <span className="text-[9px] text-slate-400">From gallery</span>
                  </div>
                </div>
              )}

              {/* Doorstep Handover Checklist */}
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 text-xs">
                <p className="font-extrabold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Doorstep Handover Verification</span>
                </p>
                <div className="space-y-1.5 text-slate-600">
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="leading-relaxed">Product brand tags and barcodes must remain attached.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="leading-relaxed">Item should be unworn, unwashed and in original plastic pouch.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="leading-relaxed">Rider will inspect the parcel and ask for Return OTP.</span>
                  </p>
                </div>

                <label className="flex items-start gap-2.5 pt-2 border-t border-slate-200 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={isChecklistAgreed}
                    onChange={(e) => setIsChecklistAgreed(e.target.checked)}
                    className="accent-[#9f0038] w-4 h-4 rounded mt-0.5 shrink-0"
                  />
                  <span className="leading-relaxed">I confirm the product meets all the above condition guidelines.</span>
                </label>
              </div>
            </section>

            {/* Nav Buttons */}
            <div className="flex gap-2.5 sm:gap-3 mb-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-24 sm:w-28 shrink-0 py-3 sm:py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-xs rounded-xl sm:rounded-2xl cursor-pointer transition-colors min-h-[46px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (proofs.length === 0) {
                    showToast('Please select at least 1 photo of the product from your gallery 📸');
                    return;
                  }
                  if (!isChecklistAgreed) {
                    showToast('Please confirm the doorstep condition checklist checkbox');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="flex-1 py-3 sm:py-3.5 px-3 bg-gradient-to-r from-[#9f0038] to-[#e11d48] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase tracking-wide min-h-[46px]"
              >
                <span className="truncate">Continue to {actionType === 'return' ? 'Refund Details' : 'Pickup Slot'}</span>
                <span className="shrink-0">➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Refund Method Selection (For Return) or Confirmation (For Exchange) */}
        {currentStep === 3 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {actionType === 'return' ? (
              <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">Where should we send your ₹{priceParam} refund?</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Refund is initiated automatically the moment delivery rider picks up the product.
                  </p>
                </div>

                {/* Refund Method Options */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Option 1: Instant UPI */}
                  <div
                    onClick={() => setRefundMethod('upi')}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                      refundMethod === 'upi' ? 'border-[#9f0038] bg-rose-50/40 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">⚡</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900">Instant UPI Transfer</h4>
                            <span className="text-[9px] sm:text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                              Fastest (Within 2 Hours)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          refundMethod === 'upi' ? 'border-[#9f0038] bg-[#9f0038]' : 'border-slate-300'
                        }`}
                      >
                        {refundMethod === 'upi' && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>}
                      </div>
                    </div>

                    {refundMethod === 'upi' && (
                      <div className="mt-2.5 pt-2.5 border-t border-rose-100 space-y-2 animate-in fade-in">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setIsUpiVerified(false);
                            }}
                            placeholder="Enter UPI ID (e.g. mobile@upi)"
                            className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#9f0038]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyUpi}
                            className="px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                          >
                            Verify
                          </button>
                        </div>
                        {isUpiVerified && (
                          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 leading-snug">
                            <span>✓</span> Verified Name: <strong>PRIYA SHARMA</strong> (HDFC Bank)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option 2: Bank Account Transfer */}
                  <div
                    onClick={() => setRefundMethod('bank')}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                      refundMethod === 'bank' ? 'border-[#9f0038] bg-rose-50/40 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">🏦</span>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs sm:text-sm text-slate-900">Direct Bank Account Transfer</h4>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Credited within 24-48 business hours via NEFT</p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          refundMethod === 'bank' ? 'border-[#9f0038] bg-[#9f0038]' : 'border-slate-300'
                        }`}
                      >
                        {refundMethod === 'bank' && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>}
                      </div>
                    </div>

                    {refundMethod === 'bank' && (
                      <div className="mt-2.5 pt-2.5 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs animate-in fade-in">
                        <input
                          type="text"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                          placeholder="Account Number"
                          className="bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-xs"
                        />
                        <input
                          type="text"
                          value={bankDetails.ifsc}
                          onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                          placeholder="IFSC Code"
                          className="bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-xs uppercase"
                        />
                        <input
                          type="text"
                          value={bankDetails.holderName}
                          onChange={(e) => setBankDetails({ ...bankDetails, holderName: e.target.value })}
                          placeholder="Account Holder Name"
                          className="bg-white border border-slate-300 rounded-xl p-2.5 font-semibold text-xs sm:col-span-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Option 3: Meesho Wallet Credit */}
                  <div
                    onClick={() => setRefundMethod('wallet')}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                      refundMethod === 'wallet' ? 'border-[#9f0038] bg-rose-50/40 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">👛</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900">Meesho Wallet Balance</h4>
                            <span className="text-[9px] sm:text-[10px] font-black bg-rose-100 text-[#9f0038] px-2 py-0.5 rounded-full shrink-0">
                              +₹50 Extra Bonus
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Instant ₹{priceParam} + ₹50 shopping bonus = ₹{Number(priceParam) + 50} credit for next orders
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          refundMethod === 'wallet' ? 'border-[#9f0038] bg-[#9f0038]' : 'border-slate-300'
                        }`}
                      >
                        {refundMethod === 'wallet' && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              /* Exchange Summary Card */
              <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <h3 className="font-black text-xs sm:text-sm text-slate-900">Exchange Replacement Summary</h3>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Item:</span>
                    <strong className="text-slate-800">{sizeParam} (₹{priceParam})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested Replacement:</span>
                    <strong className="text-emerald-700">Size: {selectedExchangeSize} (₹{priceParam})</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-xs sm:text-sm">
                    <span className="font-bold text-slate-700">Total Price Difference:</span>
                    <strong className="text-emerald-600">₹0 (Free Exchange)</strong>
                  </div>
                </div>
              </section>
            )}

            {/* Nav Buttons */}
            <div className="flex gap-2.5 sm:gap-3 mb-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-24 sm:w-28 shrink-0 py-3 sm:py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-xs rounded-xl sm:rounded-2xl cursor-pointer transition-colors min-h-[46px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-3 sm:py-3.5 px-3 bg-gradient-to-r from-[#9f0038] to-[#e11d48] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase tracking-wide min-h-[46px]"
              >
                <span className="truncate">Continue to Pickup Slot</span>
                <span className="shrink-0">➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Doorstep Reverse Pickup Slot & Final Submit */}
        {currentStep === 4 && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* Pickup Address */}
            <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xs sm:text-sm text-slate-900">Doorstep Pickup Address</h3>
                <button
                  type="button"
                  onClick={() => showToast('Address editor opened')}
                  className="text-xs font-bold text-[#9f0038] hover:underline cursor-pointer"
                >
                  Edit Address
                </button>
              </div>
              <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-semibold">
                📍 {pickupAddress}
              </div>
            </section>

            {/* Pickup Slot Selection */}
            <section className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 space-y-2.5 sm:space-y-3">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">Select Preferred Pickup Slot</h3>

              <div className="space-y-2 sm:space-y-2.5">
                {[
                  {
                    id: 'slot_today_evening',
                    time: 'Today, 4:00 PM - 7:00 PM',
                    tag: 'Express Pickup ⚡',
                    desc: 'Rider in your area will arrive today evening',
                  },
                  {
                    id: 'slot_tomorrow_morning',
                    time: 'Tomorrow, 9:00 AM - 1:00 PM',
                    tag: 'Recommended',
                    desc: 'Standard morning pickup window',
                  },
                  {
                    id: 'slot_tomorrow_evening',
                    time: 'Tomorrow, 2:00 PM - 6:00 PM',
                    tag: 'Flexible',
                    desc: 'Afternoon / post-lunch handover',
                  },
                ].map((slot) => (
                  <label
                    key={slot.id}
                    onClick={() => setPickupSlot(slot.id)}
                    className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      pickupSlot === slot.id
                        ? 'border-[#9f0038] bg-rose-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-slate-900">{slot.time}</span>
                        <span className="text-[9px] sm:text-[10px] font-bold bg-pink-100 text-[#9f0038] px-2 py-0.5 rounded-full shrink-0">
                          {slot.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{slot.desc}</p>
                    </div>

                    <input
                      type="radio"
                      name="pickupSlot"
                      checked={pickupSlot === slot.id}
                      onChange={() => setPickupSlot(slot.id)}
                      className="accent-[#9f0038] w-4 h-4 shrink-0"
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Final Order Return Breakdown Card */}
            <section className="bg-gradient-to-br from-rose-50/90 via-pink-50/60 to-rose-50/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-rose-200/80 space-y-2.5 text-xs shadow-xs">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">Summary of Request</h4>
              <div className="flex justify-between items-center text-slate-600 py-0.5">
                <span>Request Type:</span>
                <strong className="text-slate-900 capitalize font-bold">{actionType}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 py-0.5">
                <span>Reason:</span>
                <strong className="text-slate-900 font-bold">{selectedSubReason}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 py-0.5">
                <span>Doorstep Pickup Fee:</span>
                <strong className="text-emerald-600 font-bold">FREE (₹0)</strong>
              </div>
              {actionType === 'return' ? (
                <div className="flex justify-between items-center text-xs sm:text-sm font-black pt-2.5 border-t border-rose-200/90 text-slate-900">
                  <span>Net Refund to be Credited:</span>
                  <span className="text-[#9f0038] text-base sm:text-lg font-black">₹{priceParam}.00</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs sm:text-sm font-black pt-2.5 border-t border-rose-200/90 text-slate-900">
                  <span>Replacement Item:</span>
                  <span className="text-emerald-700 font-extrabold">Size {selectedExchangeSize}</span>
                </div>
              )}
            </section>

            {/* Nav and Final CTA */}
            <div className="flex gap-2.5 sm:gap-3 mb-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-24 sm:w-28 shrink-0 py-3 sm:py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-xs rounded-xl sm:rounded-2xl cursor-pointer transition-colors min-h-[48px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitReturn}
                className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 bg-gradient-to-r from-[#9f0038] to-[#e11d48] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-pink-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase tracking-wide min-h-[48px]"
              >
                <span className="truncate">Submit {actionType === 'return' ? 'Return Request' : 'Exchange Request'}</span>
                <span className="shrink-0 text-sm">✓</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS CONFIRMATION & REVERSE LOGISTICS TRACKER */}
        {currentStep === 5 && (
          <section className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 text-center space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl sm:text-4xl animate-bounce">
              ✓
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-pink-50 text-[#9f0038] font-black text-[11px] sm:text-xs rounded-full uppercase tracking-wide mb-2">
                Return ID: #RET-92841
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900">
                {actionType === 'return' ? 'Return Request Placed! 🎉' : 'Exchange Scheduled! 🔄'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                {actionType === 'return'
                  ? `Our courier partner will visit your address to pick up the item. Your refund of ₹${priceParam} will be credited immediately upon pickup.`
                  : `Your size ${selectedExchangeSize} replacement has been booked and will be dispatched once rider picks up the current item.`}
              </p>
            </div>

            {/* Live Reverse Tracking Stepper */}
            <div className="bg-slate-50 border border-slate-200/70 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl text-left max-w-lg mx-auto space-y-3 sm:space-y-4">
              <h3 className="font-black text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
                Reverse Pickup &amp; Refund Journey
              </h3>

              <div className="space-y-3 sm:space-y-4 relative">
                {[
                  {
                    title: 'Return Request Registered',
                    desc: 'Today • Verified by Meesho Guarantee',
                    done: true,
                    current: false,
                  },
                  {
                    title: 'Courier Rider Assigned (Shadowfax)',
                    desc: 'Rider Sunil Kumar will arrive to collect return parcel',
                    done: false,
                    current: true,
                  },
                  {
                    title: 'Doorstep Verification & Handover',
                    desc: 'Rider inspects brand tags and scans return OTP',
                    done: false,
                    current: false,
                  },
                  {
                    title:
                      actionType === 'return'
                        ? `₹${priceParam} Refund Credited to UPI/Bank`
                        : 'New Replacement Size Dispatched',
                    desc:
                      actionType === 'return'
                        ? `Funds sent to ${refundMethod === 'upi' ? (upiId || 'your UPI ID') : 'your bank account'}`
                        : 'Tracking number will be sent via SMS',
                    done: false,
                    current: false,
                  },
                ].map((st, i, arr) => (
                  <div key={i} className="flex gap-2.5 sm:gap-3 relative">
                    {i !== arr.length - 1 && (
                      <div
                        className={`absolute left-3 sm:left-3.5 top-6 bottom-0 w-0.5 ${
                          st.done ? 'bg-[#9f0038]' : 'bg-slate-200'
                        }`}
                      ></div>
                    )}
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0 z-10 ${
                        st.current
                          ? 'bg-[#9f0038] text-white ring-4 ring-pink-100 animate-pulse'
                          : st.done
                          ? 'bg-[#9f0038] text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {st.done ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 pb-1 min-w-0">
                      <p className="font-black text-xs text-slate-900 leading-snug">{st.title}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-md mx-auto mb-4">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/orders')}
                className="flex-1 py-3 sm:py-3.5 bg-[#9f0038] hover:bg-[#85002f] active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-pink-500/20 cursor-pointer transition-all uppercase tracking-wide min-h-[46px]"
              >
                View in My Orders 📦
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                className="flex-1 py-3 sm:py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl cursor-pointer transition-colors uppercase tracking-wide min-h-[46px]"
              >
                Continue Shopping
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Responsive Camera vs Gallery Bottom Sheet Modal */}
      {showMobileSourceModal && (
        <div
          onClick={() => setShowMobileSourceModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 space-y-3 animate-in slide-in-from-bottom-5"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1 sm:hidden" />
            <h4 className="font-black text-sm text-slate-900 text-center">Add Product Photo</h4>
            <p className="text-[11px] text-slate-500 text-center">Select photo source from your phone</p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowMobileSourceModal(false);
                  if (cameraInputRef.current) cameraInputRef.current.click();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#9f0038] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xl">photo_camera</span>
                <span>Take Photo with Camera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMobileSourceModal(false);
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xl">photo_library</span>
                <span>Choose from Gallery / Files</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMobileSourceModal(false)}
                className="w-full py-2.5 px-4 rounded-2xl text-slate-500 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <AppBottomNav activeNav="orders" onNavigate={onNavigate} />
    </div>
  );
}
