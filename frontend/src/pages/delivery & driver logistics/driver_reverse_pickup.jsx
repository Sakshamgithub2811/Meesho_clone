import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

export default function DriverReversePickup({ onNavigate, onBack }) {
  // Quality Check State
  const [qcTags, setQcTags] = useState(true);
  const [qcCondition, setQcCondition] = useState(true);
  const [qcMatch, setQcMatch] = useState(true);
  const [qcPackaging, setQcPackaging] = useState(true);

  // OTP State
  const [otp, setOtp] = useState(['5', '8', '2', '9']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Security Bag Scan State
  const [isBagScanned, setIsBagScanned] = useState(false);
  const [bagBarcode, setBagBarcode] = useState('MEE-RET-BAG-99412');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [manualBarcodeInput, setManualBarcodeInput] = useState('');
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const videoRef = React.useRef(null);
  const mediaStreamRef = React.useRef(null);

  // Customer return reason & evidence data
  const customerReturnData = {
    orderId: 'ORD-998241',
    taskId: 'RET-TSK-8821',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    itemTitle: 'Kanjivaram Soft Silk Woven Saree with Blouse Piece',
    itemColor: 'Magenta & Gold',
    itemSize: 'Free Size',
    originalPrice: '₹849',
    reasonCategory: 'Size & Fit / Defective Border',
    customerComment: 'Too loose / baggy on drape; defective border stitching loose near pallu',
    customerPhotos: [
      {
        id: 'cust_p1',
        title: 'Customer Photo: Reported Border Defect',
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        caption: 'Reported loose stitching near pallu border',
      },
      {
        id: 'cust_p2',
        title: 'Customer Photo: Saree Overview & Brand Tag',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        caption: 'Full saree drape with manufacturer tag attached',
      },
    ],
  };

  // Driver Physical Inspection & Photo Evidence State
  const [driverPhotos, setDriverPhotos] = useState([
    {
      id: 'drv_p1',
      name: 'doorstep_product_inspection.jpg',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      label: 'Physical Saree Inspection (Pallu & Border)',
      time: 'Doorstep Camera',
    },
    {
      id: 'drv_p2',
      name: 'doorstep_brand_tag_check.jpg',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      label: 'Brand Tag & Price Barcode Verified',
      time: 'Doorstep Camera',
    },
  ]);
  const [isReasonVerified, setIsReasonVerified] = useState(false);
  const driverPhotoInputRef = React.useRef(null);
  const rejectPhotoInputRef = React.useRef(null);

  // Rejection modal & rejection state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('reason_mismatch');
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectPhoto, setRejectPhoto] = useState({
    name: 'driver_rejection_proof.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  });
  const [isPickupRejected, setIsPickupRejected] = useState(false);
  const [rejectedSummary, setRejectedSummary] = useState(null);

  // Lightbox Zoom Modal Image
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Success state
  const [isPickupCompleted, setIsPickupCompleted] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAllQcPass = () => {
    setQcTags(true);
    setQcCondition(true);
    setQcMatch(true);
    setQcPackaging(true);
    triggerToast('All 4 Quality Check items marked as PASSED ✓');
  };

  const allQcPassed = qcTags && qcCondition && qcMatch && qcPackaging;

  const handleVerifyOtp = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      triggerToast('Please enter full 4-digit Return OTP');
      return;
    }
    setIsOtpVerified(true);
    triggerToast('✓ Return OTP verified successfully!');
  };

  const handleDriverPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newPhoto = {
      id: `drv_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      label: `Inspection Evidence #${driverPhotos.length + 1}`,
      time: 'Doorstep Live',
    };
    setDriverPhotos((prev) => [...prev, newPhoto]);
    triggerToast(`📷 Driver Evidence photo captured: ${file.name}`);
  };

  const handleRemoveDriverPhoto = (photoId) => {
    setDriverPhotos((prev) => prev.filter((p) => p.id !== photoId));
    triggerToast('Driver photo evidence removed');
  };

  const handleRejectPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRejectPhoto({
      name: file.name,
      url: URL.createObjectURL(file),
    });
    triggerToast(`📷 Rejection discrepancy evidence attached: ${file.name}`);
  };

  const REJECT_REASONS_MAP = {
    reason_mismatch: {
      title: 'Item Does NOT Match Customer Return Reason',
      desc: 'Claimed border defect is fabricated / not present; saree is intact or different.',
    },
    tags_missing: {
      title: 'Brand Tags / Price Labels Missing or Cut',
      desc: 'Original manufacturer tags and barcodes are removed or torn.',
    },
    used_worn: {
      title: 'Item is Worn, Washed, Stained or Odorous',
      desc: 'Strong perfume smell, body sweat marks, or wash detergent stains detected.',
    },
    fake_product: {
      title: 'Different / Fake / Duplicate Item Handed Over',
      desc: 'Product returned is not the original Meesho catalog brand item.',
    },
    damaged_by_customer: {
      title: 'Physical Damage / Tear Caused by Customer',
      desc: 'Cloth torn intentionally or burnt/stained at customer end.',
    },
    customer_refused: {
      title: 'Customer Refused to Handover Item',
      desc: 'Customer declined to give the product or requested pickup reschedule.',
    },
  };

  const handleConfirmReject = () => {
    const reasonInfo = REJECT_REASONS_MAP[rejectReason] || {
      title: rejectReason,
      desc: 'Quality check failed at doorstep.',
    };
    setRejectedSummary({
      reasonId: rejectReason,
      reasonTitle: reasonInfo.title,
      notes: rejectNotes.trim() || 'Discrepancy observed between customer return claim and physical item.',
      photo: rejectPhoto,
      rejectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setIsRejectModalOpen(false);
    setIsPickupRejected(true);
    triggerToast('❌ Return Pickup Rejected at Doorstep. Reason logged & customer notified via SMS.');
  };

  // Web Audio API Synthesizer for high-pitch delivery barcode scanner beep
  const playBeepSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio feedback not available', e);
    }
  };

  // Start Scanner and attempt Camera
  const handleOpenScanner = async () => {
    setIsScannerOpen(true);
    setIsManualInputOpen(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.log('Camera permission denied or not supported, using simulation mode');
    }
  };

  // Close Scanner & Release Camera Stream
  const handleCloseScanner = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsScannerOpen(false);
    setIsTorchOn(false);
  };

  // Confirm Scanned Barcode
  const handleConfirmScan = (scannedCode = 'MEE-RET-BAG-99412') => {
    playBeepSound();
    setBagBarcode(scannedCode);
    setIsBagScanned(true);
    handleCloseScanner();
    triggerToast(`✓ Barcode [${scannedCode}] Scanned & Sealed! 🔊`);
  };

  const handleCompletePickup = () => {
    if (!isReasonVerified) {
      triggerToast('⚠️ Please verify that the item matches customer reason and tick the verification checkbox!');
      return;
    }
    if (driverPhotos.length === 0) {
      triggerToast('⚠️ Please capture at least 1 photo of the physical product as evidence!');
      return;
    }
    if (!allQcPassed) {
      triggerToast('Cannot accept return: Quality check failed! Please reject return or verify item.');
      return;
    }
    if (!isOtpVerified) {
      triggerToast('Please verify customer Return OTP first!');
      return;
    }
    if (!isBagScanned) {
      triggerToast('Please scan the tamper-proof security bag barcode!');
      return;
    }

    setIsPickupCompleted(true);
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] font-sans antialiased min-h-screen pb-44 sm:pb-36 selection:bg-pink-100 selection:text-pink-600">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-[#0f172a] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('driver_dashboard') : window.history.back())}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Back"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="font-black text-sm sm:text-base text-[#b90041] whitespace-nowrap">
                  Reverse Pickup
                </h1>
                <span className="text-[9px] sm:text-[10px] font-black bg-pink-100 text-[#b90041] px-1.5 py-0.5 rounded-md sm:rounded-full shrink-0">
                  <span className="sm:hidden">#8821</span>
                  <span className="hidden sm:inline">#RET-TSK-8821</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Doorstep QC &amp; Return Handover</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] sm:text-xs font-black bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
              <span>+₹65</span>
              <span className="text-[9px] sm:text-[10px] font-semibold">Incentive</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Customer Location & Contact Card */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <h2 className="font-black text-sm sm:text-base text-slate-900">Priya Sharma</h2>
                <span className="text-[11px] font-bold text-slate-400">• 1.8 km away</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flat 402, Royal Palms, MG Road, Near Metro Pillar 140, Bengaluru - 560001
              </p>
            </div>

            <span className="text-xs font-black bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200 self-start sm:self-auto shrink-0">
              Pickup Slot: 4:00 - 7:00 PM
            </span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => triggerToast('Calling customer Priya (+91 98765 43210)... 📞')}
              className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-emerald-200/60"
            >
              <span>📞 Call Customer</span>
            </button>
            <button
              onClick={() => triggerToast('Opening Google Maps navigation to customer address... 🗺️')}
              className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-indigo-200/60"
            >
              <span>🧭 Navigate GPS</span>
            </button>
          </div>
        </section>

        {/* Doorstep Rejection Summary Banner (Shown when driver rejected return) */}
        {isPickupRejected && rejectedSummary && (
          <section className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-sm">
                  ✕
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                      Doorstep Discrepancy Logged
                    </span>
                    <span className="text-xs font-bold text-rose-700 font-mono">
                      {rejectedSummary.rejectedAt}
                    </span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-rose-950 mt-0.5">
                    Return Pickup Rejected at Doorstep
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-white px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto">
                Customer SMS Dispatched 📨
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-rose-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Primary Rejection Reason:</span>
                <p className="font-extrabold text-rose-800 text-sm">{rejectedSummary.reasonTitle}</p>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Driver Remarks:</strong> "{rejectedSummary.notes}"
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-rose-200/80 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Rejection Evidence Photo:</span>
                  <p className="font-bold text-slate-800 truncate">{rejectedSummary.photo?.name || 'Evidence Attached'}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Uploaded to Audit Trail</p>
                </div>
                {rejectedSummary.photo?.url && (
                  <img
                    src={rejectedSummary.photo.url}
                    alt="Rejection Evidence"
                    onClick={() => setPreviewModalImg({ url: rejectedSummary.photo.url, title: 'Driver Rejection Discrepancy Photo' })}
                    className="w-14 h-14 object-cover rounded-xl border border-rose-300 cursor-pointer hover:opacity-90 shrink-0"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsPickupRejected(false);
                  setIsReasonVerified(false);
                  triggerToast('Re-inspection mode enabled. You can verify and retry pickup.');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
              >
                ↻ Cancel Rejection &amp; Re-inspect
              </button>
              <button
                type="button"
                onClick={() => (onNavigate ? onNavigate('driver_dashboard') : window.history.back())}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-sm transition-all text-center"
              >
                Return to Logistics Dashboard
              </button>
            </div>
          </section>
        )}

        {/* Expected Product & Customer Reported Return Reason Card */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Expected Return Item &amp; Customer Claim</span>
            </h3>
            <span className="text-xs font-bold text-[#b90041]">Original Price: {customerReturnData.originalPrice}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80"
              alt="Saree Preview"
              onClick={() => setPreviewModalImg({ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80', title: customerReturnData.itemTitle })}
              className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-2xl border border-slate-200 shrink-0 cursor-pointer hover:opacity-95"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase bg-pink-50 text-[#b90041] px-2 py-0.5 rounded-md border border-pink-200">
                  Order #{customerReturnData.orderId}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Task #{customerReturnData.taskId}
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                {customerReturnData.itemTitle}
              </h4>
              <p className="text-xs text-slate-500 font-semibold">
                Color: <strong className="text-slate-700">{customerReturnData.itemColor}</strong> • Size:{' '}
                <strong className="text-slate-700">{customerReturnData.itemSize}</strong>
              </p>
            </div>
          </div>

          {/* Customer Stated Reason & Uploaded Evidence Photos Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>📋 Customer's Stated Reason for Return:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[11px] self-start sm:self-auto">
                {customerReturnData.reasonCategory}
              </span>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-slate-800 italic">
              "{customerReturnData.customerComment}"
            </div>

            {/* Customer Evidence Photo Thumbnails */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Customer Uploaded Proof Photos (Compare at Doorstep):
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Click to zoom</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                {customerReturnData.customerPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setPreviewModalImg({ url: photo.url, title: photo.title })}
                    className="p-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 flex items-center gap-2.5 cursor-pointer transition-all hover:shadow-xs group"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{photo.caption}</p>
                      <span className="text-[10px] text-[#b90041] font-bold flex items-center gap-0.5 mt-0.5">
                        <span>🔍 View Proof</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-amber-800 font-medium">
              💡 <strong>Driver Inspection Rule:</strong> Examine the physical product handed over. Verify that it matches this customer claim and has original brand tags before accepting.
            </p>
          </div>
        </section>

        {/* STEP 1: Driver Reverse Product Photo Evidence & Physical Reason Verification */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>1. Driver Physical Inspection &amp; Photo Evidence *</span>
                {driverPhotos.length > 0 && isReasonVerified && (
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Verified &amp; Captured
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                Click or upload live photos of the handed-over product, brand tags, and defect area.
              </p>
            </div>

            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
              {driverPhotos.length} Photo{driverPhotos.length !== 1 ? 's' : ''} Attached
            </span>
          </div>

          {/* Hidden File Input for Driver Photo Capture */}
          <input
            type="file"
            ref={driverPhotoInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleDriverPhotoUpload}
            className="hidden"
          />

          {/* Evidence Photos Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {driverPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/90 flex items-center gap-3 transition-colors"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  onClick={() => setPreviewModalImg({ url: photo.url, title: photo.label })}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-300 shrink-0 cursor-pointer hover:opacity-90"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      Photo #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{photo.time}</span>
                  </div>
                  <p className="font-extrabold text-xs text-slate-800 truncate mt-0.5">{photo.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{photo.name}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewModalImg({ url: photo.url, title: photo.label })}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs cursor-pointer"
                    title="Zoom Photo"
                  >
                    🔍
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDriverPhoto(photo.id)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs cursor-pointer"
                    title="Remove Photo"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Evidence Photo Button Card */}
            <div
              onClick={() => driverPhotoInputRef.current?.click()}
              className="p-3 border-2 border-dashed border-pink-300 hover:border-[#b90041] bg-pink-50/40 hover:bg-pink-50/80 rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer transition-all min-h-[68px]"
            >
              <span className="w-8 h-8 rounded-full bg-[#b90041] text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                📷
              </span>
              <div>
                <span className="text-xs font-extrabold text-[#b90041] block">
                  Click / Upload Product Photo
                </span>
                <span className="text-[10px] text-slate-500">
                  Capture physical item, tags or defect
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Driver Reason Verification Checkbox */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label
              className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                isReasonVerified
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                  : 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
              }`}
            >
              <input
                type="checkbox"
                checked={isReasonVerified}
                onChange={(e) => {
                  setIsReasonVerified(e.target.checked);
                  if (e.target.checked) {
                    triggerToast('✓ Driver Inspection Passed: Product verified against customer reason.');
                  }
                }}
                className="mt-0.5 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer shrink-0"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                    I physically verified the returned item against customer reason *
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isReasonVerified
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {isReasonVerified ? '✓ Verified by Driver' : 'Mandatory Check'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I confirm that the saree matches the customer's reported reason (defective border / fit issue), brand tags &amp; original condition are intact, and live photo evidence is attached.
                </p>
              </div>
            </label>

            {/* Problem Found / Rejection Trigger */}
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-rose-900">
                <span className="text-base shrink-0">⚠️</span>
                <span className="font-bold">
                  Product doesn't match, tags missing, or item heavily worn/damaged?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
              >
                Reject Return at Doorstep
              </button>
            </div>
          </div>
        </section>

        {/* STEP 2: Doorstep 4-Point QC Checklist */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>2. Doorstep 4-Point QC Checklist</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Verify secondary criteria before collecting customer OTP
              </p>
            </div>
            <button
              onClick={handleAllQcPass}
              className="text-xs font-bold text-[#b90041] bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              ✓ Pass All
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'tags',
                title: 'Brand Tags & Price Barcode Intact?',
                desc: 'Must have original tag hanging on border/collar',
                state: qcTags,
                setter: setQcTags,
              },
              {
                id: 'condition',
                title: 'Unworn, Clean & Odor-Free?',
                desc: 'No perfume smell, sweat stains, or wash signs',
                state: qcCondition,
                setter: setQcCondition,
              },
              {
                id: 'match',
                title: 'Item Matches App Photo & Color?',
                desc: 'Check saree zari work & fabric against picture',
                state: qcMatch,
                setter: setQcMatch,
              },
              {
                id: 'packaging',
                title: 'Original Plastic Pouch Included?',
                desc: 'Original inner packaging present with invoice',
                state: qcPackaging,
                setter: setQcPackaging,
              },
            ].map((qc) => (
              <div
                key={qc.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  qc.state ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{qc.state ? '✅' : '❌'}</span>
                    <span>{qc.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{qc.desc}</p>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={() => qc.setter(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      qc.state ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => qc.setter(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      !qc.state ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Fail
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!allQcPassed && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
              <span className="font-bold">
                ⚠️ QC Checklist has failed items! Do not accept return parcel.
              </span>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs hover:bg-rose-700 cursor-pointer whitespace-nowrap"
              >
                Reject Return
              </button>
            </div>
          )}
        </section>

        {/* STEP 3: Customer Return OTP Verification */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>3. Customer Return OTP Verification</span>
                {isOtpVerified && (
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">Ask customer for the 4-digit OTP sent on their SMS</p>
            </div>

            <button
              onClick={() => {
                setOtp(['5', '8', '2', '9']);
                triggerToast('Filled simulated customer OTP: 5829');
              }}
              className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Demo Auto-Fill (5829)
            </button>
          </div>

          <div className="flex items-center gap-3 justify-center py-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                disabled={isOtpVerified}
                onChange={(e) => {
                  const val = e.target.value;
                  const newOtp = [...otp];
                  newOtp[idx] = val;
                  setOtp(newOtp);
                }}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#b90041] focus:bg-white transition-all shadow-inner"
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => triggerToast('OTP resent to customer (+91 98765 43210) 📨')}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Resend OTP
            </button>
            <button
              onClick={handleVerifyOtp}
              disabled={isOtpVerified}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isOtpVerified
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#b90041] hover:bg-[#990035] text-white shadow-md shadow-pink-500/20 active:scale-95'
              }`}
            >
              {isOtpVerified ? '✓ OTP Verified' : 'Verify Customer OTP'}
            </button>
          </div>
        </section>

        {/* STEP 4: Scan Return Security Bag */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>4. Seal in Return Security Bag</span>
                {isBagScanned && (
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Sealed
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                Scan tamper-evident Meesho return polybag before leaving customer doorstep
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                🛍️
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-slate-800">
                  Barcode: <span className="text-[#b90041] font-mono">{bagBarcode}</span>
                </p>
                <p className="text-[11px] text-slate-500">Destination: Central Hub Return Depot</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenScanner}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isBagScanned
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95'
              }`}
            >
              <span>📷</span>
              <span>{isBagScanned ? 'Re-scan Barcode' : 'Open Barcode Scanner'}</span>
            </button>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleCompletePickup}
          className="w-full py-4 bg-gradient-to-r from-[#b90041] to-[#df2457] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <span>Complete Reverse Pickup &amp; Earn ₹65</span>
          <span>➔</span>
        </button>
      </main>

      {/* Enhanced Rejection Modal (Reason Selection, Driver Notes, & Discrepancy Photo Evidence) */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Doorstep Verification Failure
                </span>
                <h3 className="font-black text-base sm:text-lg text-rose-700 mt-0.5">
                  Reject Return Pickup
                </h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select reason for rejecting pickup and attach photo proof of discrepancy:
            </p>

            {/* Rejection Reason Radios */}
            <div className="space-y-2">
              {[
                { id: 'reason_mismatch', label: 'Item Does NOT Match Customer Return Reason', desc: 'No defect present or customer claimed false reason.' },
                { id: 'tags_missing', label: 'Brand Tags / Price Labels Missing or Cut', desc: 'Original manufacturer tag has been removed or torn.' },
                { id: 'used_worn', label: 'Item is Worn, Washed, Stained or Odorous', desc: 'Fabric shows sweat, perfume, wash soap marks.' },
                { id: 'fake_product', label: 'Different / Fake / Duplicate Item Handed Over', desc: 'Wrong product handed over by customer.' },
                { id: 'damaged_by_customer', label: 'Physical Damage / Tear by Customer', desc: 'Torn or burnt at customer premises.' },
                { id: 'customer_refused', label: 'Customer Refused Handover', desc: 'Customer declined to hand over or cancelled pickup.' },
              ].map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    rejectReason === reason.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason.id}
                    onChange={() => setRejectReason(reason.id)}
                    className="mt-0.5 accent-rose-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 block leading-tight">{reason.label}</span>
                    <span className="text-[10px] text-slate-500">{reason.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Driver Notes Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Driver Inspection Remarks *
              </label>
              <textarea
                rows={2}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Describe exact discrepancy observed at customer doorstep..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white resize-none"
              />
            </div>

            {/* Rejection Photo Evidence Capture */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Discrepancy Photo Proof:
                </span>
                <span className="text-[10px] text-slate-400">Required for Audit</span>
              </div>

              <input
                type="file"
                ref={rejectPhotoInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleRejectPhotoUpload}
                className="hidden"
              />

              {rejectPhoto ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={rejectPhoto.url}
                      alt="Rejection Proof"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{rejectPhoto.name}</p>
                      <p className="text-[10px] text-emerald-600 font-bold">Evidence Ready</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => rejectPhotoInputRef.current?.click()}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 bg-rose-50 rounded-lg cursor-pointer shrink-0"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => rejectPhotoInputRef.current?.click()}
                  className="w-full py-2.5 border-2 border-dashed border-rose-300 bg-white hover:bg-rose-50/50 rounded-xl text-xs font-bold text-rose-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📷 Snap Discrepancy Photo</span>
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between text-white pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">🔍</span>
                <h4 className="text-xs sm:text-sm font-bold truncate">{previewModalImg.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Completed Success Modal */}
      {isPickupCompleted && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
              ✓
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-[#b90041] px-2.5 py-0.5 rounded-full">
                Task #RET-TSK-8821
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Return Picked Up! 🎉</h3>
              <p className="text-xs text-slate-500 mt-1">
                Item sealed in bag <strong>{bagBarcode}</strong>. Customer refund initiated automatically.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1">
              <p className="text-slate-500 font-bold">Rider Payout Credited</p>
              <p className="text-2xl font-black text-emerald-700">+₹65.00</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Credited to your driver wallet balance</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigate && onNavigate('driver_dashboard')}
                className="w-full py-3.5 bg-[#b90041] hover:bg-[#990035] text-white font-black text-xs rounded-2xl shadow-lg shadow-pink-500/25 cursor-pointer uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => onNavigate && onNavigate('available_tasks')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
              >
                Next Task (Available Tasks)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Barcode Scanner Viewfinder Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Controls Bar */}
          <div className="w-full max-w-md flex items-center justify-between text-white pb-2 z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                Return Bag Scanner
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTorchOn(!isTorchOn);
                  triggerToast(isTorchOn ? 'Torch turned OFF' : 'Torch turned ON 🔦');
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                  isTorchOn
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/50 scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Toggle Torch"
              >
                🔦
              </button>

              <button
                type="button"
                onClick={handleCloseScanner}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                title="Close Scanner"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Center Viewfinder Viewport */}
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-square my-auto rounded-3xl overflow-hidden border-2 border-white/30 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-center bg-slate-950">
            {/* Live Camera Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Simulated camera overlay background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-slate-950/80 flex flex-col items-center justify-center p-6 text-center space-y-3 pointer-events-none">
              <div className="w-52 h-26 border-2 border-dashed border-white/25 rounded-2xl flex flex-col items-center justify-center bg-white/5 backdrop-blur-xs p-3 shadow-inner">
                {/* Visual Barcode Bars */}
                <div className="w-full flex justify-between items-end h-10 px-2 opacity-90">
                  <span className="w-1.5 h-full bg-white"></span>
                  <span className="w-0.5 h-full bg-white"></span>
                  <span className="w-1 h-full bg-white"></span>
                  <span className="w-2.5 h-full bg-white"></span>
                  <span className="w-0.5 h-full bg-white"></span>
                  <span className="w-1.5 h-full bg-white"></span>
                  <span className="w-2 h-full bg-white"></span>
                  <span className="w-1 h-full bg-white"></span>
                  <span className="w-0.5 h-full bg-white"></span>
                  <span className="w-2 h-full bg-white"></span>
                  <span className="w-1 h-full bg-white"></span>
                  <span className="w-0.5 h-full bg-white"></span>
                </div>
                <span className="text-[11px] font-mono tracking-widest text-white/90 mt-1.5 font-black">
                  MEE-RET-BAG-99412
                </span>
              </div>
              <p className="text-[11px] text-pink-200/90 font-semibold">
                Align barcode inside target bracket
              </p>
            </div>

            {/* Target 4-Corner Brackets */}
            <div className="absolute top-4 left-4 w-9 h-9 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl pointer-events-none"></div>
            <div className="absolute top-4 right-4 w-9 h-9 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 w-9 h-9 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl pointer-events-none"></div>
            <div className="absolute bottom-4 right-4 w-9 h-9 border-b-4 border-r-4 border-emerald-400 rounded-br-xl pointer-events-none"></div>

            {/* Scoped CSS Keyframes for Full Top-to-Bottom Laser Sweep */}
            <style>{`
              @keyframes laserVerticalSweep {
                0% {
                  top: 5%;
                  opacity: 0.85;
                }
                50% {
                  top: 92%;
                  opacity: 1;
                }
                100% {
                  top: 5%;
                  opacity: 0.85;
                }
              }
              .animate-laser-full-sweep {
                animation: laserVerticalSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
            `}</style>

            {/* Animated Laser Beam Sweeping Across Viewport */}
            <div
              className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent pointer-events-none animate-laser-full-sweep z-10"
              style={{
                boxShadow: '0 0 16px 3px rgba(239, 68, 68, 0.95), 0 0 30px 6px rgba(239, 68, 68, 0.45)',
              }}
            >
              {/* Vertical Glowing Light Curtain / Scanner Beam Trail */}
              <div className="absolute -top-6 inset-x-2 h-6 bg-gradient-to-t from-red-500/25 to-transparent pointer-events-none"></div>
              <div className="absolute top-1 inset-x-2 h-6 bg-gradient-to-b from-red-500/25 to-transparent pointer-events-none"></div>
            </div>

            {/* Torch Light Flash Effect */}
            {isTorchOn && (
              <div className="absolute inset-0 bg-amber-200/20 pointer-events-none mix-blend-screen"></div>
            )}
          </div>

          {/* Scanner Bottom Action Controls */}
          <div className="w-full max-w-md space-y-3 z-20 pb-2">
            <button
              type="button"
              onClick={() => handleConfirmScan('MEE-RET-BAG-99412')}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            >
              <span>📷 Capture / Scan Barcode</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Auto-Detect</span>
            </button>

            {/* Manual Entry Fallback Toggle */}
            <div className="text-center">
              {!isManualInputOpen ? (
                <button
                  type="button"
                  onClick={() => setIsManualInputOpen(true)}
                  className="text-xs text-white/70 hover:text-white underline cursor-pointer font-semibold"
                >
                  Barcode scratched? Enter manually ➔
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl space-y-2 border border-white/20 animate-in fade-in text-left">
                  <label className="text-[11px] font-bold text-white/90 block">
                    Type Bag Barcode Number:
                  </label>
                  <input
                    type="text"
                    value={manualBarcodeInput}
                    onChange={(e) => setManualBarcodeInput(e.target.value)}
                    placeholder="e.g. MEE-RET-BAG-99412"
                    className="w-full bg-black/60 border border-white/30 text-white rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsManualInputOpen(false)}
                      className="w-1/3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!manualBarcodeInput.trim()) {
                          triggerToast('Please type a valid barcode');
                          return;
                        }
                        handleConfirmScan(manualBarcodeInput.trim().toUpperCase());
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                    >
                      Verify &amp; Seal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <AppBottomNav activeNav="orders" onNavigate={onNavigate} />
    </div>
  );
}
