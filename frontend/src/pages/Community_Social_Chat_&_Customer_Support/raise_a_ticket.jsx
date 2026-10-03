import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const INITIAL_PROOFS = [
  {
    id: 'proof-1',
    name: 'payment_error.png',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdMvx2gLqJxS_W4A4BC1WWdLa0acmtXKywSzjchEJVYtKjfBC3cyxE3Mo2NwW-qRUL1w2o3PKGalp71o82pGzcNzcUZTtBNzcu5liASHfOGgZlmfH884lrnFmqDZD7YKUuWvI81uim7mJxFn3reHE0BFETRGHIczrsel35zSm0XDQ9fUYI8Qf9p2jU8eguJkhyvwcAHVEmRR2jcI4bdxNsVuwPLWyNC2n6t_PYN7hvQoALFghJm2SYdWwF1GfmIpH0yG6Jlj1CE68',
  },
  {
    id: 'proof-2',
    name: 'digital_receipt.png',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhB9TSDaNVuUVE_tf6avhFubnnLx4NKuFGU0SI0AYC1mKGDMTUovPPCLKipCAVNM4d1w90F3efZD2-0IaOekGK6POmR9XYh-NBQAR1_KiCcG-ijYRMH_nz3RYG0NRgfG8s8irhwR9KSSdT_H6NrIgWJR2l01L2BJKijn9YWy1I7bPGuM4sJGtEmg47RyN-z_O6BJzFYwZDuCagLOT33GIKHmXtTuNcdMOwkgWqkgQvu8PM9lAUZssSzj2TmR_MPQu3SC33RZFUgDI',
  },
];

const INITIAL_PAST_TICKETS = [
  {
    id: '#TICK-9942',
    subject: 'Delayed margin credit for Order #MS-7718',
    category: 'Reseller Earnings',
    status: 'In Review',
    statusStyle: 'bg-amber-100 text-amber-800',
    date: '10 Sep 2026',
  },
  {
    id: '#TICK-8812',
    subject: 'Return parcel damaged in transit',
    category: 'Order & Delivery',
    status: 'Resolved',
    statusStyle: 'bg-emerald-100 text-emerald-800',
    date: '02 Sep 2026',
  },
];

export function RaiseATicket({ onNavigate, onBack }) {
  const [category, setCategory] = useState('order');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState('');
  const [proofs, setProofs] = useState(INITIAL_PROOFS);
  const [tickets, setTickets] = useState(INITIAL_PAST_TICKETS);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);

  // AI bot chat
  const [aiChatMessages, setAiChatMessages] = useState([
    { id: '1', sender: 'bot', text: 'Hi! Describe your issue or provide an order number, and I can look up immediate solutions.' },
  ]);
  const [aiChatInput, setAiChatInput] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveProof = (id) => {
    setProofs((prev) => prev.filter((p) => p.id !== id));
    showToast('Removed attachment.');
  };

  const handleAddSampleProof = () => {
    const newProof = {
      id: `proof-${Date.now()}`,
      name: `screenshot_${proofs.length + 1}.png`,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNwJNreXrxO2McKFSQplCmbdn4grgCMWr1TneXlp18OAHUwMguAUJKl_366lS42uli0pQOedVG5u0ELftJDfIexTYo1mjZh7tkRJSdLt9hgvKY880sA9_2SNY-8RFjUXJFn1fyJ8VKQ3YmuBqmuvq7xx9sZtSdcwsyMrjA28X4lsC3Ld66dqaI3wSenhfVG88zlHWjyLnP_nb_WEK-9jOzrhXq4wS4O27KwszZscow0STK8MdWDpDR5KNSZZ9lVwvyLvkHqGXAJTQ',
    };
    setProofs([...proofs, newProof]);
    showToast('Screenshot attached successfully!');
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Please fill in both subject and description.');
      return;
    }

    const ticketNumber = `#TICK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket = {
      id: ticketNumber,
      subject: subject.trim(),
      category:
        category === 'order'
          ? 'Order & Delivery'
          : category === 'payment'
          ? 'Payment & Refunds'
          : category === 'reseller'
          ? 'Reseller Earnings'
          : category === 'account'
          ? 'Account & Security'
          : 'Other Concerns',
      status: 'In Review',
      statusStyle: 'bg-amber-100 text-amber-800',
      date: 'Today',
      description: description.trim(),
      orderId: orderId.trim(),
    };

    setTickets([newTicket, ...tickets]);
    setSubmittedTicket(newTicket);
    setSubject('');
    setDescription('');
    setOrderId('');
    showToast(`Ticket ${ticketNumber} raised successfully!`);
  };

  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: aiChatInput.trim() };
    setAiChatMessages((prev) => [...prev, userMsg]);
    const query = aiChatInput.trim().toLowerCase();
    setAiChatInput('');

    setTimeout(() => {
      let botResponse = 'I have matched your query with our resolution database. For orders in transit, tracking coordinates refresh every 6 hours.';
      if (query.includes('refund') || query.includes('margin') || query.includes('payment')) {
        botResponse = 'Reseller payouts are processed via NEFT/UPI within 48 hours of return window expiration.';
      } else if (query.includes('return') || query.includes('damage')) {
        botResponse = 'Pickup for damaged items will be dispatched via Delhivery/BlueDart. Please ensure original box packaging is retained.';
      }

      setAiChatMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: 'bot', text: botResponse },
      ]);
    }, 1000);
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen pb-32 font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce text-xs font-semibold">
          <span className="material-symbols-outlined text-xl">confirmation_number</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="bg-[#F8F9FB] sticky top-0 z-40 border-b border-slate-200/80 shadow-2xs font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate && onNavigate('support'))}
              className="hover:bg-slate-200/60 transition-colors p-2 rounded-full active:scale-95 duration-200 cursor-pointer text-[#FF3F6C]"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-slate-900 leading-none">
                Support Desk
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Submit & Track Support Tickets</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-pink-50 text-[#b90041] hover:bg-pink-100 rounded-full font-bold text-xs cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>My Tickets ({tickets.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ===================== Contextual Help Sidebar (Bento Style) ===================== */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100">
              <div className="bg-indigo-50 text-[#4d41df] w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-2xs">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-slate-900 mb-2 font-['Plus_Jakarta_Sans']">
                Quick Assistance
              </h2>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Our support team typically responds within 2-4 hours. For fastest resolution, please provide exact Order IDs or clear photo proof.
              </p>

              <div className="space-y-3">
                <div
                  onClick={() => setIsKnowledgeBaseOpen(true)}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-indigo-50/60 rounded-2xl transition-colors cursor-pointer border border-slate-100 group"
                >
                  <span className="material-symbols-outlined text-[#4d41df]">menu_book</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block">Knowledge Base</span>
                    <span className="text-[10px] text-slate-400">Policies & guidelines</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>

                <div
                  onClick={() => setIsAiBotOpen(true)}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-emerald-50/60 rounded-2xl transition-colors cursor-pointer border border-slate-100 group"
                >
                  <span className="material-symbols-outlined text-[#008644]">chat</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block">Instant AI Resolution</span>
                    <span className="text-[10px] text-slate-400">Instant answers 24x7</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>

            {/* Track Existing Tickets Mini-Card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50/60 rounded-3xl p-6 border border-pink-100 shadow-2xs">
              <h3 className="font-headline font-bold text-[#b90041] mb-1 font-['Plus_Jakarta_Sans']">
                Track Existing Tickets
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                You have {tickets.length} submitted requests in our support system.
              </p>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-bold text-[#b90041] flex items-center gap-1.5 group cursor-pointer hover:underline"
              >
                <span>View Full History</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </aside>

          {/* ===================== Main Ticket Form ===================== */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-100">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 tracking-tight mb-2 font-['Plus_Jakarta_Sans']">
                  Raise a Support Ticket
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Describe your issue in detail and our dedicated resolution desk will review it.
                </p>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-6">
                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
                    Issue Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs sm:text-sm text-slate-800 font-medium outline-none focus:ring-2 focus:ring-[#b90041] cursor-pointer"
                    >
                      <option value="order">Order &amp; Delivery</option>
                      <option value="payment">Payment &amp; Refunds</option>
                      <option value="account">Account &amp; Security</option>
                      <option value="reseller">Reseller Earnings</option>
                      <option value="other">Other Concerns</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Optional Order ID */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
                    Order ID / Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. #ME-88291029 or AWB-9912048"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>

                {/* Ticket Subject */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Delayed delivery for Order #12345 or Incorrect margin credit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                    required
                  />
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please explain what happened, delivery date, customer communication, or error details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041] resize-none"
                    required
                  />
                </div>

                {/* File Upload Area */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
                    Upload Proof (Screenshots/Receipts)
                  </label>

                  <div
                    onClick={handleAddSampleProof}
                    className="border-2 border-dashed border-slate-300 hover:border-[#b90041] rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-pink-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-2xs group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-slate-500 group-hover:text-[#b90041] text-2xl">
                        add_a_photo
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      Click to attach photo or receipt proof
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG or JPEG (Max 5MB per file)
                    </p>
                  </div>

                  {/* Upload Preview Stubs */}
                  {proofs.length > 0 && (
                    <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                      {proofs.map((proof) => (
                        <div
                          key={proof.id}
                          className="relative min-w-[90px] h-24 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group flex-shrink-0"
                        >
                          <img
                            src={proof.url}
                            alt={proof.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProof(proof.id)}
                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full p-1 cursor-pointer transition-colors shadow-xs"
                            title="Remove attachment"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-br from-[#B90041] to-[#DF2457] hover:brightness-105 text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">send</span>
                    <span>Submit Support Ticket</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
                    By submitting, you agree to our 24/7 Support Terms and Customer Privacy Policy.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />

      {/* Ticket Success Confirmation Modal */}
      {submittedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Ticket Raised Successfully!
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket ID:</span>
                <span className="font-bold text-[#b90041]">{submittedTicket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{submittedTicket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated SLA:</span>
                <span className="font-bold text-emerald-600">Within 2 to 4 Hours</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              A copy of your ticket confirmation has also been dispatched to your registered email address.
            </p>

            <button
              type="button"
              onClick={() => setSubmittedTicket(null)}
              className="w-full py-3 bg-[#b90041] text-white font-bold text-xs rounded-xl hover:bg-[#df2457] shadow-xs cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* Ticket History Modal Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b90041]">history</span>
                <h3 className="font-bold text-base text-slate-900">Your Support Tickets</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#b90041]">{t.id}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.statusStyle}`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 leading-snug">{t.subject}</h4>
                  <p className="text-[10px] text-slate-400">
                    Category: {t.category} • Date: {t.date}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Bot Assistance Modal */}
      {isAiBotOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full h-[75vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined">smart_toy</span>
                <div>
                  <h3 className="font-bold text-sm leading-none">MShoppy AI Helpdesk</h3>
                  <span className="text-[10px] text-emerald-200">Instant Automated Resolution</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiBotOpen(false)}
                className="p-1 hover:bg-emerald-600 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {aiChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendAiMessage}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask about delivery, refunds or margin..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-700 text-white rounded-xl cursor-pointer hover:bg-emerald-800 active:scale-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Knowledge Base Modal */}
      {isKnowledgeBaseOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4d41df]">menu_book</span>
                <h3 className="font-bold text-base text-slate-900">Support Knowledge Base</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKnowledgeBaseOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 max-h-72 overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-1">📦 Return Parcel Guidelines</h4>
                <p>Ensure item tags are intact and parcel has the printed return shipping label.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-1">💰 Reseller Commission Calculations</h4>
                <p>Margin is computed as: Customer Price - Supplier Price. Zero deductions on return if courier fault.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-1">🔒 Account GST & Bank Verification</h4>
                <p>Verify bank passbook or cancelled cheque in Profile settings to enable instant UPI payouts.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsKnowledgeBaseOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaiseATicket;
