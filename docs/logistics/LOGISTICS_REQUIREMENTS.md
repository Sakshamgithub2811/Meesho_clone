# Complete Logistics Module Requirements Specification
**Document:** `docs/logistics/LOGISTICS_REQUIREMENTS.md`  
**Standard:** Enterprise Supply Chain Management (SCM) & E-Commerce Logistics Specification  
**Status:** Architecture Blueprint  

---

## Module 1: Logistics Command Dashboard
A centralized administrative control center providing real-time visibility into the end-to-end supply chain pipeline.
- **Key Performance Indicators (KPIs)**:
  - Total Orders Awaiting Logistics Allocation
  - Pending Shipment Requests
  - Orders Ready for Dispatch / Manifesting
  - Pending Courier Pickup
  - In-Transit Active Shipments
  - Out-for-Delivery Last-Mile Shipments
  - Successfully Delivered Shipments (Today / MTD / YTD)
  - Delayed Shipments (Breaching SLA)
  - Failed Deliveries & Active Non-Delivery Reports (NDR)
  - Return-to-Origin (RTO) in Transit
  - Cancelled Shipments
  - Total Freight & Logistics Expenses
  - Average Delivery Turnaround Time (TAT in hours/days)
  - On-Time Delivery (OTD) Percentage
- **Interactive Visualizations**:
  - Daily, weekly, and monthly shipment volume charts (Bar / Line).
  - Geographic delivery density map / state-wise performance.
  - Courier partner volume distribution and on-time SLA compliance.
  - Live exception radar for immediate operational intervention.
- **Global Operational Filters**:
  - Date Range (Today, Yesterday, Last 7 Days, Month-to-Date, Custom Range).
  - Origin Warehouse / Fulfillment Hub.
  - Transporter / Courier Partner.
  - Shipping Mode (Surface, Express, Air, Hyperlocal).
  - Payment Method (COD vs Prepaid).

---

## Module 2: Order-to-Shipment Management
Converts confirmed e-commerce orders into physical, transport-ready shipments.
- **Order Ingestion**: Real-time query of orders in `CONFIRMED` or `ORDERED` status from existing `Order` table.
- **Eligibility Validation**: Automated checks verifying complete delivery address, serviceable destination PIN code, and active product stock.
- **Warehouse & Node Allocation**: Intelligent assignment of the nearest fulfillment node or supplier warehouse.
- **Shipment Generation**:
  - Assigns unique system-wide shipment tracking number (`SHP-YYYYMMDD-XXXXXX`).
  - Assigns carrier AWB (Air Waybill) tracking number.
  - Generates shipping method tag (`Standard Surface`, `Express Air`, `Hyperlocal 2-Hour`).
- **Package Dimension & Volumetric Calculations**:
  - Dead weight calculation (sum of item weights).
  - Volumetric weight calculation formula: `(Length × Width × Height in cm) / 5000`.
  - Billable weight determination: `Max(Dead Weight, Volumetric Weight)`.
- **Multi-Package & Partial Shipment Support**:
  - Ability to split multi-item orders into multiple parcels (e.g. bulky items shipped separately).
  - Sub-package tracking with parent order linkage.
- **Label & Slip Generation**:
  - Automated generation of 4x6 thermal shipping labels with Code128 barcodes.
  - Standard packing slips with SKU barcodes and item picking checklists.

---

## Module 3: Warehouse & Inventory Logistics
Coordinates stock storage, picking, packing, and cross-warehouse movements.
- **Warehouse Master Management**:
  - Definition of fulfillment centers, hub depots, and supplier pickup centers.
  - Attributes: Warehouse Code, Name, Address, Contact Person, Phone, Operating Hours, Geolocation (Lat/Lng), Max Daily Capacity.
- **Inventory Location & Bin Mapping**:
  - Zone, Aisle, Rack, and Bin designations for rapid warehouse navigation.
- **Stock Reservation & Allocation Engine**:
  - Locks available inventory upon shipment creation to prevent overselling.
  - Releases locks automatically if the order is cancelled before packing.
- **Pick-Pack-Ship Workflow**:
  - **Pick Lists**: Generates consolidated picking sheets grouped by warehouse zone.
  - **Packing Verification**: Barcode scanning to verify correct SKU and quantity before box sealing.
  - **Package Weighing Station**: Live weight capture to verify against estimated weight.
- **Inter-Warehouse Transfers (Stock Transfer Orders - STO)**:
  - Transfer requests between central mother hubs and regional forward stocking locations.
  - In-transit STO tracking and destination receipt reconciliation.

---

## Module 4: Pickup & Dispatch Management
Manages first-mile courier pickups and dispatch operations.
- **Pickup Request Scheduling**:
  - First-mile pickup requests initiated per warehouse or supplier location.
  - Scheduled pickup slots (Morning, Afternoon, Evening).
  - Transporter acknowledgment and pickup confirmation numbers.
- **Dispatch Manifests (Handover Documentation)**:
  - Grouping shipments into a single Transporter Manifest.
  - Scannable manifest barcode, total package count, total declared weight.
  - Driver/Courier agent physical signature, vehicle number, and timestamp capture upon handover.
  - Bulk status transition from `READY_FOR_DISPATCH` to `PICKED_UP`.
- **Pickup Failure & Rescheduling Handling**:
  - Logging pickup failure reasons (Premises Closed, Parcel Not Ready, Transporter No-Show).
  - One-click rescheduling for subsequent pickup window.

---

## Module 5: Transporter & Courier Partner Management
Comprehensive carrier relationship and performance management.
- **Partner Registry**:
  - Master profile for 3PL couriers (Delhivery, BlueDart, Shadowfax, Xpressbees, Ekart, DTDC, India Post) and internal fleet.
  - API configuration tokens, tracking webhook endpoints, account credentials (encrypted).
- **Serviceability Engine**:
  - PIN code serviceability directory (Regular, Remote/ODA, Non-serviceable).
  - COD availability per PIN code.
  - Reverse pickup capability per PIN code.
- **Rate Cards & SLA Matrix**:
  - Base freight rate, incremental slab rate, COD fees (fixed or percentage).
  - Guaranteed turnaround times (SLA in days) per origin-destination zone pair.
- **Carrier Performance Scorecards**:
  - On-time pickup percentage, delivery success rate, average transit duration, damage/loss claim rate.

---

## Module 6: Fleet & Driver Management (Internal Transportation)
For localized hyper-local deliveries and company-operated delivery fleets.
- **Vehicle Master**:
  - Vehicle ID, Registration Plate, Type (Two-Wheeler, Three-Wheeler, Mini-Truck, Heavy Van), Fuel Type, Volume Capacity (m³), Weight Capacity (kg), Insurance & Pollution Expiry Dates.
- **Driver Master**:
  - Driver Profile, Phone, Driving License Number & Verification, Active Shift Status, Assigned Hub.
- **Trip & Run Sheet Management**:
  - Driver run sheets grouping deliveries along optimized geographical clusters.
  - Fuel expense logging, mileage tracking, and daily trip allowances.
  - Connects to existing driver mobile screens (`available_tasks.jsx`, `active_delivery_mobile.jsx`).

---

## Module 7: Centralized Shipment Tracking & Milestone Timeline
Unified real-time visibility across all logistics lifecycles.
- **Unique Universal Tracking Reference**: Accessible by internal admins, sellers, and end customers.
- **Standardized Milestone Lifecycle**:
  1. `ORDER_CONFIRMED`
  2. `AWAITING_FULFILLMENT`
  3. `READY_TO_PICK`
  4. `PICKING_IN_PROGRESS`
  5. `PACKING_COMPLETED`
  6. `READY_FOR_DISPATCH`
  7. `PICKUP_SCHEDULED`
  8. `PICKED_UP` (First-Mile Done)
  9. `IN_TRANSIT` (Line-Haul Movement)
  10. `REACHED_DESTINATION_HUB`
  11. `OUT_FOR_DELIVERY` (Last-Mile Begun)
  12. `DELIVERED` (Proof of Delivery Recorded)
  13. `DELIVERY_ATTEMPTED` (NDR Raised)
  14. `DELIVERY_FAILED`
  15. `RTO_INITIATED` (Return to Origin Triggered)
  16. `RTO_IN_TRANSIT`
  17. `RETURNED_TO_WAREHOUSE`
  18. `CANCELLED`
- **State Machine Guardrails**: Strict transitions preventing illegal status hops (e.g. jumping from `PICKING` directly to `DELIVERED`).
- **Milestone Audit Trail**: Every status change logs timestamp, location, operator/system source, and detailed remarks.

---

## Module 8: Delivery Management & Non-Delivery Reports (NDR)
Last-mile execution, exception workflows, and Proof of Delivery.
- **Delivery Attempts Management**:
  - Maximum attempt rules (standard 3 attempts before initiating RTO).
  - Standardized NDR reason codes: Customer Unavailable, Address Incomplete, Customer Refused, COD Amount Not Ready, Delivery Area Inaccessible, Requested Later Date.
- **Customer Outreach & Reattempt Scheduling**:
  - Automated SMS/WhatsApp/In-App notification asking customer to confirm alternate delivery date or correct address details.
  - Reattempt dispatch scheduling based on customer feedback.
- **Proof of Delivery (POD)**:
  - OTP verification (leveraging existing delivery OTP service).
  - Digital signature capture.
  - Geolocation (GPS coordinate stamp) at time of delivery.
  - Delivery photo upload (parcel at door / building).

---

## Module 9: Returns & Reverse Logistics
Integrated handling of customer returns and Return-to-Origin (RTO).
- **Reverse Pickup Dispatch**:
  - Automated courier reverse AWB generation upon admin return approval.
  - Courier assignment based on reverse pickup serviceability.
- **Reverse Tracking**: Real-time tracking of the return parcel from buyer doorstep back to supplier/warehouse.
- **Warehouse Inbound Receiving & Quality Inspection (QC)**:
  - Inbound scan at returns dock.
  - Grading condition: Intact (Restockable), Damaged, Wrong Item Sent, Counterfeit.
- **Financial Reconciliation**:
  - Automatic trigger to refund customer wallet (reusing `adminReturns.controller.js`).
  - Allocation of reverse freight shipping charges to appropriate party based on return fault policy.

---

## Module 10: Shipping Documents & Digital Repository
Secure generation, storage, and retrieval of logistics documentation.
- **Document Master**:
  - Shipping Labels (PDFKit 4x6 thermal format with barcodes).
  - Invoices (Tax invoice compliant with Indian GST rules).
  - Transporter Manifests (Consolidated dispatch sheets).
  - Lorry Receipts (LR) / Goods Receipts (GR) for B2B line-haul transport.
  - Delivery Challans.
  - E-Way Bills (support for consignment value exceeding ₹50,000 threshold).
  - Signed Proof of Delivery (POD) image archives.
- **Storage & Security**: Document storage via Supabase Storage buckets or local secure directory with signed access URLs.

---

## Module 11: Logistics Pricing, Rate Engine & Cost Management
Real-time freight rate calculation and reconciliation.
- **Zonal Matrix**:
  - Zone A: Within City (Intra-city).
  - Zone B: Within State (Intra-state).
  - Zone C: Metro to Metro.
  - Zone D: Rest of India (Inter-state).
  - Zone E: Special Zones (North East, Jammu & Kashmir, Remote Islands).
- **Rate Calculation Engine**:
  - Formula: `Total Freight = Base Rate (up to 500g) + (Incremental Slabs × Slab Rate) + COD Fee + Fuel Surcharge + GST (18%)`.
- **Cost Reconciliation Ledger**:
  - Comparison between estimated shipping cost charged at checkout and actual courier invoice bill.
  - Variance flagging (weight discrepancies, unexpected ODA charges).

---

## Module 12: Logistics Analytics & Business Intelligence
Data-driven decision making and reporting.
- **Pre-Built Exportable Reports**:
  - Daily Dispatch & Delivery Performance Report.
  - Courier SLA Compliance & Transit Time Benchmark.
  - NDR Conversion & RTO Loss Rate Analysis.
  - Warehouse Fulfillment Speed (Order to Dispatch Duration).
  - PIN-Code-Wise Delivery Success Heatmap.
  - Freight Cost per Delivered Order.
- **Export Capabilities**: 1-click CSV, Excel, and PDF downloads utilizing existing `csvExporter.js`.

---

## Module 13: Transactional Notifications & Webhooks
Timely, multi-channel customer and internal communication.
- **Trigger Events**:
  - Order Shipped (with live tracking link).
  - Out for Delivery (with delivery boy contact and OTP).
  - Delivery Exception / Failed Attempt (with reattempt scheduling link).
  - Successfully Delivered (with digital POD link).
  - Return Pickup Scheduled & Picked Up.
- **Communication Channels**: In-app database notifications (`Notification` model), Firebase Cloud Messaging Web/Mobile push, transactional email via Nodemailer.

---

## Module 14: Logistics Global Settings & Controls
Centralized operational configuration.
- **Fulfillment Modes**: Standard, Express, Self-Ship (Supplier), Managed 3PL.
- **Default Courier Rules**: Priority rules for auto-assigning couriers based on lowest cost vs fastest SLA.
- **SLA Thresholds**: Configurable expected transit days per zone before a shipment is marked `DELAYED`.
- **Packaging Configurations**: Box types, standard dimensions, tare weights.
- **Carrier API Credentials**: Secure credential vault with frontend masking.
