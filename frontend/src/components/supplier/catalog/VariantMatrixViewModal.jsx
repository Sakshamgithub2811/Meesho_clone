import React from 'react';
import { Layers, X } from 'lucide-react';

export default function VariantMatrixViewModal({ product, onClose, resolveColorHex }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 zoom-in-95 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Multi-Variant Inventory Matrix</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{product.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-3 space-y-2 flex-1">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="py-2 px-3">Variant (Color × Size)</th>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Stock Units</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(product.variants || []).map((v, idx) => {
                const hex = resolveColorHex ? resolveColorHex(v.color) : '#64748b';
                const isOos = Number(v.stock) === 0;
                return (
                  <tr key={idx} className={isOos ? 'bg-rose-50/20' : ''}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="font-bold text-slate-900">{v.color}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {v.size}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 uppercase">
                      {v.sku}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {v.stock} units
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isOos ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Total Catalog Units: <strong className="text-slate-900">{product.stock}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
