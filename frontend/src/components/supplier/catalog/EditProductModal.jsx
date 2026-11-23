import React from 'react';
import { X, UploadCloud, IndianRupee } from 'lucide-react';

export default function EditProductModal({
  editingProduct,
  onClose,
  editPrice,
  setEditPrice,
  editStock,
  setEditStock,
  editVariants,
  setEditVariants,
  editImagePreviews,
  handleImageChange,
  removeSelectedImage,
  isSubmitting,
  onSubmit,
}) {
  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quick Edit Inventory</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{editingProduct.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {/* Images Upload & Management Section */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Product Photos & Media
            </label>

            {/* Current Active Image Preview */}
            <div className="flex items-center gap-3 mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={editingProduct.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                alt="Current"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">Current Listing Image</p>
                <p className="text-[11px] text-slate-400">
                  {editingProduct.images?.length || 1} image{(editingProduct.images?.length || 1) > 1 ? 's' : ''} currently live
                </p>
              </div>
            </div>

            {/* Upload New Images Box */}
            <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#d82a62] bg-slate-50/50 hover:bg-pink-50/20 cursor-pointer transition group">
              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#d82a62] mb-1 transition" />
              <span className="text-xs font-bold text-slate-700 group-hover:text-[#d82a62]">
                Upload New Product Photos
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                JPG, PNG, WebP up to 5MB (Max 8 images)
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Selected New Images Previews */}
            {editImagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-slate-600 mb-1.5">
                  New Photos to Upload ({editImagePreviews.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {editImagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition shadow-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Selling Price (₹ INR)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="1"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm font-semibold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                required
              />
            </div>
          </div>

          {editVariants.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Multi-Variant Warehouse Inventory ({editVariants.length} SKUs)
                </label>
                <span className="text-[11px] font-bold text-[#b7004d]">
                  Total Stock: {editVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)} units
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/60 p-1">
                {editVariants.map((v, vIdx) => (
                  <div key={v.id || vIdx} className="p-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-black text-slate-800">{v.color}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                        {v.size}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[100px]">
                        ({v.sku})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const safeVal = isNaN(val) ? 0 : Math.max(0, val);
                          setEditVariants((prev) => {
                            const next = [...prev];
                            next[vIdx] = {
                              ...next[vIdx],
                              stock: safeVal,
                              status: safeVal > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                            };
                            const newSum = next.reduce((sum, item) => sum + (parseInt(item.stock, 10) || 0), 0);
                            setEditStock(String(newSum));
                            return next;
                          });
                        }}
                        className={`w-16 px-2 py-1 text-xs font-black rounded-lg border text-center focus:outline-none ${
                          Number(v.stock) === 0
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-[#b7004d]'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Warehouse Stock Units
              </label>
              <input
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-full h-11 px-4 text-sm font-semibold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Products with less than 10 units are automatically marked as "Low Stock".
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
