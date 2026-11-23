# Frontend UI/UX Architecture & Layout Integration
**Document:** `docs/logistics/FRONTEND_ARCHITECTURE.md`  
**Host Application:** `frontend/src/pages/admin_panel/admin_web_panel1.jsx`  
**Layout Component:** `frontend/src/components/layout/DashboardLayout.jsx`  
**Design Tokens:** Meesho Pink Gradient (`#b7004d`, `#ff7293`), Tailwind CSS v4, Lucide Icons  
**Status:** Architecture Blueprint  

---

## 1. Seamless Admin Navigation Integration

The Supply Chain Logistics Panel will seamlessly plug into the existing Master Menu in `admin_web_panel1.jsx` as a first-class navigation cluster:

```javascript
// Enhancement to ADMIN_MENU in admin_web_panel1.jsx
{
  id: 'logistics',
  label: 'Supply Chain & Logistics 🚚',
  icon: Truck,
  children: [
    { id: 'logistics-dashboard', label: 'Logistics Overview', icon: LayoutDashboard },
    { id: 'logistics-shipments', label: 'Shipments & Tracking', icon: Package },
    { id: 'logistics-fulfillment', label: 'Order-to-Shipment', icon: ShoppingBag },
    { id: 'logistics-pickups', label: 'Pickups & Scheduling', icon: Clock },
    { id: 'logistics-manifests', label: 'Dispatch Manifests', icon: FileSpreadsheet },
    { id: 'logistics-ndr', label: 'NDR & Exception Desk', icon: AlertTriangle },
    { id: 'logistics-warehouses', label: 'Warehouses & Stock', icon: Warehouse },
    { id: 'logistics-partners', label: 'Couriers & Rate Cards', icon: ShieldCheck },
    { id: 'logistics-fleet', label: 'Fleet & Driver Run Sheets', icon: Navigation },
    { id: 'logistics-reverse', label: 'Reverse Logistics & RTO', icon: RotateCcw },
    { id: 'logistics-documents', label: 'Shipping Documents & Labels', icon: Printer },
    { id: 'logistics-expenses', label: 'Freight Expenses & Billing', icon: Banknote },
    { id: 'logistics-reports', label: 'Logistics Analytics', icon: BarChart3 },
    { id: 'logistics-settings', label: 'Logistics Settings', icon: Sliders }
  ]
}
```

---

## 2. Component Hierarchy & Directory Organization

New components will be created under `frontend/src/components/admin/logistics/`:

```
frontend/src/components/admin/logistics/
├── AdminLogisticsPanel.jsx          # Master controller tab router
├── dashboard/
│   ├── LogisticsKPISection.jsx     # Counters, SLA %, active transit
│   ├── CarrierPerformanceCard.jsx  # Carrier volume & SLA meters
│   └── LiveExceptionRadar.jsx      # Urgent NDR & delayed shipments list
├── shipments/
│   ├── ShipmentsTable.jsx          # Paginated table with status pills
│   ├── ShipmentDetailDrawer.jsx    # Complete slide-over tracking drawer
│   ├── CreateShipmentModal.jsx     # Order-to-shipment allocation modal
│   └── BatchShipmentActions.jsx    # Bulk label print & manifest generation
├── warehouses/
│   ├── WarehousesList.jsx          # Physical warehouses & depot cards
│   └── WarehouseStockModal.jsx     # Bin/rack stock allocation inspector
├── partners/
│   ├── CarrierPartnerCards.jsx     # 3PL integrations & API statuses
│   └── RateCardConfigTable.jsx     # Weight slab and zonal rate editor
├── tracking/
│   └── TrackingTimelineWidget.jsx  # Step-by-step visual milestone stepper
├── documents/
│   ├── ThermalLabelPreviewModal.jsx# 4x6 label renderer with Code128 barcode
│   └── ManifestPrintView.jsx       # Transporter handover sheet printable layout
└── common/
    ├── LogisticsStatusBadge.jsx    # Color-coded pill (In-Transit, Delivered, NDR)
    └── WeightVolumeCalculator.jsx  # Interactive volumetric weight calculator
```

---

## 3. UI/UX Design System Compliance

1. **Color Palette**:
   - Primary: `#b7004d` (Meesho Crimson)
   - Secondary / Gradient: `#ff7293` (Meesho Rose)
   - Accent / Transit Status: Slate, Amber (NDR), Emerald (Delivered), Purple (Air), Red (RTO)
2. **Typography**: Inter / Geist font variable inherited from `frontend/src/index.css`.
3. **Data Grids & Tables**:
   - Sticky headers with sticky action columns.
   - 1-click AWB copying with toast notification.
   - Quick external tracking link launching official courier portal (`getCourierTrackingUrl`).
4. **Modals & Drawers**: Radix UI `Dialog` and `Sheet` components styled with Tailwind v4 blur backdrops and clean exit animations.
