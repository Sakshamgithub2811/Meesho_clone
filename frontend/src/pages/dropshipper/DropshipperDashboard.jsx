import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfileSuccess } from '../../redux/userSlice';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  getDropshipperProfileApi, 
  updateDropshipperProfileApi, 
  uploadDropshipperAvatarApi,
  getDropshipperKycStatusApi 
} from '../../services/dropshipperService';
import { 
  getDropshipperApp, 
  saveDropshipperApp, 
  subscribeDropshipperApp 
} from '../../services/dropshipperSessionStore';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  RotateCcw, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  Banknote,
  Percent,
  UserCircle,
  Mail,
  Phone,
  Lock,
  Save,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  Building2,
  Sparkles,
  ShieldAlert,
  Camera,
  Store,
  Globe,
  CreditCard,
  FileText,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Helper to resolve avatar URL (relative vs absolute)
const getAvatarSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const backendBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') 
    : 'http://localhost:5000';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Dropshipper Master Sidebar Menu
const DROPSHIPPER_MENU = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Store & Profile Settings', icon: UserCircle },
  { id: 'products', label: 'Wholesale Catalog', icon: Package, path: '/supplier-products' },
  {
    id: 'settlements-group',
    label: 'Orders & Settlements',
    icon: ShoppingCart,
    children: [
      { id: 'settlements', label: 'Settlement Tracking', icon: TrendingUp, path: '/dropshipper-settlements' },
      { id: 'rot-manager', label: 'ROT Liability & Return', icon: RotateCcw, path: '/dropshipper-rot-manager' },
      { id: 'returns-ledger', label: 'Margin Returns Ledger', icon: Percent, path: '/reseller-returns' },
    ]
  },
  {
    id: 'wallet-group',
    label: 'Earnings & Payouts',
    icon: Wallet,
    children: [
      { id: 'wallet-passbook', label: 'Fintech Wallet', icon: Wallet, path: '/my-wallet' },
      { id: 'withdraw-funds', label: 'Withdraw Margin', icon: Banknote, path: '/withdraw-earnings' },
      { id: 'payout-settings', label: 'Bank & UPI Settings', icon: CheckCircle2, path: '/payout-settings' },
    ]
  },
  { id: 'kyc', label: '4-Step KYC Verification', icon: ShieldCheck, path: '/dropshipper-register' },
];

export default function DropshipperDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState('dashboard');
  const avatarInputRef = useRef(null);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    avatarUrl: currentUser?.avatarUrl || '',
    storeName: currentUser?.storeName || ''
  });

  // KYC Session Data & Progressive Sub-tabs
  const [kycApp, setKycApp] = useState(() => getDropshipperApp());
  const [kycSubTab, setKycSubTab] = useState('store'); // 'store' | 'bank' | 'tax'
  const [kycForm, setKycForm] = useState({
    brandName: kycApp?.brandName || '',
    storeUrl: kycApp?.storeUrl || '',
    platform: kycApp?.platform || 'Shopify',
    expectedOrders: kycApp?.expectedOrders || '50 - 200 orders/month',
    bankName: kycApp?.bankName || '',
    accountHolder: kycApp?.accountHolder || currentUser?.fullName || '',
    accountNumber: kycApp?.accountNumber || '',
    ifscCode: kycApp?.ifscCode || '',
    upiId: kycApp?.upiId || '',
    panNumber: kycApp?.panNumber || '',
    gstin: kycApp?.gstin || '',
    msmeNumber: kycApp?.msmeNumber || '',
    businessType: kycApp?.businessType || 'Individual Dropshipper'
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const [kycStatus, setKycStatus] = useState('NOT_SUBMITTED'); // 'NOT_SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  const [kycRemoteApp, setKycRemoteApp] = useState(null);

  // 1. Strict Auth Guard: If not logged in as dropshipper, redirect to /dropshipper-login
  useEffect(() => {
    const sessionStr = localStorage.getItem('meesho_dropshipper_session');
    let hasValidSession = false;
    if (sessionStr) {
      try {
        const s = JSON.parse(sessionStr);
        if (s?.isLoggedIn) hasValidSession = true;
      } catch (e) {}
    }
    if (!currentUser && !hasValidSession) {
      toast.error('Authentication Required', { description: 'Please login as a dropshipper to access your dashboard.' });
      navigate('/dropshipper-login', { replace: true });
    }
  }, [currentUser, navigate]);

  // 2. Fetch live KYC status from PostgreSQL database
  const fetchKycStatus = async (uid) => {
    if (!uid) return;
    try {
      const res = await getDropshipperKycStatusApi(uid);
      if (res?.success) {
        const prof = res.profile || {};
        const profBank = (prof.bankDetails && typeof prof.bankDetails === 'object') ? prof.bankDetails : {};

        if (res.hasSubmitted && res.application) {
          setKycStatus(res.application.status);
          setKycRemoteApp(res.application);
          const docs = res.application.documents || {};
          const bank = docs.bank || {};
          const pan = docs.pan || {};
          const tax = docs.tax || {};

          setKycForm((prev) => ({
            ...prev,
            // Prioritize fresh profile storeName and bank details over initial application documents
            brandName: prof.storeName || docs.brandName || docs.businessName || prev.brandName,
            storeUrl: profBank.storeUrl || docs.storeUrl || prev.storeUrl,
            platform: profBank.platform || docs.platform || prev.platform,
            expectedOrders: docs.expectedOrders || prev.expectedOrders,
            bankName: profBank.bankName || bank.bankName || docs.bankName || prev.bankName,
            accountHolder: profBank.accountHolder || bank.holderName || docs.accountHolder || prev.accountHolder,
            accountNumber: profBank.accountNumber || bank.accountNumber || docs.accountNumber || prev.accountNumber,
            ifscCode: (profBank.ifscCode || profBank.ifsc || bank.ifsc || docs.ifscCode || prev.ifscCode || '').toUpperCase(),
            upiId: profBank.upiId || bank.upiId || docs.upiId || prev.upiId,
            panNumber: pan.number || prof.pan || docs.panNumber || prev.panNumber,
            gstin: tax.gstin || prof.gstin || docs.gstin || prev.gstin,
            msmeNumber: tax.msmeNumber || docs.msmeNumber || prev.msmeNumber,
            businessType: docs.storeType || docs.businessType || prev.businessType,
          }));
        } else {
          setKycStatus('NOT_SUBMITTED');
          if (prof.storeName || Object.keys(profBank).length > 0) {
            setKycForm((prev) => ({
              ...prev,
              brandName: prof.storeName || prev.brandName,
              storeUrl: profBank.storeUrl || prev.storeUrl,
              platform: profBank.platform || prev.platform,
              bankName: profBank.bankName || prev.bankName,
              accountHolder: profBank.accountHolder || prev.accountHolder,
              accountNumber: profBank.accountNumber || prev.accountNumber,
              ifscCode: (profBank.ifscCode || profBank.ifsc || prev.ifscCode || '').toUpperCase(),
              upiId: profBank.upiId || prev.upiId,
            }));
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote KYC status:", e.message);
    }
  };

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id || (() => {
      try {
        const s = JSON.parse(localStorage.getItem('meesho_dropshipper_session') || '{}');
        return s.dropshipperId;
      } catch (e) {
        return null;
      }
    })();
    if (uid) {
      fetchKycStatus(uid);
    }
  }, [currentUser?.uid, currentUser?.id]);

  // Subscribe to live KYC changes
  useEffect(() => {
    const unsub = subscribeDropshipperApp((app) => {
      if (app) {
        setKycApp(app);
        if (app.status === 'Approved') setKycStatus('APPROVED');
        setKycForm((prev) => ({
          ...prev,
          brandName: app.brandName || prev.brandName,
          storeUrl: app.storeUrl || prev.storeUrl,
          platform: app.platform || prev.platform,
          bankName: app.bankName || prev.bankName,
          accountNumber: app.accountNumber || prev.accountNumber,
          ifscCode: (app.ifscCode || prev.ifscCode || '').toUpperCase(),
          upiId: app.upiId || prev.upiId,
          panNumber: app.panNumber || prev.panNumber,
          gstin: app.gstin || prev.gstin,
        }));
      }
    });
    return unsub;
  }, []);

  const isKycCompleted = Boolean(kycStatus === 'APPROVED' || kycApp?.status === 'Approved' || (currentUser?.role === 'DROPSHIPPER' && (currentUser?.pan || currentUser?.gstin || kycRemoteApp?.status === 'APPROVED')));
  const isKycPending = Boolean(kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW' || kycApp?.status === 'Under Review');

  // Fetch fresh profile on mount or when switching to 'profile' tab
  const fetchFreshProfile = async (uid) => {
    if (!uid) return;
    try {
      setIsLoadingProfile(true);
      const res = await getDropshipperProfileApi(uid);
      if (res?.success && res?.profile) {
        const p = res.profile;
        setProfileForm({
          fullName: p.fullName || '',
          phone: p.phone || '',
          avatarUrl: p.avatarUrl || '',
          storeName: p.storeName || ''
        });

        if (p.storeName) {
          setKycForm(prev => ({ ...prev, brandName: p.storeName }));
        }
        if (p.bankDetails && typeof p.bankDetails === 'object') {
          const b = p.bankDetails;
          setKycForm(prev => ({
            ...prev,
            bankName: b.bankName || prev.bankName,
            accountHolder: b.accountHolder || prev.accountHolder,
            accountNumber: b.accountNumber || prev.accountNumber,
            ifscCode: (b.ifscCode || b.ifsc || prev.ifscCode || '').toUpperCase(),
            upiId: b.upiId || prev.upiId,
            storeUrl: b.storeUrl || prev.storeUrl,
            platform: b.platform || prev.platform
          }));
        }

        dispatch(updateProfileSuccess(p));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (uid && activeTab === 'profile') {
      fetchFreshProfile(uid);
    }
  }, [activeTab, currentUser?.uid, currentUser?.id]);

  // Sync initial state if currentUser loads later
  useEffect(() => {
    if (currentUser) {
      setProfileForm((prev) => ({
        fullName: prev.fullName || currentUser.fullName || '',
        phone: prev.phone || currentUser.phone || '',
        avatarUrl: prev.avatarUrl || currentUser.avatarUrl || '',
        storeName: prev.storeName || currentUser.storeName || ''
      }));
    }
  }, [currentUser?.uid, currentUser?.id]);

  // Handle Avatar Image File Selection & Instant Upload
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    // Validate format
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) {
      toast.error("Session missing. Please re-login.");
      return;
    }

    // Optimistic Preview
    const previewUrl = URL.createObjectURL(file);
    setProfileForm((prev) => ({ ...prev, avatarUrl: previewUrl }));

    try {
      setIsUploadingAvatar(true);
      toast.info("Uploading profile avatar...");
      const res = await uploadDropshipperAvatarApi(uid, file);

      if (res?.success && res?.avatarUrl) {
        setProfileForm((prev) => ({ ...prev, avatarUrl: res.avatarUrl }));
        dispatch(updateProfileSuccess({ avatarUrl: res.avatarUrl }));
        toast.success("Profile avatar updated successfully!");
      } else {
        toast.error(res?.error || "Failed to upload avatar.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to upload avatar image.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so user can re-select same file if needed
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) {
      toast.error("User session missing. Please re-login.");
      return;
    }

    if (!profileForm.fullName.trim() || profileForm.fullName.trim().length < 2) {
      toast.error("Please enter a valid Full / Store Name (minimum 2 characters).");
      return;
    }

    const cleanPhone = profileForm.phone ? profileForm.phone.replace(/\D/g, '') : '';
    if (cleanPhone && cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const effectiveStoreName = (kycForm.brandName || profileForm.storeName || '').trim();
      const payload = {
        firebaseUid: uid,
        fullName: profileForm.fullName.trim(),
        phone: cleanPhone || null,
        avatarUrl: profileForm.avatarUrl || null,
        storeName: effectiveStoreName || null,
        bankDetails: {
          bankName: kycForm.bankName || '',
          accountHolder: kycForm.accountHolder || profileForm.fullName.trim(),
          accountNumber: kycForm.accountNumber || '',
          ifscCode: (kycForm.ifscCode || '').toUpperCase().trim(),
          upiId: kycForm.upiId || '',
          storeUrl: kycForm.storeUrl || '',
          platform: kycForm.platform || ''
        }
      };

      const response = await updateDropshipperProfileApi(payload);

      if (response?.success && response?.profile) {
        const updated = response.profile;

        // 1. Instantly update form states with the confirmed backend response so inputs never revert
        setProfileForm({
          fullName: updated.fullName || '',
          phone: updated.phone || '',
          avatarUrl: updated.avatarUrl || '',
          storeName: updated.storeName || ''
        });

        if (updated.storeName) {
          setKycForm((prev) => ({ ...prev, brandName: updated.storeName }));
        }

        if (updated.bankDetails && typeof updated.bankDetails === 'object') {
          const b = updated.bankDetails;
          setKycForm((prev) => ({
            ...prev,
            bankName: b.bankName || prev.bankName,
            accountHolder: b.accountHolder || prev.accountHolder,
            accountNumber: b.accountNumber || prev.accountNumber,
            ifscCode: (b.ifscCode || b.ifsc || prev.ifscCode || '').toUpperCase(),
            upiId: b.upiId || prev.upiId,
            storeUrl: b.storeUrl || prev.storeUrl,
            platform: b.platform || prev.platform
          }));
        }

        // 2. Sync Redux state
        dispatch(updateProfileSuccess(updated));

        // 3. Sync with KYC Session Store if active
        if (kycApp) {
          saveDropshipperApp({
            ...kycApp,
            proprietorName: updated.fullName,
            brandName: updated.storeName || kycForm.brandName,
            storeUrl: kycForm.storeUrl,
            platform: kycForm.platform,
            bankName: kycForm.bankName,
            accountNumber: kycForm.accountNumber,
            ifscCode: (kycForm.ifscCode || '').toUpperCase(),
            upiId: kycForm.upiId
          });
        }
        
        // 4. Update localStorage dropshipper session
        try {
          const session = localStorage.getItem('meesho_dropshipper_session');
          if (session) {
            const parsed = JSON.parse(session);
            localStorage.setItem('meesho_dropshipper_session', JSON.stringify({
              ...parsed,
              fullName: updated.fullName,
              phone: updated.phone,
              storeName: updated.storeName
            }));
          }
        } catch (e) {}

        toast.success("Profile & store details updated successfully!");
      } else {
        toast.error(response?.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Reset to current saved profile
  const handleResetForm = () => {
    const uid = currentUser?.uid || currentUser?.id;
    if (uid) {
      fetchFreshProfile(uid);
      fetchKycStatus(uid);
    } else {
      setProfileForm({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        avatarUrl: currentUser?.avatarUrl || '',
        storeName: currentUser?.storeName || ''
      });
    }
    toast.info("Form reset to saved profile.");
  };

  // Handle Password Reset Email
  const handleSendPasswordReset = async () => {
    if (!currentUser?.email) {
      toast.error("No registered email found for this account.");
      return;
    }

    try {
      setIsSendingReset(true);
      await sendPasswordResetEmail(auth, currentUser.email);
      toast.success(`Password reset link sent to ${currentUser.email}! Please check your inbox.`);
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error(err.message || "Failed to send password reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Copy UID
  const handleCopyUid = (uid) => {
    if (!uid) return;
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    toast.success("Firebase UID copied to clipboard!");
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Handle Tab / Menu navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    const findPath = (items) => {
      for (const item of items) {
        if (item.id === tabId && item.path) return item.path;
        if (item.children) {
          const sub = item.children.find(c => c.id === tabId);
          if (sub && sub.path) return sub.path;
        }
      }
      return null;
    };

    const targetPath = findPath(DROPSHIPPER_MENU);
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Safe Dropshipper Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      localStorage.removeItem('meesho_dropshipper_session');
      toast.success("Successfully logged out from Dropshipper portal!");
      navigate('/dropshipper-login');
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const dropshipperName = currentUser?.fullName || "Verified Dropshipper";
  const dropshipperEmail = currentUser?.email || "partner@auratrends.shop";
  const userUid = currentUser?.uid || currentUser?.id || "N/A";

  return (
    <DashboardLayout
      menuItems={DROPSHIPPER_MENU}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      roleName="DROPSHIPPER"
      userName={dropshipperName}
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-10">

        {/* ======================================================== */}
        {/* CONDITIONAL VIEW: TAB 1 - PROFILE & STORE SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'profile' ? (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Header Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#ffe4ec] via-[#fff0f4] to-[#ffdae3] p-6 sm:p-8 border border-[#ffb3c6] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b7004d]/10 border border-[#b7004d]/20 text-[#b7004d] text-xs font-bold tracking-wide uppercase">
                  <UserCircle className="w-3.5 h-3.5" />
                  Account Management
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#4a2135] tracking-tight mt-2">
                  Store & Profile Settings
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                  Manage your business identity, custom store URL, payout bank accounts, and photo.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFreshProfile(userUid)}
                disabled={isLoadingProfile}
                className="rounded-2xl border-pink-200 text-[#b7004d] hover:bg-pink-50 cursor-pointer self-start sm:self-auto gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProfile ? 'animate-spin' : ''}`} />
                <span>{isLoadingProfile ? 'Syncing...' : 'Refresh Details'}</span>
              </Button>
            </div>

            {/* Profile Grid: Left (Account Card + Security), Right (Editable Form) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: IDENTITY & SECURITY CARDS */}
              <div className="space-y-6">
                
                {/* 1. Identity Preview Card with Avatar Upload */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#ffdae3] to-[#ffe4ec]" />
                  
                  <div className="relative pt-6 flex flex-col items-center">
                    
                    {/* Interactive Round Avatar */}
                    <div className="relative group/avatar cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#b7004d] to-[#92003d] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-[#b7004d]/25 border-4 border-white mb-3">
                        {profileForm.avatarUrl ? (
                          <img 
                            src={getAvatarSrc(profileForm.avatarUrl)} 
                            alt="Dropshipper Avatar" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          dropshipperName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Camera Overlay Badge Button */}
                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        className="absolute bottom-3 right-0 w-8 h-8 rounded-full bg-[#b7004d] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#92003d] transition-transform hover:scale-110 cursor-pointer"
                        title="Upload Profile Photo"
                      >
                        {isUploadingAvatar ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Hidden File Input */}
                      <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={handleAvatarFileSelect}
                        accept="image/jpeg,image/png,image/webp" 
                        className="hidden" 
                      />
                    </div>

                    <h3 className="text-lg font-black text-[#4a2135] tracking-tight">
                      {dropshipperName}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {dropshipperEmail}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b7004d] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        DROPSHIPPER
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                        isKycCompleted ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {isKycCompleted ? 'Verified B2B Partner' : 'Step 2 KYC Pending'}
                      </span>
                    </div>

                    <div className="w-full border-t border-gray-100 mt-6 pt-4 text-left space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Account ID (UID):</span>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-gray-700 bg-gray-50 px-2 py-0.5 rounded border">
                          <span>{userUid.slice(0, 10)}...</span>
                          <button 
                            type="button" 
                            onClick={() => handleCopyUid(userUid)}
                            className="text-gray-400 hover:text-[#b7004d] cursor-pointer"
                            title="Copy UID"
                          >
                            {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">KYC Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          isKycCompleted ? 'text-emerald-700 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                        }`}>
                          {isKycCompleted ? (kycApp?.status || 'Approved') : 'KYC Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Password & Security Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Account Security</h4>
                      <p className="text-xs text-gray-500">Protected via Firebase Authentication</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Need to change your login password? Click below to receive a secure reset link at your registered email address.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendPasswordReset}
                    disabled={isSendingReset}
                    className="w-full rounded-2xl border-gray-200 hover:border-[#b7004d]/40 hover:bg-pink-50 text-gray-700 hover:text-[#b7004d] text-xs font-bold py-5 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isSendingReset ? 'Sending Email...' : 'Send Password Reset Email'}</span>
                  </Button>
                </div>

              </div>

              {/* RIGHT COLUMN: EDITABLE PROFILE & PROGRESSIVE KYC TABS */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  
                  {/* Header */}
                  <div className="border-b border-gray-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-[#4a2135] tracking-tight">
                        {isKycCompleted ? 'Verified Dropshipper Business Profile' : 'Edit Profile Information'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isKycCompleted 
                          ? 'Manage your store brand, payout bank accounts, and contact details.' 
                          : 'Update your display name and mobile number. Changes reflect immediately across invoices.'}
                      </p>
                    </div>

                    {isKycCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        KYC Verified
                      </span>
                    )}
                  </div>

                  {/* Progressive Sub-Tabs if KYC is Completed */}
                  {isKycCompleted && (
                    <div className="flex border-b border-gray-100 gap-2 sm:gap-6 mb-6 overflow-x-auto pb-1">
                      <button 
                        type="button"
                        onClick={() => setKycSubTab('store')}
                        className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          kycSubTab === 'store' ? 'border-[#b7004d] text-[#b7004d]' : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <Store className="w-4 h-4" />
                        Store & Identity
                      </button>

                      <button 
                        type="button"
                        onClick={() => setKycSubTab('bank')}
                        className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          kycSubTab === 'bank' ? 'border-[#b7004d] text-[#b7004d]' : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Bank & Payouts
                      </button>

                      <button 
                        type="button"
                        onClick={() => setKycSubTab('tax')}
                        className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          kycSubTab === 'tax' ? 'border-[#b7004d] text-[#b7004d]' : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Tax & Compliance
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    
                    {/* ======================================================== */}
                    {/* SECTION 1: STORE & BASIC DETAILS (ALWAYS VISIBLE OR SUBTAB) */}
                    {/* ======================================================== */}
                    {(!isKycCompleted || kycSubTab === 'store') && (
                      <div className="space-y-5">
                        
                        {/* Full Name / Store Owner Name */}
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCircle className="w-3.5 h-3.5 text-[#b7004d]" />
                            Full Name / Store Owner Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="fullName"
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            placeholder="e.g. Kunal Sikarwar"
                            className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] focus:ring-[#b7004d]/20 text-sm font-medium"
                            required
                          />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#b7004d]" />
                            Contact Mobile Number <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg border">
                              +91
                            </span>
                            <Input
                              id="phone"
                              type="tel"
                              maxLength={10}
                              value={profileForm.phone}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setProfileForm({ ...profileForm, phone: val });
                              }}
                              placeholder="9098296425"
                              className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] focus:ring-[#b7004d]/20 text-sm font-medium pl-16"
                            />
                          </div>
                        </div>

                        {/* Registered Email (Disabled / Read-only) */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            Registered Email Address <span className="text-gray-400 font-normal">(Read-only)</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              value={dropshipperEmail}
                              disabled
                              className="h-11 rounded-2xl bg-gray-50/80 border-gray-200 text-gray-500 text-sm font-medium cursor-not-allowed pr-10"
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        {/* Post-KYC Unlocked Store Identity Fields */}
                        {isKycCompleted && (
                          <>
                            {/* Brand / Store Name */}
                            <div className="space-y-2">
                              <Label htmlFor="brandName" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-[#b7004d]" />
                                Store / Brand Display Name
                              </Label>
                              <Input
                                id="brandName"
                                type="text"
                                value={kycForm.brandName}
                                onChange={(e) => setKycForm({ ...kycForm, brandName: e.target.value })}
                                placeholder="e.g. Aura Trends Luxe"
                                className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium"
                              />
                            </div>

                            {/* Store Website URL */}
                            <div className="space-y-2">
                              <Label htmlFor="storeUrl" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-[#b7004d]" />
                                Store Website / Sales Channel URL
                              </Label>
                              <Input
                                id="storeUrl"
                                type="url"
                                value={kycForm.storeUrl}
                                onChange={(e) => setKycForm({ ...kycForm, storeUrl: e.target.value })}
                                placeholder="https://auratrends.shop"
                                className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium font-mono text-xs"
                              />
                            </div>

                            {/* Sales Platform */}
                            <div className="space-y-2">
                              <Label htmlFor="platform" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[#b7004d]" />
                                Primary E-commerce Platform
                              </Label>
                              <Input
                                id="platform"
                                type="text"
                                value={kycForm.platform}
                                onChange={(e) => setKycForm({ ...kycForm, platform: e.target.value })}
                                placeholder="Shopify / WooCommerce / Amazon / Custom"
                                className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium"
                              />
                            </div>
                          </>
                        )}

                        {/* Pre-KYC Locked Preview Card */}
                        {!isKycCompleted && (
                          <div className={`rounded-2xl border border-dashed p-5 mt-6 ${
                            isKycPending
                              ? 'border-amber-300 bg-gradient-to-r from-amber-50/70 to-orange-50/50'
                              : 'border-pink-300 bg-gradient-to-r from-pink-50/70 to-rose-50/50'
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isKycPending ? 'bg-amber-100 text-amber-700' : 'bg-[#b7004d]/10 text-[#b7004d]'
                              }`}>
                                {isKycPending ? <Clock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-[#4a2135]">
                                  {isKycPending ? "KYC Application Under Admin Review" : "Advanced Business Settings Locked"}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {isKycPending
                                    ? `Your application (${kycRemoteApp?.id ? '#' + kycRemoteApp.id.slice(0, 8).toUpperCase() : 'In Review'}) has reached the Meesho Admin verification desk. All Store, Bank Payout & Tax details will be unlocked as soon as approved.`
                                    : "Your Custom Store URL, Bank Payout Passbook & Automated UPI Settlement settings will unlock as soon as you complete your 4-Step KYC verification."}
                                </p>
                                <div className="pt-2">
                                  <Button
                                    type="button"
                                    onClick={() => navigate('/dropshipper-register')}
                                    className={`rounded-xl text-xs font-bold py-2 px-4 shadow-sm cursor-pointer flex items-center gap-1.5 text-white ${
                                      isKycPending ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#b7004d] hover:bg-[#92003d]'
                                    }`}
                                  >
                                    <span>{isKycPending ? "View Application Status" : "Complete 4-Step KYC Verification"}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* SECTION 2: BANK & PAYOUT SETTINGS (SUBTAB 'bank') */}
                    {/* ======================================================== */}
                    {isKycCompleted && kycSubTab === 'bank' && (
                      <div className="space-y-5 animate-in fade-in-50 duration-200">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>All customer order margin payouts will automatically transfer to this verified account.</span>
                        </div>

                        {/* Bank Name */}
                        <div className="space-y-2">
                          <Label htmlFor="bankName" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#b7004d]" />
                            Registered Bank Name
                          </Label>
                          <Input
                            id="bankName"
                            type="text"
                            value={kycForm.bankName}
                            onChange={(e) => setKycForm({ ...kycForm, bankName: e.target.value })}
                            placeholder="e.g. HDFC Bank"
                            className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium"
                          />
                        </div>

                        {/* Account Number */}
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#b7004d]" />
                            Bank Account Number
                          </Label>
                          <Input
                            id="accountNumber"
                            type="text"
                            value={kycForm.accountNumber}
                            onChange={(e) => setKycForm({ ...kycForm, accountNumber: e.target.value })}
                            placeholder="e.g. 50100482910291"
                            className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium font-mono"
                          />
                        </div>

                        {/* IFSC Code */}
                        <div className="space-y-2">
                          <Label htmlFor="ifscCode" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#b7004d]" />
                            Bank IFSC Code
                          </Label>
                          <Input
                            id="ifscCode"
                            type="text"
                            value={kycForm.ifscCode}
                            onChange={(e) => setKycForm({ ...kycForm, ifscCode: e.target.value.toUpperCase() })}
                            placeholder="e.g. HDFC0001248"
                            className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium font-mono uppercase"
                          />
                        </div>

                        {/* Instant UPI ID */}
                        <div className="space-y-2">
                          <Label htmlFor="upiId" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5 text-[#b7004d]" />
                            Instant Payout UPI ID (VPA)
                          </Label>
                          <Input
                            id="upiId"
                            type="text"
                            value={kycForm.upiId}
                            onChange={(e) => setKycForm({ ...kycForm, upiId: e.target.value })}
                            placeholder="e.g. yourname@okaxis"
                            className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm font-medium font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* SECTION 3: TAX & LEGAL IDENTIFICATION (SUBTAB 'tax') */}
                    {/* ======================================================== */}
                    {isKycCompleted && kycSubTab === 'tax' && (
                      <div className="space-y-5 animate-in fade-in-50 duration-200">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
                          <span>Government tax identification verified for ROT Freight Offsets & Legal B2B Invoicing.</span>
                        </div>

                        {/* Business Type */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Business Entity Type
                          </Label>
                          <Input
                            value={kycForm.businessType}
                            disabled
                            className="h-11 rounded-2xl bg-gray-50 border-gray-200 text-gray-600 text-sm font-medium cursor-not-allowed"
                          />
                        </div>

                        {/* PAN Card Number */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                            <span>Income Tax PAN Number</span>
                            <span className="text-[11px] font-bold text-emerald-600">✓ Verified</span>
                          </Label>
                          <Input
                            value={kycForm.panNumber}
                            disabled
                            className="h-11 rounded-2xl bg-gray-50 border-gray-200 text-gray-600 text-sm font-mono cursor-not-allowed"
                          />
                        </div>

                        {/* GSTIN or MSME */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                            <span>GSTIN / Udyam MSME Registration</span>
                            <span className="text-[11px] font-bold text-emerald-600">✓ Verified</span>
                          </Label>
                          <Input
                            value={kycForm.gstin || kycForm.msmeNumber}
                            disabled
                            className="h-11 rounded-2xl bg-gray-50 border-gray-200 text-gray-600 text-sm font-mono cursor-not-allowed"
                          />
                        </div>

                        <div className="pt-2">
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Need to update your GSTIN or business entity? Changing tax identity requires desk re-verification. Contact compliance support at <span className="font-semibold text-gray-800">support@mshoppy.in</span>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetForm}
                        disabled={isSavingProfile || isUploadingAvatar}
                        className="w-full sm:w-auto rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-5 text-xs font-bold cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                        Discard Changes
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSavingProfile || isUploadingAvatar}
                        className="w-full sm:w-auto bg-[#b7004d] hover:bg-[#92003d] text-white rounded-2xl px-8 py-5 text-xs font-bold shadow-lg shadow-[#b7004d]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                      </Button>
                    </div>

                  </form>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* DEFAULT VIEW: TAB 2 - DASHBOARD OVERVIEW */
          /* ======================================================== */
          <>
            {/* 1. TOP NOTICE / KYC CTA BANNER */}
            <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-sm ${
              isKycCompleted 
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-200' 
                : (isKycPending 
                    ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 border-amber-200' 
                    : 'bg-gradient-to-r from-[#ffe4ec] via-[#fff0f4] to-[#ffdae3] border-[#ffb3c6]')
            }`}>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
                    isKycCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : (isKycPending
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-[#b7004d]/10 border-[#b7004d]/20 text-[#b7004d]')
                  }`}>
                    {isKycCompleted ? <ShieldCheck className="w-3.5 h-3.5" /> : (isKycPending ? <Clock className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />)}
                    {isKycCompleted ? 'KYC Status: Verified Dropshipper' : (isKycPending ? 'KYC Status: Under Review' : 'Step 2: KYC & Compliance Verification')}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#4a2135] tracking-tight">
                    {isKycCompleted
                      ? 'Verified Dropshipper Partner Account'
                      : (isKycPending
                          ? 'Your KYC Application Is Under Verification'
                          : 'Unlock Wholesale Supplier Catalog & Direct Margin Payouts')}
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {isKycCompleted
                      ? 'Your store identity and payout bank account are fully verified. All order margins transfer directly and ROT return shield is activated.'
                      : (isKycPending
                          ? 'Your 4-step KYC request is currently queued at the Admin desk. Once the admin approves your documents, store and bank settings will be editable.'
                          : 'Complete your mandatory 4-Step KYC (GSTIN / MSME, Store profile & Bank verification) to enable instant automated margin payouts and full ROT liability coverage.')}
                  </p>
                </div>
                
                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
                  {!isKycCompleted && (
                    <Button
                      onClick={() => navigate('/dropshipper-register')}
                      className={`w-full md:w-auto font-bold py-6 px-6 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2 ${
                        isKycPending
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                          : 'bg-[#b7004d] hover:bg-[#92003d] text-white shadow-[#b7004d]/20'
                      }`}
                    >
                      <span>{isKycPending ? 'Check Application Status' : 'Complete 4-Step KYC Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                  {isKycCompleted && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md">
                      <ShieldCheck className="w-4 h-4" /> 100% Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Decorative Background Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#ff7293]/15 blur-2xl pointer-events-none" />
            </div>

            {/* 2. STATS & KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Resell Margin</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">₹42,850.00</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <span>↑ +18.4%</span>
                    <span className="text-gray-400">vs last cycle</span>
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Dropship Orders</span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#b7004d] flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">34</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    28 in-transit • 6 out for delivery
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ROT Shield Protection</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">100%</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    Zero damage return liability
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Wallet Balance</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">₹14,200.00</h3>
                  <p className="text-xs text-purple-600 font-semibold mt-1">
                    Eligible for instant withdrawal
                  </p>
                </div>
              </div>
            </div>

            {/* 3. QUICK ACTIONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => navigate('/supplier-products')}
                className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#b7004d]" />
                </div>
                <h4 className="font-bold text-gray-900 mt-3 text-sm">Browse Wholesale Catalog</h4>
                <p className="text-xs text-gray-500 mt-1">Discover trending B2B suppliers and zero-margin products.</p>
              </div>

              <div 
                onClick={() => navigate('/dropshipper-settlements')}
                className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mt-3 text-sm">Settlement Tracking</h4>
                <p className="text-xs text-gray-500 mt-1">Monitor real-time customer payments and profit payouts.</p>
              </div>

              <div 
                onClick={() => navigate('/dropshipper-rot-manager')}
                className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900 mt-3 text-sm">ROT Return Manager</h4>
                <p className="text-xs text-gray-500 mt-1">Manage return-on-transit claims & supplier freight offsets.</p>
              </div>

              <div 
                onClick={() => navigate('/withdraw-earnings')}
                className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                </div>
                <h4 className="font-bold text-gray-900 mt-3 text-sm">Withdraw Earnings</h4>
                <p className="text-xs text-gray-500 mt-1">Transfer cleared margin balance to your registered bank account.</p>
              </div>
            </div>

            {/* 4. RECENT ORDERS & ACTIVITY PREVIEW */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Dropship Orders</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Live tracking of your customer orders through verified suppliers</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dropshipper-settlements')}
                  className="text-xs font-bold text-[#b7004d] border-pink-200 hover:bg-pink-50 rounded-xl cursor-pointer"
                >
                  View All Settlements →
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                      <th className="pb-3 px-2">Order ID</th>
                      <th className="pb-3 px-2">Product SKU</th>
                      <th className="pb-3 px-2">Destination</th>
                      <th className="pb-3 px-2">Customer Price</th>
                      <th className="pb-3 px-2">Your Margin</th>
                      <th className="pb-3 px-2">ROT Status</th>
                      <th className="pb-3 px-2">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    <tr className="hover:bg-gray-50/60 transition">
                      <td className="py-4 px-2 font-mono text-gray-800">#MSH-9824</td>
                      <td className="py-4 px-2 text-gray-800">Banarasi Silk Saree (Red)</td>
                      <td className="py-4 px-2 text-gray-600">Bengaluru, KA</td>
                      <td className="py-4 px-2 text-gray-900 font-bold">₹1,499.00</td>
                      <td className="py-4 px-2 text-emerald-600 font-bold">+₹450.00</td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Shielded
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50/60 transition">
                      <td className="py-4 px-2 font-mono text-gray-800">#MSH-9819</td>
                      <td className="py-4 px-2 text-gray-800">Wireless ANC Earbuds Pro</td>
                      <td className="py-4 px-2 text-gray-600">Jaipur, RJ</td>
                      <td className="py-4 px-2 text-gray-900 font-bold">₹999.00</td>
                      <td className="py-4 px-2 text-emerald-600 font-bold">+₹320.00</td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Shielded
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold">
                          <Clock className="w-3 h-3" /> In Transit
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50/60 transition">
                      <td className="py-4 px-2 font-mono text-gray-800">#MSH-9805</td>
                      <td className="py-4 px-2 text-gray-800">Luxe Embroidery Kurti Set</td>
                      <td className="py-4 px-2 text-gray-600">Pune, MH</td>
                      <td className="py-4 px-2 text-gray-900 font-bold">₹849.00</td>
                      <td className="py-4 px-2 text-emerald-600 font-bold">+₹280.00</td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Shielded
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
