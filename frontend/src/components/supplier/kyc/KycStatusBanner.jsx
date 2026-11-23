import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileCheck } from 'lucide-react';

export default function KycStatusBanner({ isApproved, isUnderReview, isRejected, isNotSubmitted, kycData }) {
  if (isApproved) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-emerald-950">
                KYC Verified Merchant
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                Level 1 Verified
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
              Your business identity and bank accounts have been verified by Meesho Compliance. Your products receive verified trust badges and daily payouts are active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
            Ref: #{kycData?.id?.slice(-8) || 'VERIFIED'}
          </span>
        </div>
      </div>
    );
  }

  if (isUnderReview) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-amber-950">
                KYC Under Compliance Review
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                Verification In Progress
              </span>
            </div>
            <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
              Your documents are currently being checked by the Meesho merchant verification desk. Verification typically completes within 4–12 business hours.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-bold text-amber-800 block">
            Application #{kycData?.id?.slice(-8) || 'KYC-SUBMITTED'}
          </span>
          <span className="text-[11px] text-amber-600">Priority Processing</span>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-rose-950">
              Verification Action Needed (KYC Rejected)
            </h3>
            <p className="text-xs text-rose-700">
              Please review compliance feedback below, update the highlighted documents, and re-submit.
            </p>
          </div>
        </div>

        {kycData?.adminNotes && (
          <div className="p-3.5 rounded-2xl bg-white border border-rose-200 text-xs text-rose-900">
            <span className="font-bold block mb-0.5">Admin Compliance Officer Remarks:</span>
            <p className="italic">{kycData.adminNotes}</p>
          </div>
        )}
      </div>
    );
  }

  if (isNotSubmitted) {
    return (
      <div className="p-5 rounded-3xl bg-pink-50/60 border border-pink-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#d82a62] text-white flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              KYC Verification Pending
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Complete the 4 sections below to unlock wholesale inventory dropshipping and auto-payouts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
