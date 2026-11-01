import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialMessages = [
  {
    id: 1,
    sender: 'supplier',
    text: "Hello! Thank you for reselling our ethnic catalog. How can I help you today?",
    time: "10:14 AM"
  },
  {
    id: 2,
    sender: 'reseller',
    text: "Hi Alex, is the Embroidered Silk Saree available in XL size for immediate dispatch?",
    time: "10:15 AM"
  },
  {
    id: 3,
    sender: 'supplier',
    text: "Yes, we just restocked it! We have 12 units of XL remaining in warehouse.",
    time: "10:16 AM"
  },
  {
    id: 4,
    sender: 'reseller',
    text: "Great! My customer wants fast delivery in Delhi. Can you ship it by tomorrow?",
    time: "10:18 AM"
  },
  {
    id: 5,
    sender: 'supplier',
    text: "Yes, confirmed. If you place the order before 2 PM today, dispatch will happen this evening itself! 🚚",
    time: "10:19 AM"
  }
];

export default function ConversationScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'reseller',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText("");

    // Automated supplier response after 1 second
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'supplier',
          text: "Understood! I have noted your request. Let me know once the customer order is booked.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans selection:bg-primary/20">
      {/* TopAppBar - Full Width */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center px-4 sm:px-6 md:px-10 lg:px-16 h-16 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 rounded-full hover:bg-gray-100 active:scale-95 text-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="relative">
              <img
                alt="Alex Rivera"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline text-sm font-bold text-slate-900 leading-tight">Alex Rivera</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Top Verified Supplier</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert("Calling supplier Alex Rivera (+91 98765 43210)...")}
              className="p-2 rounded-full hover:bg-gray-100 text-slate-700 cursor-pointer active:scale-95"
              title="Call Supplier"
            >
              <span className="material-symbols-outlined text-xl">call</span>
            </button>
            <button 
              onClick={() => navigate('/share-earn-config')}
              className="p-2 rounded-full hover:bg-gray-100 text-slate-700 cursor-pointer active:scale-95"
              title="Share Catalog"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Canvas */}
      <main className="flex-1 pt-20 pb-28 px-4 max-w-4xl mx-auto w-full flex flex-col gap-4 overflow-y-auto">
        {/* Day Divider */}
        <div className="flex justify-center my-2">
          <span className="px-4 py-1 bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider rounded-full">
            Today
          </span>
        </div>

        {/* Linked Product Context Card */}
        <div className="flex justify-center w-full mb-2">
          <div 
            onClick={() => navigate('/share-earn-config')}
            className="w-full max-w-md p-3 bg-white border border-gray-200/80 rounded-2xl shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <img
              alt="Embroidered Silk Saree"
              className="w-14 h-14 rounded-xl object-cover"
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Active Resell Item</span>
              <h3 className="text-xs font-bold text-on-surface truncate">Embroidered Silk Saree (Banarasi)</h3>
              <p className="text-xs font-black text-slate-900 mt-0.5">Supplier Base: ₹500 • Earn ₹150+</p>
            </div>
            <button className="bg-primary/10 text-primary p-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-colors">
              Set Margin
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        {messages.map((msg) => {
          const isMe = msg.sender === 'reseller';
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[70%] ${
                isMe ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-br from-[#686DE0] to-[#4834D4] text-white rounded-br-none shadow-[#4834D4]/20'
                    : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 px-1">
                <span>{msg.time}</span>
                {isMe && (
                  <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    done_all
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="fixed bottom-0 left-0 w-full px-4 pb-6 pt-3 bg-white/95 backdrop-blur-xl border-t border-gray-100"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-2 p-1.5 bg-surface-container-low rounded-full border border-gray-200">
          <button
            type="button"
            onClick={() => setInputText("Is COD available for this pincode?")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-slate-600 transition-all cursor-pointer"
            title="Quick Suggestion"
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to supplier..."
            className="flex-1 bg-transparent border-none text-sm font-medium text-on-surface placeholder:text-gray-400 px-2 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md active:scale-95 transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-[#4834D4] hover:bg-[#3d2ab8]'
                : 'bg-gray-300 opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
