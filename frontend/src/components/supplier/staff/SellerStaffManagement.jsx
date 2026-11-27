import React, { useState, useEffect, useMemo } from 'react';
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
  UserPlus,
  Sliders,
  Save,
  Search,
  Filter,
  Layers,
  X,
  Store,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SUPPLIER_ROLES,
  getStoredSupplierSubRole,
  setStoredSupplierSubRole,
  getStoredSupplierPermissions,
  setStoredSupplierPermissions,
  isTabAllowedForRole
} from '../../../pages/supplier/supplierNavConfig';
import supplierApiService from '../../../services/supplierApiService';

// Full 12 Granular Permissions Matrix matching Meesho standard modules
export const ALL_PERMISSIONS_LIST = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    category: 'Dashboard & Metrics',
    desc: 'Live incoming orders chime, key performance indicators & daily gross revenue',
    badge: 'Overview',
    icon: '📊'
  },
  {
    id: 'inventory',
    label: 'Products & Inventory',
    category: 'Catalog & Inventory',
    desc: 'Manage products, variant matrix (Size × Color × Stock), and bulk actions',
    badge: 'Catalog',
    icon: '📦'
  },
  {
    id: 'add-product',
    label: 'Add New Products',
    category: 'Catalog & Inventory',
    desc: 'Single product creation with dynamic specs & bulk CSV/Excel catalog upload',
    badge: 'Add Product',
    icon: '➕'
  },
  {
    id: 'orders',
    label: 'Orders & Dispatch',
    category: 'Orders & Fulfillment',
    desc: 'Incoming order pipeline, 4x6 thermal shipping labels & courier pickup manifest',
    badge: 'Orders',
    icon: '🛒'
  },
  {
    id: 'finance',
    label: 'Settlements & Payouts',
    category: 'Finance & Bank',
    desc: '0% commission ledger, TDS deduction, Escrow balance & 7-day payout withdrawals',
    badge: 'Finance',
    icon: '💳'
  },
  {
    id: 'dropship',
    label: 'Dropship Fulfillment',
    category: 'Orders & Fulfillment',
    desc: 'B2B orders, wholesale catalog sync & marketplace dropship dispatch',
    badge: 'Dropship',
    icon: '🚚'
  },
  {
    id: 'returns',
    label: 'Returns & RTO Hub',
    category: 'Orders & Fulfillment',
    desc: 'Doorstep parcel inspection, ₹0 penalty checks & Wrong Return SPF safety claims',
    badge: 'Returns',
    icon: '🔄'
  },
  {
    id: 'reviews',
    label: 'Ratings & Reviews',
    category: 'Customer Experience',
    desc: 'Customer ratings, verified reviews & unboxing photo feedback monitor',
    badge: 'Reviews',
    icon: '⭐'
  },
  {
    id: 'kyc',
    label: 'Supplier KYC Hub',
    category: 'Business Compliance',
    desc: 'GSTIN, PAN verification, Bank account penny-drop & Warehouse address docs',
    badge: 'KYC',
    icon: '🛡️'
  },
  {
    id: 'analytics',
    label: 'Sales Analytics',
    category: 'Dashboard & Metrics',
    desc: 'Comprehensive sales analytics, revenue trends & top-performing SKUs',
    badge: 'Analytics',
    icon: '📈'
  },
  {
    id: 'profile',
    label: 'Store Profile & Bank',
    category: 'Store Settings',
    desc: 'Edit legal business name, registered GSTIN, and beneficiary bank account',
    badge: 'Profile',
    icon: '🏪'
  },
  {
    id: 'staff',
    label: 'Team & RBAC Permissions',
    category: 'Store Settings',
    desc: 'Manage store staff accounts, customize roles & grant/revoke granular permissions',
    badge: 'RBAC',
    icon: '👥'
  }
];

export const ROLE_PRESET_MAP = {
  OWNER: {
    label: 'Store Owner (Admin)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    permissions: [
      'overview', 'inventory', 'add-product', 'orders', 'finance',
      'dropship', 'returns', 'reviews', 'kyc', 'analytics', 'profile', 'staff'
    ]
  },
  DISPATCH_STAFF: {
    label: 'Warehouse & Dispatch Staff',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    permissions: ['orders', 'dropship', 'returns', 'staff']
  },
  CATALOG_EXECUTIVE: {
    label: 'Catalog & Inventory Executive',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    permissions: ['inventory', 'add-product', 'reviews', 'staff']
  },
  FINANCE_ACCOUNTS: {
    label: 'Finance & Accounts Specialist',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    permissions: ['overview', 'finance', 'analytics', 'staff']
  },
  CUSTOM: {
    label: 'Custom Granular Role',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    permissions: []
  }
};

export default function SellerStaffManagement({ currentSubRole: propRole, onRoleChange }) {
  const [activeRole, setActiveRole] = useState(() => propRole || getStoredSupplierSubRole());
  const [activeViewTab, setActiveViewTab] = useState('roster'); // Default to real supplier roster
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [currentSupplierId, setCurrentSupplierId] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Permission Configuration Modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalRole, setModalRole] = useState('OWNER');
  const [modalPermissions, setModalPermissions] = useState([]);
  const [modalStation, setModalStation] = useState('');

  // Invite Staff Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'DISPATCH_STAFF',
    station: 'Warehouse Dispatch Bay'
  });

  // Sync prop changes
  useEffect(() => {
    if (propRole && propRole !== activeRole) {
      setActiveRole(propRole);
    }
  }, [propRole]);

  // Load real suppliers and staff from backend database
  const loadStaffProfiles = async () => {
    setLoading(true);
    try {
      const res = await supplierApiService.fetchSupplierStaffList();
      if (res && res.success && Array.isArray(res.staff)) {
        setStaffList(res.staff);
        setCurrentSupplierId(res.currentSupplierId || '');

        // If current supplier is among staff, sync their permissions to storage
        const currentProfile = res.staff.find((s) => s.id === res.currentSupplierId);
        if (currentProfile && Array.isArray(currentProfile.permissions)) {
          setStoredSupplierPermissions(currentProfile.permissions);
          setStoredSupplierSubRole(currentProfile.role || 'OWNER');
          setActiveRole(currentProfile.role || 'OWNER');
        }
      }
    } catch (err) {
      console.warn('Failed to load database staff list:', err.message);
      toast.error('Failed to load real supplier profiles from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffProfiles();
  }, []);

  // 1-Click Role Switch Simulator handler
  const handleSelectRole = (roleKey) => {
    if (!SUPPLIER_ROLES[roleKey]) return;
    setStoredSupplierSubRole(roleKey);
    setActiveRole(roleKey);

    const presetPerms = ROLE_PRESET_MAP[roleKey]?.permissions || ROLE_PRESET_MAP.OWNER.permissions;
    setStoredSupplierPermissions(presetPerms);

    if (onRoleChange) {
      onRoleChange(roleKey);
    }
    const roleCfg = SUPPLIER_ROLES[roleKey];
    toast.success(`Role Mode Switched: ${roleCfg.label}`, {
      description: roleCfg.description,
      duration: 3500
    });
  };

  // Open Permission Configuration Modal for a member
  const handleOpenPermissionsModal = (member) => {
    setSelectedMember(member);
    setModalRole(member.role || 'OWNER');
    setModalPermissions(Array.isArray(member.permissions) ? [...member.permissions] : []);
    setModalStation(member.station || 'Main Office & Hub');
  };

  // Toggle a single permission in the modal
  const handleTogglePermission = (permId) => {
    setModalPermissions((prev) => {
      const exists = prev.includes(permId);
      const next = exists ? prev.filter((p) => p !== permId) : [...prev, permId];
      // Automatically switch to CUSTOM role if permissions deviate from preset
      setModalRole('CUSTOM');
      return next;
    });
  };

  // Change preset in the modal
  const handleApplyPresetInModal = (roleKey) => {
    setModalRole(roleKey);
    if (roleKey === 'CUSTOM') return;
    const perms = ROLE_PRESET_MAP[roleKey]?.permissions || [];
    setModalPermissions([...perms]);
  };

  // Select / Deselect All
  const handleSelectAllPerms = () => {
    setModalRole('OWNER');
    setModalPermissions(ALL_PERMISSIONS_LIST.map((p) => p.id));
  };

  const handleDeselectAllPerms = () => {
    setModalRole('CUSTOM');
    setModalPermissions(['staff']); // Always keep staff access
  };

  // Save Permissions to Database
  const handleSavePermissions = async () => {
    if (!selectedMember) return;
    setSavingId(selectedMember.id);
    try {
      const payload = {
        supplierRole: modalRole,
        permissions: modalPermissions,
        station: modalStation
      };

      const res = await supplierApiService.updateSupplierStaffPermissions(selectedMember.id, payload);

      if (res && res.success) {
        toast.success(`Permissions saved to database for ${selectedMember.name}!`);

        // If editing currently logged in supplier, update active session state
        if (selectedMember.id === currentSupplierId || selectedMember.isCurrent) {
          setStoredSupplierPermissions(modalPermissions);
          setStoredSupplierSubRole(modalRole);
          setActiveRole(modalRole);
          if (onRoleChange) onRoleChange(modalRole);
        }

        // Refresh local list
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === selectedMember.id
              ? {
                  ...s,
                  role: modalRole,
                  permissions: modalPermissions,
                  station: modalStation
                }
              : s
          )
        );

        setSelectedMember(null);
      } else {
        throw new Error(res?.error || 'Database update failed');
      }
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Failed to save permissions: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Create new staff member in database
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || (!newStaff.email.trim() && !newStaff.phone.trim())) {
      toast.error('Please enter Staff Name and Mobile number or Email');
      return;
    }

    try {
      const assignedPerms = ROLE_PRESET_MAP[newStaff.role]?.permissions || ROLE_PRESET_MAP.DISPATCH_STAFF.permissions;

      const payload = {
        name: newStaff.name.trim(),
        email: newStaff.email.trim(),
        phone: newStaff.phone.trim(),
        role: newStaff.role,
        station: newStaff.station.trim() || 'Warehouse Dispatch Bay',
        permissions: assignedPerms
      };

      const res = await supplierApiService.createSupplierStaff(payload);

      if (res && res.success) {
        toast.success(`Staff member "${newStaff.name}" added to database!`);
        setShowInviteModal(false);
        setNewStaff({
          name: '',
          email: '',
          phone: '',
          role: 'DISPATCH_STAFF',
          station: 'Warehouse Dispatch Bay'
        });
        loadStaffProfiles();
      } else {
        throw new Error(res?.error || 'Failed to add staff');
      }
    } catch (err) {
      console.error('Add staff error:', err);
      toast.error(err.message || 'Failed to add staff member');
    }
  };

  // Delete / Deactivate staff member
  const handleDeleteStaff = async (id, name) => {
    if (id === currentSupplierId) {
      toast.error('Cannot remove your own primary Store Owner account');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove staff member "${name}"?`)) return;

    try {
      const res = await supplierApiService.deleteSupplierStaff(id);
      if (res && res.success) {
        toast.success(`Staff member "${name}" removed`);
        setStaffList((prev) => prev.filter((s) => s.id !== id));
      } else {
        throw new Error(res?.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Failed to delete staff member: ' + err.message);
    }
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      // Role filter
      if (filterRole !== 'ALL' && s.role !== filterRole) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const storeMatch = (s.storeName || '').toLowerCase().includes(q);
        const emailMatch = (s.email || '').toLowerCase().includes(q);
        const phoneMatch = (s.phone || '').toLowerCase().includes(q);
        const stationMatch = (s.station || '').toLowerCase().includes(q);
        return nameMatch || storeMatch || emailMatch || phoneMatch || stationMatch;
      }
      return true;
    });
  }, [staffList, filterRole, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HERO BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-pink-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-pink-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>Real-Time Database RBAC Engine (PostgreSQL)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Supplier Roles &amp; Permissions Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Manage all registered supplier profiles and staff team members directly from PostgreSQL database. 
              Assign custom roles, grant or revoke granular module access, and protect sensitive financial payouts.
            </p>
          </div>

          {/* Active Preview Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shrink-0 md:min-w-[280px]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Your Active Role:
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">
                {activeRole === 'OWNER' ? '👑' : activeRole === 'DISPATCH_STAFF' ? '🚚' : activeRole === 'FINANCE_ACCOUNTS' ? '💳' : '📦'}
              </span>
              <div>
                <p className="font-extrabold text-white text-base leading-snug">
                  {SUPPLIER_ROLES[activeRole]?.label || activeRole}
                </p>
                <p className="text-[11px] text-pink-200">
                  {ROLE_PRESET_MAP[activeRole]?.permissions?.length || 12} of 12 Permissions Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveViewTab('roster')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'roster'
                ? 'bg-pink-600 text-white shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Supplier Profiles &amp; Permissions ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('simulator')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeViewTab === 'simulator'
                ? 'bg-pink-600 text-white shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Role Switcher</span>
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
            <span>Permissions Matrix</span>
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
            <span>Supplier vs Dropshipper vs Logistics</span>
          </button>
        </div>
      </div>

      {/* 2. TAB 1: REAL SUPPLIER ROSTER & PERMISSIONS (DEFAULT) */}
      {activeViewTab === 'roster' && (
        <div className="space-y-5">
          {/* Controls Bar: Search, Role Filter, Refresh, Invite */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2.5 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search supplier, store name, phone or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer shrink-0"
              >
                <option value="ALL">All Roles ({staffList.length})</option>
                <option value="OWNER">Store Owner (Admin)</option>
                <option value="DISPATCH_STAFF">Dispatch Staff</option>
                <option value="CATALOG_EXECUTIVE">Catalog Executive</option>
                <option value="FINANCE_ACCOUNTS">Finance Specialist</option>
                <option value="CUSTOM">Custom Roles</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={loadStaffProfiles}
                disabled={loading}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Refresh from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && staffList.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">Loading supplier profiles from database...</p>
              <p className="text-xs text-slate-400">Fetching live RBAC roles and permissions from PostgreSQL</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredStaff.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">No matching supplier profiles found</p>
              <p className="text-xs text-slate-500">
                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : 'No suppliers registered in database yet.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-pink-600 hover:underline"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          )}

          {/* Supplier Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((member) => {
              const roleConfig = ROLE_PRESET_MAP[member.role] || ROLE_PRESET_MAP.OWNER;
              const permsCount = Array.isArray(member.permissions) ? member.permissions.length : 12;
              const isCurrentUser = member.isCurrent || member.id === currentSupplierId;

              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md relative ${
                    isCurrentUser ? 'border-pink-300 ring-2 ring-pink-500/10' : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar: Avatar, Names, Role Badge */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-100 to-indigo-100 border border-pink-200 flex items-center justify-center font-black text-slate-800 text-sm shrink-0 shadow-2xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-slate-900 text-sm truncate">
                              {member.name}
                            </h4>
                            {isCurrentUser && (
                              <span className="text-[10px] font-black text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded-md">
                                You (Admin)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Store className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{member.storeName || 'Verified Store'}</span>
                          </p>
                        </div>
                      </div>

                      {!isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          className="text-slate-300 hover:text-rose-600 transition p-1 cursor-pointer shrink-0"
                          title="Remove from store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Role & Station Pill */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${roleConfig.badgeClass}`}>
                        <span>{member.role === 'OWNER' ? '👑' : member.role === 'DISPATCH_STAFF' ? '🚚' : '📦'}</span>
                        <span>{roleConfig.label}</span>
                      </span>

                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 truncate max-w-[150px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.station}</span>
                      </span>
                    </div>

                    {/* Contact & Meta Details */}
                    <div className="space-y-1.5 py-2.5 px-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{member.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                        <span>Tier: <strong className="text-slate-700">{member.tier || 'Silver'}</strong></span>
                        <span>Added: <strong className="text-slate-700">{member.dateAdded || 'Active'}</strong></span>
                      </div>
                    </div>

                    {/* Active Permissions Summary Pills */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Active Entitlements:
                        </span>
                        <span className="text-xs font-black text-pink-700">
                          {permsCount} / 12 Modules
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(member.permissions || []).slice(0, 5).map((permId) => {
                          const meta = ALL_PERMISSIONS_LIST.find((p) => p.id === permId);
                          return (
                            <span
                              key={permId}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {meta?.badge || permId}
                            </span>
                          );
                        })}
                        {(member.permissions?.length || 0) > 5 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200">
                            +{member.permissions.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Configure Permissions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {member.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenPermissionsModal(member)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5 text-pink-400" />
                      <span>Configure Permissions</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB 2: LIVE ROLE SWITCHER (SIMULATOR) */}
      {activeViewTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong className="font-bold">Live Role Preview Engine:</strong> Select any of the standard roles below to test how the supplier console adapts in real-time. Notice how sidebar menu tabs, financial balances, and catalog controls instantly lock or unlock based on assigned privileges.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Owner */}
            <div
              onClick={() => handleSelectRole('OWNER')}
              className={`rounded-3xl p-6 transition-all cursor-pointer border-2 relative flex flex-col justify-between ${
                activeRole === 'OWNER'
                  ? 'bg-white border-emerald-500 shadow-xl ring-4 ring-emerald-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
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
                    <span>Bank KYC &amp; Penny Drop Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Financial Payouts &amp; 7-Day Transfers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Staff &amp; Role Access Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Orders, Shipping Labels &amp; Pickup Manifest</span>
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

            {/* Dispatch Staff */}
            <div
              onClick={() => handleSelectRole('DISPATCH_STAFF')}
              className={`rounded-3xl p-6 transition-all cursor-pointer border-2 relative flex flex-col justify-between ${
                activeRole === 'DISPATCH_STAFF'
                  ? 'bg-white border-blue-500 shadow-xl ring-4 ring-blue-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
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
                  <p className="text-xs text-slate-500 mt-1">Order Fulfilment &amp; Handover Only</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Operate packing slips, batch 4x6 thermal barcode printouts, courier manifest handover, 
                  and RTO return parcel verification. Sensitive financial tabs are hidden.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Orders &amp; Live Melodic Chime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>4x6 Thermal Shipping Labels</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-semibold">
                    <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Financial Payouts &amp; Bank KYC Blocked</span>
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

            {/* Catalog Executive */}
            <div
              onClick={() => handleSelectRole('CATALOG_EXECUTIVE')}
              className={`rounded-3xl p-6 transition-all cursor-pointer border-2 relative flex flex-col justify-between ${
                activeRole === 'CATALOG_EXECUTIVE'
                  ? 'bg-white border-purple-500 shadow-xl ring-4 ring-purple-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
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
                  <p className="text-xs text-slate-500 mt-1">Products &amp; Stock Matrix</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated to product listings, dynamic specification toggles, multi-variant stock matrices, 
                  and customer review management. Orders &amp; financial payouts are hidden.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Single &amp; Bulk CSV Product Upload</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Variant Matrix (Size × Color × Stock)</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-semibold">
                    <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Orders &amp; Financial Payouts Blocked</span>
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
                {activeRole === 'CATALOG_EXECUTIVE' ? 'Currently Active' : 'Switch to Catalog Exec'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: PERMISSIONS MATRIX (SIDE-BY-SIDE) */}
      {activeViewTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Meesho Role &amp; Permission Entitlement Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side comparison of all 12 operational modules across supplier staff roles.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Full Access
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <Lock className="w-3.5 h-3.5 text-rose-500" /> Restricted &amp; Hidden
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6 w-2/5">Module / Feature</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">👑 Owner (Admin)</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">🚚 Dispatch Staff</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">📦 Catalog Exec</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">💳 Finance Specialist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_PERMISSIONS_LIST.map((perm) => {
                  const ownerHas = ROLE_PRESET_MAP.OWNER.permissions.includes(perm.id);
                  const dispatchHas = ROLE_PRESET_MAP.DISPATCH_STAFF.permissions.includes(perm.id);
                  const catalogHas = ROLE_PRESET_MAP.CATALOG_EXECUTIVE.permissions.includes(perm.id);
                  const financeHas = ROLE_PRESET_MAP.FINANCE_ACCOUNTS.permissions.includes(perm.id);

                  return (
                    <tr key={perm.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{perm.icon}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{perm.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${ownerHas ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {ownerHas ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${dispatchHas ? 'bg-blue-100 text-blue-700' : 'bg-rose-50 text-rose-400'}`}>
                          {dispatchHas ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${catalogHas ? 'bg-purple-100 text-purple-700' : 'bg-rose-50 text-rose-400'}`}>
                          {catalogHas ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${financeHas ? 'bg-amber-100 text-amber-700' : 'bg-rose-50 text-rose-400'}`}>
                          {financeHas ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 4: MEESHO ECOSYSTEM COMPARISON */}
      {activeViewTab === 'comparison' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-black text-slate-900">
              📌 Meesho Multi-Portal Ecosystem: Supplier vs Dropshipper vs Logistics Farq
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
                  <td className="py-3.5 px-4 text-slate-700">Product manufacture, pack &amp; dispatch with shipping label</td>
                  <td className="py-3.5 px-4 text-slate-700">Margin add karke product promote &amp; share karna</td>
                  <td className="py-3.5 px-4 text-slate-700">Parcel pick, barcode scan, transit &amp; doorstep delivery</td>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: CONFIGURE PERMISSIONS (INTERACTIVE GRANULAR RBAC EDITOR)
      ========================================================================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold text-sm">
                    ⚙️
                  </span>
                  <h3 className="text-lg font-black tracking-tight">Configure Supplier Permissions</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Managing access for <strong className="text-white font-bold">{selectedMember.name}</strong> ({selectedMember.storeName})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
              {/* Preset Quick Select */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Quick Role Preset:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPerms}
                      className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Check All (12)
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllPerms}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(ROLE_PRESET_MAP).map(([key, cfg]) => {
                    const isSelected = modalRole === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPresetInModal(key)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                          isSelected
                            ? 'bg-pink-50/70 border-pink-500 text-pink-900 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span className="text-xs truncate">{cfg.label}</span>
                        <span className="text-[10px] text-slate-500">
                          {key === 'OWNER' ? 'Full Access' : key === 'CUSTOM' ? 'Customized' : `${cfg.permissions.length} Modules`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Station / Hub Assignment */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned Workstation / Hub Location:</span>
                </label>
                <input
                  type="text"
                  value={modalStation}
                  onChange={(e) => setModalStation(e.target.value)}
                  placeholder="e.g. Surat Main Office & Dispatch Bay 2"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              {/* Granular Module Checkbox Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Granular Module Entitlements ({modalPermissions.length} / 12 Granted):</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_PERMISSIONS_LIST.map((perm) => {
                    const isGranted = modalPermissions.includes(perm.id);

                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isGranted
                            ? 'bg-pink-50/50 border-pink-300 shadow-2xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 opacity-75'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span>{perm.icon}</span>
                            <span className={`text-xs font-bold ${isGranted ? 'text-slate-900' : 'text-slate-600'}`}>
                              {perm.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                            {perm.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={savingId === selectedMember.id}
                className="px-5 py-2.5 rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition disabled:opacity-50"
              >
                {savingId === selectedMember.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Permissions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: INVITE NEW STAFF / SUB-SUPPLIER MEMBER
      ========================================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#b7004d] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Store Team Member</h3>
                  <p className="text-[11px] text-slate-500">Creates an authorized user in database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (For OTP / Login) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh.dispatch@store.in"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Role Preset
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold bg-white cursor-pointer"
                >
                  <option value="DISPATCH_STAFF">🚚 Warehouse &amp; Dispatch Staff (Orders Only)</option>
                  <option value="CATALOG_EXECUTIVE">📦 Catalog &amp; Inventory Executive (Products Only)</option>
                  <option value="FINANCE_ACCOUNTS">💳 Finance &amp; Accounts (Settlements Only)</option>
                  <option value="OWNER">👑 Store Owner / Co-Admin (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Workstation / Bay
                </label>
                <input
                  type="text"
                  placeholder="e.g. Surat Dispatch Desk 1"
                  value={newStaff.station}
                  onChange={(e) => setNewStaff({ ...newStaff, station: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#b7004d] hover:bg-[#92003d] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
