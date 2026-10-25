import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Layers, 
  Store, 
  Trash2, 
  RefreshCw, 
  Truck, 
  Check, 
  Star, 
  Image as ImageIcon 
} from 'lucide-react';
import ProductStockBadge from './ProductStockBadge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export default function ProductDetailModal({
  product,
  onClose,
  onUpdateStock,
  onDeleteProduct,
  actionLoading,
  formatCurrency
}) {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [stockInput, setStockInput] = useState(product.stock);
  const [isEditingStock, setIsEditingStock] = useState(false);

  const images = product.images || [];
  const currentImage = images[activeImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

  const formattedPrice = formatCurrency ? formatCurrency(product.price) : `₹${product.price}`;
  const formattedOriginalPrice = product.originalPrice 
    ? (formatCurrency ? formatCurrency(product.originalPrice) : `₹${product.originalPrice}`)
    : null;

  const handleStockSave = () => {
    onUpdateStock(product.id, stockInput);
    setIsEditingStock(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* ── 1. MODAL HEADER ────────────────────────────────────────── */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 max-w-md">
                {product.title}
              </h3>
              <ProductStockBadge stock={product.stock} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Category: <span className="font-semibold text-gray-700">{product.category?.name || product.categorySlug}</span>
              {product.supplierName && (
                <span> • Supplier: <strong className="text-gray-800">{product.supplierName}</strong></span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. IMAGES & MAIN INFO ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      activeImageIndex === idx ? 'border-[#b7004d] shadow-xs' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Pricing */}
          <div className="space-y-4">
            {/* Price Box */}
            <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-3.5">
              <span className="text-xs font-semibold text-gray-500 block">Retail Price</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#b7004d]">{formattedPrice}</span>
                {formattedOriginalPrice && (
                  <span className="text-xs text-gray-400 line-through">{formattedOriginalPrice}</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>
              {product.isFreeDelivery && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Free Delivery Eligible</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="text-xs text-gray-600 leading-relaxed max-h-24 overflow-y-auto">
                {product.description || 'No detailed product description available.'}
              </p>
            </div>

            {/* Sizes Available */}
            {product.sizes?.length > 0 && (
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Available Sizes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((sz, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. STOCK & INVENTORY CONTROLLER ────────────────────────── */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
              Inventory Units
            </span>
            <p className="text-xs text-gray-500">
              Current in-stock count: <strong className="text-gray-900">{product.stock} units</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              className="w-24 h-8 text-xs text-center font-bold bg-white"
            />
            <Button
              size="sm"
              onClick={handleStockSave}
              disabled={actionLoading || Number(stockInput) === product.stock}
              className="bg-[#b7004d] hover:bg-[#96003f] text-white text-xs h-8 cursor-pointer"
            >
              {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Update Stock'}
            </Button>
          </div>
        </div>

        {/* ── 4. FOOTER & DELETE ACTIONS ─────────────────────────────── */}
        <div className="border-t pt-4 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDeleteProduct(product.id, product.title)}
            disabled={actionLoading}
            className="text-xs text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Product
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
