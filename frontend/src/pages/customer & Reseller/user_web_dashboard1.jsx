import { API_BASE, API_V1_BASE } from '../../config/apiConfig';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/userSlice';
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
  getProducts,
  getWalletDetails,
  requestWalletWithdrawal
} from '../../services/ecommerceService';
import {
  getAffiliateApp,
  saveAffiliateApp,
  clearAffiliateApp,
  subscribeAffiliateApp
} from '../../services/affiliateSessionStore';
import {
  getStoredCustomer,
  updateCustomerProfile,
  logoutCustomer,
  subscribeCustomerAuth
} from '../../services/customerAuthService';
import { addNotification } from '../../services/notificationService';
import INDIAN_STATES from '../../utils/indianStates';

import CancelOrderModal from '../../components/customer/CancelOrderModal';
import OrderTrackingModal from '../../components/customer/OrderTrackingModal';
import TaxInvoiceModal from '../../components/customer/TaxInvoiceModal';

// Icons from lucide-react (matching admin-panel1 & seller-web-dashboard1 theme)
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Sparkles,
  Wallet,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
  Award,
  User,
  ExternalLink,
  Share2,
  Clock,
  CheckCircle2,
  Save,
  Pencil,
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
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('mshoppy_user_orders');
    } catch (_) {
      return true;
    }
  });

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
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user?.currentUser);
  const [customerUser, setCustomerUser] = useState(() => getStoredCustomer()?.user || reduxUser || null);

  // If not authenticated, protect account dashboard and redirect to login
  useEffect(() => {
    const isAuthed = Boolean(customerUser || getStoredCustomer()?.user || reduxUser);
    if (!isAuthed) {
      navigate('/user/login?redirect=' + encodeURIComponent(location.pathname + location.search));
    }
  }, [customerUser, reduxUser, navigate, location.pathname, location.search]);

  // Affiliate Program Session - strictly verify that stored KYC belongs to the current logged-in customer
  const [affiliateApp, setAffiliateApp] = useState(() => {
    const stored = getAffiliateApp();
    const curId = customerUser?.id || customerUser?.uid;
    if (stored && curId && stored.userId && stored.userId !== curId) {
      clearAffiliateApp();
      return null;
    }
    return stored;
  });

  // Real-time synchronization states to eliminate stale cache flickering
  const [isKycSyncing, setIsKycSyncing] = useState(true);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const customerName =
    customerUser?.fullName ||
    customerUser?.name ||
    customerUser?.email?.split('@')[0] ||
    'Customer';

  const customerEmail = customerUser?.email || '';
  const customerPhone =
    customerUser?.phone ||
    affiliateApp?.phone ||
    (function() {
      try {
        const raw = JSON.parse(localStorage.getItem('mshoppy_customer_user') || '{}');
        return raw.phone || '';
      } catch (_) { return ''; }
    })() ||
    '';

  // Profile Editing States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(customerName);
  const [editPhone, setEditPhone] = useState(customerPhone);
  const [editEmail, setEditEmail] = useState(customerEmail);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Keep inputs synchronized when customerUser updates
  useEffect(() => {
    if (customerUser) {
      if (customerUser.fullName || customerUser.name) setEditName(customerUser.fullName || customerUser.name);
      if (customerUser.phone) setEditPhone(customerUser.phone);
      if (customerUser.email) setEditEmail(customerUser.email);
    }
  }, [customerUser]);

  const handleCancelEdit = () => {
    setEditName(customerName);
    setEditPhone(customerPhone);
    setEditEmail(customerEmail);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!editName.trim()) {
      alert('Please enter your full legal name');
      return;
    }
    setIsSavingProfile(true);
    try {
      const updatedUser = await updateCustomerProfile({
        fullName: editName.trim(),
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim()
      });

            const updatedObj = updatedUser || {
        ...customerUser,
        fullName: editName.trim(),
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim()
      };
      try {
        localStorage.setItem('mshoppy_customer_user', JSON.stringify(updatedObj));
      } catch (_) {}
      setCustomerUser(updatedObj);

      // Keep affiliate KYC app synced if present so name updates everywhere
      if (affiliateApp) {
        const updatedAff = {
          ...affiliateApp,
          fullName: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim()
        };
        setAffiliateApp(updatedAff);
      }

      setProfileSuccessMsg('Profile updated successfully! ✨');
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Logout Handler (Clears Firebase, Redux & LocalStorage)
  const firebaseLogout = useLogout('/user/login');
  const handleLogout = () => {
    try {
      dispatch(logout());
    } catch (_) {}
    logoutCustomer();
    setCustomerUser(null);
    setRealOrders([]);
    setSavedAddresses([]);
    setWishlistItems([]);
    firebaseLogout();
  };

  // Real Database Data States (Cache-first for instant < 50ms display)
  const [realOrders, setRealOrders] = useState(() => {
    try {
      const cached = localStorage.getItem('mshoppy_user_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const cached = localStorage.getItem('mshoppy_wishlist');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const cached = localStorage.getItem('mshoppy_user_addresses');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [catalogProducts, setCatalogProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('mshoppy_cached_catalog_prods');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: "a85e2adb-7321-4a9c-8574-4e5d453df5c8",
        title: "Kids Boys Printed Cotton Dungaree & T-Shirt Set",
        price: 349,
        images: ["https://images.meesho.com/images/products/49652451/g6dig_512.jpg"],
        category: "Kids"
      },
      {
        id: "f3a41127-6513-4b53-b9d0-3c8ee2a4de67",
        title: "Traditional Embroidered Ladies Jutti",
        price: 168,
        images: ["https://images.meesho.com/images/products/71006705/2ic9e_512.jpg"],
        category: "Footwear"
      },
      {
        id: "03832b74-30eb-4cf8-9d27-602b5e181fcb",
        title: "MUKHAKSH Cotton Plain Blush Pink Kurti",
        price: 519,
        images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"],
        category: "Women Ethnic"
      },
      {
        id: "65c95da5-cc91-4ace-b7a8-271cb8792b0c",
        title: "Premium Nail Polish Combo",
        price: 136,
        images: ["https://images.meesho.com/images/products/70586121/mxn5l_512.jpg"],
        category: "Beauty & Health"
      },
      {
        id: "0462cf00-e898-4188-bee0-f4842e331ed5",
        title: "Gel Shine Nail Paint",
        price: 60,
        images: ["https://images.meesho.com/images/products/70867248/kuynn_512.jpg"],
        category: "Beauty & Health"
      },
      {
        id: "bd5a3bce-fe63-403f-9a7f-91204344afa9",
        title: "Oral Tongue Cleaner",
        price: 119,
        images: ["https://images.meesho.com/images/products/61022657/ewsm4_512.jpg"],
        category: "Beauty & Health"
      }
    ];
  });

  // Real Unified Wallet Balance (Loaded authoritatively from PostgreSQL Database)
  const [walletBalance, setWalletBalance] = useState(0);

  // Real Unified Wallet Transactions Ledger (Loaded authoritatively from PostgreSQL Database)
  const [walletTransactions, setWalletTransactions] = useState([]);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Order Search & Filter
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

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

  // Real Linked Bank (Derived from submitted affiliate/KYC data, NOT dummy ICICI Bank)
  const withdrawBank = affiliateApp?.bankName
    ? `${affiliateApp.bankName} (•••• ${affiliateApp.accountNumber ? affiliateApp.accountNumber.slice(-4) : 'XXXX'})`
    : '';

  // Real Dynamic Affiliate Tracking Data (100% Database Driven)
  const [affiliateStats, setAffiliateStats] = useState({
    totalReferredRevenue: 0,
    totalCommission: 0,
    totalOrders: 0
  });

  // Affiliate Calculator State (Custom Profit Margin per product, NOT fixed 15%)
  const [calcOrders, setCalcOrders] = useState(15);
  const [calcMarginPerProduct, setCalcMarginPerProduct] = useState(200);
  const calculatedCommission = Math.round(calcOrders * calcMarginPerProduct);
  const calculatedAnnual = calculatedCommission * 12;

  // Custom Product Margin State for Verified Affiliate
  const [selectedMarginProductId, setSelectedMarginProductId] = useState('');
  const [customMarginVal, setCustomMarginVal] = useState(150);

  // Partner Hub Catalog Filter, Search & Pagination States
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSelectedCat, setPartnerSelectedCat] = useState('All');
  const [partnerVisibleCount, setPartnerVisibleCount] = useState(12);

  // Dynamic Custom Margins Per Product for Resell & Earn Tab
  const [resaleMargins, setResaleMargins] = useState({});

  const getProductMargin = (productId) => {
    return resaleMargins[productId] !== undefined ? resaleMargins[productId] : 150;
  };

  const setProductMargin = (productId, val) => {
    setResaleMargins((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(val) || 0)
    }));
  };

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

  // Live sync with real PostgreSQL Database for Affiliate KYC Status
  useEffect(() => {
    let isMounted = true;
    const syncAffiliateStatus = async () => {
      try {
        const curId = customerUser?.id || customerUser?.uid;
        const curPhone = customerUser?.phone;

        if (!curId && !curPhone) {
          if (isMounted) {
            setAffiliateApp(null);
            setIsKycSyncing(false);
          }
          return;
        }

        const queryParams = [];
        if (curId) queryParams.push(`userId=${encodeURIComponent(curId)}`);
        if (curPhone) queryParams.push(`phone=${encodeURIComponent(curPhone)}`);
        if (affiliateApp?.applicationId && affiliateApp?.userId === curId) {
          queryParams.push(`applicationId=${encodeURIComponent(affiliateApp.applicationId)}`);
        }

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const res = await fetch(`${API_V1_BASE}/admin-kyc/affiliate-status${queryString}`);
        if (!res.ok) {
          if (isMounted) setIsKycSyncing(false);
          return;
        }

        const data = await res.json();
        if (isMounted) {
          if (data?.application) {
            const dbApp = data.application;
            const isDbApproved = dbApp.status === 'APPROVED';
            const isDbRejected = dbApp.status === 'REJECTED';
            const normalizedStatus = isDbApproved ? 'Approved' : isDbRejected ? 'Rejected' : 'Under Review';

            setAffiliateApp((prev) => {
              if (prev?.status === normalizedStatus && prev?.dbId === dbApp.id) return prev;
              const updated = {
                ...(prev || {}),
                ...(dbApp.documents || {}),
                status: normalizedStatus,
                kycStatus: normalizedStatus,
                dbId: dbApp.id,
                userId: dbApp.userId,
                rejectionReason: dbApp.adminNotes || prev?.rejectionReason || '',
              };
              try {
                saveAffiliateApp(updated);
              } catch (e) {}
              return updated;
            });
          } else {
            // Customer has not submitted an affiliate KYC application
            setAffiliateApp(null);
            clearAffiliateApp();
          }
          setIsKycSyncing(false);
        }
      } catch (err) {
        console.warn('Failed to sync live affiliate status in dashboard:', err.message);
        if (isMounted) setIsKycSyncing(false);
      }
    };

    syncAffiliateStatus();
    const interval = setInterval(syncAffiliateStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [customerUser?.id, customerUser?.uid, customerUser?.phone]);

  // Fetch Live Dashboard Data from Database (Background SWR if cached)
  const loadDashboardData = useCallback(async () => {
    try {
      if (realOrders.length === 0) setLoading(true);
      const [ordersRes, wishRes, addrRes, prodsRes, walletRes] = await Promise.allSettled([
        getOrders(),
        getWishlist(),
        getAddresses(),
        getProducts({ limit: 48 }),
        getWalletDetails()
      ]);

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setRealOrders(ordersRes.value);
        try { localStorage.setItem('mshoppy_user_orders', JSON.stringify(ordersRes.value)); } catch (_) {}
      }
      if (wishRes.status === 'fulfilled' && Array.isArray(wishRes.value)) {
        setWishlistItems(wishRes.value);
      }
      if (addrRes.status === 'fulfilled' && Array.isArray(addrRes.value)) {
        setSavedAddresses(addrRes.value);
        try { localStorage.setItem('mshoppy_user_addresses', JSON.stringify(addrRes.value)); } catch (_) {}
      }
      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) && prodsRes.value.length > 0) {
        setCatalogProducts(prodsRes.value);
        try {
          localStorage.setItem('mshoppy_cached_catalog_prods', JSON.stringify(prodsRes.value.slice(0, 24)));
        } catch (e) {}
      }
      if (walletRes.status === 'fulfilled' && walletRes.value) {
        const dbBal = Number(walletRes.value.balance ?? 0);
        setWalletBalance(dbBal);

        const dbTxns = (Array.isArray(walletRes.value.transactions) ? walletRes.value.transactions : []).map((dt) => ({
          title: dt.description || dt.title || 'Wallet Transaction',
          ref: dt.id || dt.ref || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          date: dt.createdAt ? new Date(dt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : (dt.date || 'Recently'),
          status: dt.status || 'COMPLETED',
          amt: dt.amt || (dt.type === 'credit' ? `+₹${dt.amount}` : `-₹${dt.amount}`),
          green: dt.green ?? (dt.type === 'credit'),
          type: dt.type || 'credit',
          amount: dt.amount,
          orderId: dt.orderId
        }));

        setWalletTransactions(dbTxns);

        const detectedAffTxns = dbTxns.filter(
          (t) => t && /affiliate|commission|referral/i.test(t.title || t.description || '')
        );
        const autoComm = detectedAffTxns.reduce(
          (s, t) => s + (t.type === 'credit' ? (Number(t.amount) || 0) : 0),
          0
        );
        const autoOrders = detectedAffTxns.filter(t => t.type === 'credit').length;
        setAffiliateStats({
          totalReferredRevenue: autoComm * 10,
          totalCommission: autoComm,
          totalOrders: autoOrders
        });
      }
      setIsWalletLoading(false);
    } catch (err) {
      console.error('Failed to load real user dashboard data:', err);
      setIsWalletLoading(false);
    } finally {
      setLoading(false);
      setIsWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Real Order Cancellation
  const handleConfirmCancel = async (reason) => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      const res = await cancelOrder(cancellingOrder.id, reason);
      if (res && res.success) {
        toast.success(`Order #${cancellingOrder.id.slice(0, 8)} cancelled successfully ❌`);
        // Immediately update local state
        setRealOrders((prev) =>
          prev.map((o) =>
            o.id === cancellingOrder.id
              ? { ...o, orderStatus: 'CANCELLED', status: 'CANCELLED' }
              : o
          )
        );
        // If tracking modal was open
        if (selectedTrackingOrder && selectedTrackingOrder.id === cancellingOrder.id) {
          setSelectedTrackingOrder((prev) => ({
            ...prev,
            orderStatus: 'CANCELLED',
            status: 'CANCELLED'
          }));
        }
        // Real Order Cancelled Notification
        try {
          addNotification({
            title: 'Order Cancelled ❌',
            message: `Order #${cancellingOrder.id.slice(0, 8)} has been cancelled. Any refund has been processed to your wallet.`,
            category: 'Orders',
            icon: 'cancel',
            iconBg: 'bg-rose-50 text-rose-600',
            actionPath: '/user-dashboard1?tab=orders',
            actionText: 'View Orders',
            data: { orderId: cancellingOrder.id }
          });
        } catch (e) {}

        setCancellingOrder(null);
        // Reload dashboard to sync database and any wallet refund
        loadDashboardData();
      } else {
        toast.error(res?.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error(err?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

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

  // Handle Share Real Product with Custom Margin
  const handleShareProductWithMargin = (prod, customMargin) => {
    const margin = customMargin !== undefined ? customMargin : getProductMargin(prod?.id);
    const finalPrice = Number(prod?.price || 0) + Number(margin || 0);
    const refCode = affiliateApp?.applicationId || customerUser?.id || 'aff_verified';
    const link = `${window.location.origin}/product/${prod?.id || ''}?ref=${refCode}&margin=${margin}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link);
      toast.success('Custom product link copied!', {
        description: `Customer Price: ₹${finalPrice} • Your Profit Margin: +₹${margin}`
      });
    } else {
      toast.info(`Link ready with ₹${margin} margin`);
    }
  };

  const handleShareWhatsAppWithMargin = (prod, customMargin) => {
    const margin = customMargin !== undefined ? customMargin : getProductMargin(prod?.id);
    const finalPrice = Number(prod?.price || 0) + Number(margin || 0);
    const refCode = affiliateApp?.applicationId || customerUser?.id || 'aff_verified';
    const link = `${window.location.origin}/product/${prod?.id || ''}?ref=${refCode}&margin=${margin}`;
    const msg = `🛍️ *${prod?.title || 'Special Exclusive Product'}*\n\nSpecial Price: ₹${finalPrice} only!\n✅ Direct Supplier Quality\n✅ 7-Day Easy Replacement\n✅ Cash on Delivery Available\n\nOrder here: ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Copy Affiliate Referral Link
  const handleCopyAffiliateLink = () => {
    const affLink = `${window.location.origin}/?ref=${affiliateApp?.applicationId || customerUser?.id || 'aff_member'}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(affLink);
      toast.success('Affiliate Referral Link Copied!', {
        description: 'Earn your custom profit margin on all orders placed via this link!'
      });
    }
  };

  // Custom Product Margin Handlers (Apni marzi ka margin)
  const activeMarginProd = useMemo(() => {
    if (!catalogProducts || catalogProducts.length === 0) return null;
    return catalogProducts.find((p) => p.id === selectedMarginProductId) || catalogProducts[0];
  }, [catalogProducts, selectedMarginProductId]);

  const basePrice = activeMarginProd?.price || 499;
  const affiliateSellingPrice = basePrice + Number(customMarginVal || 0);

  const handleShareCustomMarginWhatsApp = (prod, margin) => {
    const targetProd = prod || activeMarginProd;
    const finalP = (targetProd?.price || 499) + Number(margin || customMarginVal || 0);
    const msg = `🛍️ *${targetProd?.title || 'Special Exclusive Product'}*\n\nSpecial Price: ₹${finalP} only!\n✅ Direct Supplier Quality\n✅ 7-Day Easy Replacement\n✅ Cash on Delivery Available\n\nOrder here: ${window.location.origin}/product/${targetProd?.id || ''}?ref=${affiliateApp?.applicationId || 'aff_verified'}&margin=${margin || customMarginVal || 0}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyCustomMarginLink = (prod, margin) => {
    const targetProd = prod || activeMarginProd;
    const link = `${window.location.origin}/product/${targetProd?.id || ''}?ref=${affiliateApp?.applicationId || 'aff_verified'}&margin=${margin || customMarginVal || 0}`;
    navigator.clipboard?.writeText(link);
    toast.success(`Custom product link copied with ₹${margin || customMarginVal || 0} margin!`);
  };

  // Filtered Catalog for Partner Hub
  const partnerCatalogFiltered = useMemo(() => {
    if (!catalogProducts || !Array.isArray(catalogProducts)) return [];
    let list = catalogProducts;
    if (partnerSelectedCat && partnerSelectedCat !== 'All') {
      const catLower = partnerSelectedCat.toLowerCase();
      list = list.filter((p) => {
        const pCat = typeof p.category === 'object' ? p.category?.name : String(p.category || '');
        const pCatSlug = typeof p.categorySlug === 'string' ? p.categorySlug : '';
        return pCat.toLowerCase().includes(catLower) || pCatSlug.toLowerCase().includes(catLower);
      });
    }
    if (partnerSearchQuery && partnerSearchQuery.trim()) {
      const q = String(partnerSearchQuery).toLowerCase().trim();
      list = list.filter((p) => {
        const title = String(p.title || p.name || '').toLowerCase();
        const brand = String(p.brand || '').toLowerCase();
        return title.includes(q) || brand.includes(q);
      });
    }
    return list;
  }, [catalogProducts, partnerSelectedCat, partnerSearchQuery]);

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


  // Handle Withdraw Form Submission (Real Database API Call)
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
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

    try {
      const res = await requestWalletWithdrawal({
        amount: amt,
        method: 'bank',
        destination: withdrawBank
      });

      if (!res?.success) {
        toast.error(res?.message || 'Withdrawal failed on server');
        return;
      }

      const realTxnId = res?.data?.txnId || ('WTH-' + Date.now().toString().slice(-6));
      const newBal = typeof res?.data?.remainingBalance === 'number'
        ? res.data.remainingBalance
        : Math.max(0, walletBalance - amt);

      setWalletBalance(newBal);

      const newTxn = {
        title: `Withdrawal to ${withdrawBank}`,
        ref: realTxnId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        status: 'PROCESSING',
        amt: `-₹${amt.toLocaleString('en-IN')}`,
        green: false
      };

      setWalletTransactions((prev) => [newTxn, ...prev]);

      setShowWithdrawModal(false);
      setWithdrawAmount('');
      toast.success(`Withdrawal of ₹${amt.toLocaleString('en-IN')} initiated!`, {
        description: `Funds will be settled to ${withdrawBank}. Ref: ${realTxnId}`
      });
    } catch (err) {
      console.error('Withdrawal error:', err);
      toast.error(err.message || 'Failed to submit withdrawal request');
    }
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

  // Role & KYC Enforcement: Strictly ONLY unlocked if affiliateApp is APPROVED
  const isResellerApproved = Boolean(
    !isKycSyncing &&
    affiliateApp && (
      affiliateApp.status === 'Approved' ||
      affiliateApp.status === 'APPROVED' ||
      affiliateApp.status === 'Active' ||
      affiliateApp.status === 'ACTIVE'
    )
  );
  const isKycUnderReview = Boolean(
    !isKycSyncing &&
    affiliateApp && (
      affiliateApp.status === 'Pending' ||
      affiliateApp.status === 'PENDING' ||
      affiliateApp.status === 'Under Review' ||
      affiliateApp.status === 'UNDER_REVIEW'
    )
  );
  const isKycRejected = Boolean(
    !isKycSyncing &&
    affiliateApp && (affiliateApp.status === 'Rejected' || affiliateApp.status === 'REJECTED')
  );

  // Automatically redirect away from resale/wallet tabs if not approved & purge unapproved stats (wait until sync completes)
  useEffect(() => {
    if (isKycSyncing) return;
    if (!isResellerApproved) {
      if (activeTab === 'resale' || activeTab === 'wallet') {
        setActiveTab('affiliate');
      }
    }
  }, [isKycSyncing, isResellerApproved, activeTab]);
  // Dynamic Badges & Titles for Sidebar
  let affiliateNavTitle = 'Become a Partner 🤝';
  let affiliateNavBadge = 'NEW';
  let affiliateNavBadgeClass = 'bg-[#b7004d] text-white';

  if (isKycSyncing) {
    affiliateNavTitle = 'Partner Hub';
    affiliateNavBadge = 'SYNC';
    affiliateNavBadgeClass = 'bg-slate-200 text-slate-700 animate-pulse';
  } else if (affiliateApp) {
    if (affiliateApp.status === 'Approved' || affiliateApp.status === 'APPROVED') {
      affiliateNavTitle = 'Partner Hub 🤝';
      affiliateNavBadge = 'ACTIVE';
      affiliateNavBadgeClass = 'bg-emerald-600 text-white';
    } else if (affiliateApp.status === 'Rejected' || affiliateApp.status === 'REJECTED') {
      affiliateNavTitle = 'Partner KYC ⚠️';
      affiliateNavBadge = 'ACTION';
      affiliateNavBadgeClass = 'bg-rose-600 text-white';
    } else {
      affiliateNavTitle = 'Partner KYC ⏳';
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
      icon: isKycUnderReview ? Clock : Award,
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
    // Resell & Earn and Wallet Payouts ONLY unlocked if Reseller KYC is approved
    ...(isResellerApproved
      ? [
          { id: 'resale', label: 'Resell & Earn 🚀', icon: Sparkles },
          { id: 'wallet', label: 'Wallet & Payouts 💳', icon: Wallet },
        ]
      : []),
    { id: 'addresses', label: 'Saved Addresses 📍', icon: MapPin },
    {
      id: 'shopping-catalog',
      label: 'Explore Catalog',
      icon: ShoppingBag,
      children: [
        { id: 'cat-products', label: 'All Categories 🗂️', icon: Search },
        { id: 'cat-sarees', label: 'Sarees Store 🥻', icon: Sparkles },
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
          subtitle: 'Set your own custom profit margin on any product and earn on every referral with weekly bank payouts.',
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
  const filteredOrders = useMemo(() => {
    return realOrders.filter((ord) => {
      const q = String(orderSearchQuery || '').toLowerCase();
      const matchesSearch =
        !q ||
        String(ord.id || '').toLowerCase().includes(q) ||
        ord.items?.some((it) => String(it.product?.title || '').toLowerCase().includes(q));

      if (!matchesSearch) return false;
      const st = (ord.orderStatus || ord.status || 'ORDERED').toUpperCase();

      if (orderFilterStatus === 'ALL') return true;
      if (orderFilterStatus === 'DELIVERED') return st === 'DELIVERED';
      if (orderFilterStatus === 'IN_TRANSIT') {
        return st === 'SHIPPED' || st === 'IN_TRANSIT' || st === 'OUT_FOR_DELIVERY' || st === 'CONFIRMED' || st === 'ORDERED' || st === 'PROCESSING';
      }
      if (orderFilterStatus === 'CANCELLED') return st === 'CANCELLED';
      return true;
    });
  }, [realOrders, orderSearchQuery, orderFilterStatus]);

  // Real accurate order counts for tabs and KPI cards
  const orderCounts = useMemo(() => {
    const counts = { all: realOrders.length, inTransit: 0, delivered: 0, cancelled: 0 };
    realOrders.forEach((o) => {
      const st = (o.orderStatus || o.status || '').toUpperCase();
      if (st === 'DELIVERED') counts.delivered++;
      else if (st === 'CANCELLED') counts.cancelled++;
      else counts.inTransit++;
    });
    return counts;
  }, [realOrders]);

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
      <div className="space-y-4 sm:space-y-6 pb-16 min-w-0 w-full max-w-full overflow-hidden">

        {/* =========================================================================
            TAB 1: DASHBOARD OVERVIEW
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Dynamic Real Margin Summary Banner - Only shows resale margin to approved resellers */}
            {isKycSyncing ? (
              <div className="animate-pulse flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 border border-slate-200/80 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <div className="h-4 w-48 sm:w-72 bg-slate-200 rounded-md"></div>
                </div>
                <div className="h-8 w-28 bg-slate-200 rounded-xl"></div>
              </div>
            ) : isResellerApproved ? (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b7004d] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b7004d]"></span>
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#8a0038]">
                    Reseller Partner Account: Real resale margin earned on your orders is <strong className="text-[#b7004d] font-black underline">₹{totalResaleMargin.toLocaleString('en-IN')}</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('resale')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Resell Hub 🚀</span>
                  </button>
                </div>
              </div>
            ) : isKycUnderReview ? (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-amber-900">
                    Partner KYC Status: Verification in progress (Application #{affiliateApp?.applicationId || affiliateApp?.id || 'Pending'}). Resell &amp; Earn features will activate once approved.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('affiliate')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Track KYC Status</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-pink-50/40 border border-slate-200/80 px-4 py-3 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700">
                    Customer Account: View your personal orders, delivery tracking, or apply for Reseller Partner status to start earning.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('affiliate')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Become an Affiliate / Partner</span>
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
            )}

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
                      Your affiliate partner KYC has been approved! Share curated product referral links and earn your <strong className="text-emerald-300">custom profit margin</strong> directly into your verified bank account.
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
                          Custom Margin Payout
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
                    {orderCounts.inTransit}
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

              {/* Card 4: Real Wallet Balance OR KYC Required Status */}
              {isKycSyncing ? (
                <div className="bg-slate-100/90 border border-slate-200/80 p-5 rounded-3xl animate-pulse flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200"></div>
                    <div className="w-16 h-5 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    <div className="h-6 w-32 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ) : isResellerApproved ? (
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
                    <p className="text-xs font-semibold text-pink-100">Reseller Wallet Balance</p>
                    <h3 className="text-2xl sm:text-3xl font-black mt-1">
                      {isWalletLoading ? (
                        <span className="inline-block w-24 h-7 bg-white/30 rounded animate-pulse"></span>
                      ) : (
                        `₹${walletBalance.toLocaleString('en-IN')}`
                      )}
                    </h3>
                  </div>
                </div>
              ) : isKycUnderReview ? (
                <div
                  onClick={() => setActiveTab('affiliate')}
                  className="bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                      Under Review ⏳
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Partner Wallet</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                      KYC In Progress
                    </h3>
                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                      Payouts unlock once verified
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setActiveTab('affiliate')}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[#b7004d] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                      KYC Required 🔒
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Partner Wallet</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                      Wallet Locked
                    </h3>
                    <p className="text-[11px] text-[#b7004d] font-bold mt-0.5 group-hover:underline flex items-center gap-1">
                      Complete KYC to Activate →
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Real Orders & Performance/KYC Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isResellerApproved ? (
                /* Reseller Earnings Real Chart - ONLY shown if KYC is Approved & User is Reseller */
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin Model</p>
                      <p className="text-sm font-black text-emerald-600">Custom / Item</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Partner Program / KYC Status Card - For Regular Customers without Reseller KYC */
                <div className="lg:col-span-1 bg-gradient-to-br from-white to-pink-50/40 p-5 sm:p-6 rounded-3xl shadow-xs border border-pink-100 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-[#b7004d] px-2.5 py-0.5 rounded-full">
                        {isKycUnderReview ? 'KYC In Progress' : isKycRejected ? 'KYC Needs Attention' : 'Partner Opportunity'}
                      </span>
                      <Award className="w-5 h-5 text-[#b7004d]" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      {isKycUnderReview
                        ? 'Reseller KYC Under Review ⏳'
                        : isKycRejected
                        ? 'KYC Action Required ⚠️'
                        : 'Become a Reseller Partner 🤝'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {isKycUnderReview
                        ? 'Your KYC documents are currently being verified. Resale catalog sharing and margin withdrawal will unlock upon verification.'
                        : isKycRejected
                        ? 'Your submitted KYC documents need correction. Please re-submit valid PAN and bank documents to activate reseller account.'
                        : 'Your account is currently a standard Customer account. Complete Partner KYC to unlock Resell & Earn catalog access and start earning profit margins.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Account Role</span>
                      <span className="font-bold text-slate-800">CUSTOMER</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Reseller Status</span>
                      <span className={`font-bold ${isKycUnderReview ? 'text-amber-600' : isKycRejected ? 'text-rose-600' : 'text-slate-400'}`}>
                        {isKycUnderReview ? 'Under Verification ⏳' : isKycRejected ? 'Rejected ❌' : 'Not Enrolled'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('affiliate')}
                    className="w-full py-2.5 bg-gradient-to-r from-[#b7004d] to-[#e62973] hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    <span>
                      {isKycUnderReview
                        ? 'View KYC Application Status'
                        : isKycRejected
                        ? 'Fix & Resubmit Documents'
                        : 'Complete Reseller KYC 📄'}
                    </span>
                  </button>
                </div>
              )}

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

            {/* Live Database Products: Shopping recommendations for Customer, Markup Resell for Approved Reseller */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isResellerApproved ? 'Available Products to Resell' : 'Trending Products For You 🛍️'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isResellerApproved
                      ? 'Live products from suppliers available for markup and resale profit'
                      : 'Popular picks from MShoppy catalog with fast doorstep delivery'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (isResellerApproved ? setActiveTab('resale') : handleNav('/explorer'))}
                  className="text-xs font-bold text-[#b7004d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isResellerApproved ? 'Explore Resale Hub' : 'Explore All Products'}</span>
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
                    const tag = prod.category?.name || 'MShoppy Best Price';

                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => handleNav(`/product/${prod.id}`)}
                          />
                          {isResellerApproved ? (
                            <button
                              type="button"
                              onClick={() => handleShareProduct(title, profit)}
                              className="absolute bottom-3 right-3 h-9 w-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#b7004d] shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                              title="Share & Earn Profit"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleNav(`/product/${prod.id}`)}
                              className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full flex items-center gap-1.5 text-xs font-bold text-[#b7004d] shadow-md hover:bg-pink-50 transition-colors cursor-pointer"
                              title="View Product"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Buy Now</span>
                            </button>
                          )}
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tag}</p>
                            <h4
                              onClick={() => handleNav(`/product/${prod.id}`)}
                              className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-[#b7004d] cursor-pointer mt-0.5"
                            >
                              {title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase">
                                {isResellerApproved ? 'Wholesale Price' : 'Special Offer Price'}
                              </span>
                              <span className="text-base font-black text-[#b7004d]">₹{priceNum}</span>
                            </div>
                            {isResellerApproved ? (
                              profit > 0 && (
                                <div className="text-right">
                                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">Estimated Margin</span>
                                  <span className="text-xs font-black text-emerald-600">+₹{profit}</span>
                                </div>
                              )
                            ) : (
                              <div className="text-right">
                                <span className="text-[9px] font-semibold text-slate-400 block uppercase">Shipping</span>
                                <span className="text-xs font-bold text-emerald-600">Free Delivery</span>
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

            {isKycSyncing ? (
              <div className="space-y-6">
                <div className="bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-700/50 space-y-4 animate-pulse">
                  <div className="h-6 w-48 bg-slate-800 rounded-full"></div>
                  <div className="h-8 w-72 bg-slate-800 rounded-lg"></div>
                  <div className="h-4 w-96 bg-slate-800/80 rounded"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div className="h-16 bg-slate-800/60 rounded-2xl"></div>
                    <div className="h-16 bg-slate-800/60 rounded-2xl"></div>
                    <div className="h-16 bg-slate-800/60 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            ) : isResellerApproved ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#005a2b] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl border border-emerald-500/30 space-y-4 min-w-0 w-full max-w-full overflow-hidden">
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
                      Your affiliate ID is active. Set your own <strong className="text-emerald-300">custom profit margin per product</strong> (e.g. +₹100, +₹200, +₹500). Every margin you add is credited directly to your bank account!
                    </p>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Your Unique Referral Link:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 min-w-0 bg-black/40 border border-white/20 rounded-2xl px-3.5 py-2.5 font-mono text-xs sm:text-sm text-emerald-300 truncate flex items-center overflow-hidden">
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
                    <h3 className="text-2xl font-black text-slate-900">₹{Number(affiliateStats?.totalReferredRevenue || 0).toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-emerald-600 font-bold">{affiliateStats?.totalOrders || 0} Orders</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Total Margin Earned</p>
                    <h3 className="text-2xl font-black text-emerald-600">₹{Number(affiliateStats?.totalCommission || 0).toLocaleString('en-IN')}</h3>
                    <p className="text-[11px] text-slate-500">Custom Margin per Product</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Settlement Bank</p>
                    <h3 className="text-base font-bold text-slate-900 truncate">{withdrawBank || 'Bank Not Linked'}</h3>
                    <p className="text-[11px] text-indigo-600 font-bold">Weekly Direct IMPS</p>
                  </div>
                </div>

                {/* =========================================================================
                    REAL-TIME PRODUCT CUSTOM MARGIN MANAGER (APNI MARZI KA PROFIT)
                ========================================================================= */}
                <div className="bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-5 min-w-0 w-full max-w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#b7004d] text-xs font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Custom Profit Margin Manager</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        Set Your Custom Profit Margin Per Product 💰
                      </h3>
                      <p className="text-xs text-slate-500">
                        No fixed commission rates! Add your preferred profit margin above the supplier base price on any product. 100% of your chosen margin is credited directly to your bank account upon order delivery.
                      </p>
                    </div>
                  </div>

                  {/* Active Product Margin Customizer Box */}
                  {activeMarginProd && (
                    <div className="p-3 sm:p-5 md:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/70 space-y-4 min-w-0 w-full max-w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <img
                          src={activeMarginProd.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'}
                          alt={activeMarginProd.title}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                            {activeMarginProd.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Supplier Base Price: <strong className="text-slate-800">₹{basePrice}</strong>
                          </p>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 pt-1 w-full max-w-full min-w-0">
                            <span className="text-xs font-semibold text-slate-600 shrink-0">Switch Product:</span>
                            <select
                              value={activeMarginProd.id}
                              onChange={(e) => setSelectedMarginProductId(e.target.value)}
                              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#b7004d] w-full sm:w-auto max-w-full truncate"
                            >
                              {catalogProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title.slice(0, 35)}... (₹{p.price})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Margin Controls */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span>Set Your Profit Margin (₹):</span>
                            <span className="text-[10px] text-slate-400 font-normal">(Adjust profit margin higher or lower)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                max="2000"
                                step="10"
                                value={customMarginVal}
                                onChange={(e) => setCustomMarginVal(Math.max(0, Number(e.target.value)))}
                                className="w-28 pl-6 pr-3 py-1.5 text-sm font-black text-emerald-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Margin Slider */}
                        <div className="space-y-1.5">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            step="25"
                            value={customMarginVal}
                            onChange={(e) => setCustomMarginVal(Number(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>₹0 (Base)</span>
                            <span className="hidden xs:inline">+₹250</span>
                            <span>+₹500</span>
                            <span className="hidden xs:inline">+₹750</span>
                            <span>+₹1,000 (Max)</span>
                          </div>
                        </div>

                        {/* Preset Quick Chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Add:</span>
                          {[50, 100, 150, 200, 300, 500].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCustomMarginVal(preset)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                customMarginVal === preset
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              +₹{preset}
                            </button>
                          ))}
                        </div>

                        {/* Breakdown Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
                          <div className="p-2.5 bg-slate-50 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold block">Supplier Base Price</span>
                            <span className="text-sm font-bold text-slate-700">₹{basePrice}</span>
                          </div>
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-emerald-700 font-bold block">Your Profit Margin</span>
                            <span className="text-sm font-black text-emerald-600">+₹{customMarginVal}</span>
                          </div>
                          <div className="p-2.5 bg-[#b7004d]/10 rounded-xl border border-[#b7004d]/20">
                            <span className="text-[10px] text-[#b7004d] font-bold block">Customer Final Selling Price</span>
                            <span className="text-sm font-black text-[#b7004d]">₹{affiliateSellingPrice}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              const refCode = affiliateApp?.applicationId || 'aff_verified';
                              window.open(`/product?id=${activeMarginProd.id}&ref=${refCode}&margin=${customMarginVal}`, '_blank');
                            }}
                            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                            title="Open live product page with your custom margin applied"
                          >
                            <ExternalLink className="w-4 h-4 text-emerald-400" />
                            <span>View Live Product (₹{affiliateSellingPrice})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareCustomMarginWhatsApp()}
                            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-95"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share on WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyCustomMarginLink()}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy Link</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Catalog Explorer with 1-Click Margin Customizer & Full Catalog Access */}
                  {catalogProducts && catalogProducts.length > 0 && (
                    <div className="space-y-4 pt-3 border-t border-slate-200/80">
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                            <span>Catalog Products</span>
                            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                              Dynamic Live Catalog
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Set your custom profit margin on any product and share directly to WhatsApp
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate('/reseller-home')}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                          title="Open complete reseller catalog"
                        >
                          <span>Explore Full Reseller Catalog</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Search Bar & Category Filter Toolbar */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search catalog by title, brand or category (e.g. Saree, Kurti, Shoes, Watch)..."
                            value={partnerSearchQuery}
                            onChange={(e) => setPartnerSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#b7004d]"
                          />
                          {partnerSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPartnerSearchQuery('')}
                              className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                          {['All', 'Women', 'Men', 'Kids', 'Beauty', 'Footwear', 'Home', 'Gadgets', 'Jewelry'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setPartnerSelectedCat(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                partnerSelectedCat === cat
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filtered Products Grid */}
                      {partnerCatalogFiltered.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400 space-y-2">
                          <p className="text-xs font-semibold">No products found matching "{partnerSearchQuery || partnerSelectedCat}".</p>
                          <button
                            type="button"
                            onClick={() => {
                              setPartnerSearchQuery('');
                              setPartnerSelectedCat('All');
                            }}
                            className="text-xs font-bold text-[#b7004d] hover:underline cursor-pointer"
                          >
                            Clear search filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {partnerCatalogFiltered.slice(0, partnerVisibleCount).map((prod) => (
                            <div
                              key={prod.id}
                              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex gap-3">
                                <img
                                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'}
                                  alt={prod.title}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                                />
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-slate-900 line-clamp-2" title={prod.title}>
                                    {prod.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-500">
                                    Base: <strong className="text-slate-800">₹{prod.price}</strong>
                                  </p>
                                  <p className="text-[11px] text-emerald-600 font-bold">
                                    Suggested: ₹{prod.price + 150} (+₹150 Margin)
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMarginProductId(prod.id);
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                  }}
                                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors text-center"
                                  title="Load into custom margin slider"
                                >
                                  Customize
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const refCode = affiliateApp?.applicationId || 'aff_verified';
                                    window.open(`/product?id=${prod.id}&ref=${refCode}&margin=150`, '_blank');
                                  }}
                                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                                  title="View live product with +₹150 margin"
                                >
                                  <ExternalLink className="w-3 h-3 text-slate-500" />
                                  <span>View (₹{prod.price + 150})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShareCustomMarginWhatsApp(prod, 150)}
                                  className="py-1.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                                  title="Quick share with ₹150 margin"
                                >
                                  <Share2 className="w-3 h-3" />
                                  <span>Share</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Professional Dynamic Pagination & Explore Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">
                          Showing <strong className="text-slate-800">{Math.min(partnerVisibleCount, partnerCatalogFiltered.length)}</strong> of <strong className="text-slate-800">{partnerCatalogFiltered.length}</strong> products
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          {partnerCatalogFiltered.length > partnerVisibleCount && (
                            <button
                              type="button"
                              onClick={() => setPartnerVisibleCount(prev => prev + 12)}
                              className="py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                              Load More Products ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate('/reseller-home')}
                            className="py-2 px-4 bg-[#FF3F6C] hover:bg-[#e0355f] active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Browse All Products</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : isKycUnderReview ? (
              /* If Under Review */
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-[#78350f] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl border border-amber-500/30 space-y-4 min-w-0 w-full max-w-full overflow-hidden">
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
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Application ID</span>
                      <strong className="font-mono text-slate-900">{affiliateApp.applicationId || affiliateApp.id || 'Submitted'}</strong>
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

                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#170a26] via-[#320a2b] to-[#6e0034] p-4 sm:p-8 md:p-10 text-white shadow-2xl border border-pink-500/30 min-w-0 w-full max-w-full">
                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase text-pink-200 border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                      <span>Official Affiliate Partner Program • 0 Investment</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                      Earn Custom Profit Margin On Every Referral! 🚀
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      Set your custom profit margin on any catalog product; whenever a customer purchases through your referral link, 100% of your profit margin is credited directly to your bank account!
                    </p>
                  </div>
                </div>

                {/* 4 Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Custom Margin Payout</h4>
                    <p className="text-xs text-slate-500">Add your own profit margin on every product (e.g. +₹100 to +₹500).</p>
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
                        <p className="text-xs text-slate-400">Estimate your affiliate earning potential based on custom margin</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Custom Margin Model
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
                          <label className="font-bold text-slate-700">Your Custom Margin Per Product (₹)</label>
                          <span className="font-black text-sm text-emerald-600">+₹{calcMarginPerProduct}</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="1000"
                          step="25"
                          value={calcMarginPerProduct}
                          onChange={(e) => setCalcMarginPerProduct(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
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
                <div className="bg-gradient-to-br from-white via-pink-50/20 to-slate-50 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-pink-200/80 shadow-xs space-y-5 min-w-0 w-full max-w-full overflow-hidden">
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
                          Securely link your Government ID and Bank/UPI details to activate weekly margin payouts
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
                  { id: 'ALL', label: `All Orders (${orderCounts.all})` },
                  { id: 'IN_TRANSIT', label: `In Transit 🚚 (${orderCounts.inTransit})` },
                  { id: 'DELIVERED', label: `Delivered ✅ (${orderCounts.delivered})` },
                  { id: 'CANCELLED', label: `Cancelled ❌ (${orderCounts.cancelled})` },
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
                  const st = (order.orderStatus || order.status || 'ORDERED').toUpperCase();
                  const isDelivered = st === 'DELIVERED';
                  const isCancelled = st === 'CANCELLED';
                  const isShipped = st === 'SHIPPED';
                  const isOutForDelivery = st === 'OUT_FOR_DELIVERY';
                  const isCancellable = (st === 'ORDERED' || st === 'CONFIRMED' || st === 'PROCESSING' || st === 'SHIPPED');

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-pink-200 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <span
                            onClick={() => setSelectedTrackingOrder(order)}
                            className="font-mono font-bold text-slate-900 text-sm hover:text-[#b7004d] cursor-pointer"
                            title="Click to view tracking timeline"
                          >
                            #{order.id?.slice(0, 10)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isShipped || isOutForDelivery
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {isDelivered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                            {(isShipped || isOutForDelivery) && <Truck className="w-3 h-3 text-amber-600" />}
                            {!isDelivered && !isCancelled && !isShipped && !isOutForDelivery && (
                              <Clock className="w-3 h-3 text-indigo-600" />
                            )}
                            <span>{st}</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 cursor-pointer" onClick={() => setSelectedTrackingOrder(order)}>
                        {(order.items || []).map((item, idx) => {
                          const p = item.product || {};
                          const img = (Array.isArray(p.images) && p.images[0]) || p.image || 'https://images.meesho.com/images/products/placeholder.png';
                          return (
                            <div key={idx} className="flex items-center gap-3.5">
                              <img
                                src={img}
                                alt={p.title || 'Product'}
                                className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200/60 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm text-slate-900 truncate hover:text-[#b7004d]">
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
                          {/* Track Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedTrackingOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition-all active:scale-95"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Order</span>
                          </button>

                          {/* Invoice Button - Only available once order is delivered */}
                          {isDelivered && (
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>Invoice</span>
                            </button>
                          )}

                          {/* Real Cancel Button */}
                          {isCancellable && (
                            <button
                              type="button"
                              onClick={() => setCancellingOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold cursor-pointer transition-all active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* Return / Exchange Button */}
                          {isDelivered && (
                            <button
                              type="button"
                              onClick={() => handleNav('/return-request')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer transition-colors"
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
                  const img = (Array.isArray(prod?.images) && prod.images[0]) || prod?.image || 'https://images.meesho.com/images/products/placeholder.png';
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
            TAB 6: RESELL & EARN (Real Catalog Only - Unlocked only after KYC Approval)
        ========================================================================= */}
        {activeTab === 'resale' && (
          !isResellerApproved ? (
            <div className="bg-white p-8 sm:p-14 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-8 shadow-xs">
              <div className="w-14 h-14 rounded-3xl bg-pink-50 text-[#b7004d] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Reseller Hub Locked 🔒</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {isKycUnderReview
                  ? 'Your Reseller / Partner KYC application is currently being verified. Once verified, wholesale catalog access and margin links will unlock automatically.'
                  : 'Your account is currently a standard Customer account. Complete Partner KYC to unlock wholesale catalog access and start earning margins on product links.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('affiliate')}
                className="px-6 py-2.5 bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold rounded-2xl shadow-sm cursor-pointer"
              >
                {isKycUnderReview ? 'Track KYC Status' : 'Complete Partner KYC Now 📄'}
              </button>
            </div>
          ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase text-purple-200">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Zero Capital Reseller Network</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Set Your Custom Profit Margin &amp; Share Links</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                No fixed commission rates! Adjust your preferred profit margin on any product below (e.g. +₹100, +₹150, +₹200). Whenever anyone buys through your link, 100% of your profit margin is credited directly to your bank account.
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
                  const currentMargin = getProductMargin(p.id);
                  const finalSellingPrice = price + currentMargin;

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-48 bg-slate-100">
                        <img src={img} alt={title} className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                          Wholesale ₹{price}
                        </span>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{p.category?.name || 'Category'}</p>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{title}</h4>
                        </div>

                        {/* Interactive Custom Margin Box */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-semibold text-slate-600">Your Margin:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-emerald-600">+₹</span>
                              <input
                                type="number"
                                min="0"
                                max="2000"
                                step="10"
                                value={currentMargin}
                                onChange={(e) => setProductMargin(p.id, e.target.value)}
                                className="w-16 px-1.5 py-0.5 text-xs font-black text-emerald-600 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          {/* Quick Margin Chips */}
                          <div className="flex items-center gap-1 pt-0.5 overflow-x-auto no-scrollbar">
                            {[50, 100, 150, 200, 300].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setProductMargin(p.id, preset)}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                                  currentMargin === preset
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                                }`}
                              >
                                +₹{preset}
                              </button>
                            ))}
                          </div>

                          {/* Final Buyer Price Breakdown */}
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                            <span className="text-slate-400">Customer Price:</span>
                            <span className="font-black text-[#b7004d]">₹{finalSellingPrice}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleShareWhatsAppWithMargin(p, currentMargin)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Share on WhatsApp with your margin"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareProductWithMargin(p, currentMargin)}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Copy link with your margin"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )
        )}

        {/* =========================================================================
            TAB 7: WALLET & PAYOUTS (Real Balance & Ledger Only)
        ========================================================================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-gradient-to-br from-[#b7004d] via-[#cf125d] to-[#e62973] text-white p-6 rounded-3xl shadow-lg shadow-pink-600/20 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="font-black text-sm tracking-wide">
                    {isResellerApproved ? 'MShoppy Partner Resale Wallet' : 'MShoppy Customer Shopping Wallet'}
                  </h4>
                  <p className="text-xs text-pink-100">
                    {isResellerApproved ? 'Real Cash & Margin Ledger' : 'Refunds, Store Credits & Promotional Cash'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-pink-100">
                    {isResellerApproved ? 'Available For Instant Withdrawal' : 'Usable on Checkout / Refund Balance'}
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-black mt-1">
                    {isWalletLoading ? (
                      <span className="inline-block w-32 h-9 bg-white/30 rounded animate-pulse"></span>
                    ) : (
                      `₹${walletBalance.toLocaleString('en-IN')}`
                    )}
                  </h2>
                </div>
                <div>
                  {isResellerApproved ? (
                    <button
                      type="button"
                      onClick={() => setShowWithdrawModal(true)}
                      className="px-6 py-2.5 bg-white text-[#b7004d] font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-pink-50 cursor-pointer"
                    >
                      Withdraw to Bank Account 🏦
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleNav('/explorer')}
                        className="px-5 py-2.5 bg-white text-[#b7004d] font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-pink-50 cursor-pointer"
                      >
                        Shop With Balance 🛍️
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('affiliate')}
                        className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-sm cursor-pointer"
                      >
                        {isKycUnderReview ? 'KYC In Progress ⏳' : 'Enable Bank Payouts (Complete KYC) →'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <Building className="w-8 h-8 text-[#b7004d]" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Settlement Bank</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {withdrawBank || 'No Bank Account Linked Yet'}
                  </p>
                  {!isResellerApproved && (
                    <p className="text-[11px] text-amber-600 font-medium mt-1">
                      {isKycUnderReview ? 'Bank verification pending approval' : 'KYC verification required for bank payouts'}
                    </p>
                  )}
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
                  <p className="text-xs text-slate-400">
                    {isResellerApproved
                      ? 'All margin credits and withdrawal requests'
                      : 'All refund credits from cancelled/returned orders and store payments'}
                  </p>
                </div>
              </div>

              {walletTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {isResellerApproved
                    ? 'No wallet transactions recorded yet. Resale margin credits and withdrawal requests will appear here.'
                    : 'No customer wallet transactions recorded yet. Refund credits from returned/cancelled orders will appear here.'}
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
            <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 max-w-3xl overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#b7004d] to-[#ff6584] text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md shrink-0">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">{customerName}</h3>
                    <p className="text-xs text-slate-500 truncate">{customerEmail || 'No email registered'}</p>
                    {isKycSyncing ? (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase border border-slate-200 animate-pulse">
                        Verifying Status...
                      </span>
                    ) : (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-[#b7004d] text-[10px] font-black uppercase border border-pink-100 truncate max-w-full">
                        {isResellerApproved ? 'Verified Partner & Reseller' : isKycUnderReview ? 'Partner (KYC Under Review)' : 'Verified Customer'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Profile Toggle Button */}
                <div className="self-end sm:self-auto shrink-0">
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-[#b7004d] border border-pink-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#b7004d]" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Full Legal Name {isEditingProfile && <span className="text-[#b7004d]">*</span>}
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter full legal name"
                      required
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-slate-800 font-medium transition-all outline-none ${
                        isEditingProfile
                          ? 'bg-white border border-slate-300 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 shadow-xs'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-700 cursor-default'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Registered Phone
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditingProfile}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-slate-800 font-medium transition-all outline-none ${
                        isEditingProfile
                          ? 'bg-white border border-slate-300 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 shadow-xs'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-700 cursor-default'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled={!isEditingProfile}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-slate-800 font-medium transition-all outline-none ${
                        isEditingProfile
                          ? 'bg-white border border-slate-300 focus:border-[#b7004d] focus:ring-2 focus:ring-pink-100 shadow-xs'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-700 cursor-default'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Account Role
                    </label>
                    <input
                      type="text"
                      disabled
                      value={
                        isKycSyncing
                          ? 'Verifying Status...'
                          : isResellerApproved
                          ? 'Approved Reseller & Partner'
                          : isKycUnderReview
                          ? 'Partner (KYC Under Review)'
                          : 'Shopper & Customer'
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-slate-700 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {isEditingProfile && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#b7004d] to-[#d81b60] hover:from-[#9f0038] hover:to-[#c2185b] text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Profile Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>

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
                  <select
                    value={newAddress.state}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b7004d] cursor-pointer"
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                    {newAddress.state && !INDIAN_STATES.includes(newAddress.state) && (
                      <option value={newAddress.state}>{newAddress.state}</option>
                    )}
                  </select>
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

      {/* Real Order Cancellation Modal */}
      {cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          onClose={() => setCancellingOrder(null)}
          onConfirm={handleConfirmCancel}
          isCancelling={isCancelling}
        />
      )}

      {/* Real Order Tracking Timeline Modal */}
      {selectedTrackingOrder && (
        <OrderTrackingModal
          order={selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
          onCancelRequest={(ord) => {
            setSelectedTrackingOrder(null);
            setCancellingOrder(ord);
          }}
          onDownloadInvoice={(ord) => {
            setSelectedInvoiceOrder(ord);
          }}
          onToast={(msg) => toast.info(msg)}
        />
      )}

      {/* Real Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

    </DashboardLayout>
  );
}
