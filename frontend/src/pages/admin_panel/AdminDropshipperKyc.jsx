import { useState, useMemo } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import { getDropshipperApp, saveDropshipperApp } from '../../services/dropshipperSessionStore';

// Comprehensive mock data for KYC verification requests
const INITIAL_KYC_REQUESTS = [
  {
    id: 'DSP-KYC-5089',
    applicantName: 'Sarah James (Aura Trends)',
    businessName: 'Aura Trends Luxe',
    storeUrl: 'https://auratrends.shop',
    storeType: 'SHOPIFY STORE',
    proprietor: 'Sarah James',
    role: 'Dropshipper',
    phone: '+91 98765 43210',
    email: 'sarah.james@auratrends.shop',
    location: 'Mumbai, Maharashtra',
    submittedAt: '22 Sep 2026, 11:45 AM',
    status: 'Pending',
    riskLevel: 'Low',
    matchScore: 98,
    panIdentifier: 'ABCDE1234F',
    aadhaarNumber: '4829 1920 3810',
    documents: {
      pan: {
        number: 'ABCDE1234F',
        nameOnDoc: 'SARAH JAMES',
        status: 'Verified',
        fileSize: '1.8 MB',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&auto=format&fit=crop&q=80',
        proofImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '4829 1920 3810',
        status: 'UIDAI OTP Verified',
        fileSize: '2.4 MB',
        image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=700&auto=format&fit=crop&q=80',
        proofImage: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=700&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '50100482910291',
        ifsc: 'HDFC0000128',
        bankName: 'HDFC Bank',
        holderName: 'SARAH JAMES',
        upiId: 'sarahjames@okaxis',
        pennyDropStatus: 'Success (₹1 Credited)',
        image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      gst: {
        number: '29ABCDE1234F1Z5',
        legalName: 'AURA TRENDS LUXE PRIVATE LIMITED',
        status: 'Active on GSTN',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      },
      selfie: {
        faceMatch: '98% Match with Aadhaar',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Direct-to-consumer Shopify fashion store. Verified PAN & Aadhaar proofs.',
    rejectionReason: null,
  },
  {
    id: 'KYC-8821',
    applicantName: 'Modern Ethnic Wears (Rajesh Singhania)',
    businessName: 'Singhania Textiles Pvt Ltd',
    role: 'Supplier',
    phone: '+91 98290 12345',
    email: 'rajesh@singhaniatextiles.com',
    location: 'Surat, Gujarat',
    submittedAt: '21 Sep 2026, 08:30 PM',
    status: 'Pending', // 'Pending' | 'Approved' | 'Re-upload' | 'Rejected'
    riskLevel: 'Low',
    matchScore: 98,
    documents: {
      pan: {
        number: 'ABCPS1234F',
        nameOnDoc: 'RAJESH SINGHANIA',
        status: 'Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      gst: {
        number: '24ABCPS1234F1Z5',
        legalName: 'SINGHANIA TEXTILES PRIVATE LIMITED',
        status: 'Active on GSTN',
        image:
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••4892',
        ifsc: 'HDFC0000128',
        bankName: 'HDFC Bank, Ring Road Surat',
        holderName: 'SINGHANIA TEXTILES PVT LTD',
        pennyDropStatus: 'Success (₹1 Credited)',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '•••• •••• 8821',
        status: 'UIDAI OTP Verified',
        image:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      selfie: {
        faceMatch: '96% Match with Aadhaar',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Established manufacturer in Surat. High product catalog readiness.',
    rejectionReason: null,
  },
  {
    id: 'KYC-8822',
    applicantName: 'Priya Sharma (Fashion Curator)',
    businessName: 'Priya Couture Reselling Boutique',
    role: 'Reseller',
    phone: '+91 97112 34567',
    email: 'priya.sharma@gmail.com',
    location: 'Jaipur, Rajasthan',
    submittedAt: '21 Sep 2026, 06:15 PM',
    status: 'Pending',
    riskLevel: 'Low',
    matchScore: 99,
    documents: {
      pan: {
        number: 'BKWPS9821K',
        nameOnDoc: 'PRIYA SHARMA',
        status: 'Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••1109',
        ifsc: 'SBIN0004032',
        bankName: 'State Bank of India, MI Road',
        holderName: 'PRIYA SHARMA',
        pennyDropStatus: 'Success (₹1 Credited)',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '•••• •••• 4410',
        status: 'UIDAI OTP Verified',
        image:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      selfie: {
        faceMatch: '99% Match with Aadhaar',
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Top tier Meesho Community reseller with 120k social reach.',
    rejectionReason: null,
  },
  {
    id: 'KYC-8823',
    applicantName: 'Ramesh Kumar (Velocity Logistics)',
    businessName: 'Kumar Express Courier Hub',
    role: 'Delivery Partner',
    phone: '+91 98980 43210',
    email: 'ramesh.delivery@express.in',
    location: 'Bengaluru, Karnataka',
    submittedAt: '21 Sep 2026, 04:45 PM',
    status: 'Pending',
    riskLevel: 'Medium',
    matchScore: 78,
    documents: {
      drivingLicense: {
        number: 'KA-01-2018-009823',
        validity: 'Valid till 15 Aug 2038',
        status: 'Sarathi DB Match',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      pan: {
        number: 'ALKPZ7781N',
        nameOnDoc: 'RAMESH KUMAR',
        status: 'Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '•••• •••• 9920',
        status: 'UIDAI OTP Verified',
        image:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      selfie: {
        faceMatch: '76% Match (Lighting Issue)',
        image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Commercial two-wheeler registration uploaded. High delivery demand area.',
    rejectionReason: null,
  },
  {
    id: 'KYC-8824',
    applicantName: 'Anil Handicrafts (Anil Gupta)',
    businessName: 'Gupta Enterprises',
    role: 'Supplier',
    phone: '+91 94140 88776',
    email: 'anil@guptacrafts.com',
    location: 'Jaipur, Rajasthan',
    submittedAt: '20 Sep 2026, 09:12 PM',
    status: 'Re-upload',
    riskLevel: 'Medium',
    matchScore: 82,
    documents: {
      pan: {
        number: 'AOFPG3321L',
        nameOnDoc: 'ANIL GUPTA',
        status: 'Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      gst: {
        number: '08AAFCA3321L1ZB',
        legalName: 'ANIL HANDICRAFTS PRIVATE LIMITED',
        status: 'Active on GSTN',
        image:
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••9832',
        ifsc: 'PUNB0021400',
        bankName: 'Punjab National Bank',
        holderName: 'ANIL GUPTA',
        pennyDropStatus: 'Failed - Name on Cheque does not match Company GST Name',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Requested re-upload of Business Current Account cheque instead of Savings account.',
    rejectionReason: 'Bank Mandate Mismatch: Provide Current Account in Company Name.',
  },
  {
    id: 'KYC-8825',
    applicantName: 'Sneha Rao (Trending Trends)',
    businessName: 'Sneha Lifestyle Studio',
    role: 'Reseller',
    phone: '+91 98450 67123',
    email: 'sneha.rao@trendingtips.in',
    location: 'Hyderabad, Telangana',
    submittedAt: '20 Sep 2026, 07:10 PM',
    status: 'Approved',
    riskLevel: 'Low',
    matchScore: 100,
    documents: {
      pan: {
        number: 'BPRPS4412R',
        nameOnDoc: 'SNEHA RAO',
        status: 'Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••5512',
        ifsc: 'AXIS0000451',
        bankName: 'Axis Bank, Jubilee Hills',
        holderName: 'SNEHA RAO',
        pennyDropStatus: 'Success (₹1 Credited)',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '•••• •••• 1290',
        status: 'UIDAI OTP Verified',
        image:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Approved on 21 Sep 2026 by Reviewer ADM-04. Instant payout enabled.',
    rejectionReason: null,
  },
  {
    id: 'KYC-8826',
    applicantName: 'Vikram Joshi (QuickKart Delivery)',
    businessName: 'Joshi Express Services',
    role: 'Delivery Partner',
    phone: '+91 91234 56789',
    email: 'vikram.j@quickkart.com',
    location: 'Delhi NCR',
    submittedAt: '20 Sep 2026, 05:40 PM',
    status: 'Approved',
    riskLevel: 'Low',
    matchScore: 97,
    documents: {
      drivingLicense: {
        number: 'DL-04-2019-771120',
        validity: 'Valid till 10 Dec 2039',
        status: 'Sarathi DB Match',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      pan: {
        number: 'CWJPK8812Q',
        nameOnDoc: 'VIKRAM JOSHI',
        status: 'Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'Fully verified background and active driver license.',
    rejectionReason: null,
  },
  {
    id: 'KYC-8827',
    applicantName: 'Royal Silk Creations (Karan Mehra)',
    businessName: 'Karan Mehra Exports',
    role: 'Supplier',
    phone: '+91 98110 99887',
    email: 'karan@royalsilkexports.in',
    location: 'Varanasi, Uttar Pradesh',
    submittedAt: '19 Sep 2026, 11:15 AM',
    status: 'Rejected',
    riskLevel: 'High',
    matchScore: 42,
    documents: {
      pan: {
        number: 'AMMPM4412B',
        nameOnDoc: 'UNKNOWN HOLDER',
        status: 'Mismatch with NSDL Database',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      gst: {
        number: '09AMMPM4412B1ZX',
        legalName: 'GSTIN Cancelled (Suo-moto)',
        status: 'Suspended by GST Department',
        image:
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      },
    },
    notes: 'GSTIN is suspended. Inactive business entity detected by compliance crawler.',
    rejectionReason: 'Invalid / Suspended GSTIN & Mismatched PAN card details.',
  },
];

const PREDEFINED_REJECTION_REASONS = [
  'PAN details mismatch with Income Tax Database',
  'GSTIN is inactive or cancelled on GST portal',
  'Bank Account holder name does not match applicant name',
  'Uploaded document is blurred, cropped, or unreadable',
  'Expired Driving License or Invalid Vehicle Registration',
  'Aadhaar photo does not match selfie liveness check',
];

// Identical navigation structure to admin_web_panel.jsx
const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  {
    id: 'kyc',
    label: 'KYC Verifications',
    icon: 'verified_user',
    isParent: true,
    children: [
      { id: 'dropshipper-kyc', label: 'Dropshipper KYC 📦', icon: 'local_shipping', path: '/admin-dropshipper-kyc' },
      { id: 'affiliate-kyc', label: 'Affiliate KYC 🤝', icon: 'loyalty', path: '/admin-affiliate-kyc' },
    ],
  },
  { id: 'products', label: 'Products', icon: 'inventory_2' },
  { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
  { id: 'returns', label: 'Returns & Refunds 🔄', icon: 'assignment_return' },
  { id: 'analytics', label: 'Analytics', icon: 'insights' },
  { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
  { id: 'earnings', label: 'Earnings', icon: 'payments' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'sellers', label: 'Sellers', icon: 'storefront' },
  { id: 'finance', label: 'Finance', icon: 'account_balance' },
];

export default function AdminDropshipperKyc({ onNavigate, onBack, onSwitchView }) {
  const [requests, setRequests] = useState(() => {
    try {
      const activeApp = getDropshipperApp();
      if (activeApp && activeApp.id) {
        const exists = INITIAL_KYC_REQUESTS.some((r) => r.id === activeApp.id);
        if (!exists) {
          const mappedReq = {
            id: activeApp.id,
            applicantName: `${activeApp.proprietorName || 'Sarah James'} (${activeApp.brandName || 'Store'})`,
            businessName: activeApp.brandName || 'Aura Trends Luxe',
            storeUrl: activeApp.storeUrl || 'https://auratrends.shop',
            storeType: (activeApp.platform || 'Shopify').toUpperCase() + ' STORE',
            proprietor: activeApp.proprietorName || 'Sarah James',
            role: 'Dropshipper',
            phone: activeApp.phone || '+91 98765 43210',
            email: activeApp.email || 'sarah.james@auratrends.shop',
            location: 'Mumbai, Maharashtra',
            submittedAt: 'Today, Just Now',
            status: activeApp.status || 'Pending',
            riskLevel: 'Low',
            matchScore: 98,
            panIdentifier: activeApp.panNumber || 'ABCDE1234F',
            aadhaarNumber: activeApp.aadhaarNumber || '4829 1920 3810',
            documents: {
              ...INITIAL_KYC_REQUESTS[0].documents,
              gst: {
                number: activeApp.businessRegType === 'msme' ? (activeApp.msmeNumber || 'UDYAM-KR-03-0019482') : (activeApp.gstin || '29ABCDE1234F1Z5'),
                legalName: `${(activeApp.brandName || 'Aura Trends Luxe').toUpperCase()} (${activeApp.businessRegType === 'msme' ? 'MSME / Udyam' : 'GST Registered'})`,
                status: activeApp.businessRegType === 'msme' ? 'Active Udyam Registration' : 'Active on GSTN',
                image: activeApp.businessRegFile?.previewUrl || INITIAL_KYC_REQUESTS[0].documents.gst.image,
              },
            },
            notes: `Newly submitted dropshipper KYC from User Portal. Verified ${activeApp.businessRegType === 'msme' ? 'MSME / Udyam Certificate' : 'GST Certificate'}.`,
            rejectionReason: activeApp.rejectionReason || null,
          };
          return [mappedReq, ...INITIAL_KYC_REQUESTS.filter((r) => r.id !== 'DSP-KYC-5089')];
        }
      }
    } catch (e) {}
    return INITIAL_KYC_REQUESTS;
  });
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [activeModalRequest, setActiveModalRequest] = useState(null);
  const [inspectProofsItem, setInspectProofsItem] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState('pan');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKycMenuOpen, setIsKycMenuOpen] = useState(true);
  const [docZoom, setDocZoom] = useState(1);
  const [docRotate, setDocRotate] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const reupload = requests.filter((r) => r.status === 'Re-upload').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    return { total, pending, approved, reupload, rejected };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const matchRole = selectedRole === 'All' || item.role === selectedRole;
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchRisk = selectedRisk === 'All' || item.riskLevel === selectedRisk;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        item.id.toLowerCase().includes(query) ||
        item.applicantName.toLowerCase().includes(query) ||
        item.businessName.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        item.location.toLowerCase().includes(query);

      return matchRole && matchStatus && matchRisk && matchSearch;
    });
  }, [requests, selectedRole, selectedStatus, selectedRisk, searchQuery]);

  // Actions
  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved', rejectionReason: null } : r))
    );
    try {
      const activeApp = getDropshipperApp();
      if (activeApp && (activeApp.id === id || activeApp.proprietorName === 'Sarah James' || id === 'DSP-KYC-5089')) {
        saveDropshipperApp({ ...activeApp, status: 'Approved' });
      }
    } catch (e) {}
    showToast(`KYC Request #${id} Approved & Activated successfully! 🎉`);
    if (activeModalRequest?.id === id) {
      setActiveModalRequest(null);
    }
  };

  const handleRequestReupload = (id, reason) => {
    const note = reason || 'Please re-upload clearly scanned document copy.';
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Re-upload',
              rejectionReason: note,
            }
          : r
      )
    );
    showToast(`Sent Re-upload Request to #${id} with instructions.`);
    if (activeModalRequest?.id === id) {
      setActiveModalRequest(null);
    }
  };

  const handleRejectConfirm = () => {
    if (!activeModalRequest) return;
    const reason =
      customRejectReason.trim() || 'Compliance verification failed. Documents mismatch.';
    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeModalRequest.id
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: reason,
            }
          : r
      )
    );
    try {
      const activeApp = getDropshipperApp();
      if (activeApp && (activeApp.id === activeModalRequest.id || activeApp.proprietorName === 'Sarah James' || activeModalRequest.id === 'DSP-KYC-5089')) {
        saveDropshipperApp({ ...activeApp, status: 'Rejected', rejectionReason: reason });
      }
    } catch (e) {}
    setShowRejectModal(false);
    showToast(`KYC Request #${activeModalRequest.id} marked as Rejected.`);
    setActiveModalRequest(null);
    setCustomRejectReason('');
  };

  const handleBatchApprove = () => {
    if (selectedRequestIds.length === 0) return;
    setRequests((prev) =>
      prev.map((r) => (selectedRequestIds.includes(r.id) ? { ...r, status: 'Approved' } : r))
    );
    showToast(`Batch approved ${selectedRequestIds.length} KYC requests!`);
    setSelectedRequestIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedRequestIds.length === filteredRequests.length) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(filteredRequests.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedRequestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNav = (navId) => {
    if (navId === 'dashboard') {
      if (onNavigate) onNavigate('/admin-panel');
      return;
    }
    if (navId === 'returns') {
      if (onNavigate) onNavigate('/admin-returns');
      return;
    }
    if (navId === 'products') {
      if (onNavigate) onNavigate('/admin-catalog');
      return;
    }
    if (navId === 'analytics') {
      if (onNavigate) onNavigate('/admin-analytics');
      return;
    }
    if (navId === 'sellers') {
      if (onNavigate) onNavigate('/seller-dashboard');
      return;
    }
    if (navId === 'kyc' || navId === 'dropshipper-kyc') {
      return;
    }
    if (navId === 'affiliate-kyc') {
      if (onNavigate) onNavigate('/admin-affiliate-kyc');
      return;
    }
    if (onNavigate) onNavigate('/admin-panel');
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#006a34] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">verified</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================== Mobile Top Bar (Matching admin_web_panel) ===================== */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 cursor-pointer"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="text-sm font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
            Admin Console
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/admin-panel')}
          className="bg-rose-50 text-rose-700 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 border border-rose-200 cursor-pointer"
        >
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* ===================== Mobile Navigation Drawer (Matching admin_web_panel) ===================== */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-slate-900 text-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="text-base font-black text-rose-500 font-['Plus_Jakarta_Sans',sans-serif]">
                    Admin Console
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Digital Curator Hub
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto max-h-[70vh]">
                {SIDEBAR_NAV.map((item) => {
                  if (item.isParent) {
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setIsKycMenuOpen(!isKycMenuOpen)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-800 text-rose-400"
                        >
                          <div className="flex items-center">
                            <span className="material-symbols-outlined mr-2.5 text-base">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <span
                            className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                              isKycMenuOpen ? 'rotate-180 text-rose-400' : 'text-slate-400'
                            }`}
                          >
                            expand_more
                          </span>
                        </button>

                        {isKycMenuOpen && (
                          <div className="ml-4 pl-3 border-l border-slate-700/80 space-y-1 py-1">
                            {item.children?.map((subItem) => {
                              const isSubActive = subItem.id === 'dropshipper-kyc';
                              return (
                                <button
                                  key={subItem.id}
                                  type="button"
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (subItem.path && onNavigate) {
                                      onNavigate(subItem.path);
                                    } else {
                                      handleNav(subItem.id);
                                    }
                                  }}
                                  className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    isSubActive
                                      ? 'bg-rose-600 text-white font-bold'
                                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                  }`}
                                >
                                  <span className="material-symbols-outlined mr-2 text-sm text-rose-400">{subItem.icon}</span>
                                  <span>{subItem.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = false;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNav(item.id);
                      }}
                      className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined mr-2.5 text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigate) onNavigate('/admin-panel');
                }}
                className="w-full py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Open Main Dashboard</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1">
        {/* ===================== Sidebar Navigation Shell (Matching admin_web_panel.jsx) ===================== */}
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-950 py-6 space-y-2 border-r border-slate-200/60 dark:border-slate-800">
          <div className="px-6 mb-8">
            <h1 className="text-lg font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
              Management Console
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
              Digital Curator Hub
            </p>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {SIDEBAR_NAV.map((item) => {
              if (item.isParent) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setIsKycMenuOpen(!isKycMenuOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold transition-all cursor-pointer bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                    >
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-3 text-rose-500">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-lg text-slate-400 transition-transform duration-200 ${
                          isKycMenuOpen ? 'rotate-180 text-rose-500' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {isKycMenuOpen && (
                      <div className="ml-5 pl-3 border-l-2 border-rose-200 dark:border-rose-900/60 space-y-1 py-1">
                        {item.children?.map((subItem) => {
                          const isSubActive = subItem.id === 'dropshipper-kyc';
                          return (
                            <button
                              key={subItem.id}
                              type="button"
                              onClick={() => {
                                if (subItem.path && onNavigate) {
                                  onNavigate(subItem.path);
                                } else {
                                  handleNav(subItem.id);
                                }
                              }}
                              className={`w-full flex items-center px-3 py-2 rounded-lg font-['Plus_Jakarta_Sans',sans-serif] text-xs font-semibold transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm translate-x-1 font-bold'
                                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 hover:translate-x-0.5'
                              }`}
                            >
                              <span className="material-symbols-outlined mr-2 text-base text-rose-500/80">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = false;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm translate-x-1'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:translate-x-1'
                  }`}
                >
                  <span className="material-symbols-outlined mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-4 mt-auto border-t border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={onSwitchView || (() => onNavigate && onNavigate('/admin-panel'))}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 mb-4 cursor-pointer"
            >
              Switch to Dashboard
            </button>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/support-center')}
                className="w-full flex items-center px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold cursor-pointer rounded-lg text-left"
              >
                <span className="material-symbols-outlined mr-3 text-lg">help</span>
                Support
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onBack) onBack();
                  else if (onNavigate) onNavigate('/');
                }}
                className="w-full flex items-center px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold cursor-pointer rounded-lg text-left"
              >
                <span className="material-symbols-outlined mr-3 text-lg">logout</span>
                Exit Console
              </button>
            </div>
          </div>
        </aside>

        {/* ===================== Main Content Canvas (Matching admin_web_panel) ===================== */}
        <main className="md:ml-64 flex-1 p-3.5 sm:p-6 md:p-8 pb-28 md:pb-24 bg-[#f8f9fb] min-h-screen">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200/50">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  Dropshipper KYC &amp; Compliance Hub
                </h2>
                <span className="bg-rose-100 text-rose-600 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase">
                  Dropshipper Queue
                </span>
              </div>
              <p className="text-slate-500 font-medium mt-1 text-sm">
                Real-time identity, GSTIN &amp; bank mandates verification for Dropshippers, Resellers &amp; Suppliers.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#e7e8ea] rounded-full px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Live Environment</span>
              </div>
              <button
                type="button"
                onClick={() => showToast(`System notification: ${metrics.pending} pending verifications in queue.`)}
                aria-label="Notifications"
                className="w-10 h-10 rounded-full bg-[#e1e2e4] hover:bg-slate-300 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Exported verified KYC audit report to CSV')}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer transition-all active:scale-95 font-['Plus_Jakarta_Sans',sans-serif]"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Audit CSV</span>
              </button>
            </div>
          </header>

          {/* Bento Grid: KYC Platform Stats (Matching Platform Stats Cards from admin_web_panel) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Requests */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">folder_shared</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Total Requests
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.total}
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">+100%</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#4d41df] h-full rounded-full w-full"></div>
              </div>
            </div>

            {/* Pending Review */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">pending_actions</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Pending Review
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.pending}
                </h3>
                <span className="text-amber-500 text-xs font-bold pb-1">SLA &lt;2h</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#b90041] h-full rounded-full w-[65%]"></div>
              </div>
            </div>

            {/* Approved & Live */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">verified</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Approved &amp; Live
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.approved}
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">+94% Rate</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#006a34] h-full rounded-full w-[80%]"></div>
              </div>
            </div>

            {/* Re-upload Requested */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">upload_file</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Re-upload Req.
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.reupload}
                </h3>
                <span className="text-amber-500 text-xs font-bold pb-1">In-Review</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#df2457] h-full rounded-full w-[35%]"></div>
              </div>
            </div>

            {/* Rejected */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">cancel</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Rejected
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.rejected}
                </h3>
                <span className="text-rose-500 text-xs font-bold pb-1">Mismatch</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full w-[20%]"></div>
              </div>
            </div>
          </div>

          {/* Action Alert Banner (Matching Urgent Returns Banner in admin_web_panel) */}
          <section className="bg-gradient-to-r from-rose-50 via-white to-amber-50/50 p-5 rounded-2xl border border-rose-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-[#b90041] text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                <span className="material-symbols-outlined text-2xl">policy</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Compliance Verification Queue
                  </h3>
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {metrics.pending} Pending Review
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  NSDL PAN active crawler, GST Department cross-checks, and ₹1 Bank Account verification running live.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setSelectedStatus('Pending')}
                className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                Filter Pending Only
              </button>
            </div>
          </section>

          {/* Filter Controls & Search Container */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Role Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', 'Dropshipper', 'Supplier', 'Reseller', 'Delivery Partner'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                      selectedRole === role
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role === 'All' ? 'All Ecosystem Roles' : `${role}s`}
                  </button>
                ))}
              </div>

              {/* Status Filter & Risk Filter */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center bg-[#f2f4f6] rounded-xl p-1 text-xs font-bold text-slate-700">
                  {['All', 'Pending', 'Approved', 'Re-upload', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedStatus === status ? 'bg-white text-rose-600 shadow-xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="bg-[#f2f4f6] border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Risk Profiles</option>
                  <option value="Low">Low Risk (&gt;90%)</option>
                  <option value="Medium">Medium Risk (70-90%)</option>
                  <option value="High">High Risk Flagged</option>
                </select>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by KYC ID, applicant name, business name, phone number, GSTIN or location..."
                className="w-full bg-[#f8f9fb] border border-slate-200/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </section>

          {/* Batch Action Strip (If rows selected) */}
          {selectedRequestIds.length > 0 && (
            <div className="bg-[#191c1e] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg mb-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400">playlist_add_check</span>
                <span className="text-xs sm:text-sm font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  {selectedRequestIds.length} KYC request(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBatchApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Approve Selected</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequestIds([])}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* KYC Request Records Table (Matching admin_web_panel card & list styling) */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  Verification Requests Queue
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredRequests.length} candidate verification records
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
                {selectedRole} Role
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredRequests.length > 0 &&
                          selectedRequestIds.length === filteredRequests.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-4">Applicant &amp; Business</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Verification Checkpoints</th>
                    <th className="py-3.5 px-4">Match / Risk</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                          inbox
                        </span>
                        <p className="font-semibold text-sm">No KYC requests found matching filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((item) => {
                      const isChecked = selectedRequestIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#f8f9fb] transition-colors ${
                            isChecked ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectOne(item.id)}
                              className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono text-slate-800">
                            {item.id}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {item.submittedAt}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#191c1e] text-xs sm:text-sm">
                              {item.applicantName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                              <span>{item.businessName}</span>
                              <span>•</span>
                              <span>{item.location}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {item.phone}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                item.role === 'Dropshipper'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : item.role === 'Supplier'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : item.role === 'Reseller'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {item.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {item.documents.pan && (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  PAN: {item.documents.pan.status}
                                </span>
                              )}
                              {item.documents.gst && (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  GST: {item.documents.gst.status}
                                </span>
                              )}
                              {item.documents.bank && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    item.documents.bank.pennyDropStatus.includes('Success')
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  ₹1 Bank Drop
                                </span>
                              )}
                              {item.documents.drivingLicense && (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  DL: Sarathi
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${
                                  item.riskLevel === 'Low'
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : item.riskLevel === 'Medium'
                                    ? 'text-amber-600 bg-amber-50'
                                    : 'text-rose-500 bg-rose-50'
                                }`}
                              >
                                {item.matchScore}% Match
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {item.riskLevel} Risk
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                item.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : item.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-600'
                                  : item.status === 'Re-upload'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'Approved'
                                    ? 'bg-emerald-500'
                                    : item.status === 'Pending'
                                    ? 'bg-amber-500'
                                    : item.status === 'Re-upload'
                                    ? 'bg-blue-500'
                                    : 'bg-rose-500'
                                }`}
                              ></span>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                              <button
                                type="button"
                                onClick={() => setInspectProofsItem(item)}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs whitespace-nowrap font-['Plus_Jakarta_Sans',sans-serif]"
                                title="Inspect Government Document Proofs"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                <span>Inspect Proofs</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveModalRequest(item);
                                  setActiveDocTab(Object.keys(item.documents)[0] || 'pan');
                                  setDocZoom(1);
                                  setDocRotate(0);
                                  setAdminNotes(item.notes || '');
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                                title="Detailed KYC Audit"
                              >
                                Audit
                              </button>

                              {item.status !== 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(item.id)}
                                  title="Quick Approve"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base">
                                    check_circle
                                  </span>
                                </button>
                              )}

                              {item.status !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveModalRequest(item);
                                    setShowRejectModal(true);
                                  }}
                                  title="Quick Reject"
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base">cancel</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* System-wide Footer (Matching admin_web_panel.jsx) */}
          <footer className="flex flex-col md:flex-row justify-between items-center px-4 py-10 w-full mt-16 font-['Inter'] text-xs text-slate-500 border-t border-slate-200/60">
            <p>© 2024 Curator Luxe Social Commerce. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Terms of Service
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Merchant Agreement
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Compliance &amp; KYC SLAs
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* ===================== Deep Document Inspection Modal ===================== */}
      {activeModalRequest && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setActiveModalRequest(null)}
        >
          <div
            className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-[#f8f9fb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">fact_check</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                      {activeModalRequest.applicantName}
                    </h3>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {activeModalRequest.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeModalRequest.role === 'Supplier'
                          ? 'bg-purple-100 text-purple-800'
                          : activeModalRequest.role === 'Reseller'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {activeModalRequest.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeModalRequest.businessName} • {activeModalRequest.phone} • {activeModalRequest.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalRequest(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Document Viewer (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                {/* Document Selector Tabs */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
                  {Object.keys(activeModalRequest.documents).map((docKey) => (
                    <button
                      key={docKey}
                      type="button"
                      onClick={() => {
                        setActiveDocTab(docKey);
                        setDocZoom(1);
                        setDocRotate(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeDocTab === docKey
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {docKey}
                    </button>
                  ))}
                </div>

                {/* Document Image with Zoom/Rotate Controls */}
                <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[340px] flex items-center justify-center group">
                  {activeModalRequest.documents[activeDocTab]?.image ? (
                    <img
                      src={activeModalRequest.documents[activeDocTab].image}
                      alt={activeDocTab}
                      style={{
                        transform: `scale(${docZoom}) rotate(${docRotate}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-[380px] max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs font-semibold">
                      Document preview not available.
                    </div>
                  )}

                  {/* Viewer Controls floating overlay */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setDocZoom((z) => Math.max(0.6, z - 0.2))}
                      className="p-1 hover:text-rose-400 cursor-pointer"
                      title="Zoom Out"
                    >
                      <span className="material-symbols-outlined text-sm">zoom_out</span>
                    </button>
                    <span className="font-mono text-[10px]">{Math.round(docZoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setDocZoom((z) => Math.min(2.5, z + 0.2))}
                      className="p-1 hover:text-rose-400 cursor-pointer"
                      title="Zoom In"
                    >
                      <span className="material-symbols-outlined text-sm">zoom_in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocRotate((r) => (r + 90) % 360)}
                      className="p-1 hover:text-rose-400 cursor-pointer"
                      title="Rotate 90deg"
                    >
                      <span className="material-symbols-outlined text-sm">rotate_right</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocZoom(1);
                        setDocRotate(0);
                      }}
                      className="p-1 hover:text-rose-400 cursor-pointer"
                      title="Reset View"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                    </button>
                  </div>
                </div>

                {/* Metadata summary of currently selected document */}
                {activeModalRequest.documents[activeDocTab] && (
                  <div className="bg-[#f8f9fb] p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">
                        Identifier Number
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {activeModalRequest.documents[activeDocTab].number || 'Verified from Database'}
                      </span>
                    </div>
                    {activeModalRequest.documents[activeDocTab].legalName && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          GSTN Entity Name
                        </span>
                        <span className="font-bold text-slate-800 text-right">
                          {activeModalRequest.documents[activeDocTab].legalName}
                        </span>
                      </div>
                    )}
                    {activeModalRequest.documents[activeDocTab].pennyDropStatus && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          ₹1 Bank Verification
                        </span>
                        <span className="font-bold text-emerald-600">
                          {activeModalRequest.documents[activeDocTab].pennyDropStatus}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Automated Checklist & Decision Actions (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Match Score Card */}
                  <div className="bg-[#f8f9fb] p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        Automated AI Trust Score
                      </p>
                      <p className="text-2xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                        {activeModalRequest.matchScore}% Confidence
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activeModalRequest.riskLevel === 'Low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeModalRequest.riskLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {activeModalRequest.riskLevel} Risk Profile
                    </span>
                  </div>

                  {/* Verification Checkpoints Checklist */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Government &amp; Bank DB Validation
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-sm">
                            check_circle
                          </span>
                          <span className="font-medium text-emerald-950">NSDL PAN Status</span>
                        </div>
                        <span className="font-bold text-emerald-700">Active / Valid</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-sm">
                            check_circle
                          </span>
                          <span className="font-medium text-emerald-950">UIDAI OTP Verification</span>
                        </div>
                        <span className="font-bold text-emerald-700">Authenticated</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm">
                            verified
                          </span>
                          <span className="font-medium text-slate-800">₹1 IMPS Bank Verification</span>
                        </div>
                        <span className="font-bold text-slate-700">
                          {activeModalRequest.documents.bank?.pennyDropStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Reviewer Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Internal Compliance Audit Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add compliance comments or reason for flags..."
                      className="w-full bg-[#f8f9fb] border border-slate-200/80 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Modal Footer Decision Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRequestReupload(activeModalRequest.id, adminNotes)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      <span className="material-symbols-outlined text-sm">sync_problem</span>
                      <span>Request Re-upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      <span>Reject Request</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApprove(activeModalRequest.id)}
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Approve &amp; Activate Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Inspect Proofs Modal (Attached Screenshot Design) ===================== */}
      {inspectProofsItem && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setInspectProofsItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up border border-slate-100/80 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Tag, Title, Subtitle, Close Button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-rose-600 uppercase">
                  <span>{inspectProofsItem.id}</span>
                  <span>•</span>
                  <span>{inspectProofsItem.storeType || 'SHOPIFY STORE'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] mt-1 tracking-tight">
                  {inspectProofsItem.businessName} KYC Verification
                </h3>
                <a
                  href={inspectProofsItem.storeUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs sm:text-sm text-slate-400 hover:text-slate-600 font-mono inline-block mt-0.5 transition-colors"
                >
                  {inspectProofsItem.storeUrl || `https://${inspectProofsItem.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.shop`}
                </a>
              </div>

              <button
                type="button"
                onClick={() => setInspectProofsItem(null)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Proprietor & Contact Info Card */}
            <div className="bg-[#f8f9fb] border border-slate-200/80 rounded-2xl p-4 sm:p-5 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
                  PROPRIETOR
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#191c1e] block mt-1">
                  {inspectProofsItem.proprietor || inspectProofsItem.applicantName.split('(')[0].trim()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
                  PHONE / CONTACT
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#191c1e] block mt-1">
                  {inspectProofsItem.phone}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
                  PAN IDENTIFIER
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#191c1e] font-mono block mt-1">
                  {inspectProofsItem.panIdentifier || inspectProofsItem.documents?.pan?.number || 'ABCDE1234F'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
                  AADHAAR #
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#191c1e] font-mono tracking-wider block mt-1">
                  {inspectProofsItem.aadhaarNumber || inspectProofsItem.documents?.aadhaar?.number || '4829 1920 3810'}
                </span>
              </div>
            </div>

            {/* Section: Uploaded Government Document Proofs */}
            <h4 className="text-sm font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] mt-6 mb-3">
              Uploaded Government Document Proofs
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PAN Card Scan */}
              <div className="border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 bg-white shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1e]">
                    PAN Card Scan
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">
                    {inspectProofsItem.documents?.pan?.fileSize || '1.8 MB'}
                  </span>
                </div>
                <div className="mt-3 rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-100">
                  <img
                    src={
                      inspectProofsItem.documents?.pan?.proofImage ||
                      inspectProofsItem.documents?.pan?.image ||
                      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&auto=format&fit=crop&q=80'
                    }
                    alt="PAN Card Scan"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Aadhaar Card Proof */}
              <div className="border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 bg-white shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1e]">
                    Aadhaar Card Proof
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">
                    {inspectProofsItem.documents?.aadhaar?.fileSize || '2.4 MB'}
                  </span>
                </div>
                <div className="mt-3 rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-100">
                  <img
                    src={
                      inspectProofsItem.documents?.aadhaar?.proofImage ||
                      inspectProofsItem.documents?.aadhaar?.image ||
                      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=700&auto=format&fit=crop&q=80'
                    }
                    alt="Aadhaar Card Proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Bank Account & UPI Settlement Destination */}
            <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 mt-5 bg-white shadow-2xs">
              <h5 className="text-sm font-bold text-[#191c1e] mb-3 font-['Plus_Jakarta_Sans',sans-serif]">
                Bank Account &amp; UPI Settlement Destination
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Bank
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#191c1e] block mt-0.5">
                    {inspectProofsItem.documents?.bank?.bankName?.split(',')[0] || 'HDFC Bank'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Account
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#191c1e] font-mono block mt-0.5">
                    {inspectProofsItem.documents?.bank?.accountNumber?.replace(/•/g, '5010') || '50100482910291'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    UPI ID
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 font-mono block mt-0.5">
                    {inspectProofsItem.documents?.bank?.upiId ||
                      inspectProofsItem.upiId ||
                      (inspectProofsItem.email ? inspectProofsItem.email.split('@')[0] + '@okaxis' : 'sarahjames@okaxis')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectProofsItem(null)}
                className="px-6 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Reject Reason Modal ===================== */}
      {showRejectModal && activeModalRequest && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600">report</span>
                <h4 className="font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Reject KYC #{activeModalRequest.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select a reason or type custom remarks. This reason will be sent to the applicant via SMS
              and App Notification.
            </p>

            {/* Predefined reason chips */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {PREDEFINED_REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setCustomRejectReason(reason)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    customRejectReason === reason
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={customRejectReason}
              onChange={(e) => setCustomRejectReason(e.target.value)}
              placeholder="Or write custom rejection explanation..."
              className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Universal App Bottom Navigation Bar ===================== */}
      <AppBottomNav activeNav="screens" onNavigate={onNavigate} />
    </div>
  );
}
