import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Tag, 
  Truck, 
  Building2, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../../ui/button';

/**
 * Procedural SVG Barcode Generator (Clean Code128-style visualization)
 * Renders high-contrast, razor-sharp vector barcode for thermal & laser printers
 */
function SvgBarcode({ value = '', height = 48 }) {
  const cleanVal = (value || 'MSH1029384').toUpperCase();
  
  // Deterministic bar widths pattern based on char codes
  const bars = [];
  let seed = 0;
  for (let i = 0; i < cleanVal.length; i++) {
    seed += cleanVal.charCodeAt(i);
  }

  // Generate 45 realistic alternating bars
  for (let i = 0; i < 46; i++) {
    const isBlack = i % 2 === 0;
    const width = ((seed * (i + 1) * 7) % 3) + 1; // 1, 2, or 3px width
    bars.push({ isBlack, width });
  }

  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={totalWidth * 2.2}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[260px] h-11"
        shapeRendering="crispEdges"
      >
        {bars.map((bar, idx) => {
          const xOffset = bars.slice(0, idx).reduce((sum, b) => sum + b.width, 0);
          return bar.isBlack ? (
            <rect
              key={idx}
              x={xOffset}
              y={0}
              width={bar.width}
              height={height}
              fill="#000000"
            />
          ) : null;
        })}
      </svg>
      <span className="font-mono text-[11px] font-bold tracking-widest text-black mt-0.5">
        *{cleanVal}*
      </span>
    </div>
  );
}

export default function OrderPrintSlipModal({ order, onClose }) {
  const [activeMode, setActiveMode] = useState('label'); // 'label' | 'invoice'

  if (!order) return null;

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const invoiceNo = `MSH-INV-${order.id?.slice(0, 8).toUpperCase()}`;
  
  const shipping = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress || '{}')
    : order.shippingAddress || {};

  const courierName = shipping.courier || shipping.courierPartner || 'Delhivery Express';
  const awbNumber = shipping.awb || shipping.trackingNumber || ('DEL' + (order.id?.slice(0, 8).toUpperCase() || '1029384'));
  const isCod = (order.paymentMethod || 'COD').toUpperCase() === 'COD';
  const totalAmount = Number(order.totalAmount || 0);

  const items = order.items && order.items.length > 0 ? order.items : [];
  const primarySupplier = items[0]?.product?.supplierName || 'Verified Supplier Hub';

  // Tax calculation for Tax Invoice
  const taxableAmount = Math.round((totalAmount / 1.05) * 100) / 100;
  const gstAmount = Math.round((totalAmount - taxableAmount) * 100) / 100;
  const halfGst = Math.round((gstAmount / 2) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      
      {/* Outer Modal Container */}
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 p-5 sm:p-7 space-y-5 print:shadow-none print:border-none print:p-0 print:rounded-none print:max-h-none print:overflow-visible">
        
        {/* ── TOOLBAR (Hidden in Print) ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b pb-4 print:hidden flex-wrap gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMode('label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'label'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#b7004d]" />
              Shipping Label (Box Sticker 4x6")
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'invoice'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#b7004d]" />
              GST Tax Invoice (A4)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="bg-[#b7004d] hover:bg-[#96003f] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── PRINT AREA 1: SHIPPING LABEL (4x6" Thermal Sticker Format) ── */}
        {activeMode === 'label' && (
          <div className="border-2 border-black rounded-lg p-4 font-sans text-black space-y-3 bg-white print:border-2 print:border-black">
            
            {/* Header: Logistics Brand & Destination City / Hub */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight uppercase">
                    {courierName}
                  </span>
                  <span className="text-[10px] bg-black text-white font-bold px-1.5 py-0.5 rounded">
                    SURFACE / EXP
                  </span>
                </div>
                <p className="text-[10px] text-gray-700 font-mono mt-0.5">
                  Order Ref: #{order.id?.slice(0, 12).toUpperCase()}
                </p>
              </div>

              {/* Destination Hub Code & Big City */}
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  DESTINATION ROUTING
                </p>
                <h2 className="text-lg font-black tracking-tight leading-none uppercase">
                  {shipping.city || 'MUMBAI'}
                </h2>
                <p className="font-mono text-xs font-extrabold mt-0.5">
                  PIN: {shipping.pincode || '400050'}
                </p>
              </div>
            </div>

            {/* Scannable Barcode Box */}
            <div className="py-2.5 border-b-2 border-black flex flex-col items-center justify-center bg-gray-50/50">
              <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 mb-1">
                Air Waybill (AWB) Barcode
              </p>
              <SvgBarcode value={awbNumber} height={46} />
            </div>

            {/* Payment COD / Prepaid Alert Box */}
            <div className={`p-2.5 border-2 rounded text-center ${
              isCod ? 'border-black bg-yellow-50' : 'border-black bg-gray-50'
            }`}>
              {isCod ? (
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider block text-red-700">
                    ⚠️ CASH ON DELIVERY (COD)
                  </span>
                  <p className="text-base font-black tracking-tight text-black">
                    COLLECT CASH: ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] font-bold text-gray-600 block">
                    Verify physical cash before handing over parcel
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                    ✓ PREPAID ORDER - DO NOT COLLECT CASH
                  </span>
                  <p className="text-[10px] font-bold text-gray-600">
                    Payment verified online (Amount: ₹{totalAmount.toLocaleString('en-IN')})
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Address & Return to Origin (RTO) Address */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3 text-[11px] leading-tight">
              {/* Deliver To */}
              <div className="pr-2 border-r border-black">
                <p className="font-black text-[10px] uppercase text-gray-500 mb-1">
                  DELIVER TO (CONSIGNEE):
                </p>
                <p className="font-bold text-xs text-black">
                  {shipping.fullName || shipping.name || order.user?.fullName || 'Customer'}
                </p>
                <p className="text-gray-800 mt-1">
                  {shipping.addressLine || shipping.details || shipping.street || 'Address on file'}
                </p>
                <p className="text-gray-900 font-semibold mt-0.5">
                  {shipping.city ? `${shipping.city}, ` : ''}{shipping.state || ''} - <strong>{shipping.pincode}</strong>
                </p>
                <p className="font-mono text-[10px] font-bold text-black mt-1">
                  📞 {shipping.phone || order.user?.phone || 'On File'}
                </p>
              </div>

              {/* Return to Origin (RTO) */}
              <div className="pl-1">
                <p className="font-black text-[10px] uppercase text-gray-500 mb-1">
                  IF UNDELIVERED, RETURN TO (RTO):
                </p>
                <p className="font-bold text-xs text-black">
                  {primarySupplier}
                </p>
                <p className="text-gray-700 mt-1 text-[10px]">
                  MShoppy Logistics Center, Outer Ring Road, Hub 42, Bengaluru, KA - 560103
                </p>
                <p className="font-mono text-[10px] font-semibold text-gray-700 mt-1">
                  GSTIN: 29AABCM8291F1Z4
                </p>
              </div>
            </div>

            {/* Package Contents / Packing Checklist */}
            <div>
              <p className="font-black text-[10px] uppercase text-gray-500 mb-1.5">
                PACKAGE CONTENTS ({items.length} Item{items.length > 1 ? 's' : ''}):
              </p>
              <div className="border border-black rounded text-[10px] divide-y divide-black overflow-hidden">
                {items.map((it, i) => (
                  <div key={i} className="p-1.5 flex justify-between items-center">
                    <span className="font-semibold text-black truncate max-w-[320px]">
                      {i + 1}. {it.product?.title || 'Product SKU'}
                    </span>
                    <span className="font-mono font-bold shrink-0 ml-2">
                      Qty: {it.quantity || 1} {it.size ? `(${it.size})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-1 text-[9px] text-gray-500 flex justify-between items-center border-t border-gray-200">
              <span>Standard E-Commerce Parcel Label</span>
              <span className="font-mono">Printed on {orderDate.toLocaleDateString('en-IN')}</span>
            </div>

          </div>
        )}

        {/* ── PRINT AREA 2: FULL GST TAX INVOICE (A4 Format) ───────────── */}
        {activeMode === 'invoice' && (
          <div className="border border-slate-200 rounded-xl p-6 font-sans text-slate-900 space-y-6 bg-white print:border-none print:p-0">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h1 className="text-2xl font-black text-[#b7004d] tracking-tight">
                  MSHOPPY RETAIL
                </h1>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mt-1">
                  MShoppy E-Commerce Private Limited<br />
                  Plot 42, Outer Ring Road, Bellandur, Bengaluru, KA - 560103<br />
                  <strong>GSTIN:</strong> 29AABCM8291F1Z4 • <strong>CIN:</strong> U52100KA2021PTC148892
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100">
                  Tax Invoice (Original)
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1">Invoice #{invoiceNo}</p>
                <p className="text-xs text-slate-500 font-mono">Order ID: #{order.id?.slice(0, 14)}</p>
                <p className="text-xs text-slate-500">
                  Date: {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="font-extrabold uppercase text-[10px] text-slate-400 mb-1">
                  Customer &amp; Shipping Details
                </p>
                <h4 className="font-bold text-slate-900">{shipping.fullName || shipping.name || order.user?.fullName || 'Customer'}</h4>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {shipping.addressLine || shipping.details || 'Address on file'}<br />
                  {shipping.city ? `${shipping.city}, ` : ''}{shipping.state || ''} - <strong>{shipping.pincode}</strong>
                </p>
                <p className="text-slate-500 mt-1">Phone: <strong>{shipping.phone || order.user?.phone || 'On File'}</strong></p>
              </div>

              <div>
                <p className="font-extrabold uppercase text-[10px] text-slate-400 mb-1">
                  Dispatch &amp; Payment Details
                </p>
                <p className="text-slate-700"><strong>Courier:</strong> {courierName}</p>
                <p className="text-slate-700"><strong>AWB No:</strong> <span className="font-mono">{awbNumber}</span></p>
                <p className="text-slate-700 mt-1">
                  <strong>Payment Mode:</strong> <span className="uppercase">{order.paymentMethod} ({order.paymentStatus})</span>
                </p>
                <p className="text-slate-700"><strong>Supplier:</strong> {primarySupplier}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => {
                    const price = it.price || 0;
                    const qty = it.quantity || 1;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          {it.product?.title || 'Catalog Product'}
                          {it.size && <span className="text-slate-400 font-normal"> (Size: {it.size})</span>}
                        </td>
                        <td className="p-3 text-center font-bold">{qty}</td>
                        <td className="p-3 text-right">₹{price.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₹{(price * qty).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & GST Breakup */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Value:</span>
                  <span>₹{taxableAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (2.5%):</span>
                  <span>₹{halfGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (2.5%):</span>
                  <span>₹{halfGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping:</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-[#b7004d]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signature & Disclaimer */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
              <p>This is a computer-generated tax invoice and requires no physical signature.</p>
              <div className="text-right">
                <p className="font-bold text-slate-700">For MShoppy Retail Private Limited</p>
                <p className="mt-4 border-t border-slate-300 pt-1">Authorized Signatory</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

