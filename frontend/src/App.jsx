import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Reseller & Fintech Pages (Shruti Branch)
import HomeUserReseller from './pages/Reseller Earnings & Wallets/HomeUserReseller';
import ShareEarnConfig from './pages/Reseller Earnings & Wallets/ShareEarnConfig';
import AffiliateProgram from './pages/Reseller Earnings & Wallets/AffiliateProgram';
import AffiliateProgramPanel from './pages/Reseller Earnings & Wallets/AffiliateProgramPanel';
import MyWalletFintechStyle from './pages/Reseller Earnings & Wallets/MyWalletFintechStyle';
import CommunityHub from './pages/Reseller Earnings & Wallets/CommunityHub';
import PayoutSettings from './pages/Reseller Earnings & Wallets/PayoutSettings';
import PayoutConfirmation from './pages/Reseller Earnings & Wallets/PayoutConfirmation';
import NotificationCenter from './pages/Reseller Earnings & Wallets/NotificationCenter';
import ConversationScreen from './pages/Reseller Earnings & Wallets/ConversationScreen';
import MeeshoMessengerChatHub from './pages/Reseller Earnings & Wallets/MeeshoMessengerChatHub';
import LoginSignup from './pages/Reseller Earnings & Wallets/LoginSignup';
import ReferEarn from './pages/Reseller Earnings & Wallets/ReferEarn';
import ResellEarn from './pages/Reseller Earnings & Wallets/ResellEarn';
import EarningsDashboard1 from './pages/Reseller Earnings & Wallets/EarningsDashboard1';
import EarningsDashboard2 from './pages/Reseller Earnings & Wallets/EarningsDashboard2';
import ResellerWallet from './pages/Reseller Earnings & Wallets/ResellerWallet';
import WithdrawEarnings from './pages/Reseller Earnings & Wallets/WithdrawEarnings';
import ResellerReturnsLedger from './pages/Reseller Earnings & Wallets/ResellerReturnsLedger';
import DropshipperKYCRegister from './pages/Reseller Earnings & Wallets/DropshipperKYCRegister';
import SupplierProductAccess from './pages/Reseller Earnings & Wallets/SupplierProductAccess';
import DropshipperLogin from './pages/Reseller Earnings & Wallets/DropshipperLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Dropshipper Hub Pages
import DropshipperSettlementTracking from './pages/dropshipper/DropshipperSettlementTracking';
import DropshipperRotManager from './pages/dropshipper/DropshipperRotManager';

// Customer & Reseller Shopping Pages
import HomeScreenFlutterLuxe from './pages/customer & Reseller/home_screen_flutter_luxe';
import FlashSaleLandingPage from './pages/customer & Reseller/flash_sale_landing_page';
import CuratedSpotlight from './pages/customer & Reseller/curated_spotlight';
import SearchCategoriesExplorer from './pages/customer & Reseller/search_categories_explorer';
import SearchResults from './pages/customer & Reseller/search_results';
import SareesCategoryListing from './pages/customer & Reseller/sarees_category_listing';
import WomenWesternCategory from './pages/customer & Reseller/women_western_category';
import ProductDetail from './pages/customer & Reseller/product_detail';
import RatingsReviews from './pages/customer & Reseller/ratings_reviews';
import WriteAReview from './pages/customer & Reseller/write_a_review';
import UserWishlist from './pages/customer & Reseller/user_wishlist';
import ShoppingCart from './pages/customer & Reseller/shopping_cart';
import CheckoutAddressSelection from './pages/customer & Reseller/checkout_address_selection';
import CheckoutPayment from './pages/customer & Reseller/checkout_payment';
import UserWebDashboard from './pages/customer & Reseller/user_web_dashboard';
import CustomerOrders from './pages/customer & Reseller/CustomerOrders';
import ReturnRequest from './pages/customer & Reseller/ReturnRequest';
import AffiliateKYC from './pages/customer & Reseller/AffiliateKYC';
import AffiliateKycStatus from './pages/customer & Reseller/AffiliateKycStatus';

// Delivery & Driver Logistics Pages
import DriverDashboardMobile from './pages/delivery & driver logistics/driver_dashboard_mobile';
import AvailableTasks from './pages/delivery & driver logistics/available_tasks';
import OrderDetailsDriver from './pages/delivery & driver logistics/order_details_driver';
import ActiveDeliveryMobile from './pages/delivery & driver logistics/active_delivery_mobile';
import DeliveryHistoryMobile from './pages/delivery & driver logistics/delivery_history_mobile';
import DriverEarningsMobile from './pages/delivery & driver logistics/driver_earnings_mobile';
import RiderExpressDashboard from './pages/delivery & driver logistics/rider_express_dashboard';
import MeeshoVelocity from './pages/delivery & driver logistics/meesho_velocity';
import SwiftRoute from './pages/delivery & driver logistics/swiftroute';
import DriverReversePickup from './pages/delivery & driver logistics/driver_reverse_pickup';

// Supplier Hub Pages
import SupplierDashboard2 from './pages/supplier/supplier_dashboard2';
import SupplierDashboard1 from './pages/supplier/supplier_dashboard1';
import SupplierInventoryManagement from './pages/supplier/supplier_inventory_management';
import SupplierOrdersList from './pages/supplier/supplier_orders_list';
import SupplierProfile from './pages/supplier/supplier_profile';
import AddNewProductSupplier from './pages/supplier/add_new_product_supplier';
import AddCategorySupplier from './pages/supplier/add_category_supplier';
import SellerWebDashboard from './pages/supplier/seller_web_dashboard';
import SupplierReturnsRTO from './pages/supplier/SupplierReturnsRTO';
import SupplierRotLedger from './pages/supplier/SupplierRotLedger';
import CustomerOrderSupplierFulfilment from './pages/supplier/CustomerOrderSupplierFulfilment';

// Admin Panel Pages
import AdminLogin from './pages/admin_panel/AdminLogin';
import AdminLogin1 from './pages/admin_panel/AdminLogin1';
import AdminWebPanel from './pages/admin_panel/admin_web_panel';
import AdminWebPanel1 from './pages/admin_panel/admin_web_panel1';
import AdminProductCatalog from './pages/admin_panel/admin_product_catalog';
import CampaignCreationFlowAdmin from './pages/admin_panel/campaign_creation_flow_admin';
import PerformanceAnalyticsDashboardAdmin from './pages/admin_panel/performance_analytics_dashboard_admin';
import AdminReturnRefundHub from './pages/admin_panel/AdminReturnRefundHub';
import AdminDropshipperKyc from './pages/admin_panel/AdminDropshipperKyc';
import AdminAffiliateKycApproval from './pages/admin_panel/AdminAffiliateKycApproval';
import AdminRotRulesConfigurator from './pages/admin_panel/AdminRotRulesConfigurator';
import AdminSupportDesk from './pages/admin_panel/AdminSupportDesk';

// Support & Ticketing Pages
import SupportCenter from './pages/Community_Social_Chat_&_Customer_Support/support_center';
import RaiseATicket from './pages/Community_Social_Chat_&_Customer_Support/raise_a_ticket';

// Design Ecosystem & Theme Variations
import TheDigitalCuratorEcosystem from './pages/Design_Ecosystem_&_Theme_Variations/the_digital_curator_ecosystem';
import PetalCollective from './pages/Design_Ecosystem_&_Theme_Variations/petal_collective';
import GildedPulse from './pages/Design_Ecosystem_&_Theme_Variations/gilded_pulse';
import SocialCommerceLuxe from './pages/Design_Ecosystem_&_Theme_Variations/social_commerce_luxe';
import SignalCore from './pages/Design_Ecosystem_&_Theme_Variations/signal_core';
import StructureFlow from './pages/Design_Ecosystem_&_Theme_Variations/structure_flow';

// Screen Catalog for Floating Navigator
const screenCatalog = [
  // 1. Dropshipper Portal Screens
  { path: '/dropshipper-settlements', name: 'Settlement & Tracking', icon: '📊', group: 'Dropshipper' },
  { path: '/dropshipper-rot-manager', name: 'ROT Liability & Policy Manager', icon: '🛡️', group: 'Dropshipper' },
  { path: '/share-earn-config', name: 'Share & Margin Config', icon: '🔗', group: 'Dropshipper' },
  { path: '/reseller-returns', name: 'Returns & Margin Ledger', icon: '🔄', group: 'Dropshipper' },
  { path: '/my-wallet', name: 'Fintech Wallet & Passbook', icon: '👛', group: 'Dropshipper' },
  { path: '/reseller-wallet', name: 'Reseller Earnings Wallet', icon: '💳', group: 'Dropshipper' },
  { path: '/withdraw-earnings', name: 'Withdraw Margin to Bank', icon: '🏦', group: 'Dropshipper' },
  { path: '/payout-settings', name: 'Bank & UPI Settings', icon: '⚙️', group: 'Dropshipper' },
  { path: '/admin-dropshipper-kyc', name: 'Dropshipper KYC Audit', icon: '📦', group: 'Dropshipper' },

  // 2. Reseller & Fintech 
  { path: '/reseller-home', name: 'Reseller Home', icon: '🛍️', group: 'Reseller & Shop' },
  { path: '/dropshipper-login', name: 'Dropshipper B2B Login', icon: '🔐', group: 'Reseller & Shop' },
  { path: '/supplier-products', name: 'Supplier Product Access', icon: '🏬', group: 'Reseller & Shop' },
  { path: '/resell-earn', name: 'Resell & Earn', icon: '💰', group: 'Reseller & Shop' },
  { path: '/earnings-dashboard-1', name: 'Earnings Dashboard 1', icon: '📈', group: 'Reseller & Shop' },
  { path: '/earnings-dashboard-2', name: 'Earnings Dashboard 2', icon: '📊', group: 'Reseller & Shop' },
  { path: '/dropshipper-register', name: 'Become Dropshipper (KYC)', icon: '🚀', group: 'Reseller & Shop' },
  { path: '/payout-confirmation', name: 'Payout Confirmation', icon: '✅', group: 'Reseller & Shop' },
  { path: '/refer-earn', name: 'Refer & Earn', icon: '🎁', group: 'Reseller & Shop' },
  { path: '/affiliate-program', name: 'Affiliate Program', icon: '🤝', group: 'Reseller & Shop' },
  { path: '/affiliate-panel', name: 'Affiliate Panel', icon: '👑', group: 'Reseller & Shop' },
  { path: '/affiliate-kyc', name: 'Become Affiliate (KYC)', icon: '🪪', group: 'Reseller & Shop' },
  { path: '/affiliate-kyc-status', name: 'Affiliate KYC Status', icon: '⏳', group: 'Reseller & Shop' },
  { path: '/community-hub', name: 'Community Hub', icon: '👥', group: 'Reseller & Shop' },
  { path: '/messenger', name: 'Messenger Hub', icon: '💬', group: 'Reseller & Shop' },
  { path: '/conversation', name: 'Conversation Screen', icon: '🗨️', group: 'Reseller & Shop' },
  { path: '/notifications', name: 'Notification Center', icon: '🔔', group: 'Reseller & Shop' },
  { path: '/login', name: 'Login / Sign Up', icon: '🔐', group: 'Reseller & Shop' },

  // 3. Customer Shopping Flow
  { path: '/product', name: 'Product Detail', icon: '🏷️', group: 'Shopping' },
  { path: '/cart', name: 'Shopping Cart', icon: '🛒', group: 'Shopping' },
  { path: '/address', name: 'Checkout Address', icon: '📍', group: 'Shopping' },
  { path: '/payment', name: 'Checkout Payment', icon: '💳', group: 'Shopping' },
  { path: '/wishlist', name: 'User Wishlist', icon: '❤️', group: 'Shopping' },
  { path: '/explorer', name: 'Categories Explorer', icon: '🗂️', group: 'Shopping' },
  { path: '/search', name: 'Search Results', icon: '🔍', group: 'Shopping' },
  { path: '/sarees', name: 'Sarees Listing', icon: '🥻', group: 'Shopping' },
  { path: '/western', name: 'Women Western', icon: '👗', group: 'Shopping' },
  { path: '/spotlight', name: 'Curated Spotlight', icon: '🌟', group: 'Shopping' },
  { path: '/flash', name: 'Flash Sale Landing', icon: '⚡', group: 'Shopping' },
  { path: '/luxe', name: 'Flutter Luxe Theme', icon: '✨', group: 'Shopping' },
  { path: '/reviews', name: 'Ratings & Reviews', icon: '⭐', group: 'Shopping' },
  { path: '/write-review', name: 'Write a Review', icon: '✍️', group: 'Shopping' },
  { path: '/user-dashboard', name: 'Curator Web Dashboard', icon: '📊', group: 'Shopping' },
  { path: '/orders', name: 'Customer My Orders', icon: '📦', group: 'Shopping' },
  { path: '/return-request', name: 'Return / Exchange Flow', icon: '🔄', group: 'Shopping' },

  // 4. Logistics & Driver Fleet
  { path: '/driver-dashboard', name: 'Driver Dashboard', icon: '🛵', group: 'Logistics' },
  { path: '/available-tasks', name: 'Available Tasks', icon: '📦', group: 'Logistics' },
  { path: '/order-driver', name: 'Order Details Driver', icon: '📋', group: 'Logistics' },
  { path: '/active-delivery', name: 'Active Delivery Map', icon: '🗺️', group: 'Logistics' },
  { path: '/delivery-history', name: 'Delivery History', icon: '📜', group: 'Logistics' },
  { path: '/driver-earnings', name: 'Driver Earnings', icon: '💰', group: 'Logistics' },
  { path: '/rider-express', name: 'Rider Express', icon: '⚡', group: 'Logistics' },
  { path: '/meesho-velocity', name: 'MShoppy Velocity', icon: '🚀', group: 'Logistics' },
  { path: '/swiftroute', name: 'SwiftRoute AI', icon: '🧭', group: 'Logistics' },
  { path: '/driver-reverse-pickup', name: 'Reverse Pickup QC', icon: '🔄', group: 'Logistics' },

  // 5. Supplier Hub
  { path: '/structure-flow', name: 'Structure Flow Hub', icon: '🏬', group: 'Supplier' },
  { path: '/supplier-dashboard-2', name: 'Supplier Dashboard 2', icon: '📈', group: 'Supplier' },
  { path: '/supplier-dashboard-1', name: 'Supplier Dashboard 1', icon: '📉', group: 'Supplier' },
  { path: '/supplier-inventory', name: 'Inventory Management', icon: '📦', group: 'Supplier' },
  { path: '/supplier-orders', name: 'Supplier Orders List', icon: '📑', group: 'Supplier' },
  { path: '/add-product', name: 'Add New Product', icon: '➕', group: 'Supplier' },
  { path: '/add-category', name: 'Add Category', icon: '🏷️', group: 'Supplier' },
  { path: '/supplier-profile', name: 'Supplier Profile', icon: '👤', group: 'Supplier' },
  { path: '/seller-dashboard', name: 'Seller Web Dashboard', icon: '💻', group: 'Supplier' },
  { path: '/supplier-returns', name: 'Returns, RTO & Claims Hub', icon: '🔄', group: 'Supplier' },
  { path: '/supplier-rot-ledger', name: 'Supplier ROT & Freight Ledger', icon: '🧾', group: 'Supplier' },
  { path: '/dropship-fulfilment', name: 'Customer Order & Supplier Fulfilment', icon: '📦🔄', group: 'Supplier' },

  // 6. Admin Panel & Support
  { path: '/admin-panel', name: 'Admin Web Panel', icon: '🛡️', group: 'Admin' },
  { path: '/admin-support', name: 'Admin Support Desk', icon: '🎧', group: 'Admin' },
  { path: '/admin-affiliate-kyc', name: 'Affiliate KYC & Access', icon: '🤝', group: 'Admin' },
  { path: '/admin-rot-rules', name: 'ROT Business Rules Configurator', icon: '⚙️', group: 'Admin' },
  { path: '/admin-returns', name: 'Returns & Refund Hub', icon: '⚖️', group: 'Admin' },
  { path: '/admin-catalog', name: 'Admin Catalog', icon: '📁', group: 'Admin' },
  { path: '/campaign-flow', name: 'Campaign Creation', icon: '📢', group: 'Admin' },
  { path: '/admin-analytics', name: 'Performance Analytics', icon: '📊', group: 'Admin' },
  { path: '/support-center', name: 'Support Center', icon: '🎧', group: 'Admin' },
  { path: '/raise-ticket', name: 'Raise A Ticket', icon: '🎫', group: 'Admin' },

  // 7. Themes & Design Ecosystem
  { path: '/digital-curator', name: 'Digital Curator', icon: '🎨', group: 'Themes' },
  { path: '/petal-collective', name: 'Petal Collective', icon: '🌸', group: 'Themes' },
  { path: '/gilded-pulse', name: 'Gilded Pulse', icon: '👑', group: 'Themes' },
  { path: '/social-commerce-luxe', name: 'Social Commerce Luxe', icon: '💎', group: 'Themes' },
  { path: '/signal-core', name: 'Signal Core', icon: '⚡', group: 'Themes' },
];

function FloatingNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const groups = ['All', 'Dropshipper', 'Reseller & Shop', 'Shopping', 'Logistics', 'Supplier', 'Admin', 'Themes'];

  // Global keyboard shortcuts: Ctrl+K / Cmd+K to toggle, Esc to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Open on custom event from bottom nav or buttons
  React.useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-screen-navigator', handleOpen);
    return () => window.removeEventListener('open-screen-navigator', handleOpen);
  }, []);

  // Auto-focus search input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const q = searchQuery.trim().toLowerCase();

  // Filtered screens for current group and search query
  const filteredScreens = screenCatalog.filter((s) => {
    const matchesGroup = selectedGroup === 'All' || s.group === selectedGroup;
    if (!q) return matchesGroup;

    const matchesQuery =
      s.name.toLowerCase().includes(q) ||
      s.path.toLowerCase().includes(q) ||
      s.group.toLowerCase().includes(q);

    return matchesGroup && matchesQuery;
  });

  // Total matches across ALL groups when searching
  const totalMatchesAllGroups = q
    ? screenCatalog.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.path.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q)
    ).length
    : screenCatalog.length;

  return (
    <>
      {/* Modal / Overlay - Opened when clicking the 'Screens' icon in the bottom nav or pressing Ctrl+K */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999998] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-950/95 backdrop-blur-xl text-white p-4 sm:p-6 rounded-t-[2rem] sm:rounded-3xl shadow-2xl border-t-2 sm:border-2 border-[#b90041] max-w-full sm:max-w-2xl w-full max-h-[88vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#b90041]"></span>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Screens Navigator</span>
                    <span className="text-[11px] font-semibold bg-[#b90041]/30 text-rose-300 px-2 py-0.5 rounded-full border border-[#b90041]/40">
                      {screenCatalog.length} Pages
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-400">Click any screen to navigate instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] bg-gray-900 text-gray-400 px-2 py-1 rounded font-mono border border-gray-800">
                  Ctrl+K
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors border border-gray-800"
                  aria-label="Close Screens Navigator"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Input Bar with Search Icon */}
            <div className="relative mb-3">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search screens... (e.g. wallet, order, driver, admin)"
                  className="w-full pl-10 pr-20 py-2.5 bg-gray-900/90 border border-gray-800 focus:border-[#b90041] focus:ring-2 focus:ring-[#b90041]/40 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                />
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-white p-1 rounded-md text-xs cursor-pointer hover:bg-gray-800 transition-colors"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-gray-800 text-rose-300 border border-gray-700">
                    {filteredScreens.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Tabs with Live Match Counts */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {groups.map((group) => {
                const count = q
                  ? screenCatalog.filter((s) => {
                    const inGroup = group === 'All' || s.group === group;
                    const matches =
                      s.name.toLowerCase().includes(q) ||
                      s.path.toLowerCase().includes(q) ||
                      s.group.toLowerCase().includes(q);
                    return inGroup && matches;
                  }).length
                  : group === 'All'
                    ? screenCatalog.length
                    : screenCatalog.filter((s) => s.group === group).length;

                const isSelected = selectedGroup === group;

                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isSelected
                        ? 'bg-[#b90041] text-white shadow-md shadow-pink-500/30'
                        : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-850'
                      }`}
                  >
                    <span>{group}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-800 text-gray-400'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Screen List Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredScreens.length > 0 ? (
                filteredScreens.map((screen) => {
                  const isActive = location.pathname === screen.path;
                  return (
                    <button
                      key={screen.path}
                      type="button"
                      onClick={() => {
                        navigate(screen.path);
                        setIsOpen(false);
                      }}
                      className={`flex flex-col gap-0.5 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${isActive
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 border-rose-400 scale-[1.02]'
                          : 'bg-gray-900/90 hover:bg-gray-850 text-gray-300 hover:text-white border-gray-800/80 hover:border-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="text-base shrink-0">{screen.icon}</span>
                        <span className="truncate text-xs font-bold">{screen.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5 mt-1">
                        <span className="truncate opacity-75">{screen.group}</span>
                        <span className="font-mono text-[9px] opacity-60 truncate max-w-[80px]">
                          {screen.path}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : selectedGroup !== 'All' && totalMatchesAllGroups > 0 ? (
                <div className="col-span-full py-6 px-3 bg-rose-950/30 border border-rose-900/50 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-rose-200">
                    No screens in "{selectedGroup}" matching "{searchQuery}".
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Found {totalMatchesAllGroups} matching screen{totalMatchesAllGroups > 1 ? 's' : ''} in other categories.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup('All')}
                    className="mt-3 px-3.5 py-1.5 bg-[#b90041] hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    View All {totalMatchesAllGroups} Results
                  </button>
                </div>
              ) : (
                <div className="col-span-full py-8 flex flex-col items-center justify-center text-center text-gray-400">
                  <span className="text-3xl mb-2">🔍</span>
                  <p className="text-xs font-bold text-gray-200">
                    No screens found for "{searchQuery}"
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Try searching for "wallet", "orders", "driver", "admin", etc.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGroup('All');
                    }}
                    className="mt-3 px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-pink-400 border border-pink-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Router Bridge Component
function AppRoutes() {
  const navigate = useNavigate();

  // Helper navigate prop for legacy components expecting onNavigate/onBack
  const handleNav = (pathOrId) => {
    const routeMap = {
      // Customer
      reseller: '/reseller-home',
      home: '/reseller-home',
      cart: '/cart',
      wishlist: '/wishlist',
      checkout: '/address',
      address: '/address',
      payment: '/payment',
      product: '/product',
      reviews: '/reviews',
      write_review: '/write-review',
      explorer: '/explorer',
      categories: '/explorer',
      search: '/search',
      sarees: '/sarees',
      western: '/western',
      spotlight: '/spotlight',
      flash: '/flash',
      luxe: '/luxe',
      user_dashboard: '/user-dashboard',
      'user-dashboard': '/user-dashboard',
      '/user-dashboard': '/user-dashboard',
      dashboard: '/user-dashboard',
      'user-web-dashboard': '/user-dashboard',
      userWebDashboard: '/user-dashboard',
      users: '/user-dashboard',
      '/users': '/user-dashboard',
      'user-profile': '/user-dashboard',
      '/user-profile': '/user-dashboard',
      userProfile: '/user-dashboard',
      user_profile: '/user-dashboard',
      orders: '/orders',
      'my-orders': '/orders',
      return_request: '/return-request',
      'return-request': '/return-request',
      returns: '/orders',

      // Reseller & Fintech
      products: '/supplier-products',
      '/products': '/supplier-products',
      'dropshipper-login': '/dropshipper-login',
      dropshipperLogin: '/dropshipper-login',
      'supplier-products': '/supplier-products',
      '/supplier-products': '/supplier-products',
      'supplier-product': '/supplier-products',
      supplierProducts: '/supplier-products',
      supplier_products: '/supplier-products',
      'dropshipper-products': '/supplier-products',
      'resell-earn': '/resell-earn',
      'share-earn-config': '/share-earn-config',
      earnings: '/earnings-dashboard-1',
      '/earnings': '/earnings-dashboard-1',
      'earnings-dashboard': '/earnings-dashboard-1',
      '/earnings-dashboard': '/earnings-dashboard-1',
      earningsDashboard: '/earnings-dashboard-1',
      'earnings-dashboard-1': '/earnings-dashboard-1',
      'earnings-dashboard-2': '/earnings-dashboard-2',
      'my-wallet': '/my-wallet',
      'reseller-wallet': '/reseller-wallet',
      'reseller-returns': '/reseller-returns',
      reseller_returns: '/reseller-returns',
      resellerReturns: '/reseller-returns',
      'dropshipper-settlements': '/dropshipper-settlements',
      'dropshipper-tracking': '/dropshipper-settlements',
      'settlement-tracking': '/dropshipper-settlements',
      'dropshipper-rot-manager': '/dropshipper-rot-manager',
      'rot-manager': '/dropshipper-rot-manager',
      'withdraw-earnings': '/withdraw-earnings',
      'withdraw_earnings': '/withdraw-earnings',
      'payout-settings': '/payout-settings',
      'payout-confirmation': '/payout-confirmation',
      'refer-earn': '/refer-earn',
      'affiliate-program': '/affiliate-program',
      'affiliate-panel': '/affiliate-panel',

      // Logistics
      driver_dashboard: '/driver-dashboard',
      available_tasks: '/available-tasks',
      order_driver: '/order-driver',
      active_delivery: '/active-delivery',
      delivery_history: '/delivery-history',
      driver_earnings: '/driver-earnings',
      rider_express: '/rider-express',
      meesho_velocity: '/meesho-velocity',
      swiftroute: '/swiftroute',
      driver_reverse_pickup: '/driver-reverse-pickup',
      'driver-reverse-pickup': '/driver-reverse-pickup',

      // Supplier
      structureFlow: '/structure-flow',
      dashboard2: '/supplier-dashboard-2',
      dashboard1: '/supplier-dashboard-1',
      inventory: '/supplier-inventory',
      orders: '/supplier-orders',
      addProduct: '/add-product',
      addCategory: '/add-category',
      profile: '/supplier-profile',
      webDashboard: '/seller-dashboard',
      sellers: '/seller-dashboard',
      '/sellers': '/seller-dashboard',
      seller: '/seller-dashboard',
      '/seller': '/seller-dashboard',
      'seller-dashboard': '/seller-dashboard',
      '/seller-dashboard': '/seller-dashboard',
      sellerDashboard: '/seller-dashboard',
      sellersDashboard: '/seller-dashboard',
      supplier_returns: '/supplier-returns',
      'supplier-returns': '/supplier-returns',
      'supplier-rot-ledger': '/supplier-rot-ledger',
      'rot-ledger': '/supplier-rot-ledger',
      returns: '/supplier-returns',

      // Admin & Community
      adminPanel: '/admin-panel',
      adminSupport: '/admin-support',
      'admin-support': '/admin-support',
      '/admin-support': '/admin-support',
      support: '/admin-support',
      '/support': '/admin-support',
      admin_support: '/admin-support',
      supportDesk: '/admin-support',
      adminReturns: '/admin-returns',
      'admin-returns': '/admin-returns',
      admin_returns: '/admin-returns',
      'admin-rot-rules': '/admin-rot-rules',
      'rot-rules': '/admin-rot-rules',
      refunds: '/admin-returns',
      adminCatalog: '/admin-catalog',
      campaignFlow: '/campaign-flow',
      adminAnalytics: '/admin-analytics',
      'admin-analytics': '/admin-analytics',
      '/admin-analytics': '/admin-analytics',
      analytics: '/admin-analytics',
      '/analytics': '/admin-analytics',
      'admin-dropshipper-kyc': '/admin-dropshipper-kyc',
      adminDropshipperKyc: '/admin-dropshipper-kyc',
      'dropshipper-register': '/dropshipper-register',
      dropshipperRegister: '/dropshipper-register',
      'dropshipper-kyc': '/dropshipper-register',
      communityHub: '/community-hub',
      messenger: '/messenger',
      chatScreen: '/conversation',
      supportCenter: '/support-center',
      raiseTicket: '/raise-ticket',
      notifications: '/notifications',
      login: '/login',
      affiliateKyc: '/affiliate-kyc',
      'affiliate-kyc': '/affiliate-kyc',
      becomeAffiliate: '/affiliate-kyc',
      'become-affiliate': '/affiliate-kyc',
      affiliateKycStatus: '/affiliate-kyc-status',
      'affiliate-kyc-status': '/affiliate-kyc-status',
      'affiliate-status': '/affiliate-kyc-status',

      // Themes
      digitalCurator: '/digital-curator',
      petalCollective: '/petal-collective',
      gildedPulse: '/gilded-pulse',
      socialCommerceLuxe: '/social-commerce-luxe',
      signalCore: '/signal-core',
    };

    const target = routeMap[pathOrId] || pathOrId;
    if (target.startsWith('/')) {
      navigate(target);
    } else {
      navigate(`/${target}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="relative min-h-screen bg-[#f8f9fb] w-full max-w-full overflow-x-hidden">
      <FloatingNavigator />

      <Routes>
        {/* Reseller & Fintech Routes (Shruti Flow) */}
        <Route path="/reseller-home" element={<HomeUserReseller />} />
        <Route path="/products" element={<SupplierProductAccess onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/supplier-products" element={<SupplierProductAccess onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/dropshipper-products" element={<SupplierProductAccess onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/supplier-product" element={<SupplierProductAccess onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/share-earn-config" element={<ShareEarnConfig />} />
        <Route path="/resell-earn" element={<ResellEarn />} />
        <Route path="/earnings" element={<EarningsDashboard1 onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/earnings-dashboard" element={<EarningsDashboard1 onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/earnings-dashboard-1" element={<EarningsDashboard1 onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/earnings-dashboard-2" element={<EarningsDashboard2 onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/refer-earn" element={<ReferEarn />} />
        <Route path="/affiliate-program" element={<AffiliateProgram />} />
        <Route 
          path="/affiliate-panel" 
          element={
            <ProtectedRoute role="affiliate">
              <AffiliateProgramPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="/affiliate-kyc" element={<AffiliateKYC onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/become-affiliate" element={<AffiliateKYC onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/affiliate-kyc-status" element={<AffiliateKycStatus onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/affiliate-status" element={<AffiliateKycStatus onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/my-wallet" element={<MyWalletFintechStyle />} />
        <Route path="/reseller-wallet" element={<ResellerWallet />} />
        <Route path="/reseller-returns" element={<ResellerReturnsLedger onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/dropshipper-settlements" element={<DropshipperSettlementTracking onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/dropshipper-tracking" element={<DropshipperSettlementTracking onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/dropshipper-rot-manager" element={<DropshipperRotManager onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/dropshipper-register" element={<DropshipperKYCRegister onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/withdraw-earnings" element={<WithdrawEarnings />} />
        <Route path="/payout-settings" element={<PayoutSettings />} />
        <Route path="/payout-confirmation" element={<PayoutConfirmation />} />
        <Route path="/community-hub" element={<CommunityHub />} />
        <Route path="/messenger" element={<MeeshoMessengerChatHub />} />
        <Route path="/conversation" element={<ConversationScreen />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/" element={<LoginSignup />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/auth" element={<AdminLogin1 />} />
        <Route path="/dropshipper-login" element={<DropshipperLogin />} />


        {/* Customer Shopping Routes */}
        <Route path="/product" element={<ProductDetail onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/cart" element={<ShoppingCart onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/address" element={<CheckoutAddressSelection onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/payment" element={<CheckoutPayment onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/wishlist" element={<UserWishlist onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/explorer" element={<SearchCategoriesExplorer onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/categories" element={<SearchCategoriesExplorer onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/search" element={<SearchResults onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/sarees" element={<SareesCategoryListing onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/western" element={<WomenWesternCategory onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/spotlight" element={<CuratedSpotlight onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/flash" element={<FlashSaleLandingPage onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/luxe" element={<HomeScreenFlutterLuxe onNavigate={handleNav} />} />
        <Route path="/reviews" element={<RatingsReviews onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/write-review" element={<WriteAReview onNavigate={handleNav} onBack={handleBack} />} />
        <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute role="customer">
              <UserWebDashboard onNavigate={handleNav} onBack={handleBack} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user_dashboard" 
          element={
            <ProtectedRoute role="customer">
              <UserWebDashboard onNavigate={handleNav} onBack={handleBack} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute role="customer">
              <UserWebDashboard onNavigate={handleNav} onBack={handleBack} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute role="customer">
              <UserWebDashboard onNavigate={handleNav} onBack={handleBack} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-profile" 
          element={
            <ProtectedRoute role="customer">
              <UserWebDashboard onNavigate={handleNav} onBack={handleBack} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute role="customer">
              <CustomerOrders onNavigate={handleNav} onBack={handleBack} />
            </ProtectedRoute>
          } 
        />
        <Route path="/return-request" element={<ReturnRequest onNavigate={handleNav} onBack={handleBack} />} />

        {/* Logistics & Driver Fleet Routes */}
        <Route path="/driver-dashboard" element={<DriverDashboardMobile onNavigate={handleNav} />} />
        <Route path="/available-tasks" element={<AvailableTasks onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/order-driver" element={<OrderDetailsDriver onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/active-delivery" element={<ActiveDeliveryMobile onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/delivery-history" element={<DeliveryHistoryMobile onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/driver-earnings" element={<DriverEarningsMobile onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/rider-express" element={<RiderExpressDashboard onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/meesho-velocity" element={<MeeshoVelocity onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/swiftroute" element={<SwiftRoute onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/driver-reverse-pickup" element={<DriverReversePickup onNavigate={handleNav} onBack={handleBack} />} />

        {/* Supplier Hub Routes */}
        <Route
          path="/structure-flow"
          element={
            <StructureFlow
              onNavigate={handleNav}
              onAddNewProduct={() => handleNav('/add-product')}
              onViewInventory={() => handleNav('/supplier-inventory')}
              onViewOrders={() => handleNav('/supplier-orders')}
            />
          }
        />
        <Route
          path="/supplier-dashboard-2"
          element={
            <SupplierDashboard2
              onAddNewProduct={() => handleNav('/add-product')}
              onViewInventory={() => handleNav('/supplier-inventory')}
              onViewAllOrders={() => handleNav('/supplier-orders')}
              onNavChange={(tabId) => handleNav(tabId)}
            />
          }
        />
        <Route
          path="/supplier-dashboard-1"
          element={
            <SupplierDashboard1
              onNavigate={handleNav}
              onShipNow={() => handleNav('/supplier-orders')}
              onClaimCredit={() => handleNav('/admin-analytics')}
            />
          }
        />
        <Route
          path="/supplier-inventory"
          element={<SupplierInventoryManagement onNavigate={handleNav} onAddProduct={() => handleNav('/add-product')} />}
        />
        <Route path="/supplier-orders" element={<SupplierOrdersList onBack={handleBack} onNavigate={handleNav} />} />
        <Route
          path="/add-product"
          element={
            <AddNewProductSupplier
              onBack={handleBack}
              onPublish={() => handleNav('/supplier-inventory')}
              onSaveDraft={() => handleNav('/supplier-inventory')}
            />
          }
        />
        <Route
          path="/add-category"
          element={<AddCategorySupplier onBack={handleBack} onSaveCategory={() => handleNav('/supplier-inventory')} />}
        />
        <Route
          path="/supplier-profile"
          element={<SupplierProfile onBack={handleBack} onNavigate={handleNav} onLogout={() => handleNav('/')} />}
        />
        <Route
          path="/seller-dashboard"
          element={
            <SellerWebDashboard
              onNavigate={handleNav}
              onBack={handleBack}
              onViewProducts={() => handleNav('/supplier-inventory')}
              onViewOrders={() => handleNav('/supplier-orders')}
            />
          }
        />
        <Route
          path="/sellers"
          element={
            <SellerWebDashboard
              onNavigate={handleNav}
              onBack={handleBack}
              onViewProducts={() => handleNav('/supplier-inventory')}
              onViewOrders={() => handleNav('/supplier-orders')}
            />
          }
        />
        <Route
          path="/seller"
          element={
            <SellerWebDashboard
              onNavigate={handleNav}
              onBack={handleBack}
              onViewProducts={() => handleNav('/supplier-inventory')}
              onViewOrders={() => handleNav('/supplier-orders')}
            />
          }
        />
        <Route
          path="/supplier-returns"
          element={<SupplierReturnsRTO onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/supplier-rot-ledger"
          element={<SupplierRotLedger onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/dropship-fulfilment"
          element={<CustomerOrderSupplierFulfilment onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/customer-order-supplier-fulfilment"
          element={<CustomerOrderSupplierFulfilment onNavigate={handleNav} onBack={handleBack} />}
        />

        {/* Admin Panel Routes (Protected) */}
        <Route path="/admin-panel1" element={<AdminWebPanel1 />} />
        
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route
          path="/admin-panel"
          element={
            <AdminWebPanel
              onNavigate={handleNav}
              onSwitchView={() => handleNav('/seller-dashboard')}
              onLogout={() => handleNav('/login')}
            />
          }
        />
        <Route
          path="/admin-support"
          element={<AdminSupportDesk onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/support"
          element={<AdminSupportDesk onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/admin-rot-rules"
          element={<AdminRotRulesConfigurator onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/admin-dropshipper-kyc"
          element={<AdminDropshipperKyc onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/admin-kyc"
          element={<AdminDropshipperKyc onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/admin-affiliate-kyc"
          element={<AdminAffiliateKycApproval onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/admin-returns"
          element={<AdminReturnRefundHub onNavigate={handleNav} onBack={handleBack} />}
        />
        <Route
          path="/admin-catalog"
          element={<AdminProductCatalog onNavigate={handleNav} onAddNewProduct={() => handleNav('/add-product')} />}
        />
        <Route
          path="/campaign-flow"
          element={<CampaignCreationFlowAdmin onNavigate={handleNav} onCancel={() => handleNav('/admin-panel')} />}
        />
        <Route path="/admin-analytics" element={<PerformanceAnalyticsDashboardAdmin onNavigate={handleNav} onBack={handleBack} />} />
        <Route path="/analytics" element={<PerformanceAnalyticsDashboardAdmin onNavigate={handleNav} onBack={handleBack} />} />
        </Route>
        <Route
          path="/support-center"
          element={<SupportCenter onNavigate={handleNav} onOpenChat={() => handleNav('/conversation')} />}
        />
        <Route path="/raise-ticket" element={<RaiseATicket onBack={handleBack} onNavigate={handleNav} />} />

        {/* Theme Variations Routes */}
        <Route path="/digital-curator" element={<TheDigitalCuratorEcosystem onNavigate={handleNav} />} />
        <Route path="/petal-collective" element={<PetalCollective onNavigate={handleNav} onLoginSuccess={() => handleNav('/digital-curator')} />}
        />
        <Route path="/gilded-pulse" element={<GildedPulse onNavigate={handleNav} />} />
        <Route path="/social-commerce-luxe" element={<SocialCommerceLuxe onNavigate={handleNav} />} />
        <Route path="/signal-core" element={<SignalCore onNavigate={handleNav} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
