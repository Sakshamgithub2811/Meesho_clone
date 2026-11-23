import prisma from '../../config/prisma.js';

// Strict directed state graph
export const ALLOWED_STATUS_TRANSITIONS = {
  ORDER_CONFIRMED: ['AWAITING_FULFILLMENT', 'READY_FOR_DISPATCH', 'CANCELLED'],
  AWAITING_FULFILLMENT: ['READY_FOR_DISPATCH', 'CANCELLED'],
  READY_FOR_DISPATCH: ['PICKUP_SCHEDULED', 'PICKED_UP', 'CANCELLED'],
  PICKUP_SCHEDULED: ['PICKED_UP', 'READY_FOR_DISPATCH', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['REACHED_DESTINATION_HUB', 'OUT_FOR_DELIVERY', 'DELAYED'],
  REACHED_DESTINATION_HUB: ['OUT_FOR_DELIVERY', 'DELAYED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_ATTEMPTED', 'DELIVERY_FAILED'],
  DELIVERY_ATTEMPTED: ['OUT_FOR_DELIVERY', 'RTO_INITIATED'],
  DELIVERY_FAILED: ['OUT_FOR_DELIVERY', 'RTO_INITIATED'],
  RTO_INITIATED: ['RTO_IN_TRANSIT'],
  RTO_IN_TRANSIT: ['RETURNED_TO_WAREHOUSE'],
  RETURNED_TO_WAREHOUSE: [], // Terminal
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [], // Terminal
};

// Map logistics status to parent Order status
export const LOGISTICS_TO_ORDER_STATUS_MAP = {
  ORDER_CONFIRMED: 'CONFIRMED',
  READY_FOR_DISPATCH: 'CONFIRMED',
  PICKED_UP: 'SHIPPED',
  IN_TRANSIT: 'SHIPPED',
  REACHED_DESTINATION_HUB: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERY_CONFIRMED', // Triggers DELIVERED
  DELIVERY_ATTEMPTED: 'OUT_FOR_DELIVERY',
  RTO_INITIATED: 'RETURN_REQUESTED',
  RETURNED_TO_WAREHOUSE: 'RETURNED',
  CANCELLED: 'CANCELLED',
};

/**
 * Validates whether a state hop is legal
 */
export function isValidTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Synchronizes parent Order status and shippingAddress JSON
 */
export async function syncShipmentToParentOrder(tx, shipment, targetStatus) {
  const mappedOrderStatus = LOGISTICS_TO_ORDER_STATUS_MAP[targetStatus];
  if (!mappedOrderStatus || !shipment.orderId) return;

  const currentOrder = await tx.order.findUnique({
    where: { id: shipment.orderId },
    select: { id: true, shippingAddress: true, paymentMethod: true, paymentStatus: true },
  });

  if (!currentOrder) return;

  const existingAddr = typeof currentOrder.shippingAddress === 'object' && currentOrder.shippingAddress !== null
    ? currentOrder.shippingAddress
    : {};

  const updatedAddress = {
    ...existingAddr,
    courier: shipment.partner?.name || existingAddr.courier || 'Delhivery',
    awb: shipment.awbNumber || existingAddr.awb,
    trackingNumber: shipment.awbNumber || existingAddr.trackingNumber,
    trackingUrl: shipment.partner?.trackingUrlTemplate
      ? shipment.partner.trackingUrlTemplate.replace('{AWB}', shipment.awbNumber)
      : existingAddr.trackingUrl,
    shippingStatus: targetStatus,
    lastUpdated: new Date().toISOString(),
  };

  const updateData = {
    shippingAddress: updatedAddress,
  };

  if (targetStatus === 'PICKED_UP' || targetStatus === 'IN_TRANSIT') {
    updateData.orderStatus = 'SHIPPED';
  } else if (targetStatus === 'OUT_FOR_DELIVERY') {
    updateData.orderStatus = 'OUT_FOR_DELIVERY';
  } else if (targetStatus === 'DELIVERED') {
    updateData.orderStatus = 'DELIVERED';
    if (currentOrder.paymentMethod === 'COD' && currentOrder.paymentStatus === 'PENDING') {
      updateData.paymentStatus = 'PAID';
    }
  } else if (targetStatus === 'RETURNED_TO_WAREHOUSE') {
    updateData.orderStatus = 'RETURNED';
  } else if (targetStatus === 'CANCELLED') {
    updateData.orderStatus = 'CANCELLED';
  }

  await tx.order.update({
    where: { id: shipment.orderId },
    data: updateData,
  });
}
