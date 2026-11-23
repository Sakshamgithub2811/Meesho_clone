import prisma from '../../config/prisma.js';

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await prisma.logisticsWarehouse.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { shipments: true, fleetVehicles: true },
        },
      },
    });

    return res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { warehouseCode, name, type, contactPerson, phone, email, addressLine1, city, state, pincode, maxDailyCapacity } = req.body;

    if (!warehouseCode || !name || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All essential address fields are required.' });
    }

    const warehouse = await prisma.logisticsWarehouse.create({
      data: {
        warehouseCode: warehouseCode.trim().toUpperCase(),
        name,
        type: type || 'REGIONAL_DEPOT',
        contactPerson,
        phone,
        email,
        addressLine1,
        city,
        state,
        pincode,
        maxDailyCapacity: parseInt(maxDailyCapacity, 10) || 5000,
      },
    });

    return res.status(201).json({ success: true, message: 'Warehouse created successfully!', data: warehouse });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
