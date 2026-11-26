import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier, fetchSupplierKyc } from '../../services/supplierApiService';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { playOrderChime } from '../../utils/orderSoundChime';

import {
  SUPPLIER_MENU,
  SUPPLIER_ROLES,
  getStoredSupplierSubRole,
  setStoredSupplierSubRole,
  getSupplierMenuForRole,
  isTabAllowedForRole,
} from './supplierNavConfig';
import { Sparkles, ShieldAlert } from 'lucide-react';

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
import SellerStaffManagement from '../../components/supplier/staff/SellerStaffManagement';

export default function SellerWebDashboard1({ onNavigate, onBack, initialTab }) {
  const navigate = useNavigate();

  // Derive initial tab from URL or props
  const getTabFromLocation = useCallback(() => {
    if (initialTab) return initialTab;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam) return tabParam;
    } catch (_) {}
    const path = window.location.pathname;
    const match = SUPPLIER_MENU.find((m) => m.path === path);
    return match ? match.id : 'overview';
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState(getTabFromLocation);
  const [currentSubRole, setCurrentSubRole] = useState(getStoredSupplierSubRole);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Data States for Overview
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(() => getCurrentSupplier() || null);
  const [kycData, setKycData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Reactive Supplier Profile & Session Sync (Same Window + Cross-Tab)
  useEffect(() => {
    // 1. Same-window custom event from profile forms, API service, or Redux updates
    const handleProfileUpdate = (event) => {
      if (event?.detail) {
        setProfile((prev) => ({ ...(prev || {}), ...event.detail }));
      }
    };

    // 2. Same-window session cleared event
    const handleSessionCleared = () => {
      setProfile(null);
    };

    // 3. Cross-tab storage event (fired by browser in other tabs when localStorage is updated)
    const handleStorageChange = (event) => {
      if (event.key === 'meesho_supplier_user' || event.key === 'supplier') {
        if (event.newValue) {
          try {
            const updated = JSON.parse(event.newValue);
            setProfile((prev) => ({ ...(prev || {}), ...updated }));
          } catch (e) {
            console.warn('Cross-tab profile sync error in dashboard:', e);
          }
        } else if (!event.newValue && event.oldValue) {
          // Logged out in another tab
          setProfile(null);
          toast.info('Supplier session closed in another window');
        }
      }
    };

    window.addEventListener('supplier-profile-updated', handleProfileUpdate);
    window.addEventListener('supplier-session-cleared', handleSessionCleared);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('supplier-profile-updated', handleProfileUpdate);
      window.removeEventListener('supplier-session-cleared', handleSessionCleared);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle in-place tab switch without layout unmounting
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    const targetUrl =
      item?.path ||
      (tabId === 'overview' ? '/supplier/dashboard' : `/supplier/dashboard?tab=${tabId}`);
    const currentFullUrl = window.location.pathname + window.location.search;
    if (currentFullUrl !== targetUrl) {
      window.history.pushState({ tab: tabId }, '', targetUrl);
    }
  }, []);

  // React to sub-role change events across components/tabs
  useEffect(() => {
    const handleRoleChanged = (e) => {
      const nextRole = e?.detail || getStoredSupplierSubRole();
      setCurrentSubRole(nextRole);
      // If currently active tab is not allowed in new role, redirect to first allowed tab
      if (!isTabAllowedForRole(activeTab, nextRole)) {
        const allowed = SUPPLIER_ROLES[nextRole]?.allowedTabs || ['overview'];
        handleTabChange(allowed[0]);
      }
    };
    window.addEventListener('supplier_subrole_changed', handleRoleChanged);
    return () => window.removeEventListener('supplier_subrole_changed', handleRoleChanged);
  }, [activeTab, handleTabChange]);

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
      }

      if (kycRes.status === 'fulfilled' && kycRes.value) {
        const raw = kycRes.value;
        const actualKyc = raw?.kyc || raw;
        const isVerified = Boolean(
          raw?.isVerified ||
          actualKyc?.status === 'APPROVED' ||
          raw?.status === 'APPROVED' ||
          profRes.value?.profile?.tierLabel?.toLowerCase().includes('verified')
        );
        const resolvedStatus = isVerified
          ? 'APPROVED'
          : (actualKyc?.status || raw?.status || 'NOT_SUBMITTED').toUpperCase();

        setKycData({
          ...(actualKyc && typeof actualKyc === 'object' ? actualKyc : {}),
          status: resolvedStatus,
          isVerified,
          kyc: actualKyc,
        });
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

  // Background radar for incoming orders (every 8s) when not on orders tab
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
    }, 8000);

    return () => clearInterval(radarInterval);
  }, [activeTab, handleTabChange]);

  // Real-Time Cross-Tab Broadcast listener (0ms latency for orders placed in same browser)
  useEffect(() => {
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('mshoppy_order_events');
        bc.onmessage = (event) => {
          if (event.data?.type === 'ORDER_PLACED') {
            playOrderChime();
            loadDashboardData(false);
          }
        };
      }
    } catch (_) {}

    return () => {
      try {
        if (bc) bc.close();
      } catch (_) {}
    };
  }, [loadDashboardData]);

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
      handleNav('/supplier/auth/login');
    }
  };

  const supplierDisplayName =
    (typeof profile?.storeName === 'string' && profile.storeName.trim()) ||
    (typeof profile?.fullName === 'string' && profile.fullName.trim()) ||
    (typeof profile?.name === 'string' && profile.name.trim()) ||
    'Verified Supplier';

  const currentRoleConfig = SUPPLIER_ROLES[currentSubRole] || SUPPLIER_ROLES.OWNER;
  const isAllowed = isTabAllowedForRole(activeTab, currentSubRole);

  const activeMenuItems = React.useMemo(() => {
    return getSupplierMenuForRole(currentSubRole);
  }, [currentSubRole]);

  return (
    <DashboardLayout
      menuItems={activeMenuItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      roleName={`SUPPLIER • ${currentRoleConfig.shortLabel}`}
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {/* Active Sub-Role Status Pill Banner */}
      <div className="mb-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Store RBAC Role:</span>
          <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full border ${currentRoleConfig.badgeClass}`}>
            <span>{currentSubRole === 'OWNER' ? '👑' : currentSubRole === 'DISPATCH_STAFF' ? '🚚' : '📦'}</span>
            <span>{currentRoleConfig.label}</span>
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-500 text-[11px] truncate max-w-md">
            {currentRoleConfig.description}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleTabChange('staff')}
          className="inline-flex items-center gap-1.5 font-bold text-pink-700 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-lg transition cursor-pointer text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Switch / Test RBAC Roles</span>
        </button>
      </div>

      {!isAllowed ? (
        <div className="max-w-2xl mx-auto my-10 bg-white rounded-2xl border border-rose-200 p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Access Restricted: Role Permission Required
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your current assigned sub-role <strong className="text-slate-900 font-bold">{currentRoleConfig.label}</strong> does not have permission to access the <strong className="text-pink-600 font-bold uppercase">{activeTab}</strong> section.
          </p>
          <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-500 text-left border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-700">🔒 Security Boundary:</p>
            <p>• Warehouse Dispatch Staff only has access to Orders, Labels, Manifest, and RTO.</p>
            <p>• Catalog Executive only has access to Products & Inventory.</p>
            <p>• Financial Payouts & Bank Details are reserved strictly for the Store Owner (Admin).</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const allowed = currentRoleConfig.allowedTabs || ['overview'];
                handleTabChange(allowed[0]);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Go to Allowed Work Area
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('staff')}
              className="px-5 py-2.5 rounded-xl bg-[#b7004d] text-white font-bold text-xs hover:bg-[#92003d] transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open RBAC Simulator</span>
            </button>
          </div>
        </div>
      ) : (
        <>
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

          {/* 11. Team & RBAC Permissions Tab */}
          {activeTab === 'staff' && (
            <SellerStaffManagement
              currentSubRole={currentSubRole}
              onRoleChange={(newRole) => {
                setStoredSupplierSubRole(newRole);
                setCurrentSubRole(newRole);
              }}
            />
          )}
        </>
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
