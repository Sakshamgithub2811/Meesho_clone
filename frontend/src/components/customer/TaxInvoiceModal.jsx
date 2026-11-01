import React from 'react';

export default function TaxInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const invoiceNo = `MSH-INV-${order.id?.slice(0, 8).toUpperCase()}`;
  const address = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress || '{}')
    : order.shippingAddress || {};

  const items = order.items && order.items.length > 0
    ? order.items
    : [{
        quantity: 1,
        price: order.totalAmount || order.price || 0,
        size: order.size || 'Free Size',
        product: { title: order.productName || 'Catalog Product' }
      }];

  const totalAmount = Number(order.totalAmount || order.price || 0);
  const taxableAmount = Math.round((totalAmount / 1.05) * 100) / 100;
  const gstAmount = Math.round((totalAmount - taxableAmount) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = cgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 print:shadow-none print:border-none print:p-0 print:rounded-none">
        
        {/* Actions bar (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center font-black text-sm">
              📄
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Tax Invoice &amp; Receipt</h3>
              <p className="text-xs text-slate-400 font-mono">Invoice #{invoiceNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#b7004d] hover:bg-[#96003f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Print / Download PDF 🖨️</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer text-base"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#b7004d] tracking-tight">
              MSHOPPY RETAIL
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mt-1">
              MShoppy E-Commerce Private Limited<br />
              Plot No. 42, Outer Ring Road, Bellandur, Bengaluru, KA - 560103<br />
              <strong className="text-slate-700">GSTIN:</strong> 29AABCM8291F1Z4<br />
              <strong className="text-slate-700">CIN:</strong> U52100KA2021PTC148892
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100">
              Tax Invoice (Original)
            </span>
            <p className="text-xs font-bold text-slate-800">Invoice No: <span className="font-mono text-slate-900">{invoiceNo}</span></p>
            <p className="text-xs text-slate-500">Order ID: <span className="font-mono text-slate-700">#{order.id?.slice(0, 14)}</span></p>
            <p className="text-xs text-slate-500">
              Date: {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
          <div>
            <p className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider mb-1">
              Shipping &amp; Billing Customer
            </p>
            <h4 className="font-bold text-slate-900">{address.fullName || order.user?.fullName || 'Valued Customer'}</h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {address.addressLine || address.street || 'Address on file'}<br />
              {address.city ? `${address.city}, ` : ''}{address.state ? `${address.state} - ` : ''}<strong>{address.pincode || ''}</strong>
            </p>
            <p className="text-slate-500 mt-1">Phone: <strong>{address.phone || order.user?.phone || 'On File'}</strong></p>
          </div>
          <div className="sm:text-right">
            <p className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider mb-1">
              Payment &amp; Logistics Details
            </p>
            <p className="text-slate-700">
              Payment Mode: <strong className="text-slate-900 uppercase">{order.paymentMethod || 'COD'}</strong>
            </p>
            <p className="text-slate-700 mt-0.5">
              Payment Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus || 'PAID'}</strong>
            </p>
            <p className="text-slate-700 mt-0.5">
              Courier Partner: <strong className="text-slate-900">Shadowfax Logistics</strong>
            </p>
            <p className="text-slate-500 mt-0.5 font-mono text-[11px]">
              AWB: SF{order.id?.slice(0, 10).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => {
                const prod = it.product || {};
                const title = prod.title || it.title || 'Product Item';
                const qty = Number(it.quantity || 1);
                const price = Number(it.price || prod.price || 0);
                const lineTotal = qty * price;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs">{title}</td>
                    <td className="py-2.5 px-3 text-slate-500">{it.size || 'Free Size'}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{qty}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">₹{price}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹{lineTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Amount Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
          <div className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
            * This is a computer generated invoice and does not require a physical signature.<br />
            Goods once sold can be returned within 7 days of delivery as per MShoppy Return Policy.
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Taxable Value:</span>
              <span className="font-mono text-slate-800">₹{taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5%):</span>
              <span className="font-mono text-slate-800">₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5%):</span>
              <span className="font-mono text-slate-800">₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Shipping &amp; Handling:</span>
              <span className="font-bold">FREE</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Total Gross (INR):</span>
              <span className="text-base text-[#b7004d]">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Barcode */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Thank you for shopping with MShoppy! 🛍️</span>
          <span className="font-mono tracking-widest text-slate-600 uppercase">||| | |||| ||| |||| | |||</span>
        </div>

      </div>
    </div>
  );
}
