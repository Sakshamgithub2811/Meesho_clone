import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const INITIAL_ORDERS = [
  {
    id: '#ORD-88210',
    date: 'Oct 24, 2024',
    productName: 'Silk Embroidered Kurti',
    customer: 'Rahul P.',
    avatar: 'RP',
    avatarBg: 'bg-[#b90041]/10 text-[#b90041]',
    amount: '₹1,299',
    status: 'Shipped',
    statusStyle: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: '#ORD-88209',
    date: 'Oct 24, 2024',
    productName: 'Minimalist Gold Watch',
    customer: 'Ananya K.',
    avatar: 'AK',
    avatarBg: 'bg-amber-100 text-amber-700',
    amount: '₹2,499',
    status: 'Processing',
    statusStyle: 'bg-blue-100 text-blue-700',
  },
  {
    id: '#ORD-88208',
    date: 'Oct 23, 2024',
    productName: 'Designer Tee (L)',
    customer: 'Suresh M.',
    avatar: 'SM',
    avatarBg: 'bg-slate-100 text-slate-700',
    amount: '₹499',
    status: 'Pending',
    statusStyle: 'bg-amber-100 text-amber-700',
  },
  {
    id: '#ORD-88205',
    date: 'Oct 22, 2024',
    productName: 'Urban Explorer Pack',
    customer: 'Deepa V.',
    avatar: 'DV',
    avatarBg: 'bg-purple-100 text-purple-700',
    amount: '₹899',
    status: 'Shipped',
    statusStyle: 'bg-emerald-100 text-emerald-700',
  },
];

const TOP_PRODUCTS = [
  {
    id: 'tp-1',
    name: 'Silk Embroidered Kurti',
    stock: '124 units',
    stockClass: 'text-emerald-600 font-bold',
    price: '₹1,299',
    sold: '842 Sold',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCv6DgYAFvGbNJ5APR46xls7W7pN8o67LV_V8M5UUB3Wg82Y35C7rJLKqw75qntSEhXK9Ac79emuJ4yu6ynPkR2JydFC6jiz4hX9YKLKuNXBWzZw0kd6-gTNGPGPIVTUu2jWoo-_IZeK2TFB_ztWZHpxLskwKn1VFX5JVtEDngEEoOxNZEBXYgFu750hJPiqgqEdeQQsYhxshiBMwzme2PxnQurkxYsJBvCm1XRNK2YYfbuw2CqeAw_PTqWgD1a-zv-uQ18YTCL9Ek',
  },
  {
    id: 'tp-2',
    name: 'Cotton Designer Tee',
    stock: '18 units',
    stockClass: 'text-amber-600 font-bold',
    price: '₹499',
    sold: '612 Sold',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRTty01mkjoiq24vG7JCv67mTgkB7lUXxFoiqUs_NruWp7TRi9kyFVti-Q8FxVFXZMxzH2kALIFEMvmsJG1ZD32g2mpFXHIhlP0AbFLDNsWpfuy-2Tag0dQHZ3m9I7xSfHtIp8XJH4jFO7Ysi5cLTxylwAWQXvNVg2G-C0YwF-1sGgCeVOsq1lgSssmigBCKxuQ8euHmXNKQuHTm2-tleA4ENttn6k5HdXGQ4mQBuS8I7A04qzGhNx-CgKErSOAuv4bJYF5eiohe4',
  },
  {
    id: 'tp-3',
    name: 'Minimalist Gold Watch',
    stock: '45 units',
    stockClass: 'text-emerald-600 font-bold',
    price: '₹2,499',
    sold: '488 Sold',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMHrBBEaOKIaIxs-krCV8r98eScU7K8WD2ssKdbpMS3VW3A0oI_lvyCen00es3iKUWB5nJqn6FmQXPx3F3eAqR610Qe6djt3e0oFC7-UdI8bgs6DlOuJi9pm5qHbrPdN3UMOvwuaFC8EAmPkWPT_hQxo9L3pFSRuctjRjBQ_qekaPu-2bTYSSKr6hK25KISmNQl1lt-FDl7rmGsBfBb4Kjjto8Kt5E_NNuTjPjueyHTibBpPS--j-xqMV9xWe0bC1AWbvqWFdcNs',
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

export function SellerWebDashboard({ onNavigate, onViewProducts, onViewOrders, onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chartView, setChartView] = useState('monthly'); // 'weekly' | 'monthly'
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedOrderMenu, setSelectedOrderMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNav = (itemOrPath) => {
    let path = itemOrPath;
    if (typeof itemOrPath === 'object' && itemOrPath !== null) {
      setActiveTab(itemOrPath.id);
      path = itemOrPath.path || itemOrPath.id;
    } else if (typeof itemOrPath === 'string') {
      const match = SIDEBAR_ITEMS.find((i) => i.id === itemOrPath || i.path === itemOrPath);
      if (match) {
        setActiveTab(match.id);
        path = match.path;
      } else {
        setActiveTab(itemOrPath);
      }
    }

    if (path === '/supplier-inventory' && onViewProducts) {
      onViewProducts();
      return;
    }
    if (path === '/supplier-orders' && onViewOrders) {
      onViewOrders();
      return;
    }

    if (onNavigate) {
      onNavigate(path);
    }
  };

  // Filtered orders for table
  const filteredOrders = INITIAL_ORDERS.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    return order.status === statusFilter;
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">download</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================== Mobile Top Bar with Hamburger Menu ===================== */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('/admin-panel') : window.history.back())}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
            title="Back to Admin Panel"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
            title="Open Side Menu"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF3F6C] to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Seller Console
            </h1>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Digital Curator Hub
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleNav('/add-product')}
            className="bg-rose-50 text-[#FF3F6C] px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Product</span>
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
                    S
                  </div>
                  <div>
                    <h2 className="text-base font-black text-rose-500 font-['Plus_Jakarta_Sans',sans-serif]">
                      Seller Console
                    </h2>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Digital Curator Hub
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
                  const isActive = activeTab === item.id;
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
                  if (onNavigate) onNavigate('/admin-panel');
                }}
                className="w-full py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Switch to Admin Console</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1">
        {/* ===================== SideNavBar (Desktop Shell) ===================== */}
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-950 py-6 space-y-2 border-r border-slate-200/60 dark:border-slate-800">
          <div className="px-6 mb-6">
            <div className="flex items-center gap-2.5">
              <img 
                src="/mshoppy-logo.png" 
                alt="MShoppy" 
                className="w-8 h-8 rounded-lg object-contain shadow-xs" 
              />
              <div>
                <h1 className="text-base font-black text-[#FF3F6C] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-tight">
                  MShoppy Seller
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                  Supplier &amp; Merchant Hub
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
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
              onClick={() => onNavigate && onNavigate('/admin-panel')}
              className="w-full bg-[#FF3F6C] hover:bg-rose-600 text-white py-2.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-95 mb-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/support-center')}
              className="w-full flex items-center px-3 py-2 text-slate-500 hover:text-slate-700 cursor-pointer text-xs font-semibold transition-colors rounded-lg"
            >
              <span className="material-symbols-outlined mr-2.5 text-base">help</span>
              Support
            </button>
            <button
              type="button"
              onClick={() => showToast('Logging out...')}
              className="w-full flex items-center px-3 py-2 text-red-500 hover:text-red-700 cursor-pointer text-xs font-semibold transition-colors rounded-lg"
            >
              <span className="material-symbols-outlined mr-2.5 text-base">logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* ===================== Main Content Area ===================== */}
        <main className="flex-1 flex flex-col min-w-0 md:pl-64">
          {/* TopNavBar */}
          <header className="flex justify-between items-center px-4 sm:px-8 py-3 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs sticky top-0 z-30 border-b border-slate-200/60">
            <div className="flex items-center gap-3 flex-1">
              <button
                type="button"
                onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('/admin-panel') : window.history.back())}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 cursor-pointer shrink-0 transition-colors flex items-center justify-center"
                aria-label="Back to Admin Panel"
                title="Back to Admin Panel"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div className="relative w-full max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search analytics, products or orders..."
                  className="w-full bg-[#f2f4f6] border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:bg-white focus:border-[#FF3F6C]/40 focus:ring-2 focus:ring-[#FF3F6C]/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex space-x-6">
                <button
                  type="button"
                  onClick={() => showToast('Redirecting to Marketplace Catalog...')}
                  className="text-slate-600 dark:text-slate-400 hover:text-[#FF3F6C] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-sm transition-colors cursor-pointer"
                >
                  Marketplace
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Opening Supplier Documentation & FAQs...')}
                  className="text-slate-600 dark:text-slate-400 hover:text-[#FF3F6C] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-sm transition-colors cursor-pointer"
                >
                  Resources
                </button>
              </div>

              <div className="flex items-center space-x-4 border-l border-slate-200 pl-6 ml-2">
                <button
                  type="button"
                  onClick={() => showToast('You have 4 new order notifications!')}
                  aria-label="Notifications"
                  className="relative text-slate-600 hover:text-[#FF3F6C] transition-colors active:scale-95 duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF3F6C] rounded-full border-2 border-white"></span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  aria-label="Profile Account"
                  className="flex items-center space-x-2 text-slate-600 hover:text-[#FF3F6C] transition-colors active:scale-95 duration-200 cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    account_circle
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content Container */}
          <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full pb-28">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#191C1E] dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Management Console
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  Welcome back, Luxury Reseller. Here's your performance snapshot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast('Preparing performance PDF report for download...')}
                className="bg-gradient-to-r from-[#b90041] to-[#df2457] hover:from-[#a00037] hover:to-[#c71e4d] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download Report
              </button>
            </section>

            {/* Stats Bento Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Sales */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-rose-50 text-[#FF3F6C] rounded-xl">
                    <span className="material-symbols-outlined">payments</span>
                  </span>
                  <span className="text-[#006a34] text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +12.5% <span className="material-symbols-outlined text-xs">arrow_upward</span>
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Total Sales
                  </p>
                  <h2 className="text-2xl font-black text-[#4d41df] mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹4,82,900
                  </h2>
                </div>
              </div>

              {/* Card 2: Orders */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <span className="material-symbols-outlined">local_shipping</span>
                  </span>
                  <span className="text-[#006a34] text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +8.2% <span className="material-symbols-outlined text-xs">arrow_upward</span>
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Orders
                  </p>
                  <h2 className="text-2xl font-black text-[#4d41df] mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    1,284
                  </h2>
                </div>
              </div>

              {/* Card 3: Avg. Order Value */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <span className="material-symbols-outlined">shopping_bag</span>
                  </span>
                  <span className="text-slate-500 text-xs font-bold flex items-center bg-slate-100 px-2 py-0.5 rounded-full">
                    Stable
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Avg. Order Value
                  </p>
                  <h2 className="text-2xl font-black text-[#4d41df] mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹376
                  </h2>
                </div>
              </div>

              {/* Card 4: Rating */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </span>
                  <span className="text-[#006a34] text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +0.2 <span className="material-symbols-outlined text-xs">arrow_upward</span>
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Rating
                  </p>
                  <h2 className="text-2xl font-black text-[#4d41df] mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    4.8 / 5
                  </h2>
                </div>
              </div>
            </section>

            {/* Inbound Returns & RTO Alert Banner */}
            <section className="bg-gradient-to-r from-rose-50 via-white to-amber-50/40 p-5 rounded-2xl border border-rose-200/70 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#b90041] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200">
                  <span className="material-symbols-outlined text-2xl">assignment_return</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Inbound Returns & Courier RTO Management
                    </h3>
                    <span className="bg-[#b90041] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      48 Action Items
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    18 Customer Returns • 30 Courier RTOs • 3 Active SPF Dispute Claims (₹12,850 Recovered)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => handleNav('returns')}
                  className="bg-[#b90041] hover:bg-[#a00037] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-200 transition-all cursor-pointer"
                >
                  <span>Manage Returns & SPF Claims</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </section>

            {/* Customer Dropship Auto-Sync & Fulfilment Hub Banner */}
            <section className="bg-gradient-to-r from-pink-50 via-white to-purple-50/40 p-5 rounded-2xl border border-pink-200/70 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF3F6C] to-[#b90041] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-pink-200">
                  <span className="material-symbols-outlined text-2xl">sync_alt</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Customer Order & Supplier Fulfilment (Dropshipping)
                    </h3>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      Auto-Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Customer orders from Dropshipper site auto-sync via Webhook. Pack white-label & ship directly to customer.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => handleNav('dropship')}
                  className="bg-[#FF3F6C] hover:bg-[#e02653] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-pink-200 transition-all cursor-pointer"
                >
                  <span>Open Dropship Fulfilment Hub</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </section>

            {/* Visualization Row (Chart + Top Selling) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales Overview Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xs border border-slate-100 relative overflow-hidden min-h-[400px]">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                      Sales Overview
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {chartView === 'monthly'
                        ? 'Monthly growth metrics for 2024'
                        : 'Weekly performance metrics'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setChartView('weekly')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        chartView === 'weekly'
                          ? 'bg-[#b90041] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView('monthly')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        chartView === 'monthly'
                          ? 'bg-[#b90041] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Interactive Chart Representation */}
                <div className="relative h-64 w-full flex items-end justify-between gap-3 px-2 group">
                  <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                    <div className="border-b border-slate-900 w-full h-0"></div>
                    <div className="border-b border-slate-900 w-full h-0"></div>
                    <div className="border-b border-slate-900 w-full h-0"></div>
                    <div className="border-b border-slate-900 w-full h-0"></div>
                  </div>

                  {/* Bar Jan */}
                  <div className="w-full h-24 bg-rose-500/20 hover:bg-rose-500/40 rounded-t-lg relative group transition-all duration-300 cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      ₹22k
                    </div>
                  </div>

                  {/* Bar Feb */}
                  <div className="w-full h-32 bg-rose-500/30 hover:bg-rose-500/40 rounded-t-lg relative group transition-all duration-300 cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      ₹38k
                    </div>
                  </div>

                  {/* Bar Mar */}
                  <div className="w-full h-48 bg-rose-500/40 hover:bg-rose-500/50 rounded-t-lg relative group transition-all duration-300 cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      ₹54k
                    </div>
                  </div>

                  {/* Bar Apr */}
                  <div className="w-full h-40 bg-rose-500/30 hover:bg-rose-500/40 rounded-t-lg relative group transition-all duration-300 cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      ₹46k
                    </div>
                  </div>

                  {/* Bar May */}
                  <div className="w-full h-56 bg-rose-500/50 hover:bg-rose-500/60 rounded-t-lg relative group transition-all duration-300 cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      ₹68k
                    </div>
                  </div>

                  {/* Bar Jun (Current Active) */}
                  <div className="w-full h-72 bg-gradient-to-t from-[#b90041]/70 to-[#b90041] rounded-t-lg relative group transition-all duration-300 shadow-lg cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-100 whitespace-nowrap shadow-md">
                      Current: ₹84k
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] mb-6">
                    Top Selling
                  </h3>
                  <div className="space-y-6">
                    {TOP_PRODUCTS.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => onViewProducts && onViewProducts()}
                        className="flex items-center gap-4 group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/60 shadow-xs">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#191C1E] truncate group-hover:text-[#b90041] transition-colors">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Stock: <span className={prod.stockClass}>{prod.stock}</span>
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm font-black text-[#b90041]">{prod.price}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                              {prod.sold}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onViewProducts || (() => handleNav('inventory'))}
                  className="w-full mt-8 py-3 text-xs font-bold text-[#FF3F6C] bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors uppercase tracking-widest cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            </section>

            {/* Recent Orders Table */}
            <section className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                    Recent Orders
                  </h3>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        filter_list
                      </span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#f2f4f6] p-2 pl-10 pr-8 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#FF3F6C]/20 appearance-none w-full cursor-pointer outline-none font-medium"
                      >
                        <option value="All">All Status</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Processing">Processing</option>
                        <option value="Pending">Pending</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#f8f9fb]">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Product Name</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-10 text-center text-slate-400">
                          No orders match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5 font-mono text-xs font-bold text-slate-500">
                            {order.id}
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-600">{order.date}</td>
                          <td className="px-8 py-5 text-sm font-semibold text-[#191C1E]">
                            {order.productName}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${order.avatarBg}`}
                              >
                                {order.avatar}
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {order.customer}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-black text-[#191C1E]">
                            {order.amount}
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.statusStyle}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right relative">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrderMenu(
                                  selectedOrderMenu === order.id ? null : order.id
                                )
                              }
                              className="material-symbols-outlined text-slate-400 hover:text-[#FF3F6C] cursor-pointer p-1 rounded-full hover:bg-slate-100"
                            >
                              more_vert
                            </button>

                            {selectedOrderMenu === order.id && (
                              <div className="absolute right-8 top-12 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Viewing details for ${order.id}`);
                                    setSelectedOrderMenu(null);
                                  }}
                                  className="w-full px-3 py-2 hover:bg-slate-50 font-medium text-slate-700 block"
                                >
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Printing invoice for ${order.id}`);
                                    setSelectedOrderMenu(null);
                                  }}
                                  className="w-full px-3 py-2 hover:bg-slate-50 font-medium text-slate-700 block"
                                >
                                  Print Invoice
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full mt-auto bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60">
            <p className="font-['Inter'] text-xs text-slate-500">
              © 2024 Curator Luxe Social Commerce. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a className="text-xs text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="text-xs text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Terms of Service
              </a>
              <a className="text-xs text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Merchant Agreement
              </a>
              <a className="text-xs text-slate-400 hover:text-slate-600 transition-colors" href="#">
                Contact
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* ===================== BottomNavBar ===================== */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}

export default SellerWebDashboard;
