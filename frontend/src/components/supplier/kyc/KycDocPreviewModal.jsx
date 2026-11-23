import React from 'react';
import { X } from 'lucide-react';

export default function KycDocPreviewModal({ previewDoc, onClose }) {
  if (!previewDoc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-black text-slate-900 text-sm">{previewDoc.title || 'Document Preview'}</h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full h-80 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
          <img
            src={previewDoc.url}
            alt={previewDoc.title || 'Document'}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
