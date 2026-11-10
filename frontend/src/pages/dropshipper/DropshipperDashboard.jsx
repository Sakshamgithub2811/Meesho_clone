import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfileSuccess } from '../../redux/userSlice';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  getDropshipperProfileApi, 
  updateDropshipperProfileApi, 
  uploadDropshipperAvatarApi,
  getDropshipperKycStatusApi,
  isDropshipperAuthenticated,
  updateDropshipperKycStatus,
  deactivateDropshipperAccountApi,
  clearDropshipperSession,
  getDropshipperDashboardOverviewApi
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
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  PackageSearch,
  Headphones,
  Settings,
  Layers,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { BACKEND_ROOT } from '../../config/apiConfig';

// Helper to resolve avatar URL (relative vs absolute)
const getAvatarSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${BACKEND_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Import Centralized Master Dropshipper Menu
import { DROPSHIPPER_MENU } from './dropshipperMenu';

export default function DropshipperDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Sync activeTab with URL query (?tab=profile or default 'dashboard')
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  // If query changes externally, sync state
  useEffect(() => {
    const qTab = new URLSearchParams(location.search).get('tab');
    if (qTab && (qTab === 'profile' || qTab === 'dashboard')) {
      setActiveTab(qTab);
    }
  }, [location.search]);

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
  const [kycSubTab, setKycSubTab] = useState('basic'); // 'basic' | 'password'
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

  // Direct In-App Password Change States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const [kycStatus, setKycStatus] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('meesho_dropshipper_session') || '{}');
      return (s.kycStatus || currentUser?.kycStatus || 'NOT_SUBMITTED').toUpperCase();
    } catch (e) {
      return 'NOT_SUBMITTED';
    }
  }); // 'NOT_SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  const [kycRemoteApp, setKycRemoteApp] = useState(null);

  // Soft Delete / Account Deactivation States
  const [isDeactivatingModalOpen, setIsDeactivatingModalOpen] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');
  const [isSubmittingDeactivation, setIsSubmittingDeactivation] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('Temporary break / Business model switch');

  // Module 7: Master Executive Dashboard State (PostgreSQL Live Metrics)
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);

  // Active user / dropshipper UID helper
  const currentUid = currentUser?.uid || currentUser?.id || (() => {
    try {
      const s = JSON.parse(localStorage.getItem('meesho_dropshipper_session') || '{}');
      return s.dropshipperId;
    } catch (e) {
      return null;
    }
  })();

  const fetchDashboardOverview = async (uid, isManualRefresh = false) => {
    if (!uid) return;
    try {
      if (isManualRefresh) setIsRefreshingDashboard(true);
      else setIsLoadingDashboard(true);
      const res = await getDropshipperDashboardOverviewApi(uid);
      if (res?.success) {
        const payload = res.data || res;
        setDashboardData(payload);
        if (isManualRefresh) {
          toast.success('Live Sync Complete', { description: 'Dashboard metrics refreshed from PostgreSQL database.' });
        }
      }
    } catch (err) {
      console.error('Failed to load dropshipper dashboard overview:', err);
      if (isManualRefresh) {
        toast.error('Sync Error', { description: err?.response?.data?.message || err.message });
      }
    } finally {
      setIsLoadingDashboard(false);
      setIsRefreshingDashboard(false);
    }
  };

  // 1. Strict Auth Guard: If not logged in as dropshipper or session expired (>24h), redirect to /dropshipper-login
  useEffect(() => {
    if (!isDropshipperAuthenticated()) {
      toast.error('Authentication Required', { description: 'Please login as a dropshipper to access your dashboard.' });
      navigate('/dropshipper-login', { replace: true });
    }
  }, [navigate]);

  // 2. Fetch live KYC status from PostgreSQL database
  const fetchKycStatus = async (uid) => {
    if (!uid) return;
    try {
      const res = await getDropshipperKycStatusApi(uid);
      if (res?.success) {
        const prof = res.profile || {};
        const profBank = (prof.bankDetails && typeof prof.bankDetails === 'object') ? prof.bankDetails : {};

        if (res.hasSubmitted && res.application) {
          const appStatus = (res.application.status || 'PENDING').toUpperCase();
          setKycStatus(appStatus);
          updateDropshipperKycStatus(appStatus);
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
          updateDropshipperKycStatus('NOT_SUBMITTED');
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
      fetchDashboardOverview(uid);
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

  const isKycCompleted = Boolean(
    kycStatus === 'APPROVED' || 
    kycRemoteApp?.status === 'APPROVED' ||
    kycRemoteApp?.status === 'Approved'
  );
  const isKycPending = Boolean(
    !isKycCompleted && (
      kycStatus === 'PENDING' || 
      kycStatus === 'UNDER_REVIEW' || 
      kycRemoteApp?.status === 'PENDING' || 
      kycRemoteApp?.status === 'UNDER_REVIEW' ||
      kycRemoteApp?.status === 'Pending' ||
      kycRemoteApp?.status === 'Under Review' ||
      kycApp?.status === 'Pending' ||
      kycApp?.status === 'Under Review'
    )
  );

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

  // Handle In-App Direct Password Change with Reauthentication
  const handleChangePassword = async (e) => {
    e?.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    const user = auth.currentUser;
    const userEmail = user?.email || currentUser?.email || (() => {
      try {
        const s = JSON.parse(localStorage.getItem('meesho_dropshipper_session') || '{}');
        return s.email;
      } catch (e) {
        return null;
      }
    })();

    if (!user || !userEmail) {
      toast.error('Authentication session expired', { description: 'Please re-login to update your password.' });
      return;
    }

    try {
      setIsUpdatingPassword(true);

      // Step 1: Re-authenticate with current password to prove identity
      const credential = EmailAuthProvider.credential(userEmail, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Step 2: Directly update password in Firebase Auth
      await updatePassword(user, newPassword);

      toast.success('Password updated successfully!', {
        description: 'Your account credentials have been secured with the new password.'
      });

      // Step 3: Clear password form state
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

    } catch (err) {
      console.error('Password change error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect. Please check and try again.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/requires-recent-login') {
        toast.error('Security timeout: Please logout and login again before changing password.');
      } else {
        toast.error(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsUpdatingPassword(false);
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

  // Handle Dropshipper Account Soft-Delete / Deactivation
  const handleDeactivateAccount = async () => {
    const isMatch = (deactivateConfirmText || '').trim().toUpperCase() === 'DEACTIVATE';
    if (!isMatch) {
      toast.error('Confirmation mismatch', { description: 'Please type "DEACTIVATE" to confirm.' });
      return;
    }

    const uid = currentUser?.uid || currentUser?.id || auth.currentUser?.uid || (() => {
      try {
        const s = JSON.parse(localStorage.getItem('meesho_dropshipper_session') || '{}');
        return s.dropshipperId;
      } catch (e) {
        return null;
      }
    })();

    const email = currentUser?.email || auth.currentUser?.email || (() => {
      try {
        const s = JSON.parse(localStorage.getItem('meesho_dropshipper_session') || '{}');
        return s.email;
      } catch (e) {
        return null;
      }
    })();

    if (!uid && !email) {
      toast.error('Session not found', { description: 'Please login again to continue.' });
      return;
    }

    try {
      setIsSubmittingDeactivation(true);
      const res = await deactivateDropshipperAccountApi({
        firebaseUid: uid,
        email: email,
        reason: deactivateReason
      });

      if (res?.success) {
        toast.success('Account Deactivated Successfully', {
          description: 'Your products have been unlisted from public view. Existing customer order history is preserved.'
        });
        setIsDeactivatingModalOpen(false);
        clearDropshipperSession();
        dispatch(logout());
        try {
          await signOut(auth);
        } catch (e) {}
        navigate('/dropshipper-login');
      } else {
        toast.error(res?.error || 'Failed to deactivate account.');
      }
    } catch (err) {
      console.error('Account deactivation error:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to deactivate account.');
    } finally {
      setIsSubmittingDeactivation(false);
    }
  };

  // Handle Tab / Menu navigation
  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') {
      setActiveTab('dashboard');
      navigate('/dropshipper-dashboard');
      return;
    }
    if (tabId === 'profile') {
      setActiveTab('profile');
      navigate('/dropshipper-dashboard?tab=profile');
      return;
    }

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
                          isKycCompleted ? 'text-emerald-700 bg-emerald-50' : (isKycPending ? 'text-amber-700 bg-amber-50' : 'text-gray-600 bg-gray-100')
                        }`}>
                          {isKycCompleted ? 'Approved' : (isKycPending ? 'Under Review' : 'Not Submitted')}
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
                      <p className="text-xs text-gray-500">Firebase Encrypted Credential</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Protect your store by keeping your password updated. You can change your password directly in the security tab.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setKycSubTab('password')}
                    className={`w-full rounded-2xl border-gray-200 hover:border-[#b7004d]/40 text-xs font-bold py-5 cursor-pointer flex items-center justify-center gap-2 transition-all ${
                      kycSubTab === 'password'
                        ? 'bg-[#b7004d] text-white border-[#b7004d] shadow-md shadow-[#b7004d]/20'
                        : 'hover:bg-pink-50 text-gray-700 hover:text-[#b7004d]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Change Password Tab ➔</span>
                  </Button>
                </div>

                {/* 3. View Full Profile & KYC Card */}
                {isKycCompleted && (
                  <div className="bg-emerald-50/80 rounded-3xl p-5 border border-emerald-200/90 shadow-sm space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">4-Step Verified KYC</h4>
                        <p className="text-[10px] text-emerald-800">Bank, Tax & Store Records</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      All your verified business identity, bank payout destination, and tax compliance records are managed in Full Profile.
                    </p>
                    <Button
                      type="button"
                      onClick={() => navigate('/dropshipper-profile')}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold py-2 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>View Profile & KYC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: EDITABLE PROFILE & PROGRESSIVE KYC TABS */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                  
                  {/* Header */}
                  <div className="border-b border-gray-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-[#4a2135] tracking-tight">
                        {kycSubTab === 'password'
                          ? 'Account Security & Password'
                          : 'Basic Store & Profile Information'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {kycSubTab === 'password'
                          ? 'Update your login password securely. Verification requires your current password.'
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

                  {/* Sub-Tabs Navigation */}
                  <div className="flex border-b border-gray-100 gap-2 sm:gap-6 mb-6 overflow-x-auto pb-1">
                    <button 
                      type="button"
                      onClick={() => setKycSubTab('basic')}
                      className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        kycSubTab === 'basic' ? 'border-[#b7004d] text-[#b7004d]' : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <UserCircle className="w-4 h-4" />
                      Basic Profile Information
                    </button>

                    <button 
                      type="button"
                      onClick={() => setKycSubTab('password')}
                      className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        kycSubTab === 'password' ? 'border-[#b7004d] text-[#b7004d]' : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>

                  {kycSubTab === 'password' ? (
                    /* ======================================================== */
                    /* PASSWORD CHANGE FORM */
                    /* ======================================================== */
                    <form onSubmit={handleChangePassword} className="space-y-6 animate-in fade-in-50 duration-200">
                      
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>For your store's security, please verify your current password before setting a new one.</span>
                      </div>

                      <div className="space-y-5 max-w-xl">
                        
                        {/* Current Password */}
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-[#b7004d]" />
                            Current Password <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              placeholder="Enter your current password"
                              className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm pr-11"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              tabIndex={-1}
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="newPassword" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-[#b7004d]" />
                              New Password <span className="text-red-500">*</span>
                            </Label>
                            {passwordForm.newPassword.length >= 6 && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Min. 6 chars met
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="Enter new password (min. 6 characters)"
                              className="h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm pr-11"
                              minLength={6}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              tabIndex={-1}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="confirmPassword" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#b7004d]" />
                              Confirm New Password <span className="text-red-500">*</span>
                            </Label>
                            {passwordForm.confirmPassword && (
                              passwordForm.confirmPassword === passwordForm.newPassword ? (
                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Passwords match
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-rose-600">
                                  Passwords do not match
                                </span>
                              )
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="Re-enter your new password"
                              className={`h-11 rounded-2xl border-gray-200 focus:border-[#b7004d] text-sm pr-11 ${
                                passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                                  ? 'border-rose-300 focus:border-rose-500'
                                  : ''
                              }`}
                              minLength={6}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Password Action Buttons */}
                      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setShowCurrentPassword(false);
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }}
                          disabled={isUpdatingPassword}
                          className="w-full sm:w-auto rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-5 text-xs font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-2" />
                          Clear Fields
                        </Button>

                        <Button
                          type="submit"
                          disabled={
                            isUpdatingPassword ||
                            !passwordForm.currentPassword ||
                            passwordForm.newPassword.length < 6 ||
                            passwordForm.newPassword !== passwordForm.confirmPassword
                          }
                          className="w-full sm:w-auto bg-[#b7004d] hover:bg-[#92003d] disabled:opacity-50 text-white rounded-2xl px-8 py-5 text-xs font-bold shadow-lg shadow-[#b7004d]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
                        </Button>
                      </div>

                    </form>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      
                      {/* Banner pointing to View Full Profile & KYC */}
                      <div className="rounded-2xl p-4 bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-emerald-950">4-Step Verified Business & KYC Records</h4>
                            <p className="text-[11px] text-emerald-800/80 mt-0.5">
                              Looking to view or edit your verified Store Brand, Bank Settlement Account, PAN, or GSTIN?
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => navigate('/dropshipper-profile')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold px-4 py-2 shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                        >
                          <span>View Full Profile & KYC</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* ======================================================== */}
                      {/* BASIC PROFILE DETAILS FORM */}
                      {/* ======================================================== */}
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

                      </div>

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
                  )}
                </div>
              </div>
            </div>

            {/* DANGER ZONE: SOFT-DELETE & ACCOUNT DEACTIVATION */}
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Danger Zone
                  </div>
                  <h4 className="text-lg font-black text-rose-950">Deactivate Dropshipper Account</h4>
                  <p className="text-xs sm:text-sm text-rose-800/80 max-w-2xl leading-relaxed">
                    Temporarily close or deactivate your dropshipper account. All public product listings and store access will be safely paused. Past customer order items, return tracking, and wallet payouts are <strong>100% preserved</strong> via soft delete.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setDeactivateConfirmText('');
                    setIsDeactivatingModalOpen(true);
                  }}
                  className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-6 py-5 text-xs font-bold shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Deactivate Account</span>
                </Button>
              </div>
            </div>

          </div>
        ) : (
          /* ======================================================== */
          /* DEFAULT VIEW: TAB 2 - DASHBOARD OVERVIEW (MODULE 7: MASTER EXECUTIVE DASHBOARD) */
          /* ======================================================== */
          <div className="space-y-6 pb-24 md:pb-8">
            {/* 0. WELCOME & SYNC HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    Welcome back, {dashboardData?.partner?.storeName || dashboardData?.partner?.fullName || currentUser?.storeName || currentUser?.fullName || 'Dropship Partner'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-100 text-[#b7004d] border border-pink-200">
                    <Sparkles className="w-3 h-3" /> Dropshipper
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Master Executive Hub • Real-time PostgreSQL database metrics & order synchronization
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDashboardOverview(currentUid, true)}
                  disabled={isRefreshingDashboard || isLoadingDashboard}
                  className="h-10 px-4 rounded-2xl border-gray-200 hover:border-[#b7004d]/40 text-xs font-bold text-gray-700 hover:text-[#b7004d] gap-2 cursor-pointer transition-all bg-white shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDashboard ? 'animate-spin text-[#b7004d]' : ''}`} />
                  <span>{isRefreshingDashboard ? 'Syncing DB...' : 'Sync PostgreSQL'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/dropshipper-orders-push')}
                  className="h-10 px-4 rounded-2xl bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold shadow-md shadow-[#b7004d]/20 gap-1.5 cursor-pointer"
                >
                  <span>+ Push Order</span>
                </Button>
              </div>
            </div>

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
                    {isKycCompleted ? 'KYC Status: Verified Dropshipper Partner' : (isKycPending ? 'KYC Status: Under Review' : 'Step 2: Mandatory KYC & Compliance')}
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
                      ? 'Your store identity and payout bank account are fully verified. All order margins transfer directly and 100% ROT return shield is activated.'
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

            {/* 2. STATS & 4 CORE FINANCIAL / FULFILLMENT KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Net Margin Earned */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Cleared Margin</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                    ₹{Number(dashboardData?.kpis?.totalMarginEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {Number(dashboardData?.kpis?.escrowMarginLocked || 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                        <Clock className="w-3 h-3" /> ₹{Number(dashboardData?.kpis?.escrowMarginLocked || 0).toLocaleString('en-IN')} In Escrow Lock
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">₹0.00 locked in escrow</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Active Orders */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Dropship Pipeline</span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#b7004d] flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {dashboardData?.kpis?.activeOrdersCount || 0}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold mt-2">
                    {Number(dashboardData?.kpis?.activeOrdersCount || 0) > 0 
                      ? `${dashboardData?.kpis?.inTransitCount || 0} in-transit • ${dashboardData?.kpis?.dispatchedCount || 0} dispatched`
                      : '0 active consignments in transit'}
                  </p>
                </div>
              </div>

              {/* Card 3: ROT Return Shield */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ROT Shield Protection</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {dashboardData?.kpis?.rotShieldPercent || 100}%
                  </h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    {dashboardData?.kpis?.rotTierName || 'Platinum 100% Shield'} (Zero damage loss)
                  </p>
                </div>
              </div>

              {/* Card 4: Available Wallet Balance */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Wallet Balance</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                    ₹{Number(dashboardData?.kpis?.availableWalletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <button 
                    onClick={() => navigate('/dropshipper-settlements')}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold mt-2 inline-flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>Instant Payout & Ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. SECONDARY PERFORMANCE SUMMARY STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Gross Merchandise Value (GMV)</p>
                  <p className="text-lg font-black text-white mt-0.5">
                    ₹{Number(dashboardData?.kpis?.grossSalesRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-gray-400">Total customer orders billed</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:border-l md:border-white/10 md:pl-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Lifetime Fulfilled Orders</p>
                  <p className="text-lg font-black text-white mt-0.5">
                    {dashboardData?.kpis?.totalOrdersCount || 0} Total Orders
                  </p>
                  <p className="text-[11px] text-gray-400">{dashboardData?.kpis?.deliveredCount || 0} successfully delivered</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:border-l md:border-white/10 md:pl-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Headphones className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Support Desk & Disputes</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-lg font-black text-white">
                      {dashboardData?.kpis?.openTicketsCount || 0} Active Tickets
                    </p>
                    <button
                      onClick={() => navigate('/dropshipper-support')}
                      className="text-[11px] text-pink-300 hover:text-pink-200 underline font-semibold cursor-pointer"
                    >
                      View Desk →
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">{dashboardData?.kpis?.resolvedTicketsCount || 0} disputes resolved</p>
                </div>
              </div>
            </div>

            {/* 4. FAST ACTION NAVIGATION HUB */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Quick Operational Hub</h3>
                <span className="text-xs text-gray-400">Direct Module Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <h4 className="font-bold text-gray-900 mt-3 text-sm">Wholesale Sourcing Catalog</h4>
                  <p className="text-xs text-gray-500 mt-1">Discover trending B2B suppliers and zero-margin wholesale products.</p>
                </div>

                <div 
                  onClick={() => navigate('/dropshipper-orders-push')}
                  className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mt-3 text-sm">Push Customer Orders</h4>
                  <p className="text-xs text-gray-500 mt-1">Create single dispatch or bulk CSV with automated 4x6 thermal courier labels.</p>
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
                  <h4 className="font-bold text-gray-900 mt-3 text-sm">Settlement & Escrow Hub</h4>
                  <p className="text-xs text-gray-500 mt-1">Monitor COD remittances, escrow margin releases & bank withdrawals.</p>
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
                  <h4 className="font-bold text-gray-900 mt-3 text-sm">ROT Return Liability Policy</h4>
                  <p className="text-xs text-gray-500 mt-1">100% Reverse freight offset protection on customer RTO returns.</p>
                </div>

                <div 
                  onClick={() => navigate('/dropshipper-support')}
                  className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mt-3 text-sm">Helpdesk & Claims Support</h4>
                  <p className="text-xs text-gray-500 mt-1">Raise dispute tickets with proof photo/video upload for damaged or stuck orders.</p>
                </div>

                <div 
                  onClick={() => navigate('/dropshipper-margin-config')}
                  className="p-5 bg-white border border-gray-200/80 rounded-2xl hover:border-[#b7004d]/40 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Settings className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mt-3 text-sm">Margin Rules & Pricing Markup</h4>
                  <p className="text-xs text-gray-500 mt-1">Configure automated profit margin formulas and round-up psychological pricing.</p>
                </div>
              </div>
            </div>

            {/* 5. RECENT DROPSHIP ORDERS & CONSIGNMENTS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">Recent Customer Orders</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PostgreSQL Live
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time fulfillment tracking through verified suppliers and 3PL couriers</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dropshipper-orders-push')}
                    className="text-xs font-bold text-[#b7004d] border-pink-200 hover:bg-pink-50 rounded-xl cursor-pointer"
                  >
                    View All Orders →
                  </Button>
                </div>
              </div>

              {/* A. SKELETON LOADING STATE */}
              {isLoadingDashboard ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="h-16 rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : (
                <>
                  {/* B. CLEAN SLATE EMPTY STATE (0 ORDERS) */}
                  {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) ? (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200/80 bg-gray-50/50">
                      <div className="w-16 h-16 rounded-3xl bg-pink-100/70 text-[#b7004d] mx-auto flex items-center justify-center mb-4 shadow-sm">
                        <PackageSearch className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-black text-gray-900">No Dropship Orders Pushed Yet</h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Your customer orders will appear here in real-time once you push them from the sourcing hub or connect your store webhooks.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        <Button
                          onClick={() => navigate('/dropshipper-orders-push')}
                          className="bg-[#b7004d] hover:bg-[#96003f] text-white rounded-2xl px-5 py-5 text-xs font-bold shadow-md shadow-[#b7004d]/20 cursor-pointer"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1.5" />
                          <span>Push Your First Order</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/supplier-products')}
                          className="rounded-2xl px-5 py-5 text-xs font-bold border-gray-200 hover:bg-white cursor-pointer"
                        >
                          <Package className="w-4 h-4 mr-1.5 text-gray-600" />
                          <span>Browse Wholesale Catalog</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* C. DESKTOP TABLE VIEW */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                              <th className="pb-3 px-2">Order ID</th>
                              <th className="pb-3 px-2">Product Sourced</th>
                              <th className="pb-3 px-2">Destination</th>
                              <th className="pb-3 px-2">Customer Price</th>
                              <th className="pb-3 px-2">Your Margin</th>
                              <th className="pb-3 px-2">ROT Shield</th>
                              <th className="pb-3 px-2">Status</th>
                              <th className="pb-3 px-2 text-right">Courier / AWB</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 font-medium">
                            {dashboardData.recentOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                                <td className="py-4 px-2 font-mono text-gray-900 font-bold">
                                  #{ord.orderId}
                                </td>
                                <td className="py-4 px-2">
                                  <div className="flex items-center gap-2.5">
                                    {ord.productImage ? (
                                      <img
                                        src={ord.productImage}
                                        alt={ord.productTitle}
                                        className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center shrink-0">
                                        <Package className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div className="max-w-[180px]">
                                      <p className="text-gray-900 font-semibold truncate text-xs">{ord.productTitle}</p>
                                      <p className="text-[10px] text-gray-400">Qty: {ord.quantity || 1}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-2 text-gray-600">
                                  <p className="font-semibold text-gray-800 truncate max-w-[140px]">{ord.customerName}</p>
                                  <p className="text-[10px] text-gray-400">{ord.shippingCity || 'India'}</p>
                                </td>
                                <td className="py-4 px-2 text-gray-900 font-bold">
                                  ₹{Number(ord.customerPrice || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-2 text-emerald-600 font-bold">
                                  +₹{Number(ord.resellMargin || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-2">
                                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">
                                    <ShieldCheck className="w-3 h-3" /> Shielded
                                  </span>
                                </td>
                                <td className="py-4 px-2">
                                  <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                                    ord.status === 'DELIVERED'
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : (ord.status === 'IN_TRANSIT'
                                          ? 'text-blue-700 bg-blue-50'
                                          : (ord.status === 'CANCELLED'
                                              ? 'text-rose-700 bg-rose-50'
                                              : 'text-amber-700 bg-amber-50'))
                                  }`}>
                                    {ord.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                                    {ord.status === 'IN_TRANSIT' && <Clock className="w-3 h-3" />}
                                    {ord.status === 'DISPATCHED' && <Package className="w-3 h-3" />}
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="py-4 px-2 text-right">
                                  {ord.courierAwb ? (
                                    <span className="font-mono text-[11px] text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                                      {ord.courierAwb}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-gray-400">Processing AWB</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* D. MOBILE TOUCH CARDS VIEW */}
                      <div className="md:hidden space-y-3">
                        {dashboardData.recentOrders.map((ord) => (
                          <div key={ord.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-gray-900">#{ord.orderId}</span>
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                ord.status === 'DELIVERED'
                                  ? 'text-emerald-700 bg-emerald-100'
                                  : (ord.status === 'IN_TRANSIT'
                                      ? 'text-blue-700 bg-blue-100'
                                      : (ord.status === 'CANCELLED'
                                          ? 'text-rose-700 bg-rose-100'
                                          : 'text-amber-700 bg-amber-100'))
                              }`}>
                                {ord.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {ord.productImage ? (
                                <img
                                  src={ord.productImage}
                                  alt={ord.productTitle}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-pink-100 text-[#b7004d] flex items-center justify-center shrink-0">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-900 truncate">{ord.productTitle}</p>
                                <p className="text-[11px] text-gray-500">{ord.customerName} • {ord.shippingCity || 'India'}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                              <div>
                                <span className="text-gray-400 text-[10px] block">Customer Bill</span>
                                <span className="font-bold text-gray-900">₹{Number(ord.customerPrice || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-400 text-[10px] block">Net Margin</span>
                                <span className="font-bold text-emerald-600">+₹{Number(ord.resellMargin || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* SOFT DELETE / ACCOUNT DEACTIVATION CONFIRMATION MODAL */}
      {isDeactivatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900">Deactivate Dropshipper Account?</h3>
                <p className="text-xs text-gray-500">
                  This initiates a protected soft-deactivation of your account.
                </p>
              </div>
            </div>

            {/* Explanatory Callout */}
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mentor Requirement & Soft-Delete Safeguards:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
                <li>Your products will be <strong>hidden from new buyers</strong> immediately.</li>
                <li><strong>Past buyers will STILL see</strong> their orders, invoices, and delivery status.</li>
                <li>Your wallet ledger, margin history, and return tracking remain 100% safe.</li>
                <li>You can restore/reactivate anytime by logging back in.</li>
              </ul>
            </div>

            {/* Reason selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Reason for Deactivation
              </Label>
              <select
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-rose-500"
              >
                <option value="Temporary break / Business model switch">Temporary break / Business model switch</option>
                <option value="Switching primary supplier channels">Switching primary supplier channels</option>
                <option value="Updating store or tax entity information">Updating store or tax entity information</option>
                <option value="Other / Personal reasons">Other / Personal reasons</option>
              </select>
            </div>

            {/* Type DEACTIVATE Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Type <span className="font-mono text-rose-600 font-black">DEACTIVATE</span> to confirm:
                </Label>
                {(deactivateConfirmText || '').trim().toUpperCase() === 'DEACTIVATE' && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Confirmed
                  </span>
                )}
              </div>
              <Input
                type="text"
                placeholder="Type DEACTIVATE"
                value={deactivateConfirmText}
                onChange={(e) => setDeactivateConfirmText(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (deactivateConfirmText || '').trim().toUpperCase() === 'DEACTIVATE' && !isSubmittingDeactivation) {
                    handleDeactivateAccount();
                  }
                }}
                className={`h-11 rounded-2xl border-gray-200 focus:border-rose-500 font-mono text-sm uppercase tracking-wider ${
                  (deactivateConfirmText || '').trim().toUpperCase() === 'DEACTIVATE'
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900 focus:border-emerald-600'
                    : ''
                }`}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingDeactivation}
                onClick={() => {
                  setIsDeactivatingModalOpen(false);
                  setDeactivateConfirmText('');
                }}
                className="rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-5 text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={(deactivateConfirmText || '').trim().toUpperCase() !== 'DEACTIVATE' || isSubmittingDeactivation}
                onClick={handleDeactivateAccount}
                className={`text-white rounded-2xl px-6 py-5 text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
                  (deactivateConfirmText || '').trim().toUpperCase() === 'DEACTIVATE' && !isSubmittingDeactivation
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 cursor-pointer'
                    : 'bg-rose-400 opacity-50 cursor-not-allowed shadow-none'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmittingDeactivation ? 'Deactivating...' : 'Confirm Deactivation'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
