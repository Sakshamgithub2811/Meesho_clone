# External Carrier Integration Architecture & Plan
**Document:** `docs/logistics/INTEGRATION_PLAN.md`  
**Pattern:** Pluggable Transporter Carrier Adapter Interface  
**Design Standard:** Safe Mock/Sandbox Fallback with Zero-Downtime Live Carrier Switch  
**Status:** Architecture Blueprint  

---

## 1. Carrier Adapter Architecture

To prevent vendor lock-in with any single courier (Delhivery, BlueDart, Shadowfax, Shiprocket), all external shipping provider communications pass through a standardized Adapter Interface:

```
┌────────────────────────────────────────────────────────┐
│             LOGISTICS CONTROLLER & SERVICE             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            CARRIER ADAPTER FACTORY INTERFACE           │
│  - createShipment(data)                                │
│  - generateAwb(shipmentId)                             │
│  - schedulePickup(pickupData)                          │
│  - trackConsignment(awb)                               │
│  - cancelConsignment(awb)                              │
│  - generateLabel(awb)                                  │
└───────────┬───────────────────┬───────────────────┬────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ DelhiveryAdapter │ │  BlueDartAdapter │ │ MockDevelopment  │
│ (Live 3PL REST)  │ │ (Live 3PL SOAP)  │ │ Adapter (Sandbox)│
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 2. Mock Development Mode vs Production Mode

To guarantee that the platform can be developed, tested, and fully operated without requiring live commercial courier account credentials immediately:

1. **Configurable Carrier Mode**:
   - In `.env`, `LOGISTICS_PROVIDER_MODE=MOCK` (Default for local development) or `PRODUCTION`.
2. **Mock Adapter Capabilities**:
   - Generates realistic, checksum-valid AWB numbers (e.g. `DEL-981248012`).
   - Produces realistic vector barcodes on thermal shipping labels.
   - Provides a simulated webhook trigger endpoint (`POST /api/v1/logistics/mock/trigger-milestone`) allowing developers and testers to advance a shipment through transit, out-for-delivery, and delivery failure milestones on demand.
3. **Never Fabricate Data in Production**:
   - When configured in `PRODUCTION` mode, only verified 3PL API responses are saved to the database. If a carrier API is unreachable, the system gracefully falls back to administrative manual fulfillment mode with explicit UI labeling.

---

## 3. Webhook Handling & Security

- **Inbound Webhook Endpoint**: `POST /api/v1/logistics/webhooks/:carrierCode`
- **Security & Verification**:
  - HMAC-SHA256 signature verification in HTTP headers (e.g. `X-Delhivery-Signature`).
  - Timestamp freshness checks (reject payloads older than 5 minutes to prevent replay attacks).
  - Idempotency guard: Webhook payloads check `shipment_tracking_events` for duplicate event IDs before processing.

---

## 4. Authentication & Storage Infrastructure Standards

### 4.1 Strict Firebase Authentication Pipeline
- **No Custom JWT or Bcrypt**: Legacy implementations in supplier/user using custom JWT signing and bcrypt password hashing are rejected.
- **Client Handshake**: Client sends Firebase ID Token via `Authorization: Bearer <idToken>`.
- **Backend Verification**: `admin.auth().verifyIdToken(token)` decodes `uid`, `email`, and role claims.
- **Identity Link**: `decoded.uid` matches directly with `Profile.id` in PostgreSQL (`profiles` table PK is Firebase UID).

### 4.2 Document Processing & Storage Architecture
- **PDFKit Engine**: Generates procedural binary buffers for:
  - 4x6 Thermal Shipping Labels (Code128 Barcodes, Carrier Routing Headers, Consignee Details).
  - A4 Tax Invoices & Delivery Challans.
  - Consolidated Transporter Dispatch Manifests.
- **Supabase Storage Integration**:
  - Every generated PDF buffer is uploaded directly to the Supabase Storage bucket (`logistics-documents` or `dropshipper-assets`) via `uploadFileToSupabase()`.
  - Stored files receive permanent, secure public/signed URLs: `https://<supabase-domain>/storage/v1/object/public/logistics-documents/...`
  - Zero reliance on local temporary server disks for long-term document retention.
- **Proof of Delivery (POD) Media**:
  - Customer signature canvases (base64 -> PNG buffer) and doorstep camera photos (JPEG) are uploaded directly to Supabase Storage and their URLs linked to `proof_of_delivery` records.
