# Role & Permission Matrix (RBAC)
**Document:** `docs/logistics/ROLE_PERMISSION_MATRIX.md`  
**Security Standard:** Principle of Least Privilege (PoLP)  
**Authentication Standard:** **Pure Firebase Authentication ONLY** (`verifyIdToken`). No JWT/bcrypt.  
**Authorization Engine:** Express role-check middleware tied to `Profile.role` and `staffRolesConfig.json`.  
**Status:** Architecture Blueprint  

---

## 1. Granular Role-Based Access Control (RBAC) Matrix

| Logistics Capability / Action | Super Admin | Logistics Admin | Logistics Manager | Warehouse Manager | Dispatch Executive | Delivery Coordinator | Finance Executive |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **View Logistics Dashboard & KPIs** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Shipments List & Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Shipments from Orders** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage Multi-Warehouse Master** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Allocate Warehouse Stock & Bins** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Generate Pick Lists & Pack Slips** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Generate Transporter Manifests** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mark Courier Handover / Picked Up**| ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Assign Last-Mile Fleet / Drivers** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Process NDR Exceptions & Reattempts**| ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Trigger Return-to-Origin (RTO)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Courier Partners & API Keys**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configure Rate Cards & Slabs** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reconcile Freight Invoices & COD** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Export Logistics Analytics & Reports**| ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Modify Global Logistics Settings**| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. Backend Enforcement Mechanism

RBAC is enforced authoritatively at the Express routing layer, never relying on frontend hiding alone:

```javascript
// Example route protection in logistics.routes.js
import { verifyAuth, authorizeRole } from '../middlewares/auth.middleware.js';

// Read-only operations allowed for all logistics personnel
router.get('/shipments', verifyAuth, authorizeRole('ADMIN', 'LOGISTICS_ADMIN', 'LOGISTICS_MANAGER', 'WAREHOUSE_MANAGER', 'DISPATCH_EXECUTIVE'));

// Financial & rate card operations restricted to Admin & Finance
router.post('/rate-cards', verifyAuth, authorizeRole('ADMIN', 'LOGISTICS_ADMIN'));
router.post('/expenses/reconcile', verifyAuth, authorizeRole('ADMIN', 'LOGISTICS_ADMIN', 'FINANCE_OFFICER'));
```

All privileged modifications generate forensic immutable records in `auditLogs.json` via the existing `auditLogger.js`.
