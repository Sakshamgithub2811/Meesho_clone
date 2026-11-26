# Technical Risk Analysis & Mitigation Strategies
**Document:** `docs/logistics/RISK_ANALYSIS.md`  
**Purpose:** Identify potential architectural, operational, and technical failure modes with proactive mitigations  
**Status:** Architecture Blueprint  

---

## 1. Risk Assessment Matrix

| Risk ID | Risk Description | Severity | Likelihood | Mitigation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **RSK-01** | **Database Migration & Schema Drift**<br>Accidental alteration or locking of existing 24 database tables during Prisma schema updates. | **CRITICAL** | Low | - Use additive-only Prisma migrations (`prisma db push` / non-destructive SQL).<br>- No existing columns or constraints are dropped or altered.<br>- Full PostgreSQL backup taken prior to applying schema updates. |
| **RSK-02** | **Dual Status Synchronization Desynchronization**<br>`LogisticsShipment.status` updating to `DELIVERED` but parent `Order.orderStatus` failing to update due to unhandled exceptions. | **HIGH** | Medium | - All cross-table updates are wrapped in atomic Prisma transactions (`prisma.$transaction`).<br>- Background reconciliation cron (`reconcileOrderStatus.js`) runs periodically to detect and auto-heal any status drift. |
| **RSK-03** | **Inventory Race Conditions & Overselling**<br>Simultaneous warehouse stock reservation while customer places order on existing checkout. | **HIGH** | Low | - Two-tier stock architecture: Platform master stock (`Product.stock`) remains authoritative for checkout.<br>- Warehouse reservation (`logistics_warehouse_stock.reserved_stock`) operates downstream strictly after order confirmation. |
| **RSK-04** | **Third-Party Carrier API Outages**<br>Courier aggregator or 3PL API is unresponsive during label generation or dispatch. | **MEDIUM** | Medium | - Carrier Adapter Circuit Breaker: Automatically fails over to secondary carrier or switches to administrative manual dispatch mode.<br>- Queued retry mechanism with exponential backoff for delayed tracking updates. |
| **RSK-05** | **Node.js Event-Loop Blocking from PDF Generation**<br>High-volume bulk shipping label or manifest generation choking Node.js HTTP event loop. | **MEDIUM** | Low | - PDFKit documents use streaming responses directly piped to HTTP response streams rather than buffering large PDFs in RAM.<br>- Batch processing throttled in chunks of 50 parcels per manifest. |
| **RSK-06** | **Courier Webhook Replay Attacks & Spoofing**<br>Malicious external actor submitting fake delivery or return webhooks. | **HIGH** | Low | - Strict HMAC-SHA256 signature verification in webhook headers using shared secret.<br>- Idempotency checks matching event timestamp and unique courier tracking ID. |
| **RSK-07** | **Driver Mobile Screen Incompatibility**<br>Existing mock driver screens in `frontend/src/pages/delivery & driver logistics/` breaking when connected to real backend. | **LOW** | Low | - Keep existing mock routes intact while providing clean API adapter bindings (`logisticsApiService.js`) so mobile screens can consume real backend endpoints seamlessly. |
