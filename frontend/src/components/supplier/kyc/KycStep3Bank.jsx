import React from 'react';
import { Landmark, Upload, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

export default function KycStep3Bank({ formData, onChange, onDocUpload, onPreviewDoc, onBack, onNext }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#d82a62]" />
          <span>Step 3: Settlement Bank Account & NEFT Payouts</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Daily wholesale orders payments and customer dispatch reconciliations are credited to this verified account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Beneficiary Account Holder Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="accountHolder"
            placeholder="e.g. Shree Balaji Textile Mills Pvt Ltd"
            value={formData.accountHolder}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Bank Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="bankName"
            placeholder="e.g. HDFC Bank / State Bank of India"
            value={formData.bankName}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Bank Account Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            name="accountNumber"
            placeholder="Enter bank account number"
            value={formData.accountNumber}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Confirm Account Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="confirmAccountNumber"
            placeholder="Re-enter bank account number"
            value={formData.confirmAccountNumber}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            IFSC Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="ifsc"
            maxLength={11}
            placeholder="e.g. HDFC0000128"
            value={formData.ifsc}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono font-bold uppercase rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Settlement UPI VPA (Optional)
          </label>
          <input
            type="text"
            name="upiId"
            placeholder="e.g. storename@hdfcbank"
            value={formData.upiId}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
          />
        </div>
      </div>

      {/* Cancelled Cheque upload */}
      <div>
        <label className="text-xs font-bold text-slate-800 block mb-1">
          Cancelled Cheque or Bank Passbook Proof Photo
        </label>
        <div className="flex items-center gap-2">
          <label className="flex-1 h-12 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="truncate">
              {formData.chequeImage ? 'Bank Proof Attached ✅' : 'Upload Cancelled Cheque / Passbook Image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onDocUpload('chequeImage', e.target.files[0])}
              className="hidden"
            />
          </label>

          {formData.chequeImage && (
            <button
              type="button"
              onClick={() => onPreviewDoc({ title: 'Cancelled Cheque Proof', url: formData.chequeImage })}
              className="w-12 h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#b7004d] flex items-center justify-center shrink-0 cursor-pointer transition"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to GST & PAN</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-black transition cursor-pointer shadow-md shadow-pink-600/20"
        >
          <span>Continue to Warehouse Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
