import React, { useState, useMemo } from 'react';

// Initial realistic tickets dataset for the Admin Support Desk
const INITIAL_TICKETS = [
  {
    id: '#TCK-9412',
    subject: 'Reseller Margin of ₹1,450 delayed for Order #ORD-88210',
    category: 'Payment/Margin',
    priority: 'Urgent',
    status: 'Open',
    sender: {
      name: 'Rahul Verma',
      role: 'Dropshipper',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
      email: 'rahul.verma@auratrends.shop',
      phone: '+91 98765 43210',
      avatar: 'RV',
    },
    orderId: '#ORD-88210',
    linkedAmount: '₹1,450',
    timeAgo: '8m ago',
    channel: 'In-App Ticket',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'The 7-day return window for Order #ORD-88210 was completed yesterday, but the ₹1,450 margin has not reflected in my Reseller Wallet. Please disburse urgently.',
        timestamp: '10:24 AM',
      },
    ],
  },
  {
    id: '#TCK-9410',
    subject: 'Supplier SPF Dispute Claim: Returned Parcel empty box received',
    category: 'Seller Dispute',
    priority: 'Urgent',
    status: 'Open',
    sender: {
      name: 'Surat Master Weaves Pvt Ltd',
      role: 'Verified Supplier',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      email: 'support@suratmasterweaves.com',
      phone: '+91 94280 11928',
      avatar: 'SM',
    },
    orderId: '#ORD-87114',
    linkedAmount: '₹2,890',
    timeAgo: '15m ago',
    channel: 'Portal',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Customer RTO return package received at warehouse today was empty with tampering seal broken. We have uploaded unboxing video footage and request full SPF credit of ₹2,890.',
        timestamp: '10:15 AM',
      },
    ],
  },
  {
    id: '#TCK-9408',
    subject: 'Customer COD Refund not credited after doorstep return pickup',
    category: 'Customer Refund',
    priority: 'Urgent',
    status: 'Open',
    sender: {
      name: 'Priya Mehta',
      role: 'Customer',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      email: 'priya.mehta92@gmail.com',
      phone: '+91 98112 33490',
      avatar: 'PM',
    },
    orderId: '#ORD-86901',
    linkedAmount: '₹849',
    timeAgo: '24m ago',
    channel: 'WhatsApp',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Courier boy picked up the western kurti 3 days ago. My bank account has not received the refund yet. UPI ID: priya@okaxis.',
        timestamp: '10:02 AM',
      },
    ],
  },
  {
    id: '#TCK-9405',
    subject: 'Reverse Pickup QC Rejected: Barcode label illegible',
    category: 'Logistics & ROT',
    priority: 'High',
    status: 'In Review',
    sender: {
      name: 'Rider Express Hub #4',
      role: 'Fleet Logistics',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
      email: 'dispatch.north@riderexpress.in',
      phone: '+91 99001 22819',
      avatar: 'RE',
    },
    orderId: '#ORD-86400',
    linkedAmount: '₹1,299',
    timeAgo: '42m ago',
    channel: 'In-App Ticket',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Driver reached customer address but return label was severely soaked in rain. Unable to scan AWB. Awaiting admin manual approval to accept without AWB.',
        timestamp: '09:48 AM',
      },
    ],
  },
  {
    id: '#TCK-9401',
    subject: 'Dropshipper GSTIN Verification failed due to trade name mismatch',
    category: 'Account/KYC',
    priority: 'Urgent',
    status: 'Open',
    sender: {
      name: 'Aura Lifestyle Pvt Ltd',
      role: 'Dropshipper',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
      email: 'accounts@auralifestyle.in',
      phone: '+91 98200 44102',
      avatar: 'AL',
    },
    orderId: 'KYC-REG-8491',
    linkedAmount: 'N/A',
    timeAgo: '1h ago',
    channel: 'Portal',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Our GSTIN is registered under Aura Lifestyle Trading Co while business registration certificate shows Aura Lifestyle Pvt Ltd. Please approve the manual override.',
        timestamp: '09:20 AM',
      },
    ],
  },
  {
    id: '#TCK-9398',
    subject: 'Customer size exchange request for Saree Blouse (38 -> 40)',
    category: 'Order & Delivery',
    priority: 'Medium',
    status: 'In Review',
    sender: {
      name: 'Ananya Sharma',
      role: 'Customer',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      email: 'ananya.s@outlook.com',
      phone: '+91 97110 55928',
      avatar: 'AS',
    },
    orderId: '#ORD-86110',
    linkedAmount: '₹2,199',
    timeAgo: '1h 30m ago',
    channel: 'Live Chat',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'The embroidered silk saree blouse size 38 is slightly snug around the shoulder. Would love an exchange for Size 40 before festive weekend.',
        timestamp: '08:50 AM',
      },
    ],
  },
  {
    id: '#TCK-9395',
    subject: 'B2B Wholesale Tier discount not applied on cart checkout',
    category: 'Payment/Margin',
    priority: 'High',
    status: 'In Review',
    sender: {
      name: 'Gilded Pulse Resellers',
      role: 'Dropshipper',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
      email: 'orders@gildedpulse.shop',
      phone: '+91 94100 88290',
      avatar: 'GP',
    },
    orderId: '#ORD-85992',
    linkedAmount: '₹14,500',
    timeAgo: '2h ago',
    channel: 'In-App Ticket',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'We placed a batch order of 25 Anarkali sets which qualifies for Tier 2 15% wholesale discount, but cart billed standard supplier price.',
        timestamp: '08:20 AM',
      },
    ],
  },
  {
    id: '#TCK-9390',
    subject: 'Affiliate commission UPI payout returned with error CODE-U30',
    category: 'Payment/Margin',
    priority: 'Urgent',
    status: 'Open',
    sender: {
      name: 'Kavita Roy',
      role: 'Affiliate Partner',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      email: 'kavita.fashion@instagram.com',
      phone: '+91 96500 11840',
      avatar: 'KR',
    },
    orderId: 'PAY-AFF-9912',
    linkedAmount: '₹4,320',
    timeAgo: '2h 15m ago',
    channel: 'WhatsApp',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'My weekly affiliate payout of ₹4,320 failed today. Bank says UPI handle was inactive. I updated new VPA to kavitaroy@ybl. Please retry payment.',
        timestamp: '08:05 AM',
      },
    ],
  },
  {
    id: '#TCK-9382',
    subject: 'Damaged packaging claim resolved & credited',
    category: 'Customer Refund',
    priority: 'Medium',
    status: 'Resolved',
    sender: {
      name: 'Sunil Kumar',
      role: 'Customer',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      email: 'sunil.k@gmail.com',
      phone: '+91 98110 99482',
      avatar: 'SK',
    },
    orderId: '#ORD-85100',
    linkedAmount: '₹599',
    timeAgo: '4h ago',
    channel: 'Portal',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: 'Thank you admin, received the refund of ₹599 in my wallet.',
        timestamp: '06:12 AM',
      },
    ],
  },
];

const CANNED_REPLIES = [
  '✅ We have verified your request and initiated an instant refund/credit to your account.',
  '📦 We have escalated this shipment with our logistics team for priority doorstep inspection.',
  '🛡️ Your Supplier Protection Fund (SPF) claim is approved and credited to your ledger.',
  '📑 KYC details have been manually audited and your verified account status is now active.',
];

export function AdminSupportDesk({ onNavigate, onBack }) {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.sender.name.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Urgent' && t.priority === 'Urgent' && t.status !== 'Resolved') ||
        t.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      urgent: tickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved').length,
      open: tickets.filter((t) => t.status === 'Open').length,
      inReview: tickets.filter((t) => t.status === 'In Review').length,
      resolved: tickets.filter((t) => t.status === 'Resolved').length,
    };
  }, [tickets]);

  // Resolve Ticket
  const handleResolveTicket = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, status: 'Resolved' }));
    }
    showToast(`🎉 Ticket ${ticketId} marked as Resolved!`);
  };

  // Send Reply
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg = {
      id: Date.now(),
      sender: 'admin',
      text: replyText.trim(),
      timestamp: 'Just now',
    };

    const updatedTicket = {
      ...selectedTicket,
      status: selectedTicket.status === 'Open' ? 'In Review' : selectedTicket.status,
      messages: [...selectedTicket.messages, newMsg],
    };

    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t))
    );
    setSelectedTicket(updatedTicket);
    setReplyText('');
    showToast(`💬 Reply sent to ${selectedTicket.sender.name}!`);
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================== Top Header ===================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: Back Arrow, Brand & Live Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('/admin-panel') : window.history.back())}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700 cursor-pointer transition-colors flex items-center justify-center"
              aria-label="Back to Admin Panel"
              title="Back to Admin Panel"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-[#FF3F6C] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  Curator Luxe Admin
                </span>
                <span className="bg-rose-100 text-[#b90041] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Support Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Real-time ticket triage for Resellers, Suppliers, Customers &amp; Fleet
              </p>
            </div>
          </div>

          {/* Right: Live Agent Status & Action Buttons */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>12 Admin Agents Online</span>
            </div>

            <button
              type="button"
              onClick={() => showToast('📥 Exporting comprehensive support ticket log (CSV/Excel)...')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Log</span>
            </button>

            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('/admin-panel') : window.history.back())}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              title="Return to Admin Overview Dashboard"
            >
              <span className="material-symbols-outlined text-sm text-rose-400">dashboard</span>
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===================== Main Body Canvas ===================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Urgent Tickets (Panel 4) */}
          <div
            onClick={() => setStatusFilter('Urgent')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Urgent'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-md'
                : 'bg-white border-slate-100 hover:border-rose-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Urgent Attention</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
                {counts.urgent}
              </h3>
              <span className="text-[11px] font-bold text-rose-500 pb-0.5">Needs action &lt;30m</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full w-[85%]"></div>
            </div>
          </div>

          {/* Total Open */}
          <div
            onClick={() => setStatusFilter('Open')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Open'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-md'
                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Open Tickets</span>
              <span className="material-symbols-outlined text-blue-500 text-lg">inbox</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                {counts.open}
              </h3>
              <span className="text-[11px] font-bold text-slate-500 pb-0.5">Active queue</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-[60%]"></div>
            </div>
          </div>

          {/* In Review */}
          <div
            onClick={() => setStatusFilter('In Review')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'In Review'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-md'
                : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">In Review</span>
              <span className="material-symbols-outlined text-amber-500 text-lg">pending</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif]">
                {counts.inReview}
              </h3>
              <span className="text-[11px] font-bold text-amber-600 pb-0.5">With Specialists</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full w-[45%]"></div>
            </div>
          </div>

          {/* Resolved */}
          <div
            onClick={() => setStatusFilter('Resolved')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Resolved'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Resolved Today</span>
              <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">
                {counts.resolved}
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 pb-0.5">96.8% CSAT</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[95%]"></div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, user name, order #, or subject..."
              className="w-full bg-[#f2f4f6] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 outline-none transition-all"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'Urgent', 'Open', 'In Review', 'Resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#f2f4f6] text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 border-none outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Payment/Margin">Payment &amp; Margins</option>
              <option value="Seller Dispute">Seller Disputes (SPF)</option>
              <option value="Customer Refund">Customer Refunds</option>
              <option value="Logistics & ROT">Logistics &amp; ROT</option>
              <option value="Account/KYC">Account &amp; KYC</option>
            </select>
          </div>
        </section>

        {/* ===================== Split Desk View ===================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tickets Queue List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-black text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] uppercase tracking-wider">
                Support Queue ({filteredTickets.length})
              </h4>
              <span className="text-xs text-slate-400 font-medium">Sorted by priority &amp; recency</span>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
                <p className="text-sm font-bold">No tickets match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('All');
                    setCategoryFilter('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-rose-400 bg-rose-50/40 shadow-xs'
                          : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-black text-slate-900">{t.id}</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${t.sender.badgeClass}`}
                          >
                            {t.sender.role}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              t.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-700 animate-pulse'
                                : t.priority === 'High'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">{t.timeAgo}</span>
                      </div>

                      <h5 className="text-xs sm:text-sm font-bold text-[#191c1e] line-clamp-1 mb-1">
                        {t.subject}
                      </h5>

                      <p className="text-xs text-slate-500 line-clamp-1 mb-2.5">
                        {t.messages[t.messages.length - 1]?.text}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/80">
                        <span className="font-semibold text-slate-600 truncate max-w-[160px]">
                          👤 {t.sender.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500 font-semibold">{t.orderId}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              t.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : t.status === 'In Review'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Ticket Conversation & Quick Action Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5 sticky top-24">
            {selectedTicket ? (
              <>
                {/* Ticket Header & Status Toggle */}
                <div className="pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-black text-rose-600">{selectedTicket.id}</span>
                      <h3 className="text-base font-extrabold text-[#191c1e] font-['Plus_Jakarta_Sans',sans-serif] leading-snug">
                        {selectedTicket.subject}
                      </h3>
                    </div>
                    {selectedTicket.status !== 'Resolved' ? (
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(selectedTicket.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>

                  {/* Customer / Seller Metadata strip */}
                  <div className="bg-[#f8f9fb] p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">User:</span>
                      <span className="font-bold text-slate-800">{selectedTicket.sender.name} ({selectedTicket.sender.role})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Contact:</span>
                      <span className="font-mono text-slate-600">{selectedTicket.sender.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Linked Reference:</span>
                      <span className="font-mono font-bold text-rose-600">{selectedTicket.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Amount Involved:</span>
                      <span className="font-bold text-slate-900">{selectedTicket.linkedAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Conversation Messages */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {selectedTicket.messages.map((m) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          isAdmin
                            ? 'bg-rose-50 border border-rose-100 text-slate-800 ml-4'
                            : 'bg-slate-100 border border-slate-200 text-slate-800 mr-4'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span>{isAdmin ? '🛡️ Admin Support Agent' : `👤 ${selectedTicket.sender.name}`}</span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p className="leading-relaxed font-medium">{m.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* One-Click Canned Responses */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quick Canned Responses:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CANNED_REPLIES.map((reply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(reply)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium text-left truncate max-w-full cursor-pointer transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-100">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official admin resolution or update to user..."
                    className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-xs font-medium focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 outline-none resize-none transition-all"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('Escalated ticket to Finance Operations desk.')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">priority_high</span>
                      <span>Escalate</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-[#FF3F6C] hover:bg-[#e0355e] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Send Response</span>
                      <span className="material-symbols-outlined text-xs">send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">chat</span>
                <p className="text-xs font-semibold">Select a ticket from the queue to view full conversation and take action.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminSupportDesk;
