import { ShipmentService } from '../../services/logistics/shipment.service.js';
import prisma from '../../config/prisma.js';

export const getShipments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, partnerId, warehouseId } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = { isDeleted: false };
    if (status && status !== 'ALL') where.status = status;
    if (partnerId) where.partnerId = partnerId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { shipmentNumber: { contains: q, mode: 'insensitive' } },
        { awbNumber: { contains: q, mode: 'insensitive' } },
        { orderId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [shipments, totalCount] = await Promise.all([
      prisma.logisticsShipment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          partner: true,
          warehouse: true,
          packages: true,
          items: { include: { product: { select: { id: true, title: true, images: true } } } },
        },
      }),
      prisma.logisticsShipment.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      count: shipments.length,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / take),
      },
      data: shipments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await prisma.logisticsShipment.findUnique({
      where: { id },
      include: {
        partner: true,
        warehouse: true,
        packages: true,
        items: { include: { product: true } },
        trackingEvents: { orderBy: { eventTime: 'asc' } },
        deliveryAttempts: true,
        proofOfDelivery: true,
        documents: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    return res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createShipment = async (req, res) => {
  try {
    const { orderId, warehouseId, partnerId, shippingMode, packages } = req.body;
    if (!orderId || !warehouseId) {
      return res.status(400).json({ success: false, message: 'orderId and warehouseId are required.' });
    }

    const shipment = await ShipmentService.createShipment({
      orderId,
      warehouseId,
      partnerId,
      shippingMode,
      packages,
    });

    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully!',
      data: shipment,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await ShipmentService.updateStatus({
      shipmentId: id,
      targetStatus: status,
      location,
      remarks,
      source: 'ADMIN_MANUAL',
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
