import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Truck,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Lock,
  Eye,
  KeyRound,
  Building,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  MapPin,
  ExternalLink,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SUPPLIER_ROLES,
  getStoredSupplierSubRole,
  setStoredSupplierSubRole,
  isTabAllowedForRole
} from '../../../pages/supplier/supplierNavConfig';

const STAFF_STORAGE_KEY = 'mshoppy_supplier_staff_members';

const DEFAULT_STAFF = [
  {
    id: 'staff-1',
    name: 'Ramesh Agarwal',
    email: 'ramesh.owner@sareestore.com',
    phone: '+91 98765 43210',
    role: 'OWNER',
    station: 'Head Office & Main Hub',
    status: 'ACTIVE',
    dateAdded: '2026-01-15'
  },
  {
    id: 'staff-2',
    name: 'Suresh Verma',
    email: 'suresh.dispatch@sareestore.com',
    phone: '+91 98221 11223',
    role: 'DISPATCH_STAFF',
    station: 'Surat Dispatch Bay 2',
    status: 'ACTIVE',
    dateAdded: '2026-02-10'
  },
  {
    id: 'staff-3',
    name: 'Priya Sen',
    email: 'priya.catalog@sareestore.com',
    phone: '+91 98112 33445',
    role: 'CATALOG_EXECUTIVE',
    station: 'Catalog & Studio Desk',
    status: 'ACTIVE',
    dateAdded: '2026-03-01'
  }
];

// Feature matrix mapping
const PERMISSIONS_MATRIX = [
  {
    category: 'Finance & Bank Verification',
    items: [
      {
        feature: 'Bank Account & Penny Drop KYC',
        desc: 'Bank account number, IFSC verification & Penny drop status',
        owner: true,
        dispatch: false,
        catalog: false,
        note: 'Protected for store owner only'
      },
      {
        feature: 'Financial Payouts & 7-Day Cycle',
        desc: '0% commission ledger, TDS deduction, Escrow balance & Payout history',
        owner: true,
        dispatch: false,
        catalog: false,
        note: 'Financial payouts & ledger hidden'
      },
      {
        feature: 'Store Bank Details & Profile Settings',
        desc: 'Edit GSTIN, business legal name, and beneficiary account',
        owner: true,
        dispatch: false,
        catalog: false,
        note: 'Owner authorization required'
      }
    ]
  },
  {
    category: 'Orders & Logistics Handover (4-Stage Pipeline)',
    items: [
      {
        feature: 'Order Pipeline & Live Melodic Chime',
        desc: 'Incoming orders radar, review, and Accept Order flow',
        owner: true,
        dispatch: true,
        catalog: false,
        note: 'Primary duty for dispatch staff'
      },
      {
        feature: 'Print 4x6 Thermal Shipping Labels & Invoices',
        desc: 'Step 3: AWB barcode label download & thermal print',
        owner: true,
        dispatch: true,
        catalog: false,
        note: 'High-speed batch printing enabled'
      },
      {
        feature: 'Pickup Manifest & Courier Handover',
        desc: 'Step 4: Generate sign-off sheet for Delhivery / Shadowfax rider',
        owner: true,
        dispatch: true,
        catalog: false,
        note: 'Handover verification desk'
      },
      {
        feature: 'Returns & RTO Hub (₹0 Penalty Check)',
        desc: 'Inspect undelivered RTO parcels and customer exchange packets',
        owner: true,
        dispatch: true,
        catalog: false,
        note: 'Doorstep RTO parcel inspection'
      },
      {
        feature: 'Wrong Return Safety Claim Desk (SPF)',
        desc: 'File unboxing photo/video proof for compensation from Meesho',
        owner: true,
        dispatch: true,
        catalog: false,
        note: 'Claim compensation desk'
      }
    ]
  },
  {
    category: 'Catalog & Inventory Management',
    items: [
      {
        feature: 'Single Product Add with Dynamic Toggles',
        desc: 'Enable Size/Color for apparel; auto-disable for electronics/cosmetics',
        owner: true,
        dispatch: false,
        catalog: true,
        note: 'Full catalog editing access'
      },
      {
        feature: 'Multi-Variant Stock Matrix',
        desc: 'Size × Color × Stock per SKU with Out-of-Stock protection',
        owner: true,
        dispatch: false,
        catalog: true,
        note: 'Real-time warehouse stock sync'
      },
      {
        feature: 'Bulk CSV / Excel Catalog Upload',
        desc: 'Download CSV template and upload 50-100 products in 1-click',
        owner: true,
        dispatch: false,
        catalog: true,
        note: 'Bulk ingestion engine'
      },
      {
        feature: 'Customer Reviews & Quality Ratings',
        desc: 'Monitor customer feedback, photos, and ratings on products',
        owner: true,
        dispatch: false,
        catalog: true,
        note: 'Product improvement insights'
      }
    ]
  },
  {
    category: 'Team & Store Management',
    items: [
      {
        feature: 'Team Roles & Permissions (RBAC)',
        desc: 'Invite staff members, assign roles & revoke access',
        owner: true,
        dispatch: false,
        catalog: false,
        note: 'Role preview simulator available'
      }
    ]
  }
];

export default function SellerStaffManagement({ currentSubRole: propRole, onRoleChange }) {
  const [activeRole, setActiveRole] = useState(() => propRole || getStoredSupplierSubRole());
  const [staffList, setStaffList] = useState(() => {
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return DEFAULT_STAFF;
  });

  const [activeViewTab, setActiveViewTab] = useState('simulator'); // 'simulator' | 'matrix' | 'roster' | 'comparison'
  const [filterRole, setFilterRole] = useState('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'DISPATCH_STAFF',
    station: ''
  });

  // Sync prop changes
  useEffect(() => {
    if (propRole && propRole !== activeRole) {
      setActiveRole(propRole);
    }
  }, [propRole]);

  // Persist staff changes
  const saveStaffList = (updated) => {
    setStaffList(updated);
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleSelectRole = (roleKey) => {
    if (!SUPPLIER_ROLES[roleKey]) return;
    setStoredSupplierSubRole(roleKey);
    setActiveRole(roleKey);
    if (onRoleChange) {
      onRoleChange(roleKey);
    }
    const roleCfg = SUPPLIER_ROLES[roleKey];
    toast.success(`Role Mode Switched: ${roleCfg.label}`, {
      description: roleCfg.description,
      duration: 4000
    });
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.phone.trim()) {
      toast.error('Please enter Staff Name and Mobile number');
      return;
    }

    const created = {
      id: `staff-${Date.now()}`,
      name: newStaff.name.trim(),
      email: newStaff.email.trim() || `${newStaff.name.toLowerCase().replace(/\s+/g, '.')}@store.in`,
      phone: newStaff.phone.trim(),
      role: newStaff.role,
      station: newStaff.station.trim() || 'Main Station',
      status: 'ACTIVE',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    const updated = [created, ...staffList];
    saveStaffList(updated);
    setShowInviteModal(false);
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: 'DISPATCH_STAFF',
      station: ''
    });
    toast.success(`Staff member "${created.name}" invited successfully!`, {
      description: `Assigned Role: ${SUPPLIER_ROLES[created.role]?.label || created.role}`
    });
  };

  const handleDeleteStaff = (id, name) => {
    if (staffList.length <= 1) {
      toast.error('Cannot remove the last staff member');
      return;
    }
    const updated = staffList.filter((s) => s.id !== id);
    saveStaffList(updated);
    toast.info(`Staff member "${name}" removed`);
  };

  const filteredStaff = staffList.filter((s) => {
    if (filterRole === 'ALL') return true;
    return s.role === filterRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HERO BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-pink-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-pink-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>Meesho Standard Store RBAC System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Supplier Roles & Access Control
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Isolate sensitive financial payouts and bank KYC from dispatch workers, while empowering 
              warehouse operators with high-speed packing slips, courier manifests, and RTO desks.
            </p>
          </div>

          {/* Active Preview Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shrink-0 md:min-w-[280px]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Currently Previewing As:
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">
                {activeRole === 'OWNER' ? '👑' : activeRole === 'DISPATCH_STAFF' ? '🚚' : '📦'}
              </span>
              <div>
                <p className="font-extrabold text-white text-base leading-snug">
                  {SUPPLIER_ROLES[activeRole]?.label}
                </p>
                <p className="text-[11px] text-pink-200">
                  {activeRole === 'OWNER'
                    ? '12 of 12 Features Unlocked'
                    : activeRole === 'DISPATCH_STAFF'
                    ? 'Orders & Dispatch Only'
                    : 'Catalog & Stock Only'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveViewTab('simulator')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'simulator'
                ? 'bg-pink-600 text-white shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Role Simulator</span>
          </button>

          <button
            onClick={() => setActiveViewTab('matrix')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'matrix'
                ? 'bg-pink-600 text-white shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Permissions Matrix (Side-by-Side)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('roster')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'roster'
                ? 'bg-pink-600 text-white shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Roster ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('comparison')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'comparison'
                ? 'bg-pink-600 text-white shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Supplier vs Dropshipper vs Logistics Farq</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT 1: LIVE 1-CLICK ROLE SIMULATOR */}
      {activeViewTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900">
              <strong className="font-bold">Live Role Preview Engine:</strong> Select any of the 3 roles below to 
              test how the supplier console adapts in real-time. Notice how sidebar menu tabs, financial balances, 
              and catalog controls instantly appear or lock based on selected privilege.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Role 1: Store Owner */}
            <div
              onClick={() => handleSelectRole('OWNER')}
              className={`rounded-2xl p-6 transition-all cursor-pointer border-2 relative flex flex-col justify-between ${
                activeRole === 'OWNER'
                  ? 'bg-white border-emerald-500 shadow-xl ring-4 ring-emerald-500/10'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {activeRole === 'OWNER' && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Active View</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
                  👑
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Store Owner (Admin)</h3>
                  <p className="text-xs text-slate-500 mt-1">Complete Store Authority</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full control over Bank Account KYC, Financial Settlements, 0% Commission calculations, 
                  Staff invitations, and all product/orders operations.
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bank KYC & Penny Drop Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Financial Payouts & 7-Day Transfers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Staff & Role Access Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Orders, Shipping Labels & Pickup Manifest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Catalog, Variants & Bulk Upload</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeRole === 'OWNER'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {activeRole === 'OWNER' ? 'Currently Active' : 'Switch to Store Owner'}
              </button>
            </div>

            {/* Role 2: Warehouse / Dispatch Staff */}
            <div
              onClick={() => handleSelectRole('DISPATCH_STAFF')}
              className={`rounded-2xl p-6 transition-all cursor-pointer border-2 relative flex flex-col justify-between ${
                activeRole === 'DISPATCH_STAFF'
                  ? 'bg-white border-blue-500 shadow-xl ring-4 ring-blue-500/10'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {activeRole === 'DISPATCH_STAFF' && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Active View</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-2xl shadow-xs">
                  🚚
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Warehouse / Dispatch Staff</h3>
                  <p className="text-xs text-slate-500 mt-1">Order Fulfilment & Handover Only</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focused on packing, downloading 4x6 thermal shipping labels, handing over parcels 
                  to courier riders with pickup manifests, and inspecting RTO packages.
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Live Melodic Chime & Order Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Download Packing Slips & AWB Labels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Courier Pickup Manifest & Handover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Returns & RTO Zero-Penalty Check</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-medium">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Financial Payouts & Bank Details Hidden</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-medium">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Catalog Creation / Pricing Hidden</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeRole === 'DISPATCH_STAFF'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {activeRole === 'DISPATCH_STAFF' ? 'Currently Active' : 'Switch to Dispatch Staff'}
              </button>
            </div>

            {/* Role 3: Catalog Executive */}
            <div
              onClick={() => handleSelectRole('CATALOG_EXECUTIVE')}
              className={`rounded-2xl p-6 transition-all cursor-pointer border-2 relative flex flex-col justify-between ${
                activeRole === 'CATALOG_EXECUTIVE'
                  ? 'bg-white border-purple-500 shadow-xl ring-4 ring-purple-500/10'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {activeRole === 'CATALOG_EXECUTIVE' && (
                <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Active View</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-2xl shadow-xs">
                  📦
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Catalog Executive</h3>
                  <p className="text-xs text-slate-500 mt-1">Products & Inventory Authority</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Responsible for listing new apparel & non-apparel items, managing the multi-variant matrix 
                  (Size × Color × Stock), and bulk Excel/CSV product uploads.
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Single Product Add with Dynamic Toggles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Multi-Variant Matrix (Size × Color × SKU)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Bulk Catalog Upload (Excel / CSV)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Real-time Out-of-Stock Protection</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-medium">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Orders & Customer Addresses Hidden</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-medium">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Bank KYC & Settlements Hidden</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeRole === 'CATALOG_EXECUTIVE'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {activeRole === 'CATALOG_EXECUTIVE' ? 'Currently Active' : 'Switch to Catalog Executive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT 2: PERMISSIONS MATRIX (SIDE-BY-SIDE) */}
      {activeViewTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Meesho Role & Permission Comparison Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed side-by-side entitlement breakdown for internal supplier store users.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Full Access
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <Lock className="w-3.5 h-3.5 text-rose-500" /> Restricted & Hidden
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6 w-1/3">Feature / Module</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      👑 Owner (Admin)
                    </span>
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      🚚 Dispatch Staff
                    </span>
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-md">
                      📦 Catalog Exec
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-slate-500">Security Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSIONS_MATRIX.map((cat, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="bg-slate-50/60 font-bold text-slate-800 text-xs">
                      <td colSpan={5} className="py-2.5 px-4 sm:px-6 uppercase tracking-wider text-[10.5px] text-pink-700 bg-pink-50/40">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 sm:px-6">
                          <p className="font-bold text-slate-900 text-xs">{item.feature}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                        </td>
                        
                        {/* Owner Column */}
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          {item.owner ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>

                        {/* Dispatch Column */}
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          {item.dispatch ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-400" title="Restricted for dispatch workers">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>

                        {/* Catalog Column */}
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          {item.catalog ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-400" title="Restricted for catalog staff">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>

                        {/* Security Note */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-500 italic">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT 3: TEAM ROSTER */}
      {activeViewTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter By Role:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="ALL">All Roles ({staffList.length})</option>
                <option value="OWNER">Store Owners</option>
                <option value="DISPATCH_STAFF">Dispatch Staff</option>
                <option value="CATALOG_EXECUTIVE">Catalog Executives</option>
              </select>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite New Team Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((member) => {
              const roleConfig = SUPPLIER_ROLES[member.role] || SUPPLIER_ROLES.OWNER;
              const isCurrentlyActiveSim = activeRole === member.role;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 border ${roleConfig.badgeClass}`}>
                            {roleConfig.label}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.station}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {member.status}
                    </span>

                    <button
                      onClick={() => handleSelectRole(member.role)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        isCurrentlyActiveSim
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-700'
                      }`}
                    >
                      <span>{isCurrentlyActiveSim ? 'Simulating' : 'Simulate Role'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT 4: COMPARISON WITH DROPSHIPPER & LOGISTICS (USER REQUEST REFERENCE) */}
      {activeViewTab === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-black text-slate-900">
              📌 Meesho Ecosystem Ecosystem: Supplier vs Dropshipper vs Logistics Farq
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Meesho ke 3 distinct portals ka operational and revenue model comparison.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  <th className="py-3 px-4">Feature / Aspect</th>
                  <th className="py-3 px-4 bg-pink-50/70 text-[#b7004d]">Supplier Portal (supplier.)</th>
                  <th className="py-3 px-4 bg-purple-50/70 text-purple-900">Dropshipper Portal (dropshipper.)</th>
                  <th className="py-3 px-4 bg-blue-50/70 text-blue-900">Logistics Portal (logistics.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">Target User</td>
                  <td className="py-3.5 px-4 font-semibold text-pink-700">Manufacturer / Wholesaler (Warehouse)</td>
                  <td className="py-3.5 px-4 font-semibold text-purple-700">Reseller / Influencer (No Stock)</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-700">Delivery Driver / Courier Hub Rider</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">Main Action</td>
                  <td className="py-3.5 px-4 text-slate-700">Product manufacture, pack & dispatch with shipping label</td>
                  <td className="py-3.5 px-4 text-slate-700">Margin add karke product promote & share karna</td>
                  <td className="py-3.5 px-4 text-slate-700">Parcel pick, barcode scan, transit & doorstep delivery</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">Kamayi (Earnings)</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Wholesale Product Price (0% Commission)</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Reseller Margin (Selling Price - Wholesale)</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Per Delivery Fee / Shipping Commission</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">Physical Stock</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">✅ Khud ka physical warehouse stock</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">❌ Zero physical stock (Supplier bhejta hai)</td>
                  <td className="py-3.5 px-4 text-blue-700 font-bold">📦 Sirf in-transit sealed packet</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">Key Responsibility</td>
                  <td className="py-3.5 px-4 text-slate-600">Product quality, accurate size matrix, timely packing</td>
                  <td className="py-3.5 px-4 text-slate-600">Customer acquisition, marketing & sales generation</td>
                  <td className="py-3.5 px-4 text-slate-600">Doorstep OTP delivery, cash collection (COD), RTO return</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. INVITE NEW TEAM MEMBER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#b7004d] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Invite Team Member</h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (+91) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="rahul.dispatch@store.in"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Sub-Role *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium bg-white"
                >
                  <option value="DISPATCH_STAFF">🚚 Warehouse & Dispatch Staff (Packing & Manifest)</option>
                  <option value="CATALOG_EXECUTIVE">📦 Catalog Executive (Products & Stock Matrix)</option>
                  <option value="OWNER">👑 Store Co-Owner / Admin (Complete Authority)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {newStaff.role === 'DISPATCH_STAFF' && 'Financial payouts and KYC will be securely hidden.'}
                  {newStaff.role === 'CATALOG_EXECUTIVE' && 'Customer order details and finances will be hidden.'}
                  {newStaff.role === 'OWNER' && 'Full store administrative access will be granted.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Location / Workstation</label>
                <input
                  type="text"
                  placeholder="e.g. Packing Table 4 / Bhiwandi Unit 2"
                  value={newStaff.station}
                  onChange={(e) => setNewStaff({ ...newStaff, station: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save & Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
