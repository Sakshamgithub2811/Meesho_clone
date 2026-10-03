import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';

const initialConversations = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "Verified Supplier",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYIWJGvVF9x6xwSYsW2O8630jBgwN_qdKvO84ODHaNJ7cF-9atMuYOTbMBDcwBWYi6dYHmCcC-229NdNapDM65u-N9JW-U5Q8ChWzYkbfMKQazBNFbouQbe29Iuoi4itfJCqg3N1oRIR5xGJ_hCDMmHZssY7OZKiXA63_BpjjZ5Yw-rsnktqOgbIGIZvPsaqGBUbWWAHqSICezCy40Du_IkzJndaXXHfJm3VQizda9NxXNRuMk2XWLl97rCF4_yH2UphO7XyzEeTo",
    online: true,
    lastMsg: "Yes, we just restocked! 12 units of XL remaining.",
    time: "10:20 AM",
    unread: 2,
    route: "/conversation"
  },
  {
    id: 2,
    name: "Varanasi Silks",
    role: "Top Saree Supplier",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3CXmiCJTkUBgfAZD78N7CQvDchFlfGI51TEstPAjPveHqZGaXDvH5m5ESZndZg9-Wrx7IKuL3wPe4WHTn_qi3UJaCCwc27TtouBGajzX4msFFwZXbfvbvKnLpu00www7Vtfo-i9aRgL3bt6qpXn0d1WmIEcKuJfXjenL45le1T6r9Nj_D0qpOWTZRBfY60gVuyJ3NV-iDWSCNn8Leh7lpEGG07f1JM5O6xrmAoxUOiaxnYb--JdIDFzNKl1jOIxI-di5oyJBmCNU",
    online: true,
    lastMsg: "Is this saree in stock for bulk order?",
    time: "10:30 AM",
    unread: 1,
    route: "/conversation"
  },
  {
    id: 3,
    name: "Aditi Designer Hub",
    role: "Kurti Manufacturer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuOGkFkQ5ltfyNu5mBrHZah1cm9PsvZO8Ct2mTJp6uaYUgGO0tZ3zPuAAxdWgENdu9NWod4KZtcCfFzNRRphUmBGwXlhULYIDg7PBB5p4wrjpxAk68eZOzrkPuu0UvizRQRs1SANpfiPJTBDCzamGNIdIi-puaRs6CxOV_l4MrjpoQviDS04CpnfGrpXhTlI6CVM9Ol3lktpzLr0Az-aPlRzMGKz5mV8lAXaiDcaWJ1wnGPI8gIuhQxSCrvd2LZ_pqHkEM5a4HXMg",
    online: false,
    lastMsg: "Price updated for the Kurti set. Check catalog.",
    time: "09:15 AM",
    unread: 0,
    route: "/conversation"
  },
  {
    id: 4,
    name: "Reseller Network Mumbai",
    role: "Community Group (3.2k)",
    avatar: null,
    isGroup: true,
    online: true,
    lastMsg: "Amit: New ethnic collection launching at 5 PM today!",
    time: "YESTERDAY",
    unread: 5,
    route: "/community-hub"
  },
  {
    id: 5,
    name: "Global Fashion Hub",
    role: "Western Wear Supplier",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrD5qWXRR8JmBzXMO-k0bU9qhCAcnrfJ-z5Cw6BvB2UEDZ_VwtTr3XYktc-1SP44i1XcXqHKqzIio-AFMnCzDz5gHLbdG3TEUnD0DgK0rBr1DLvhl2Mxjqv1IgMiHwepc88vTIWZDjtX38XeQEW2Xkotvx9rhm8OkCzIPRSzKKKGVzVdcL9mT8E-fh7FuDukTFftGugCLKZ76Tv3JMFqb0d8jMw8qGcKF9ybR-17FpDJL7qQ4be0ukjAkEtXUKWnpAXIdjU4BzCo4",
    online: false,
    lastMsg: "Your customer shipment #MS452 has been dispatched.",
    time: "OCT 24",
    unread: 0,
    route: "/conversation"
  }
];

export default function MeeshoMessengerChatHub() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState(initialConversations);

  const filtered = conversations.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-32 selection:bg-primary/20">
      {/* TopAppBar - Full Width */}
      <header className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-10 lg:px-16 py-3.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-gray-100 text-slate-700 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <img src="/mshoppy-logo.png" alt="MShoppy" className="w-7 h-7 rounded-lg object-contain shadow-xs" />
              <h1 className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-slate-900 text-lg sm:text-xl">
                MShoppy Messenger
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900 cursor-pointer">
              search
            </button>
            <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900 cursor-pointer">
              more_vert
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-28 px-4 sm:px-6 max-w-4xl lg:max-w-5xl mx-auto space-y-6">
        {/* Active Suppliers Status Stories */}
        <section className="overflow-x-auto no-scrollbar flex gap-4 py-2">
          <div 
            onClick={() => navigate('/community-hub')}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-15 h-15 rounded-full bg-white border-2 border-dashed border-primary/40 flex items-center justify-center group-hover:border-primary transition-all">
              <span className="material-symbols-outlined text-primary text-2xl">add</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Post Tip</span>
          </div>

          {[
            { name: "Alex (Supplier)", online: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYIWJGvVF9x6xwSYsW2O8630jBgwN_qdKvO84ODHaNJ7cF-9atMuYOTbMBDcwBWYi6dYHmCcC-229NdNapDM65u-N9JW-U5Q8ChWzYkbfMKQazBNFbouQbe29Iuoi4itfJCqg3N1oRIR5xGJ_hCDMmHZssY7OZKiXA63_BpjjZ5Yw-rsnktqOgbIGIZvPsaqGBUbWWAHqSICezCy40Du_IkzJndaXXHfJm3VQizda9NxXNRuMk2XWLl97rCF4_yH2UphO7XyzEeTo" },
            { name: "Varanasi Silk", online: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3CXmiCJTkUBgfAZD78N7CQvDchFlfGI51TEstPAjPveHqZGaXDvH5m5ESZndZg9-Wrx7IKuL3wPe4WHTn_qi3UJaCCwc27TtouBGajzX4msFFwZXbfvbvKnLpu00www7Vtfo-i9aRgL3bt6qpXn0d1WmIEcKuJfXjenL45le1T6r9Nj_D0qpOWTZRBfY60gVuyJ3NV-iDWSCNn8Leh7lpEGG07f1JM5O6xrmAoxUOiaxnYb--JdIDFzNKl1jOIxI-di5oyJBmCNU" },
            { name: "Priya (Reseller)", online: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuALrag4BONFCklaNRkaSvO2vAnW7K1zAqcI_bzrGluc64rHWx-WrlnXMxJ80tglJohRyT07xo8_ztEq5TaBrTqsJpYrMxhFq99TlRBUlIl7b2Vbtqv7XQbbWttu63IgUwjQiis7cWP4J-NPkCYnsXcee3UGVOngoMeD_pgz7e7n0NaeXiV9TjDdbMwPDoeztBt2M_SvmGjCgbDpquo76CqfVCRIQ84bMOaXM_HHVLb0cj_rjc9qqmn6BLLd1DuTxjuPuJ35huFbyME" }
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={() => navigate('/conversation')}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary to-primary-container">
                <img className="w-14 h-14 rounded-full border-2 border-white object-cover" alt={item.name} src={item.img} />
                {item.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight text-on-surface truncate max-w-[64px]">
                {item.name}
              </span>
            </div>
          ))}
        </section>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-outline">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none"
            placeholder="Search suppliers, buyers or messages..."
            type="text"
          />
        </div>

        {/* Conversations List */}
        <div className="space-y-2">
          {filtered.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(conv.route)}
              className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 hover:border-primary/20 shadow-sm transition-all group cursor-pointer active:scale-[0.99]"
            >
              <div className="relative flex-shrink-0">
                {conv.avatar ? (
                  <img alt={conv.name} className="w-13 h-13 rounded-full object-cover" src={conv.avatar} />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                  </div>
                )}
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-on-surface text-sm truncate">{conv.name}</h3>
                  <span className="text-[10px] font-bold text-outline uppercase">{conv.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-on-surface-variant truncate font-medium max-w-[200px] sm:max-w-md">
                    {conv.lastMsg}
                  </p>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Button: New Chat */}
      <button
        onClick={() => navigate('/conversation')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
        title="Start Chat with Supplier"
      >
        <span className="material-symbols-outlined text-2xl">chat</span>
      </button>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
