# Business Workflows & State Machine Specifications
**Document:** `docs/logistics/BUSINESS_WORKFLOW.md`  
**Purpose:** End-to-End Operational Lifecycle Diagrams, Transitions & Exception Paths  
**Status:** Architecture Blueprint  

---

## 1. End-to-End Order-to-Delivery Master Workflow

The lifecycle bridges the existing e-commerce checkout with warehouse fulfillment, transporter logistics, and final delivery:

```mermaid
flowchart TD
    %% Order Placement & Validation
    A([Customer Places Order]) --> B[Payment Verified / COD Approved]
    B --> C{Inventory Check}
    C -- Out of Stock --> C1[Backorder / Cancellation Alert]
    C -- In Stock --> D[Order Status: CONFIRMED]
    
    %% Warehouse Allocation & Picking
    D --> E[Fulfillment Routing Engine: Assign Warehouse / Supplier Node]
    E --> F[Create Logistics Shipment Record: SHP-ID Generated]
    F --> G[Generate Pick List & Reserve Inventory]
    G --> H[Warehouse Staff: Picking in Progress]
    H --> I[Packing Station: Scan & Pack Verification]
    
    %% Documentation & Staging
    I --> J[Capture Package Weight & Dimensions]
    J --> K[Generate 4x6 Thermal Shipping Label & Packing Slip]
    K --> L[Shipment Status: READY_FOR_DISPATCH]
    
    %% Transporter Assignment & Handover
    L --> M[Assign Courier / Transporter based on Rate Card & SLA]
    M --> N[Generate Carrier AWB / Tracking Reference]
    N --> O[Create Transporter Dispatch Manifest]
    O --> P[First-Mile Courier Pickup & Handover Scan]
    P --> Q[Shipment Status: PICKED_UP]
    Q --> R[Parent Order Status: SHIPPED]
    
    %% In-Transit & Line-Haul
    R --> S[In-Transit: Mother Hub to Destination Hub]
    S --> T[Arrival at Destination Delivery Center]
    T --> U[Out for Delivery: Assigned to Last-Mile Driver]
    U --> V[Send Out-for-Delivery Push & Delivery OTP to Buyer]
    
    %% Final Delivery Handshake
    V --> W{Delivery Attempt}
    W -- Success --> X[Verify OTP / Digital Signature / Capture Geolocation]
    X --> Y[Shipment Status: DELIVERED]
    Y --> Z[Parent Order Status: DELIVERED]
    Z --> AA{Is Order COD?}
    AA -- Yes --> AB[Update Payment Status: PAID & Remit Cash]
    AA -- No --> AC[Fulfillment Cycle Completed]
    
    %% Delivery Failure Path
    W -- Failed --> AD[Log NDR Reason: Customer Unavailable / Wrong Address]
    AD --> AE[Shipment Status: DELIVERY_ATTEMPTED]
    AE --> AF{Max Attempts <= 3?}
    AF -- Yes --> AG[Automated Customer SMS / WhatsApp Reattempt Reschedule]
    AG --> U
    AF -- No --> AH[Initiate Return-to-Origin: RTO_INITIATED]
    AH --> AI[Reverse In-Transit to Origin Warehouse]
    AI --> AJ[Warehouse Inbound QC Scan]
    AJ --> AK[Shipment Status: RETURNED_TO_WAREHOUSE]
    AK --> AL[Restock Inventory & Notify Customer/Seller]
```

---

## 2. Comprehensive Status State Machine & Guardrails

To prevent data corruption, status transitions must obey a strict directed graph:

| Current Status | Allowed Next Statuses | Trigger Event | Trigger Actor |
| :--- | :--- | :--- | :--- |
| `ORDER_CONFIRMED` | `AWAITING_FULFILLMENT`, `CANCELLED` | Order paid or COD confirmed | E-commerce Core / System |
| `AWAITING_FULFILLMENT` | `READY_TO_PICK`, `CANCELLED` | Warehouse allocated | Logistics Engine |
| `READY_TO_PICK` | `PICKING_IN_PROGRESS`, `CANCELLED` | Pick list printed / started | Warehouse Operator |
| `PICKING_IN_PROGRESS` | `PACKING_COMPLETED`, `READY_TO_PICK` (Re-queue) | Items picked from bins | Warehouse Operator |
| `PACKING_COMPLETED` | `READY_FOR_DISPATCH`, `CANCELLED` | Box verified and packed | Packing Station |
| `READY_FOR_DISPATCH` | `PICKUP_SCHEDULED`, `PICKED_UP`, `CANCELLED` | Manifest generated | Dispatch Executive |
| `PICKUP_SCHEDULED` | `PICKED_UP`, `READY_FOR_DISPATCH` (Reschedule) | Transporter pickup scan | Courier Partner / Driver |
| `PICKED_UP` | `IN_TRANSIT`, `CANCELLED` (Pre-haul) | Transporter origin hub scan | Courier Partner / System |
| `IN_TRANSIT` | `REACHED_DESTINATION_HUB`, `DELAYED` | Hub in-scan milestone | Courier Partner Webhook / Tracking |
| `REACHED_DESTINATION_HUB` | `OUT_FOR_DELIVERY`, `DELAYED` | Loaded to delivery van | Delivery Center Supervisor |
| `OUT_FOR_DELIVERY` | `DELIVERED`, `DELIVERY_ATTEMPTED`, `DELIVERY_FAILED` | Delivery driver action | Field Rider / Courier Agent |
| `DELIVERY_ATTEMPTED` | `OUT_FOR_DELIVERY` (Reattempt), `RTO_INITIATED` | Reattempt scheduled or max attempts breached | NDR Executive / Automated Bot |
| `DELIVERY_FAILED` | `OUT_FOR_DELIVERY`, `RTO_INITIATED` | Final resolution | Logistics Manager |
| `RTO_INITIATED` | `RTO_IN_TRANSIT` | Return line-haul created | Courier Partner |
| `RTO_IN_TRANSIT` | `RETURNED_TO_WAREHOUSE` | Origin warehouse receiving scan | Warehouse Inbound Dock |
| `DELIVERED` | `RETURN_REQUESTED` | Customer return claim | Customer App |
| `RETURNED_TO_WAREHOUSE` | *Terminal State* | QC verified & restocked | Warehouse QC Manager |
| `CANCELLED` | *Terminal State* | Order cancelled | Admin / Customer |

---

## 3. Secondary Operational Workflows

### 3.1 Order Cancellation While in Logistics Pipeline
1. **Pre-Dispatch Cancellation (`READY_FOR_PICKUP` or earlier)**:
   - Cancellation flag is set.
   - Warehouse stock reservation is instantaneously released.
   - Shipment is marked `CANCELLED`.
   - The parcel is flagged at the packing/dispatch station as "DO NOT DISPATCH - RETURN TO BIN".
2. **Post-Dispatch Cancellation (`PICKED_UP` or `IN_TRANSIT`)**:
   - Transporter API is sent a "Return Consignment In-Transit" request (RTO).
   - Courier updates route to redirect the parcel back to origin.
   - Status updates directly to `RTO_INITIATED`.

### 3.2 Partial Shipment & Multi-Package Workflow
1. When an order contains items located across multiple warehouses or seller locations:
   - The Order-to-Shipment engine splits the order items into separate shipments (`Shipment 1`, `Shipment 2`).
   - Each shipment obtains its own unique Shipment ID and independent AWB tracking number.
   - The parent `Order` status reflects `PARTIALLY_SHIPPED` until all shipments are in transit, at which point it reflects `SHIPPED`.
   - Customer tracking displays itemized parcels under a unified parent order view.

### 3.3 Customer Return & Reverse Logistics Workflow
1. Customer initiates return request in `CustomerOrders` -> `ReturnRequest` table record created.
2. Admin reviews claim in `AdminReturnsManagement.jsx`.
3. Upon approval:
   - Reverse logistics engine schedules a return pickup at customer's address.
   - Reverse AWB is generated and assigned to a return courier partner.
   - Courier agent / field rider arrives, performs doorstep quality inspection using `driver_reverse_pickup.jsx` (checks barcode, brand tag, unused condition).
   - Upon pickup confirmation, status updates to `RETURN_PICKED_UP`.
   - In-transit reverse shipment tracking monitors return to origin depot.
   - Origin warehouse receives parcel, performs final QC scan.
   - System triggers customer wallet refund via `adminReturns.controller.js:updateReturnStatus`.

### 3.4 Non-Delivery Report (NDR) Management Workflow
```mermaid
flowchart LR
    A[Courier Reports NDR: Delivery Attempted] --> B{NDR Reason}
    B -->|Customer Unavailable| C[Send Automated WhatsApp / SMS with 1-Click Reschedule Link]
    B -->|Wrong Address / Landmark Needed| D[Customer Submits Address Correction Form]
    B -->|Customer Refused COD| E[Call Center Executive Outreach / Confirm Willingness]
    C & D & E --> F{Customer Confirms Reattempt?}
    F -->|Yes| G[Send Courier API: Reschedule Reattempt for Selected Date]
    G --> H[Re-dispatch Out for Delivery]
    F -->|No / No Response after 3 Attempts| I[Trigger Automated RTO]
```
