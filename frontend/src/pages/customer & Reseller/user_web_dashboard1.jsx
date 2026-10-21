import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useLogout } from '../../hooks/useLogout';
import { toast } from 'sonner';

// Real Database Services & Session Stores
import {
  getOrders,
  cancelOrder,
  getWishlist,
  toggleWishlist,
  addToCart,
  getAddresses,
  saveAddress,
  deleteAddress,
  getProducts
} from '../../services/ecommerceService';
import {
  getAffiliateApp,
  saveAffiliateApp,
  subscribeAffiliateApp
} from '../../services/affiliateSessionStore';
import {
  getStoredCustomer,
  logoutCustomer,
  subscribeCustomerAuth
} from '../../services/customerAuthService';

// Icons from lucide-react (matching admin-panel1 & seller-web-dashboard1 theme)
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Sparkles,
  Wallet,
  MapPin,
  ShieldCheck,
  Truck,
  Award,
  User,
  ExternalLink,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  ArrowRight,
  TrendingUp,
  Package,
  FileText,
  Copy,
  ChevronRight,
  DollarSign,
  Search,
  RefreshCw,
  Info,
  CreditCard,
  Building,
  Check,
  AlertTriangle,
  RotateCcw,
  Calculator,
  Sliders,
  Link2,
  HelpCircle,
  Globe,
  Send
} from 'lucide-react';

export default function UserWebDashboard1({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Bridge
  const handleNav = useCallback((target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target.startsWith('/') ? target : `/${target}`);
    }
  }, [onNavigate, navigate]);

  const validTabs = ['overview', 'affiliate', 'orders', 'wishlist', 'resale', 'wallet', 'addresses', 'profile'];

  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
    } catch (e) {}
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);

  // Sync tab if URL query changes
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch (e) {}
  }, [location.search]);

  // Real Authentication & User State (No dummy fallback credentials)
  const reduxUser = useSelector((state) => state.user?.currentUser);
  const [customerUser, setCustomerUser] = useState(() => getStoredCustomer()?.user || reduxUser || null);

  const customerName =
    customerUser?.fullName ||
    customerUser?.name ||
    customerUser?.email?.split('@')[0] ||
    'Customer';

  const customerEmail = customerUser?.email || '';
  const customerPhone = customerUser?.phone || '';

  // Logout Handler (Clears Firebase, Redux & LocalStorage)
  const firebaseLogout = useLogout('/user/login');
  const handleLogout = () => {
    logoutCustomer();
    firebaseLogout();
  };

  // Real Database Data States
  const [realOrders, setRealOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Real Wallet Balance (Persisted locally, default 0 - NO dummy 12840)
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('mshoppy_customer_wallet');
      return saved !== null ? Number(saved) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Real Wallet Transactions (Persisted locally, empty if none - NO dummy TXN entries)
  const [walletTransactions, setWalletTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('mshoppy_customer_wallet_txns');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Order Search & Filter
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [isCancelling, setIsCancelling] = useState(false);

  // Add Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    addressLine: '',
    city: '',
    state: '',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Affiliate Program Session
  const [affiliateApp, setAffiliateApp] = useState(() => getAffiliateApp());

  // Real Linked Bank (Derived from submitted affiliate/KYC data, NOT dummy ICICI Bank)
  const withdrawBank = affiliateApp?.bankName
    ? `${affiliateApp.bankName} (•••• ${affiliateApp.accountNumber ? affiliateApp.accountNumber.slice(-4) : 'XXXX'})`
    : '';

  // Real Affiliate Tracking Data
  const [affiliateStats, setAffiliateStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mshoppy_affiliate_stats');
      return saved ? JSON.parse(saved) : { totalReferredRevenue: 0, totalCommission: 0, totalOrders: 0 };
    } catch (e) {
      return { totalReferredRevenue: 0, totalCommission: 0, totalOrders: 0 };
    }
  });

  // Affiliate Calculator State
  const [calcOrders, setCalcOrders] = useState(10);
  const [calcPrice, setCalcPrice] = useState(800);
  const calculatedCommission = Math.round(calcOrders * calcPrice * 0.15);
  const calculatedAnnual = calculatedCommission * 12;

  // In-dashboard Affiliate KYC Form State (All fields empty by default - no prefill)
  const [affiliateForm, setAffiliateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    handle: '',
    panNumber: '',
    aadhaarNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [submittingAffiliate, setSubmittingAffiliate] = useState(false);

  // Subscribe to Stores
  useEffect(() => {
    const unsubAuth = subscribeCustomerAuth((session) => {
      if (session?.user) setCustomerUser(session.user);
    });
    const unsubAff = subscribeAffiliateApp((app) => setAffiliateApp(app));

    return () => {
      unsubAuth();
      unsubAff();
    };
  }, []);

  // Fetch Live Dashboard Data from Database
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, wishRes, addrRes, prodsRes] = await Promise.allSettled([
        getOrders(),
        getWishlist(),
        getAddresses(),
        getProducts({ limit: 12 })
      ]);

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setRealOrders(ordersRes.value);
      }
      if (wishRes.status === 'fulfilled' && Array.isArray(wishRes.value)) {
        setWishlistItems(wishRes.value);
      }
      if (addrRes.status === 'fulfilled' && Array.isArray(addrRes.value)) {
        setSavedAddresses(addrRes.value);
      }
      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setCatalogProducts(prodsRes.value);
      }
    } catch (err) {
      console.error('Failed to load real user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real Dynamic 7-Day Performance (Derived from real orders in database, NOT hardcoded Mon-Sun numbers)
  const { weeklyEarnings, totalResaleMargin } = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: daysOfWeek[d.getDay()],
        amount: 0,
      };
    });

    let totalMargin = 0;
    realOrders.forEach((ord) => {
      // Only count if this order has an explicit resale margin or is flagged as a resale order
      const margin = Number(ord.resaleMargin || ord.margin || ord.resellerMargin || (ord.isResale ? ord.resaleProfit : 0) || 0);
      totalMargin += margin;

      if (ord.createdAt && margin > 0) {
        const ordDate = ord.createdAt.split('T')[0];
        const matchDay = past7Days.find((p) => p.dateStr === ordDate);
        if (matchDay) {
          matchDay.amount += margin;
        }
      }
    });

    const maxDayAmt = Math.max(...past7Days.map((d) => d.amount), 0);
    const bars = past7Days.map((d) => ({
      day: d.dayName,
      amount: d.amount,
      height: maxDayAmt > 0 && d.amount > 0 ? `${Math.max(Math.round((d.amount / maxDayAmt) * 100), 12)}%` : '6%',
      peak: maxDayAmt > 0 && d.amount === maxDayAmt,
    }));

    return { weeklyEarnings: bars, totalResaleMargin: totalMargin };
  }, [realOrders]);

  // Handle Share Real Product
  const handleShareProduct = (productTitle, profit = 0) => {
    const shareText = `Check out "${productTitle}" on MShoppy! Exclusive wholesale catalog price.`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText);
      toast.success('Product link copied to clipboard!', {
        description: profit > 0 ? `Earn ₹${profit} per customer order!` : 'Share link with buyers to collect resale profit!'
      });
    } else {
      toast.info(`Sharing: ${productTitle}`);
    }
  };

  // Copy Affiliate Referral Link
  const handleCopyAffiliateLink = () => {
    const affLink = `${window.location.origin}/?ref=${affiliateApp?.applicationId || customerUser?.id || 'aff_member'}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(affLink);
      toast.success('Affiliate Referral Link Copied!', {
        description: 'Earn 15% commission on all orders placed via this link!'
      });
    }
  };

  // Submit Affiliate KYC Application
  const handleAffiliateKycSubmit = (e) => {
    e.preventDefault();
    if (!affiliateForm.fullName || !affiliateForm.panNumber || !affiliateForm.accountNumber) {
      toast.error('Please fill required legal and bank fields');
      return;
    }
    setSubmittingAffiliate(true);
    setTimeout(() => {
      const newApp = {
        ...affiliateForm,
        id: 'AFF-' + Math.floor(100000 + Math.random() * 900000),
        applicationId: 'AFF-' + Math.floor(100000 + Math.random() * 900000),
        status: 'Under Review',
        submittedAt: new Date().toISOString(),
      };
      saveAffiliateApp(newApp);
      setAffiliateApp(newApp);
      setSubmittingAffiliate(false);
      toast.success('Affiliate KYC Submitted Successfully! 🎉', {
        description: 'Your application is now under compliance review.'
      });
    }, 500);
  };


  // Handle Withdraw Form Submission (Real state & transaction ledger logging)
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (amt > walletBalance) {
      toast.error('Amount exceeds available wallet balance');
      return;
    }
    if (!withdrawBank) {
      toast.error('Please add your bank account in Affiliate or Settings before withdrawing');
      return;
    }

    const newBal = walletBalance - amt;
    setWalletBalance(newBal);
    localStorage.setItem('mshoppy_customer_wallet', String(newBal));

    const newTxn = {
      title: `Withdrawal to ${withdrawBank}`,
      ref: 'WTH-' + Date.now().toString().slice(-6),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: 'PROCESSING',
      amt: `-₹${amt.toLocaleString('en-IN')}`,
      green: false
    };

    const updatedTxns = [newTxn, ...walletTransactions];
    setWalletTransactions(updatedTxns);
    localStorage.setItem('mshoppy_customer_wallet_txns', JSON.stringify(updatedTxns));

    setShowWithdrawModal(false);
    setWithdrawAmount('');
    toast.success(`Withdrawal of ₹${amt.toLocaleString('en-IN')} initiated!`, {
      description: `Funds will be settled to ${withdrawBank}.`
    });
  };

  // Handle Order Cancellation
  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setIsCancelling(true);
      await cancelOrder(cancellingOrder.id, cancelReason);
      setRealOrders((prev) =>
        prev.map((ord) =>
          ord.id === cancellingOrder.id ? { ...ord, status: 'CANCELLED' } : ord
        )
      );
      toast.success(`Order #${cancellingOrder.id?.slice(0, 8)} cancelled successfully`);
      setCancellingOrder(null);
    } catch (err) {
      toast.error('Could not cancel order: ' + (err.message || 'Please try again'));
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Wishlist Remove & Move to Cart
  const handleRemoveWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId && item.id !== productId));
      toast.success('Removed item from Wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleMoveToCart = async (item) => {
    const prodId = item.productId || item.id;
    try {
      await addToCart(prodId, 1, item.product?.sizes?.[0] || 'Free Size');
      await toggleWishlist(prodId);
      setWishlistItems((prev) => prev.filter((w) => (w.productId || w.id) !== prodId));
      toast.success(`Moved "${item.product?.title?.slice(0, 24) || 'Product'}" to Cart! 🛒`);
    } catch (err) {
      toast.error('Failed to move item to cart');
    }
  };

  // Handle Add New Address
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode || !newAddress.addressLine) {
      toast.error('Please fill all mandatory address fields');
      return;
    }

    try {
      setSavingAddress(true);
      const res = await saveAddress(newAddress);
      const saved = res?.data || { ...newAddress, id: 'addr_' + Date.now() };
      setSavedAddresses((prev) => [saved, ...prev]);
      setShowAddressModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        pincode: '',
        addressLine: '',
        city: '',
        state: '',
        isDefault: false
      });
      toast.success('Delivery address saved successfully!');
    } catch (err) {
      toast.error('Failed to save address: ' + (err.message || 'Error occurred'));
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  // Dynamic Badges & Titles for Sidebar
  let affiliateNavTitle = 'Become an Affiliate 🤝';
  let affiliateNavBadge = 'NEW';
  let affiliateNavBadgeClass = 'bg-[#b7004d] text-white';

  if (affiliateApp) {
    if (affiliateApp.status === 'Approved' || affiliateApp.status === 'APPROVED') {
      affiliateNavTitle = 'Affiliate Partner 🤝';
      affiliateNavBadge = 'ACTIVE';
      affiliateNavBadgeClass = 'bg-emerald-600 text-white';
    } else if (affiliateApp.status === 'Rejected' || affiliateApp.status === 'REJECTED') {
      affiliateNavTitle = 'Affiliate KYC ⚠️';
      affiliateNavBadge = 'ACTION';
      affiliateNavBadgeClass = 'bg-rose-600 text-white';
    } else {
      affiliateNavTitle = 'Affiliate KYC ⏳';
      affiliateNavBadge = 'REVIEW';
      affiliateNavBadgeClass = 'bg-amber-500 text-white';
    }
  }

  // Master Sidebar Menu Items
  const customerMenuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'affiliate',
      label: affiliateNavTitle,
      icon: Award,
      badge: affiliateNavBadge,
      badgeClass: affiliateNavBadgeClass
    },
    {
      id: 'orders',
      label: 'My Orders 🛍️',
      icon: ShoppingBag,
      badge: realOrders.length > 0 ? String(realOrders.length) : null,
      badgeClass: 'bg-slate-200 text-slate-800'
    },
    {
      id: 'wishlist',
      label: 'Saved Wishlist ❤️',
      icon: Heart,
      badge: wishlistItems.length > 0 ? String(wishlistItems.length) : null,
      badgeClass: 'bg-rose-100 text-rose-700'
    },
    { id: 'resale', label: 'Resell & Earn 🚀', icon: Sparkles },
    { id: 'wallet', label: 'Wallet & Payouts 💳', icon: Wallet },
    { id: 'addresses', label: 'Saved Addresses 📍', icon: MapPin },
    {
      id: 'shopping-catalog',
      label: 'Explore Catalog',
      icon: ShoppingBag,
      children: [
        { id: 'cat-products', label: 'All Categories 🗂️', icon: Search },
        { id: 'cat-sarees', label: 'Sarees Store 🥻', icon: Sparkles },
        { id: 'cat-flash', label: 'Flash Sale Drops ⚡', icon: AlertTriangle },
        { id: 'cat-spotlight', label: 'Curator Spotlight 🌟', icon: Award },
      ],
    },
    { id: 'profile', label: 'Account Settings ⚙️', icon: User },
  ];

  // Tab switch handler with route intercept for external shopping pages
  const handleTabChange = (tabId) => {
    if (tabId === 'cat-products') {
      handleNav('/explorer');
      return;
    }
    if (tabId === 'cat-sarees') {
      handleNav('/sarees');
      return;
    }
    if (tabId === 'cat-flash') {
      handleNav('/flash');
      return;
    }
    if (tabId === 'cat-spotlight') {
      handleNav('/spotlight');
      return;
    }
    setActiveTab(tabId);
    navigate(`/user-dashboard1?tab=${tabId}`, { replace: true });
  };

  // Dynamic Page Header Helper
  const getPageHeader = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: `Welcome, ${customerName}! 👋`,
          subtitle: 'Live summary of customer orders, wallet balance, and partner programs.',
        };
      case 'affiliate':
        return {
          title: affiliateApp?.status === 'Approved' ? 'Affiliate Partner Hub 🎉' : 'Become an Affiliate Partner 🤝',
          subtitle: 'Earn up to 15% guaranteed commission by sharing curated product links with weekly bank payouts.',
        };
      case 'orders':
        return {
          title: 'My Orders & Real-Time Tracking',
          subtitle: 'View live courier milestones, download tax invoices, and manage shipment requests.',
        };
      case 'wishlist':
        return {
          title: 'Saved Wishlist & Favorites',
          subtitle: 'Your curated collection of trending styles from the live catalog.',
        };
      case 'resale':
        return {
          title: 'Resell & Earn Margin Hub',
          subtitle: 'Share live catalog collections with your network and earn resale profit margins.',
        };
      case 'wallet':
        return {
          title: 'Wallet & Bank Payouts',
          subtitle: 'Monitor your real wallet balance and initiate direct bank transfers.',
        };
      case 'addresses':
        return {
          title: 'Delivery Address Book',
          subtitle: 'Manage default shipping addresses for seamless 1-click checkout.',
        };
      case 'profile':
        return {
          title: 'Account Settings & Preferences',
          subtitle: 'Manage personal details, registered contact numbers, and security credentials.',
        };
      default:
        return { title: 'Customer & Reseller Dashboard', subtitle: '' };
    }
  };

  const headerInfo = getPageHeader();

  // Filtered orders for My Orders tab
  const filteredOrders = realOrders.filter((ord) => {
    const matchesSearch =
      !orderSearchQuery ||
      ord.id?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.items?.some((it) => it.product?.title?.toLowerCase().includes(orderSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (orderFilterStatus === 'ALL') return true;
    if (orderFilterStatus === 'DELIVERED') return ord.status === 'DELIVERED';
    if (orderFilterStatus === 'IN_TRANSIT') return ord.status === 'SHIPPED' || ord.status === 'IN_TRANSIT' || ord.status === 'OUT_FOR_DELIVERY';
    if (orderFilterStatus === 'CANCELLED') return ord.status === 'CANCELLED';
    return true;
  });

  return (
    <DashboardLayout
      menuItems={customerMenuItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      roleName="CUSTOMER"
      userName={customerName}
      pageTitle={headerInfo.title}
      pageSubtitle={headerInfo.subtitle}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-16">

        {/* =========================================================================
            TAB 1: DASHBOARD OVERVIEW
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Dynamic Real Margin Summary Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b7004d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b7004d]"></span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#8a0038]">
                  {totalResaleMargin > 0 ? (
                    <>
                      Reseller Account: Real resale margin earned on your orders is <strong className="text-[#b7004d] font-black underline">₹{totalResaleMargin.toLocaleString('en-IN')}</strong>.
                    </>
                  ) : (
                    <>
                      Resell &amp; Earn Hub: You haven't resold any products yet (<strong className="text-[#b7004d] font-black">₹0 margin</strong>). Share products from the catalog to earn profit!
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('affiliate')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Become an Affiliate 🤝</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/explorer')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Shopping Home</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Affiliate Onboarding / Status Banner */}
            {affiliateApp?.status === 'Approved' || affiliateApp?.status === 'APPROVED' ? (
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#033b23] via-slate-900 to-[#024a2f] p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/15 border border-emerald-500/30">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                      <span>Verified Affiliate Partner • Active</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Welcome, {affiliateApp.fullName || customerName}! 🎉
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      Your affiliate partner KYC has been approved! Share curated product referral links and earn up to <strong className="text-emerald-300">15% commission</strong> directly into your verified bank account.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('affiliate')}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Open Affiliate Hub</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : affiliateApp?.status === 'Rejected' || affiliateApp?.status === 'REJECTED' ? (
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-[#7f1d1d] p-5 sm:p-7 text-white shadow-xl border border-red-500/30">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-[11px] font-bold text-rose-300 border border-rose-500/30">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Affiliate KYC Action Required</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">Verification Needs Attention ⚠️</h2>
                    <p className="text-xs sm:text-sm text-slate-200">
                      Feedback: <strong className="text-rose-300">{affiliateApp.rejectionReason || 'Please verify that PAN card name matches bank account.'}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('affiliate')}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Fix &amp; Resubmit KYC</span>
                  </button>
                </div>
              </section>
            ) : affiliateApp ? (
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#260e22] via-slate-900 to-[#3d122e] p-5 sm:p-7 text-white shadow-xl border border-pink-500/30">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-300 border border-pink-500/30">
                      <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      <span>Affiliate KYC Under Review • Application #{affiliateApp.applicationId || affiliateApp.id}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">Verification In Progress ⏳</h2>
                    <p className="text-xs sm:text-sm text-slate-200">
                      Submitted for <strong className="text-white">{affiliateApp.fullName || customerName}</strong>. Compliance is verifying PAN and bank details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('affiliate')}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Check Live Status</span>
                  </button>
                </div>
              </section>
            ) : (
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170a26] via-[#320a2b] to-[#6e0034] p-5 sm:p-7 text-white shadow-2xl shadow-pink-950/20 border border-pink-500/30 ring-1 ring-white/10 group transition-all duration-300">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5 max-w-2xl">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-[#FF3F6C] via-[#df2457] to-[#b90041] text-white flex items-center justify-center shrink-0 shadow-xl ring-4 ring-white/10">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-pink-500/30 border border-pink-400/40 text-pink-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          High Commission Partner
                        </span>
                        <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Earn up to 15% Payout
                        </span>
                      </div>
                      <h3 className="font-black text-lg sm:text-2xl text-white tracking-tight">
                        Become an Affiliate Partner <span className="text-pink-300 font-normal">✦</span>
                      </h3>
                      <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                        Share curated product links with your followers and earn guaranteed weekly commissions directly into your bank account!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('affiliate')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3F6C] via-[#ea1d5d] to-[#b90041] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 shrink-0 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Become an Affiliate</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}


            {/* Stats Bento Grid (4 Cards - 100% Real Database Values) */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Orders */}
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Live Orders
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total Customer Orders</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {realOrders.length}
                  </h3>
                </div>
              </div>

              {/* Card 2: In-Transit / Active Shipments */}
              <div
                onClick={() => {
                  setOrderFilterStatus('IN_TRANSIT');
                  setActiveTab('orders');
                }}
                className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Tracking Active
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">In Transit &amp; Shipped</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {realOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
                  </h3>
                </div>
              </div>

              {/* Card 3: Wishlist Count */}
              <div
                onClick={() => setActiveTab('wishlist')}
                className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                    Saved Items
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Saved Wishlist</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {wishlistItems.length}
                  </h3>
                </div>
              </div>

              {/* Card 4: Real Wallet Balance */}
              <div className="bg-gradient-to-br from-[#b7004d] via-[#cf125d] to-[#e62973] text-white p-5 rounded-3xl shadow-lg shadow-pink-600/20 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(true)}
                    className="text-[10px] font-black uppercase tracking-wider bg-white hover:bg-pink-50 text-[#b7004d] px-3 py-1 rounded-full shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  >
                    Withdraw
                  </button>
                </div>
                <div>
                  <p className="text-xs font-semibold text-pink-100">Wallet Balance</p>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    ₹{walletBalance.toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>
            </section>

            {/* Real Orders & 7-Day Performance Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reseller Earnings Real Chart */}
              <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Reseller Performance</h3>
                    <p className="text-xs text-slate-400">Past 7 Days Resale Earnings</p>
                  </div>
                  <span className="text-[11px] font-black bg-pink-50 text-[#b7004d] px-3 py-1 rounded-full border border-pink-100">
                    ₹{totalResaleMargin.toLocaleString('en-IN')} Total
                  </span>
                </div>

                {totalResaleMargin === 0 ? (
                  <div className="py-6 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center space-y-2.5 my-auto">
                    <div className="w-10 h-10 rounded-2xl bg-pink-100/70 text-[#b7004d] flex items-center justify-center mx-auto">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">No Resale Margin Yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        You haven't resold any products yet. Share items from the Resell &amp; Earn catalog with your margin to earn profit payouts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('resale')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Explore Resell Catalog</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  /* Real Dynamic Bars */
                  <div className="flex items-end justify-between gap-2 h-44 pb-2">
                    {weeklyEarnings.map((bar, idx) => (
                      <div
                        key={idx}
                        onClick={() => toast.info(`${bar.day}: ₹${bar.amount} earned`)}
                        className="flex flex-col items-center flex-1 gap-2 cursor-pointer group"
                        title={`${bar.day}: ₹${bar.amount}`}
                      >
                        <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden flex items-end h-32">
                          <div
                            className={`w-full rounded-t-xl transition-all duration-300 group-hover:opacity-80 ${
                              bar.amount > 0
                                ? 'bg-gradient-to-t from-[#b7004d] to-[#ff4b7d] shadow-md shadow-pink-500/30'
                                : 'bg-slate-200'
                            }`}
                            style={{ height: bar.height }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${bar.peak ? 'text-[#b7004d] font-black' : 'text-slate-500'}`}>
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Margin</p>
                    <p className="text-lg font-black text-slate-900">₹{totalResaleMargin.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Rate</p>
                    <p className="text-lg font-black text-emerald-600">{totalResaleMargin > 0 ? '15%' : '0%'}</p>
                  </div>
                </div>
              </div>

              {/* Recent Real Orders Overview */}
              <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Recent Customer Orders</h3>
                    <p className="text-xs text-slate-400">Live parcel fulfillment status from database</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#b7004d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {realOrders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold">No recent customer orders found</p>
                    <button
                      type="button"
                      onClick={() => handleNav('/explorer')}
                      className="px-4 py-2 bg-pink-50 text-[#b7004d] hover:bg-pink-100 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[500px]">
                      <thead>
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Product / Items</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Total Amount</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-100">
                        {realOrders.slice(0, 5).map((order) => {
                          const firstItem = order.items?.[0];
                          const title = firstItem?.product?.title || 'Customer Retail Order';
                          const statusColor =
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                          return (
                            <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 font-mono font-bold text-slate-600">
                                #{order.id?.slice(0, 8)}
                              </td>
                              <td className="py-3.5 font-medium text-slate-900 max-w-[200px] truncate">
                                {title}
                                {order.items?.length > 1 && (
                                  <span className="text-[10px] text-slate-400 ml-1">
                                    +{order.items.length - 1} more
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${statusColor}`}>
                                  {order.status || 'PLACED'}
                                </span>
                              </td>
                              <td className="py-3.5 font-bold text-slate-900">
                                ₹{order.totalAmount || order.total || 0}
                              </td>
                              <td className="py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('orders')}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#b7004d] cursor-pointer"
                                  title="View Details"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Live Database Products for Resale (Zero dummy hardcoded cards) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Available Products to Resell</h3>
                  <p className="text-xs text-slate-400">Live products from suppliers available for markup</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('resale')}
                  className="text-xs font-bold text-[#b7004d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Resale Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {catalogProducts.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No live catalog products available currently.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {catalogProducts.slice(0, 4).map((prod) => {
                    const title = prod.title || prod.name || 'Catalog Product';
                    const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400';
                    const priceNum = Number(prod.price || 0);
                    const profit = Math.round(priceNum * 0.2);
                    const tag = prod.category?.name || 'Catalog';

                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleShareProduct(title, profit)}
                            className="absolute bottom-3 right-3 h-9 w-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#b7004d] shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                            title="Share & Earn Profit"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tag}</p>
                            <h4 className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-[#b7004d] cursor-pointer mt-0.5">
                              {title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase">Wholesale Price</span>
                              <span className="text-base font-black text-[#b7004d]">₹{priceNum}</span>
                            </div>
                            {profit > 0 && (
                              <div className="text-right">
                                <span className="text-[9px] font-semibold text-slate-400 block uppercase">Estimated Margin</span>
                                <span className="text-xs font-black text-emerald-600">+₹{profit}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}

        {/* =========================================================================
            TAB 2: BECOME AN AFFILIATE
        ========================================================================= */}
        {activeTab === 'affiliate' && (
          <div className="space-y-6">

            {/* If Approved */}
            {affiliateApp?.status === 'Approved' || affiliateApp?.status === 'APPROVED' ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#005a2b] p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-emerald-500/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified Affiliate Partner • Active</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNav('/affiliate-panel')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      Open Full Affiliate Dashboard ➔
                    </button>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Welcome, {affiliateApp.fullName || customerName}!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Your affiliate ID is active. You earn <strong className="text-emerald-300">15% commission</strong> on every order placed through your link.
                    </p>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Your Unique Referral Link:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 bg-black/40 border border-white/20 rounded-2xl px-4 py-2.5 font-mono text-xs sm:text-sm text-emerald-300 truncate flex items-center">
                        {`${window.location.origin}/?ref=${affiliateApp.applicationId || 'aff_verified'}`}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAffiliateLink}
                        className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real Affiliate Performance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Total Referred Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{affiliateStats.totalReferredRevenue.toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-emerald-600 font-bold">{affiliateStats.totalOrders} Orders</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Total Commission Earned</p>
                    <h3 className="text-2xl font-black text-emerald-600">₹{affiliateStats.totalCommission.toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-slate-500">15% Commission Rate</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Settlement Bank</p>
                    <h3 className="text-base font-bold text-slate-900 truncate">{withdrawBank || 'Bank Not Linked'}</h3>
                    <p className="text-[11px] text-indigo-600 font-bold">Weekly Direct IMPS</p>
                  </div>
                </div>
              </div>
            ) : affiliateApp?.status === 'Under Review' || affiliateApp?.status === 'REVIEW' ? (
              /* If Under Review */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-[#78350f] p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-amber-500/30 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Clock className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Application Under Compliance Review • #{affiliateApp.applicationId || affiliateApp.id}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Your Affiliate Application is Being Verified ⏳
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Thank you for applying, <strong className="text-white">{affiliateApp.fullName}</strong>! Our compliance desk is reviewing your PAN and bank verification details.
                    </p>
                  </div>

                  {/* Timeline Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">1. Form Submitted</p>
                        <p className="text-[10px] text-emerald-300">Completed</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">2. KYC Verification</p>
                        <p className="text-[10px] text-amber-300">In Progress</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3 opacity-60">
                      <Award className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">3. Referral Activation</p>
                        <p className="text-[10px] text-slate-400">Pending Approval</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitted Data Summary */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">Submitted Application Records:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant</span>
                      <strong className="text-slate-900">{affiliateApp.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Social Handle</span>
                      <strong className="text-slate-900">{affiliateApp.handle || 'None'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN Number</span>
                      <strong className="font-mono text-slate-900">{affiliateApp.panNumber || 'Submitted'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
                      <strong className="text-slate-900">{affiliateApp.bankName || 'Submitted'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If Not Registered: Clean Pitch + Calculator + Fast Application */
              <div className="space-y-6">

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170a26] via-[#320a2b] to-[#6e0034] p-6 sm:p-10 text-white shadow-2xl border border-pink-500/30">
                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase text-pink-200 border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                      <span>Official Affiliate Partner Program • 0 Investment</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                      Earn Up To 15% Commission On Every Referral! 🚀
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      Share curated Meesho catalog links; when anyone purchases, your commission is credited directly to your bank account every Thursday!
                    </p>
                  </div>
                </div>

                {/* 4 Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Up to 15% Payout</h4>
                    <p className="text-xs text-slate-500">Guaranteed commission on all delivered customer purchases.</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Weekly Thursday Payouts</h4>
                    <p className="text-xs text-slate-500">Automated direct transfers straight into your verified bank account.</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">30-Day Cookie Window</h4>
                    <p className="text-xs text-slate-500">Purchases made within 30 days of clicking are credited to you.</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">1-Click Link Sharing</h4>
                    <p className="text-xs text-slate-500">Instant share with your followers and network.</p>
                  </div>
                </div>

                {/* Interactive Commission Calculator */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">Interactive Earnings Calculator</h3>
                        <p className="text-xs text-slate-400">Estimate your affiliate earning potential</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      15% Fixed Payout
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">Projected Orders Per Month</label>
                          <span className="font-black text-sm text-[#b7004d]">{calcOrders} Orders</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="200"
                          step="5"
                          value={calcOrders}
                          onChange={(e) => setCalcOrders(Number(e.target.value))}
                          className="w-full accent-[#b7004d] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">Average Product Price</label>
                          <span className="font-black text-sm text-[#b7004d]">₹{calcPrice}</span>
                        </div>
                        <input
                          type="range"
                          min="300"
                          max="2500"
                          step="50"
                          value={calcPrice}
                          onChange={(e) => setCalcPrice(Number(e.target.value))}
                          className="w-full accent-[#b7004d] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl space-y-4 shadow-md">
                      <div>
                        <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Estimated Monthly Income</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
                          ₹{calculatedCommission.toLocaleString('en-IN')}
                        </h2>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                        <span className="text-slate-300">Annual Projection:</span>
                        <strong className="text-base font-black text-white">
                          ₹{calculatedAnnual.toLocaleString('en-IN')} / year
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Multi-Step Affiliate KYC Onboarding Banner */}
                <div className="bg-gradient-to-br from-white via-pink-50/20 to-slate-50 p-6 sm:p-8 rounded-3xl border border-pink-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b7004d] to-[#ff4b7d] text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700 border border-emerald-200/60 uppercase tracking-wider mb-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Official 4-Step Digital Verification</span>
                        </div>
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                          Complete Your Affiliate KYC Verification 🛡️
                        </h3>
                        <p className="text-xs text-slate-500">
                          Securely link your Government ID and Bank/UPI details to activate up to 15% weekly payouts
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleNav('/affiliate-kyc-status')}
                        className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Check Status
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNav('/affiliate-kyc')}
                        className="px-6 py-2.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-pink-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>Start Official KYC ➔</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Steps Visual Flow */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#b7004d] bg-pink-50 px-2 py-0.5 rounded-md">STEP 1</span>
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Personal Info</h4>
                      <p className="text-[11px] text-slate-400">Full legal name, phone & communication address.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">STEP 2</span>
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Government ID</h4>
                      <p className="text-[11px] text-slate-400">Instant PAN card & Aadhaar document upload.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">STEP 3</span>
                        <CreditCard className="w-4 h-4 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Bank &amp; UPI Setup</h4>
                      <p className="text-[11px] text-slate-400">Verified bank account or UPI ID for direct IMPS settlements.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">STEP 4</span>
                        <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">Review &amp; Approval</h4>
                      <p className="text-[11px] text-slate-400">Fast digital verification within 24 business hours.</p>
                    </div>
                  </div>

                  {/* Trust & Compliance Bar */}
                  <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>100% Secure &amp; Paperless:</strong> Your documents are encrypted and protected as per RBI guidelines.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNav('/affiliate-kyc')}
                      className="text-xs font-bold text-[#b7004d] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Open 4-Step Verification Form</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 3: MY ORDERS
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID or product title..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#b7004d]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All Orders' },
                  { id: 'IN_TRANSIT', label: 'In Transit 🚚' },
                  { id: 'DELIVERED', label: 'Delivered ✅' },
                  { id: 'CANCELLED', label: 'Cancelled ❌' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setOrderFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      orderFilterStatus === st.id
                        ? 'bg-[#b7004d] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No Orders Found</h4>
                <p className="text-xs text-slate-400">You do not have any orders matching the current filter.</p>
                <button
                  type="button"
                  onClick={() => handleNav('/explorer')}
                  className="px-4 py-2 bg-pink-50 text-[#b7004d] rounded-xl text-xs font-bold hover:bg-pink-100 cursor-pointer transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === 'DELIVERED';
                  const isCancelled = order.status === 'CANCELLED';
                  const isPending = !isDelivered && !isCancelled;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-pink-200 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            #{order.id?.slice(0, 10)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {order.status || 'PROCESSING'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(order.items || []).map((item, idx) => {
                          const p = item.product || {};
                          const img = p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200';
                          return (
                            <div key={idx} className="flex items-center gap-3.5">
                              <img
                                src={img}
                                alt={p.title || 'Product'}
                                className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200/60 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm text-slate-900 truncate">
                                  {p.title || 'Product Item'}
                                </h5>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                  <span>Qty: {item.quantity || 1}</span>
                                  <span>•</span>
                                  <span>Size: {item.size || 'Free Size'}</span>
                                  <span>•</span>
                                  <span className="font-bold text-slate-900">₹{item.price || p.price || 0}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="text-slate-600">
                          <span>Total Amount: </span>
                          <strong className="text-sm font-black text-slate-900">
                            ₹{order.totalAmount || order.total || 0}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              toast.info(`Downloading Tax Invoice for #${order.id?.slice(0, 8)}... 📄`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Invoice</span>
                          </button>

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => setCancellingOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {isDelivered && (
                            <button
                              type="button"
                              onClick={() => handleNav('/return-request')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Return / Exchange</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 5: SAVED WISHLIST
        ========================================================================= */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Saved Items ({wishlistItems.length})</h3>
                <p className="text-xs text-slate-400">Items pinned to your wishlist</p>
              </div>
              <button
                type="button"
                onClick={() => handleNav('/explorer')}
                className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#b7004d] rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Explore Catalog</span>
              </button>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                <Heart className="w-12 h-12 text-rose-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Wishlist is Empty</h4>
                <p className="text-xs text-slate-400">Pin items while shopping to track them here.</p>
                <button
                  type="button"
                  onClick={() => handleNav('/explorer')}
                  className="px-5 py-2.5 bg-[#b7004d] text-white rounded-xl text-xs font-bold hover:bg-[#96003f] cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlistItems.map((item) => {
                  const prod = item.product || item;
                  const prodId = item.productId || item.id;
                  const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400';
                  const title = prod.title || 'Product';
                  const price = prod.price ? `₹${prod.price}` : '₹0';

                  return (
                    <div
                      key={prodId}
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-48 bg-slate-100">
                        <img src={img} alt={title} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveWishlist(prodId)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-rose-500 hover:text-rose-700 shadow-xs cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{title}</h4>
                          <p className="text-base font-black text-[#b7004d] mt-1">{price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(item)}
                          className="w-full py-2 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 6: RESELL & EARN (Real Catalog Only)
        ========================================================================= */}
        {activeTab === 'resale' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase text-purple-200">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Zero Capital Reseller Network</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Share Catalog Products &amp; Keep The Markup</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Add your resale profit margin to any product in our live catalog, share photos and descriptions with buyers, and collect margin payouts directly into your bank.
              </p>
            </div>

            {catalogProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No live catalog products to display right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {catalogProducts.map((p) => {
                  const title = p.title || p.name || 'Catalog Product';
                  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400';
                  const price = Number(p.price || 0);
                  const profit = Math.round(price * 0.2);

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-48 bg-slate-100">
                        <img src={img} alt={title} className="w-full h-full object-cover" />
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{p.category?.name || 'Category'}</p>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{title}</h4>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Wholesale: <strong className="text-slate-700">₹{price}</strong></span>
                            {profit > 0 && <span className="font-bold text-emerald-600">+₹{profit} Margin</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleShareProduct(title, profit)}
                            className="w-full py-2 bg-gradient-to-r from-[#b7004d] to-[#e62973] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share Link</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 7: WALLET & PAYOUTS (Real Balance & Ledger Only)
        ========================================================================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-gradient-to-br from-[#b7004d] via-[#cf125d] to-[#e62973] text-white p-6 rounded-3xl shadow-lg shadow-pink-600/20 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="font-black text-sm tracking-wide">MShoppy Fintech Balance</h4>
                  <p className="text-xs text-pink-100">Real Cash Wallet</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-pink-100">Available For Instant Withdrawal</p>
                  <h2 className="text-3xl sm:text-4xl font-black mt-1">
                    ₹{walletBalance.toLocaleString('en-IN')}
                  </h2>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-6 py-2.5 bg-white text-[#b7004d] font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-pink-50 cursor-pointer"
                  >
                    Withdraw to Bank Account 🏦
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <Building className="w-8 h-8 text-[#b7004d]" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Settlement Bank</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {withdrawBank || 'No Bank Account Linked Yet'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('affiliate')}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {withdrawBank ? 'Update Bank Account' : 'Link Bank Account'}
                </button>
              </div>
            </div>

            {/* Real Wallet Ledger */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Wallet Transaction Ledger</h3>
                  <p className="text-xs text-slate-400">All margin credits and withdrawal requests</p>
                </div>
              </div>

              {walletTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No wallet transactions recorded yet. Resale margin credits and withdrawal requests will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-3">Transaction</th>
                        <th className="pb-3">Reference</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100">
                      {walletTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 font-semibold text-slate-900">{tx.title}</td>
                          <td className="py-3 font-mono text-slate-400 text-[11px]">{tx.ref}</td>
                          <td className="py-3 text-slate-500 text-[11px]">{tx.date}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {tx.status}
                            </span>
                          </td>
                          <td className={`py-3 text-right font-black ${tx.green ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.amt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: SAVED ADDRESSES (Real Database Records Only)
        ========================================================================= */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Delivery Addresses ({savedAddresses.length})</h3>
                <p className="text-xs text-slate-400">Locations saved for 1-click doorstep delivery</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2 bg-[#b7004d] hover:bg-[#96003f] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No Addresses Saved</h4>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-pink-50 text-[#b7004d] rounded-xl text-xs font-bold hover:bg-pink-100 cursor-pointer"
                >
                  Add Address Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{addr.fullName || customerName}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#b7004d] text-[9px] font-black uppercase border border-pink-100">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.addressLine}, {addr.city}, {addr.state} - <strong className="text-slate-800">{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-slate-500">Phone: {addr.phone || 'N/A'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Standard Delivery</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 9: PROFILE & SETTINGS
        ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 max-w-3xl">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#b7004d] to-[#ff6584] text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{customerName}</h3>
                  <p className="text-xs text-slate-500">{customerEmail || 'No email registered'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-[#b7004d] text-[10px] font-black uppercase border border-pink-100">
                    Verified Customer &amp; Reseller
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled
                    value={customerName}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registered Phone</label>
                  <input
                    type="text"
                    disabled
                    value={customerPhone || 'Not Provided'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={customerEmail || 'Not Provided'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value="Shopper, Dropshipper & Reseller"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">To end your session safely:</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Logout Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODALS
      ========================================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900">Withdraw Resale Earnings</h3>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Destination: <span className="font-bold text-slate-800">{withdrawBank || 'No bank linked'}</span>
                </p>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-700 text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={walletBalance}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-8 pr-4 font-black text-base focus:outline-none focus:ring-2 focus:ring-[#b7004d]"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Available: ₹{walletBalance.toLocaleString('en-IN')}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletBalance <= 0 || !withdrawBank}
                  className="flex-1 py-2.5 rounded-2xl bg-[#b7004d] hover:bg-[#96003f] text-white font-bold text-xs shadow-md shadow-pink-500/25 cursor-pointer disabled:opacity-50"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900">Cancel Order #{cancellingOrder.id?.slice(0, 8)}</h3>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">Please choose a cancellation reason:</p>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#b7004d]"
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Incorrect delivery address">Incorrect delivery address</option>
                <option value="Delayed shipment expectation">Delayed shipment expectation</option>
                <option value="Other">Other reasons</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900">Add Delivery Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Receiver's name"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode *</label>
                  <input
                    type="text"
                    placeholder="6-digit pin"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address / House No. *</label>
                <input
                  type="text"
                  placeholder="Flat, Road, Area"
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded text-[#b7004d]"
                />
                <span className="text-slate-600 font-medium">Set as default delivery address</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 py-2.5 rounded-2xl bg-[#b7004d] hover:bg-[#96003f] text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
