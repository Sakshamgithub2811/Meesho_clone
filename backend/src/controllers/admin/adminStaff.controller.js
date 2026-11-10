import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logAdminAction } from '../../utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STAFF_FILE = path.resolve(__dirname, '../../config/staffRolesConfig.json');

export function getDirectStaff() {
  if (!fs.existsSync(STAFF_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(STAFF_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

export function saveStaff(data) {
  fs.writeFileSync(STAFF_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['ALL'],
  SUPPORT_AGENT: ['orders', 'returns', 'support'],
  CATALOG_MODERATOR: ['products', 'categories', 'reviews', 'banners'],
  FINANCE_OFFICER: ['finance', 'sellers', 'orders']
};

/**
 * 1. GET ALL STAFF MEMBERS
 * Route: GET /api/v1/admin-staff
 */
export const getStaffList = async (req, res) => {
  try {
    const staff = getDirectStaff();
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. CREATE NEW STAFF MEMBER
 * Route: POST /api/v1/admin-staff
 */
export const createStaffMember = async (req, res) => {
  try {
    const { email, fullName, role = 'SUPPORT_AGENT', customPermissions = [] } = req.body;

    if (!email || !email.trim() || !fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const staffList = getDirectStaff();

    if (staffList.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: `Staff member with email "${cleanEmail}" already exists.`
      });
    }

    const permissions =
      role === 'CUSTOM'
        ? customPermissions
        : ROLE_PERMISSIONS[role] || ['orders', 'returns'];

    const newStaff = {
      id: 'staff_' + Date.now(),
      email: cleanEmail,
      fullName: fullName.trim(),
      role,
      permissions,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: req.user?.fullName || req.user?.email || 'Super Admin'
    };

    staffList.push(newStaff);
    saveStaff(staffList);

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'Admin',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'STAFF_MEMBER_CREATED',
      targetType: 'STAFF',
      targetId: newStaff.id,
      details: `Created new staff "${fullName.trim()}" with role ${role}`
    });

    return res.status(201).json({
      success: true,
      message: `Staff member "${fullName.trim()}" added successfully!`,
      data: newStaff
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. UPDATE STAFF STATUS OR PERMISSIONS
 * Route: PATCH /api/v1/admin-staff/:id
 */
export const updateStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, customPermissions, status } = req.body;

    const staffList = getDirectStaff();
    const index = staffList.findIndex((s) => s.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    if (role) {
      staffList[index].role = role;
      staffList[index].permissions =
        role === 'CUSTOM'
          ? customPermissions || []
          : ROLE_PERMISSIONS[role] || staffList[index].permissions;
    }

    if (status) {
      staffList[index].status = status;
    }

    staffList[index].updatedAt = new Date().toISOString();
    saveStaff(staffList);

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'Admin',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'STAFF_MEMBER_UPDATED',
      targetType: 'STAFF',
      targetId: id,
      details: `Updated staff "${staffList[index].fullName}" (Role: ${staffList[index].role}, Status: ${staffList[index].status})`
    });

    return res.status(200).json({
      success: true,
      message: 'Staff permissions updated successfully',
      data: staffList[index]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. DELETE STAFF MEMBER
 * Route: DELETE /api/v1/admin-staff/:id
 */
export const deleteStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    let staffList = getDirectStaff();
    const target = staffList.find((s) => s.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    staffList = staffList.filter((s) => s.id !== id);
    saveStaff(staffList);

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'Admin',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'STAFF_MEMBER_DELETED',
      targetType: 'STAFF',
      targetId: id,
      details: `Removed staff member "${target.fullName}" (${target.email})`
    });

    return res.status(200).json({
      success: true,
      message: `Staff member "${target.fullName}" removed successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
