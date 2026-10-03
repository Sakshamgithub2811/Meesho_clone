import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';

// Mock Comprehensive Settlement & Tracking Data for Dropshippers
const INITIAL_ORDERS_TRACKING = [
  {
    id: 'ORD-90214',
    awb: 'DLV-8829104',
    courier: 'Delhivery Surface',
    courierLogo: '🚚',
    orderDate: '21 Oct 2024, 02:40 PM',
    customerName: 'Pooja Verma',
    customerCity: 'Jaipur, Rajasthan',
    customerPhone: '+91 98765 43210',
    productName: 'Banarasi Silk Embroidered Kurti - Pink (M)',
    productSku: 'BSK-PNK-M',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    qty: 1,
    paymentMode: 'COD',
    sellingPrice: 1299,
    supplierBasePrice: 849,
    shippingFee: 70,
    tdsDeduction: 13,
    netMargin: 367,
    orderStatus: 'Delivered', // 'In-Transit' | 'Delivered' | 'RTO' | 'Returned' | 'Dispatched'
    logisticsStatus: 'Delivered', // 'Manifested' | 'In-Transit' | 'Out for Delivery' | 'Delivered' | 'RTO in Transit' | 'RTO Delivered'
    settlementStatus: 'Settled', // 'Settled' | 'In Escrow' | 'Reversed' | 'Disputed'
    coolingDaysLeft: 0,
    settlementDate: '28 Oct 2024',
    utrNumber: 'UTR-HDFC-9928174620',
    bankAccount: 'HDFC Bank ****4419',
    timeline: [
      { step: 'Order Placed', time: '21 Oct 2024, 02:40 PM', desc: 'Customer placed COD order via WhatsApp Catalog link.', completed: true },
      { step: 'Supplier Dispatched', time: '22 Oct 2024, 11:15 AM', desc: 'Packed and handed over to Delhivery Surat Hub.', completed: true },
      { step: 'In-Transit & Hub Updates', time: '23 Oct 2024, 06:30 PM', desc: 'Arrived at Jaipur Regional Distribution Centre.', completed: true },
      { step: 'Out for Delivery & Delivered', time: '24 Oct 2024, 01:20 PM', desc: 'Delivered by Rider Rahul S. COD ₹1,299 collected with OTP.', completed: true },
      { step: '7-Day Return Cooling Window', time: '24 Oct - 31 Oct 2024', desc: 'Return cooling period completed without return requests.', completed: true },
      { step: 'Bank Payout Settled', time: '28 Oct 2024, 04:00 PM', desc: 'Net margin ₹367 credited to HDFC Bank (UTR: UTR-HDFC-9928174620).', completed: true },
    ],
  },
  {
    id: 'ORD-90185',
    awb: 'SFX-7738291',
    courier: 'Shadowfax Express',
    courierLogo: '⚡',
    orderDate: '23 Oct 2024, 10:15 AM',
    customerName: 'Aarav Mehta',
    customerCity: 'Bengaluru, Karnataka',
    customerPhone: '+91 97654 32109',
    productName: 'Men Slim Fit Stretchable Denim Jeans - Dark Blue (32)',
    productSku: 'DNM-DBLU-32',
    productImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    qty: 1,
    paymentMode: 'Prepaid (UPI)',
    sellingPrice: 999,
    supplierBasePrice: 649,
    shippingFee: 50,
    tdsDeduction: 10,
    netMargin: 290,
    orderStatus: 'Delivered',
    logisticsStatus: 'Delivered',
    settlementStatus: 'In Escrow',
    coolingDaysLeft: 4,
    settlementDate: 'Expected 31 Oct 2024',
    utrNumber: 'Pending Escrow Release',
    bankAccount: 'HDFC Bank ****4419',
    timeline: [
      { step: 'Order Placed', time: '23 Oct 2024, 10:15 AM', desc: 'Prepaid payment ₹999 received via PhonePe UPI.', completed: true },
      { step: 'Supplier Dispatched', time: '23 Oct 2024, 04:00 PM', desc: 'Dispatched from Tirupur Apparel Hub.', completed: true },
      { step: 'In-Transit & Hub Updates', time: '25 Oct 2024, 08:45 AM', desc: 'Reached Bengaluru East Delivery Hub.', completed: true },
      { step: 'Out for Delivery & Delivered', time: '25 Oct 2024, 02:10 PM', desc: 'Delivered to customer doorstep.', completed: true },
      { step: '7-Day Return Cooling Window', time: 'Active (4 Days Remaining)', desc: 'Margin in escrow. Auto-settlement scheduled for 31 Oct 2024.', completed: false },
      { step: 'Bank Payout Settled', time: 'Scheduled 31 Oct 2024', desc: 'Will be deposited in next Tuesday payout batch.', completed: false },
    ],
  },
  {
    id: 'ORD-90142',
    awb: 'BLU-6629104',
    courier: 'BlueDart Air',
    courierLogo: '✈️',
    orderDate: '24 Oct 2024, 05:20 PM',
    customerName: 'Ananya Rao',
    customerCity: 'Hyderabad, Telangana',
    customerPhone: '+91 99887 76655',
    productName: 'Floral Print Georgette Anarkali Gown (L)',
    productSku: 'ANK-GEO-L',
    productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    qty: 1,
    paymentMode: 'COD',
    sellingPrice: 1599,
    supplierBasePrice: 1050,
    shippingFee: 80,
    tdsDeduction: 16,
    netMargin: 453,
    orderStatus: 'In-Transit',
    logisticsStatus: 'Out for Delivery',
    settlementStatus: 'In Escrow',
    coolingDaysLeft: 7,
    settlementDate: 'Expected 03 Nov 2024',
    utrNumber: 'Awaiting Delivery',
    bankAccount: 'HDFC Bank ****4419',
    timeline: [
      { step: 'Order Placed', time: '24 Oct 2024, 05:20 PM', desc: 'Customer placed COD order.', completed: true },
      { step: 'Supplier Dispatched', time: '25 Oct 2024, 09:30 AM', desc: 'Dispatched via BlueDart Express Air.', completed: true },
      { step: 'In-Transit & Hub Updates', time: '26 Oct 2024, 06:15 AM', desc: 'Reached Begumpet Hub Hyderabad.', completed: true },
      { step: 'Out for Delivery', time: 'Today, 09:10 AM', desc: 'Courier Rider on way to destination. Cash collection OTP active.', completed: false },
      { step: '7-Day Return Cooling Window', time: 'Pending Delivery', desc: 'Starts upon successful delivery.', completed: false },
      { step: 'Bank Payout Settled', time: 'Pending', desc: 'Will clear after cooling window.', completed: false },
    ],
  },
  {
    id: 'ORD-89980',
    awb: 'EKR-5529182',
    courier: 'Ekart Logistics',
    courierLogo: '📦',
    orderDate: '19 Oct 2024, 11:30 AM',
    customerName: 'Rajesh Nair',
    customerCity: 'Kochi, Kerala',
    customerPhone: '+91 91234 56789',
    productName: 'Smart Fitness Tracker Band with Heart Rate Monitor',
    productSku: 'SMT-BND-BLK',
    productImage: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80',
    qty: 1,
    paymentMode: 'COD',
    sellingPrice: 899,
    supplierBasePrice: 599,
    shippingFee: 60,
    tdsDeduction: 9,
    netMargin: -60, // Reverse shipping cost on RTO
    orderStatus: 'RTO',
    logisticsStatus: 'RTO Delivered to Warehouse',
    settlementStatus: 'Reversed',
    coolingDaysLeft: 0,
    settlementDate: '24 Oct 2024',
    utrNumber: 'ADJ-RTO-89980',
    bankAccount: 'HDFC Bank ****4419',
    rtoReason: 'Customer Unreachable / 3 Attempts Failed',
    disputeStatus: 'Eligible for Claim',
    timeline: [
      { step: 'Order Placed', time: '19 Oct 2024, 11:30 AM', desc: 'COD order confirmed.', completed: true },
      { step: 'Supplier Dispatched', time: '20 Oct 2024, 10:00 AM', desc: 'Shipped from Bengaluru Hub.', completed: true },
      { step: 'Delivery Attempts Failed', time: '22-24 Oct 2024', desc: '3 Doorstep attempts failed: Customer phone switched off / unavailable.', completed: true },
      { step: 'RTO (Return to Origin) Initiated', time: '24 Oct 2024, 06:00 PM', desc: 'Parcel flagged as RTO. Shipped back to warehouse.', completed: true },
      { step: 'Warehouse Intake & QC Check', time: '26 Oct 2024, 11:30 AM', desc: 'Package returned intact to supplier warehouse.', completed: true },
      { step: 'Settlement Adjustment', time: '26 Oct 2024', desc: 'Margin of ₹231 cancelled. Return shipping ₹60 deducted.', completed: true },
    ],
  },
  {
    id: 'ORD-89820',
    awb: 'DLV-4481029',
    courier: 'Delhivery Surface',
    courierLogo: '🚚',
    orderDate: '18 Oct 2024, 04:10 PM',
    customerName: 'Kavita Singh',
    customerCity: 'Lucknow, Uttar Pradesh',
    customerPhone: '+91 94567 89012',
    productName: 'Handcrafted Brass Jhumka Earrings - Gold Plated',
    productSku: 'JHM-GLD-01',
    productImage: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    qty: 2,
    sellingPrice: 798,
    supplierBasePrice: 450,
    shippingFee: 50,
    tdsDeduction: 8,
    netMargin: -290, // Customer return reversal
    paymentMode: 'Prepaid (GPay)',
    orderStatus: 'Returned',
    logisticsStatus: 'Reverse Pickup Completed',
    settlementStatus: 'Reversed',
    coolingDaysLeft: 0,
    settlementDate: '23 Oct 2024',
    utrNumber: 'REV-RET-89820',
    bankAccount: 'HDFC Bank ****4419',
    rtoReason: 'Customer Return: Fabric/Quality Not as Expected',
    disputeStatus: 'Claim Under Review',
    claimId: 'CLM-9821',
    timeline: [
      { step: 'Order Placed & Paid', time: '18 Oct 2024, 04:10 PM', desc: 'Prepaid order placed.', completed: true },
      { step: 'Delivered to Customer', time: '21 Oct 2024, 03:00 PM', desc: 'Delivered at customer address.', completed: true },
      { step: 'Customer Return Initiated', time: '22 Oct 2024, 09:20 AM', desc: 'Customer requested return within 7-day window.', completed: true },
      { step: 'Rider Reverse Pickup', time: '23 Oct 2024, 01:15 PM', desc: 'Reverse QC verified and picked up by Rider RID-4402.', completed: true },
      { step: 'Margin Reversal Applied', time: '24 Oct 2024', desc: 'Original margin ₹290 reversed from dropshipper balance.', completed: true },
      { step: 'Dispute Claim Raised', time: '25 Oct 2024', desc: 'Dropshipper filed Claim #CLM-9821 for incorrect return package.', completed: true },
    ],
  },
  {
    id: 'ORD-89710',
    awb: 'SFX-9912034',
    courier: 'Shadowfax Express',
    courierLogo: '⚡',
    orderDate: '15 Oct 2024, 08:30 PM',
    customerName: 'Vikram Joshi',
    customerCity: 'Pune, Maharashtra',
    customerPhone: '+91 93456 78123',
    productName: 'Wireless Bluetooth Earbuds Pro (Active Noise Cancelling)',
    productSku: 'EBD-PRO-BLK',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    qty: 1,
    paymentMode: 'Prepaid (Card)',
    sellingPrice: 1899,
    supplierBasePrice: 1299,
    shippingFee: 60,
    tdsDeduction: 19,
    netMargin: 521,
    orderStatus: 'Delivered',
    logisticsStatus: 'Delivered',
    settlementStatus: 'Settled',
    coolingDaysLeft: 0,
    settlementDate: '22 Oct 2024',
    utrNumber: 'UTR-HDFC-8819203911',
    bankAccount: 'HDFC Bank ****4419',
    timeline: [
      { step: 'Order Placed', time: '15 Oct 2024', desc: 'Prepaid transaction verified.', completed: true },
      { step: 'Dispatched & In Transit', time: '16 Oct 2024', desc: 'Shipped from Mumbai Logistics Hub.', completed: true },
      { step: 'Delivered', time: '17 Oct 2024', desc: 'Doorstep delivery completed with signature.', completed: true },
      { step: '7-Day Return Window Cleared', time: '24 Oct 2024', desc: 'Zero returns logged.', completed: true },
      { step: 'Settlement Deposited', time: '22 Oct 2024', desc: 'Margin of ₹521 credited to account.', completed: true },
    ],
  },
];

export default function DropshipperSettlementTracking({ onNavigate, onBack }) {
  const navigate = useNavigate();

  // State
  const [orders, setOrders] = useState(INITIAL_ORDERS_TRACKING);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'in_transit' | 'escrow' | 'settled' | 'rto' | 'disputed'
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'PREPAID' | 'COD'
  const [dateRange, setDateRange] = useState('30_days');

  // Modals state
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState(null);
  const [selectedOrderForSettlement, setSelectedOrderForSettlement] = useState(null);
  const [selectedOrderForClaim, setSelectedOrderForClaim] = useState(null);
  const [claimReason, setClaimReason] = useState('DAMAGED_RETURN');
  const [claimDescription, setClaimDescription] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Show toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Safe navigation handler
  const handleNavigation = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path.startsWith('/') ? path : `/${path}`);
    }
  };

  // Safe back handler
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Financial KPI Metrics
  const metrics = useMemo(() => {
    const totalGov = orders.reduce((sum, o) => sum + o.sellingPrice, 0);
    const settledMargin = orders
      .filter((o) => o.settlementStatus === 'Settled')
      .reduce((sum, o) => sum + o.netMargin, 0);
    const pendingEscrow = orders
      .filter((o) => o.settlementStatus === 'In Escrow')
      .reduce((sum, o) => sum + o.netMargin, 0);
    const reversedAmount = orders
      .filter((o) => o.settlementStatus === 'Reversed')
      .reduce((sum, o) => sum + Math.abs(o.netMargin), 0);
    const rtoCount = orders.filter((o) => o.orderStatus === 'RTO' || o.orderStatus === 'Returned').length;
    const activeInTransit = orders.filter((o) => o.orderStatus === 'In-Transit').length;

    return {
      totalGov,
      settledMargin,
      pendingEscrow,
      reversedAmount,
      rtoCount,
      activeInTransit,
      totalOrdersCount: orders.length,
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === 'in_transit' && order.orderStatus !== 'In-Transit') return false;
      if (activeTab === 'escrow' && order.settlementStatus !== 'In Escrow') return false;
      if (activeTab === 'settled' && order.settlementStatus !== 'Settled') return false;
      if (activeTab === 'rto' && order.orderStatus !== 'RTO' && order.orderStatus !== 'Returned') return false;
      if (activeTab === 'disputed' && !order.disputeStatus && order.settlementStatus !== 'Disputed') return false;

      // Payment filter
      if (paymentFilter === 'PREPAID' && !order.paymentMode.toLowerCase().includes('prepaid')) return false;
      if (paymentFilter === 'COD' && order.paymentMode !== 'COD') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesAwb = order.awb.toLowerCase().includes(q);
        const matchesCustomer = order.customerName.toLowerCase().includes(q);
        const matchesProduct = order.productName.toLowerCase().includes(q);
        const matchesSku = order.productSku.toLowerCase().includes(q);
        if (!matchesId && !matchesAwb && !matchesCustomer && !matchesProduct && !matchesSku) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, paymentFilter, searchQuery]);

  // Handle dispute claim submission
  const handleDisputeSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrderForClaim) return;

    const newClaimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === selectedOrderForClaim.id
          ? {
              ...ord,
              disputeStatus: 'Claim Under Review',
              claimId: newClaimId,
              settlementStatus: 'Disputed',
            }
          : ord
      )
    );

    setSelectedOrderForClaim(null);
    setClaimDescription('');
    triggerToast(`Dispute Claim #${newClaimId} submitted successfully! Support team will verify within 24 hours.`);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      triggerToast(`${label} copied to clipboard!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-28 text-gray-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-pink-500/40 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-4">
          <span className="text-pink-400 text-base">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Settlement & Tracking</span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-[#b90041] border border-rose-200">
                  Dropshipper Portal
                </span>
              </h1>
            </div>
            <p className="text-[12px] text-gray-500 hidden sm:block">
              Real-time multi-stage order tracking, logistics updates, RTO reversals & net bank settlement ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleNavigation('/dropshipper-rot-manager')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 border border-purple-200 transition cursor-pointer"
            title="Manage ROT Liability & Return Plans"
          >
            <span>🛡️</span>
            <span>ROT Policy</span>
          </button>
          <button
            onClick={() => handleNavigation('/payout-settings')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition cursor-pointer"
          >
            <span>🏦</span>
            <span>Bank Settings</span>
          </button>
          <button
            onClick={() => triggerToast('Generating full monthly settlement ledger PDF...')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#b90041] to-[#80145c] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-pink-900/20 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Statement</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">

        {/* 1. Top Financial & Operations Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Total Gross Sales */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Gross Order Value</span>
              <span className="w-7 h-7 rounded-lg bg-pink-50 text-[#b90041] flex items-center justify-center text-sm font-bold">🛒</span>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-gray-900">₹{metrics.totalGov.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span>↑ 14.8%</span>
                <span className="text-gray-400 font-normal">vs last cycle</span>
              </div>
            </div>
          </div>

          {/* Card 2: Settled Realized Profit */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-800">Settled Margin (Paid)</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">💰</span>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-emerald-700">₹{metrics.settledMargin.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Credited to <span className="font-semibold text-gray-700">HDFC ****4419</span>
              </div>
            </div>
          </div>

          {/* Card 3: Pending Escrow Clearance */}
          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-amber-800">In Escrow (Cooling)</span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">⏳</span>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-amber-700">₹{metrics.pendingEscrow.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-amber-600/90 font-medium mt-0.5">
                7-day return window active
              </div>
            </div>
          </div>

          {/* Card 4: RTO / Reversal Deductions */}
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-rose-800">RTO / Returns Reversed</span>
              <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">🔄</span>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-rose-700">-₹{metrics.reversedAmount.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {metrics.rtoCount} RTO/Return adjustments
              </div>
            </div>
          </div>

          {/* Card 5: Next Scheduled Payout Cycle */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-2xl shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-300 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Next Auto Payout</span>
              <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs">⚡</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-pink-400">Tuesday, 31 Oct</div>
              <div className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-between">
                <span>IMPS Auto-Batch</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Search, Filters & Tab Navigation */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
          {/* Top Row: Search + Quick Selects */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID (e.g. ORD-90214), AWB, Customer or SKU..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b90041] focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Payment Mode */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b90041] cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="PREPAID">Prepaid (UPI/Card)</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b90041] cursor-pointer"
              >
                <option value="7_days">Last 7 Days</option>
                <option value="30_days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Tab Row */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 pt-3">
            {[
              { id: 'all', label: 'All Orders', count: orders.length, icon: '📑' },
              { id: 'in_transit', label: 'In-Transit', count: orders.filter((o) => o.orderStatus === 'In-Transit').length, icon: '🚚' },
              { id: 'escrow', label: 'In Escrow (Cooling)', count: orders.filter((o) => o.settlementStatus === 'In Escrow').length, icon: '⏳' },
              { id: 'settled', label: 'Settled & Paid', count: orders.filter((o) => o.settlementStatus === 'Settled').length, icon: '✅' },
              { id: 'rto', label: 'RTO / Returned', count: orders.filter((o) => o.orderStatus === 'RTO' || o.orderStatus === 'Returned').length, icon: '🔄' },
              { id: 'disputed', label: 'Disputed Claims', count: orders.filter((o) => o.disputeStatus).length, icon: '⚖️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#b90041] text-white shadow-sm shadow-pink-900/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Orders & Settlements Ledger Table / Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing <strong className="text-gray-900">{filteredOrders.length}</strong> orders matching your criteria</span>
            <span className="hidden sm:inline">Click any order to view 5-Stage Live Journey & Settlement Math</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-3">
                🔍
              </div>
              <h3 className="text-sm font-bold text-gray-800">No orders found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No tracking or settlement records match your search query or tab filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setPaymentFilter('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredOrders.map((order) => {
                const isSettled = order.settlementStatus === 'Settled';
                const isInEscrow = order.settlementStatus === 'In Escrow';
                const isReversed = order.settlementStatus === 'Reversed';
                const isRTO = order.orderStatus === 'RTO' || order.orderStatus === 'Returned';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-pink-300 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between gap-4"
                  >
                    {/* Top Order Row: ID, Dates, Status Badges */}
                    <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{order.id}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{order.orderDate}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <span>{order.courierLogo}</span>
                          <span>{order.awb}</span>
                        </span>
                      </div>

                      {/* Badges Pill Group */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Payment Mode Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            order.paymentMode.includes('Prepaid')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {order.paymentMode}
                        </span>

                        {/* Logistics Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            order.logisticsStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isRTO
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span>{order.logisticsStatus === 'Delivered' ? '●' : '⚡'}</span>
                          <span>{order.logisticsStatus}</span>
                        </span>

                        {/* Settlement Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInEscrow
                              ? 'bg-amber-100 text-amber-800'
                              : isReversed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {order.settlementStatus === 'Settled' && '✓ Settled & Deposited'}
                          {order.settlementStatus === 'In Escrow' && `⏳ Escrow (${order.coolingDaysLeft}d left)`}
                          {order.settlementStatus === 'Reversed' && '✕ Margin Reversed'}
                          {order.settlementStatus === 'Disputed' && '⚖️ Under Dispute'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Product Details & Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Thumbnail & Details (Col 1-6) */}
                      <div className="md:col-span-6 flex items-center gap-3">
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {order.productName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">
                              {order.productSku}
                            </span>
                            <span>Qty: {order.qty}</span>
                            <span>•</span>
                            <span>Customer: <strong>{order.customerName}</strong> ({order.customerCity})</span>
                          </div>
                          {order.rtoReason && (
                            <div className="mt-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block border border-rose-100">
                              ⚠️ Reason: {order.rtoReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Math Summary (Col 7-9) */}
                      <div className="md:col-span-3 bg-gray-50 rounded-xl p-2.5 text-xs space-y-1 border border-gray-100">
                        <div className="flex justify-between text-gray-500">
                          <span>Selling Price:</span>
                          <span className="font-semibold text-gray-900">₹{order.sellingPrice}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Base + Shipping:</span>
                          <span className="text-gray-700">-₹{order.supplierBasePrice + order.shippingFee}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-200">
                          <span>Net Margin:</span>
                          <span className={order.netMargin >= 0 ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                            {order.netMargin >= 0 ? `+₹${order.netMargin}` : `-₹${Math.abs(order.netMargin)}`}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons (Col 10-12) */}
                      <div className="md:col-span-3 flex flex-row md:flex-col gap-2 justify-end">
                        <button
                          onClick={() => setSelectedOrderForTimeline(order)}
                          className="flex-1 md:flex-none px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>🔍</span>
                          <span>Track 5-Stage Journey</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForSettlement(order)}
                          className="flex-1 md:flex-none px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#b90041] border border-pink-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>💰</span>
                          <span>Settlement Math</span>
                        </button>

                        {/* Raise Claim Button if RTO or Reversed */}
                        {isRTO && (
                          <button
                            onClick={() => setSelectedOrderForClaim(order)}
                            className="flex-1 md:flex-none px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>⚠️</span>
                            <span>{order.claimId ? `Dispute #${order.claimId}` : 'Raise Claim / Dispute'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status Footer */}
                    <div className="bg-gray-50/70 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>
                          Settlement Cycle: <strong className="text-gray-800">{order.settlementDate}</strong>
                        </span>
                      </div>

                      {order.utrNumber && order.utrNumber.startsWith('UTR') && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 font-semibold text-gray-700">
                            {order.utrNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.utrNumber, 'UTR Number')}
                            className="text-pink-600 hover:text-pink-700 font-semibold cursor-pointer underline"
                          >
                            Copy UTR
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: 5-STAGE UNIFIED ORDER & LOGISTICS AUDIT TIMELINE */}
      {/* ========================================================================= */}
      {selectedOrderForTimeline && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedOrderForTimeline(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>5-Stage Lifecycle Journey</span>
                  <span className="text-xs font-mono bg-pink-50 text-[#b90041] px-2 py-0.5 rounded-full border border-pink-200">
                    {selectedOrderForTimeline.id}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  AWB: {selectedOrderForTimeline.awb} ({selectedOrderForTimeline.courier})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForTimeline(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product mini card */}
              <div className="bg-gray-50 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-100">
                <img
                  src={selectedOrderForTimeline.productImage}
                  alt={selectedOrderForTimeline.productName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80';
                  }}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {selectedOrderForTimeline.productName}
                  </h4>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Customer: <strong>{selectedOrderForTimeline.customerName}</strong> ({selectedOrderForTimeline.customerCity})
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                    Selling Price: ₹{selectedOrderForTimeline.sellingPrice} | Net Margin: ₹{selectedOrderForTimeline.netMargin}
                  </div>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
                {selectedOrderForTimeline.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                        step.completed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white'
                          : 'bg-gray-200 text-gray-600 ring-4 ring-white'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>

                    {/* Step details */}
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900">{step.step}</span>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank Deposit Verification Card */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Settlement Snapshot</span>
                  <span className="text-emerald-400 font-bold">{selectedOrderForTimeline.settlementStatus}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Beneficiary Account</span>
                    <strong className="text-gray-100">{selectedOrderForTimeline.bankAccount}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Bank UTR Reference</span>
                    <strong className="text-pink-400 font-mono">{selectedOrderForTimeline.utrNumber}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrderForTimeline(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FINANCIAL SETTLEMENT & NET MARGIN MATH BREAKDOWN */}
      {/* ========================================================================= */}
      {selectedOrderForSettlement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedOrderForSettlement(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Settlement & Invoice Breakdown</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Detailed cost-margin ledger for Order #{selectedOrderForSettlement.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForSettlement(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <img
                  src={selectedOrderForSettlement.productImage}
                  alt={selectedOrderForSettlement.productName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80';
                  }}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {selectedOrderForSettlement.productName}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    SKU: {selectedOrderForSettlement.productSku} | Mode: {selectedOrderForSettlement.paymentMode}
                  </div>
                </div>
              </div>

              {/* Detailed Math Breakdown Table */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Customer Final Selling Price</span>
                  <span className="font-bold text-gray-900">+₹{selectedOrderForSettlement.sellingPrice}.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Supplier Base Product Cost</span>
                  <span className="text-rose-600">-₹{selectedOrderForSettlement.supplierBasePrice}.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Logistics & Courier Delivery Fee</span>
                  <span className="text-rose-600">-₹{selectedOrderForSettlement.shippingFee}.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TCS / GST / Platform TDS (1%)</span>
                  <span className="text-rose-600">-₹{selectedOrderForSettlement.tdsDeduction}.00</span>
                </div>

                {selectedOrderForSettlement.orderStatus === 'RTO' && (
                  <div className="flex justify-between text-rose-700 bg-rose-50 p-2 rounded-lg font-semibold">
                    <span>RTO Reverse Freight Adjustment</span>
                    <span>-₹{selectedOrderForSettlement.shippingFee}.00</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-extrabold text-sm text-gray-900">Net Realized Margin</span>
                  <span
                    className={`font-black text-base ${
                      selectedOrderForSettlement.netMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedOrderForSettlement.netMargin >= 0
                      ? `+₹${selectedOrderForSettlement.netMargin}.00`
                      : `-₹${Math.abs(selectedOrderForSettlement.netMargin)}.00`}
                  </span>
                </div>
              </div>

              {/* Banking & UTR Details */}
              <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement Status:</span>
                  <strong className="text-gray-900">{selectedOrderForSettlement.settlementStatus}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payout Date:</span>
                  <strong className="text-gray-900">{selectedOrderForSettlement.settlementDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Account:</span>
                  <strong className="text-gray-900">{selectedOrderForSettlement.bankAccount}</strong>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-gray-500">UTR / Ref Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-800">{selectedOrderForSettlement.utrNumber}</span>
                    <button
                      onClick={() => copyToClipboard(selectedOrderForSettlement.utrNumber, 'UTR Number')}
                      className="text-[#b90041] font-bold cursor-pointer hover:underline text-[11px]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => triggerToast('Settlement invoice receipt downloaded as PDF!')}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>📥</span>
                <span>Download Invoice (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedOrderForSettlement(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RTO / RETURN DISPUTE CLAIM DRAWER */}
      {/* ========================================================================= */}
      {selectedOrderForClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedOrderForClaim(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Raise RTO / Return Dispute Claim</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Claim compensation for incorrect or damaged returns on Order #{selectedOrderForClaim.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForClaim(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDisputeSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Select Claim Reason</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                >
                  <option value="DAMAGED_RETURN">Damaged Item received during reverse courier</option>
                  <option value="WRONG_ITEM">Wrong / Fake item sent back by customer</option>
                  <option value="FRAUDULENT_RTO">Fraudulent RTO (Courier marked delivered attempt without calling)</option>
                  <option value="EXCESS_SHIPPING_DEDUCTION">Incorrect reverse shipping fee deducted</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Issue Description & Evidence Note</label>
                <textarea
                  required
                  rows="3"
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  placeholder="Explain why this RTO or Return deduction should be reimbursed..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                />
              </div>

              {/* Upload Proof simulation */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                <span className="text-2xl block mb-1">📷</span>
                <span className="font-bold text-gray-700 block text-xs">Upload Unboxing / Parcel Photo Proof</span>
                <span className="text-[10px] text-gray-400">JPG, PNG, PDF up to 10MB</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
                ⚠️ <strong>Note:</strong> MShoppy Admin team verifies logistics CCTV and AWB call logs. Approved claims are refunded to your Reseller Wallet within 48 hours.
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForClaim(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#b90041] to-[#80145c] text-white font-bold shadow-md hover:opacity-95 transition cursor-pointer"
                >
                  Submit Dispute Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation */}
      <AppBottomNav activeNav="earnings" onNavigate={handleNavigation} />
    </div>
  );
}
