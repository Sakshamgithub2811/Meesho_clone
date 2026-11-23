import React from 'react';
import { MapPin, ArrowLeft, Check } from 'lucide-react';

export default function KycStep4Warehouse({ formData, onChange, submitting, onBack }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#d82a62]" />
          <span>Step 4: Dispatch Warehouse & Pickup Location</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Courier logistics partners (Delhivery, Shadowfax, Xpressbees) pick up packed wholesale parcels from this hub.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-800 block mb-1">
          Warehouse Physical Address <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="warehouseAddress"
          rows={3}
          placeholder="Complete dispatch hub address with landmark, gate number..."
          value={formData.warehouseAddress}
          onChange={onChange}
          className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none resize-none transition"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Pickup Pincode <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="warehousePincode"
            maxLength={6}
            placeholder="e.g. 395002"
            value={formData.warehousePincode}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Dispatch Manager Name
          </label>
          <input
            type="text"
            name="warehouseContactPerson"
            placeholder="e.g. Ramesh Kumar"
            value={formData.warehouseContactPerson}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Dispatch Phone / Mobile
          </label>
          <input
            type="tel"
            name="warehousePhone"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={formData.warehousePhone}
            onChange={onChange}
            className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
          />
        </div>
      </div>

      {/* Review summary box */}
      <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs text-[#880e4f] space-y-1.5">
        <p className="font-bold">📋 Legal Declaration & Merchant Agreement:</p>
        <p className="text-pink-900/80 leading-relaxed text-[11px]">
          By clicking Submit KYC Verification, you certify that the provided GSTIN, PAN, and Bank details are true and belong to the registered legal merchant. False submissions are subject to account suspension per IT Act compliance rules.
        </p>
      </div>

      <div className="flex justify-between items-center pt-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bank Details</span>
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] hover:opacity-95 text-white text-sm font-black transition cursor-pointer shadow-lg shadow-pink-600/25 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{submitting ? 'Submitting KYC Documents...' : 'Submit KYC for Verification'}</span>
        </button>
      </div>
    </div>
  );
}
