import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  RotateCcw,
  PlusCircle,
  Store,
  ShieldCheck,
} from 'lucide-react';

export const SUPPLIER_MENU = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/seller-web-dashboard1' },
  { id: 'inventory', label: 'Products & Catalog', icon: Package, path: '/supplier-inventory1' },
  { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingCart, path: '/supplier-orders1' },
  { id: 'dropship', label: 'Dropship Fulfilment', icon: Truck, path: '/supplier-dropship1' },
  { id: 'returns', label: 'Returns & RTO Hub', icon: RotateCcw, path: '/supplier-returns1' },
  { id: 'add-product', label: 'Add New Product', icon: PlusCircle, path: '/supplier-add-product1' },
  { id: 'kyc', label: 'Supplier KYC Hub', icon: ShieldCheck, path: '/supplier-kyc1' },
  { id: 'profile', label: 'Store Profile & KYC', icon: Store, path: '/supplier-profile1' },
];
