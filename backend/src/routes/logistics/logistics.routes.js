import { Router } from 'express';
import { verifyFirebaseAuth, authorizeLogisticsRole } from '../../middlewares/firebaseAuth.middleware.js';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
} from '../../controllers/logistics/shipment.controller.js';
import {
  getWarehouses,
  createWarehouse,
} from '../../controllers/logistics/warehouse.controller.js';

const router = Router();

// Apply Pure Firebase Authentication to all Logistics Endpoints
router.use(verifyFirebaseAuth);

// ── Shipments Endpoints ──────────────────────────────────────────
router.get('/shipments', authorizeLogisticsRole('ADMIN', 'LOGISTICS_ADMIN', 'WAREHOUSE_MANAGER'), getShipments);
router.get('/shipments/:id', authorizeLogisticsRole('ADMIN', 'LOGISTICS_ADMIN', 'WAREHOUSE_MANAGER'), getShipmentById);
router.post('/shipments', authorizeLogisticsRole('ADMIN', 'LOGISTICS_ADMIN', 'WAREHOUSE_MANAGER'), createShipment);
router.patch('/shipments/:id/status', authorizeLogisticsRole('ADMIN', 'LOGISTICS_ADMIN', 'WAREHOUSE_MANAGER'), updateShipmentStatus);

// ── Warehouses Endpoints ─────────────────────────────────────────
router.get('/warehouses', authorizeLogisticsRole('ADMIN', 'LOGISTICS_ADMIN', 'WAREHOUSE_MANAGER'), getWarehouses);
router.post('/warehouses', authorizeLogisticsRole('ADMIN', 'LOGISTICS_ADMIN'), createWarehouse);

export default router;
