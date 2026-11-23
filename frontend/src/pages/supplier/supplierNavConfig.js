import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  RotateCcw,
  PlusCircle,
  Store,
  ShieldCheck,
  Banknote,
  LineChart,
  Star,
  Users,
} from 'lucide-react';

export const SUPPLIER_ROLES = {
  OWNER: {
    id: 'OWNER',
    label: 'Store Owner (Admin)',
    shortLabel: 'Owner',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Complete Access: Bank KYC, Financial Payouts, Staff Management, Orders & Catalog.',
    allowedTabs: [
      'overview',
      'inventory',
      'orders',
      'finance',
      'dropship',
      'returns',
      'reviews',
      'add-product',
      'kyc',
      'analytics',
      'profile',
      'staff',
    ],
  },
  DISPATCH_STAFF: {
    id: 'DISPATCH_STAFF',
    label: 'Warehouse & Dispatch Staff',
    shortLabel: 'Dispatch Staff',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Orders & Dispatch access: Packing slips, labels & courier manifest. Financial payouts & bank details hidden.',
    allowedTabs: [
      'orders',
      'dropship',
      'returns',
      'staff', // allow accessing staff switcher to test/switch
    ],
  },
  CATALOG_EXECUTIVE: {
    id: 'CATALOG_EXECUTIVE',
    label: 'Catalog & Inventory Executive',
    shortLabel: 'Catalog Staff',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Products & Inventory access: Add new products, update stock & variant matrix. Orders & payouts hidden.',
    allowedTabs: [
      'inventory',
      'add-product',
      'reviews',
      'staff', // allow accessing staff switcher to test/switch
    ],
  },
};

export const SUPPLIER_MENU = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/seller-web-dashboard1' },
  { id: 'inventory', label: 'Products & Catalog', icon: Package, path: '/supplier-inventory1' },
  { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingCart, path: '/supplier-orders1' },
  { id: 'finance', label: 'Settlements & Payouts 💳', icon: Banknote, path: '/supplier-settlements1' },
  { id: 'dropship', label: 'Dropship Fulfilment 📦', icon: Truck, path: '/supplier-dropship1' },
  { id: 'returns', label: 'Returns & RTO Hub 🔄', icon: RotateCcw, path: '/supplier-returns1' },
  { id: 'reviews', label: 'Ratings & Reviews ⭐', icon: Star, path: '/supplier-reviews1' },
  { id: 'add-product', label: 'Add New Product ➕', icon: PlusCircle, path: '/supplier-add-product1' },
  { id: 'kyc', label: 'Supplier KYC Hub 🛡️', icon: ShieldCheck, path: '/supplier-kyc1' },
  { id: 'analytics', label: 'Sales Analytics 📊', icon: LineChart, path: '/supplier-analytics1' },
  { id: 'profile', label: 'Store Profile & Bank', icon: Store, path: '/supplier-profile1' },
  { id: 'staff', label: 'Team & RBAC Permissions 👥', icon: Users, path: '/seller-web-dashboard1?tab=staff' },
];

const SUBROLE_STORAGE_KEY = 'mshoppy_supplier_subrole';

/**
 * Get active supplier sub-role from storage (defaults to OWNER)
 */
export function getStoredSupplierSubRole() {
  try {
    const role = localStorage.getItem(SUBROLE_STORAGE_KEY);
    if (role && SUPPLIER_ROLES[role]) return role;
  } catch (_) {}
  return 'OWNER';
}

/**
 * Set active supplier sub-role in storage
 */
export function setStoredSupplierSubRole(role) {
  try {
    if (role && SUPPLIER_ROLES[role]) {
      localStorage.setItem(SUBROLE_STORAGE_KEY, role);
      window.dispatchEvent(new CustomEvent('supplier_subrole_changed', { detail: role }));
      return true;
    }
  } catch (_) {}
  return false;
}

/**
 * Get filtered supplier navigation menu based on active role
 */
export function getSupplierMenuForRole(role = 'OWNER') {
  const roleConfig = SUPPLIER_ROLES[role] || SUPPLIER_ROLES.OWNER;
  const allowed = new Set(roleConfig.allowedTabs);
  return SUPPLIER_MENU.filter((item) => allowed.has(item.id));
}

/**
 * Check if a tab is allowed for a given role
 */
export function isTabAllowedForRole(tabId, role = 'OWNER') {
  const roleConfig = SUPPLIER_ROLES[role] || SUPPLIER_ROLES.OWNER;
  return roleConfig.allowedTabs.includes(tabId);
}
