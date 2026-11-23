import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Truck,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function SupplierPickupManifestModal({
  isOpen,
  onClose,
  orders = [],
  supplierProfile = {},
  onConfirmHandover
}) {
  const [selectedCourier, setSelectedCourier] = useState('Delhivery Surface');
  const [isHandingOver, setIsHandingOver] = useState(false);
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Filter orders that are ready for pickup (CONFIRMED, ORDERED, or SHIPPED)
  const readyOrders = orders.filter((o) => {
    const st = (o.orderStatus || o.status || '').toUpperCase();
    return ['CONFIRMED', 'ORDERED', 'READY_TO_SHIP'].includes(st);
  });

  const displayOrders = readyOrders.length > 0 ? readyOrders : orders.slice(0, 10);
  const totalParcels = displayOrders.length;
  const totalValue = displayOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.price || 0)), 0);

  const manifestId = `MAN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const pickupDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const supplierName = supplierProfile?.storeName || supplierProfile?.fullName || 'Verified MShoppy Supplier';
  const supplierGstin = supplierProfile?.gstin || 'GSTIN-NOT-REQUIRED';
  const pickupAddress = supplierProfile?.pickupAddress || supplierProfile?.address || 'Warehouse / Factory Dispatch Unit, India';
  const supplierPhone = supplierProfile?.phone || '+91 98765 43210';

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteHandover = async () => {
    if (displayOrders.length === 0) {
      toast.error('No orders to handover');
      return;
    }

    setIsHandingOver(true);
    try {
      if (onConfirmHandover) {
        await onConfirmHandover(displayOrders.map(o => o.id));
      }
      toast.success(`🎉 Handover complete! ${totalParcels} parcel(s) handed over to ${selectedCourier}.`);
      onClose();
    } catch (err) {
      console.error('Handover error:', err);
      toast.error('Failed to update parcel status');
    } finally {
      setIsHandingOver(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-pink-50/50 via-white to-slate-50 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#850d3a] to-[#d82a62] text-white flex items-center justify-center shrink-0 shadow-sm shadow-pink-600/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Logistics Pickup Handover Manifest
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#b7004d] text-[10px] font-black uppercase">
                  Step 4
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official handover sheet for courier rider pickup (Delhivery, Shadowfax, Xpressbees).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Print A4 Manifest</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Courier Selector Bar (Hidden on Print) */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Courier Partner:</span>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none focus:border-[#b7004d]"
            >
              <option value="Delhivery Surface">Delhivery Surface Express</option>
              <option value="Shadowfax Logistics">Shadowfax Logistics</option>
              <option value="Xpressbees Logistics">Xpressbees Logistics</option>
              <option value="Ecom Express">Ecom Express Surface</option>
            </select>
          </div>
          <div className="text-slate-500 font-medium">
            Manifest ID: <span className="font-mono font-bold text-slate-900">{manifestId}</span>
          </div>
        </div>

        {/* Printable Sheet Container */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 font-sans text-slate-900 text-xs">
          
          {/* Manifest Official Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#b7004d] tracking-tight">MShoppy</span>
                <span className="text-lg font-bold text-slate-800">| PICKUP MANIFEST</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Official Logistics Handover &amp; Custody Transfer Document
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono font-black text-xs border border-slate-200">
                {selectedCourier}
              </span>
              <p className="font-mono text-[11px] text-slate-600 mt-1">
                <strong>ID:</strong> {manifestId}
              </p>
              <p className="text-[10px] text-slate-500">
                <strong>Date:</strong> {pickupDate}
              </p>
            </div>
          </div>

          {/* Warehouse & Dispatch Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                Pickup From (Supplier Warehouse)
              </span>
              <p className="font-black text-slate-900 text-sm">{supplierName}</p>
              <p className="text-slate-600 mt-0.5">{pickupAddress}</p>
              <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                GSTIN: {supplierGstin} | Phone: {supplierPhone}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                Logistics Carrier
              </span>
              <p className="font-black text-slate-900 text-sm">{selectedCourier}</p>
              <p className="text-slate-600 mt-0.5">Automated Doorstep Pickup Route</p>
              <p className="text-emerald-700 font-bold text-[11px] mt-0.5">
                ✓ Barcode Scanned &amp; Ready for First Mile Scan
              </p>
            </div>
          </div>

          {/* Table of Shipments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                Manifested Shipments ({totalParcels} Parcels)
              </h4>
              <span className="text-xs font-bold text-slate-600">
                Total Value: <strong>₹{totalValue.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10">S.No</th>
                    <th className="py-2.5 px-3">Order ID / AWB</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Customer City</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3 text-right">Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayOrders.map((ord, idx) => {
                    const firstItem = ord.items?.[0] || {};
                    const title = firstItem.product?.title || firstItem.productTitle || 'Catalog Product';
                    const displayId = String(ord.id || ord.orderId || '').slice(-8).toUpperCase();
                    const awb = ord.awb || `AWB-${displayId}-DEL`;
                    const city = ord.shippingAddress?.city || ord.city || 'India';
                    const payment = (ord.paymentMethod || 'PREPAID').toUpperCase();
                    const price = ord.totalAmount || ord.price || 0;

                    return (
                      <tr key={ord.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          #{displayId}
                          <span className="block text-[10px] text-slate-500 font-normal">{awb}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-800 truncate max-w-[200px]">{title}</td>
                        <td className="py-2 px-3 text-slate-600">{city}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            payment === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {payment}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ₹{Number(price).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Declaration & Signatures Block */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 italic mb-4">
              Declaration: We confirm that {totalParcels} tamper-proof sealed packages with official MShoppy thermal barcode shipping slips have been handed over to the courier representative for transit to respective consignees.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* Supplier Box */}
              <div className="border border-slate-300 rounded-xl p-4 min-h-[90px] flex flex-col justify-between bg-slate-50/30">
                <span className="text-[10px] font-black uppercase text-slate-600 block">
                  Handed Over By (Supplier Executive)
                </span>
                <div className="pt-6 border-b border-slate-400 border-dashed" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Authorized Signature &amp; Stamp</span>
                  <span>Date: _________</span>
                </div>
              </div>

              {/* Courier Rider Box */}
              <div className="border border-slate-300 rounded-xl p-4 min-h-[90px] flex flex-col justify-between bg-slate-50/30">
                <span className="text-[10px] font-black uppercase text-slate-600 block">
                  Received By ({selectedCourier} Pickup Rider)
                </span>
                <div className="pt-6 border-b border-slate-400 border-dashed" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Rider Name: _________________</span>
                  <span>Sign &amp; Contact: _________________</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 shrink-0 print:hidden">
          <div className="text-xs text-slate-600">
            <span>Ready for Handover: </span>
            <strong className="text-slate-900">{totalParcels} Packages</strong>
            <span> (₹{totalValue.toLocaleString('en-IN')})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              disabled={isHandingOver || totalParcels === 0}
              onClick={handleExecuteHandover}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHandingOver ? 'Updating...' : 'Confirm Handover & Mark Shipped'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
