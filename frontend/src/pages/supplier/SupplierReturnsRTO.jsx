import React, { useState, useRef } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

// Mock Initial Returns & RTO Data
const INITIAL_RETURNS = [
  {
    id: 'RET-8921',
    orderId: 'ORD-88210',
    type: 'Customer Return',
    productName: 'Banarasi Silk Embroidered Kurti - Pink (M)',
    productDetails: 'SKU: BSK-PNK-M • Qty: 1',
    customerName: 'Priya Sharma (Jaipur, RJ)',
    phone: '+91 98765 43210',
    courier: 'Delhivery Surface',
    awb: 'DEL-9928174621',
    reason: 'Size too small / Fitting issue',
    status: 'Delivered to Warehouse', // 'In-Transit' | 'Delivered to Warehouse' | 'Restocked' | 'SPF Claimed'
    price: 1299,
    formattedPrice: '₹1,299',
    initiatedDate: '23 Oct 2024',
    deliveredDate: '25 Oct 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCv6DgYAFvGbNJ5APR46xls7W7pN8o67LV_V8M5UUB3Wg82Y35C7rJLKqw75qntSEhXK9Ac79emuJ4yu6ynPkR2JydFC6jiz4hX9YKLKuNXBWzZw0kd6-gTNGPGPIVTUu2jWoo-_IZeK2TFB_ztWZHpxLskwKn1VFX5JVtEDngEEoOxNZEBXYgFu750hJPiqgqEdeQQsYhxshiBMwzme2PxnQurkxYsJBvCm1XRNK2YYfbuw2CqeAw_PTqWgD1a-zv-uQ18YTCL9Ek',
    trackingSteps: [
      { title: 'Reverse Pickup Completed', time: '23 Oct, 11:30 AM', location: 'Jaipur Hub', done: true },
      { title: 'In Transit to Seller Hub', time: '24 Oct, 04:15 PM', location: 'Delhi Sorting Centre', done: true },
      { title: 'Out for Delivery to Warehouse', time: '25 Oct, 09:00 AM', location: 'Surat Central Hub', done: true },
      { title: 'Delivered to Seller Facility', time: '25 Oct, 02:45 PM', location: 'Surat Warehouse', done: true },
    ],
  },
  {
    id: 'RTO-7734',
    orderId: 'ORD-88194',
    type: 'Courier RTO',
    productName: 'Minimalist Gold Chrono Watch',
    productDetails: 'SKU: GLD-WTC-01 • Qty: 1',
    customerName: 'Aman Deep (Patna, BR)',
    phone: '+91 98112 34567',
    courier: 'Shadowfax Express',
    awb: 'SFX-4820194810',
    reason: 'Customer Unreachable / 3 Attempts Failed',
    status: 'In-Transit',
    price: 2499,
    formattedPrice: '₹2,499',
    initiatedDate: '22 Oct 2024',
    deliveredDate: null,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMHrBBEaOKIaIxs-krCV8r98eScU7K8WD2ssKdbpMS3VW3A0oI_lvyCen00es3iKUWB5nJqn6FmQXPx3F3eAqR610Qe6djt3e0oFC7-UdI8bgs6DlOuJi9pm5qHbrPdN3UMOvwuaFC8EAmPkWPT_hQxo9L3pFSRuctjRjBQ_qekaPu-2bTYSSKr6hK25KISmNQl1lt-FDl7rmGsBfBb4Kjjto8Kt5E_NNuTjPjueyHTibBpPS--j-xqMV9xWe0bC1AWbvqWFdcNs',
    trackingSteps: [
      { title: '3 Delivery Attempts Failed', time: '22 Oct, 06:10 PM', location: 'Patna Hub', done: true },
      { title: 'RTO Initiated by Courier', time: '23 Oct, 09:30 AM', location: 'Patna Sorting Hub', done: true },
      { title: 'In Transit to Origin Facility', time: '24 Oct, 08:20 PM', location: 'Kolkata Hub', done: true },
      { title: 'Expected Delivery at Seller Hub', time: 'Expected 26 Oct', location: 'Surat Warehouse', done: false },
    ],
  },
  {
    id: 'RET-8890',
    orderId: 'ORD-88002',
    type: 'Customer Return',
    productName: 'Designer Cotton Tee - Navy (L)',
    productDetails: 'SKU: TEE-NVY-L • Qty: 2',
    customerName: 'Suresh Kumar (Bengaluru, KA)',
    phone: '+91 97234 56789',
    courier: 'Ecom Express',
    awb: 'ECOM-8192039182',
    reason: 'Defective Stitching on Hem',
    status: 'SPF Claimed',
    price: 899,
    formattedPrice: '₹899',
    initiatedDate: '20 Oct 2024',
    deliveredDate: '23 Oct 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRTty01mkjoiq24vG7JCv67mTgkB7lUXxFoiqUs_NruWp7TRi9kyFVti-Q8FxVFXZMxzH2kALIFEMvmsJG1ZD32g2mpFXHIhlP0AbFLDNsWpfuy-2Tag0dQHZ3m9I7xSfHtIp8XJH4jFO7Ysi5cLTxylwAWQXvNVg2G-C0YwF-1sGgCeVOsq1lgSssmigBCKxuQ8euHmXNKQuHTm2-tleA4ENttn6k5HdXGQ4mQBuS8I7A04qzGhNx-CgKErSOAuv4bJYF5eiohe4',
    spfClaim: {
      claimId: 'SPF-55201',
      date: '23 Oct 2024',
      issueType: 'Wrong / Used Item Returned',
      claimAmount: 899,
      status: 'Under Review',
      reviewNote: 'MShoppy Trust & Safety team inspecting unboxing video proofs.',
    },
    trackingSteps: [
      { title: 'Reverse Pickup Completed', time: '20 Oct, 02:00 PM', location: 'Bengaluru Hub', done: true },
      { title: 'In Transit', time: '21 Oct, 09:00 PM', location: 'Pune Logistics Hub', done: true },
      { title: 'Delivered to Warehouse', time: '23 Oct, 11:30 AM', location: 'Surat Warehouse', done: true },
    ],
  },
  {
    id: 'RTO-7690',
    orderId: 'ORD-87941',
    type: 'Courier RTO',
    productName: 'Urban Polarized Sunglasses - Black',
    productDetails: 'SKU: SUN-POL-BLK • Qty: 1',
    customerName: 'Neha Verma (Indore, MP)',
    phone: '+91 98451 12399',
    courier: 'Delhivery Surface',
    awb: 'DEL-8871625410',
    reason: 'Customer Refused COD at Doorstep',
    status: 'Restocked',
    price: 649,
    formattedPrice: '₹649',
    initiatedDate: '18 Oct 2024',
    deliveredDate: '21 Oct 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBX-Oxg3tIQjqdjNYMY_pihafWimHmYMcVgO1rLRx7FPQ-goP04XXTctzrP1EUSgiz2Jn5kz3WMVptCQvptirIdlET4u4VdQGQDZ0fl83N6tuSS0bBXW-MRY4efXvkGVJfmMly4zDgrkXKhoqEXjA2oE0f5PNLQ1_T0g1qHJVSEUYpca-vBnqeKJodW6IODtvR5Jyku3okYm2C5q48nT846n7GkYVK8g8REFli2rJ6HZ1vYnO22yYWGJQI950O4_9pkfKgKoVfKVeI',
    trackingSteps: [
      { title: 'COD Refused by Customer', time: '18 Oct, 01:15 PM', location: 'Indore Hub', done: true },
      { title: 'RTO In Transit', time: '19 Oct, 10:00 AM', location: 'Bhopal Hub', done: true },
      { title: 'Delivered to Warehouse', time: '21 Oct, 03:20 PM', location: 'Surat Warehouse', done: true },
      { title: 'QC Passed & Restocked', time: '21 Oct, 05:00 PM', location: 'Inventory System', done: true },
    ],
  },
  {
    id: 'RET-8842',
    orderId: 'ORD-87850',
    type: 'Customer Return',
    productName: 'Aura Minimalist Leather Watch',
    productDetails: 'SKU: AUR-WTC-BRN • Qty: 1',
    customerName: 'Karan Mehra (Mumbai, MH)',
    phone: '+91 99201 88472',
    courier: 'Shadowfax Express',
    awb: 'SFX-9182746194',
    reason: 'Different Color from Picture',
    status: 'Delivered to Warehouse',
    price: 1499,
    formattedPrice: '₹1,499',
    initiatedDate: '21 Oct 2024',
    deliveredDate: '24 Oct 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAV-4ZvD8edFl9Lx7SCSwdFXrKFRysgbseviqrpcYwlPpsVwMh6SSVFORqFmVJG-aZH3i_-DNWbVQptPCLNiw8CTD_e9BbXD_we51x_ztnvwqIFVYXuiWj1_76nc8HgnYAsh_NOyFmzhPkVBnuaDIMKYijWD3twWldxefTiqS5RyroofWD7VV-jq8Jy9lWB_UNzy4C6eMCN8Fe-E5cybIAqaGsHyVSSqqW9YOfZUAqay8ve_ELMRJJ6OGJT6aGbgx_BiY6aPqBpTQ8',
    trackingSteps: [
      { title: 'Pickup Completed', time: '21 Oct, 04:40 PM', location: 'Mumbai Andheri Hub', done: true },
      { title: 'In Transit', time: '22 Oct, 11:15 AM', location: 'Thane Central Hub', done: true },
      { title: 'Delivered to Warehouse', time: '24 Oct, 01:10 PM', location: 'Surat Warehouse', done: true },
    ],
  },
  {
    id: 'RET-8711',
    orderId: 'ORD-87290',
    type: 'Customer Return',
    productName: 'Chanderi Jacquard Saree - Emerald Green',
    productDetails: 'SKU: CHD-SAR-GRN • Qty: 1',
    customerName: 'Ritu Sen (Kolkata, WB)',
    phone: '+91 98301 77219',
    courier: 'Delhivery Surface',
    awb: 'DEL-7281940192',
    reason: 'Fabric Quality Discrepancy',
    status: 'SPF Claimed',
    price: 1899,
    formattedPrice: '₹1,899',
    initiatedDate: '15 Oct 2024',
    deliveredDate: '18 Oct 2024',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCv6DgYAFvGbNJ5APR46xls7W7pN8o67LV_V8M5UUB3Wg82Y35C7rJLKqw75qntSEhXK9Ac79emuJ4yu6ynPkR2JydFC6jiz4hX9YKLKuNXBWzZw0kd6-gTNGPGPIVTUu2jWoo-_IZeK2TFB_ztWZHpxLskwKn1VFX5JVtEDngEEoOxNZEBXYgFu750hJPiqgqEdeQQsYhxshiBMwzme2PxnQurkxYsJBvCm1XRNK2YYfbuw2CqeAw_PTqWgD1a-zv-uQ18YTCL9Ek',
    spfClaim: {
      claimId: 'SPF-54910',
      date: '19 Oct 2024',
      issueType: 'Empty Box / Missing Product',
      claimAmount: 1899,
      status: 'Approved & Credited',
      reviewNote: 'Claim approved! ₹1,899 credited to Seller Wallet on 21 Oct.',
    },
    trackingSteps: [
      { title: 'Reverse Pickup Completed', time: '15 Oct, 10:00 AM', location: 'Kolkata Hub', done: true },
      { title: 'Delivered to Seller', time: '18 Oct, 03:15 PM', location: 'Surat Warehouse', done: true },
      { title: 'Empty Box Reported (SPF Raised)', time: '19 Oct, 11:00 AM', location: 'Dispute Portal', done: true },
    ],
  },
];

export default function SupplierReturnsRTO({ onNavigate, onBack }) {
  const [items, setItems] = useState(INITIAL_RETURNS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Tracking Modal State
  const [trackingModalItem, setTrackingModalItem] = useState(null);

  // SPF Claim Modal State
  const [spfModalItem, setSpfModalItem] = useState(null);
  const [spfIssueType, setSpfIssueType] = useState('Wrong Product Received');
  const [spfClaimAmount, setSpfClaimAmount] = useState('');
  const [spfDescription, setSpfDescription] = useState('');
  const [spfFiles, setSpfFiles] = useState([]);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Restock action
  const handleRestock = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Restocked',
            trackingSteps: [
              ...item.trackingSteps,
              {
                title: 'QC Verified & Inventory Restocked',
                time: 'Just now',
                location: 'Warehouse Shelf A-4',
                done: true,
              },
            ],
          };
        }
        return item;
      })
    );
    showToast(`Unit ${id} restocked! Available quantity updated in live catalog.`);
  };

  // Real File Upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type.startsWith('video') ? 'video' : 'image',
      previewUrl: URL.createObjectURL(file),
    }));

    setSpfFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSpfFiles((prev) => {
      const updated = [...prev];
      if (updated[index]?.previewUrl) {
        URL.revokeObjectURL(updated[index].previewUrl);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  // Open SPF modal
  const openSpfModal = (item) => {
    setSpfModalItem(item);
    setSpfIssueType('Wrong Product Received');
    setSpfClaimAmount(item.price.toString());
    setSpfDescription('');
    setSpfFiles([]);
  };

  // Submit SPF Claim
  const submitSpfClaim = () => {
    if (!spfModalItem) return;

    if (spfFiles.length === 0) {
      showToast('⚠️ Please upload at least 1 photo or video proof from your device.');
      return;
    }

    const generatedClaimId = 'SPF-' + Math.floor(10000 + Math.random() * 90000);

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === spfModalItem.id) {
          return {
            ...it,
            status: 'SPF Claimed',
            spfClaim: {
              claimId: generatedClaimId,
              date: 'Today',
              issueType: spfIssueType,
              claimAmount: Number(spfClaimAmount) || it.price,
              status: 'Under Review',
              reviewNote: `Claim submitted with ${spfFiles.length} photo/video proofs. MShoppy inspection in progress (SLA: 48h).`,
            },
          };
        }
        return it;
      })
    );

    showToast(`Claim #${generatedClaimId} submitted successfully! Dispute raised.`);
    setSpfModalItem(null);
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const headers = 'Return ID,Order ID,Type,Product,Customer,Courier,AWB,Status,Amount\n';
    const rows = items
      .map(
        (i) =>
          `"${i.id}","${i.orderId}","${i.type}","${i.productName}","${i.customerName}","${i.courier}","${i.awb}","${i.status}","${i.price}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MShoppy_Returns_RTO_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Returns & RTO report downloaded successfully!');
  };

  // Filter calculations
  const totalCount = items.length;
  const customerReturnsCount = items.filter((i) => i.type === 'Customer Return').length;
  const courierRtoCount = items.filter((i) => i.type === 'Courier RTO').length;
  const restockedCount = items.filter((i) => i.status === 'Restocked').length;
  const spfCount = items.filter((i) => i.status === 'SPF Claimed').length;

  const filteredItems = items.filter((item) => {
    // Tab filter
    if (activeTab === 'customer_return' && item.type !== 'Customer Return') return false;
    if (activeTab === 'courier_rto' && item.type !== 'Courier RTO') return false;
    if (activeTab === 'restocked' && item.status !== 'Restocked') return false;
    if (activeTab === 'spf' && item.status !== 'SPF Claimed') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.awb.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1e293b] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-rose-400 text-xl">assignment_return</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('/seller-dashboard'))}
              aria-label="Back to Dashboard"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight truncate">
                  <span className="inline sm:hidden">Returns &amp; RTO Hub</span>
                  <span className="hidden sm:inline">Returns, RTO &amp; Claims Hub</span>
                </h1>
                <span className="bg-rose-50 text-[#b90041] border border-rose-200/60 text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  Supplier Central
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 hidden md:block">
                Manage inbound customer returns, track courier RTOs, restock inventory, and submit SPF dispute claims.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/supplier-rot-ledger')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Supplier ROT & Freight Ledger"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">receipt_long</span>
              <span className="hidden xs:inline">ROT Ledger</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Export CSV"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">download</span>
              <span className="hidden xs:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/seller-dashboard')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Seller Console"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">dashboard</span>
              <span>Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1500px] w-full mx-auto p-3 sm:p-6 md:p-8 space-y-3.5 sm:space-y-6 flex-1 pb-44 sm:pb-32">
        {/* KPI Summary Banner (Responsive Grid) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Card 1: Total Volume */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="p-1.5 sm:p-2 bg-rose-50 text-[#b90041] rounded-xl">
                <span className="material-symbols-outlined text-base sm:text-lg">assignment_return</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-lg sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {totalCount} Units
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Value: ₹32,450</p>
            </div>
          </div>

          {/* Card 2: Customer Returns */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl">
                <span className="material-symbols-outlined text-base sm:text-lg">shopping_bag</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Customer
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-lg sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {customerReturnsCount} Units
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Doorstep pickups</p>
            </div>
          </div>

          {/* Card 3: Courier RTO */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
                <span className="material-symbols-outlined text-base sm:text-lg">local_shipping</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Courier RTO
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-lg sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {courierRtoCount} Units
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Undelivered parcels</p>
            </div>
          </div>

          {/* Card 4: Restocked */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <span className="material-symbols-outlined text-base sm:text-lg">inventory</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Restocked
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-lg sm:text-2xl font-black text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">
                {restockedCount} Restocked
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Back in live stock</p>
            </div>
          </div>

          {/* Card 5: SPF Claims (Responsive full-width on phone) */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-xl">
                <span className="material-symbols-outlined text-base sm:text-lg">verified_user</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                SPF Claims
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-lg sm:text-2xl font-black text-purple-700 font-['Plus_Jakarta_Sans',sans-serif]">
                ₹12,850
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{spfCount} Claims filed</p>
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Items', count: totalCount },
              { id: 'customer_return', label: 'Customer Returns 🛍️', count: customerReturnsCount },
              { id: 'courier_rto', label: 'Courier RTO 🚚', count: courierRtoCount },
              { id: 'restocked', label: 'Restocked ✅', count: restockedCount },
              { id: 'spf', label: 'SPF Disputes 🛡️', count: spfCount },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#b90041] text-white shadow-sm shadow-rose-200'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Order #, AWB, product..."
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-9 text-xs font-medium focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </section>

        {/* Returns & RTO Items List */}
        <section className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
              <h3 className="text-lg font-bold text-slate-800 mt-3 font-['Plus_Jakarta_Sans',sans-serif]">
                No Return / RTO records match your filter
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search query or switching tabs to view all items.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="mt-4 bg-[#b90041] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#a00037] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isRestocked = item.status === 'Restocked';
              const isSPF = item.status === 'SPF Claimed';
              const isDelivered = item.status === 'Delivered to Warehouse';
              const isInTransit = item.status === 'In-Transit';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/70 p-3.5 sm:p-5 md:p-6 shadow-xs hover:shadow-md transition-all space-y-3 sm:space-y-4"
                >
                  {/* Top Header Row: IDs, Type Badge & Price */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900 font-mono">
                        {item.id}
                      </span>
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-600 font-mono">
                        {item.orderId}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.type === 'Customer Return'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] shrink-0">
                      {item.formattedPrice}
                    </div>
                  </div>

                  {/* Main Body: Image & Product Details */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <h2 className="font-bold text-xs sm:text-sm md:text-base text-slate-800 line-clamp-2 leading-snug">
                        {item.productName}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                        {item.productDetails}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                        <span className="material-symbols-outlined text-xs sm:text-sm text-slate-400">person</span>
                        <span className="truncate">{item.customerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason Box */}
                  <div className="flex items-center gap-1.5 font-semibold text-rose-700 bg-rose-50/80 border border-rose-100/80 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs">
                    <span className="material-symbols-outlined text-sm sm:text-base shrink-0">report_problem</span>
                    <span className="truncate"><strong className="font-bold">Reason:</strong> {item.reason}</span>
                  </div>

                  {/* SPF Badge if active */}
                  {isSPF && item.spfClaim && (
                    <div className="p-2.5 sm:p-3 bg-purple-50 border border-purple-200/70 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-base shrink-0 mt-0.5 sm:mt-0">
                          shield
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-purple-900 block truncate">
                            {item.spfClaim.claimId} ({item.spfClaim.issueType})
                          </span>
                          <p className="text-[11px] text-purple-700 mt-0.5 line-clamp-1">
                            {item.spfClaim.reviewNote}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`self-start sm:self-auto px-2 py-0.5 rounded-md text-[10px] font-black uppercase whitespace-nowrap shrink-0 ${
                          item.spfClaim.status === 'Approved & Credited'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.spfClaim.status}
                      </span>
                    </div>
                  )}

                  {/* Logistics Meta & Status & Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Logistics & Status Pill */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                        <span className="material-symbols-outlined text-xs sm:text-sm text-slate-400">local_shipping</span>
                        <span>{item.courier}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px] sm:text-[11px] text-slate-400">{item.awb}</span>
                      </div>

                      <div>
                        {isRestocked && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Restocked
                          </span>
                        )}
                        {isDelivered && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">warehouse</span>
                            Delivered (Needs QC)
                          </span>
                        )}
                        {isInTransit && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">autorenew</span>
                            In Reverse Transit
                          </span>
                        )}
                        {isSPF && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">gavel</span>
                            SPF Claimed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Touch-optimized, responsive grid on mobile, flex on desktop */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setTrackingModalItem(item)}
                        className="col-span-1 sm:col-auto px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">route</span>
                        Track
                      </button>

                      {isDelivered && (
                        <>
                          <button
                            type="button"
                            onClick={() => openSpfModal(item)}
                            className="col-span-1 sm:col-auto px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">shield</span>
                            Raise SPF
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestock(item.id)}
                            className="col-span-2 sm:col-auto px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">inventory</span>
                            Confirm &amp; Restock
                          </button>
                        </>
                      )}

                      {isInTransit && (
                        <button
                          type="button"
                          onClick={() => showToast(`Courier ${item.courier} pinged. Expected delivery in 24-48 hours.`)}
                          className="col-span-1 sm:col-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
                        >
                          Ping Courier
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* ===================== MODAL 1: Reverse Tracking Stepper ===================== */}
      {trackingModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-['Plus_Jakarta_Sans',sans-serif]">
                  Reverse Tracking
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-mono">
                  {trackingModalItem.id} • AWB {trackingModalItem.awb}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Courier Info */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">Carrier</span>
                <p className="text-xs font-bold text-slate-800">{trackingModalItem.courier}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase">Original Order</span>
                <p className="text-xs font-mono font-bold text-[#b90041]">{trackingModalItem.orderId}</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackingModalItem.trackingSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step.done
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-800">{step.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {step.location} • {step.time}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTrackingModalItem(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: Raise SPF Dispute Claim (With Real File Upload) ===================== */}
      {spfModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-3.5 sm:space-y-4 my-auto max-h-[82vh] sm:max-h-[88vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 text-[#b90041] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg sm:text-xl">shield</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-['Plus_Jakarta_Sans',sans-serif]">
                    Supplier Protection Fund
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Dispute wrong, damaged or empty return parcel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpfModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Selected Product Snapshot */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
              <img
                src={spfModalItem.imageUrl}
                alt=""
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              ></img>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 block truncate">
                  {spfModalItem.id} • Order {spfModalItem.orderId}
                </span>
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {spfModalItem.productName}
                </h4>
                <p className="text-xs font-extrabold text-[#b90041] mt-0.5">
                  Item Price: {spfModalItem.formattedPrice}
                </p>
              </div>
            </div>

            {/* Issue Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Dispute Reason / Issue Type *
              </label>
              <select
                value={spfIssueType}
                onChange={(e) => setSpfIssueType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all cursor-pointer"
              >
                <option value="Wrong Product Received">Wrong Product Received (Counterfeit / Substituted)</option>
                <option value="Used / Worn Condition">Customer Returned Worn or Stained Item</option>
                <option value="Empty Box / Missing Item">Empty Box or Missing Product Accessories</option>
                <option value="Damaged in Reverse Transit">Physical Damage Caused During Courier Transit</option>
                <option value="Tag Removed / Swapped">Original Brand Tag / Barcode Tampered or Removed</option>
              </select>
            </div>

            {/* Claim Amount Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Claim Compensation Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  value={spfClaimAmount}
                  onChange={(e) => setSpfClaimAmount(e.target.value)}
                  placeholder="Enter claim amount"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 sm:py-2.5 pl-7 pr-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                Maximum claimable: {spfModalItem.formattedPrice} (100% of product value)
              </p>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Seller Remarks / Unboxing Description
              </label>
              <textarea
                rows={2}
                value={spfDescription}
                onChange={(e) => setSpfDescription(e.target.value)}
                placeholder="Describe what was inside the parcel upon opening..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#b90041]/20 focus:border-[#b90041] outline-none transition-all resize-none"
              />
            </div>

            {/* Real Device File / Video Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Upload Photo & Video Proofs *
                </label>
                <span className="text-[11px] font-bold text-[#b90041]">
                  {spfFiles.length} Selected
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload Dropzone / Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="w-full border-2 border-dashed border-rose-300 hover:border-[#b90041] bg-rose-50/40 hover:bg-rose-50 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl text-[#b90041] group-hover:scale-110 transition-transform">
                  add_photo_alternate
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Choose Photos or Unboxing Video
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500">
                  Tap to upload from camera or files (PNG, JPG, MP4)
                </span>
              </button>

              {/* Uploaded File Previews */}
              {spfFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {spfFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square flex items-center justify-center"
                    >
                      {f.type === 'image' ? (
                        <img
                          src={f.previewUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <span className="material-symbols-outlined text-xl sm:text-2xl text-purple-600">
                            videocam
                          </span>
                          <span className="text-[9px] font-bold text-slate-600 truncate max-w-[65px]">
                            {f.name}
                          </span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center text-[10px] cursor-pointer transition-colors"
                      >
                        ✕
                      </button>

                      {/* Size Badge */}
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-mono px-1 rounded">
                        {f.size}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSpfModalItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSpfClaim}
                className="flex-1 py-2.5 rounded-xl bg-[#b90041] hover:bg-[#a00037] text-white text-xs font-bold shadow-md shadow-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Bottom Navigation for Mobile */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}
