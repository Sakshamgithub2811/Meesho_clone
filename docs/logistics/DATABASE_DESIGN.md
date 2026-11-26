# Database Architecture & Schema Design
**Document:** `docs/logistics/DATABASE_DESIGN.md`  
**Database Technology:** PostgreSQL (Supabase / Self-Hosted) via Prisma ORM  
**Design Principle:** Zero-destruction, backward-compatible extension to existing schema  
**Status:** Architecture Blueprint  

---

## 1. Schema Integration Strategy

The existing database contains 24 operational tables (`profiles`, `orders`, `order_items`, `products`, `return_requests`, etc.). 

**Core Rules Followed:**
1. **Existing Tables Untouched**: No existing column is deleted, renamed, or converted.
2. **Backward Compatibility**: `Order.shippingAddress` JSON will continue to receive mirrored updates (`courier`, `awb`, `trackingUrl`) so existing customer views remain 100% operational without regression.
3. **Dedicated Domain Prefix**: All new logistics entities use clear domain naming (`logistics_*` or `shipment_*`) to preserve namespace hygiene.
4. **Soft Deletion & Audit Fields**: Every table includes `is_deleted`, `deleted_at`, `created_at`, and `updated_at`.

---

## 2. Comprehensive Entity Specifications

### Table 1: `logistics_warehouses`
*Purpose: Physical warehouses, fulfillment hubs, returns depots, and seller pickup locations.*
- `id`: `UUID` (PK, default uuid())
- `warehouse_code`: `VARCHAR(50)` (Unique, e.g. `WH-DELHI-01`)
- `name`: `VARCHAR(150)` (e.g. `North India Central Fulfillment Hub`)
- `type`: `VARCHAR(50)` (`CENTRAL_HUB`, `REGIONAL_DEPOT`, `SUPPLIER_LOCATION`, `RETURN_CENTER`)
- `contact_person`: `VARCHAR(100)`
- `phone`: `VARCHAR(20)`
- `email`: `VARCHAR(150)`
- `address_line1`: `VARCHAR(255)`
- `address_line2`: `VARCHAR(255)`
- `city`: `VARCHAR(100)`
- `state`: `VARCHAR(100)`
- `pincode`: `VARCHAR(10)` (Indexed)
- `latitude`: `DECIMAL(10, 7)`
- `longitude`: `DECIMAL(10, 7)`
- `operating_hours`: `VARCHAR(100)` (e.g. `08:00 - 20:00 IST`)
- `max_daily_capacity`: `INTEGER` (default 5000)
- `is_active`: `BOOLEAN` (default true)
- `is_deleted`: `BOOLEAN` (default false)
- `created_at`: `TIMESTAMPTZ` (default now())
- `updated_at`: `TIMESTAMPTZ`

### Table 2: `logistics_warehouse_stock`
*Purpose: Distributes existing product stock across physical warehouses without duplicating total platform stock.*
- `id`: `UUID` (PK)
- `warehouse_id`: `UUID` (FK -> `logistics_warehouses.id`, onDelete Cascade)
- `product_id`: `UUID` (FK -> `products.id`, onDelete Cascade)
- `zone`: `VARCHAR(20)` (e.g. `Zone-A`)
- `aisle`: `VARCHAR(20)` (e.g. `Aisle-04`)
- `rack`: `VARCHAR(20)` (e.g. `Rack-B`)
- `bin`: `VARCHAR(20)` (e.g. `Bin-12`)
- `available_stock`: `INTEGER` (default 0)
- `reserved_stock`: `INTEGER` (default 0)
- `damaged_stock`: `INTEGER` (default 0)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`
- *Constraints: Unique(`warehouse_id`, `product_id`, `bin`)*

### Table 3: `logistics_partners`
*Purpose: 3PL courier aggregators, express carriers, and internal transport fleets.*
- `id`: `UUID` (PK)
- `partner_code`: `VARCHAR(50)` (Unique, e.g. `DELHIVERY`, `BLUEDART`, `SHADOWFAX`, `XPRESSBEES`, `FLEET_INTERNAL`)
- `name`: `VARCHAR(100)` (e.g. `Delhivery Surface & Express`)
- `tracking_url_template`: `VARCHAR(255)` (e.g. `https://www.delhivery.com/track/package/{AWB}`)
- `api_endpoint`: `VARCHAR(255)`
- `api_key_encrypted`: `TEXT`
- `webhook_secret`: `VARCHAR(255)`
- `service_type`: `VARCHAR(50)` (`SURFACE`, `AIR`, `HYPERLOCAL`, `MULTI_MODAL`)
- `supports_cod`: `BOOLEAN` (default true)
- `supports_reverse_pickup`: `BOOLEAN` (default true)
- `status`: `VARCHAR(20)` (`ACTIVE`, `INACTIVE`, `SANDBOX`)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### Table 4: `logistics_rate_cards`
*Purpose: Freight pricing calculation rules per carrier, zone, and weight slab.*
- `id`: `UUID` (PK)
- `partner_id`: `UUID` (FK -> `logistics_partners.id`)
- `zone`: `VARCHAR(20)` (`ZONE_A`, `ZONE_B`, `ZONE_C`, `ZONE_D`, `ZONE_E`)
- `base_weight_grams`: `INTEGER` (default 500)
- `base_rate`: `DECIMAL(10, 2)` (e.g. 45.00)
- `incremental_slab_grams`: `INTEGER` (default 500)
- `incremental_slab_rate`: `DECIMAL(10, 2)` (e.g. 25.00)
- `cod_charge_fixed`: `DECIMAL(10, 2)` (default 30.00)
- `cod_charge_percentage`: `DECIMAL(5, 2)` (default 1.50)
- `fuel_surcharge_percentage`: `DECIMAL(5, 2)` (default 5.00)
- `expected_sla_days`: `INTEGER` (default 3)
- `is_active`: `BOOLEAN` (default true)
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### Table 5: `logistics_serviceable_pincodes`
*Purpose: Fast index to verify carrier deliverability and SLAs for any Indian PIN code.*
- `id`: `UUID` (PK)
- `pincode`: `VARCHAR(10)` (Indexed)
- `city`: `VARCHAR(100)`
- `state`: `VARCHAR(100)`
- `zone`: `VARCHAR(20)`
- `partner_id`: `UUID` (FK -> `logistics_partners.id`)
- `is_prepaid_available`: `BOOLEAN` (default true)
- `is_cod_available`: `BOOLEAN` (default true)
- `is_reverse_pickup_available`: `BOOLEAN` (default true)
- `delivery_sla_days`: `INTEGER` (default 3)
- *Index: Composite(`pincode`, `partner_id`)*

### Table 6: `logistics_shipments`
*Purpose: Central system-wide shipment consignment record.*
- `id`: `UUID` (PK)
- `shipment_number`: `VARCHAR(60)` (Unique, e.g. `SHP-20261118-091244`)
- `order_id`: `UUID` (FK -> `orders.id`, Indexed)
- `warehouse_id`: `UUID` (FK -> `logistics_warehouses.id`)
- `partner_id`: `UUID` (FK -> `logistics_partners.id`, Nullable)
- `awb_number`: `VARCHAR(100)` (Unique, Indexed)
- `shipping_mode`: `VARCHAR(50)` (`SURFACE`, `AIR`, `HYPERLOCAL`)
- `status`: `VARCHAR(50)` (Indexed, e.g. `ORDER_CONFIRMED`, `READY_FOR_DISPATCH`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `DELIVERY_ATTEMPTED`, `RTO_INITIATED`, `CANCELLED`)
- `payment_method`: `VARCHAR(20)` (`COD`, `PREPAID`)
- `cod_amount`: `DECIMAL(10, 2)` (default 0.00)
- `total_packages`: `INTEGER` (default 1)
- `dead_weight_kg`: `DECIMAL(8, 3)`
- `volumetric_weight_kg`: `DECIMAL(8, 3)`
- `billable_weight_kg`: `DECIMAL(8, 3)`
- `estimated_shipping_cost`: `DECIMAL(10, 2)`
- `actual_shipping_cost`: `DECIMAL(10, 2)`
- `estimated_delivery_date`: `TIMESTAMPTZ`
- `actual_delivery_date`: `TIMESTAMPTZ`
- `assigned_driver_id`: `VARCHAR(128)` (FK -> `profiles.id`, Nullable)
- `shipping_address_snapshot`: `JSONB`
- `is_deleted`: `BOOLEAN` (default false)
- `created_at`: `TIMESTAMPTZ` (default now())
- `updated_at`: `TIMESTAMPTZ`

### Table 7: `shipment_packages`
*Purpose: Represents physical packages/cartons under a single shipment.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (FK -> `logistics_shipments.id`, onDelete Cascade)
- `package_number`: `VARCHAR(50)` (e.g. `PKG-SHP-091244-01`)
- `box_type`: `VARCHAR(50)` (`SMALL_BOX`, `MEDIUM_BOX`, `LARGE_CARTON`, `POLY_MAILER`)
- `length_cm`: `DECIMAL(6, 2)`
- `width_cm`: `DECIMAL(6, 2)`
- `height_cm`: `DECIMAL(6, 2)`
- `weight_kg`: `DECIMAL(8, 3)`
- `barcode`: `VARCHAR(100)`
- `created_at`: `TIMESTAMPTZ`

### Table 8: `shipment_items`
*Purpose: Maps order line items into specific physical shipment packages.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (FK -> `logistics_shipments.id`, onDelete Cascade)
- `package_id`: `UUID` (FK -> `shipment_packages.id`, Nullable)
- `order_item_id`: `UUID` (FK -> `order_items.id`, onDelete Cascade)
- `product_id`: `UUID` (FK -> `products.id`)
- `quantity`: `INTEGER` (default 1)
- `created_at`: `TIMESTAMPTZ`

### Table 9: `shipment_tracking_events`
*Purpose: Immutable chronological event ledger documenting every milestone.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (FK -> `logistics_shipments.id`, onDelete Cascade, Indexed)
- `status`: `VARCHAR(50)`
- `event_name`: `VARCHAR(100)` (e.g. `OUT_FOR_DELIVERY`, `HUB_IN_SCAN`)
- `location`: `VARCHAR(150)` (e.g. `Okhla Industrial Hub, New Delhi`)
- `latitude`: `DECIMAL(10, 7)`
- `longitude`: `DECIMAL(10, 7)`
- `description`: `TEXT`
- `source`: `VARCHAR(50)` (`COURIER_WEBHOOK`, `ADMIN_MANUAL`, `DRIVER_APP`, `SYSTEM`)
- `event_time`: `TIMESTAMPTZ` (default now())

### Table 10: `pickup_requests`
*Purpose: Warehouse and seller origin pickup schedules.*
- `id`: `UUID` (PK)
- `pickup_request_number`: `VARCHAR(60)` (Unique, e.g. `PKP-20261118-0041`)
- `warehouse_id`: `UUID` (FK -> `logistics_warehouses.id`)
- `partner_id`: `UUID` (FK -> `logistics_partners.id`)
- `scheduled_date`: `DATE`
- `pickup_slot`: `VARCHAR(50)` (`09:00 - 13:00`, `14:00 - 18:00`)
- `expected_package_count`: `INTEGER`
- `actual_picked_count`: `INTEGER`
- `status`: `VARCHAR(30)` (`REQUESTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `FAILED`)
- `failure_reason`: `VARCHAR(255)`
- `created_at`: `TIMESTAMPTZ`
- `updated_at`: `TIMESTAMPTZ`

### Table 11: `dispatch_manifests`
*Purpose: Handover documentation grouping packages handed over to transporters.*
- `id`: `UUID` (PK)
- `manifest_number`: `VARCHAR(60)` (Unique, e.g. `MNF-20261118-091`)
- `warehouse_id`: `UUID` (FK -> `logistics_warehouses.id`)
- `partner_id`: `UUID` (FK -> `logistics_partners.id`)
- `total_shipments`: `INTEGER`
- `total_weight_kg`: `DECIMAL(10, 3)`
- `handover_person_name`: `VARCHAR(100)`
- `courier_driver_name`: `VARCHAR(100)`
- `courier_driver_phone`: `VARCHAR(20)`
- `vehicle_registration_number`: `VARCHAR(50)`
- `signature_url`: `TEXT`
- `status`: `VARCHAR(30)` (`GENERATED`, `HANDED_OVER`, `DISPUTED`)
- `handed_over_at`: `TIMESTAMPTZ`
- `created_at`: `TIMESTAMPTZ`

### Table 12: `delivery_attempts`
*Purpose: NDR tracking of failed deliveries and customer reattempt requests.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (FK -> `logistics_shipments.id`, onDelete Cascade)
- `attempt_number`: `INTEGER` (1, 2, or 3)
- `attempt_time`: `TIMESTAMPTZ`
- `reason_code`: `VARCHAR(50)` (`CUSTOMER_UNAVAILABLE`, `INCORRECT_ADDRESS`, `CASH_NOT_READY`, `CUSTOMER_REFUSED`, `OUT_OF_DELIVERY_AREA`, `RESCHEDULE_REQUESTED`)
- `driver_remarks`: `TEXT`
- `customer_action`: `VARCHAR(50)` (`RESCHEDULE_ACCEPTED`, `ADDRESS_UPDATED`, `RETURN_CONFIRMED`)
- `rescheduled_date`: `DATE`
- `created_at`: `TIMESTAMPTZ`

### Table 13: `proof_of_delivery`
*Purpose: Legal validation confirming parcel handover to customer.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (Unique, FK -> `logistics_shipments.id`, onDelete Cascade)
- `receiver_name`: `VARCHAR(100)`
- `receiver_relation`: `VARCHAR(50)` (`SELF`, `FAMILY_MEMBER`, `NEIGHBOUR`, `SECURITY_GUARD`)
- `receiver_phone`: `VARCHAR(20)`
- `otp_verified`: `BOOLEAN` (default true)
- `signature_image_url`: `TEXT`
- `delivery_photo_url`: `TEXT`
- `delivery_latitude`: `DECIMAL(10, 7)`
- `delivery_longitude`: `DECIMAL(10, 7)`
- `delivered_at`: `TIMESTAMPTZ` (default now())

### Table 14: `logistics_fleet_vehicles`
*Purpose: Fleet vehicle tracking for internal transport.*
- `id`: `UUID` (PK)
- `vehicle_number`: `VARCHAR(50)` (Unique, e.g. `DL-01-AB-1234`)
- `vehicle_type`: `VARCHAR(50)` (`TWO_WHEELER`, `THREE_WHEELER`, `MINI_TRUCK`, `HEAVY_VAN`)
- `capacity_weight_kg`: `DECIMAL(8, 2)`
- `capacity_volume_cbm`: `DECIMAL(6, 2)`
- `fuel_type`: `VARCHAR(30)` (`ELECTRIC`, `PETROL`, `DIESEL`, `CNG`)
- `assigned_warehouse_id`: `UUID` (FK -> `logistics_warehouses.id`)
- `status`: `VARCHAR(30)` (`AVAILABLE`, `ON_TRIP`, `MAINTENANCE`, `INACTIVE`)
- `created_at`: `TIMESTAMPTZ`

### Table 15: `logistics_expenses`
*Purpose: Financial audit comparing estimated freight to courier invoices.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (FK -> `logistics_shipments.id`)
- `partner_id`: `UUID` (FK -> `logistics_partners.id`)
- `expense_type`: `VARCHAR(50)` (`FORWARD_FREIGHT`, `REVERSE_FREIGHT`, `COD_FEE`, `RTO_SURCHARGE`, `FUEL_SURCHARGE`, `HANDLING_CHARGE`)
- `estimated_amount`: `DECIMAL(10, 2)`
- `actual_billed_amount`: `DECIMAL(10, 2)`
- `invoice_number`: `VARCHAR(100)`
- `invoice_date`: `DATE`
- `reconciliation_status`: `VARCHAR(30)` (`MATCHED`, `DISCREPANCY`, `APPROVED`, `SETTLED`)
- `created_at`: `TIMESTAMPTZ`

### Table 16: `logistics_documents`
*Purpose: Digital document repository for labels, manifests, and PODs stored in Supabase Storage.*
- `id`: `UUID` (PK)
- `shipment_id`: `UUID` (FK -> `logistics_shipments.id`, Nullable)
- `manifest_id`: `UUID` (FK -> `dispatch_manifests.id`, Nullable)
- `document_type`: `VARCHAR(50)` (`SHIPPING_LABEL`, `PACKING_SLIP`, `MANIFEST`, `TAX_INVOICE`, `EWAY_BILL`, `POD_SLIP`, `LR_DOCUMENT`)
- `file_url`: `TEXT` (Supabase Storage permanent/signed URL)
- `bucket_name`: `VARCHAR(50)` (default `logistics-documents`)
- `storage_path`: `VARCHAR(255)` (path inside Supabase bucket)
- `file_size_kb`: `INTEGER`
- `created_by`: `VARCHAR(128)` (Firebase UID)
- `created_at`: `TIMESTAMPTZ` (default now())
