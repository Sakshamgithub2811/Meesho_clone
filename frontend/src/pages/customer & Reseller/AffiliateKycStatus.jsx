import { API_BASE, API_V1_BASE } from '../../config/apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getAffiliateApp,
  saveAffiliateApp,
  subscribeAffiliateApp,
  clearAffiliateApp,
} from '../../services/affiliateSessionStore';
import { getStoredCustomer } from '../../services/customerAuthService';
import { getStoredAffiliate } from '../../services/affiliateAuthService';

export default function AffiliateKycStatus({ onNavigate, onBack }) {
  const navigate = useNavigate();

  const handleNav = (target) => {
    if (onNavigate) {
      try {
        onNavigate(target);
      } catch (e) {
        console.error('onNavigate error', e);
      }
    }
    navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const handleGoBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onNavigate) {
      try {
        onNavigate('/user-dashboard1');
      } catch (err) {
        console.error('onNavigate error', err);
      }
    }
    navigate('/user-dashboard1');
    if (window.location.pathname !== '/user-dashboard1') {
      window.location.href = '/user-dashboard1';
    }
  };

  // Live synced affiliate app state - strictly scoped to active user
  const [app, setApp] = useState(() => getAffiliateApp());

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAffiliateApp((updated) => {
      setApp(updated);
    });
    return unsubscribe;
  }, []);

  // Live sync with real PostgreSQL database backend scoped to the currently logged in user
  useEffect(() => {
    let isMounted = true;

    const syncLiveStatus = async () => {
      try {
        const storedCust = getStoredCustomer();
        const storedAff = getStoredAffiliate();
        const currentUser = storedCust?.user || storedAff?.user;

        const curId = currentUser?.id || currentUser?.uid;
        const curEmail = currentUser?.email;
        const curPhone = currentUser?.phone;

        if (!curId && !curEmail && !curPhone) {
          if (isMounted) setApp(null);
          return;
        }

        const queryParams = [];
        if (curId) queryParams.push(`userId=${encodeURIComponent(curId)}`);
        if (curEmail) queryParams.push(`email=${encodeURIComponent(curEmail)}`);
        if (curPhone) queryParams.push(`phone=${encodeURIComponent(curPhone)}`);
        if (app?.applicationId) queryParams.push(`applicationId=${encodeURIComponent(app.applicationId)}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const res = await fetch(`${API_V1_BASE}/admin-kyc/affiliate-status${queryString}`);
        if (!res.ok) return;

        const data = await res.json();
        if (isMounted) {
          if (data?.application) {
            const dbApp = data.application;
            const isDbApproved = dbApp.status === 'APPROVED';
            const isDbRejected = dbApp.status === 'REJECTED';
            const currentStatus = isDbApproved ? 'Approved' : isDbRejected ? 'Rejected' : 'Under Review';

            const updated = {
              ...(dbApp.documents || {}),
              id: dbApp.id,
              dbId: dbApp.id,
              applicationId: dbApp.documents?.applicationId || dbApp.id,
              fullName: dbApp.documents?.fullName || dbApp.user?.fullName || '',
              status: currentStatus,
              kycStatus: isDbApproved ? 'Approved' : isDbRejected ? 'Rejected' : 'Pending',
              rejectionReason: dbApp.adminNotes || '',
              userId: dbApp.userId,
            };
            setApp(updated);
            saveAffiliateApp(updated);
          } else {
            // No affiliate application in DB for this authenticated user
            setApp(null);
            clearAffiliateApp();
          }
        }
      } catch (err) {
        console.warn('Live KYC sync network error:', err.message);
      }
    };

    syncLiveStatus();
    const interval = setInterval(syncLiveStatus, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const status = app?.status || 'Under Review';
  const isApproved = Boolean(app) && (status === 'Approved' || status === 'APPROVED');
  const isRejected = Boolean(app) && (status === 'Rejected' || status === 'REJECTED');
  const isUnderReview = Boolean(app) && !isApproved && !isRejected;

  const verificationStages = app
    ? [
        {
          id: 1,
          title: 'Application & Dossier Submitted',
          description: 'Identity proofs and bank mandate received securely via 256-bit SSL.',
          status: 'completed',
          timestamp: app.submittedAt || 'Submitted',
          icon: 'cloud_done',
        },
        {
          id: 2,
          title: 'Automated Govt NSDL & UIDAI OCR Check',
          description: 'PAN card format and name matching with National Securities Depository Limited.',
          status: isRejected ? 'failed' : 'completed',
          timestamp: app.submittedAt || 'Verified',
          icon: isRejected ? 'cancel' : 'verified_user',
        },
        {
          id: 3,
          title: '₹1 Bank Account Verification',
          description: 'NPCI ₹1 test deposit check to ensure seamless commission payout disbursement.',
          status: isApproved ? 'completed' : isRejected ? 'failed' : 'in_progress',
          timestamp: isApproved ? 'Completed' : 'Verification underway',
          icon: 'account_balance',
        },
        {
          id: 4,
          title: 'Final Verification & Commission Activation',
          description: 'Final compliance desk approval and generation of trackable affiliate referral URLs.',
          status: isApproved ? 'completed' : 'pending',
          timestamp: isApproved ? 'Active & Approved' : 'Estimated ~24 hrs',
          icon: 'verified',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0d0914] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#FF3F6C] text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/20 animate-bounce">
          <span className="material-symbols-outlined text-base">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#150d1e]/90 backdrop-blur-xl border-b border-pink-500/15 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGoBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
              title="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Affiliate KYC Verification Desk
                </h1>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    app
                      ? 'bg-pink-500/20 text-[#FF3F6C] border-pink-500/30'
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}
                >
                  {app ? `App #${app.applicationId || app.id}` : 'Not Submitted'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Real-time compliance status &amp; commission approval pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {app && (
              <button
                onClick={() => setShowSlipModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/15 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>View Slip</span>
              </button>
            )}
            <button
              onClick={() => handleNav(app ? '/affiliate-kyc?edit=true' : '/affiliate-kyc')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3F6C] to-[#b90041] text-white text-xs font-extrabold hover:opacity-95 shadow-md shadow-[#FF3F6C]/25 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">{app ? 'edit_document' : 'add_task'}</span>
              <span>{app ? 'Edit Details' : 'Submit KYC'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 pb-28">
        {/* Official Merchant Compliance Notice Bar */}
        <div className="p-4 bg-gradient-to-r from-[#1f152b] via-[#2a1333] to-[#1f152b] rounded-2xl border border-pink-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/30">
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 text-sm">MShoppy Merchant Compliance Desk</span>
                <span className="bg-pink-500/20 text-pink-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-pink-500/30">
                  Official Verification
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                KYC submissions are processed by our verification team within 24 to 48 business hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <span
              className={`font-black uppercase px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 ${
                !app
                  ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                  : isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isRejected
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !app
                    ? 'bg-slate-400'
                    : isApproved
                    ? 'bg-emerald-400'
                    : isRejected
                    ? 'bg-rose-400'
                    : 'bg-amber-400 animate-ping'
                }`}
              ></span>
              {!app
                ? 'Not Submitted'
                : isApproved
                ? 'Verified & Approved'
                : isRejected
                ? 'Action Needed'
                : 'Under Verification'}
            </span>
          </div>
        </div>

        {/* Dynamic Status Hero Card */}
        {!app ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1b1226] via-[#160d20] to-[#22102e] p-8 sm:p-10 text-white shadow-2xl border border-pink-500/30 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-pink-500/20 text-[#FF3F6C] flex items-center justify-center mx-auto border border-pink-500/30 shadow-lg shadow-pink-500/10">
              <span className="material-symbols-outlined text-3xl">assignment_late</span>
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-[11px] font-black text-pink-300 uppercase tracking-wider">
                <span>KYC Verification Required</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                No Affiliate KYC Application Found
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                You haven't submitted your KYC verification yet. Submit your personal identity, PAN number, and bank account mandate to get verified and start earning affiliate commissions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleNav('/affiliate-kyc')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3F6C] to-[#e0004d] hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-[#FF3F6C]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
                <span>Start Affiliate KYC Application</span>
              </button>
              <button
                onClick={handleGoBack}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm border border-white/15 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
          </section>
        ) : isApproved ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#023b20] via-[#092b1a] to-[#044026] p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/40">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Verified Affiliate Partner • Active</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Congratulations, {app.fullName || 'Partner'}! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  Your KYC documents and bank mandate have been fully authenticated by the MShoppy compliance desk.
                  You are now officially enrolled in the <strong>{app.tier || 'Affiliate Partner'}</strong> tier with{' '}
                  <strong className="text-emerald-300 font-extrabold">Dynamic Profit Margins on Every Shared Product</strong>.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-black/30 border border-emerald-500/30 font-mono text-emerald-200">
                    Referral Code:{' '}
                    <strong>
                      {app.handle
                        ? app.handle.replace('@', '').toUpperCase()
                        : ((app.fullName || 'AFF').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) + 'AFF')}
                    </strong>
                  </span>
                  <span className="text-emerald-300 font-bold">Weekly Bank Auto-Payouts Active</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={() => handleNav('/user-dashboard1?tab=affiliate')}
                  className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span>Open Affiliate Hub</span>
                </button>
                <button
                  onClick={() => handleNav('/reseller-home')}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  <span>Browse Products to Share</span>
                </button>
              </div>
            </div>
          </section>
        ) : isRejected ? (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#440c15] via-[#2c0810] to-[#50101b] p-6 sm:p-8 text-white shadow-2xl border border-rose-500/40">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/25 border border-rose-400/40 text-[11px] font-black text-rose-300 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
                  <span>Compliance Action Required • App #{app.applicationId || app.id}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  KYC Verification Needs Attention ⚠️
                </h2>
                <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/40 text-xs sm:text-sm space-y-1">
                  <span className="text-rose-300 font-extrabold block">Verification Feedback:</span>
                  <p className="text-rose-100 font-medium">
                    {app.rejectionReason ||
                      'Document photo was unclear or details did not match records. Please upload a clear photo and resubmit.'}
                  </p>
                </div>
                <p className="text-xs text-slate-300">
                  Don't worry! You can easily update your document proof or correct details and re-submit for review.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={() => handleNav('/affiliate-kyc?edit=true')}
                  className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">edit_document</span>
                  <span>Fix &amp; Resubmit KYC</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c0e2a] via-[#1a0c24] to-[#38112c] p-6 sm:p-8 text-white shadow-2xl border border-pink-500/35">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-black text-amber-300 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Verification In Progress • In Compliance Queue</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Your Affiliate KYC is Under Review ⏳
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  Submitted for <strong className="text-white">{app.fullName || 'Applicant'}</strong>
                  {app.handle ? (
                    <>
                      {' ('}
                      <span className="font-mono text-pink-300 font-bold">{app.handle}</span>
                      {')'}
                    </>
                  ) : null}
                  . The compliance desk is verifying your government ID and bank account details. Estimated turnaround is{' '}
                  <strong className="text-amber-300 font-extrabold">24-48 hours</strong>.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                    <span>Dossier Received</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm text-amber-400 animate-spin">sync</span>
                    <span>Bank Verification in Progress</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={() => triggerToast('Checking live status... All checks normal!')}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  <span>Refresh Live Queue</span>
                </button>
                <button
                  onClick={() => handleNav('/affiliate-kyc?edit=true')}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  <span>Update Details</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 4-Stage Visual Verification Pipeline */}
        {app && (
          <section className="bg-[#170e22] rounded-3xl p-6 sm:p-7 border border-pink-500/20 shadow-xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-400">timeline</span>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Live Verification Stage Timeline
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Tracking ID: <span className="font-mono text-pink-300 font-extrabold">{app.applicationId || app.id}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {verificationStages.map((stage) => {
                const isDone = stage.status === 'completed';
                const isCurrent = stage.status === 'in_progress';
                const isFail = stage.status === 'failed';

                return (
                  <div
                    key={stage.id}
                    className={`rounded-2xl p-4 transition-all border flex flex-col justify-between space-y-3 ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-sm'
                        : isFail
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-100 shadow-sm'
                        : isCurrent
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-100 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isFail
                            ? 'bg-rose-500 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isDone ? '✓' : isFail ? '✕' : stage.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isFail
                            ? 'bg-rose-500/20 text-rose-300'
                            : isCurrent
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isDone ? 'Done' : isFail ? 'Flagged' : isCurrent ? 'Active' : 'Queued'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-white leading-snug">{stage.title}</h4>
                      <p className="text-[11px] leading-relaxed opacity-80">{stage.description}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="opacity-70">Timestamp:</span>
                      <span className="font-mono font-bold">{stage.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Submitted Dossier & Identity Proofs Breakdown */}
        {app && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card 1: Personal & Channel Identity */}
            <div className="bg-[#170e22] rounded-3xl p-5 sm:p-6 border border-pink-500/20 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF3F6C] to-[#b90041] flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Creator &amp; Profile</h4>
                  <p className="text-[11px] text-slate-400">Personal &amp; channel identity</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Full Legal Name:</span>
                  <span className="font-extrabold text-white">{app.fullName || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Application ID:</span>
                  <span className="font-mono font-bold text-pink-300">{app.applicationId || app.id || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Phone Number:</span>
                  <span className="font-bold text-white">{app.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="font-bold text-slate-200 truncate max-w-[160px]">
                    {app.email || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Audience Scope:</span>
                  <span className="font-bold text-emerald-400">
                    {app.followers && app.followers !== '0'
                      ? `${app.followers} (${app.platform || 'Social'})`
                      : (app.platform || 'Direct / Social')}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Government Documents */}
            <div className="bg-[#170e22] rounded-3xl p-5 sm:p-6 border border-pink-500/20 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-md">
                  <span className="material-symbols-outlined text-xl">badge</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Government ID Proofs</h4>
                  <p className="text-[11px] text-slate-400">Income Tax &amp; Identity Vault</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">PAN Identifier:</span>
                  <span className="font-mono font-bold text-white tracking-widest">
                    {app.panNumber || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">PAN Verification:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    NSDL Authenticated
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Aadhaar Mandate:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {app.aadhaarNumber ? `•••• •••• ${app.aadhaarNumber.slice(-4)}` : 'Submitted'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Uploaded Proofs:</span>
                  <span className="font-medium text-pink-300 truncate max-w-[140px]">
                    {app.panDocName || 'PAN_Document.pdf'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Security:</span>
                  <span className="text-[11px] font-bold text-slate-300">AES-256 Cloud Vault</span>
                </div>
              </div>
            </div>

            {/* Card 3: Bank Account & Payout Details */}
            <div className="bg-[#170e22] rounded-3xl p-5 sm:p-6 border border-pink-500/20 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <span className="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Bank Payout Mandate</h4>
                  <p className="text-[11px] text-slate-400">Direct weekly payout routing</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-white">{app.bankName || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-white">
                    {app.accountNumber ? `••••••••${app.accountNumber.slice(-4)}` : '••••••••'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="font-mono font-bold text-slate-200">{app.ifscCode || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Bank Verification:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    ₹1 NPCI Test Mandate
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Payout Cycle:</span>
                  <span className="font-bold text-amber-300">Every Tuesday (Automated)</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Frequently Asked Questions Accordion */}
        <section className="bg-[#170e22] rounded-3xl p-6 sm:p-7 border border-pink-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-400">help</span>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Affiliate KYC Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-2 pt-2">
            {[
              {
                q: 'How long does the KYC verification process take?',
                a: 'Standard automated OCR document checks take 15 minutes. Manual compliance cross-verification takes between 24-48 business hours.',
              },
              {
                q: 'Can I start generating referral links before KYC approval?',
                a: 'You can explore products and bookmark them, but commission earnings and active tracking links will activate once your verification is completed.',
              },
              {
                q: 'How and when are affiliate commissions paid out?',
                a: 'Commissions are calculated on delivered, non-returned customer orders and automatically deposited to your verified bank account every Tuesday.',
              },
              {
                q: 'What should I do if my KYC is rejected or marked "Action Needed"?',
                a: 'Review the feedback box shown at the top of this status tracker, click "Fix & Resubmit KYC", and upload clearer photos of your document proofs.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-base transition-transform">
                    {activeFaq === idx ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer Support Desk Strip */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-pink-400 text-xl">support_agent</span>
            <span className="text-slate-300">
              Need urgent priority review for high-volume creator channels?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav('/raise-ticket')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
            >
              Live Chat
            </button>
            <button
              onClick={() => handleNav('/raise-ticket')}
              className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all cursor-pointer"
            >
              Raise a Ticket
            </button>
          </div>
        </div>
      </main>

      {/* Printable Receipt Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowSlipModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FF3F6C] text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="material-symbols-outlined text-2xl">loyalty</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                MShoppy Affiliate Program
              </h3>
              <p className="text-xs text-slate-500">Official KYC Application Acknowledgment</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Application Number:</span>
                <span className="font-mono font-bold text-slate-900">{app?.applicationId || app?.id || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Applicant Legal Name:</span>
                <span className="font-bold text-slate-900">{app?.fullName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">PAN Number:</span>
                <span className="font-mono font-bold text-slate-900">{app?.panNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bank Account:</span>
                <span className="font-mono font-bold text-slate-900">
                  {app?.bankName || 'Bank'} (••••{app?.accountNumber ? app.accountNumber.slice(-4) : '••••'})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-bold text-slate-900">{app?.submittedAt || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-black text-[#FF3F6C] uppercase">{status}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating App Navigation */}
      <AppBottomNav onNavigate={handleNav} />
    </div>
  );
}
