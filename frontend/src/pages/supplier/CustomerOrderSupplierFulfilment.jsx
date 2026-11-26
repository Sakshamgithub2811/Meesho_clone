import React, { useState, useMemo } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

// Sample mock products for dropshipper catalog
const SAMPLE_PRODUCTS = [
  {
    id: 'PROD-101',
    name: 'Kanjivaram Soft Zari Woven Silk Saree with Blouse Piece',
    sku: 'KANJI-SLK-MAG-01',
    category: 'Ethnic Wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    supplierCost: 749,
    suggestedRetail: 1599,
    weight: '650g',
    hsn: '5007',
  },
  {
    id: 'PROD-102',
    name: 'Pure Chanderi Cotton Floral Printed Kurti with Palazzos',
    sku: 'CHAN-KRT-BLU-M',
    category: 'Women Western',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    supplierCost: 480,
    suggestedRetail: 1199,
    weight: '420g',
    hsn: '6204',
  },
  {
    id: 'PROD-103',
    name: 'Aura Minimalist Water-Resistant Chrono Watch - Gold Mesh',
    sku: 'AURA-WTC-GLD-02',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    supplierCost: 890,
    suggestedRetail: 1899,
    weight: '280g',
    hsn: '9102',
  },
  {
    id: 'PROD-104',
    name: 'Elite ANC Wireless Bluetooth Earbuds Gen 3 (Rose Gold)',
    sku: 'ELT-EBD-RSG-03',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    supplierCost: 1150,
    suggestedRetail: 2499,
    weight: '190g',
    hsn: '8518',
  },
];

// Initial mock orders illustrating dropship sync to supplier panel
const INITIAL_DROPSHIP_ORDERS = [
  {
    id: 'ORD-DS-99410',
    syncId: 'SYNC-882190-WEBHOOK',
    syncLatency: '420ms',
    createdAt: '12 mins ago',
    dropshipperStore: 'GlamAura Boutique by Priya',
    dropshipperPhone: '+91 98765 43210',
    dropshipperSupportEmail: 'support@glamaura.store',
    customer: {
      name: 'Ananya Sharma',
      phone: '+91 98112 45879',
      addressLine1: 'Flat 402, Lotus Residency, 14th Cross',
      addressLine2: 'Indiranagar 2nd Stage, Near BDA Complex',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    items: [
      {
        name: 'Kanjivaram Soft Zari Woven Silk Saree with Blouse Piece',
        sku: 'KANJI-SLK-MAG-01',
        qty: 1,
        color: 'Magenta & Gold Zari',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        supplierCost: 749,
        customerPrice: 1599,
        weight: '650g',
      },
    ],
    pricing: {
      customerPaid: 1599,
      supplierBasePrice: 749,
      shippingFee: 90,
      platformFee: 60,
      dropshipperMargin: 700,
    },
    paymentMethod: 'Prepaid (UPI / Razorpay)',
    paymentStatus: 'PAID_ONLINE',
    status: 'synced', // 'synced' | 'packing' | 'ready_to_ship' | 'in_transit' | 'delivered'
    statusLabel: 'Auto-Synced (New)',
    courierPartner: 'Delhivery Surface',
    awbNumber: null,
    warehouseBin: 'SURAT-W1-A42',
    notes: 'Urgent festival order, please ensure double bubble wrap.',
  },
  {
    id: 'ORD-DS-99388',
    syncId: 'SYNC-881944-WEBHOOK',
    syncLatency: '610ms',
    createdAt: '48 mins ago',
    dropshipperStore: 'UrbanVogue Collections',
    dropshipperPhone: '+91 98450 11223',
    dropshipperSupportEmail: 'care@urbanvogue.in',
    customer: {
      name: 'Rohan Mehra',
      phone: '+91 97654 32190',
      addressLine1: 'Villa 18, Palm Meadows, Opp Cyber Park',
      addressLine2: 'Sector 48, Sohna Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122018',
    },
    items: [
      {
        name: 'Aura Minimalist Water-Resistant Chrono Watch - Gold Mesh',
        sku: 'AURA-WTC-GLD-02',
        qty: 1,
        color: 'Gold Mesh / Black Dial',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
        supplierCost: 890,
        customerPrice: 1899,
        weight: '280g',
      },
    ],
    pricing: {
      customerPaid: 1899,
      supplierBasePrice: 890,
      shippingFee: 110,
      platformFee: 70,
      dropshipperMargin: 829,
    },
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'COD_PENDING',
    status: 'packing',
    statusLabel: 'Packing in Progress',
    courierPartner: 'Shadowfax Express',
    awbNumber: 'SFX-882190342',
    warehouseBin: 'SURAT-W2-C11',
    notes: 'White-label packing label printed with UrbanVogue branding.',
  },
  {
    id: 'ORD-DS-99312',
    syncId: 'SYNC-880521-WEBHOOK',
    syncLatency: '530ms',
    createdAt: '2 hrs ago',
    dropshipperStore: 'DesiThreads by Sneha',
    dropshipperPhone: '+91 99001 88776',
    dropshipperSupportEmail: 'help@desithreads.com',
    customer: {
      name: 'Kavita Iyer',
      phone: '+91 94432 10987',
      addressLine1: 'B-604, Godrej Woods, Bannerghatta Main Road',
      addressLine2: 'Near Meenakshi Temple',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560076',
    },
    items: [
      {
        name: 'Pure Chanderi Cotton Floral Printed Kurti with Palazzos',
        sku: 'CHAN-KRT-BLU-M',
        qty: 2,
        color: 'Powder Blue & White (Size M)',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
        supplierCost: 960,
        customerPrice: 2398,
        weight: '840g',
      },
    ],
    pricing: {
      customerPaid: 2398,
      supplierBasePrice: 960,
      shippingFee: 120,
      platformFee: 90,
      dropshipperMargin: 1228,
    },
    paymentMethod: 'Prepaid (UPI / GPay)',
    paymentStatus: 'PAID_ONLINE',
    status: 'ready_to_ship',
    statusLabel: 'Ready for Courier Pickup',
    courierPartner: 'Delhivery Surface',
    awbNumber: 'DEL-9928174621',
    warehouseBin: 'SURAT-W1-B08',
    notes: 'AWB generated. Slotted for 3:00 PM rider pickup dispatch.',
  },
  {
    id: 'ORD-DS-99201',
    syncId: 'SYNC-879810-WEBHOOK',
    syncLatency: '490ms',
    createdAt: 'Yesterday, 04:15 PM',
    dropshipperStore: 'TrendVibe Electronic Hub',
    dropshipperPhone: '+91 91234 56780',
    dropshipperSupportEmail: 'contact@trendvibe.biz',
    customer: {
      name: 'Vikramaditya Rathore',
      phone: '+91 98290 12345',
      addressLine1: 'House 142, Malviya Nagar Main Commercial Road',
      addressLine2: 'Behind Gaurav Tower',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302017',
    },
    items: [
      {
        name: 'Elite ANC Wireless Bluetooth Earbuds Gen 3 (Rose Gold)',
        sku: 'ELT-EBD-RSG-03',
        qty: 1,
        color: 'Rose Gold Metallic',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        supplierCost: 1150,
        customerPrice: 2499,
        weight: '190g',
      },
    ],
    pricing: {
      customerPaid: 2499,
      supplierBasePrice: 1150,
      shippingFee: 100,
      platformFee: 95,
      dropshipperMargin: 1154,
    },
    paymentMethod: 'Prepaid (Credit Card)',
    paymentStatus: 'PAID_ONLINE',
    status: 'in_transit',
    statusLabel: 'In Transit with Courier',
    courierPartner: 'Bluedart Air Express',
    awbNumber: 'BLU-3098172635',
    warehouseBin: 'DISPATCHED',
    notes: 'Package handed over to Bluedart. Expected delivery tomorrow.',
  },
  {
    id: 'ORD-DS-99054',
    syncId: 'SYNC-876211-WEBHOOK',
    syncLatency: '380ms',
    createdAt: '22 Sep 2026, 11:30 AM',
    dropshipperStore: 'GlamAura Boutique by Priya',
    dropshipperPhone: '+91 98765 43210',
    dropshipperSupportEmail: 'support@glamaura.store',
    customer: {
      name: 'Pooja Bhattacharya',
      phone: '+91 98300 99881',
      addressLine1: 'Block C, Flat 3A, Silver Oak Enclave',
      addressLine2: 'Salt Lake Sector 3',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700098',
    },
    items: [
      {
        name: 'Kanjivaram Soft Zari Woven Silk Saree with Blouse Piece',
        sku: 'KANJI-SLK-MAG-01',
        qty: 1,
        color: 'Deep Wine & Gold',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        supplierCost: 749,
        customerPrice: 1699,
        weight: '650g',
      },
    ],
    pricing: {
      customerPaid: 1699,
      supplierBasePrice: 749,
      shippingFee: 90,
      platformFee: 65,
      dropshipperMargin: 795,
    },
    paymentMethod: 'Prepaid (UPI)',
    paymentStatus: 'PAID_ONLINE',
    status: 'delivered',
    statusLabel: 'Delivered to Customer Doorstep',
    courierPartner: 'Delhivery Surface',
    awbNumber: 'DEL-8819203912',
    warehouseBin: 'DELIVERED',
    notes: 'Delivered successfully. Margin of ₹795 auto-transferred to Dropshipper wallet.',
  },
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/seller-dashboard' },
  { id: 'inventory', label: 'Products & Catalog', icon: 'inventory_2', path: '/supplier-inventory' },
  { id: 'orders', label: 'Supplier Orders', icon: 'shopping_cart', path: '/supplier-orders' },
  { id: 'dropship', label: 'Dropship Fulfilment 📦', icon: 'sync_alt', path: '/dropship-fulfilment' },
  { id: 'returns', label: 'Returns & RTO Hub 🔄', icon: 'assignment_return', path: '/supplier-returns' },
  { id: 'add-product', label: 'Add New Product', icon: 'add_box', path: '/add-product' },
  { id: 'analytics', label: 'Analytics & Insights', icon: 'insights', path: '/admin-analytics' },
  { id: 'dropshipper-kyc', label: 'Dropshipper KYC', icon: 'verified_user', path: '/admin-dropshipper-kyc' },
  { id: 'affiliate-kyc', label: 'Affiliate KYC', icon: 'loyalty', path: '/admin-affiliate-kyc' },
  { id: 'profile', label: 'Supplier Profile', icon: 'storefront', path: '/supplier-profile' },
];

export default function CustomerOrderSupplierFulfilment({ onNavigate, onBack }) {
  const [orders, setOrders] = useState(INITIAL_DROPSHIP_ORDERS);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Panels
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isSyncingEngine, setIsSyncingEngine] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [shippingLabelOrder, setShippingLabelOrder] = useState(null);
  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

  const handleNav = (itemOrPath) => {
    let path = itemOrPath;
    if (typeof itemOrPath === 'object' && itemOrPath !== null) {
      path = itemOrPath.path || itemOrPath.id;
    } else if (typeof itemOrPath === 'string') {
      const match = SIDEBAR_ITEMS.find((i) => i.id === itemOrPath || i.path === itemOrPath);
      if (match) {
        path = match.path;
      }
    }
    if (onNavigate) {
      onNavigate(path);
    }
  };

  // New Simulation Form State (Customer ordering from Dropshipper Store)
  const [simProduct, setSimProduct] = useState(SAMPLE_PRODUCTS[0]);
  const [simCustomerName, setSimCustomerName] = useState('Deepika Padukone');
  const [simCustomerPhone, setSimCustomerPhone] = useState('+91 98201 55667');
  const [simAddress1, setSimAddress1] = useState('Penthouse 24, Sea Breeze Towers, Bandra West');
  const [simCity, setSimCity] = useState('Mumbai');
  const [simState, setSimState] = useState('Maharashtra');
  const [simPincode, setSimPincode] = useState('400050');
  const [simDropshipStore, setSimDropshipStore] = useState('GlamAura Boutique by Priya');
  const [simRetailPrice, setSimRetailPrice] = useState(1599);
  const [simPaymentMethod, setSimPaymentMethod] = useState('Prepaid (UPI / Card)');

  // Show Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab Filter
      if (selectedTab !== 'all' && order.status !== selectedTab) {
        return false;
      }
      // Store Filter
      if (storeFilter !== 'all' && order.dropshipperStore !== storeFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCustomer = order.customer.name.toLowerCase().includes(q);
        const matchesStore = order.dropshipperStore.toLowerCase().includes(q);
        const matchesCity = order.customer.city.toLowerCase().includes(q);
        const matchesAwb = order.awbNumber ? order.awbNumber.toLowerCase().includes(q) : false;
        const matchesProduct = order.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchesId && !matchesCustomer && !matchesStore && !matchesCity && !matchesAwb && !matchesProduct) {
          return false;
        }
      }
      return true;
    });
  }, [orders, selectedTab, storeFilter, searchQuery]);

  // Unique Dropshipper Stores list
  const uniqueStores = useMemo(() => {
    const stores = new Set(orders.map((o) => o.dropshipperStore));
    return Array.from(stores);
  }, [orders]);

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const syncedCount = orders.filter((o) => o.status === 'synced').length;
    const packingCount = orders.filter((o) => o.status === 'packing').length;
    const readyCount = orders.filter((o) => o.status === 'ready_to_ship').length;
    const inTransitCount = orders.filter((o) => o.status === 'in_transit').length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

    const totalDropshipperMargin = orders.reduce((acc, curr) => acc + curr.pricing.dropshipperMargin, 0);
    const totalSupplierPayout = orders.reduce((acc, curr) => acc + curr.pricing.supplierBasePrice, 0);

    return {
      totalOrders,
      syncedCount,
      packingCount,
      readyCount,
      inTransitCount,
      deliveredCount,
      totalDropshipperMargin,
      totalSupplierPayout,
    };
  }, [orders]);

  // Handler: Simulate Customer placing order on dropshipper store
  const handleSimulatePlaceOrder = (e) => {
    e.preventDefault();

    const shippingFee = 90;
    const platformFee = Math.round(simRetailPrice * 0.04);
    const dropshipperMargin = Math.max(0, simRetailPrice - simProduct.supplierCost - shippingFee - platformFee);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `ORD-DS-99${randomSuffix}`;
    const newSyncId = `SYNC-${Math.floor(100000 + Math.random() * 900000)}-WEBHOOK`;

    const newOrder = {
      id: newOrderId,
      syncId: newSyncId,
      syncLatency: `${Math.floor(320 + Math.random() * 280)}ms`,
      createdAt: 'Just now (Instant Sync)',
      dropshipperStore: simDropshipStore,
      dropshipperPhone: '+91 98765 43210',
      dropshipperSupportEmail: `support@${simDropshipStore.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      customer: {
        name: simCustomerName,
        phone: simCustomerPhone,
        addressLine1: simAddress1,
        addressLine2: 'Near Landmark Circle',
        city: simCity,
        state: simState,
        pincode: simPincode,
      },
      items: [
        {
          name: simProduct.name,
          sku: simProduct.sku,
          qty: 1,
          color: 'Standard Catalog Color',
          image: simProduct.image,
          supplierCost: simProduct.supplierCost,
          customerPrice: simRetailPrice,
          weight: simProduct.weight,
        },
      ],
      pricing: {
        customerPaid: simRetailPrice,
        supplierBasePrice: simProduct.supplierCost,
        shippingFee: shippingFee,
        platformFee: platformFee,
        dropshipperMargin: dropshipperMargin,
      },
      paymentMethod: simPaymentMethod,
      paymentStatus: simPaymentMethod.includes('Prepaid') ? 'PAID_ONLINE' : 'COD_PENDING',
      status: 'synced',
      statusLabel: 'Auto-Synced (New)',
      courierPartner: 'Delhivery Surface',
      awbNumber: null,
      warehouseBin: `SURAT-W${Math.floor(1 + Math.random() * 3)}-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(10 + Math.random() * 80)}`,
      notes: 'Customer placed order on dropshipper storefront. Synced via Webhook API.',
    };

    // Close modal, activate sync pulse, add to orders
    setIsSimulateModalOpen(false);
    setIsSyncingEngine(true);

    setTimeout(() => {
      setIsSyncingEngine(false);
      setOrders((prev) => [newOrder, ...prev]);
      setSelectedTab('synced');
      triggerToast(
        `⚡ New Customer Order (${newOrderId}) auto-synced from "${simDropshipStore}" into Supplier Console in ${newOrder.syncLatency}!`
      );
    }, 1200);
  };

  // Handler: Manual Force Re-Sync
  const handleForceSync = () => {
    setIsSyncingEngine(true);
    setTimeout(() => {
      setIsSyncingEngine(false);
      triggerToast('✅ Webhook Listener Synced: All 4 connected dropship channels are in sync. 0 dropped payloads.');
    }, 1000);
  };

  // Handler: Supplier updates status to Packing
  const handleStartPacking = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'packing',
            statusLabel: 'Packing in Progress',
            awbNumber: o.awbNumber || `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          };
        }
        return o;
      })
    );
    triggerToast(`📦 Order ${orderId} moved to Packing. Ready to print White-label Shipping Label.`);
  };

  // Handler: Supplier marks Packed & Ready to Ship
  const handleMarkReadyToShip = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'ready_to_ship',
            statusLabel: 'Ready for Courier Pickup',
            awbNumber: o.awbNumber || `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          };
        }
        return o;
      })
    );
    if (shippingLabelOrder?.id === orderId) {
      setShippingLabelOrder(null);
    }
    triggerToast(`🏷️ Order ${orderId} packed with AWB. Courier pickup scheduled for today.`);
  };

  // Handler: Handover to Courier (Mark Dispatched)
  const handleDispatchCourier = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'in_transit',
            statusLabel: 'In Transit with Courier',
            warehouseBin: 'HANDED_TO_RIDER',
          };
        }
        return o;
      })
    );
    triggerToast(`🚚 Order ${orderId} handed over to Courier partner. Customer tracking SMS & email dispatched!`);
  };

  // Handler: Mark Delivered (Releasing dropshipper margin)
  const handleMarkDelivered = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'delivered',
            statusLabel: 'Delivered to Customer Doorstep',
          };
        }
        return o;
      })
    );
    triggerToast(`🎉 Order ${orderId} Delivered! Dropshipper net profit margin unlocked and credited to wallet.`);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-800 pb-28 font-sans antialiased">
      {/* ===================== Mobile Top Bar with Hamburger Menu ===================== */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
            title="Open Side Menu"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF3F6C] to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            DF
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Dropship Fulfilment
            </h1>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Supplier Dispatch Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsSimulateModalOpen(true)}
            className="bg-rose-50 text-[#FF3F6C] px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {/* ===================== Mobile Navigation Drawer ===================== */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-slate-900 text-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF3F6C] to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                    DF
                  </div>
                  <div>
                    <h2 className="text-base font-black text-rose-500 font-['Plus_Jakarta_Sans',sans-serif]">
                      Dropship Engine
                    </h2>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Supplier Hub
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto max-h-[70vh]">
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = item.id === 'dropship';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNav(item);
                      }}
                      className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined mr-2.5 text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigate) onNavigate('/seller-dashboard');
                }}
                className="w-full py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Switch to Seller Dashboard</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SideNavBar (Desktop Shell) ===================== */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-950 py-6 space-y-2 border-r border-slate-200/60 dark:border-slate-800">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF3F6C] to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              DF
            </div>
            <div>
              <h1 className="text-base font-black text-[#FF3F6C] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-tight">
                Seller Console
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                Dropship &amp; Supplier Hub
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = item.id === 'dropship';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-[#FF3F6C] shadow-xs border border-rose-100 dark:border-slate-800 translate-x-1 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 mt-auto border-t border-slate-200/60 dark:border-slate-800 space-y-1">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/seller-dashboard')}
            className="w-full bg-[#FF3F6C] hover:bg-rose-600 text-white py-2.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-95 mb-2 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Seller Dashboard</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/admin-panel')}
            className="w-full flex items-center px-3 py-2 text-slate-500 hover:text-slate-700 cursor-pointer text-xs font-semibold transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined mr-2.5 text-base">admin_panel_settings</span>
            Admin Console
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/support-center')}
            className="w-full flex items-center px-3 py-2 text-slate-500 hover:text-slate-700 cursor-pointer text-xs font-semibold transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined mr-2.5 text-base">help</span>
            Support Center
          </button>
        </div>
      </aside>

      {/* Main Content Area with Desktop Left Margin */}
      <div className="md:pl-64 flex flex-col min-w-0">
        {/* Top Header & Breadcrumb */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
          <div className="w-full px-4 sm:px-8 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (onBack ? onBack() : window.history.back())}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Go Back"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-pink-100 text-[#FF3F6C]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3F6C] animate-pulse"></span>
                    Dropship Engine
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    Auto-Sync Active (Avg 460ms)
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 mt-1">
                  Customer Order &amp; Supplier Fulfilment
                </h1>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleForceSync}
                disabled={isSyncingEngine}
                className="px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${isSyncingEngine ? 'animate-spin text-[#FF3F6C]' : 'text-slate-500'}`}>
                  sync
                </span>
                <span>{isSyncingEngine ? 'Syncing...' : 'Force Sync'}</span>
              </button>

              <button
                onClick={() => setManifestModalOpen(true)}
                className="px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">receipt_long</span>
                <span className="hidden sm:inline">Courier Manifest</span>
              </button>

              <button
                onClick={() => setIsSimulateModalOpen(true)}
                className="px-4 py-2 text-xs md:text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#FF3F6C] to-[#E02653] hover:from-[#E02653] hover:to-[#B90041] transition-all flex items-center gap-2 shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Simulate Customer Order</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container - Full Page Width */}
        <main className="w-full px-4 sm:px-8 lg:px-10 pt-6 space-y-6">
        {/* Dropshipping Lifecycle Interactive Visualizer */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C]">Architecture & Pipeline</span>
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                End-to-End Dropshipping Order & Fulfilment Flow
              </h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
              Real-time Webhook Pipeline
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1 */}
            <div
              onClick={() => setActiveWorkflowStep(1)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeWorkflowStep === 1
                  ? 'bg-pink-50/70 border-[#FF3F6C] ring-2 ring-[#FF3F6C]/20'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-[#FF3F6C] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <span className="material-symbols-outlined text-slate-400 text-lg">storefront</span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">Customer Orders on Store</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Customer places order on Dropshipper's branded shop at retail price.
              </p>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveWorkflowStep(2)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeWorkflowStep === 2
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <span className="material-symbols-outlined text-emerald-500 text-lg">sync_alt</span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">Auto-Sync via Webhook</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Order details, customer address & profit margin split auto-synced into supplier panel.
              </p>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveWorkflowStep(3)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeWorkflowStep === 3
                  ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <span className="material-symbols-outlined text-amber-500 text-lg">inventory_2</span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">Supplier Packs Product</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Supplier prints White-Label label with Dropshipper branding & packages product.
              </p>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setActiveWorkflowStep(4)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeWorkflowStep === 4
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  4
                </span>
                <span className="material-symbols-outlined text-blue-500 text-lg">local_shipping</span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">Courier Handover (AWB)</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Assigned logistics partner (Delhivery/Shadowfax) picks up parcel from supplier warehouse.
              </p>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => setActiveWorkflowStep(5)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeWorkflowStep === 5
                  ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                  5
                </span>
                <span className="material-symbols-outlined text-purple-500 text-lg">verified</span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">Customer Doorstep Delivery</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Customer receives package with dropshipper invoice. Margin released to dropshipper.
              </p>
            </div>
          </div>
        </section>

        {/* Operational Metrics Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#FF3F6C] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">sync</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Synced Today</p>
              <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">{metrics.totalOrders}</h4>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm">trending_up</span> 100% Auto-Synced
              </p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Pack</p>
              <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                {metrics.syncedCount + metrics.packingCount}
              </h4>
              <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm">schedule</span> SLA: &lt; 4 Hours
              </p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Transit / Ready</p>
              <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                {metrics.readyCount + metrics.inTransitCount}
              </h4>
              <p className="text-[11px] font-medium text-blue-600 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm">check_circle</span> Delhivery & SFX
              </p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dropshipper Margins</p>
              <h4 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                ₹{metrics.totalDropshipperMargin.toLocaleString()}
              </h4>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm">verified_user</span> Escrow Secured
              </p>
            </div>
          </div>
        </section>

        {/* Supplier Fulfilment Console: Controls, Filters & Tabs */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Top Control Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Dropshipper Store, or AWB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#FF3F6C]/30 focus:border-[#FF3F6C] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Store Channel Selector */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs font-semibold text-slate-500 shrink-0">Store Channel:</label>
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#FF3F6C]/30"
              >
                <option value="all">All Dropshipper Stores ({orders.length})</option>
                {uniqueStores.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="px-4 sm:px-5 pt-3 border-b border-slate-200/80 flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Orders', count: orders.length, icon: 'all_inbox' },
              { id: 'synced', label: 'Auto-Synced (New)', count: metrics.syncedCount, icon: 'sync' },
              { id: 'packing', label: 'Packing in Progress', count: metrics.packingCount, icon: 'package_2' },
              { id: 'ready_to_ship', label: 'Ready for Courier', count: metrics.readyCount, icon: 'check_box' },
              { id: 'in_transit', label: 'In Transit', count: metrics.inTransitCount, icon: 'local_shipping' },
              { id: 'delivered', label: 'Delivered', count: metrics.deliveredCount, icon: 'task_alt' },
            ].map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`pb-3 px-3.5 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#FF3F6C] text-[#FF3F6C]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] ${
                      isActive ? 'bg-[#FF3F6C] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Order Cards List */}
          <div className="p-4 sm:p-5 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="py-14 text-center">
                <span className="material-symbols-outlined text-slate-300 text-6xl">inventory_2</span>
                <h4 className="text-base font-bold text-slate-700 mt-2">No dropship orders found</h4>
                <p className="text-xs text-slate-400 mt-1">Try changing filters or simulate a customer order.</p>
                <button
                  onClick={() => setIsSimulateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#FF3F6C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E02653] cursor-pointer"
                >
                  + Simulate Customer Order
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const item = order.items[0];
                return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all space-y-4"
                  >
                    {/* Top Row: Order ID, Channel Badge, Sync Latency, Status Pill */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {order.id}
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200/60">
                          <span className="material-symbols-outlined text-[15px]">storefront</span>
                          <span>{order.dropshipperStore}</span>
                        </div>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">bolt</span>
                          Synced in {order.syncLatency}
                        </span>
                        <span className="text-xs text-slate-400">{order.createdAt}</span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {order.status === 'synced' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#FF3F6C] border border-pink-200/80 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FF3F6C] animate-ping"></span>
                            Auto-Synced (New)
                          </span>
                        )}
                        {order.status === 'packing' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                            Packing in Progress
                          </span>
                        )}
                        {order.status === 'ready_to_ship' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                            Ready for Courier Pickup
                          </span>
                        )}
                        {order.status === 'in_transit' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                            In Transit with Courier
                          </span>
                        )}
                        {order.status === 'delivered' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">task_alt</span>
                            Delivered to Customer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Section: Product Details, Shipping Destination & Margin Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Thumbnail & Specs (4 Cols) */}
                      <div className="md:col-span-4 flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                        />
                        <div className="space-y-1">
                          <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-500">SKU: {item.sku}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <span>Qty: {item.qty}</span>
                            <span>•</span>
                            <span>Wt: {item.weight}</span>
                            <span>•</span>
                            <span className="text-slate-500">Bin: {order.warehouseBin}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Delivery Address (4 Cols) */}
                      <div className="md:col-span-4 bg-slate-50/90 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[#FF3F6C]">person_pin_circle</span>
                            {order.customer.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{order.customer.phone}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2">
                          {order.customer.addressLine1}, {order.customer.addressLine2}, {order.customer.city} -{' '}
                          <span className="font-bold text-slate-800">{order.customer.pincode}</span>,{' '}
                          {order.customer.state}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Pay Mode: <strong className="text-slate-700">{order.paymentMethod}</strong></span>
                          {order.awbNumber && (
                            <span className="font-mono text-blue-600 font-semibold">{order.awbNumber}</span>
                          )}
                        </div>
                      </div>

                      {/* Dropship Financial Split (4 Cols) */}
                      <div className="md:col-span-4 bg-gradient-to-br from-slate-50 to-pink-50/30 p-3 rounded-xl border border-slate-200/80 text-xs">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Financial Split</span>
                          <span className="text-slate-400 font-normal">COD/Prepaid</span>
                        </p>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-600">
                            <span>Customer Paid (Retail):</span>
                            <strong className="text-slate-900">₹{order.pricing.customerPaid}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Supplier Base Cost:</span>
                            <strong className="text-emerald-700">₹{order.pricing.supplierBasePrice}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Shipping & Platform:</span>
                            <span>₹{order.pricing.shippingFee + order.pricing.platformFee}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-200/80 flex justify-between font-bold text-xs text-[#FF3F6C]">
                            <span>Dropshipper Margin:</span>
                            <span>+₹{order.pricing.dropshipperMargin}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Audit & Sync Log</span>
                        </button>

                        <button
                          onClick={() => setShippingLabelOrder(order)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm text-[#FF3F6C]">print</span>
                          <span>White-Label Label & Slip</span>
                        </button>
                      </div>

                      {/* State Transition CTA */}
                      <div className="flex items-center gap-2">
                        {order.status === 'synced' && (
                          <button
                            onClick={() => handleStartPacking(order.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">inventory_2</span>
                            <span>Accept & Start Packing</span>
                          </button>
                        )}

                        {order.status === 'packing' && (
                          <button
                            onClick={() => handleMarkReadyToShip(order.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Mark Packed (Generate AWB)</span>
                          </button>
                        )}

                        {order.status === 'ready_to_ship' && (
                          <button
                            onClick={() => handleDispatchCourier(order.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">local_shipping</span>
                            <span>Handover to {order.courierPartner.split(' ')[0]}</span>
                          </button>
                        )}

                        {order.status === 'in_transit' && (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">verified</span>
                            <span>Simulate Doorstep Delivery</span>
                          </button>
                        )}

                        {order.status === 'delivered' && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Margin Released
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SIMULATE CUSTOMER DROPSHIP ORDER                                 */}
      {/* ========================================================================= */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-pink-50 via-white to-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF3F6C]">
                  Dropshipper Storefront Simulator
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Customer Places Order on Dropshipper Site
                </h3>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSimulatePlaceOrder} className="p-5 overflow-y-auto space-y-4 text-xs md:text-sm">
              {/* Dropshipper Brand Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dropshipper Branded Storefront:
                </label>
                <select
                  value={simDropshipStore}
                  onChange={(e) => setSimDropshipStore(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#FF3F6C]/30 focus:border-[#FF3F6C]"
                >
                  <option value="GlamAura Boutique by Priya">GlamAura Boutique by Priya (glamaura.store)</option>
                  <option value="UrbanVogue Collections">UrbanVogue Collections (urbanvogue.in)</option>
                  <option value="DesiThreads by Sneha">DesiThreads by Sneha (desithreads.com)</option>
                  <option value="TrendVibe Electronic Hub">TrendVibe Electronic Hub (trendvibe.biz)</option>
                </select>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Product to Buy:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {SAMPLE_PRODUCTS.map((prod) => {
                    const isSelected = simProduct.id === prod.id;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSimProduct(prod);
                          setSimRetailPrice(prod.suggestedRetail);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#FF3F6C] bg-pink-50/50 ring-2 ring-[#FF3F6C]/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-500">Wholesale: ₹{prod.supplierCost}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price & Margin Calculation */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Retail Selling Price (₹):
                    </label>
                    <input
                      type="number"
                      value={simRetailPrice}
                      onChange={(e) => setSimRetailPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                      min={simProduct.supplierCost + 150}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Mode:
                    </label>
                    <select
                      value={simPaymentMethod}
                      onChange={(e) => setSimPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                    >
                      <option value="Prepaid (UPI / Card)">Prepaid (UPI / Card)</option>
                      <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                </div>

                {/* Instant Profit Calculation */}
                <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600">
                    Supplier Cost: <strong>₹{simProduct.supplierCost}</strong> + Shipping/Fee: <strong>₹150</strong>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                    Dropshipper Profit: +₹{Math.max(0, simRetailPrice - simProduct.supplierCost - 150)}
                  </span>
                </div>
              </div>

              {/* Customer Address Details */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Customer Shipping Address (Recipient)
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Recipient Full Name"
                    value={simCustomerName}
                    onChange={(e) => setSimCustomerName(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Recipient Mobile Number"
                    value={simCustomerPhone}
                    onChange={(e) => setSimCustomerPhone(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street / Flat / House Address"
                  value={simAddress1}
                  onChange={(e) => setSimAddress1(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="City"
                    value={simCity}
                    onChange={(e) => setSimCity(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={simState}
                    onChange={(e) => setSimState(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={simPincode}
                    onChange={(e) => setSimPincode(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs md:text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#FF3F6C] to-[#E02653] hover:from-[#E02653] hover:to-[#B90041] transition-all flex items-center gap-2 shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">send_and_archive</span>
                  <span>Place Customer Order & Trigger Auto-Sync</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: WHITE-LABEL SHIPPING LABEL & PACKING SLIP PREVIEW                */}
      {/* ========================================================================= */}
      {shippingLabelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Thermal 4x6" Printable
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  White-Label Shipping Label & Packing Slip
                </h3>
              </div>
              <button
                onClick={() => setShippingLabelOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Printable Thermal Label Canvas */}
            <div className="p-5 overflow-y-auto">
              <div className="border-2 border-dashed border-slate-800 p-5 rounded-2xl bg-white space-y-4 font-mono text-xs">
                {/* Courier Header & Barcode */}
                <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black tracking-wider uppercase text-slate-900">
                      {shippingLabelOrder.courierPartner.toUpperCase()}
                    </h4>
                    <p className="text-[10px] text-slate-600">STANDARD SURFACE LOGISTICS</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-sm font-bold">
                      {shippingLabelOrder.paymentStatus === 'PAID_ONLINE' ? 'PREPAID' : 'COD'}
                    </span>
                    <p className="text-[11px] font-bold mt-1">₹{shippingLabelOrder.pricing.customerPaid}</p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="text-center py-2 border-b border-slate-300">
                  <div className="h-10 flex items-center justify-center gap-[3px] overflow-hidden">
                    {[3, 1, 4, 1, 2, 4, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 3, 1, 2, 1, 4, 2, 3, 1, 4, 2, 1, 3].map(
                      (w, i) => (
                        <div
                          key={i}
                          className="h-full bg-slate-900"
                          style={{ width: `${w * 2}px` }}
                        ></div>
                      )
                    )}
                  </div>
                  <p className="text-xs font-bold tracking-widest mt-1">
                    {shippingLabelOrder.awbNumber || 'AWB-PENDING-GENERATION'}
                  </p>
                </div>

                {/* Dropshipper Brand Information (White-Label Guarantee) */}
                <div className="bg-pink-50/60 p-2.5 rounded-lg border border-pink-200/80 text-[11px] font-sans">
                  <span className="font-bold text-[#FF3F6C] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    White-Label Branded Slip
                  </span>
                  <p className="text-slate-700 text-[11px] mt-0.5">
                    <strong>Shipper (Seller on Record):</strong> {shippingLabelOrder.dropshipperStore}
                    <br />
                    <strong>Customer Support:</strong> {shippingLabelOrder.dropshipperSupportEmail}
                  </p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                    *Supplier warehouse details are strictly masked to preserve dropshipper brand identity.
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="border-b border-slate-300 pb-3 space-y-1">
                  <p className="font-bold text-slate-500 text-[10px] uppercase">Deliver To (Customer):</p>
                  <p className="text-sm font-black text-slate-900">{shippingLabelOrder.customer.name}</p>
                  <p className="text-slate-700 leading-snug">
                    {shippingLabelOrder.customer.addressLine1}
                    <br />
                    {shippingLabelOrder.customer.addressLine2}
                    <br />
                    {shippingLabelOrder.customer.city}, {shippingLabelOrder.customer.state} -{' '}
                    <strong className="text-slate-900 text-sm">{shippingLabelOrder.customer.pincode}</strong>
                  </p>
                  <p className="text-slate-800 font-bold">
                    Tel: {shippingLabelOrder.customer.phone ? `${String(shippingLabelOrder.customer.phone).replace(/[\s-]/g, '').slice(0, 5)} XXXXX (Protected)` : '+91 98765 XXXXX (Protected)'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-bold">
                    🛡️ Virtual Delivery Helpline: +91 80 4712 3456
                  </p>
                </div>

                {/* Items & Packing Summary */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-[10px] text-slate-500">
                    <span>Item & SKU</span>
                    <span>Qty</span>
                  </div>
                  {shippingLabelOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-800">
                      <span className="truncate pr-2">{it.name} ({it.sku})</span>
                      <span className="font-bold">{it.qty}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between text-[10px] text-slate-500">
                    <span>Gross Wt: {shippingLabelOrder.items[0]?.weight || '500g'}</span>
                    <span>Order Ref: {shippingLabelOrder.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print Thermal Label</span>
              </button>

              <button
                onClick={() => handleMarkReadyToShip(shippingLabelOrder.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Attach Label & Ready for Courier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 3: ORDER AUDIT TRAIL & WEBHOOK PAYLOAD INSPECTOR                  */}
      {/* ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-bold text-[#FF3F6C] uppercase tracking-wider">
                  Audit & Technical Payload
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedOrderDetails.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs md:text-sm">
              {/* Sync Health Card */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                    Webhook Payload Verified
                  </span>
                  <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    HTTP 200 OK
                  </span>
                </div>
                <p className="text-emerald-700 text-[11px]">
                  Payload ID: <strong className="font-mono">{selectedOrderDetails.syncId}</strong>
                </p>
                <p className="text-emerald-700 text-[11px]">
                  Sync Latency: <strong className="font-mono">{selectedOrderDetails.syncLatency}</strong> via Edge Gateway
                </p>
              </div>

              {/* Complete Financial Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transparent Financial Breakdown
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Customer Paid (Dropshipper Selling Price):</span>
                    <strong className="text-slate-900">₹{selectedOrderDetails.pricing.customerPaid}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Supplier Base Cost (Wholesale):</span>
                    <strong className="text-emerald-700">₹{selectedOrderDetails.pricing.supplierBasePrice}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Courier Shipping Fee:</span>
                    <span>₹{selectedOrderDetails.pricing.shippingFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Commission / Escrow Protection:</span>
                    <span>₹{selectedOrderDetails.pricing.platformFee}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#FF3F6C]">
                    <span>Net Dropshipper Margin:</span>
                    <span>+₹{selectedOrderDetails.pricing.dropshipperMargin}</span>
                  </div>
                </div>
              </div>

              {/* Webhook JSON Payload Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Raw Ingest Payload</span>
                  <span className="text-[10px] text-slate-400 font-normal">JSON</span>
                </h4>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
                  {JSON.stringify(
                    {
                      event: 'dropship.order_created',
                      sync_id: selectedOrderDetails.syncId,
                      order_id: selectedOrderDetails.id,
                      store_id: selectedOrderDetails.dropshipperStore,
                      customer: selectedOrderDetails.customer,
                      items: selectedOrderDetails.items,
                      pricing_breakdown: selectedOrderDetails.pricing,
                      fulfillment_status: selectedOrderDetails.status,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Courier Tracking Status */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Logistics & Handover Info
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p><strong>Courier:</strong> {selectedOrderDetails.courierPartner}</p>
                  <p><strong>AWB Code:</strong> <span className="font-mono text-blue-600">{selectedOrderDetails.awbNumber || 'To be generated upon packaging'}</span></p>
                  <p><strong>Warehouse Bin:</strong> {selectedOrderDetails.warehouseBin}</p>
                  <p><strong>Notes:</strong> {selectedOrderDetails.notes}</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setShippingLabelOrder(selectedOrderDetails)}
                className="px-4 py-2 bg-[#FF3F6C] hover:bg-[#E02653] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print White-Label Slip</span>
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COURIER MANIFEST SUMMARY                                         */}
      {/* ========================================================================= */}
      {manifestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Logistics Dispatch Handover
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Consolidated Courier Pickup Manifest
                </h3>
              </div>
              <button
                onClick={() => setManifestModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-blue-600">info</span>
                <span>
                  Provide this signed manifest to the Delhivery/Shadowfax pickup executive during warehouse scan.
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Order ID</th>
                      <th className="p-2.5">Recipient City</th>
                      <th className="p-2.5">Dropshipper Store</th>
                      <th className="p-2.5">AWB Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {orders
                      .filter((o) => o.status === 'ready_to_ship' || o.status === 'in_transit')
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-900">{o.id}</td>
                          <td className="p-2.5 text-slate-700">{o.customer.city}</td>
                          <td className="p-2.5 text-slate-600 truncate max-w-[140px]">{o.dropshipperStore}</td>
                          <td className="p-2.5 font-mono text-blue-600">{o.awbNumber || 'DEL-PENDING'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex items-center justify-between text-slate-500">
                <span>Total Ready Parcels: <strong>{metrics.readyCount + metrics.inTransitCount}</strong></span>
                <span>Manifest Ref: <strong>MAN-DEL-9812</strong></span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setManifestModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print Handover Manifest</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <AppBottomNav activeNav="orders" onNavigate={onNavigate} />
    </div>
  );
}
