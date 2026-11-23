import prisma from '../../config/prisma.js';
import { isValidTransition, syncShipmentToParentOrder } from './trackingStateMachine.js';

export class ShipmentService {
  /**
   * Generates unique readable shipment ID (e.g. SHP-20261121-891024)
   */
  static generateShipmentNumber() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `SHP-${today}-${rand}`;
  }

  /**
   * Generates checksum AWB number
   */
  static generateAwbNumber(partnerCode = 'DEL') {
    const prefix = partnerCode.slice(0, 3).toUpperCase();
    const randNum = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}${randNum}`;
  }

  /**
   * Create a new shipment from a confirmed order
   */
  static async createShipment({ orderId, warehouseId, partnerId, shippingMode = 'SURFACE', packages = [] }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate order exists
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (!order) {
        throw new Error(`Order with ID "${orderId}" not found.`);
      }

      // Check for duplicate shipment
      const existing = await tx.logisticsShipment.findFirst({
        where: { orderId, isDeleted: false, status: { notIn: ['CANCELLED', 'RETURNED_TO_WAREHOUSE'] } },
      });
      if (existing) {
        throw new Error(`Order "${orderId}" already has an active shipment: ${existing.shipmentNumber}`);
      }

      // 2. Resolve warehouse & partner
      const warehouse = await tx.logisticsWarehouse.findUnique({ where: { id: warehouseId } });
      if (!warehouse) throw new Error('Selected warehouse does not exist.');

      let partner = null;
      if (partnerId) {
        partner = await tx.logisticsPartner.findUnique({ where: { id: partnerId } });
      } else {
        partner = await tx.logisticsPartner.findFirst({ where: { status: 'ACTIVE' } });
      }

      // 3. Compute dead & volumetric weights
      let totalDeadWeight = 0;
      let totalVolumetricWeight = 0;

      const preparedPackages = packages.length > 0 ? packages : [
        {
          boxType: 'MEDIUM_BOX',
          lengthCm: 25.0,
          widthCm: 18.0,
          heightCm: 10.0,
          weightKg: 0.8,
        },
      ];

      for (const pkg of preparedPackages) {
        const dead = Number(pkg.weightKg || 0.5);
        const vol = (Number(pkg.lengthCm || 20) * Number(pkg.widthCm || 15) * Number(pkg.heightCm || 10)) / 5000;
        totalDeadWeight += dead;
        totalVolumetricWeight += vol;
      }

      const billableWeight = Math.max(totalDeadWeight, totalVolumetricWeight);
      const shipmentNumber = this.generateShipmentNumber();
      const awbNumber = this.generateAwbNumber(partner?.partnerCode || 'DEL');
      const isCod = order.paymentMethod === 'COD';

      // 4. Create master shipment
      const newShipment = await tx.logisticsShipment.create({
        data: {
          shipmentNumber,
          orderId,
          warehouseId: warehouse.id,
          partnerId: partner?.id || null,
          awbNumber,
          shippingMode,
          status: 'READY_FOR_DISPATCH',
          paymentMethod: isCod ? 'COD' : 'PREPAID',
          codAmount: isCod ? order.totalAmount : 0.0,
          totalPackages: preparedPackages.length,
          deadWeightKg: Math.round(totalDeadWeight * 1000) / 1000,
          volumetricWeightKg: Math.round(totalVolumetricWeight * 1000) / 1000,
          billableWeightKg: Math.round(billableWeight * 1000) / 1000,
          estimatedShippingCost: 65.0, // Calculated dynamically in Phase 4
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          shippingAddressSnapshot: order.shippingAddress,
          packages: {
            create: preparedPackages.map((p, idx) => ({
              packageNumber: `PKG-${shipmentNumber}-${idx + 1}`,
              boxType: p.boxType || 'MEDIUM_BOX',
              lengthCm: p.lengthCm || 20.0,
              widthCm: p.widthCm || 15.0,
              heightCm: p.heightCm || 10.0,
              weightKg: p.weightKg || 0.5,
              barcode: `${awbNumber}-${idx + 1}`,
            })),
          },
          items: {
            create: order.items.map((item) => ({
              orderItemId: item.id,
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
          trackingEvents: {
            create: {
              status: 'READY_FOR_DISPATCH',
              eventName: 'SHIPMENT_CREATED',
              location: `${warehouse.city}, ${warehouse.state}`,
              description: `Shipment packed at ${warehouse.name} and ready for courier pickup.`,
              source: 'SYSTEM',
            },
          },
        },
        include: {
          packages: true,
          items: { include: { product: true } },
          partner: true,
          warehouse: true,
        },
      });

      // 5. Sync parent order
      await syncShipmentToParentOrder(tx, newShipment, 'READY_FOR_DISPATCH');

      return newShipment;
    });
  }

  /**
   * Transition shipment status
   */
  static async updateStatus({ shipmentId, targetStatus, location, remarks, source = 'ADMIN_MANUAL' }) {
    return await prisma.$transaction(async (tx) => {
      const shipment = await tx.logisticsShipment.findUnique({
        where: { id: shipmentId },
        include: { partner: true },
      });

      if (!shipment) throw new Error('Shipment not found.');

      if (!isValidTransition(shipment.status, targetStatus)) {
        throw new Error(
          `Invalid state transition: Cannot move from "${shipment.status}" to "${targetStatus}".`
        );
      }

      const updateData = { status: targetStatus };
      if (targetStatus === 'DELIVERED') {
        updateData.actualDeliveryDate = new Date();
      }

      const updated = await tx.logisticsShipment.update({
        where: { id: shipmentId },
        data: updateData,
        include: { partner: true, warehouse: true },
      });

      // Log tracking event
      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId,
          status: targetStatus,
          eventName: targetStatus,
          location: location || `${updated.warehouse?.city || 'In Transit'}`,
          description: remarks || `Shipment marked as ${targetStatus}.`,
          source,
        },
      });

      // Sync parent order
      await syncShipmentToParentOrder(tx, updated, targetStatus);

      return updated;
    });
  }
}
