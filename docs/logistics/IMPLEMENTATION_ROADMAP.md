# Step-by-Step Implementation Roadmap
**Document:** `docs/logistics/IMPLEMENTATION_ROADMAP.md`  
**Execution Strategy:** Small, controlled, non-breaking modular phases  
**Approval Required:** Implementation commences only after review and approval of this plan  
**Status:** Architecture Blueprint  

---

## Roadmap Overview

```
Phase 1: Database Schema & Migration
  │ (Prisma schema additions, non-destructive migration, seed data)
  ▼
Phase 2: Core Backend Engine & Services
  │ (Shipment service, state machine, tracking engine, carrier adapter)
  ▼
Phase 3: Order Fulfillment, Manifests & Document Generator
  │ (Pick/pack workflow, PDFKit thermal label & manifest generator)
  ▼
Phase 4: Courier Partners, Rate Cards & NDR Management
  │ (Rate calculation engine, PIN code serviceability, NDR workflow)
  ▼
Phase 5: Frontend Logistics Panel UI/UX
  │ (Admin navigation integration, 16 dedicated views, modals, drawers)
  ▼
Phase 6: End-to-End E-Commerce Synchronization & Verification
  │ (Order status sync, wallet refund triggers, notification dispatches)
```

---

## Detailed Phase Breakdown

### Phase 1: Database Schema Extension & Seed Data
- **Objective**: Extend `prisma/schema.prisma` with the 16 logistics models without modifying any existing tables.
- **Files to Modify**: `backend/prisma/schema.prisma`.
- **Files to Create**: `backend/prisma/seedLogistics.js`.
- **Verification Criteria**: `npx prisma validate` passes; `npx prisma generate` succeeds; seed script populates default carriers (Delhivery, BlueDart, Shadowfax) and a central warehouse.

### Phase 2: Core Backend Services & API Layer
- **Objective**: Implement core CRUD and business logic controllers for shipments, warehouses, and tracking.
- **Files to Create**:
  - `backend/src/routes/logistics/logistics.routes.js`
  - `backend/src/controllers/logistics/shipment.controller.js`
  - `backend/src/controllers/logistics/warehouse.controller.js`
  - `backend/src/controllers/logistics/tracking.controller.js`
  - `backend/src/services/logistics/shipment.service.js`
  - `backend/src/services/logistics/trackingStateMachine.js`
- **Files to Modify**: `backend/src/routes/api.routes.js` (mount `/logistics` router).
- **Verification Criteria**: Automated unit and integration tests verify state machine blocks invalid status hops.

### Phase 3: Order-to-Shipment Fulfillment & Document Generation
- **Objective**: Connect existing orders to shipment creation; generate 4x6 thermal shipping labels and manifests.
- **Files to Create**:
  - `backend/src/services/logistics/manifestPdf.service.js`
  - `backend/src/controllers/logistics/manifest.controller.js`
  - `backend/src/controllers/logistics/pickup.controller.js`
- **Files to Modify**: `backend/src/services/invoicePdf.service.js` (enrich label barcode formatting).
- **Verification Criteria**: Orders in `CONFIRMED` status convert to shipments; PDF label streams with scannable Code128 barcode.

### Phase 4: Carrier Rate Engine, PIN Code Lookup & NDR Exception Desk
- **Objective**: Implement zonal freight calculation, serviceability verification, and delivery attempt logging.
- **Files to Create**:
  - `backend/src/services/logistics/rateEngine.service.js`
  - `backend/src/controllers/logistics/rateCard.controller.js`
  - `backend/src/controllers/logistics/ndr.controller.js`
  - `backend/src/services/logistics/adapters/carrierAdapterFactory.js`
  - `backend/src/services/logistics/adapters/mockCarrierAdapter.js`
- **Verification Criteria**: Freight calculation matches zonal formulas; NDR reattempt triggers customer outreach.

### Phase 5: Frontend Logistics Management Panel
- **Objective**: Build the full React logistics interface inside the existing Admin Panel.
- **Files to Create**:
  - `frontend/src/components/admin/logistics/AdminLogisticsPanel.jsx`
  - `frontend/src/components/admin/logistics/dashboard/LogisticsKPISection.jsx`
  - `frontend/src/components/admin/logistics/shipments/ShipmentsTable.jsx`
  - `frontend/src/components/admin/logistics/shipments/ShipmentDetailDrawer.jsx`
  - `frontend/src/components/admin/logistics/shipments/CreateShipmentModal.jsx`
  - `frontend/src/components/admin/logistics/warehouses/WarehousesList.jsx`
  - `frontend/src/components/admin/logistics/partners/CarrierPartnerCards.jsx`
  - `frontend/src/components/admin/logistics/documents/ThermalLabelPreviewModal.jsx`
  - `frontend/src/services/logisticsApiService.js`
- **Files to Modify**:
  - `frontend/src/pages/admin_panel/admin_web_panel1.jsx` (add logistics to `ADMIN_MENU` and tab switch).
- **Verification Criteria**: All 16 logistics sub-views render crisply with empty, loading, and active data states matching Meesho design tokens.

### Phase 6: E-Commerce Ecosystem Integration & QA Verification
- **Objective**: Validate complete round-trip flow from checkout to order delivery and wallet settlement.
- **Files to Modify**:
  - `backend/src/controllers/order.controller.js` (hook into cancellation).
  - `backend/src/controllers/admin/adminReturns.controller.js` (hook into reverse pickup).
- **Verification Criteria**: Placing an order, shipping it, delivering it, and returning it executes with zero errors and leaves all existing e-commerce modules intact.
