import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';

export default function KycStep1Business({ formData, onChange, onNext }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#d82a62]" />
          <span>Step 1: Business Identity & Store Registration</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter registered business identity details as recognized by state authorities and tax departments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Business Legal Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="businessName"
            placeholder="e.g. Shree Balaji Textile Mills Pvt Ltd"
            value={formData.businessName}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Trade Name / Store Display Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="tradeName"
            placeholder="e.g. Balaji Fashion Hub"
            value={formData.tradeName}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Business Entity Type
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={onChange}
            className="w-full h-11 px-3 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
          >
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership Firm">Partnership Firm</option>
            <option value="Private Limited Company">Private Limited Company (Pvt Ltd)</option>
            <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
            <option value="Individual / Unregistered">Individual / Artisan</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            maxLength={6}
            placeholder="e.g. 395002"
            value={formData.pincode}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-800 block mb-1">
          Registered Business Address
        </label>
        <textarea
          name="businessAddress"
          rows={2}
          placeholder="Street address, building number, industrial zone..."
          value={formData.businessAddress}
          onChange={onChange}
          className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none resize-none transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">City</label>
          <input
            type="text"
            name="city"
            placeholder="e.g. Surat"
            value={formData.city}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">State</label>
          <input
            type="text"
            name="state"
            placeholder="e.g. Gujarat"
            value={formData.state}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d82a62] hover:bg-[#b7004d] text-white text-xs font-black transition cursor-pointer shadow-md shadow-pink-600/20"
        >
          <span>Continue to GST & PAN</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
