import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navSections = [
  {
    title: "Shop & Catalog",
    items: [
      { name: "Home & Curated Catalog", path: "/reseller-home", icon: "home" },
      { name: "Supplier Product Access", path: "/supplier-products", icon: "inventory_2", badge: "Direct" },
      { name: "Resell & Earn Products", path: "/resell-earn", icon: "storefront", badge: "Popular" },
      { name: "Profit Margin & Sharing", path: "/share-earn-config", icon: "share" },
    ]
  },
  {
    title: "Business & Earnings",
    items: [
      { name: "My Business Dashboard", path: "/earnings-dashboard-1", icon: "trending_up" },
      { name: "Analytics & Performance", path: "/earnings-dashboard-2", icon: "query_stats" },
      { name: "Fintech Wallet", path: "/my-wallet", icon: "account_balance_wallet" },
      { name: "Reseller Wallet", path: "/reseller-wallet", icon: "payments" },
      { name: "Withdraw Earnings", path: "/withdraw-earnings", icon: "savings" },
      { name: "Payout Settings", path: "/payout-settings", icon: "settings_suggest" },
    ]
  },
  {
    title: "Community & Network",
    items: [
      { name: "Community Hub", path: "/community-hub", icon: "groups", badge: "Live" },
      { name: "Reseller Messenger", path: "/messenger", icon: "chat" },
      { name: "Notification Center", path: "/notifications", icon: "notifications" },
    ]
  },
  {
    title: "Growth & Programs",
    items: [
      { name: "Refer & Earn Bonus", path: "/refer-earn", icon: "card_giftcard" },
      { name: "Affiliate Partner Panel", path: "/affiliate-program", icon: "loyalty" },
    ]
  }
];

export default function NavDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-out">
        {/* Drawer Header */}
        <div className="p-6 bg-gradient-to-br from-[#FF3F6C] to-[#b90041] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/mshoppy-logo.png" 
              alt="MShoppy" 
              className="w-10 h-10 rounded-2xl object-cover border border-white/30 shadow-inner bg-white" 
            />
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg leading-tight">
                MShoppy Reseller
              </h2>
              <p className="text-white/80 text-xs font-medium">Digital Commerce Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* User Quick Info Banner */}
        <div className="px-6 py-3.5 bg-rose-50/60 border-b border-rose-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-700">Reseller Mode Active</span>
          </div>
          <span className="text-[11px] font-bold text-[#FF3F6C] bg-white px-2.5 py-0.5 rounded-full border border-[#FF3F6C]/20 shadow-xs">
            Gold Tier
          </span>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="px-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase font-['Plus_Jakarta_Sans']">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        onClose();
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer group ${
                        isActive
                          ? 'bg-[#FF3F6C]/10 text-[#FF3F6C] font-bold'
                          : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${
                            isActive ? 'text-[#FF3F6C]' : 'text-gray-500 group-hover:text-gray-800'
                          }`}
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-[#FF3F6C] text-white' 
                            : 'bg-rose-100 text-[#FF3F6C]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>100% Safe Reselling</span>
          </div>
          <button 
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="text-xs font-semibold text-[#FF3F6C] hover:underline cursor-pointer"
          >
            Logout / Switch
          </button>
        </div>
      </div>
    </div>
  );
}
