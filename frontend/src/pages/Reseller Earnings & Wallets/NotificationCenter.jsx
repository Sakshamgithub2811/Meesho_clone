import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getNotifications,
  subscribeNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
  formatRelativeTime,
  getNotificationSection,
} from '../../services/notificationService';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const unsub = subscribeNotifications((updated) => {
      setNotifications(updated);
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    showToast('All notifications marked as read! ✓');
  };

  const handleNotificationClick = (notif) => {
    if (notif.isUnread) {
      markAsRead(notif.id);
    }
    if (notif.actionPath) {
      navigate(notif.actionPath);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
    showToast('Notification removed');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'All') return true;
    return n.category === activeTab;
  });

  const todayNotifications = filteredNotifications.filter(
    (n) => getNotificationSection(n.timestamp) === 'Today'
  );
  const yesterdayNotifications = filteredNotifications.filter(
    (n) => getNotificationSection(n.timestamp) === 'Yesterday'
  );
  const earlierNotifications = filteredNotifications.filter(
    (n) => getNotificationSection(n.timestamp) === 'Earlier'
  );

  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const ordersCount = notifications.filter((n) => n.category === 'Orders' && n.isUnread).length;
  const earningsCount = notifications.filter((n) => n.category === 'Earnings' && n.isUnread).length;
  const offersCount = notifications.filter((n) => n.category === 'Offers' && n.isUnread).length;

  const renderNotificationCard = (notif) => {
    return (
      <div
        key={notif.id}
        onClick={() => handleNotificationClick(notif)}
        className={`relative p-4 rounded-2xl transition-all cursor-pointer border ${
          notif.isUnread
            ? 'bg-white shadow-[0_8px_25px_rgb(0,0,0,0.04)] border-rose-100 hover:border-rose-200'
            : 'bg-white/70 shadow-xs border-slate-100 opacity-90 hover:opacity-100 hover:bg-white'
        }`}
      >
        {notif.isUnread && (
          <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#FF3F6C] rounded-full ring-4 ring-rose-50 animate-pulse"></div>
        )}

        <div className="flex gap-3.5 sm:gap-4 items-start">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              notif.iconBg || 'bg-rose-50 text-[#b90041]'
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {notif.icon || 'notifications'}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex justify-between items-start mb-1 gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] truncate">
                {notif.title}
              </h3>
              <span className="text-[11px] font-medium text-slate-400 shrink-0">
                {formatRelativeTime(notif.timestamp)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {notif.message}
            </p>

            {notif.actionText && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-[#b90041] hover:underline">
                <span>{notif.actionText}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => handleDelete(e, notif.id)}
            className="text-slate-300 hover:text-slate-500 p-1 rounded-full transition-colors shrink-0"
            title="Delete notification"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#f8f9fb] text-slate-900 min-h-screen pb-32 font-['Inter',sans-serif] selection:bg-[#FF3F6C]/20 antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1c1724] text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-bounce text-xs font-bold">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-transform cursor-pointer"
              title="Go Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-['Plus_Jakarta_Sans'] font-black text-xl tracking-tight text-[#FF3F6C]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-[#FF3F6C] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {unreadCount} New
                </span>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-28 px-4 sm:px-6 w-full max-w-3xl mx-auto space-y-6">
        {/* Dynamic Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'All', label: 'All', count: unreadCount },
            { id: 'Orders', label: 'Orders', count: ordersCount },
            { id: 'Offers', label: 'Offers', count: offersCount },
            { id: 'Earnings', label: 'Earnings', count: earningsCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#FF3F6C] to-[#b90041] text-white shadow-md shadow-[#FF3F6C]/25'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-rose-100 text-[#b90041]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">notifications_off</span>
            </div>
            <h3 className="font-bold text-base text-slate-800">No {activeTab} Notifications</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {activeTab === 'Orders'
                ? 'Your order confirmations, dispatches, and delivery alerts will appear here.'
                : activeTab === 'Earnings'
                ? 'Your affiliate commission credits, KYC updates, and payout alerts will appear here.'
                : activeTab === 'Offers'
                ? 'Exclusive deals, coupons, and seasonal discounts will show up here.'
                : 'All your customer orders, affiliate earnings, and exclusive promo alerts will appear here.'}
            </p>
            <button
              onClick={() => navigate(activeTab === 'Earnings' ? '/affiliate-program' : '/explorer')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {activeTab === 'Earnings' ? 'monetization_on' : 'shopping_bag'}
              </span>
              <span>{activeTab === 'Earnings' ? 'Open Affiliate Program' : 'Start Shopping'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section: Today */}
            {todayNotifications.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Today
                  </h2>
                </div>
                <div className="space-y-3">{todayNotifications.map(renderNotificationCard)}</div>
              </section>
            )}

            {/* Section: Yesterday */}
            {yesterdayNotifications.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Yesterday
                  </h2>
                </div>
                <div className="space-y-3">{yesterdayNotifications.map(renderNotificationCard)}</div>
              </section>
            )}

            {/* Section: Earlier */}
            {earlierNotifications.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Earlier
                  </h2>
                </div>
                <div className="space-y-3">{earlierNotifications.map(renderNotificationCard)}</div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <AppBottomNav activeNav="home" />
    </div>
  );
}
