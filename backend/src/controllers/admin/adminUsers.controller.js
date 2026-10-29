import prisma from '../../config/prisma.js';
import admin from '../../config/firebaseAdmin.js';

const ALLOWED_ROLES = ['CUSTOMER', 'RESELLER', 'SUPPLIER', 'DRIVER', 'ADMIN', 'DROPSHIPPER'];

// 1. GET ALL USERS (with Search & Role Filter)
export const getAllUsers = async (req, res) => {
  try {
    const { search = '', role = '' } = req.query;

    const where = {};
    if (role && role !== 'ALL') {
      const formattedRole = role.toUpperCase();
      if (ALLOWED_ROLES.includes(formattedRole)) {
        where.role = formattedRole;
      }
    }

    if (search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const users = await prisma.profile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      total: users.length,
      users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. UPDATE USER ROLE
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const formattedRole = (role || '').toUpperCase();
    if (!ALLOWED_ROLES.includes(formattedRole)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`
      });
    }

    const updatedUser = await prisma.profile.update({
      where: { id },
      data: { role: formattedRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to ${formattedRole}`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. UPDATE USER DETAILS (Name, Email, Phone, Role, and Password)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, password } = req.body;

    // Check existing
    const existing = await prisma.profile.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    // Validate role if passed
    let formattedRole = existing.role;
    if (role) {
      formattedRole = role.toUpperCase();
      if (!ALLOWED_ROLES.includes(formattedRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`
        });
      }
    }

    // Check duplicate email if changed
    if (email && email.trim().toLowerCase() !== existing.email?.toLowerCase()) {
      const emailDuplicate = await prisma.profile.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { email: { equals: email.trim(), mode: 'insensitive' } }
          ]
        }
      });
      if (emailDuplicate) {
        return res.status(400).json({
          success: false,
          error: 'Another user with this email address already exists'
        });
      }
    }

    // Update in Firebase Auth if password, email, or displayName changed
    if (admin?.auth) {
      const authInstance = admin.auth();
      const firebaseUpdates = {};

      if (password && password.trim()) {
        if (password.trim().length < 6) {
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
          });
        }
        firebaseUpdates.password = password.trim();
      }

      if (email && email.trim() !== existing.email) {
        firebaseUpdates.email = email.trim();
      }

      if (fullName && fullName.trim() !== existing.fullName) {
        firebaseUpdates.displayName = fullName.trim();
      }

      if (Object.keys(firebaseUpdates).length > 0) {
        try {
          await authInstance.updateUser(id, firebaseUpdates);
        } catch (firebaseErr) {
          console.warn('Firebase Auth updateUser notice:', firebaseErr.message);
        }
      }
    }

    // Update in PostgreSQL (Prisma)
    const updatedUser = await prisma.profile.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName: fullName?.trim() }),
        ...(email !== undefined && { email: email?.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(role && { role: formattedRole }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'User account updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: "You cannot delete your own admin account!"
      });
    }

    await prisma.profile.delete({
      where: { id },
      select: { id: true }
    });

    // Also attempt delete in Firebase Auth if available
    if (admin?.auth) {
      try {
        await admin.auth().deleteUser(id);
      } catch (fbErr) {
        console.warn("Firebase Auth deleteUser notice:", fbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

