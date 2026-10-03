import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock Supplier ROT Debit Ledger Entries
const INITIAL_SUPPLIER_ROT_ENTRIES = [
  {
    id: 'ROT-DEB-8821',
    orderId: 'ORD-88210',
    returnId: 'RET-8921',
    awb: 'DLV-8829104-REV',
    courier: 'Delhivery Surface Reverse',
    productName: 'Banarasi Silk Embroidered Kurti - Pink (M)',
    productSku: 'BSK-PNK-M',
    productImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
    productBasePrice: 849,
    chargedWeight: '0.45 kg',
    actualWeight: '0.45 kg',
    returnReason: 'Fabric torn / Defective stitch (QC Failed)',
    faultCategory: 'Supplier Fault (100% ROT Charged)',
    baseReverseFreight: 65,
    regionalSurcharge: 10,
    totalRotDebited: 75,
    status: 'Debited from Payout',
    debitDate: '24 Oct 2024',
    spfClaimStatus: 'Eligible for SPF (Claim Filed)',
    disputeStatus: null,
  },
  {
    id: 'ROT-DEB-8820',
    orderId: 'ORD-88002',
    returnId: 'RET-8890',
    awb: 'SFX-7738291-REV',
    courier: 'Shadowfax Reverse QC',
    productName: 'Designer Cotton Tee - Navy (L)',
    productSku: 'TEE-NVY-L',
    productImg: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80',
    productBasePrice: 420,
    chargedWeight: '0.35 kg',
    actualWeight: '0.35 kg',
    returnReason: 'Wrong size dispatched (Customer got M instead of L)',
    faultCategory: 'Supplier Fault (100% ROT Charged)',
    baseReverseFreight: 55,
    regionalSurcharge: 0,
    totalRotDebited: 55,
    status: 'Debited from Payout',
    debitDate: '24 Oct 2024',
    spfClaimStatus: 'Not Eligible (Packing Error)',
    disputeStatus: null,
  },
  {
    id: 'ROT-DEB-8819',
    orderId: 'ORD-87941',
    returnId: 'RET-8812',
    awb: 'XPB-9912048-REV',
    courier: 'Xpressbees Return',
    productName: 'Georgette Printed Saree - Royal Blue',
    productSku: 'SAR-GEO-BLU',
    productImg: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80',
    productBasePrice: 599,
    chargedWeight: '1.20 kg (Overcharged)',
    actualWeight: '0.60 kg',
    returnReason: 'Size/Fit Issue (Buyer Remorse)',
    faultCategory: 'Customer Remorse (0% ROT on Supplier)',
    baseReverseFreight: 0,
    regionalSurcharge: 0,
    totalRotDebited: 0,
    status: 'Restocked at Surat Hub (₹0 Debit)',
    debitDate: '23 Oct 2024',
    spfClaimStatus: 'Inventory Intact',
    disputeStatus: 'Weight Dispute Raised with Courier',
  },
  {
    id: 'ROT-DEB-8780',
    orderId: 'ORD-87720',
    returnId: 'RET-8701',
    awb: 'DLV-4421098-REV',
    courier: 'Delhivery Surface Reverse',
    productName: 'Floral Chiffon Maxi Dress',
    productSku: 'DRS-CHI-MAX',
    productImg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop&q=80',
    productBasePrice: 950,
    chargedWeight: '0.50 kg',
    actualWeight: '0.50 kg',
    returnReason: 'Swapped Fake Item Received at Warehouse',
    faultCategory: 'Fraud Return (Reimbursed via SPF)',
    baseReverseFreight: 65,
    regionalSurcharge: 0,
    totalRotDebited: 0,
    status: 'SPF Claim Approved (+₹950 + ₹65 Refunded)',
    debitDate: '21 Oct 2024',
    spfClaimStatus: 'Approved & Credited',
    disputeStatus: null,
  },
];

export default function SupplierRotLedger() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(INITIAL_SUPPLIER_ROT_ENTRIES);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Weight Discrepancy');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Filtering
  const filteredEntries = entries.filter((item) => {
    const matchesFilter =
      filterCategory === 'ALL'
        ? true
        : filterCategory === 'CHARGED'
        ? item.totalRotDebited > 0
        : filterCategory === 'ZERO'
        ? item.totalRotDebited === 0
        : filterCategory === 'DISPUTED'
        ? item.disputeStatus !== null
        : true;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.orderId.toLowerCase().includes(q) ||
      item.returnId.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.productSku.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const totalRotChargedThisMonth = entries.reduce((acc, curr) => acc + curr.totalRotDebited, 0);

  const handleRaiseDispute = (e) => {
    e.preventDefault();
    if (!selectedEntry) return;

    setEntries((prev) =>
      prev.map((item) =>
        item.id === selectedEntry.id
          ? {
              ...item,
              disputeStatus: `Dispute Filed: ${disputeReason} (Under Review)`,
            }
          : item
      )
    );

    setDisputeModalOpen(false);
    setToastMsg(`Weight & ROT charge dispute filed for ${selectedEntry.orderId}. Ticket #DISP-9921 generated.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900 pb-20 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/supplier-returns')}
              className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center gap-1.5 text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Supplier Returns</span>
            </button>
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  Seller Logistics
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                  Supplier ROT & Reverse Freight Ledger
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed passbook of reverse order transit deductions, rate cards, and weight discrepancy disputes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin-rot-rules')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition"
            >
              <span className="material-symbols-outlined text-sm text-[#b90041]">rule_settings</span>
              System Business Rules
            </button>
            <button
              onClick={() => navigate('/supplier-orders')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition"
            >
              <span className="material-symbols-outlined text-sm text-slate-600">inventory</span>
              All Orders
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toastMsg && (
          <div className="bg-emerald-50 border-t border-b border-emerald-200 px-4 py-2 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
            {toastMsg}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">trending_down</span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Total ROT Debited (Oct)</div>
              <div className="text-xl font-extrabold text-rose-600">₹{totalRotChargedThisMonth}.00</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">2 Fault Returns</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">shield_person</span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">SPF Recoveries Credited</div>
              <div className="text-xl font-extrabold text-emerald-600">+₹1,015.00</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Swapped Item Covered</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">check_box</span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Buyer Remorse (₹0 Debit)</div>
              <div className="text-xl font-extrabold text-slate-900">1 Parcel</div>
              <div className="text-[11px] text-blue-600 font-medium mt-0.5">Restocked Without Freight Loss</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">scale</span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Weight Discrepancy Claims</div>
              <div className="text-xl font-extrabold text-amber-600">1 Active</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Courier Overcharge Audit</div>
            </div>
          </div>
        </div>

        {/* Business Rule Summary Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-blue-300 uppercase">
              <span className="material-symbols-outlined text-sm">info</span>
              Supplier ROT Settlement Policy (MShoppy Model)
            </div>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              <strong>Supplier Fault (Defect/Wrong SKU)</strong> hone par Reverse Freight aapke payout se debit hota hai. Agar customer ne <strong>Size/Fit</strong> ke kaaran return kiya hai, toh aap par <strong>₹0 ROT</strong> lagti hai. Swapped/damaged returns par aap <strong>SPF claim</strong> raise kar sakte hain.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin-rot-rules')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold shrink-0 transition"
          >
            View Complete Rate Card
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Returns' },
              { id: 'CHARGED', label: 'ROT Debited' },
              { id: 'ZERO', label: '₹0 Protected Returns' },
              { id: 'DISPUTED', label: 'Disputes & Claims' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterCategory === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search Order ID, SKU, Return ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order & Return ID</th>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Customer Reason & Fault</th>
                  <th className="py-3 px-4 text-center">Charged Weight</th>
                  <th className="py-3 px-4 text-center">ROT Freight Debit</th>
                  <th className="py-3 px-4">Settlement & SPF Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{item.orderId}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{item.returnId}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.awb}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.productImg}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">SKU: {item.productSku}</div>
                          <div className="text-[10px] text-slate-600 font-semibold">Base: ₹{item.productBasePrice}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800">{item.returnReason}</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${
                          item.totalRotDebited > 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.faultCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-mono font-bold text-slate-800">{item.chargedWeight}</div>
                      {item.chargedWeight.includes('Overcharged') && (
                        <span className="inline-block text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded mt-0.5">
                          Courier Discrepancy
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className={`font-mono font-black text-sm ${
                          item.totalRotDebited > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {item.totalRotDebited > 0 ? `-₹${item.totalRotDebited}.00` : '₹0.00'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.totalRotDebited > 0 ? 'Reverse Freight' : 'Protected'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{item.status}</div>
                      <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                        {item.spfClaimStatus}
                      </div>
                      {item.disputeStatus && (
                        <div className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                          {item.disputeStatus}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-y-1">
                      <button
                        onClick={() => {
                          setSelectedEntry(item);
                          setDisputeModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">gavel</span>
                        Dispute
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DISPUTE MODAL */}
      {disputeModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">scale</span>
                Raise Dispute / Challenge ROT Debit: {selectedEntry.orderId}
              </h3>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispute Category</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="Weight Discrepancy">Weight Discrepancy (Courier Overcharged)</option>
                  <option value="Incorrect Fault Tagging">Incorrect Fault Tagging (Not Supplier Fault)</option>
                  <option value="Swapped / Damaged Product (SPF Claim)">Swapped / Damaged Product (SPF Claim)</option>
                  <option value="Buyer Retained Item">Buyer Retained Item / Duplicate Tracking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explain Dispute Details & Scale Evidence
                </label>
                <textarea
                  rows="3"
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="e.g. Courier charged 1.2kg dead weight for a single cotton tee. Attached warehouse digital scale photo."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 placeholder-slate-400"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                <span className="material-symbols-outlined text-slate-400 text-xl">upload_file</span>
                <div className="text-xs font-bold text-slate-700 mt-1">Upload Scale Proof / CCTV Photo</div>
                <div className="text-[10px] text-slate-400">JPG, PNG, PDF up to 10MB</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Submit Dispute to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
