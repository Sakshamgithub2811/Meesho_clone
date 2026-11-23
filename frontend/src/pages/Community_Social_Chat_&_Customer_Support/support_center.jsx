import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import { getOrders, getAuthHeaders } from '../../services/ecommerceService';
import { API_V1_BASE } from '../../config/apiConfig';

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
      'Track your order in real-time from the "My Orders" section to view live delivery status, courier partner details, and expected arrival date.',
  },
  {
    id: 'faq-2',
    category: 'reselling',
    question: 'When will I receive my reseller margin?',
    answer:
      'Reseller margins are automatically credited to your linked bank account or UPI within 24-48 hours after successful delivery and return window completion.',
  },
  {
    id: 'faq-3',
    category: 'returns',
    question: 'What is MShoppy’s return & exchange policy?',
    answer:
      'You can request a return or exchange within 7 days of delivery directly from "My Orders" with doorstep pickup and verified instant refunds.',
  },
  {
    id: 'faq-4',
    category: 'payments',
    question: 'How do refunds work for COD (Cash on Delivery) orders?',
    answer:
      'For COD orders, refunds are credited directly to your bank account or UPI ID instantly upon doorstep parcel inspection and handover.',
  },
  {
    id: 'faq-5',
    category: 'licensing',
    question: 'Are product images authentic and commercially licensed?',
    answer:
      'All catalog media on MShoppy is self-hosted, quality-verified, and commercially licensed. Resellers and customers have full rights to share authentic product visuals across social channels safely.',
  },
];


const BOT_CONTENT = {
  title: 'MShoppy Support Assistant',
  online: '24/7 Smart Automated Help Desk',
  greeting: 'Hello! I am your MShoppy Support Assistant. How can I help you today?',
  chips: [
    { id: 'track_order', label: '📦 Where is my Order?' },
    { id: 'return_exchange', label: '🔄 Return or Exchange' },
    { id: 'refund_status', label: '💰 Refund & Payments' },
    { id: 'raise_ticket', label: '🎫 Raise Support Ticket' },
  ],
  placeholder: 'Type your support question...',
  sendBtn: 'Send',
  ticketBtn: '🎫 Open Support Ticket Form',
  viewTrackingBtn: '📦 View Full Tracking',
  myOrdersBtn: '🛍️ Go to My Orders',
  responses: {
    hi: 'Hello! How are you doing? Please tell me how I can assist with your orders, returns, or payments today.',
    order_found: (order) => {
      const title = order.productName || order.items?.[0]?.product?.title || order.items?.[0]?.title || 'Catalog Order';
      const price = order.totalAmount || order.price || 0;
      const status = (order.orderStatus || order.status || 'ORDERED').toUpperCase();
      const shortId = order.id ? order.id.slice(0, 8) : '';
      return `Here are the details for Order #${shortId}:\n• Item: ${title}\n• Total: ₹${price.toLocaleString('en-IN')}\n• Status: ${status}`;
    },
    order_not_found: 'You do not have any active orders currently. Visit our shop to place your first order!',
    return_info: 'You can request a Return or Exchange within 7 days of delivery directly from the "My Orders" section. Once collected by our courier partner, your refund is processed promptly.',
    refund_info: '• Prepaid Orders: Refunds are credited to original payment source within 24-48 hours.\n• COD Orders: Instant refund is initiated to your UPI ID or Bank Account upon doorstep handover verification.',
    ticket_prompt: 'Would you like to connect directly with our operations team? Click below to submit an official support ticket.',
    unknown: "I didn't quite catch that. Please pick one of the quick options below or submit a support ticket so our team can assist you."
  }
};

export function SupportCenter({ onNavigate, onOpenChat }) {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(orderIdParam ? 'orders' : null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isOrderHelpOpen, setIsOrderHelpOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isLiveSupportChatOpen, setIsLiveSupportChatOpen] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Ticket Form State
  const [ticketIssue, setTicketIssue] = useState('Payment/Margin Delayed');
  const [ticketOrder, setTicketOrder] = useState(orderIdParam ? `#${orderIdParam}` : '');
  const [ticketDesc, setTicketDesc] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getOrders().then(orders => {
      if (Array.isArray(orders) && orders.length > 0) {
        setUserOrders(orders);
        let found = null;
        if (orderIdParam) {
          const cleanParam = orderIdParam.replace(/^#/, '').trim().toLowerCase();
          found = orders.find(o => 
            (o.id && o.id.toLowerCase() === cleanParam) || 
            (o.id && o.id.toLowerCase().startsWith(cleanParam))
          );
        }
        const active = found || orders[0];
        setSelectedOrder(active);
        setTicketOrder(`#${active.id.slice(0, 8)}`);

        if (found) {
          const prodTitle = found.productName || found.items?.[0]?.product?.title || 'this item';
          setChatMessages([
            {
              id: 'init-order',
              sender: 'agent',
              text: `Hello! I see you need assistance with your order #${found.id.slice(0, 8)} (${prodTitle}). How can I assist you with this order today?`,
              orderCard: found,
              showChips: true
            }
          ]);
        }
      }
    }).catch(() => {});
  }, [orderIdParam]);


  // Smart Live Chat state (English only)
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'agent',
      text: BOT_CONTENT.greeting,
      showChips: true
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const getCleanOrderTitle = (order) => {
    if (!order) return 'Catalog Item';
    return order.productName || order.items?.[0]?.product?.title || order.items?.[0]?.title || 'Order Item';
  };

  const findOrderInQuery = (queryText) => {
    if (!userOrders || userOrders.length === 0) return null;
    const q = (queryText || '').toLowerCase().trim();
    if (!q) return null;

    // 1. Direct ID match
    const byId = userOrders.find(o => o.id && q.includes(o.id.toLowerCase().slice(0, 8)));
    if (byId) return byId;

    // 2. Specific product title match
    for (const ord of userOrders) {
      const title = getCleanOrderTitle(ord).toLowerCase();
      if (!title) continue;
      if (q.includes(title)) return ord;
      const tokens = title.split(/[\s,/-]+/).filter(w => w.length >= 4);
      for (const tok of tokens) {
        if (q.includes(tok)) return ord;
      }
    }
    return null;
  };

  const processBotReply = (inputText, intentKey = null) => {
    const t = (inputText || '').toLowerCase().trim();

    // 1. Explicit order selection from picker
    if (intentKey && intentKey.startsWith('select_order_')) {
      const ordId = intentKey.replace('select_order_', '');
      const picked = userOrders.find(o => o.id === ordId);
      if (picked) {
        setSelectedOrder(picked);
        setTicketOrder(`#${picked.id.slice(0, 8)}`);
        return {
          text: BOT_CONTENT.responses.order_found(picked),
          orderCard: picked,
          actionType: 'orders'
        };
      }
    }

    // 2. Order Tracking / Status Queries
    const isOrderQuery = intentKey === 'track_order' ||
      t.includes('order') || t.includes('track') || t.includes('status') ||
      t.includes('delivery') || t.includes('where is') || t.includes('kaha') || t.includes('item');

    if (isOrderQuery) {
      if (!userOrders || userOrders.length === 0) {
        return {
          text: BOT_CONTENT.responses.order_not_found,
          actionType: 'home'
        };
      }

      // Check if user specifically asked about one of their products or order IDs
      const matched = findOrderInQuery(t);
      if (matched) {
        setSelectedOrder(matched);
        setTicketOrder(`#${matched.id.slice(0, 8)}`);
        return {
          text: BOT_CONTENT.responses.order_found(matched),
          orderCard: matched,
          actionType: 'orders'
        };
      }

      // If user navigated with a specific orderIdParam or has an active selectedOrder
      if (orderIdParam && selectedOrder) {
        return {
          text: BOT_CONTENT.responses.order_found(selectedOrder),
          orderCard: selectedOrder,
          actionType: 'orders'
        };
      }

      // If multiple orders, prompt the user with interactive order picker
      if (userOrders.length > 1) {
        return {
          text: `You have ${userOrders.length} recent orders in your account. Please select the order you would like to track:`,
          orderPickerList: userOrders.slice(0, 5),
          actionType: 'select_order'
        };
      }

      // Single order account
      const solo = userOrders[0];
      return {
        text: BOT_CONTENT.responses.order_found(solo),
        orderCard: solo,
        actionType: 'orders'
      };
    } else if (t === 'return_exchange' || t.includes('return') || t.includes('exchange') || t.includes('replace') || t.includes('wapas')) {
      return {
        text: BOT_CONTENT.responses.return_info,
        actionType: 'orders'
      };
    } else if (t === 'refund_status' || t.includes('refund') || t.includes('payment') || t.includes('payout') || t.includes('margin') || t.includes('money')) {
      return {
        text: BOT_CONTENT.responses.refund_info,
        actionType: 'ticket'
      };
    } else if (t === 'raise_ticket' || t.includes('ticket') || t.includes('complaint') || t.includes('help') || t.includes('issue') || t.includes('support')) {
      return {
        text: BOT_CONTENT.responses.ticket_prompt,
        actionType: 'ticket'
      };
    } else if (t.includes('hi') || t.includes('hello') || t.includes('hey') || t.includes('namaste')) {
      return {
        text: BOT_CONTENT.responses.hi,
        showChips: true
      };
    } else {
      // Check if query is directly the name of one of their ordered products
      const directMatch = findOrderInQuery(t);
      if (directMatch) {
        setSelectedOrder(directMatch);
        setTicketOrder(`#${directMatch.id.slice(0, 8)}`);
        return {
          text: BOT_CONTENT.responses.order_found(directMatch),
          orderCard: directMatch,
          actionType: 'orders'
        };
      }

      return {
        text: BOT_CONTENT.responses.unknown,
        actionType: 'ticket',
        showChips: true
      };
    }
  };

  const executeSend = (textToSend, intentKey = null) => {
    if (!textToSend.trim()) return;

    const userMsg = { id: `m-${Date.now()}`, sender: 'user', text: textToSend.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      const replyData = processBotReply(intentKey || textToSend, intentKey);
      const agentReply = {
        id: `r-${Date.now()}`,
        sender: 'agent',
        text: replyData.text,
        orderCard: replyData.orderCard || null,
        orderPickerList: replyData.orderPickerList || null,
        actionType: replyData.actionType || null,
        showChips: replyData.showChips || false
      };
      setChatMessages((prev) => [...prev, agentReply]);
      setIsBotTyping(false);
    }, 600);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketDesc.trim()) return;

    setIsSubmittingTicket(true);
    try {
      const res = await fetch(`${API_V1_BASE}/admin-support/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject: ticketIssue,
          category: ticketIssue,
          description: ticketDesc.trim(),
          orderId: ticketOrder.trim(),
          priority: 'normal'
        })
      });

      const result = await res.json();
      if (result?.success && result?.data) {
        const ticketDisplayId = result.data.id ? `#TICK-${result.data.id.slice(0, 8).toUpperCase()}` : '#TICK-OK';
        setIsTicketModalOpen(false);
        setTicketDesc('');
        showToast(`Ticket ${ticketDisplayId} saved in Database! Operations desk notified.`);
      } else {
        showToast(result?.message || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('Error creating support ticket:', err);
      showToast('Network error while submitting support ticket');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    executeSend(chatInput);
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
        {orderIdParam && (
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#9f0038] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Direct Support for Order #{selectedOrder ? selectedOrder.id.slice(0, 8) : orderIdParam.slice(0, 8)}
                  {selectedOrder ? `: ${selectedOrder.productName || selectedOrder.items?.[0]?.product?.title || 'Order Item'}` : ''}
                </div>
                <div className="text-[11px] text-slate-500">Need help with tracking, return pickup, or refund status for this order?</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#9f0038] hover:bg-[#80002d] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Raise Ticket
              </button>
              <button
                type="button"
                onClick={() => setIsLiveSupportChatOpen(true)}
                className="px-3.5 py-1.5 bg-white border border-pink-200 text-[#9f0038] hover:bg-pink-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Chat with Agent
              </button>
            </div>
          </div>
        )}

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
              <p className="text-xs text-slate-500">Fast-track assistance for your deliveries</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/user-dashboard1?tab=orders')}
              className="text-[#b90041] font-bold text-xs hover:underline cursor-pointer"
            >
              View All Orders {userOrders.length > 0 ? `(${userOrders.length})` : ''}
            </button>
          </div>

          {/* If user has multiple orders, let them pick which order to focus */}
          {userOrders.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-1">
              {userOrders.slice(0, 6).map((ord) => {
                const isCurrent = selectedOrder?.id === ord.id;
                const title = ord.productName || ord.items?.[0]?.product?.title || 'Order Item';
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrder(ord);
                      setTicketOrder(`#${ord.id.slice(0, 8)}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#b90041] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-pink-50'
                    }`}
                  >
                    <span>{title.slice(0, 22)}...</span>
                    <span className="text-[10px] opacity-80">(₹{ord.totalAmount || ord.price || 0})</span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedOrder ? (
            <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xs border border-slate-100 hover:shadow-md transition-all">
              <div className="w-22 h-22 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200">
                <img
                  alt={selectedOrder?.items?.[0]?.product?.title || "Recent Purchase"}
                  className="w-full h-full object-cover"
                  src={selectedOrder?.image || selectedOrder?.items?.[0]?.product?.images?.[0] || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5'><rect width='20' height='20' x='2' y='2' rx='4'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='m21 15-5-5L5 21'/></svg>"}
                />
              </div>

              <div className="flex-grow text-center md:text-left min-w-0">
                <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  {selectedOrder ? `${selectedOrder.orderStatus || selectedOrder.status || 'ORDERED'} • ${new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : `Recent Verified Order`}
                </p>
                <h3 className="font-headline font-bold text-lg text-slate-900 mb-0.5 truncate">
                  {selectedOrder?.productName || selectedOrder?.items?.[0]?.product?.title || (selectedOrder?.totalAmount ? `Order for ₹${selectedOrder.totalAmount}` : "Order Verified & Confirmed")}
                </h3>
                <p className="text-slate-500 text-xs mb-3 font-medium">Order ID: #{selectedOrder ? selectedOrder.id.slice(0, 8) : 'ORD-LATEST'}</p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {selectedOrder?.paymentMethod || 'Online Order'}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Quality Checked
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const prodTitle = selectedOrder.productName || selectedOrder.items?.[0]?.product?.title || 'this item';
                    setChatMessages((prev) => [
                      ...prev,
                      {
                        id: `ord-focus-${Date.now()}`,
                        sender: 'agent',
                        text: `Here are the tracking details for Order #${selectedOrder.id.slice(0, 8)} (${prodTitle}):`,
                        orderCard: selectedOrder,
                        showChips: true
                      }
                    ]);
                    setIsLiveSupportChatOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-2xl font-bold active:scale-95 transition-all text-xs cursor-pointer shadow-xs text-center"
                >
                  Track in Chat
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrderHelpOpen(true)}
                  className="bg-gradient-to-br from-[#FF3F6C] to-[#DF2457] hover:brightness-105 text-white px-6 py-3.5 rounded-2xl font-bold active:scale-95 transition-all shadow-md shadow-pink-500/20 cursor-pointer text-xs text-center"
                >
                  Get Help
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 text-center text-slate-500 text-xs border border-slate-100">
              No orders found in your account.
            </div>
          )}
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
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Assistance for Order #{selectedOrder ? selectedOrder.id.slice(0, 8) : 'ACTIVE'}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold truncate max-w-xs mt-0.5">
                  {selectedOrder ? (selectedOrder.productName || selectedOrder.items?.[0]?.product?.title || 'Selected Order') : 'Order Help'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">What issue are you experiencing with this item?</p>

            <div className="space-y-2">
              {[
                'Item is defective / damaged',
                'Wrong size received',
                'Delivery Delayed / Tracking Inquiry',
                'Return / Exchange Request',
                'Reseller margin not credited',
                'Request Tax Invoice Copy',
              ].map((issue, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsOrderHelpOpen(false);
                    setTicketIssue(issue);
                    if (selectedOrder) {
                      setTicketOrder(`#${selectedOrder.id.slice(0, 8)}`);
                    }
                    setIsTicketModalOpen(true);
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
                  disabled={isSubmittingTicket}
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-5 py-2 bg-[#b90041] hover:bg-[#df2457] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSubmittingTicket ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Support Chat Drawer Modal (Smart English Bot) */}
      {isLiveSupportChatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[84vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            {/* Header with Title and Online Status */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#b90041] via-[#df2457] to-[#b90041] text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold shadow-inner">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wide leading-tight">{BOT_CONTENT.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-pink-100 font-semibold">{BOT_CONTENT.online}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveSupportChatOpen(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                aria-label="Close Chat"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fb]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#b90041] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Interactive Order Mini-Card if present */}
                  {msg.orderCard && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-3 max-w-[85%] shadow-xs space-y-2 text-left">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={msg.orderCard.image || msg.orderCard.items?.[0]?.product?.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="20" height="20" x="2" y="2" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'}
                          alt="Order item"
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {msg.orderCard.productName || msg.orderCard.items?.[0]?.product?.title || 'Ordered Product'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            Total: <strong className="text-slate-800">₹{msg.orderCard.totalAmount || msg.orderCard.price || 0}</strong>
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                            {msg.orderCard.orderStatus || msg.orderCard.status || 'ORDERED'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsLiveSupportChatOpen(false);
                            onNavigate(`/user-dashboard1?tab=orders&orderId=${msg.orderCard.id}`);
                          }}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-1.5 rounded-xl cursor-pointer transition-colors text-center"
                        >
                          {BOT_CONTENT.viewTrackingBtn}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interactive Order Picker List if multiple orders */}
                  {msg.orderPickerList && (
                    <div className="space-y-2 max-w-[85%] w-full">
                      <div className="flex flex-col gap-2">
                        {msg.orderPickerList.map((ord) => {
                          const title = ord.productName || ord.items?.[0]?.product?.title || 'Order Item';
                          const price = ord.totalAmount || ord.price || 0;
                          const status = (ord.orderStatus || ord.status || 'ORDERED').toUpperCase();
                          const img = ord.image || ord.items?.[0]?.product?.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="20" height="20" x="2" y="2" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                          return (
                            <button
                              key={ord.id}
                              type="button"
                              onClick={() => executeSend(title, `select_order_${ord.id}`)}
                              className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 rounded-2xl shadow-2xs transition-all text-left cursor-pointer group w-full"
                            >
                              <img
                                src={img}
                                alt={title}
                                className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-slate-800 group-hover:text-[#b90041] truncate">
                                  {title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] font-black text-slate-700">₹{price}</span>
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                                    {status}
                                  </span>
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-[#b90041] transition-transform group-hover:translate-x-0.5">
                                arrow_forward
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ticket Action Button if suggested */}
                  {msg.actionType === 'ticket' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsLiveSupportChatOpen(false);
                        setIsTicketModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-[#b90041] to-[#df2457] hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">confirmation_number</span>
                      <span>{BOT_CONTENT.ticketBtn}</span>
                    </button>
                  )}

                  {/* Orders redirect if suggested */}
                  {msg.actionType === 'orders' && !msg.orderCard && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsLiveSupportChatOpen(false);
                        onNavigate('/user-dashboard1?tab=orders');
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span>{BOT_CONTENT.myOrdersBtn}</span>
                    </button>
                  )}
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {isBotTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                  <div className="w-2 h-2 rounded-full bg-[#b90041] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#b90041] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#b90041] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-semibold text-slate-500">Typing...</span>
                </div>
              )}
            </div>

            {/* Quick Action Chips Bar */}
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {BOT_CONTENT.chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => executeSend(chip.label, chip.id)}
                  className="bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-[#b90041] text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-colors shadow-2xs shrink-0 active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={BOT_CONTENT.placeholder}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#b90041]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#b90041] text-white rounded-xl cursor-pointer hover:bg-[#df2457] active:scale-95 shadow-xs flex items-center gap-1 font-bold text-xs"
              >
                <span>{BOT_CONTENT.sendBtn}</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <AppBottomNav role="customer" homePath="/user-home" />
    </div>
  );
}

export default SupportCenter;
