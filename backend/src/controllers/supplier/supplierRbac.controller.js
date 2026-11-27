import prisma from '../../config/prisma.js';

export const ALL_SUPPLIER_PERMISSIONS = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    category: 'Dashboard & Metrics',
    desc: 'Live incoming orders chime, key performance indicators & daily gross revenue',
    icon: 'LayoutDashboard'
  },
  {
    id: 'inventory',
    label: 'Products & Inventory',
    category: 'Catalog & Inventory',
    desc: 'Manage products, variant matrix (Size × Color × Stock), and bulk actions',
    icon: 'Package'
  },
  {
    id: 'add-product',
    label: 'Add New Products',
    category: 'Catalog & Inventory',
    desc: 'Single product creation with dynamic specs & bulk CSV/Excel catalog ingestion',
    icon: 'PlusCircle'
  },
  {
    id: 'orders',
    label: 'Orders & Dispatch',
    category: 'Orders & Fulfillment',
    desc: 'Incoming order pipeline, 4x6 thermal shipping labels & courier pickup manifest',
    icon: 'ShoppingCart'
  },
  {
    id: 'finance',
    label: 'Settlements & Payouts',
    category: 'Finance & Bank',
    desc: '0% commission ledger, TDS deduction, Escrow balance & 7-day payout withdrawals',
    icon: 'Banknote'
  },
  {
    id: 'dropship',
    label: 'Dropship Fulfillment',
    category: 'Orders & Fulfillment',
    desc: 'B2B orders, wholesale catalog sync & marketplace dropship dispatch',
    icon: 'Truck'
  },
  {
    id: 'returns',
    label: 'Returns & RTO Hub',
    category: 'Orders & Fulfillment',
    desc: 'Doorstep parcel inspection, ₹0 penalty checks & Wrong Return SPF safety claims',
    icon: 'RotateCcw'
  },
  {
    id: 'reviews',
    label: 'Ratings & Reviews',
    category: 'Customer Experience',
    desc: 'Customer ratings, verified reviews & unboxing photo feedback monitor',
    icon: 'Star'
  },
  {
    id: 'kyc',
    label: 'Supplier KYC Hub',
    category: 'Business Compliance',
    desc: 'GSTIN, PAN verification, Bank account penny-drop & Warehouse address docs',
    icon: 'ShieldCheck'
  },
  {
    id: 'analytics',
    label: 'Sales Analytics',
    category: 'Dashboard & Metrics',
    desc: 'Comprehensive sales analytics, revenue trends & top-performing SKUs',
    icon: 'LineChart'
  },
  {
    id: 'profile',
    label: 'Store Profile & Bank',
    category: 'Store Settings',
    desc: 'Edit legal business name, registered GSTIN, and beneficiary bank account',
    icon: 'Store'
  },
  {
    id: 'staff',
    label: 'Team & RBAC Permissions',
    category: 'Store Settings',
    desc: 'Manage store staff accounts, customize roles & grant/revoke granular permissions',
    icon: 'Users'
  }
];

export const ROLE_PRESETS = {
  OWNER: {
    id: 'OWNER',
    label: 'Store Owner (Admin)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Complete Access: Bank KYC, Financial Payouts, Staff Management, Orders & Catalog.',
    permissions: [
      'overview', 'inventory', 'add-product', 'orders', 'finance',
      'dropship', 'returns', 'reviews', 'kyc', 'analytics', 'profile', 'staff'
    ]
  },
  DISPATCH_STAFF: {
    id: 'DISPATCH_STAFF',
    label: 'Warehouse & Dispatch Staff',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Orders & Dispatch access: Packing slips, labels & courier manifest. Financial payouts & bank details hidden.',
    permissions: ['orders', 'dropship', 'returns', 'staff']
  },
  CATALOG_EXECUTIVE: {
    id: 'CATALOG_EXECUTIVE',
    label: 'Catalog & Inventory Executive',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Products & Inventory access: Add new products, update stock & variant matrix. Orders & payouts hidden.',
    permissions: ['inventory', 'add-product', 'reviews', 'staff']
  },
  FINANCE_ACCOUNTS: {
    id: 'FINANCE_ACCOUNTS',
    label: 'Finance & Accounts Specialist',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Finance access: Settlements ledger, payout history, bank accounts & sales analytics. Catalog editing hidden.',
    permissions: ['overview', 'finance', 'analytics', 'staff']
  },
  CUSTOM: {
    id: 'CUSTOM',
    label: 'Custom Role',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Custom Granular Access: Configured specifically by the Store Owner/Admin.',
    permissions: []
  }
};

/**
 * GET /api/supplier/rbac/staff
 * Returns all supplier & staff profiles with their database-backed roles & permissions
 */
export const getSupplierStaffList = async (req, res) => {
  try {
    const currentSupplierId = req.supplier?.id;

    const rows = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        COALESCE(full_name, store_name, 'Supplier') AS "fullName",
        COALESCE(store_name, 'My Supplier Store') AS "storeName",
        email,
        phone,
        avatar_url AS "avatarUrl",
        role,
        COALESCE(supplier_role, 'OWNER') AS "supplierRole",
        COALESCE(permissions, '[]'::jsonb) AS "permissions",
        COALESCE(station, 'Main Office & Hub') AS "station",
        COALESCE(tier, 'Silver') AS "tier",
        COALESCE(tier_label, 'Silver Supplier') AS "tierLabel",
        COALESCE(rating, 5.0) AS "rating",
        is_active AS "isActive",
        created_at AS "createdAt",
        parent_supplier_id AS "parentSupplierId"
      FROM profiles
      WHERE role = 'SUPPLIER' AND is_deleted = false
      ORDER BY 
        CASE WHEN id = $1 THEN 0 ELSE 1 END,
        created_at DESC
    `, currentSupplierId || '');

    const staff = rows.map((r) => {
      let perms = r.permissions;
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch (_) { perms = []; }
      }
      if (!Array.isArray(perms) || perms.length === 0) {
        perms = ROLE_PRESETS[r.supplierRole]?.permissions || ROLE_PRESETS.OWNER.permissions;
      }

      return {
        id: r.id,
        name: r.fullName,
        storeName: r.storeName,
        email: r.email || `${r.id.slice(0, 8)}@supplier.in`,
        phone: r.phone || 'N/A',
        avatarUrl: r.avatarUrl || null,
        role: r.supplierRole || 'OWNER',
        station: r.station || 'Main Office & Hub',
        permissions: perms,
        status: r.isActive !== false ? 'ACTIVE' : 'INACTIVE',
        tier: r.tier,
        tierLabel: r.tierLabel,
        rating: Number(r.rating) || 5.0,
        dateAdded: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '2026-01-01',
        isCurrent: r.id === currentSupplierId
      };
    });

    return res.json({
      success: true,
      currentSupplierId,
      total: staff.length,
      staff,
      availablePermissions: ALL_SUPPLIER_PERMISSIONS,
      rolePresets: ROLE_PRESETS
    });
  } catch (err) {
    console.error('getSupplierStaffList error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve supplier staff profiles',
      details: err.message
    });
  }
};

/**
 * GET /api/supplier/rbac/my-permissions
 * Returns active permissions for the logged-in supplier
 */
export const getMySupplierPermissions = async (req, res) => {
  try {
    const supplierId = req.supplier?.id;
    if (!supplierId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const rows = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        full_name AS "fullName",
        store_name AS "storeName",
        email,
        phone,
        COALESCE(supplier_role, 'OWNER') AS "supplierRole",
        COALESCE(permissions, '[]'::jsonb) AS "permissions",
        COALESCE(station, 'Main Office & Hub') AS "station"
      FROM profiles
      WHERE id = $1
      LIMIT 1
    `, supplierId);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Supplier profile not found' });
    }

    const s = rows[0];
    let perms = s.permissions;
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch (_) { perms = []; }
    }
    if (!Array.isArray(perms) || perms.length === 0) {
      perms = ROLE_PRESETS[s.supplierRole]?.permissions || ROLE_PRESETS.OWNER.permissions;
    }

    return res.json({
      success: true,
      supplierId: s.id,
      fullName: s.fullName,
      storeName: s.storeName,
      supplierRole: s.supplierRole,
      station: s.station,
      permissions: perms,
      isOwner: s.supplierRole === 'OWNER'
    });
  } catch (err) {
    console.error('getMySupplierPermissions error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/supplier/rbac/staff/:id/permissions
 * Updates a supplier or staff profile's role, permissions, and station in PostgreSQL
 */
export const updateSupplierStaffPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    let { supplierRole, permissions, station, storeName, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Supplier ID is required' });
    }

    // Default permissions based on role if not explicitly provided
    if ((!permissions || !Array.isArray(permissions) || permissions.length === 0) && supplierRole) {
      permissions = ROLE_PRESETS[supplierRole]?.permissions || ROLE_PRESETS.OWNER.permissions;
    }

    // Ensure permissions are valid allowed IDs
    const validIds = new Set(ALL_SUPPLIER_PERMISSIONS.map(p => p.id));
    const sanitizedPermissions = Array.isArray(permissions)
      ? permissions.filter(p => validIds.has(p))
      : ROLE_PRESETS.OWNER.permissions;

    await prisma.$executeRawUnsafe(`
      UPDATE profiles
      SET
        supplier_role = COALESCE($1, supplier_role),
        permissions = $2::jsonb,
        station = COALESCE($3, station),
        store_name = COALESCE($4, store_name),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
      WHERE id = $6
    `,
      supplierRole || 'OWNER',
      JSON.stringify(sanitizedPermissions),
      station || null,
      storeName || null,
      typeof isActive === 'boolean' ? isActive : null,
      id
    );

    const updatedRows = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        COALESCE(full_name, store_name, 'Supplier') AS "fullName",
        COALESCE(store_name, 'My Supplier Store') AS "storeName",
        email,
        phone,
        COALESCE(supplier_role, 'OWNER') AS "supplierRole",
        COALESCE(permissions, '[]'::jsonb) AS "permissions",
        COALESCE(station, 'Main Office & Hub') AS "station",
        is_active AS "isActive"
      FROM profiles
      WHERE id = $1
      LIMIT 1
    `, id);

    if (updatedRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const updated = updatedRows[0];
    let finalPerms = updated.permissions;
    if (typeof finalPerms === 'string') {
      try { finalPerms = JSON.parse(finalPerms); } catch (_) { finalPerms = sanitizedPermissions; }
    }

    return res.json({
      success: true,
      message: `Permissions updated successfully for ${updated.fullName}`,
      staff: {
        id: updated.id,
        name: updated.fullName,
        storeName: updated.storeName,
        email: updated.email,
        phone: updated.phone,
        role: updated.supplierRole,
        station: updated.station,
        permissions: finalPerms,
        status: updated.isActive ? 'ACTIVE' : 'INACTIVE'
      }
    });
  } catch (err) {
    console.error('updateSupplierStaffPermissions error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update supplier permissions in database',
      details: err.message
    });
  }
};

/**
 * POST /api/supplier/rbac/staff
 * Invites or creates a new staff member under the supplier store in PostgreSQL
 */
export const createSupplierStaff = async (req, res) => {
  try {
    const currentSupplier = req.supplier;
    const { name, email, phone, role, station, permissions } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        error: 'Staff full name and at least Email or Mobile Phone are required'
      });
    }

    const assignedRole = role || 'DISPATCH_STAFF';
    let assignedPermissions = permissions;
    if (!Array.isArray(assignedPermissions) || assignedPermissions.length === 0) {
      assignedPermissions = ROLE_PRESETS[assignedRole]?.permissions || ROLE_PRESETS.DISPATCH_STAFF.permissions;
    }

    const newId = `staff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanEmail = email ? email.trim().toLowerCase() : `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now()}@supplier.meesho`;
    const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '') : null;

    await prisma.$executeRawUnsafe(`
      INSERT INTO profiles (
        id,
        full_name,
        store_name,
        email,
        phone,
        role,
        supplier_role,
        permissions,
        station,
        parent_supplier_id,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'SUPPLIER', $6, $7::jsonb, $8, $9, true, NOW(), NOW()
      )
    `,
      newId,
      name.trim(),
      currentSupplier.storeName || 'My Supplier Store',
      cleanEmail,
      cleanPhone,
      assignedRole,
      JSON.stringify(assignedPermissions),
      station ? station.trim() : 'Warehouse Station 1',
      currentSupplier.id
    );

    return res.status(201).json({
      success: true,
      message: `Staff member "${name}" added successfully`,
      staff: {
        id: newId,
        name: name.trim(),
        storeName: currentSupplier.storeName || 'My Supplier Store',
        email: cleanEmail,
        phone: cleanPhone,
        role: assignedRole,
        station: station || 'Warehouse Station 1',
        permissions: assignedPermissions,
        status: 'ACTIVE',
        dateAdded: new Date().toISOString().split('T')[0]
      }
    });
  } catch (err) {
    console.error('createSupplierStaff error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create staff member in database',
      details: err.message
    });
  }
};

/**
 * DELETE /api/supplier/rbac/staff/:id
 * Deactivates or removes a staff member from PostgreSQL
 */
export const deleteSupplierStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.supplier?.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the primary Store Owner account'
      });
    }

    await prisma.$executeRawUnsafe(`
      UPDATE profiles
      SET is_deleted = true, is_active = false, updated_at = NOW()
      WHERE id = $1
    `, id);

    return res.json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (err) {
    console.error('deleteSupplierStaff error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove staff member',
      details: err.message
    });
  }
};
