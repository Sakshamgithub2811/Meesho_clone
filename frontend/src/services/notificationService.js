// frontend/src/services/notificationService.js

const LEGACY_STORAGE_KEY = 'mshoppy_real_notifications';
const listeners = new Set();

/**
 * Dynamically resolves the storage key scoped to the active user
 */
export function getStorageKey() {
  try {
    // Purge legacy un-scoped storage if present
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const customerRaw = localStorage.getItem('mshoppy_customer_user');
    if (customerRaw) {
      const user = JSON.parse(customerRaw);
      const uid = user?.id || user?.uid || user?.email;
      if (uid) return `mshoppy_notifications_${uid}`;
    }

    const affiliateRaw = localStorage.getItem('mshoppy_affiliate_user');
    if (affiliateRaw) {
      const user = JSON.parse(affiliateRaw);
      const uid = user?.id || user?.uid || user?.email;
      if (uid) return `mshoppy_notifications_${uid}`;
    }
  } catch (e) {}
  return 'mshoppy_notifications_guest';
}

function notifyListeners() {
  const current = getNotifications();
  listeners.forEach((fn) => {
    try {
      fn(current);
    } catch (e) {}
  });
}

/**
 * Format relative time (e.g. Just now, 5 mins ago, 2 hours ago, Yesterday)
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const diffMs = now - Number(timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Get section (Today, Yesterday, Earlier)
 */
export function getNotificationSection(timestamp) {
  if (!timestamp) return 'Today';
  const now = new Date();
  const date = new Date(Number(timestamp));

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';
  return 'Earlier';
}

/**
 * Get all notifications for the active user
 * Newly registered users start with a clean empty list.
 */
export function getNotifications() {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
    }
  } catch (e) {}

  return [];
}

/**
 * Add a new notification for the active user
 */
export function addNotification({
  title,
  message,
  category = 'Orders', // 'Orders' | 'Earnings' | 'Offers'
  icon = 'notifications',
  iconBg = null,
  actionPath = null,
  actionText = null,
  data = null,
}) {
  try {
    const key = getStorageKey();
    const list = getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      category,
      timestamp: Date.now(),
      isUnread: true,
      icon:
        icon ||
        (category === 'Orders'
          ? 'local_shipping'
          : category === 'Earnings'
          ? 'payments'
          : 'local_offer'),
      iconBg:
        iconBg ||
        (category === 'Orders'
          ? 'bg-blue-50 text-blue-600'
          : category === 'Earnings'
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-pink-50 text-[#b90041]'),
      actionPath,
      actionText,
      data,
    };

    const updated = [newNotif, ...list];
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners();
    return newNotif;
  } catch (e) {
    console.error('Error adding notification:', e);
    return null;
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
  try {
    const key = getStorageKey();
    const list = getNotifications();
    const updated = list.map((n) => ({ ...n, isUnread: false }));
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {}
}

/**
 * Toggle or mark a single notification as read
 */
export function markAsRead(id) {
  try {
    const key = getStorageKey();
    const list = getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, isUnread: false } : n));
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {}
}

/**
 * Delete a notification
 */
export function deleteNotification(id) {
  try {
    const key = getStorageKey();
    const list = getNotifications();
    const updated = list.filter((n) => n.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {}
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify([]));
    notifyListeners();
  } catch (e) {}
}

/**
 * Get unread notification count
 */
export function getUnreadCount() {
  const list = getNotifications();
  return list.filter((n) => n.isUnread).length;
}

/**
 * Subscribe to real-time notification changes
 */
export function subscribeNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
