import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const CATEGORIES = [
  { id: 'orders', name: 'Orders', desc: 'Tracking & Updates', icon: 'inventory_2' },
  { id: 'payments', name: 'Payments', desc: 'Refunds & Methods', icon: 'payments' },
  { id: 'reselling', name: 'Reselling', desc: 'Earnings & Bonus', icon: 'trending_up' },
  { id: 'returns', name: 'Returns', desc: 'Policies & Labels', icon: 'assignment_return' },
];

const FAQS = [
  {
    id: 'faq-1',
    category: 'orders',
    question: 'How do I track my delivery?',
    answer:
      'You can track your order in real-time from the Orders section. Click on the active order to see courier live location, dispatch hub details, and expected delivery date.',
  },
  {
    id: 'faq-2',
    category: 'reselling',
    question: 'When will I receive my reseller margin?',
    answer:
      'Reseller margin is credited to your bank account within 2-3 business days after the customer delivery is completed and the 7-day return window has passed.',
  },
  {
    id: 'faq-3',
    category: 'returns',
    question: 'What is the return policy for electronics?',
    answer:
      'Electronics items have a 7-day replacement guarantee in case of manufacturing defects or dead-on-arrival issues. Keep the original brand box and accessories intact.',
  },
  {
    id: 'faq-4',
    category: 'payments',
    question: 'How do refunds work for COD (Cash on Delivery) orders?',
    answer:
      'For COD returns, once the supplier verifies the returned parcel, you will receive an instant UPI transfer or bank transfer within 24 hours to your linked account.',
  },
];

export function SupportCenter({ onNavigate, onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isOrderHelpOpen, setIsOrderHelpOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isLiveSupportChatOpen, setIsLiveSupportChatOpen] = useState(false);

  // Ticket Form State
  const [ticketIssue, setTicketIssue] = useState('Payment/Margin Delayed');
  const [ticketOrder, setTicketOrder] = useState('#ME-88291029');
  const [ticketDesc, setTicketDesc] = useState('');

  // Live Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'agent', text: 'Hello! I am MShoppy Support Bot. How can I help with your reseller account or order today?' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const ticketId = `#TICK-${Math.floor(10000 + Math.random() * 90000)}`;
    setIsTicketModalOpen(false);
    setTicketDesc('');
    showToast(`Ticket ${ticketId} created! Support team will email within 4 hours.`);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: `m-${Date.now()}`, sender: 'user', text: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const agentReply = {
        id: `r-${Date.now()}`,
        sender: 'agent',
        text: 'Thank you for explaining. I have verified your account and notified the operations desk. You will receive an SMS update in 15 minutes.',
      };
      setChatMessages((prev) => [...prev, agentReply]);
    }, 1200);
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory) return faq.category === selectedCategory;
    return true;
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce text-xs font-semibold">
          <span className="material-symbols-outlined text-xl">contact_support</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="top-0 sticky z-40 bg-[#F8F9FB] border-b border-slate-200/80 shadow-2xs font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="hover:bg-slate-200/60 transition-colors p-2 rounded-full active:scale-95 duration-200 cursor-pointer text-[#FF3F6C]"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-slate-900 leading-none">
                Support Center
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">24x7 Reseller & Order Helpdesk</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveSupportChatOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full font-bold text-xs cursor-pointer transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Support
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-6 pb-32 w-full">
        {/* Hero Search Section */}
        <section className="mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="w-full bg-white border border-slate-200/80 rounded-2xl py-4.5 pl-14 pr-6 text-sm md:text-base focus:ring-2 focus:ring-[#b90041] transition-all placeholder:text-slate-400 shadow-xs outline-none"
              placeholder="Search for FAQs, orders, margin payout, or return policies..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Help with Recent Orders */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-4 px-1 font-['Plus_Jakarta_Sans']">
            <div>
              <h2 className="font-bold text-xl text-slate-900">Help with Recent Orders</h2>
              <p className="text-xs text-slate-500">Fast-track assistance for your latest delivery</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Redirecting to full orders list')}
              className="text-[#b90041] font-bold text-xs hover:underline cursor-pointer"
            >
              View All Orders
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xs border border-slate-100 hover:shadow-md transition-all">
            <div className="w-22 h-22 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200">
              <img
                alt="Minimalist Ceramic Watch"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNwJNreXrxO2McKFSQplCmbdn4grgCMWr1TneXlp18OAHUwMguAUJKl_366lS42uli0pQOedVG5u0ELftJDfIexTYo1mjZh7tkRJSdLt9hgvKY880sA9_2SNY-8RFjUXJFn1fyJ8VKQ3YmuBqmuvq7xx9sZtSdcwsyMrjA28X4lsC3Ld66dqaI3wSenhfVG88zlHWjyLnP_nb_WEK-9jOzrhXq4wS4O27KwszZscow0STK8MdWDpDR5KNSZZ9lVwvyLvkHqGXAJTQ"
              />
            </div>

            <div className="flex-grow text-center md:text-left min-w-0">
              <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Delivered • 12 Oct 2023
              </p>
              <h3 className="font-headline font-bold text-lg text-slate-900 mb-0.5">
                Minimalist Ceramic Watch
              </h3>
              <p className="text-slate-500 text-xs mb-3 font-medium">Order ID: #ME-88291029</p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Electronics
                </span>
                <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Quality Checked
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOrderHelpOpen(true)}
              className="w-full md:w-auto bg-gradient-to-br from-[#FF3F6C] to-[#DF2457] hover:brightness-105 text-white px-8 py-3.5 rounded-2xl font-bold active:scale-95 transition-all shadow-md shadow-pink-500/20 cursor-pointer text-sm"
            >
              Get Help
            </button>
          </div>
        </section>

        {/* Categorized Support Topics (Bento Grid) */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="font-headline font-bold text-xl text-slate-900 font-['Plus_Jakarta_Sans']">
              Browse by Category
            </h2>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-[#b90041] font-bold hover:underline cursor-pointer"
              >
                Clear Filter ✕
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                  }
                  className={`p-6 rounded-3xl flex flex-col items-center text-center cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-pink-50/70 border-[#b90041] shadow-xs scale-102'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs'
                  }`}
                >
                  <div className="w-13 h-13 bg-rose-50 text-[#b90041] rounded-2xl flex items-center justify-center mb-3 shadow-2xs">
                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                  </div>
                  <p className="font-headline font-bold text-slate-900 text-sm">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main CTA Section (Live Chat & Open Ticket) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Chat Support */}
          <div className="bg-[#191C1E] p-8 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#b90041]/25 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-emerald-400">
                <span className="material-symbols-outlined text-xl">chat</span>
              </div>
              <h3 className="font-headline font-black text-2xl mb-2">Still need help?</h3>
              <p className="text-white/60 mb-6 text-xs leading-relaxed max-w-sm">
                Our reseller care specialists and automated bot are available 24/7 for instant query resolution.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLiveSupportChatOpen(true)}
              className="w-full sm:w-max bg-white hover:bg-slate-100 text-[#191C1E] px-7 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base">support_agent</span>
              Chat with Support
            </button>
          </div>

          {/* Card 2: Raise a Ticket */}
          <div className="bg-gradient-to-br from-[#b90041] to-[#df2457] p-8 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">confirmation_number</span>
              </div>
              <h3 className="font-headline font-black text-2xl mb-2">Raise a Ticket</h3>
              <p className="text-white/80 mb-6 text-xs leading-relaxed max-w-sm">
                Report a complex delivery discrepancy, missing payout, or supplier conflict. We guarantee response in 4 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="w-full sm:w-max bg-white/20 backdrop-blur-md hover:bg-white hover:text-[#b90041] text-white border border-white/40 px-7 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">post_add</span>
              Open a Ticket
            </button>
          </div>
        </section>

        {/* Popular FAQs Accordion */}
        <section className="mb-10">
          <h2 className="font-headline font-bold text-xl text-slate-900 mb-4 px-1 font-['Plus_Jakarta_Sans']">
            Popular FAQs {selectedCategory && `(${selectedCategory.toUpperCase()})`}
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs transition-all"
                >
                  <div
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-sm text-slate-800">{faq.question}</span>
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform ${
                        isOpen ? 'rotate-90 text-[#b90041]' : ''
                      }`}
                    >
                      chevron_right
                    </span>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />

      {/* Order Help Modal Dialog */}
      {isOrderHelpOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Assistance for #ME-88291029</h3>
              <button
                type="button"
                onClick={() => setIsOrderHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">What issue are you experiencing with this order?</p>

            <div className="space-y-2">
              {[
                'Item is defective / damaged',
                'Wrong size received',
                'Reseller margin not credited',
                'Request invoice copy',
              ].map((issue, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsOrderHelpOpen(false);
                    showToast(`Report filed for "${issue}". We will resolve within 24h.`);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-pink-50 hover:border-pink-200 text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{issue}</span>
                  <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Raise a Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b90041]">confirmation_number</span>
                <h3 className="font-bold text-base text-slate-900">Submit Support Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Issue Category</label>
                <select
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                >
                  <option>Payment/Margin Delayed</option>
                  <option>Return Dispute with Supplier</option>
                  <option>Courier Tracking Glitch</option>
                  <option>Account Verification / GST</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Order / Tracking ID</label>
                <input
                  type="text"
                  value={ticketOrder}
                  onChange={(e) => setTicketOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Detailed Description</label>
                <textarea
                  rows="3"
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Describe what happened..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b90041] hover:bg-[#df2457] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Support Chat Drawer Modal */}
      {isLiveSupportChatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[80vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">support_agent</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">MShoppy Reseller Happiness</h3>
                  <span className="text-[10px] text-pink-100 font-semibold">Active Specialist Online</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveSupportChatOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fb]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#FF3F6C] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendChatMessage}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your support question..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#FF3F6C] text-white rounded-xl cursor-pointer hover:bg-[#df2457] active:scale-95 shadow-xs"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportCenter;
