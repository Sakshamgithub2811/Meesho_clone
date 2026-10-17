import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || req.query.userId || 'guest_customer';
};

const ensureProfile = async (userId) => {
  if (!userId) return null;
  const existing = await prisma.profile.findUnique({ where: { id: userId } });
  if (!existing) {
    return await prisma.profile.create({
      data: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });
  }
  return existing;
};

export const getAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
};

export const createAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    await ensureProfile(userId);

    const { fullName, phone, pincode, addressLine, city, state, isDefault = false } = req.body;

    if (!fullName || !phone || !pincode || !addressLine || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All address fields (name, phone, pincode, address, city, state) are required'
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        pincode,
        addressLine,
        city,
        state,
        isDefault: Boolean(isDefault)
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      data: newAddress
    });
  } catch (error) {
    console.error('Error creating address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save address',
      error: error.message
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.address.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};
