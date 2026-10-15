import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppBottomNav({ activeNav = 'home', onNavigate, role = 'reseller', homePath }) {
  const navigate = useNavigate();

  const handleNavClick = (navId, path) => {
    if (navId === 'screens') {
      window.dispatchEvent(new CustomEvent('open-screen-navigator'));
      return;
    }
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    if (path) {
      navigate(path);
    }
  };

  const isCustomer = role === 'customer' || homePath === '/user-home';
  const effectiveHome = homePath || (isCustomer ? '/user-home' : '/reseller-home');

  const navItems = isCustomer ? [
    { id: 'home', label: 'Home', icon: 'home', path: effectiveHome },
    { id: 'categories', label: 'Categories', icon: 'grid_view', path: '/explorer' },
    { id: 'orders', label: 'Orders', icon: 'shopping_bag', path: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: 'favorite', path: '/wishlist' },
    { id: 'profile', label: 'Profile', icon: 'person', path: '/user-dashboard' },
    { id: 'screens', label: 'Screens', icon: 'layers', badge: '68' },
  ] : [
    { id: 'home', label: 'Home', icon: 'home', path: '/reseller-home' },
    { id: 'categories', label: 'Categories', icon: 'grid_view', path: '/explorer' },
    { id: 'orders', label: 'Orders', icon: 'shopping_bag', path: '/orders' },
    { id: 'earnings', label: 'Earnings', icon: 'payments', path: '/earnings-dashboard-1' },
    { id: 'profile', label: 'Profile', icon: 'person', path: '/user-dashboard' },
    { id: 'screens', label: 'Screens', icon: 'layers', badge: '68' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-[1.75rem] md:rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:shadow-[0_-12px_40px_rgba(0,0,0,0.12)] border-t border-gray-100 dark:border-slate-800 pb-safe">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto grid grid-cols-6 items-center px-1 sm:px-4 md:px-8 py-1.5 md:py-2.5">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id, item.path)}
              className={`flex flex-col items-center justify-center py-1 md:py-1.5 px-0.5 md:px-2 min-w-0 transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer group ${
                isActive
                  ? 'text-[#FF3F6C]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#FF3F6C]'
              }`}
              title={item.label}
            >
              <div
                className={`flex items-center justify-center relative w-9 h-7 sm:w-11 sm:h-8 md:w-14 md:h-9 rounded-xl md:rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF3F6C]/10 text-[#FF3F6C]'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px] sm:text-2xl md:text-[25px] transition-transform"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 bg-[#FF3F6C] text-white text-[7.5px] md:text-[9px] font-extrabold px-1 md:px-1.5 py-0.2 rounded-full leading-tight shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[8.5px] sm:text-[9.5px] md:text-xs tracking-tight md:tracking-normal truncate w-full text-center leading-tight mt-0.5 md:mt-1 ${
                  isActive
                    ? 'font-bold text-[#FF3F6C]'
                    : 'font-medium opacity-80 group-hover:opacity-100'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
