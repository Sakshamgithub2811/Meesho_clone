import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentSupplier, saveAuthSession, clearAuthSession } from '../services/supplierApiService';
import { updateProfileSuccess, logout } from '../redux/userSlice';

/**
 * useSupplierSessionSync
 * ----------------------------------------------------
 * Solves LocalStorage vs Redux State Desync across:
 * 1. Active tab components (via CustomEvent 'supplier-profile-updated')
 * 2. Multi-browser tabs (via native window 'storage' event)
 * 3. Redux store (dispatches updateProfileSuccess / logout)
 */
export function useSupplierSessionSync(initialProfile = null) {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user?.currentUser);

  // Initialize from props, redux, or localStorage
  const [profile, setProfile] = useState(() => {
    return initialProfile || reduxUser || getCurrentSupplier() || null;
  });

  // Sync if initialProfile changes from server fetch
  useEffect(() => {
    if (initialProfile) {
      setProfile((prev) => ({ ...(prev || {}), ...initialProfile }));
    }
  }, [initialProfile]);

  // Synchronize across active components and multi-tab windows
  useEffect(() => {
    // 1. Same-window custom event handler
    const handleLocalProfileUpdate = (event) => {
      if (event?.detail) {
        setProfile((prev) => ({ ...(prev || {}), ...event.detail }));
      }
    };

    // 2. Same-window session cleared handler
    const handleLocalSessionCleared = () => {
      setProfile(null);
    };

    // 3. Multi-tab storage event handler (triggered by browser when another tab writes localStorage)
    const handleStorageChange = (event) => {
      if (event.key === 'meesho_supplier_user' || event.key === 'supplier') {
        if (event.newValue) {
          try {
            const updated = JSON.parse(event.newValue);
            setProfile((prev) => ({ ...(prev || {}), ...updated }));
            dispatch(updateProfileSuccess(updated));
          } catch (err) {
            console.warn('Cross-tab profile sync parse error:', err);
          }
        } else if (!event.newValue && event.oldValue) {
          // Supplier logged out in another tab
          setProfile(null);
          dispatch(logout());
        }
      }
    };

    window.addEventListener('supplier-profile-updated', handleLocalProfileUpdate);
    window.addEventListener('supplier-session-cleared', handleLocalSessionCleared);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('supplier-profile-updated', handleLocalProfileUpdate);
      window.removeEventListener('supplier-session-cleared', handleLocalSessionCleared);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  // Reactive state updater that persists to storage, fires broadcast & syncs Redux
  const updateProfile = useCallback(
    (newProfileData) => {
      setProfile((prev) => {
        const merged = { ...(prev || {}), ...newProfileData };
        saveAuthSession(null, merged);
        return merged;
      });
    },
    []
  );

  const clearSession = useCallback(() => {
    setProfile(null);
    clearAuthSession();
  }, []);

  const displayName =
    (typeof profile?.storeName === 'string' && profile.storeName.trim()) ||
    (typeof profile?.fullName === 'string' && profile.fullName.trim()) ||
    (typeof profile?.name === 'string' && profile.name.trim()) ||
    'Verified Supplier';

  return {
    profile,
    setProfile,
    updateProfile,
    clearSession,
    displayName,
  };
}

export default useSupplierSessionSync;
