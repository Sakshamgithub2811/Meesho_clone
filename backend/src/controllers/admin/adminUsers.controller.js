import prisma from '../../config/prisma.js';

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

// 3. DELETE USER
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

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
