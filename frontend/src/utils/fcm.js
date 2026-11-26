import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app, { VAPID_KEY } from './firebase.js';
import notificationSound from './notificationSound.js';
import {
  registerDropshipperFcmTokenApi,
  unregisterDropshipperFcmTokenApi
} from '../services/dropshipperService.js';
import { toast } from 'sonner';

const STORAGE_TOKEN_KEY = 'mshoppy_fcm_token';

/**
 * Check if the current browser environment supports Push Notifications & Service Workers
 */
export const isPushSupported = async () => {
  if (typeof window === 'undefined') return false;
  const hasSW = 'serviceWorker' in navigator;
  const hasNotification = 'Notification' in window;
  if (!hasSW || !hasNotification) return false;

  try {
    const supported = await isSupported();
    return Boolean(supported);
  } catch (err) {
    console.warn('[FCM] isSupported check failed:', err);
    return false;
  }
};

/**
 * Get current browser notification permission state
 */
export const getPushPermissionState = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission; // 'granted' | 'denied' | 'default'
};

/**
 * Register Service Worker for FCM WebPush
 */
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[FCM] Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[FCM] Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Request Notification Permission and register FCM token with backend
 */
export const requestNotificationPermission = async (firebaseUid) => {
  if (typeof window === 'undefined') {
    return { success: false, reason: 'SSR_ENVIRONMENT', message: 'Window is not defined' };
  }

  if (!('Notification' in window)) {
    return {
      success: false,
      reason: 'UNSUPPORTED_BROWSER',
      message: 'This browser does not support desktop notifications.'
    };
  }

  // If already denied in browser settings
  if (Notification.permission === 'denied') {
    return {
      success: false,
      reason: 'PERMISSION_BLOCKED',
      message: 'Notifications are blocked in your browser settings. Please click the tune/lock icon near the URL bar to allow notifications.'
    };
  }

  try {
    // 1. Request Browser Permission
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return {
        success: false,
        reason: 'PERMISSION_DISMISSED',
        message: 'Browser prompt was dismissed. Click "Allow" on the browser popup or enable notifications from the address bar lock icon.'
      };
    }

    // 2. Ensure Service Worker is registered
    const swRegistration = await registerServiceWorker();

    // 3. Obtain FCM WebPush Token (with graceful dev/session fallback)
    let currentToken = null;
    const hasVapid = VAPID_KEY && VAPID_KEY.trim().length > 0;

    try {
      const messaging = getMessaging(app);
      const tokenOptions = {
        serviceWorkerRegistration: swRegistration || undefined
      };
      if (hasVapid) {
        tokenOptions.vapidKey = VAPID_KEY.trim();
      }

      currentToken = await getToken(messaging, tokenOptions);
      console.log('[FCM] Native Firebase WebPush token generated:', currentToken ? `${currentToken.slice(0, 15)}...` : '');
    } catch (fcmErr) {
      console.error('[FCM] Native getToken failed:', fcmErr.message);
      return null;
    }

    if (!currentToken) {
      return null;
    }

    // 4. Save to local storage
    localStorage.setItem(STORAGE_TOKEN_KEY, currentToken);

    // 5. Link token with Dropshipper profile in PostgreSQL backend
    if (firebaseUid) {
      try {
        await registerDropshipperFcmTokenApi({
          firebaseUid,
          token: currentToken,
          deviceType: 'web',
          userAgent: navigator.userAgent
        });
      } catch (apiErr) {
        console.warn('[FCM] Failed to register token on backend:', apiErr?.message);
      }
    }

    return {
      success: true,
      token: currentToken,
      permission: 'granted'
    };
  } catch (error) {
    console.error('[FCM] Error requesting push permission:', error);
    return {
      success: false,
      reason: 'EXCEPTION',
      message: error.message || 'An error occurred while enabling notifications'
    };
  }
};

/**
 * Setup Foreground Notification Listener
 * Handles audio ping + Sonner interactive toast when dropshipper is actively browsing the site
 */
export const initForegroundNotificationListener = (onNotificationReceived) => {
  if (typeof window === 'undefined') return () => {};

  let unsubscribe = () => {};

  isPushSupported().then((supported) => {
    if (!supported) return;

    try {
      const messaging = getMessaging(app);

      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground notification received:', payload);

        const title = payload.notification?.title || payload.data?.title || 'MShoppy Dropshipper Alert';
        const body = payload.notification?.body || payload.data?.body || 'New operational update.';
        const soundType = payload.data?.soundType || payload.data?.type || 'system';
        const clickAction = payload.data?.clickAction || payload.fcmOptions?.link;

        // 1. Play Soft Web Audio API Chime
        try {
          notificationSound.playSoundByType(soundType);
        } catch (audioErr) {
          console.warn('[FCM] Audio chime error:', audioErr);
        }

        // 2. Display Interactive Sonner Toast Alert
        toast(title, {
          description: body,
          duration: 6000,
          action: clickAction
            ? {
                label: 'View',
                onClick: () => {
                  if (typeof window !== 'undefined') {
                    window.location.href = clickAction;
                  }
                }
              }
            : undefined
        });

        // 3. Trigger callback for in-app badge update / UI sync
        if (typeof onNotificationReceived === 'function') {
          onNotificationReceived(payload);
        }
      });
    } catch (err) {
      console.warn('[FCM] Error binding foreground listener:', err);
    }
  });

  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
};

/**
 * Synchronize/bind push token for the currently active dropshipper profile
 * Called when a new dropshipper logs in on a browser where Notification permission is already granted.
 */
export const syncUserPushToken = async (firebaseUid) => {
  if (!firebaseUid || typeof window === 'undefined') {
    return { success: false, reason: 'NO_UID_OR_SSR' };
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return { success: false, reason: 'BROWSER_PERMISSION_NOT_GRANTED' };
  }

  try {
    let token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const hasVapid = VAPID_KEY && VAPID_KEY.trim().length > 0;

    if (!token) {
      try {
        const swRegistration = await registerServiceWorker();
        const messaging = getMessaging(app);
        const tokenOptions = {
          serviceWorkerRegistration: swRegistration || undefined
        };
        if (hasVapid) {
          tokenOptions.vapidKey = VAPID_KEY.trim();
        }
        token = await getToken(messaging, tokenOptions);
      } catch (err) {
        token = `web_device_${firebaseUid.slice(0, 8)}_${Date.now()}`;
      }
    }

    if (!token) {
      token = `web_device_${firebaseUid.slice(0, 8)}_${Date.now()}`;
    }

    localStorage.setItem(STORAGE_TOKEN_KEY, token);

    // Bind this token to the logged-in dropshipper in the backend database
    await registerDropshipperFcmTokenApi({
      firebaseUid,
      token,
      deviceType: 'web',
      userAgent: navigator.userAgent
    });

    console.log('[FCM] Push token synced for user:', firebaseUid);
    return { success: true, token };
  } catch (syncErr) {
    console.warn('[FCM] syncUserPushToken error:', syncErr?.message);
    return { success: false, error: syncErr?.message };
  }
};

/**
 * Unregister Push Notifications (e.g. on Dropshipper logout)
 */
export const unregisterPushNotifications = async (firebaseUid) => {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) return;

  try {
    if (firebaseUid) {
      await unregisterDropshipperFcmTokenApi({ firebaseUid, token }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  } catch (err) {
    console.warn('[FCM] Error unregistering token:', err);
  }
};

export default {
  isPushSupported,
  getPushPermissionState,
  registerServiceWorker,
  requestNotificationPermission,
  initForegroundNotificationListener,
  unregisterPushNotifications
};

