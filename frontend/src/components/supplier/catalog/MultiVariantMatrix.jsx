import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const COLOR_HEX_MAP = {
  black: '#111827',
  white: '#FFFFFF',
  red: '#EF4444',
  maroon: '#800000',
  blue: '#2563EB',
  'navy blue': '#1E3A8A',
  'sky blue': '#38BDF8',
  green: '#10B981',
  'pista green': '#93C572',
  yellow: '#FACC15',
  pink: '#EC4899',
  'baby pink': '#FBCFE8',
  purple: '#A855F7',
  orange: '#F97316',
  grey: '#6B7280',
  gray: '#6B7280',
  beige: '#D2B48C',
  gold: '#D4AF37',
  silver: '#E5E7EB',
};

export const resolveColorHex = (colorName) => {
  if (!colorName) return '#94A3B8';
  const clean = colorName.trim().toLowerCase();
  return COLOR_HEX_MAP[clean] || '#64748B';
};

export default function MultiVariantMatrix({
  selectedColors = [],
  selectedSizes = [],
  baseSku = 'MSH',
  basePrice = 0,
  variants = [],
  onChangeVariants,
}) {
  const [bulkStockVal, setBulkStockVal] = useState('15');

  // Compute canonical variant key
  const getKey = (color, size) => `${(color || 'def').trim().toLowerCase()}__${(size || 'std').trim().toLowerCase()}`;

  // Synchronize or generate combinations whenever colors, sizes, or base inputs change
  useEffect(() => {
    const hasColors = Array.isArray(selectedColors) && selectedColors.length > 0;
    const hasSizes = Array.isArray(selectedSizes) && selectedSizes.length > 0;

    if (!hasColors && !hasSizes) {
      if (variants.length > 0 && onChangeVariants) {
        onChangeVariants([]);
      }
      return;
    }

    const existingMap = new Map();
    variants.forEach((v) => {
      existingMap.set(getKey(v.color, v.size), v);
    });

    const cleanBaseSku = (baseSku || 'MSH').toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'MSH';
    const numBasePrice = parseFloat(basePrice) || 0;

    const newVariants = [];

    if (hasColors && hasSizes) {
      // Color × Size Matrix
      selectedColors.forEach((color) => {
        selectedSizes.forEach((size) => {
          const key = getKey(color, size);
          if (existingMap.has(key)) {
            newVariants.push(existingMap.get(key));
          } else {
            const colCode = color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'CLR';
            const sizeCode = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'FS';
            newVariants.push({
              id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              color,
              size,
              sku: `${cleanBaseSku}-${colCode}-${sizeCode}`,
              stock: 15,
              price: numBasePrice,
              status: 'IN_STOCK',
            });
          }
        });
      });
    } else if (hasSizes) {
      // Sizes / Volume Only (e.g. Facewash 50ml, 100ml, 200ml)
      selectedSizes.forEach((size) => {
        const key = getKey('Default', size);
        if (existingMap.has(key)) {
          newVariants.push(existingMap.get(key));
        } else {
          const sizeCode = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'STD';
          newVariants.push({
            id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            color: 'Default',
            size,
            sku: `${cleanBaseSku}-${sizeCode}`,
            stock: 25,
            price: numBasePrice,
            status: 'IN_STOCK',
          });
        }
      });
    } else if (hasColors) {
      // Colors Only (e.g. Lipstick, Phone Case)
      selectedColors.forEach((color) => {
        const key = getKey(color, 'Standard');
        if (existingMap.has(key)) {
          newVariants.push(existingMap.get(key));
        } else {
          const colCode = color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'CLR';
          newVariants.push({
            id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            color,
            size: 'Standard',
            sku: `${cleanBaseSku}-${colCode}`,
            stock: 20,
            price: numBasePrice,
            status: 'IN_STOCK',
          });
        }
      });
    }

    // Check if newVariants is different from current variants
    const isDifferent =
      newVariants.length !== variants.length ||
      newVariants.some((nv, i) => {
        const curr = variants[i];
        return (
          !curr ||
          nv.color !== curr.color ||
          nv.size !== curr.size ||
          nv.sku !== curr.sku
        );
      });

    if (isDifferent && onChangeVariants) {
      onChangeVariants(newVariants);
    }
  }, [selectedColors, selectedSizes, baseSku, basePrice]);

  const handleUpdateField = (index, field, value) => {
    const updated = variants.map((v, i) => {
      if (i !== index) return v;
      const next = { ...v, [field]: value };
      if (field === 'stock') {
        const numStock = parseInt(value, 10);
        next.stock = isNaN(numStock) ? 0 : Math.max(0, numStock);
        next.status = next.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
      }
      if (field === 'price') {
        const numPrice = parseFloat(value);
        next.price = isNaN(numPrice) ? 0 : Math.max(0, numPrice);
      }
      return next;
    });
    if (onChangeVariants) onChangeVariants(updated);
  };

  const handleApplyBulkStock = () => {
    const num = parseInt(bulkStockVal, 10);
    if (isNaN(num) || num < 0) return;
    const updated = variants.map((v) => ({
      ...v,
      stock: num,
      status: num > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    }));
    if (onChangeVariants) onChangeVariants(updated);
  };

  const handleSyncBasePrice = () => {
    const numPrice = parseFloat(basePrice) || 0;
    const updated = variants.map((v) => ({
      ...v,
      price: numPrice,
    }));
    if (onChangeVariants) onChangeVariants(updated);
  };

  // Matrix Summary Statistics
  const { totalStock, inStockCount, outOfStockCount } = useMemo(() => {
    let tStock = 0;
    let inCount = 0;
    let outCount = 0;
    variants.forEach((v) => {
      const s = parseInt(v.stock, 10) || 0;
      tStock += s;
      if (s > 0) inCount++;
      else outCount++;
    });
    return { totalStock: tStock, inStockCount: inCount, outOfStockCount: outCount };
  }, [variants]);

  if (!variants.length) {
    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Single Item Inventory (No Variations)
            </h4>
            <p className="text-[11px] text-slate-500">
              Stock is managed directly via the primary "Available Stock Units" field above. Enable sizes or colors if you need variant-level inventory.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
            SKU: {(baseSku || 'MSH').toUpperCase()}-STD
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-pink-100 shadow-xs">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 text-[#b7004d] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Real Inventory Management</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            {selectedColors.length > 0 && selectedSizes.length > 0
              ? `Multi-Variant Matrix (${selectedColors.length} Colors × ${selectedSizes.length} Sizes = ${variants.length} Combinations)`
              : selectedSizes.length > 0
              ? `Size / Volume Variants (${variants.length} Options)`
              : `Color Variants (${variants.length} Options)`}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure individual warehouse stock per variant. Prevent Out-of-Stock (OOS) penalty by specifying exact units.
          </p>
        </div>

        {/* Live Variant Metric Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
            Total Stock: <strong className="text-slate-950">{totalStock}</strong> units
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            {inStockCount} In Stock
          </span>
          {outOfStockCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
              {outOfStockCount} Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Quick Bulk Fill Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-600">Quick Stock:</span>
          <div className="inline-flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={bulkStockVal}
              onChange={(e) => setBulkStockVal(e.target.value)}
              className="w-16 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:border-[#b7004d]"
            />
            <button
              type="button"
              onClick={handleApplyBulkStock}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition cursor-pointer"
            >
              Apply to All
            </button>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {[0, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  const updated = variants.map((v) => ({
                    ...v,
                    stock: preset,
                    status: preset > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                  }));
                  if (onChangeVariants) onChangeVariants(updated);
                }}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                  preset === 0
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset === 0 ? 'Mark All 0 (OOS)' : `${preset} units`}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncBasePrice}
          className="text-[11px] font-bold text-[#b7004d] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Sync Base Price (₹{basePrice || 0}) to All</span>
        </button>
      </div>

      {/* Variant Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 sticky top-0 font-bold uppercase tracking-wider text-[10px] z-10">
              <tr>
                <th className="py-2.5 px-3">Variant (Color × Size)</th>
                <th className="py-2.5 px-3">Variant SKU</th>
                <th className="py-2.5 px-3">Stock Units</th>
                <th className="py-2.5 px-3">Price (₹)</th>
                <th className="py-2.5 px-3 text-right">Inventory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {variants.map((v, idx) => {
                const hex = resolveColorHex(v.color);
                const isOutOfStock = Number(v.stock) === 0;

                return (
                  <tr
                    key={v.id || idx}
                    className={`transition-colors ${
                      isOutOfStock ? 'bg-rose-50/20' : 'hover:bg-pink-50/10'
                    }`}
                  >
                    {/* Color × Size Preview */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {v.color && v.color !== 'Default' && (
                          <>
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="font-black text-slate-900">{v.color}</span>
                          </>
                        )}
                        {v.color && v.color !== 'Default' && v.size && v.size !== 'Standard' && (
                          <span className="text-slate-300">/</span>
                        )}
                        {v.size && v.size !== 'Standard' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-black text-[11px]">
                            {v.size}
                          </span>
                        )}
                        {(!v.color || v.color === 'Default') && (!v.size || v.size === 'Standard') && (
                          <span className="font-bold text-slate-500 text-xs">Standard Item</span>
                        )}
                      </div>
                    </td>

                    {/* Variant SKU Input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.sku || ''}
                        onChange={(e) => handleUpdateField(idx, 'sku', e.target.value)}
                        className="w-full max-w-[180px] font-mono text-[11px] uppercase px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-[#b7004d]"
                        placeholder="e.g. KURTI-RED-S"
                      />
                    </td>

                    {/* Stock Input */}
                    <td className="py-2.5 px-3">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => handleUpdateField(idx, 'stock', e.target.value)}
                          className={`w-20 px-2.5 py-1 font-black text-xs rounded-lg border text-center focus:outline-none ${
                            isOutOfStock
                              ? 'bg-rose-50 border-rose-300 text-rose-700'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-[#b7004d]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateField(idx, 'stock', isOutOfStock ? 10 : 0)}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition cursor-pointer ${
                            isOutOfStock
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                          }`}
                          title={isOutOfStock ? 'Set in stock (10)' : 'Mark as Out of Stock (0)'}
                        >
                          {isOutOfStock ? '+In Stock' : 'Set 0'}
                        </button>
                      </div>
                    </td>

                    {/* Price Input */}
                    <td className="py-2.5 px-3">
                      <div className="relative inline-flex items-center">
                        <span className="absolute left-2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={v.price}
                          onChange={(e) => handleUpdateField(idx, 'price', e.target.value)}
                          className="w-24 pl-5 pr-2 py-1 font-black text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#b7004d]"
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-right">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Out of Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>In Stock ({v.stock})</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
