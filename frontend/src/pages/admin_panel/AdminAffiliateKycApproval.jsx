import { useState, useMemo, useEffect } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import { getAffiliateApp, saveAffiliateApp, subscribeAffiliateApp } from '../../services/affiliateSessionStore';

// Realistic Mock Data for Affiliate KYC & Program Management
const INITIAL_AFFILIATES = [
  {
    id: 'AFF-301',
    name: 'Priya Sharma',
    handle: '@priya_couture_vibe',
    platform: 'Instagram',
    followers: '142K Followers',
    email: 'priya.creator@gmail.com',
    phone: '+91 97112 34567',
    location: 'Jaipur, Rajasthan',
    referralCode: 'PRIYALUXE',
    tier: 'Gold Creator',
    commissionRate: 15,
    totalEarnings: '₹1,84,500',
    monthlyConversions: 840,
    conversionRate: '4.8%',
    appliedAt: '21 Sep 2026, 05:40 PM',
    kycStatus: 'Approved', // 'Pending' | 'Approved' | 'Rejected' | 'Re-upload'
    isEnabled: true, // Affiliate Access Enabled / Disabled toggle
    riskScore: 99,
    documents: {
      pan: {
        number: 'BKWPS9821K',
        nameOnDoc: 'PRIYA SHARMA',
        status: 'NSDL Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••1109',
        ifsc: 'SBIN0004032',
        bankName: 'State Bank of India',
        holderName: 'PRIYA SHARMA',
        pennyDrop: '₹1 Credited Successfully',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '•••• •••• 4410',
        status: 'UIDAI OTP Verified',
        image:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://instagram.com/priya_couture_vibe',
        engagementRate: '5.2%',
        status: 'Audience Authenticity 98%',
      },
    },
    disableReason: null,
  },
  {
    id: 'AFF-302',
    name: 'Rahul Verma',
    handle: '@deals_express_hub',
    platform: 'Telegram',
    followers: '95K Members',
    email: 'rahul.deals@expresshub.in',
    phone: '+91 98980 11223',
    location: 'Bengaluru, Karnataka',
    referralCode: 'DEALSHUB',
    tier: 'Mega Affiliate',
    commissionRate: 18,
    totalEarnings: '₹3,42,000',
    monthlyConversions: 1650,
    conversionRate: '6.1%',
    appliedAt: '21 Sep 2026, 02:15 PM',
    kycStatus: 'Pending',
    isEnabled: false, // Pending approval, currently not enabled
    riskScore: 88,
    documents: {
      pan: {
        number: 'ALKPZ7781N',
        nameOnDoc: 'RAHUL VERMA',
        status: 'NSDL Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••6642',
        ifsc: 'HDFC0001824',
        bankName: 'HDFC Bank, Koramangala',
        holderName: 'RAHUL VERMA',
        pennyDrop: '₹1 Credited Successfully',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: '•••• •••• 9920',
        status: 'UIDAI OTP Verified',
        image:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://t.me/deals_express_hub',
        engagementRate: '12.4%',
        status: 'High Direct Traffic',
      },
    },
    disableReason: 'Awaiting initial KYC verification before enabling commission tracking.',
  },
  {
    id: 'AFF-303',
    name: 'Ananya Roy',
    handle: '@ananya_saree_tales',
    platform: 'YouTube',
    followers: '280K Subscribers',
    email: 'ananya@sareetales.com',
    phone: '+91 94140 33445',
    location: 'Kolkata, West Bengal',
    referralCode: 'ROYALSAREE',
    tier: 'Diamond Partner',
    commissionRate: 20,
    totalEarnings: '₹6,12,000',
    monthlyConversions: 2420,
    conversionRate: '5.9%',
    appliedAt: '20 Sep 2026, 08:30 PM',
    kycStatus: 'Approved',
    isEnabled: false, // Disabled by Admin
    riskScore: 92,
    documents: {
      pan: {
        number: 'AROPR4412B',
        nameOnDoc: 'ANANYA ROY',
        status: 'NSDL Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••4892',
        ifsc: 'ICIC0000104',
        bankName: 'ICICI Bank, Park Street',
        holderName: 'ANANYA ROY',
        pennyDrop: '₹1 Credited Successfully',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://youtube.com/@ananya_saree_tales',
        engagementRate: '8.1%',
        status: 'Audience Authenticity 99%',
      },
    },
    disableReason: 'Account temporarily disabled: High return/RTO rate detected on shared links.',
  },
  {
    id: 'AFF-304',
    name: 'Kabir Sethi',
    handle: '@delhi_fashion_daily',
    platform: 'Instagram',
    followers: '78K Followers',
    email: 'kabir.sethi@fashiondaily.in',
    phone: '+91 98110 55667',
    location: 'New Delhi, Delhi NCR',
    referralCode: 'KABIR50',
    tier: 'Silver Creator',
    commissionRate: 12,
    totalEarnings: '₹78,400',
    monthlyConversions: 410,
    conversionRate: '3.9%',
    appliedAt: '20 Sep 2026, 04:10 PM',
    kycStatus: 'Approved',
    isEnabled: true,
    riskScore: 96,
    documents: {
      pan: {
        number: 'CWJPK8812Q',
        nameOnDoc: 'KABIR SETHI',
        status: 'NSDL Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••9832',
        ifsc: 'KKBK0000180',
        bankName: 'Kotak Mahindra Bank',
        holderName: 'KABIR SETHI',
        pennyDrop: '₹1 Credited Successfully',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://instagram.com/delhi_fashion_daily',
        engagementRate: '4.5%',
        status: 'Verified Creator',
      },
    },
    disableReason: null,
  },
  {
    id: 'AFF-305',
    name: 'Pooja Nair',
    handle: '@nair_home_hacks',
    platform: 'Pinterest & Blog',
    followers: '45K Monthly Readers',
    email: 'pooja@nairhomehacks.com',
    phone: '+91 98450 77889',
    location: 'Kochi, Kerala',
    referralCode: 'HOMEHACKS',
    tier: 'Silver Creator',
    commissionRate: 12,
    totalEarnings: '₹42,100',
    monthlyConversions: 210,
    conversionRate: '3.4%',
    appliedAt: '19 Sep 2026, 09:30 PM',
    kycStatus: 'Pending',
    isEnabled: false,
    riskScore: 74,
    documents: {
      pan: {
        number: 'BPRPS4412R',
        nameOnDoc: 'POOJA NAIR',
        status: 'NSDL Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••5512',
        ifsc: 'FDRL0001042',
        bankName: 'Federal Bank, Marine Drive',
        holderName: 'POOJA NAIR',
        pennyDrop: 'Pending Confirmation',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://nairhomehacks.com',
        engagementRate: '2.8%',
        status: 'Blog Verification Pending',
      },
    },
    disableReason: 'Bank account ₹1 verification pending.',
  },
  {
    id: 'AFF-306',
    name: 'Vikram Rajput',
    handle: '@rajput_fitness_deals',
    platform: 'Instagram',
    followers: '62K Followers',
    email: 'vikram.rajput@fitdeals.in',
    phone: '+91 91234 88990',
    location: 'Chandigarh, Punjab',
    referralCode: 'FITDEALS',
    tier: 'Bronze Creator',
    commissionRate: 10,
    totalEarnings: '₹14,500',
    monthlyConversions: 95,
    conversionRate: '1.8%',
    appliedAt: '18 Sep 2026, 11:20 AM',
    kycStatus: 'Rejected',
    isEnabled: false,
    riskScore: 35,
    documents: {
      pan: {
        number: 'AMMPM4412B',
        nameOnDoc: 'UNKNOWN HOLDER',
        status: 'NSDL Name Mismatch',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••1289',
        ifsc: 'PUNB0021400',
        bankName: 'Punjab National Bank',
        holderName: 'SINGH TEXTILES',
        pennyDrop: 'Failed - Name Mismatch',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://instagram.com/rajput_fitness_deals',
        engagementRate: '0.4%',
        status: 'Suspicious Bot Activity Detected',
      },
    },
    disableReason: 'Fraudulent activity flagged: Inconsistent PAN & Bank mandate.',
  },
  {
    id: 'AFF-307',
    name: 'Sneha Kulkarni',
    handle: '@sneha_lifestyle_buzz',
    platform: 'Instagram',
    followers: '115K Followers',
    email: 'sneha@kulkarnilifestyle.com',
    phone: '+91 98220 99881',
    location: 'Pune, Maharashtra',
    referralCode: 'SNEHALUXE',
    tier: 'Gold Creator',
    commissionRate: 15,
    totalEarnings: '₹2,15,800',
    monthlyConversions: 920,
    conversionRate: '5.1%',
    appliedAt: '18 Sep 2026, 09:10 AM',
    kycStatus: 'Approved',
    isEnabled: true,
    riskScore: 97,
    documents: {
      pan: {
        number: 'CLKPS3312Z',
        nameOnDoc: 'SNEHA KULKARNI',
        status: 'NSDL Verified',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: '••••••••7731',
        ifsc: 'MAHB0000412',
        bankName: 'Bank of Maharashtra',
        holderName: 'SNEHA KULKARNI',
        pennyDrop: '₹1 Credited Successfully',
        image:
          'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://instagram.com/sneha_lifestyle_buzz',
        engagementRate: '6.4%',
        status: 'Verified Influencer',
      },
    },
    disableReason: null,
  },
];

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

const mapUserAppToAdminRecord = (userApp) => {
  if (!userApp) return null;
  const isApproved = userApp.status === 'Approved' || userApp.status === 'APPROVED';
  const isRejected = userApp.status === 'Rejected' || userApp.status === 'REJECTED';
  const kycStatus = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending';

  return {
    id: userApp.applicationId || 'AFF-USER-LIVE',
    isLiveUserApp: true,
    name: userApp.fullName || 'User Applicant',
    handle: '@' + (userApp.fullName || 'affiliate').toLowerCase().replace(/[^a-z0-9]/g, '_'),
    platform: 'Instagram / Direct Community',
    followers: '50K+ Audience',
    email: userApp.email || 'user.applicant@meesho.com',
    phone: userApp.phone || '+91 98765 43210',
    location: [userApp.city, userApp.state].filter(Boolean).join(', ') || 'Delhi, India',
    referralCode: ((userApp.fullName ? userApp.fullName.slice(0, 5) : 'MEE') + '50').toUpperCase(),
    tier: 'Gold Creator',
    commissionRate: 15,
    totalEarnings: '₹0',
    monthlyConversions: 0,
    conversionRate: '0.0%',
    appliedAt: userApp.submittedAt || 'Today, Just now',
    kycStatus: kycStatus,
    isEnabled: isApproved,
    riskScore: isRejected ? 42 : 94,
    documents: {
      pan: {
        number: (userApp.panNumber || 'BKWPS9821K').toUpperCase(),
        nameOnDoc: (userApp.fullName || 'USER APPLICANT').toUpperCase(),
        status: isRejected ? 'NSDL Verification Failed' : 'NSDL Verified',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      },
      bank: {
        accountNumber: userApp.accountNumber ? `••••••••${userApp.accountNumber.slice(-4)}` : '••••••••4892',
        ifsc: (userApp.ifscCode || 'HDFC0001824').toUpperCase(),
        bankName: userApp.bankName || 'HDFC Bank Ltd',
        holderName: (userApp.accountHolderName || userApp.fullName || 'USER APPLICANT').toUpperCase(),
        pennyDrop: isRejected ? '₹1 Bank Verification Failed' : '₹1 Credited Successfully',
        image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      },
      aadhaar: {
        number: userApp.aadhaarNumber ? `•••• •••• ${userApp.aadhaarNumber.slice(-4)}` : '•••• •••• 9920',
        status: isRejected ? 'UIDAI Manual Check Failed' : 'UIDAI OTP Verified',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      },
      channelProof: {
        url: 'https://instagram.com/verified_creator',
        engagementRate: '5.8%',
        status: 'Audience Authenticity 98%',
      },
    },
    disableReason: isRejected ? (userApp.rejectionReason || 'KYC Document verification failed.') : null,
  };
};

export default function AdminAffiliateKycApproval({ onNavigate, onBack, onSwitchView }) {
  const buildInitialList = () => {
    const userApp = getAffiliateApp();
    if (userApp) {
      const liveRecord = mapUserAppToAdminRecord(userApp);
      return [liveRecord, ...INITIAL_AFFILIATES.filter((a) => a.id !== liveRecord.id)];
    }
    return INITIAL_AFFILIATES;
  };

  const [affiliates, setAffiliates] = useState(buildInitialList);

  useEffect(() => {
    const unsubscribe = subscribeAffiliateApp((updatedApp) => {
      if (updatedApp) {
        const liveRecord = mapUserAppToAdminRecord(updatedApp);
        setAffiliates((prev) => [liveRecord, ...prev.filter((a) => a.id !== liveRecord.id)]);
      }
    });
    return unsubscribe;
  }, []);
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Enabled' | 'Disabled' | 'Rejected'
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableNote, setDisableNote] = useState('');
  const [activeDocTab, setActiveDocTab] = useState('pan');
  const [toastMessage, setToastMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKycMenuOpen, setIsKycMenuOpen] = useState(true);
  const [globalAffiliateAutoApproval, setGlobalAffiliateAutoApproval] = useState(false);
  const [globalPayoutSystem, setGlobalPayoutSystem] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = affiliates.length;
    const pending = affiliates.filter((a) => a.kycStatus === 'Pending').length;
    const enabled = affiliates.filter((a) => a.isEnabled).length;
    const disabled = affiliates.filter((a) => !a.isEnabled).length;
    const approved = affiliates.filter((a) => a.kycStatus === 'Approved').length;
    return { total, pending, enabled, disabled, approved };
  }, [affiliates]);

  // Filtering
  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((item) => {
      let matchStatus = true;
      if (selectedStatus === 'Pending') matchStatus = item.kycStatus === 'Pending';
      else if (selectedStatus === 'Approved') matchStatus = item.kycStatus === 'Approved';
      else if (selectedStatus === 'Enabled') matchStatus = item.isEnabled === true;
      else if (selectedStatus === 'Disabled') matchStatus = item.isEnabled === false;
      else if (selectedStatus === 'Rejected') matchStatus = item.kycStatus === 'Rejected';

      const matchPlatform =
        selectedPlatform === 'All' || item.platform.toLowerCase().includes(selectedPlatform.toLowerCase());

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        q === '' ||
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.handle.toLowerCase().includes(q) ||
        item.referralCode.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.location.toLowerCase().includes(q);

      return matchStatus && matchPlatform && matchQuery;
    });
  }, [affiliates, selectedStatus, selectedPlatform, searchQuery]);

  // Toggle Single Affiliate Enable / Disable
  const handleToggleEnable = (id, e) => {
    if (e) e.stopPropagation();
    const item = affiliates.find((a) => a.id === id);
    if (!item) return;

    if (item.isEnabled) {
      // Open confirm modal to prompt for disable reason
      setActiveModalItem(item);
      setShowDisableModal(true);
      setDisableNote('');
    } else {
      // Directly enable
      setAffiliates((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isEnabled: true, disableReason: null } : a))
      );
      showToast(`Affiliate #${id} (${item.name}) ENABLED! Links & payouts are now active. 🟢`);
      if (activeModalItem?.id === id) {
        setActiveModalItem((prev) => (prev ? { ...prev, isEnabled: true, disableReason: null } : null));
      }
    }
  };

  // Confirm Disable Action with Reason
  const handleConfirmDisable = () => {
    if (!activeModalItem) return;
    const reason = disableNote.trim() || 'Disabled by Admin for account review or policy audit.';
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === activeModalItem.id ? { ...a, isEnabled: false, disableReason: reason } : a
      )
    );
    showToast(`Affiliate #${activeModalItem.id} has been DISABLED. Tracking links paused.`);
    setShowDisableModal(false);
    setActiveModalItem((prev) => (prev ? { ...prev, isEnabled: false, disableReason: reason } : null));
    setDisableNote('');
  };

  // KYC Approval
  const handleApproveKyc = (id) => {
    setAffiliates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, kycStatus: 'Approved', isEnabled: true, disableReason: null } : a))
    );
    const userApp = getAffiliateApp();
    if (userApp && (id === userApp.applicationId || id === 'AFF-USER-LIVE' || (typeof id === 'string' && id.startsWith('KYC-AFF-')))) {
      saveAffiliateApp({
        ...userApp,
        status: 'Approved',
        approvedAt: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        rejectionReason: null,
      });
    }
    showToast(`Affiliate KYC #${id} Approved & Account Enabled! 🎉`);
    if (activeModalItem?.id === id) {
      setActiveModalItem((prev) =>
        prev ? { ...prev, kycStatus: 'Approved', isEnabled: true, disableReason: null } : null
      );
    }
  };

  // KYC Rejection
  const handleRejectKyc = (id) => {
    const reason = 'Document verification failed: PAN Card or Bank details could not be authenticated. Please re-upload.';
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              kycStatus: 'Rejected',
              isEnabled: false,
              disableReason: reason,
            }
          : a
      )
    );
    const userApp = getAffiliateApp();
    if (userApp && (id === userApp.applicationId || id === 'AFF-USER-LIVE' || (typeof id === 'string' && id.startsWith('KYC-AFF-')))) {
      saveAffiliateApp({
        ...userApp,
        status: 'Rejected',
        rejectionReason: reason,
      });
    }
    showToast(`Affiliate KYC #${id} Rejected & Access Disabled.`);
    if (activeModalItem?.id === id) {
      setActiveModalItem(null);
    }
  };

  // Bulk Actions
  const handleBatchEnable = () => {
    setAffiliates((prev) =>
      prev.map((a) => (selectedIds.includes(a.id) ? { ...a, isEnabled: true } : a))
    );
    showToast(`Bulk Enabled ${selectedIds.length} affiliate accounts! 🟢`);
    setSelectedIds([]);
  };

  const handleBatchDisable = () => {
    setAffiliates((prev) =>
      prev.map((a) =>
        selectedIds.includes(a.id)
          ? { ...a, isEnabled: false, disableReason: 'Batch paused by Admin operator.' }
          : a
      )
    );
    showToast(`Bulk Disabled ${selectedIds.length} affiliate accounts! ⏸️`);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAffiliates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAffiliates.map((a) => a.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNav = (navId) => {
    if (navId === 'dashboard') {
      if (onNavigate) onNavigate('/admin-panel');
      return;
    }
    if (navId === 'kyc' || navId === 'dropshipper-kyc') {
      if (onNavigate) onNavigate('/admin-dropshipper-kyc');
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
    if (navId === 'affiliate-kyc') {
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

      {/* ===================== Mobile Top Bar ===================== */}
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
            Affiliate KYC Console
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

      {/* ===================== Mobile Navigation Drawer ===================== */}
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
                    Affiliate Partner Hub
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
                              const isSubActive = subItem.id === 'affiliate-kyc';
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
                        isActive ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
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
        {/* ===================== Sidebar Navigation Shell ===================== */}
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-950 py-6 space-y-2 border-r border-slate-200/60 dark:border-slate-800">
          <div className="px-6 mb-8">
            <h1 className="text-lg font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
              Management Console
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
              Affiliate Partner Portal
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
                          const isSubActive = subItem.id === 'affiliate-kyc';
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

        {/* ===================== Main Content Canvas ===================== */}
        <main className="md:ml-64 flex-1 p-3.5 sm:p-6 md:p-8 pb-28 md:pb-24 bg-[#f8f9fb] min-h-screen">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200/50">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  Affiliate KYC Approval &amp; Access Control
                </h2>
                <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase">
                  Creator Access
                </span>
              </div>
              <p className="text-slate-500 font-medium mt-1 text-sm">
                Approve Influencer KYC and manage Enable/Disable access switches for affiliate link payouts.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#e7e8ea] rounded-full px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Affiliate Gateway Live</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Auditing affiliate commission logs...')}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer transition-all active:scale-95 font-['Plus_Jakarta_Sans',sans-serif]"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Audit Affiliates</span>
              </button>
            </div>
          </header>

          {/* ===================== Global Program Control Banner (Enable / Disable Switches) ===================== */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  System-Wide Controls
                </span>
                <h3 className="text-lg font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
                  Affiliate Program Master Gateway
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Instantly enable or disable affiliate onboarding and automated banking commission payouts.
                </p>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                {/* Switch 1: Auto-Approval */}
                <div className="flex items-center gap-3 bg-[#f8f9fb] p-3 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#191c1e]">Auto-KYC Verification</p>
                    <p className="text-[10px] text-slate-400">
                      {globalAffiliateAutoApproval ? 'AI Auto-Approval On' : 'Manual Review Required'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalAffiliateAutoApproval(!globalAffiliateAutoApproval);
                      showToast(
                        !globalAffiliateAutoApproval
                          ? 'Automated AI KYC verification ENABLED'
                          : 'Automated AI KYC verification DISABLED'
                      );
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                      globalAffiliateAutoApproval ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        globalAffiliateAutoApproval ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Switch 2: Global Commission Payouts */}
                <div className="flex items-center gap-3 bg-[#f8f9fb] p-3 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#191c1e]">Automated Payouts</p>
                    <p className="text-[10px] text-slate-400">
                      {globalPayoutSystem ? 'Active & Processing' : 'Temporarily Frozen'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalPayoutSystem(!globalPayoutSystem);
                      showToast(
                        !globalPayoutSystem
                          ? 'Automated commission payouts ENABLED 🟢'
                          : 'Automated commission payouts PAUSED / DISABLED ⏸️'
                      );
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                      globalPayoutSystem ? 'bg-emerald-600' : 'bg-rose-500'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        globalPayoutSystem ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ===================== Bento Stats Grid ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Affiliates */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">loyalty</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Total Affiliates
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.total}
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">+18% MoM</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#4d41df] h-full rounded-full w-full"></div>
              </div>
            </div>

            {/* Pending KYC Review */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">hourglass_top</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Pending KYC
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.pending}
                </h3>
                <span className="text-amber-500 text-xs font-bold pb-1">Needs Approval</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#b90041] h-full rounded-full w-[45%]"></div>
              </div>
            </div>

            {/* Active & Enabled */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">check_circle</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Enabled Affiliates
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#006a34] font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.enabled}
                </h3>
                <span className="text-emerald-600 text-xs font-bold pb-1">Live Tracking</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#006a34] h-full rounded-full w-[80%]"></div>
              </div>
            </div>

            {/* Disabled / Suspended */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">pause_circle</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Disabled / Paused
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
                  {metrics.disabled}
                </h3>
                <span className="text-rose-500 text-xs font-bold pb-1">Links Paused</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full w-[30%]"></div>
              </div>
            </div>

            {/* Total Disbursed */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-8xl">payments</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Total Payouts
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  ₹14.5L
                </h3>
                <span className="text-emerald-500 text-xs font-bold pb-1">MTD</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#4d41df] h-full rounded-full w-[65%]"></div>
              </div>
            </div>
          </div>

          {/* ===================== Filters & Search Section ===================== */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'All', label: 'All Affiliates' },
                  { id: 'Pending', label: 'Pending KYC ⏳' },
                  { id: 'Enabled', label: 'Enabled 🟢' },
                  { id: 'Disabled', label: 'Disabled ⏸️' },
                  { id: 'Approved', label: 'KYC Verified' },
                  { id: 'Rejected', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                      selectedStatus === tab.id
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Platform Selector */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-[#f2f4f6] border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All Social Channels</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="Telegram">Telegram</option>
                <option value="Pinterest">Pinterest / Blog</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search affiliate by name, handle, referral code (e.g. PRIYALUXE), phone, or city..."
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

          {/* ===================== Batch Action Toolbar (Enable / Disable Bulk) ===================== */}
          {selectedIds.length > 0 && (
            <div className="bg-[#191c1e] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg mb-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400">tune</span>
                <span className="text-xs sm:text-sm font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  {selectedIds.length} Affiliate partner(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBatchEnable}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">toggle_on</span>
                  <span>Enable Access</span>
                </button>
                <button
                  type="button"
                  onClick={handleBatchDisable}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">toggle_off</span>
                  <span>Disable Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* ===================== Main Affiliate KYC & Enable/Disable Table ===================== */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                  Affiliate Partners Directory
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredAffiliates.length} registered affiliate creators
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">
                  {selectedStatus} View
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredAffiliates.length > 0 &&
                          selectedIds.length === filteredAffiliates.length
                        }
                        onChange={handleSelectAll}
                        className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Affiliate Partner</th>
                    <th className="py-3.5 px-4">Channel &amp; Reach</th>
                    <th className="py-3.5 px-4">Referral Code</th>
                    <th className="py-3.5 px-4">KYC Status</th>
                    <th className="py-3.5 px-4 text-center">Enable / Disable</th>
                    <th className="py-3.5 px-4">Earnings &amp; CR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAffiliates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                          person_off
                        </span>
                        <p className="font-semibold text-sm">No affiliate accounts found matching criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAffiliates.map((item) => {
                      const isChecked = selectedIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setActiveModalItem(item);
                            setActiveDocTab('pan');
                          }}
                          className={`hover:bg-[#f8f9fb] transition-colors cursor-pointer ${
                            isChecked ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSelectOne(item.id)}
                              className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                {item.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-[#191c1e] text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                                  <span>{item.name}</span>
                                  {item.isLiveUserApp && (
                                    <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                                      Live User Submission
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {item.id} • {item.location}
                                </div>
                                <div className="text-[10px] text-slate-500">{item.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{item.handle}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {item.platform}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {item.followers}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider">
                              {item.referralCode}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-1 font-semibold">
                              {item.tier} ({item.commissionRate}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                item.kycStatus === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : item.kycStatus === 'Pending'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.kycStatus === 'Approved'
                                    ? 'bg-emerald-500'
                                    : item.kycStatus === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              ></span>
                              {item.kycStatus}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              PAN: {item.documents.pan.status}
                            </span>
                          </td>
                          {/* ===================== ENABLE / DISABLE TOGGLE SWITCH ===================== */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleToggleEnable(item.id, e)}
                                title={item.isEnabled ? 'Click to Disable Affiliate' : 'Click to Enable Affiliate'}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  item.isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    item.isEnabled ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-bold ${
                                  item.isEnabled ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {item.isEnabled ? 'Enabled 🟢' : 'Disabled ⏸️'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{item.totalEarnings}</div>
                            <div className="text-[10px] text-slate-500">
                              {item.monthlyConversions} sales ({item.conversionRate})
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

          {/* System-wide Matching Footer */}
          <footer className="flex flex-col md:flex-row justify-between items-center px-4 py-10 w-full mt-16 font-['Inter'] text-xs text-slate-500 border-t border-slate-200/60">
            <p>© 2024 Curator Luxe Social Commerce. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Affiliate Agreement
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                TDS &amp; Tax Compliance
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Terms of Service
              </a>
              <a className="text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Fraud Prevention Policy
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* ===================== Detailed Affiliate KYC Review Modal ===================== */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-[#f8f9fb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">loyalty</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                      {activeModalItem.name} ({activeModalItem.handle})
                    </h3>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {activeModalItem.referralCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeModalItem.isEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {activeModalItem.isEnabled ? 'Active & Enabled' : 'Access Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeModalItem.platform} • {activeModalItem.followers} • {activeModalItem.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: KYC Documents & Previews */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  {['pan', 'bank', 'aadhaar'].map((docKey) => (
                    <button
                      key={docKey}
                      type="button"
                      onClick={() => setActiveDocTab(docKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeDocTab === docKey
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {docKey === 'pan' ? 'PAN Card' : docKey === 'bank' ? 'Bank Passbook' : 'Aadhaar'}
                    </button>
                  ))}
                </div>

                <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
                  {activeModalItem.documents[activeDocTab]?.image ? (
                    <img
                      src={activeModalItem.documents[activeDocTab].image}
                      alt={activeDocTab}
                      className="max-h-[320px] max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs font-semibold">
                      Document proof preview unavailable.
                    </div>
                  )}
                </div>

                {activeModalItem.documents[activeDocTab] && (
                  <div className="bg-[#f8f9fb] p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">
                        Identifier
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {activeModalItem.documents[activeDocTab].number || 'Bank Verified'}
                      </span>
                    </div>
                    {activeModalItem.documents[activeDocTab].nameOnDoc && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          Name on Document
                        </span>
                        <span className="font-bold text-slate-800">
                          {activeModalItem.documents[activeDocTab].nameOnDoc}
                        </span>
                      </div>
                    )}
                    {activeModalItem.documents[activeDocTab].pennyDrop && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          ₹1 Bank Verification Status
                        </span>
                        <span className="font-bold text-emerald-600">
                          {activeModalItem.documents[activeDocTab].pennyDrop}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Access Controls & Quick Actions */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Enable / Disable Status Card */}
                  <div className="bg-[#f8f9fb] p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        Affiliate Link Status
                      </p>
                      <p className="text-lg font-bold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                        {activeModalItem.isEnabled ? 'Active & Generating' : 'Suspended / Paused'}
                      </p>
                      {activeModalItem.disableReason && (
                        <p className="text-[11px] text-rose-600 mt-0.5">
                          {activeModalItem.disableReason}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleEnable(activeModalItem.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        activeModalItem.isEnabled
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      {activeModalItem.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  {/* Creator Stats */}
                  <div className="bg-[#f8f9fb] p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Commission Rate:</span>
                      <span className="font-bold text-slate-800">{activeModalItem.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Monthly Referrals:</span>
                      <span className="font-bold text-slate-800">{activeModalItem.monthlyConversions} Orders</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Conversion Rate:</span>
                      <span className="font-bold text-emerald-600">{activeModalItem.conversionRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Lifetime Disbursed:</span>
                      <span className="font-bold text-[#191c1e]">{activeModalItem.totalEarnings}</span>
                    </div>
                  </div>

                  {/* Channel Verification */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-950">Audience Quality Score</p>
                      <p className="text-[10px] text-emerald-700">
                        {activeModalItem.documents.channelProof?.status || 'Real Traffic Verified'}
                      </p>
                    </div>
                    <span className="text-emerald-700 font-bold">
                      {activeModalItem.documents.channelProof?.engagementRate || 'Good'}
                    </span>
                  </div>
                </div>

                {/* Bottom Decision Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRejectKyc(activeModalItem.id)}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      Reject KYC
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveKyc(activeModalItem.id)}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      Approve &amp; Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Disable Reason Confirmation Modal ===================== */}
      {showDisableModal && activeModalItem && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDisableModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600">pause_circle</span>
                <h4 className="font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Disable Affiliate #{activeModalItem.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Disabling will pause <strong>{activeModalItem.name}&apos;s</strong> tracking links, and stop
              commission accrual until re-enabled.
            </p>

            <div className="space-y-1.5">
              {[
                'Fraudulent bot traffic or click manipulation detected',
                'High customer return/RTO rate from affiliate links',
                'KYC document discrepancy or invalid tax mandate',
                'Temporary account hold requested by creator',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setDisableNote(reason)}
                  className={`w-full text-left p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    disableNote === reason
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
              value={disableNote}
              onChange={(e) => setDisableNote(e.target.value)}
              placeholder="Or enter specific reason for disabling this affiliate..."
              className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisable}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                Confirm Disable
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
