import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.headers['x-user-id'] ||
    req.headers['x-customer-id'] ||
    req.headers['x-affiliate-id'] ||
    req.headers['x-reseller-id'] ||
    req.query.userId ||
    'guest_customer'
  );
};

const ensureProfile = async (userId) => {
  if (!userId) return null;
  try {
    return await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return await prisma.profile.findUnique({ where: { id: userId } });
    }
    throw err;
  }
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

    const fullName = req.body.fullName || req.body.name;
    const phone = req.body.phone || req.body.mobileNumber || req.body.phoneNumber;
    const pincode = req.body.pincode || req.body.postalCode || req.body.pin;
    const addressLine = req.body.addressLine || req.body.address || req.body.street;
    const city = req.body.city;
    const state = req.body.state;
    const isDefault = Boolean(req.body.isDefault);

    if (!fullName || !phone || !pincode || !addressLine || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All address fields (name, phone, pincode, address, city, state) are required'
      });
    }

    const cleanPhone = String(phone).trim().replace(/\D/g, '').slice(-10);
    const cleanPincode = String(pincode).trim();
    const cleanLine = String(addressLine).trim();
    const cleanCity = String(city).trim();
    const cleanState = String(state).trim();
    const cleanName = String(fullName).trim();

    // Deduplication check: Avoid double address creation under fast clicks or duplicate submissions
    const existing = await prisma.address.findFirst({
      where: {
        userId,
        phone: { contains: cleanPhone },
        pincode: cleanPincode,
        addressLine: { equals: cleanLine, mode: 'insensitive' }
      }
    });

    if (existing) {
      if (isDefault && !existing.isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
        const updated = await prisma.address.update({
          where: { id: existing.id },
          data: { isDefault: true }
        });
        return res.status(200).json({
          success: true,
          message: 'Address already exists and set as default',
          data: updated
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Address already exists in your account',
        data: existing
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
        fullName: cleanName,
        phone: cleanPhone.length === 10 ? cleanPhone : String(phone).trim(),
        pincode: cleanPincode,
        addressLine: cleanLine,
        city: cleanCity,
        state: cleanState,
        isDefault
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully to database',
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
