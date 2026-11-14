import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier, fetchSupplierKyc } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { playOrderChime } from '../../utils/orderSoundChime';

import { SUPPLIER_MENU } from './supplierNavConfig';

// Tab Components (Mounted inside the persistent DashboardLayout without flickers)
import SupplierDashboardOverview from '../../components/supplier/dashboard/SupplierDashboardOverview';
import SellerInventory1 from './SellerInventory1';
import SellerOrders1 from './SellerOrders1';
import SellerSettlements1 from './SellerSettlements1';
import SellerDropship1 from './SellerDropship1';
import SellerReturns1 from './SellerReturns1';
import SellerReviews1 from './SellerReviews1';
import SellerAddProduct1 from './SellerAddProduct1';
import SellerKyc1 from './SellerKyc1';
import SellerAnalytics1 from './SellerAnalytics1';
import SellerProfile1 from './SellerProfile1';

export default function SellerWebDashboard1({ onNavigate, onBack, initialTab }) {
  const navigate = useNavigate();

  // Derive initial tab from URL or props
  const getTabFromLocation = useCallback(() => {
    if (initialTab) return initialTab;
    const path = window.location.pathname;
    const match = SUPPLIER_MENU.find((m) => m.path === path);
    return match ? match.id : 'overview';
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState(getTabFromLocation);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Data States for Overview
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync tab with URL on browser back/forward (SPA navigation)
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromLocation();
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getTabFromLocation]);

  // If initialTab prop changes externally
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle in-place tab switch without layout unmounting
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item && item.path) {
      if (window.location.pathname !== item.path) {
        window.history.pushState({ tab: tabId }, '', item.path);
      }
    }
  }, []);

  // In-dashboard Navigation Helper
  const handleNav = useCallback((path) => {
    const matched = SUPPLIER_MENU.find((m) => m.path === path);
    if (matched) {
      handleTabChange(matched.id);
      return;
    }
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  }, [handleTabChange, onNavigate, navigate]);

  // Fetch real data from backend for overview tab
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsRes, prodsRes, ordsRes, profRes, kycRes] = await Promise.allSettled([
        supplierApiService.fetchDashboardStats(),
        supplierApiService.fetchSupplierProducts({ limit: 10 }),
        supplierApiService.fetchSupplierOrders({ limit: 10 }),
        supplierApiService.fetchSupplierProfile(),
        fetchSupplierKyc(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }

      if (prodsRes.status === 'fulfilled' && prodsRes.value) {
        const rawProds = Array.isArray(prodsRes.value.products)
          ? prodsRes.value.products
          : Array.isArray(prodsRes.value.data)
          ? prodsRes.value.data
          : Array.isArray(prodsRes.value)
          ? prodsRes.value
          : [];
        setProducts(rawProds);
      }

      if (ordsRes.status === 'fulfilled' && ordsRes.value) {
        const rawOrders = Array.isArray(ordsRes.value.orders)
          ? ordsRes.value.orders
          : Array.isArray(ordsRes.value.data)
          ? ordsRes.value.data
          : Array.isArray(ordsRes.value)
          ? ordsRes.value
          : [];
        setOrders(rawOrders);
      }

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
      } else {
        const fallbackSupplier = getCurrentSupplier();
        if (fallbackSupplier) {
          setProfile(fallbackSupplier);
        }
      }

      if (kycRes.status === 'fulfilled' && kycRes.value) {
        setKycData(kycRes.value);
      }

      if (isRefresh) {
        toast.success('Supplier operations console updated');
      }
    } catch (err) {
      console.error('Error loading supplier console:', err);
      setError('Failed to refresh data from server. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Radar tracking in Master Hub
  const knownOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Background radar for incoming orders (every 20s) when not on orders tab
  useEffect(() => {
    const radarInterval = setInterval(async () => {
      // If currently on orders tab, SellerOrders1 handles its own real-time radar
      if (activeTab === 'orders') return;

      try {
        const res = await supplierApiService.fetchSupplierOrders({ limit: 10 });
        const list = Array.isArray(res?.orders)
          ? res.orders
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        if (isFirstLoadRef.current) {
          list.forEach((o) => knownOrderIdsRef.current.add(o.id));
          isFirstLoadRef.current = false;
        } else {
          const fresh = list.filter((o) => !knownOrderIdsRef.current.has(o.id));
          if (fresh.length > 0) {
            fresh.forEach((o) => knownOrderIdsRef.current.add(o.id));
            setOrders(list);
            playOrderChime();
            const topOrd = fresh[0];
            const displayId = String(topOrd.id).slice(-8).toUpperCase();
            const orderAmt = Number(topOrd.totalAmount || 0).toLocaleString('en-IN');
            toast.success(
              `🔔 New Order Received! #${displayId} (₹${orderAmt})`,
              {
                duration: 9000,
                description: `${fresh.length > 1 ? `+${fresh.length - 1} more order(s). ` : ''}Click to open Orders & Dispatch.`,
                action: {
                  label: 'View in Orders',
                  onClick: () => handleTabChange('orders'),
                },
              }
            );
          }
        }
      } catch (_) {}
    }, 20000);

    return () => clearInterval(radarInterval);
  }, [activeTab, handleTabChange]);

  // Safe Logout Handler
  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) {
        await supplierApiService.logoutSupplier().catch(() => {});
      }
      if (auth) {
        await signOut(auth).catch(() => {});
      }
    } catch (err) {
      console.warn('Logout cleanup warning:', err);
    } finally {
      clearAuthSession();
      localStorage.removeItem('meesho_supplier_token');
      localStorage.removeItem('meesho_supplier_user');
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplier');
      sessionStorage.clear();
      toast.success('Successfully logged out of Supplier portal');
      handleNav('/supplier-login');
    }
  };

  const supplierDisplayName =
    (typeof profile?.storeName === 'string' && profile.storeName.trim()) ||
    (typeof profile?.fullName === 'string' && profile.fullName.trim()) ||
    (typeof profile?.name === 'string' && profile.name.trim()) ||
    'Verified Supplier';

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <SupplierDashboardOverview
          onNavigateTab={handleTabChange}
          stats={stats}
          products={products}
          orders={orders}
          profile={profile}
          kycData={kycData}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => loadDashboardData(true)}
        />
      )}

      {/* 2. Inventory / Products Catalog Tab */}
      {activeTab === 'inventory' && (
        <SellerInventory1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 3. Orders & Dispatch Tab */}
      {activeTab === 'orders' && (
        <SellerOrders1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 4. Settlements & Payouts Tab */}
      {activeTab === 'finance' && (
        <SellerSettlements1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 5. Dropship Fulfillment Tab */}
      {activeTab === 'dropship' && (
        <SellerDropship1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 6. Returns & RTO Hub Tab */}
      {activeTab === 'returns' && (
        <SellerReturns1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 6b. Customer Ratings & Reviews Tab */}
      {activeTab === 'reviews' && (
        <SellerReviews1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 7. Add Product Tab */}
      {activeTab === 'add-product' && (
        <SellerAddProduct1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 8. Supplier KYC Hub Tab */}
      {activeTab === 'kyc' && (
        <SellerKyc1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 9. Sales Analytics Tab */}
      {activeTab === 'analytics' && (
        <SellerAnalytics1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* 10. Store Profile & Bank Tab */}
      {activeTab === 'profile' && (
        <SellerProfile1 embedded onNavigate={handleNav} onNavigateTab={handleTabChange} />
      )}

      {/* Confirmation Dialog for Secure Supplier Logout */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
        title="Log out of Supplier Portal?"
        description="Are you sure you want to end your supplier session? You can log back in at any time with your credentials."
        confirmText="Yes, Logout"
      />
    </DashboardLayout>
  );
}
