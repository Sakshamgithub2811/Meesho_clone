# Quality Assurance & Testing Strategy
**Document:** `docs/logistics/TESTING_STRATEGY.md`  
**Purpose:** Comprehensive verification framework covering unit, integration, state machine, and regression testing  
**Status:** Architecture Blueprint  

---

## 1. Testing Scope & Methodology

Testing is structured across 4 distinct verification layers:
1. **Unit Tests**: State machine transitions, rate calculation formulas, volumetric weight logic, barcode generation.
2. **Integration Tests**: Order-to-shipment creation, manifest generation, pickup scheduling, courier webhook handling.
3. **E2E Business Workflow Tests**: Complete round-trip lifecycle from order placement -> picking -> packing -> dispatch -> delivery -> returns.
4. **Zero-Regression Testing**: Verifying existing modules (customer checkout, supplier catalog, admin analytics, customer wallet) operate with zero degradation.

---

## 2. Detailed Test Matrix

| Test ID | Test Scenario | Expected Outcome | Verification Method |
| :--- | :--- | :--- | :--- |
| **TC-LOG-01** | **Shipment Creation** | Confirmed order converts to active shipment with unique `SHP-*` and `AWB` numbers. | API test against `POST /shipments/create`. Verify record in `logistics_shipments`. |
| **TC-LOG-02** | **Duplicate Shipment Prevention** | Attempting to create a second shipment for an already shipped order item fails with `409 Conflict`. | Submit duplicate order payload. Verify idempotent rejection. |
| **TC-LOG-03** | **Inventory Reservation** | When shipment reaches `PACKING_COMPLETED`, warehouse `reserved_stock` increments, preventing stock race conditions. | Query `logistics_warehouse_stock` before and after allocation. |
| **TC-LOG-04** | **Stock Release on Cancel** | Order cancellation while in `READY_TO_PICK` releases reservation back to available stock. | Call `cancelOrder`. Verify `reserved_stock` decrements and `available_stock` restores. |
| **TC-LOG-05** | **State Machine Guardrails** | Attempting illegal status transition (e.g. `PICKING_IN_PROGRESS` directly to `DELIVERED`) is rejected with `400 Bad Request`. | PATCH status with invalid hop. Verify error code `INVALID_STATUS_TRANSITION`. |
| **TC-LOG-06** | **Volumetric Weight Calculation** | Dimensions 30x20x10 cm with dead weight 500g produces volumetric weight 1.2kg; billable weight is set to 1.2kg. | Unit test `rateEngine.service.js`. Formula: `(30×20×10)/5000 = 1.2kg`. |
| **TC-LOG-07** | **Rate Card Calculation** | Zone B shipment of 1.2kg at base rate ₹45 (500g) + 2 slabs of ₹25 calculates correctly to ₹95 + GST. | Test rate engine against `logistics_rate_cards`. |
| **TC-LOG-08** | **Thermal Shipping Label PDF** | 4x6 inch PDF streams with crisp Code128 vector barcode and valid routing headers. | Inspect generated PDF buffer size and barcode crispness. |
| **TC-LOG-09** | **Manifest Handover** | Multiple ready shipments group into a single manifest; status updates to `PICKED_UP`. | Generate manifest. Verify all child shipments transition to `PICKED_UP`. |
| **TC-LOG-10** | **NDR Reattempt Workflow** | Failed delivery logs attempt #1; automated notification sent to buyer; customer rescheduled date accepted. | Post NDR event. Check `delivery_attempts` table and customer notification. |
| **TC-LOG-11** | **RTO Trigger after 3 Attempts**| When 3rd delivery attempt fails, status automatically transitions to `RTO_INITIATED`. | Post 3 consecutive failed delivery attempts. Verify auto-RTO. |
| **TC-LOG-12** | **Proof of Delivery (POD)** | Valid OTP submission marks shipment `DELIVERED` and auto-marks COD order as `PAID`. | Call `confirm-pod`. Verify `Order.orderStatus = DELIVERED` and `paymentStatus = PAID`. |
| **TC-LOG-13** | **Reverse Logistics Refund** | Reverse shipment return check-in at warehouse dock triggers customer wallet credit atomically. | Complete reverse inbound scan. Verify `Wallet.balance` increment and `WalletTransaction` record. |
| **TC-LOG-14** | **RBAC Enforcement** | User without `LOGISTICS_ADMIN` or `ADMIN` role is blocked from modifying rate cards (`403 Forbidden`). | Send request with customer JWT token. Verify `403 Forbidden`. |
| **TC-LOG-15** | **Existing E-Commerce Regression** | Existing customer checkout, cart, payment, supplier orders, and admin KYC tabs function identically. | Run existing smoke tests on frontend and backend. |
