// frontend/src/services/affiliateSessionStore.js

const listeners = new Set();
let inMemoryApp = null;

function getCurrentUserIdentifier() {
  try {
    const custRaw = localStorage.getItem('mshoppy_customer_user');
    if (custRaw) {
      const u = JSON.parse(custRaw);
      if (u?.id || u?.uid || u?.email) {
        return {
          id: u.id || u.uid,
          email: (u.email || '').toLowerCase(),
          phone: (u.phone || '').toString().replace(/\D/g, '').slice(-10),
        };
      }
    }
    const affRaw = localStorage.getItem('mshoppy_affiliate_user');
    if (affRaw) {
      const u = JSON.parse(affRaw);
      if (u?.id || u?.uid || u?.email) {
        return {
          id: u.id || u.uid,
          email: (u.email || '').toLowerCase(),
          phone: (u.phone || '').toString().replace(/\D/g, '').slice(-10),
        };
      }
    }
  } catch (e) {}
  return null;
}

function isAppOwnedByCurrent(app, currentUser) {
  if (!app || !currentUser) return false;
  if (app.userId && currentUser.id && app.userId === currentUser.id) return true;
  if (app.email && currentUser.email && app.email.toLowerCase() === currentUser.email) return true;
  if (app.phone && currentUser.phone && app.phone.toString().replace(/\D/g, '').slice(-10) === currentUser.phone) return true;
  return false;
}

export function getAffiliateApp() {
  const currentUser = getCurrentUserIdentifier();
  if (!currentUser) {
    inMemoryApp = null;
    return null;
  }

  // Check inMemoryApp
  if (inMemoryApp && isAppOwnedByCurrent(inMemoryApp, currentUser)) {
    return inMemoryApp;
  }

  // Check scoped storage
  try {
    const scopedKey = `affiliate_kyc_app_${currentUser.id || currentUser.email}`;
    const stored = sessionStorage.getItem(scopedKey) || localStorage.getItem(scopedKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isAppOwnedByCurrent(parsed, currentUser)) {
        if (parsed.handle && parsed.fullName && parsed.handle === ('@' + parsed.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_'))) {
          parsed.handle = '';
        }
        inMemoryApp = parsed;
        return inMemoryApp;
      }
    }
  } catch (e) {}

  inMemoryApp = null;
  return null;
}

export function saveAffiliateApp(app) {
  if (app && app.handle && app.fullName && app.handle === ('@' + app.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_'))) {
    app.handle = '';
  }
  const currentUser = getCurrentUserIdentifier();
  inMemoryApp = app;

  try {
    if (app && currentUser) {
      const scopedKey = `affiliate_kyc_app_${currentUser.id || currentUser.email}`;
      sessionStorage.setItem(scopedKey, JSON.stringify(app));
      localStorage.setItem(scopedKey, JSON.stringify(app));
      localStorage.setItem('affiliate_kyc_application', JSON.stringify(app));
    } else {
      inMemoryApp = null;
      if (currentUser) {
        const scopedKey = `affiliate_kyc_app_${currentUser.id || currentUser.email}`;
        sessionStorage.removeItem(scopedKey);
        localStorage.removeItem(scopedKey);
      }
      sessionStorage.removeItem('current_session_affiliate_app');
      localStorage.removeItem('affiliate_kyc_application');
    }
  } catch (e) {}

  listeners.forEach((listener) => {
    try {
      listener(inMemoryApp);
    } catch (e) {}
  });
}

export function clearAffiliateApp() {
  const currentUser = getCurrentUserIdentifier();
  inMemoryApp = null;
  try {
    if (currentUser) {
      const scopedKey = `affiliate_kyc_app_${currentUser.id || currentUser.email}`;
      sessionStorage.removeItem(scopedKey);
      localStorage.removeItem(scopedKey);
    }
    sessionStorage.removeItem('current_session_affiliate_app');
    localStorage.removeItem('affiliate_kyc_application');
  } catch (e) {}

  listeners.forEach((listener) => {
    try {
      listener(null);
    } catch (e) {}
  });
}

export function subscribeAffiliateApp(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
