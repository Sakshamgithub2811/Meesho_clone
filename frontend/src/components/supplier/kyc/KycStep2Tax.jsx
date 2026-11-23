import React from 'react';
import { FileText, Upload, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

export default function KycStep2Tax({ formData, onChange, onDocUpload, onPreviewDoc, onBack, onNext }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#d82a62]" />
          <span>Step 2: Tax Registration (GSTIN & PAN Verification)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          GSTIN and PAN are required by law for inter-state wholesale e-commerce fulfillment.
        </p>
      </div>

      {/* GSTIN Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              15-Digit GSTIN Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="gstin"
              maxLength={15}
              placeholder="e.g. 24AAACB1234F1Z8"
              value={formData.gstin}
              onChange={onChange}
              className="w-full h-11 px-4 text-xs font-mono font-bold uppercase rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white transition"
              required
            />
          </div>

          {/* GST Document Upload */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              GST Registration Certificate Proof
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 h-11 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="truncate">
                  {formData.gstCertificate ? 'Certificate Attached ✅' : 'Choose GST Photo/PDF'}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => onDocUpload('gstCertificate', e.target.files[0])}
                  className="hidden"
                />
              </label>

              {formData.gstCertificate && (
                <button
                  type="button"
                  onClick={() => onPreviewDoc({ title: 'GST Certificate', url: formData.gstCertificate })}
                  className="w-11 h-11 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#b7004d] flex items-center justify-center shrink-0 cursor-pointer transition"
                  title="Preview GST Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAN Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              10-Digit PAN Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="panNumber"
              maxLength={10}
              placeholder="e.g. AAACB1234F"
              value={formData.panNumber}
              onChange={onChange}
              className="w-full h-11 px-4 text-xs font-mono font-bold uppercase rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Name on PAN Card
            </label>
            <input
              type="text"
              name="panName"
              placeholder="Exact name on PAN"
              value={formData.panName}
              onChange={onChange}
              className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white transition"
            />
          </div>

          {/* PAN Document Upload */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              PAN Card Photo Proof
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 h-11 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="truncate">
                  {formData.panImage ? 'PAN Photo Attached ✅' : 'Upload PAN Card'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onDocUpload('panImage', e.target.files[0])}
                  className="hidden"
                />
              </label>

              {formData.panImage && (
                <button
                  type="button"
                  onClick={() => onPreviewDoc({ title: 'PAN Card Photo', url: formData.panImage })}
                  className="w-11 h-11 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#b7004d] flex items-center justify-center shrink-0 cursor-pointer transition"
                  title="Preview PAN Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aadhaar Box (Optional) */}
      <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Aadhaar Card (Optional for Individuals)</span>
          <span className="text-[10px] text-slate-400">Owner Verification</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="aadhaarNumber"
            maxLength={14}
            placeholder="12-digit Aadhaar Number (Optional)"
            value={formData.aadhaarNumber}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none bg-white transition"
          />

          <label className="h-11 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer transition">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="truncate">
              {formData.aadhaarFrontImage ? 'Aadhaar Attached ✅' : 'Upload Aadhaar Photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onDocUpload('aadhaarFrontImage', e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Business Info</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-black transition cursor-pointer shadow-md shadow-pink-600/20"
        >
          <span>Continue to Bank & Payout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
