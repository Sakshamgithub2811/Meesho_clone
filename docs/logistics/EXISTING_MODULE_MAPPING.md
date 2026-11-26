# Existing Module Mapping & Dependency Analysis
**Document:** `docs/logistics/EXISTING_MODULE_MAPPING.md`  
**Scope:** Integration bridges between Meesho E-commerce Core and the new Supply Chain Logistics Module  
**Status:** Validated Architecture Reference  

---

## 1. Module Integration Matrix

The Logistics Management Panel is designed as a modular sub-system that connects directly into the existing operational modules through clean dependency boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      EXISTING E-COMMERCE CORE                          │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Order Management  │ Inventory/Catalog │ Customer & Returns Management  │
│ (Order, OrderItem)│ (Product, Cat)    │ (Address, ReturnRequest, User) │
└─────────┬─────────┴─────────┬─────────┴───────────────┬────────────────┘
          │                   │                         │
          ▼                   ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LOGISTICS INTEGRATION LAYER (ADAPTERS & EVENTS)           │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Order-to-Shipment │ Stock Allocation  │ Reverse Logistics & Pickup     │
│ Synchronizer      │ & Reservation     │ Coordinator                    │
└─────────┬─────────┴─────────┬─────────┴───────────────┬────────────────┘
          │                   │                         │
          ▼                   ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NEW SUPPLY CHAIN LOGISTICS PANEL                     │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│ 1. Dashboard    │ 2. Shipments    │ 3. Warehouses    │ 4. Transporters │
│ 5. Pickups      │ 6. Manifests    │ 7. Fleet/Drivers │ 8. Tracking/NDR │
│ 9. POD & Deliv  │ 10. Documents   │ 11. Rate Cards   │ 12. Analytics   │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

---

## 2. Granular Module Dependency Map

### 2.1 Order Management Integration
- **Source Files [VERIFIED FACT]**:
  - `backend/src/controllers/order.controller.js`
  - `backend/src/controllers/admin/adminOrders.controller.js`
  - `backend/src/routes/order.routes.js`, `backend/src/routes/admin/adminOrders.routes.js`
  - Database Table: `Order`, `OrderItem`
- **Integration Points**:
  1. **Order Confirmation Trigger**: When an order reaches status `CONFIRMED`, it becomes visible in the Logistics Panel under `Awaiting Shipment`.
  2. **Shipment Creation Sync**: When a shipment is created in the Logistics module, the parent `Order.orderStatus` updates to `SHIPPED` (or partial status if multi-package). The generated `trackingNumber` (AWB) and `courierPartner` are written to both the new `LogisticsShipment` table and backwards-compatibly synced into `Order.shippingAddress` JSON.
  3. **Order Completion**: When the logistics courier or driver marks the shipment as `DELIVERED` with valid Proof of Delivery (POD), `Order.orderStatus` transitions to `DELIVERED`. If `Order.paymentMethod === 'COD'` and `Order.paymentStatus === 'PENDING'`, it automatically transitions to `PAID`.
  4. **Order Cancellation Handling**: If an order is cancelled via `order.controller.js:cancelOrder`, any active `LogisticsShipment` in status `CREATED` or `READY_FOR_PICKUP` is automatically flagged as `CANCELLED`, its stock reservation is released, and the courier pickup is withdrawn.

### 2.2 Inventory & Product Catalog Integration
- **Source Files [VERIFIED FACT]**:
  - `backend/src/controllers/product.controller.js`
  - `backend/src/controllers/admin/adminProducts.controller.js`
  - Database Table: `Product` (fields: `id`, `title`, `price`, `stock`, `sku`, `supplierId`, `isFreeDelivery`)
- **Integration Points**:
  1. **Zero Stock Duplication Guarantee**: The existing `Product.stock` represents the master platform-wide available stock. The new warehouse module maps inventory *across physical locations* without creating duplicate stock records.
  2. **Weight & Volumetric Metrics**: The logistics rate calculator pulls product physical specs (dimensions `L x W x H` in cm, dead weight in grams) from the product record or applies intelligent category defaults if unspecified.
  3. **Stock Reservation**: When an order is allocated to a warehouse for packing, a temporary stock reservation lock is placed to prevent overselling before actual physical dispatch.

### 2.3 Supplier / Seller Fulfillment Hub Integration
- **Source Files [VERIFIED FACT]**:
  - `backend/src/controllers/supplier/supplier.controller.js`
  - `backend/src/routes/supplier.routes.js`
  - `frontend/src/pages/supplier/SellerOrders1.jsx`
- **Integration Points**:
  1. **First-Mile Warehouse Pickup**: When a supplier marks an order item as ready, the logistics module generates a pickup request for the supplier's registered warehouse address (`Profile.bankDetails.warehouseAddress` or `logistics_warehouses`).
  2. **Manifest Generation**: Transporter handover manifests group orders by supplier and assigned carrier, allowing 1-click bulk handover scanning.

### 2.4 Returns & Reverse Logistics Integration
- **Source Files [VERIFIED FACT]**:
  - `backend/src/controllers/admin/adminReturns.controller.js`
  - `backend/src/controllers/return.controller.js`
  - Database Table: `ReturnRequest` (fields: `id`, `orderId`, `reason`, `status`, `images`)
- **Integration Points**:
  1. **Reverse Pickup Creation**: When an admin approves a return (`status = 'approved'`), a reverse shipment is auto-generated with reverse AWB tracking.
  2. **Driver Reverse Pickup Mobile Screen [VERIFIED FACT]**: The existing frontend screen `driver_reverse_pickup.jsx` will be connected to the backend reverse logistics endpoint for on-site QC verification (checking tags, physical damage, wrong item).
  3. **Customer Wallet Refund Trigger**: When the returned package is checked in at the return hub and verified, the existing `adminReturns.controller.js:updateReturnStatus` workflow triggers the atomic credit to the customer's wallet.

### 2.5 Finance, COD & Escrow Reconciliation
- **Source Files [VERIFIED FACT]**:
  - `backend/src/controllers/payment.controller.js`
  - `backend/src/controllers/admin/adminFinance.controller.js`
  - Database Tables: `Wallet`, `WalletTransaction`
- **Integration Points**:
  1. **COD Cash Remittance**: Logistics tracks courier COD remittances against delivered COD orders.
  2. **Freight Expense Tracking**: Logistics stores actual freight charges invoiced by courier partners against estimated rates quoted at checkout.

### 2.6 Notification & Alert System Integration
- **Source Files [VERIFIED FACT]**:
  - `backend/src/controllers/notification.controller.js`
  - `backend/src/services/fcm.service.js`
  - Database Tables: `Notification`, `FcmDevice`
- **Integration Points**:
  1. In-app alerts: Creates notifications in `Notification` table on key shipment events (`SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERY_FAILED`, `DELIVERED`).
  2. Web/Mobile push: Triggers `fcm.service.js` for real-time delivery status updates.
  3. Delivery OTP: Leverages `dispatchDeliveryOtpEmail` from `order.controller.js` for secure handshake on final drop.

---

## 3. Reusable Assets & Services Inventory

| Asset Name | Location | Capability / Purpose | Reuse Strategy |
| :--- | :--- | :--- | :--- |
| `DashboardLayout.jsx` | `frontend/src/components/layout/` | Sidebar, Header, Collapsible navigation, Role banner | Directly host the Logistics Panel in the admin interface. |
| `invoicePdf.service.js` | `backend/src/services/` | PDFKit A4 invoice and 4x6 thermal shipping label generator | Enhance with carrier barcodes, routing codes, and manifest templates. |
| `auditLogger.js` | `backend/src/utils/` | File-backed immutable admin action audit logger | Record all critical logistics actions (AWB generation, NDR override, driver assignment). |
| `OrderSoundAlertWidget.jsx` | `frontend/src/components/admin/orders/` | Audio chime and radar banner on new orders | Reuse chime alerts for incoming pickup requests and critical NDR alerts. |
| `csvExport.js` / `csvExporter.js` | `frontend/src/utils/` | Data table CSV export generator | Export shipment manifests, daily dispatch logs, and carrier performance reports. |
| `auth.middleware.js` | `backend/src/middlewares/` | `verifyAuth` & `authorizeRole` RBAC middleware | Protect logistics API endpoints using `ADMIN`, `LOGISTICS_ADMIN`, `WAREHOUSE_MANAGER`. |
| `FilterBar.jsx` | `frontend/src/components/common/` | Reusable search, status tabs, and date filters | Standardize filter controls across all 16 logistics dashboard views. |
