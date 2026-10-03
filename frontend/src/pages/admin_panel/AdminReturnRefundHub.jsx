import React, { useState, useEffect } from 'react';

// Initial Customer Refunds Data (Connected to Panel 1 Customer Return RET-8921 & Panel 2 Driver Reverse Pickup RET-8821)
const INITIAL_REFUNDS = [
  {
    id: 'REF-9921',
    returnId: 'RET-8921',
    orderId: 'ORD-88210',
    customerName: 'Priya Sharma',
    phone: '+91 98765 43210',
    city: 'Jaipur, RJ',
    productName: 'Banarasi Silk Embroidered Kurti - Pink (M)',
    productSku: 'BSK-PNK-M',
    amount: 1299,
    formattedAmount: '₹1,299',
    refundMethod: 'UPI (Instant IMPS)',
    upiId: 'priya.sharma@oksbi',
    returnReason: 'Size too small / Fitting issue',
    driverId: 'RID-4402 (Ramesh K.)',
    driverQc: 'Passed (Tags Intact)',
    warehouseStatus: 'Received at Surat Hub',
    status: 'Pending Approval', // 'Pending Approval' | 'Settled'
    utr: null,
    initiatedDate: '24 Oct 2024, 02:45 PM',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'REF-9920',
    returnId: 'RET-8890',
    orderId: 'ORD-88002',
    customerName: 'Ritu Verma',
    phone: '+91 98334 11223',
    city: 'Lucknow, UP',
    productName: 'Designer Cotton Tee - Navy (L)',
    productSku: 'TEE-NVY-L',
    amount: 699,
    formattedAmount: '₹699',
    refundMethod: 'Bank Account (NEFT)',
    upiId: 'HDFC Bank • A/C: ****4821',
    returnReason: 'Fabric quality not as described',
    driverId: 'RID-3910 (Anil S.)',
    driverQc: 'Passed (Original Packaging)',
    warehouseStatus: 'Received at Delhi Hub',
    status: 'Pending Approval',
    utr: null,
    initiatedDate: '24 Oct 2024, 11:20 AM',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'REF-9919',
    returnId: 'RET-8812',
    orderId: 'ORD-87941',
    customerName: 'Ananya Rao',
    phone: '+91 97112 88776',
    city: 'Bengaluru, KA',
    productName: 'Georgette Printed Saree - Royal Blue',
    productSku: 'SAR-GEO-BLU',
    amount: 849,
    formattedAmount: '₹849',
    refundMethod: 'Google Pay UPI',
    upiId: 'ananya.rao@okaxis',
    returnReason: 'Color variation from image',
    driverId: 'RID-2841 (Sunil P.)',
    driverQc: 'Passed (Unworn)',
    warehouseStatus: 'In-Transit to Surat Hub',
    status: 'Pending Approval',
    utr: null,
    initiatedDate: '23 Oct 2024, 05:15 PM',
    imageUrl:
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'REF-9880',
    returnId: 'RET-8701',
    orderId: 'ORD-87720',
    customerName: 'Neha Gupta',
    phone: '+91 99221 44556',
    city: 'South Delhi, DL',
    productName: 'Floral Chiffon Maxi Dress',
    productSku: 'DRS-CHI-MAX',
    amount: 1499,
    formattedAmount: '₹1,499',
    refundMethod: 'PhonePe UPI',
    upiId: 'neha.gupta@ybl',
    returnReason: 'Defective zipper',
    driverId: 'RID-1120 (Mohan L.)',
    driverQc: 'Passed',
    warehouseStatus: 'Restocked at Gurgaon Hub',
    status: 'Settled',
    utr: 'UTR-MEE99281742',
    initiatedDate: '21 Oct 2024',
    imageUrl:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
  },
];

// Initial Supplier SPF Claims with REAL high-res visual evidence files (Connected to Panel 3 SupplierReturnsRTO)
const INITIAL_SPF_CLAIMS = [
  {
    id: 'SPF-CLM-9012',
    supplierId: 'SUP-44210',
    supplierName: 'Modern Ethnic Wears',
    supplierCity: 'Surat, Gujarat',
    orderId: 'ORD-88210',
    productName: 'Banarasi Silk Embroidered Kurti',
    productSku: 'BSK-PNK-M',
    orderPrice: 1299,
    claimedAmount: 849,
    formattedClaimed: '₹849',
    claimCategory: 'Wrong/Swapped Product Returned',
    originalProductImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    evidenceSummary: 'Buyer returned an old local faded cotton top instead of original Banarasi silk kurti. Barcode tag was deliberately cut.',
    evidenceFiles: [
      {
        name: 'unboxing_cctv_inward.mp4',
        type: 'video',
        size: '14.2 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        caption: 'Warehouse CCTV Inward Bay #3 - Technician unboxing courier bag DEL-9928174621',
        videoDuration: '01:24',
      },
      {
        name: 'wrong_swapped_item.jpg',
        type: 'image',
        size: '2.1 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        caption: 'Actual item found inside: Faded, worn-out grey top without any manufacturer branding',
      },
      {
        name: 'tampered_barcode_tag.jpg',
        type: 'image',
        size: '1.8 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop&q=80',
        caption: 'Close-up: Original pink brand tag was sliced off with scissors',
      },
    ],
    courierPartner: 'Delhivery Surface (AWB: DEL-9928174621)',
    filingDate: '25 Oct 2024, 03:15 PM',
    status: 'Under Adjudication', // 'Under Adjudication' | 'Approved' | 'Rejected'
    approvedAmount: null,
    adjudicationNotes: '',
  },
  {
    id: 'SPF-CLM-9011',
    supplierId: 'SUP-39811',
    supplierName: 'Apex Footwear Hub',
    supplierCity: 'Agra, Uttar Pradesh',
    orderId: 'ORD-87910',
    productName: 'Men Pro-Athletic Running Shoes',
    productSku: 'SHOE-PRO-42',
    orderPrice: 1599,
    claimedAmount: 1200,
    formattedClaimed: '₹1,200',
    claimCategory: 'Empty Box / Missing Item',
    originalProductImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80',
    evidenceSummary: 'Outer courier tamper tape was broken and resealed with transparent cello tape. Shoe box contained waste newspapers only.',
    evidenceFiles: [
      {
        name: 'weighing_scale_empty_box.jpg',
        type: 'image',
        size: '3.4 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
        caption: 'Weight scale showing 180g (Expected shoe box weight: 920g). Box filled with paper.',
      },
      {
        name: 'courier_tamper_tape_cut.jpg',
        type: 'image',
        size: '2.9 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        caption: 'Security tape slit from bottom corner and taped back with clear domestic tape',
      },
      {
        name: 'unboxing_opening_proof.mp4',
        type: 'video',
        size: '22.0 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
        caption: 'Warehouse inspection video recording showing empty inner carton',
        videoDuration: '02:05',
      },
    ],
    courierPartner: 'Shadowfax Express (AWB: SFX-88291048)',
    filingDate: '24 Oct 2024, 06:40 PM',
    status: 'Under Adjudication',
    approvedAmount: null,
    adjudicationNotes: '',
  },
  {
    id: 'SPF-CLM-9010',
    supplierId: 'SUP-11029',
    supplierName: 'Chrono Luxury Watches',
    supplierCity: 'Mumbai, Maharashtra',
    orderId: 'ORD-87600',
    productName: 'Minimalist Gold Chrono Watch',
    productSku: 'GLD-WTC-01',
    orderPrice: 2499,
    claimedAmount: 2499,
    formattedClaimed: '₹2,499',
    claimCategory: 'Courier In-Transit Damage',
    originalProductImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
    evidenceSummary: 'Watch mineral glass crushed into pieces inside bubble wrap during reverse transit.',
    evidenceFiles: [
      {
        name: 'cracked_dial_proof.jpg',
        type: 'image',
        size: '2.5 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        caption: 'Dial shattered into fine glass shards, hands broken',
      },
      {
        name: 'outer_box_crushed.jpg',
        type: 'image',
        size: '1.9 MB',
        mediaUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
        caption: 'Heavy compression marks on metal tin box due to vehicle stacking',
      },
    ],
    courierPartner: 'Delhivery Surface (AWB: DEL-7729104)',
    filingDate: '22 Oct 2024',
    status: 'Approved',
    approvedAmount: 2499,
    adjudicationNotes: 'Verified with courier damage incident report #DAM-4481. 100% reimbursement released to supplier wallet.',
  },
];

// Initial Risk & Fraud Engine Records
const INITIAL_FRAUD_ALERTS = [
  {
    id: 'FRD-101',
    entityType: 'Buyer',
    name: 'Kavita Sundaram',
    location: 'Ahmedabad, Gujarat',
    phone: '+91 97234 11099',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    reason: 'Habitual Wardrobing: 14 Orders placed, 12 returned (85.7% Return Rate). 3 returns reported as used with perfume scent.',
    recommendedAction: 'Disable COD Payment Option & Mandatory Unboxing OTP',
    actionApplied: false,
  },
  {
    id: 'FRD-102',
    entityType: 'Buyer',
    name: 'Rahul Meena',
    location: 'Jaipur, Rajasthan',
    phone: '+91 98290 55432',
    riskScore: 84,
    riskLevel: 'HIGH',
    reason: 'Doorstep Courier RTO Abuse: 5 consecutive high-value COD orders rejected at doorstep stating "changed mind".',
    recommendedAction: 'Restrict COD Purchases for 90 Days',
    actionApplied: true,
  },
  {
    id: 'FRD-103',
    entityType: 'Supplier',
    name: 'Vogue Silk Sarees Store',
    location: 'Surat, Gujarat',
    phone: '+91 94281 99012',
    riskScore: 78,
    riskLevel: 'HIGH',
    reason: 'Fabric Quality Misrepresentation: 28% customer returns reporting torn borders and cheap synthetic fabric instead of pure silk.',
    recommendedAction: 'Issue Quality Penalty Warning & Freeze 10% Payout Reserve',
    actionApplied: false,
  },
  {
    id: 'FRD-104',
    entityType: 'Buyer',
    name: 'Sameer Sheikh',
    location: 'Kolkata, West Bengal',
    phone: '+91 98301 22987',
    riskScore: 71,
    riskLevel: 'MEDIUM',
    reason: 'Reverse Pickup Denial: 3 return pickups cancelled after driver arrived at doorstep.',
    recommendedAction: 'Require Pre-scheduled Pickup Slots',
    actionApplied: false,
  },
];

// Initial Courier RTO Analytics
const COURIER_PERFORMANCE = [
  {
    name: 'Delhivery Surface',
    totalReverseTasks: 480,
    deliveredToWarehouse: 442,
    rtoFailureCount: 38,
    successRate: 92.1,
    avgTransitDays: '3.2 Days',
    deadFreightLoss: 18240,
    formattedLoss: '₹18,240',
    rating: 4.6,
  },
  {
    name: 'Shadowfax Express',
    totalReverseTasks: 340,
    deliveredToWarehouse: 296,
    rtoFailureCount: 44,
    successRate: 87.0,
    avgTransitDays: '4.1 Days',
    deadFreightLoss: 21120,
    formattedLoss: '₹21,120',
    rating: 3.9,
  },
  {
    name: 'Xpressbees Logistics',
    totalReverseTasks: 290,
    deliveredToWarehouse: 259,
    rtoFailureCount: 31,
    successRate: 89.3,
    avgTransitDays: '3.8 Days',
    deadFreightLoss: 14880,
    formattedLoss: '₹14,880',
    rating: 4.2,
  },
  {
    name: 'Ecom Express',
    totalReverseTasks: 240,
    deliveredToWarehouse: 214,
    rtoFailureCount: 26,
    successRate: 89.1,
    avgTransitDays: '3.5 Days',
    deadFreightLoss: 12480,
    formattedLoss: '₹12,480',
    rating: 4.1,
  },
];

export default function AdminReturnRefundHub({ onNavigate = () => {}, onBack }) {
  const [activeTab, setActiveTab] = useState('refunds'); // 'refunds' | 'spf' | 'fraud' | 'courier'
  const [searchQuery, setSearchQuery] = useState('');
  const [refunds, setRefunds] = useState(INITIAL_REFUNDS);
  const [spfClaims, setSpfClaims] = useState(INITIAL_SPF_CLAIMS);
  const [fraudAlerts, setFraudAlerts] = useState(INITIAL_FRAUD_ALERTS);
  const [toastMessage, setToastMessage] = useState(null);

  // Selected SPF Claim for modal inspection
  const [inspectClaim, setInspectClaim] = useState(null);
  const [selectedEvidenceIdx, setSelectedEvidenceIdx] = useState(0);
  const [adjudicationNote, setAdjudicationNote] = useState('');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(25);
  const [isZoomed, setIsZoomed] = useState(false);

  // Processing indicator
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulated Video Player Timer
  useEffect(() => {
    let interval;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 98 ? 10 : prev + 3));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  // Action 1: Process Single Customer Refund
  const handleApproveRefund = (refId) => {
    setIsProcessing(true);
    const generatedUtr = `UTR-MEE${Math.floor(10000000 + Math.random() * 90000000)}`;

    setTimeout(() => {
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === refId
            ? { ...r, status: 'Settled', utr: generatedUtr }
            : r
        )
      );
      setIsProcessing(false);
      showToast(`✅ Refund Settled! ${generatedUtr} dispatched to Customer UPI/Bank.`);
    }, 600);
  };

  // Action 2: Batch Process All Pending Refunds
  const handleBatchApproveRefunds = () => {
    const pendingCount = refunds.filter((r) => r.status === 'Pending Approval').length;
    if (pendingCount === 0) {
      showToast('No pending refunds to process.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setRefunds((prev) =>
        prev.map((r) =>
          r.status === 'Pending Approval'
            ? {
                ...r,
                status: 'Settled',
                utr: `UTR-MEE${Math.floor(10000000 + Math.random() * 90000000)}`,
              }
            : r
        )
      );
      setIsProcessing(false);
      showToast(`🎉 Bulk Settlement Complete! ${pendingCount} Refunds Dispatched.`);
    }, 800);
  };

  // Action 3: Adjudicate SPF Claim (Approve or Reject)
  const handleAdjudicateSpf = (status, payoutAmount) => {
    if (!inspectClaim) return;

    setSpfClaims((prev) =>
      prev.map((c) =>
        c.id === inspectClaim.id
          ? {
              ...c,
              status,
              approvedAmount: status === 'Approved' ? payoutAmount : 0,
              adjudicationNotes:
                adjudicationNote ||
                (status === 'Approved'
                  ? 'Evidence inspected: 100% claim approved by Senior Auditor.'
                  : 'Claim rejected due to insufficient proof.'),
            }
          : c
      )
    );

    if (status === 'Approved') {
      showToast(`🛡️ Claim ${inspectClaim.id} Approved! ₹${payoutAmount} credited to ${inspectClaim.supplierName}.`);
    } else {
      showToast(`❌ Claim ${inspectClaim.id} Rejected. Supplier notified.`);
    }

    setInspectClaim(null);
    setAdjudicationNote('');
  };

  // Action 4: Toggle Fraud Mitigation on Risk Entity
  const handleToggleFraudAction = (id) => {
    setFraudAlerts((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = !f.actionApplied;
          showToast(
            nextState
              ? `⚠️ Restriction Applied on ${f.name} (${f.recommendedAction})`
              : `Restored standard account privileges for ${f.name}`
          );
          return { ...f, actionApplied: nextState };
        }
        return f;
      })
    );
  };

  // Action 5: Export CSV Audit Report
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Type', 'Entity Name', 'Reference ID', 'Amount (INR)', 'Status', 'Date'];
    const rows = [
      ...refunds.map((r) => [r.id, 'Customer Refund', r.customerName, r.orderId, r.amount, r.status, r.initiatedDate]),
      ...spfClaims.map((s) => [s.id, 'Supplier SPF Claim', s.supplierName, s.orderId, s.claimedAmount, s.status, s.filingDate]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MShoppy_Admin_Returns_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Downloaded Returns & Refunds Audit CSV successfully!');
  };

  // Filtered Refunds
  const filteredRefunds = refunds.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.returnId.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q)
    );
  });

  // Filtered SPF Claims
  const filteredSpf = spfClaims.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.supplierName.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.claimCategory.toLowerCase().includes(q)
    );
  });

  const pendingRefundsTotal = refunds
    .filter((r) => r.status === 'Pending Approval')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeSpfClaimsTotal = spfClaims
    .filter((s) => s.status === 'Under Adjudication')
    .reduce((acc, curr) => acc + curr.claimedAmount, 0);

  const currentEvidence = inspectClaim ? inspectClaim.evidenceFiles[selectedEvidenceIdx] : null;

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-['Inter',sans-serif] antialiased pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 max-w-[90vw] animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
          <span className="text-xs sm:text-sm font-bold truncate">{toastMessage}</span>
        </div>
      )}

      {/* ================= Top Navigation Bar (Mobile Responsive) ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('/admin-panel'))}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="Go to Admin Panel"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-[#b90041] flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                <span className="material-symbols-outlined text-base sm:text-lg">assignment_return</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-extrabold text-xs sm:text-base text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] truncate">
                    Return &amp; Refund Settlement Hub
                  </h1>
                  <span className="bg-rose-100 text-rose-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    Panel 4
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate hidden xs:block">
                  Refunds • SPF Claims • Fraud Risk • Courier RTO
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Settlement Online</span>
            </div>

            <button
              onClick={() => onNavigate('/admin-rot-rules')}
              className="bg-[#b90041] hover:bg-[#a00038] text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              title="Configure ROT Business Rules"
            >
              <span className="material-symbols-outlined text-sm">rule_settings</span>
              <span className="hidden md:inline">ROT Rules</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Export CSV Audit"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              onClick={() => onNavigate('/admin-panel')}
              className="bg-slate-900 hover:bg-black text-white px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <span className="hidden sm:inline">Admin</span>
              <span className="material-symbols-outlined text-sm">dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* ================= Top Financial Ribbon (Fluid 2x2 on Mobile, 4-Cols on Desktop) ================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1 */}
          <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                Pending Refunds
              </p>
              <span className="text-base sm:text-xl">💳</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              ₹{pendingRefundsTotal.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amber-600 font-bold mt-0.5 truncate">
              {refunds.filter((r) => r.status === 'Pending Approval').length} Orders awaiting IMPS
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                SPF Claims In-Review
              </p>
              <span className="text-base sm:text-xl">🛡️</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              ₹{activeSpfClaimsTotal.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-rose-600 font-bold mt-0.5 truncate">
              {spfClaims.filter((s) => s.status === 'Under Adjudication').length} Claims need review
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                Platform Return Rate
              </p>
              <span className="text-base sm:text-xl">📊</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              14.2%
            </h3>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 truncate">
              ↓ -1.8% vs last month
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                Fraud Prevented
              </p>
              <span className="text-base sm:text-xl">⚡</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              ₹1,12,000
            </h3>
            <p className="text-[10px] sm:text-[11px] text-blue-600 font-bold mt-0.5 truncate">
              AI Wardrobing Lock
            </p>
          </div>
        </section>

        {/* ================= Navigation Tabs & Search Toolbar (Touch Friendly) ================= */}
        <section className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Tab buttons horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: 'refunds', label: 'Refunds', fullLabel: 'Customer Refunds', icon: 'payments', count: refunds.filter((r) => r.status === 'Pending Approval').length },
              { id: 'spf', label: 'SPF Claims', fullLabel: 'Supplier SPF Claims', icon: 'verified_user', count: spfClaims.filter((s) => s.status === 'Under Adjudication').length },
              { id: 'fraud', label: 'Fraud Engine', fullLabel: 'Risk & Fraud Engine', icon: 'security', count: fraudAlerts.filter((f) => !f.actionApplied).length },
              { id: 'courier', label: 'Courier RTO', fullLabel: 'Courier RTO Loss', icon: 'local_shipping', count: null },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Customer, SKU..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* ================= TAB 1: Customer Refund Settlements ================= */}
        {activeTab === 'refunds' && (
          <section className="space-y-3 sm:space-y-4">
            {/* Batch Action Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    Instant UPI &amp; IMPS Refund Settlement Gateway
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 sm:line-clamp-none">
                    Driver reverse pickup QC passed and item verified. Single-click to disburse funds.
                  </p>
                </div>
              </div>

              <button
                onClick={handleBatchApproveRefunds}
                disabled={isProcessing || refunds.filter((r) => r.status === 'Pending Approval').length === 0}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap text-center"
              >
                {isProcessing ? 'Disbursing...' : 'Disburse All Pending Refunds ➔'}
              </button>
            </div>

            {/* Refunds Card Queue */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-slate-500">
                  Customer Return Settlement Queue ({filteredRefunds.length})
                </h4>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Auto-sync with RazorpayX / IMPS
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredRefunds.map((ref) => {
                  const isSettled = ref.status === 'Settled';
                  return (
                    <div
                      key={ref.id}
                      className="p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Left Product & Buyer Details */}
                      <div className="flex items-start gap-3 w-full md:w-auto">
                        <img
                          src={ref.imageUrl}
                          alt={ref.productName}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900">
                              {ref.id}
                            </span>
                            <span className="bg-slate-100 text-slate-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                              Ord: {ref.orderId}
                            </span>
                            <span className="bg-rose-50 text-rose-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-md">
                              {ref.returnId}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {ref.productName}
                          </h5>

                          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-medium flex-wrap">
                            <span>
                              By: <strong className="text-slate-700">{ref.customerName}</strong> ({ref.city})
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">{ref.driverQc}</span>
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-slate-400">
                            Reason: <span className="text-slate-600">{ref.returnReason}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Payment & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="text-base sm:text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                            {ref.formattedAmount}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold truncate max-w-[140px] sm:max-w-none">
                            {ref.refundMethod}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] sm:max-w-none">
                            {ref.upiId}
                          </div>
                          {isSettled && (
                            <div className="text-[9px] font-black text-emerald-600 font-mono mt-0.5">
                              {ref.utr}
                            </div>
                          )}
                        </div>

                        <div>
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-xl border border-emerald-200">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Dispatched</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveRefund(ref.id)}
                              disabled={isProcessing}
                              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                            >
                              <span>Approve &amp; Pay</span>
                              <span className="material-symbols-outlined text-xs">send</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: Supplier SPF Dispute Adjudication (With Real Evidence Inspector) ================= */}
        {activeTab === 'spf' && (
          <section className="space-y-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Supplier Protection Fund (SPF) Claims Tribunal
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Inspect unboxing video recordings, parcel photos and audit wrong/swapped item disputes.
                </p>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                Avg Resolution: 4.2h
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredSpf.map((claim) => {
                const isUnderReview = claim.status === 'Under Adjudication';
                const isApproved = claim.status === 'Approved';

                return (
                  <div
                    key={claim.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">
                            {claim.id}
                          </span>
                          <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {claim.supplierName}
                          </h5>
                          <p className="text-[10px] text-slate-400">{claim.supplierCity}</p>
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isUnderReview
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      {/* Claim details */}
                      <div className="space-y-2 mb-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={claim.originalProductImage}
                            alt={claim.productName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Disputed Item:</p>
                            <p className="text-xs font-bold text-slate-800 truncate">{claim.productName}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl text-xs font-bold">
                          <span className="text-slate-500">Claim Amount:</span>
                          <span className="text-rose-600 font-black text-sm">{claim.formattedClaimed}</span>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Issue Category:</p>
                          <p className="text-xs font-extrabold text-slate-700">{claim.claimCategory}</p>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100 italic">
                          "{claim.evidenceSummary}"
                        </p>

                        {/* Evidence Thumbnails Preview */}
                        <div className="pt-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                            Attached Proofs ({claim.evidenceFiles.length}):
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {claim.evidenceFiles.map((file, idx) => (
                              <div
                                key={idx}
                                className="relative rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 aspect-video flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                  setInspectClaim(claim);
                                  setSelectedEvidenceIdx(idx);
                                }}
                              >
                                <img
                                  src={file.mediaUrl}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                                  {file.type === 'video' ? '▶' : '🔍'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-2.5 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setInspectClaim(claim);
                          setSelectedEvidenceIdx(0);
                          setAdjudicationNote('');
                          setComparisonMode(false);
                          setIsVideoPlaying(false);
                        }}
                        className={`w-full py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                          isUnderReview
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                            : 'bg-slate-900 hover:bg-black text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        <span>{isUnderReview ? 'Inspect Evidence & Decide' : 'View Adjudication Details'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= TAB 3: Risk & Fraud Engine ================= */}
        {activeTab === 'fraud' && (
          <section className="space-y-3 sm:space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 sm:p-4 rounded-2xl flex items-start gap-3 shadow-xs">
              <span className="material-symbols-outlined text-xl sm:text-2xl text-amber-600 shrink-0">
                shield_with_heart
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">
                  Automated Anti-Abuse &amp; Wardrobing Shield Active
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                  Identifies repeat return abusers, fraudulent unboxings, and low-quality suppliers. You can enforce restrictive safeguards with single-click enforcement.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full ${
                            alert.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : alert.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alert.riskLevel} RISK ({alert.riskScore}/100)
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {alert.entityType}: {alert.name}
                        </span>
                        <span className="text-xs text-slate-400">({alert.location})</span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">{alert.reason}</p>

                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 flex-wrap">
                        <span>Action:</span>
                        <span className="text-rose-600 font-bold">{alert.recommendedAction}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleToggleFraudAction(alert.id)}
                        className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap text-center ${
                          alert.actionApplied
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-500/20'
                        }`}
                      >
                        {alert.actionApplied ? '✓ Restriction Active' : 'Enforce Restriction ➔'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 4: Courier RTO Logistics Loss ================= */}
        {activeTab === 'courier' && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {COURIER_PERFORMANCE.map((c, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h5 className="font-black text-xs sm:text-sm text-slate-900">{c.name}</h5>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        ★ {c.rating}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Reverse Pickups:</span>
                        <strong className="text-slate-800">{c.totalReverseTasks}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivered to Hub:</span>
                        <strong className="text-slate-800">{c.deliveredToWarehouse}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>RTO Failure Rate:</span>
                        <strong className="text-rose-600 font-black">
                          {((c.rtoFailureCount / c.totalReverseTasks) * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Avg Transit Time:</span>
                        <strong className="text-slate-800">{c.avgTransitDays}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase">
                      Dead Freight:
                    </span>
                    <span className="text-sm font-black text-rose-600">
                      {c.formattedLoss}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Courier SLA & Policy Advisory */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Logistics Carrier Penalty &amp; Loss Recovery Clause
                </h5>
                <p className="text-xs text-slate-500">
                  Reverse shipments exceeding 5 days TAT or transit damaged are auto-debited from monthly logistics invoices.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 text-center"
              >
                Download SLA Report
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ================= REAL SPF EVIDENCE INSPECTOR & ADJUDICATION MODAL (FULLY RESPONSIVE) ================= */}
      {inspectClaim && currentEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setInspectClaim(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold shrink-0">
                  🛡️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] truncate">
                      SPF Evidence Inspector #{inspectClaim.id}
                    </h3>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                      {inspectClaim.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Supplier: {inspectClaim.supplierName} ({inspectClaim.supplierCity}) • Order: #{inspectClaim.orderId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectClaim(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-3 sm:py-4 space-y-4 pr-1">
              {/* Claim Overview Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Claim Amount:</span>
                  <div className="text-sm sm:text-base font-black text-rose-600">{inspectClaim.formattedClaimed}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Original MRP:</span>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">₹{inspectClaim.orderPrice}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Issue Category:</span>
                  <div className="text-xs font-bold text-slate-800 truncate">{inspectClaim.claimCategory}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Courier Partner:</span>
                  <div className="text-[11px] font-bold text-slate-700 truncate">{inspectClaim.courierPartner}</div>
                </div>
              </div>

              {/* Toggle Controls: Side-by-Side Comparison vs Single Evidence */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Interactive Evidence Viewer:
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    File {selectedEvidenceIdx + 1} of {inspectClaim.evidenceFiles.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComparisonMode(!comparisonMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      comparisonMode
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">compare</span>
                    <span>{comparisonMode ? 'Single View' : 'Compare with Original'}</span>
                  </button>
                </div>
              </div>

              {/* ================= ACTIVE MEDIA INSPECTOR STAGE ================= */}
              {comparisonMode ? (
                /* Side-by-Side Comparison View (Original Product vs Received Return) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900 rounded-2xl text-white">
                  {/* Left: Original Ordered Item */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>ORIGINAL ORDERED ITEM:</span>
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded-md">Catalog Spec</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video sm:aspect-square flex items-center justify-center">
                      <img
                        src={inspectClaim.originalProductImage}
                        alt="Original Product"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {inspectClaim.productName}
                      </span>
                    </div>
                  </div>

                  {/* Right: Returned Damaged / Swapped Item */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
                      <span>RECEIVED AT SELLER WAREHOUSE:</span>
                      <span className="bg-rose-500/20 text-rose-400 px-2 py-0.2 rounded-md">Mismatched Proof</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border-2 border-rose-500/80 bg-black aspect-video sm:aspect-square flex items-center justify-center">
                      <img
                        src={currentEvidence.mediaUrl}
                        alt="Returned Mismatched Item"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        TAMPERED
                      </span>
                      <span className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-rose-300 text-[10px] font-bold px-2 py-1 rounded truncate">
                        {currentEvidence.caption}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Primary Evidence Inspector (Image Zoom or Video Player) */
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col">
                  {currentEvidence.type === 'video' ? (
                    /* Video Player Simulation */
                    <div className="relative aspect-video max-h-[360px] bg-black flex flex-col justify-between p-3 sm:p-4 text-white">
                      {/* CCTV Camera HUD Header */}
                      <div className="flex items-center justify-between text-[11px] font-mono z-10">
                        <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                          <span className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-rose-500 animate-ping' : 'bg-rose-500'}`}></span>
                          <span>{isVideoPlaying ? 'REC ● PLAYING' : 'PAUSED'}</span>
                          <span className="text-slate-400">| 1080p 60FPS</span>
                        </div>
                        <div className="bg-black/60 px-2.5 py-1 rounded-md text-slate-300 backdrop-blur-xs">
                          SURAT WAREHOUSE BAY #03
                        </div>
                      </div>

                      {/* Video Frame Image Background */}
                      <img
                        src={currentEvidence.mediaUrl}
                        alt="Unboxing Video Frame"
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                      />

                      {/* Video Center Play/Pause Trigger */}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                          type="button"
                          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-3xl">
                            {isVideoPlaying ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                      </div>

                      {/* Bottom Player Controls */}
                      <div className="z-10 bg-gradient-to-t from-black via-black/70 to-transparent p-2 rounded-xl mt-auto space-y-1.5">
                        <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${videoProgress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                          <div className="flex items-center gap-2">
                            <span>00:{videoProgress < 10 ? `0${videoProgress}` : videoProgress} / {currentEvidence.videoDuration || '01:24'}</span>
                            <span className="text-slate-500">•</span>
                            <span className="truncate max-w-[200px]">{currentEvidence.caption}</span>
                          </div>
                          <span className="text-rose-400 font-bold">Unboxing Audit Verified</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Image Inspector with Zoom Capability */
                    <div className="relative aspect-video max-h-[360px] bg-black flex items-center justify-center overflow-hidden group">
                      <img
                        src={currentEvidence.mediaUrl}
                        alt="Evidence Proof"
                        className={`w-full h-full object-contain transition-transform duration-300 ${
                          isZoomed ? 'scale-150 cursor-grab' : 'scale-100'
                        }`}
                      />

                      {/* Zoom Controls Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={() => setIsZoomed(!isZoomed)}
                          className="px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[11px] font-bold rounded-lg backdrop-blur-md flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isZoomed ? 'zoom_out' : 'zoom_in'}
                          </span>
                          <span>{isZoomed ? 'Reset Zoom' : 'Zoom 2x'}</span>
                        </button>
                      </div>

                      {/* Bottom Caption Pill */}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2">
                        <span className="truncate">{currentEvidence.caption}</span>
                        <span className="text-[10px] font-mono text-rose-400 font-bold shrink-0">
                          {currentEvidence.size}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Evidence Thumbnails Switcher Strip */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Select Evidence to Inspect:
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
                  {inspectClaim.evidenceFiles.map((f, idx) => {
                    const isSelected = selectedEvidenceIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedEvidenceIdx(idx);
                          setIsZoomed(false);
                          setIsVideoPlaying(false);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-1 ring-rose-500'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                          <img src={f.mediaUrl} alt={f.name} className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-[10px] font-black">
                            {f.type === 'video' ? '▶' : '🖼️'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-rose-900' : 'text-slate-800'}`}>
                            {f.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{f.size}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Supplier Testimony Statement */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Supplier Testimony &amp; Claim Statement:
                </label>
                <div className="p-3 bg-rose-50/60 border border-rose-200/70 rounded-xl text-xs text-slate-800 leading-relaxed italic">
                  "{inspectClaim.evidenceSummary}"
                </div>
              </div>

              {/* Auditor Remarks Note Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Auditor Adjudication Judgment:
                </label>
                <textarea
                  rows={2}
                  value={adjudicationNote}
                  onChange={(e) => setAdjudicationNote(e.target.value)}
                  placeholder="e.g. Unboxing video inspected. Item clearly swapped with torn tag. 100% payout authorized."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Modal Bottom Decision Buttons (Stacked on Mobile, Row on Desktop) */}
            <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => handleAdjudicateSpf('Rejected', 0)}
                className="order-3 sm:order-1 px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                Reject Claim
              </button>

              <button
                onClick={() => handleAdjudicateSpf('Approved', Math.round(inspectClaim.claimedAmount * 0.5))}
                className="order-2 sm:order-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center"
              >
                Approve 50% (₹{Math.round(inspectClaim.claimedAmount * 0.5)})
              </button>

              <button
                onClick={() => handleAdjudicateSpf('Approved', inspectClaim.claimedAmount)}
                className="order-1 sm:order-3 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer text-center"
              >
                Approve 100% Payout ({inspectClaim.formattedClaimed})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
