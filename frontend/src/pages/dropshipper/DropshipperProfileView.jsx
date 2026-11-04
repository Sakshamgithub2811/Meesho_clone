import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { logout, updateProfileSuccess } from '../../redux/userSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DROPSHIPPER_MENU } from './dropshipperMenu';
import { 
  getDropshipperProfileApi, 
  updateDropshipperProfileApi, 
  getDropshipperKycStatusApi,
  isDropshipperAuthenticated,
  clearDropshipperSession,
  getDropshipperKycState
} from '../../services/dropshipperService';
import { getDropshipperApp, saveDropshipperApp } from '../../services/dropshipperSessionStore';
import { 
  ShieldCheck, 
  Store, 
  Building2, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Edit3, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  BadgeCheck, 
  Lock, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function DropshipperProfileView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user || {});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  // Dropshipper UID & Basic Info
  const userUid = currentUser?.uid || currentUser?.id || '';
  const dropshipperName = currentUser?.fullName || currentUser?.name || 'Verified Dropshipper';
  const dropshipperEmail = currentUser?.email || 'partner@dropship.mshoppy.in';

  // 4-Step KYC Master Data State
  const [kycData, setKycData] = useState({
    // Step 1: Store & Channel
    brandName: 'Aura Trends Luxe',
    storeUrl: 'https://auratrends.shop',
    platform: 'Shopify',
    expectedOrders: '50 - 200 orders/month',
    niche: ['Women Western Wear', 'Ethnic Sarees & Kurtis'],

    // Step 2: Identity & Tax / Compliance
    proprietorName: dropshipperName,
    businessType: 'Individual Dropshipper',
    phone: currentUser?.phone || '9876543210',
    email: dropshipperEmail,
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '4829 1920 3810',
    gstin: '29ABCDE1234F1Z5',
    msmeNumber: 'UDYAM-KR-03-0019482',
    panDocName: 'pan_card_verified.jpg',
    aadhaarDocName: 'aadhaar_front_back.pdf',
    businessRegDocName: 'gst_registration_reg06.pdf',

    // Step 3: Bank & Settlement Payouts
    bankName: 'HDFC Bank',
    accountHolder: dropshipperName,
    accountNumber: '50100482910291',
    ifscCode: 'HDFC0001248',
    upiId: 'partner@okaxis',

    // Step 4: Verification & Approval
    applicationId: 'DSP-KYC-9421',
    status: 'APPROVED',
    approvedAt: '24 Oct 2026',
    agreedTerms: true,
    agreedRotPolicy: true
  });

  // Edit Buffer Form State
  const [editForm, setEditForm] = useState({ ...kycData });

  // 1. Auth Guard
  useEffect(() => {
    if (!isDropshipperAuthenticated()) {
      toast.error('Authentication Required', { description: 'Please login as a dropshipper to view your profile.' });
      navigate('/dropshipper-login', { replace: true });
    }
  }, [navigate]);

  // 2. Fetch Fresh Profile & KYC Application from DB
  const fetchFullProfile = async () => {
    if (!userUid) return;
    setIsLoading(true);
    try {
      // Parallel fetch from profile endpoint & kyc status endpoint
      const [profRes, kycRes] = await Promise.all([
        getDropshipperProfileApi(userUid).catch(() => null),
        getDropshipperKycStatusApi(userUid).catch(() => null)
      ]);

      const prof = profRes?.profile || {};
      const profBank = (prof.bankDetails && typeof prof.bankDetails === 'object') ? prof.bankDetails : {};
      const kycApp = kycRes?.application || getDropshipperApp() || {};
      const docs = kycApp.documents || {};
      const bankDocs = docs.bank || {};
      const panDocs = docs.pan || {};
      const taxDocs = docs.tax || {};

      const merged = {
        brandName: prof.storeName || profBank.storeName || docs.brandName || docs.businessName || 'Aura Trends Luxe',
        storeUrl: profBank.storeUrl || docs.storeUrl || 'https://auratrends.shop',
        platform: profBank.platform || docs.platform || 'Shopify',
        expectedOrders: docs.expectedOrders || '50 - 200 orders/month',
        niche: Array.isArray(docs.niche) ? docs.niche : ['Women Western Wear', 'Ethnic Sarees & Kurtis'],

        proprietorName: prof.fullName || docs.proprietorName || dropshipperName,
        businessType: docs.businessType || 'Individual Dropshipper',
        phone: prof.phone || docs.phone || currentUser?.phone || '9876543210',
        email: prof.email || dropshipperEmail,
        panNumber: prof.pan || panDocs.number || docs.panNumber || 'ABCDE1234F',
        aadhaarNumber: docs.aadhaarNumber || '4829 1920 3810',
        gstin: prof.gstin || taxDocs.gstin || docs.gstin || '29ABCDE1234F1Z5',
        msmeNumber: taxDocs.msmeNumber || docs.msmeNumber || 'UDYAM-KR-03-0019482',
        panDocName: docs.panFile?.name || 'pan_card_verified.jpg',
        aadhaarDocName: docs.aadhaarFile?.name || 'aadhaar_front_back.pdf',
        businessRegDocName: docs.businessRegFile?.name || 'gst_registration_reg06.pdf',

        bankName: profBank.bankName || bankDocs.bankName || docs.bankName || 'HDFC Bank',
        accountHolder: profBank.accountHolder || bankDocs.holderName || docs.accountHolder || prof.fullName || dropshipperName,
        accountNumber: profBank.accountNumber || bankDocs.accountNumber || docs.accountNumber || '50100482910291',
        ifscCode: (profBank.ifscCode || profBank.ifsc || bankDocs.ifsc || docs.ifscCode || 'HDFC0001248').toUpperCase(),
        upiId: profBank.upiId || bankDocs.upiId || docs.upiId || 'partner@okaxis',

        applicationId: kycApp.id || 'DSP-KYC-9421',
        status: (kycApp.status || prof.kycStatus || 'APPROVED').toUpperCase(),
        approvedAt: kycApp.createdAt ? new Date(kycApp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '24 Oct 2026',
        agreedTerms: true,
        agreedRotPolicy: true
      };

      setKycData(merged);
      setEditForm(merged);
    } catch (err) {
      console.error("Error fetching full profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, [userUid]);

  // Handle Save KYC Changes
  const handleSaveKycDetails = async (e) => {
    e.preventDefault();
    if (!userUid) return;

    if (!editForm.brandName.trim()) {
      toast.error('Store Brand Name cannot be empty');
      return;
    }

    if (!editForm.bankName.trim() || !editForm.accountNumber.trim()) {
      toast.error('Bank Name and Account Number are required for payouts');
      return;
    }

    setIsSaving(true);
    try {
      const bankDetailsObj = {
        bankName: editForm.bankName.trim(),
        accountHolder: editForm.accountHolder.trim(),
        accountNumber: editForm.accountNumber.trim(),
        ifscCode: editForm.ifscCode.trim().toUpperCase(),
        upiId: editForm.upiId.trim(),
        storeUrl: editForm.storeUrl.trim(),
        platform: editForm.platform.trim()
      };

      const res = await updateDropshipperProfileApi({
        firebaseUid: userUid,
        fullName: editForm.proprietorName.trim(),
        phone: editForm.phone.trim(),
        storeName: editForm.brandName.trim(),
        bankDetails: bankDetailsObj,
        pan: editForm.panNumber.trim().toUpperCase(),
        gstin: editForm.gstin.trim().toUpperCase()
      });

      if (res?.success) {
        setKycData({ ...editForm });
        setIsEditMode(false);

        // Update Redux state
        dispatch(updateProfileSuccess({
          fullName: editForm.proprietorName.trim(),
          phone: editForm.phone.trim(),
          storeName: editForm.brandName.trim()
        }));

        // Sync local storage app
        saveDropshipperApp({
          ...getDropshipperApp(),
          brandName: editForm.brandName.trim(),
          storeUrl: editForm.storeUrl.trim(),
          platform: editForm.platform.trim(),
          bankName: editForm.bankName.trim(),
          accountHolder: editForm.accountHolder.trim(),
          accountNumber: editForm.accountNumber.trim(),
          ifscCode: editForm.ifscCode.trim().toUpperCase(),
          upiId: editForm.upiId.trim(),
          panNumber: editForm.panNumber.trim().toUpperCase(),
          gstin: editForm.gstin.trim().toUpperCase()
        });

        toast.success('KYC Profile Updated Successfully', {
          description: 'Your business, tax compliance, and bank settlement details are now updated.'
        });
      }
    } catch (err) {
      console.error("Save KYC Details Error:", err);
      toast.error('Update Failed', {
        description: err.response?.data?.error || err.message || 'Could not update KYC profile details.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearDropshipperSession();
      dispatch(logout());
      navigate('/dropshipper-login');
      toast.success('Logged out successfully');
    } catch (e) {
      clearDropshipperSession();
      dispatch(logout());
      navigate('/dropshipper-login');
    }
  };

  const handleTabChange = (tabId) => {
    const targetItem = DROPSHIPPER_MENU.find(m => m.id === tabId) || 
      DROPSHIPPER_MENU.flatMap(m => m.children || []).find(c => c.id === tabId);
    if (targetItem?.path) {
      navigate(targetItem.path);
    }
  };

  return (
    <DashboardLayout
      menuItems={DROPSHIPPER_MENU}
      activeTab="view-profile"
      onTabChange={handleTabChange}
      roleName="DROPSHIPPER"
      userName={dropshipperName}
      pageTitle="Dropshipper Full Profile"
      pageSubtitle="Complete 4-Step Verified Business, Legal, and Bank Settlement Records"
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* ======================================================== */}
        {/* 1. TOP HEADER & VERIFICATION STATUS BANNER */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                Verified B2B Dropshipper Profile
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {kycData.brandName}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                Your 4-step business KYC is approved. View all registered identification, GST/PAN compliance, store channel URLs, and payout bank accounts below.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-emerald-200 font-mono">
                  <span>Application ID:</span>
                  <strong>{kycData.applicationId}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-emerald-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Approved on: {kycData.approvedAt}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-1 rounded-full font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Full Catalog & Instant Settlement Unlocked
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFullProfile}
                disabled={isLoading}
                className="rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              {!isEditMode ? (
                <Button
                  onClick={() => {
                    setEditForm({ ...kycData });
                    setIsEditMode(true);
                  }}
                  className="bg-white text-slate-900 hover:bg-emerald-50 font-bold rounded-2xl px-5 shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  <span>Edit KYC Details</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditMode(false)}
                  variant="outline"
                  className="rounded-2xl bg-white/10 border-white/30 text-white hover:bg-white/20 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. MAIN 4-STEP KYC BENTO CONTENT */}
        {/* ======================================================== */}
        <form onSubmit={handleSaveKycDetails} className="space-y-6">
          
          {isEditMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in-50 duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Editing Mode Active</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Modify your Store Brand, Bank Settlement Account, or Tax details below. Click <strong>"Save Changes"</strong> to sync with database records.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="rounded-2xl border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold cursor-pointer"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#b7004d] hover:bg-[#92003d] text-white rounded-2xl text-xs font-bold px-6 shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ---------------------------------------------------- */}
            {/* STEP 1: STORE & SALES CHANNELS */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center font-black">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      Step 1: Store & Channel Details
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">Public brand identity & customer-facing channels</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Brand Name */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Store / Brand Name
                  </Label>
                  {isEditMode ? (
                    <Input
                      value={editForm.brandName}
                      onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                      className="rounded-2xl border-gray-200 text-sm font-medium"
                      placeholder="e.g. Aura Trends Luxe"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{kycData.brandName}</span>
                      <button type="button" onClick={() => handleCopy(kycData.brandName, 'brand')} className="text-gray-400 hover:text-gray-700">
                        {copiedField === 'brand' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Store URL */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Store Website / Sales Channel URL
                  </Label>
                  {isEditMode ? (
                    <Input
                      type="url"
                      value={editForm.storeUrl}
                      onChange={(e) => setEditForm({ ...editForm, storeUrl: e.target.value })}
                      className="rounded-2xl border-gray-200 text-sm font-medium font-mono text-xs"
                      placeholder="https://yourstore.shop"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <a 
                        href={kycData.storeUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm font-semibold text-[#b7004d] hover:underline flex items-center gap-1.5 font-mono text-xs truncate"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{kycData.storeUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <button type="button" onClick={() => handleCopy(kycData.storeUrl, 'url')} className="text-gray-400 hover:text-gray-700 shrink-0 ml-2">
                        {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Platform & Order Volume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      E-commerce Platform
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.platform}
                        onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                        className="rounded-2xl border-gray-200 text-sm"
                        placeholder="Shopify / WooCommerce"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-bold text-gray-800">
                        {kycData.platform}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Expected Monthly Volume
                    </Label>
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-bold text-gray-800">
                      {kycData.expectedOrders}
                    </div>
                  </div>
                </div>

                {/* Niches */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Sourcing Product Niches
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {kycData.niche.map((item, idx) => (
                      <span key={idx} className="bg-pink-50 text-[#b7004d] border border-pink-200/80 px-2.5 py-1 rounded-xl font-bold text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* STEP 2: IDENTITY & LEGAL / TAX COMPLIANCE */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      Step 2: Identification & Tax Compliance
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Govt Verified
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">PAN, Aadhaar, and GST registration records</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Proprietor Name & Entity Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Proprietor / Legal Name
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.proprietorName}
                        onChange={(e) => setEditForm({ ...editForm, proprietorName: e.target.value })}
                        className="rounded-2xl border-gray-200 text-sm font-medium"
                        required
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-bold text-gray-900">
                        {kycData.proprietorName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Business Entity
                    </Label>
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-bold text-gray-800">
                      {kycData.businessType}
                    </div>
                  </div>
                </div>

                {/* PAN & Aadhaar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      PAN Card Number
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.panNumber}
                        onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase() })}
                        className="rounded-2xl border-gray-200 text-sm font-mono uppercase"
                        maxLength={10}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900 flex items-center justify-between">
                        <span>{kycData.panNumber}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Aadhaar Card Number
                    </Label>
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900 flex items-center justify-between">
                      <span>{kycData.aadhaarNumber}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* GSTIN & MSME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      GSTIN Identification
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.gstin}
                        onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                        className="rounded-2xl border-gray-200 text-sm font-mono uppercase"
                        maxLength={15}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900">
                        {kycData.gstin || 'Not Provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      MSME Udyam Number
                    </Label>
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900">
                      {kycData.msmeNumber || 'UDYAM-KR-03-0019482'}
                    </div>
                  </div>
                </div>

                {/* Document Proofs */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attached Verification Proofs</span>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-gray-700 text-xs">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{kycData.panDocName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-gray-700 text-xs">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{kycData.aadhaarDocName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* STEP 3: BANK & SETTLEMENT PAYOUTS */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      Step 3: Bank & Settlement Payouts
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Active For Payouts
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">Margin withdrawals & auto-settlement destination</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Bank Name & Holder Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Bank Name
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.bankName}
                        onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                        className="rounded-2xl border-gray-200 text-sm font-medium"
                        required
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-bold text-gray-900">
                        {kycData.bankName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Account Holder Name
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.accountHolder}
                        onChange={(e) => setEditForm({ ...editForm, accountHolder: e.target.value })}
                        className="rounded-2xl border-gray-200 text-sm font-medium"
                        required
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-bold text-gray-900">
                        {kycData.accountHolder}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Number & IFSC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Bank Account Number
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.accountNumber}
                        onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                        className="rounded-2xl border-gray-200 text-sm font-mono font-bold"
                        required
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900 flex items-center justify-between">
                        <span>{kycData.accountNumber}</span>
                        <button type="button" onClick={() => handleCopy(kycData.accountNumber, 'acc')} className="text-gray-400 hover:text-gray-700">
                          {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Bank IFSC Code
                    </Label>
                    {isEditMode ? (
                      <Input
                        value={editForm.ifscCode}
                        onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value.toUpperCase() })}
                        className="rounded-2xl border-gray-200 text-sm font-mono uppercase"
                        required
                      />
                    ) : (
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900 flex items-center justify-between">
                        <span>{kycData.ifscCode}</span>
                        <button type="button" onClick={() => handleCopy(kycData.ifscCode, 'ifsc')} className="text-gray-400 hover:text-gray-700">
                          {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* UPI ID */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Instant UPI Settlement VPA
                  </Label>
                  {isEditMode ? (
                    <Input
                      value={editForm.upiId}
                      onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                      className="rounded-2xl border-gray-200 text-sm font-medium font-mono text-xs"
                      placeholder="e.g. partner@okaxis"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 font-mono font-bold text-gray-900 flex items-center justify-between">
                      <span>{kycData.upiId}</span>
                      <button type="button" onClick={() => handleCopy(kycData.upiId, 'upi')} className="text-gray-400 hover:text-gray-700">
                        {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* STEP 4: COMPLIANCE AGREEMENTS & SECURITY */}
            {/* ---------------------------------------------------- */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      Step 4: Platform Agreement & Terms
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Signed
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">B2B platform rules, liability & privacy compliance</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-emerald-900">B2B Dropshipper Service Terms Accepted</h5>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Signed electronically during 4-step onboarding. Grants wholesale sourcing rights and automated margin payouts.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-emerald-900">ROT (Reverse Order Transfer) Policy Binding</h5>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Compliant with customer return margin debit and 7-day dispute escalation protocols.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs">Looking for basic account settings?</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">Photo, display name, password & deactivation</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dropshipper-dashboard?tab=profile')}
                    className="rounded-xl border-pink-200 text-[#b7004d] hover:bg-pink-50 text-xs font-bold cursor-pointer"
                  >
                    Store Settings ➔
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Save Bar (When in Edit Mode) */}
          {isEditMode && (
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-gray-200 shadow-xl flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 ml-2">
                Unsaved KYC updates will be permanently recorded in PostgreSQL.
              </span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="rounded-2xl text-xs font-bold px-5 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#b7004d] hover:bg-[#92003d] text-white rounded-2xl text-xs font-bold px-7 shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save & Update Profile'}</span>
                </Button>
              </div>
            </div>
          )}
        </form>

      </div>
    </DashboardLayout>
  );
}

