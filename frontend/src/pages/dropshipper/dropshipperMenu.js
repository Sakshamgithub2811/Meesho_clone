import { 
  LayoutDashboard, 
  UserCircle, 
  UserCheck,
  Package, 
  ShoppingCart, 
  TrendingUp, 
  RotateCcw, 
  Percent, 
  Wallet, 
  Banknote, 
  CheckCircle2, 
  ShieldCheck, 
  LifeBuoy, 
  MessageSquareText, 
  SlidersHorizontal,
  AlertCircle,
  Send,
  Cable
} from 'lucide-react';

/**
 * Master Sidebar Menu for Dropshipper Portal
 * Fully synchronized across all dropshipper views
 */
export const DROPSHIPPER_MENU = [
  { 
    id: 'dashboard', 
    label: 'Dashboard Overview', 
    icon: LayoutDashboard, 
    path: '/dropshipper-dashboard',
    requiresKyc: false
  },
  { 
    id: 'profile', 
    label: 'Store & Profile Settings', 
    icon: UserCircle,
    path: '/dropshipper-dashboard?tab=profile',
    requiresKyc: false
  },
  {
    id: 'view-profile',
    label: 'View Profile & KYC',
    icon: UserCheck,
    path: '/dropshipper-profile',
    requiresKyc: true,
    badge: 'Verified',
    badgeClass: 'bg-emerald-600 text-white'
  },
  {
    id: 'sourcing-group',
    label: 'Catalog & Margins',
    icon: Package,
    children: [
      { 
        id: 'wholesale-catalog', 
        label: 'Wholesale Sourcing', 
        icon: Package, 
        path: '/supplier-products',
        requiresKyc: false
      },
      { 
        id: 'margin-rules', 
        label: 'Margin & Markup Rules', 
        icon: SlidersHorizontal, 
        path: '/dropshipper-margin-config',
        requiresKyc: false
      },
    ]
  },
  {
    id: 'settlements-group',
    label: 'Orders & Settlements',
    icon: ShoppingCart,
    children: [
      { 
        id: 'orders-push', 
        label: 'Push Customer Orders', 
        icon: Send, 
        path: '/dropshipper-orders-push',
        requiresKyc: true
      },
      { 
        id: 'settlements', 
        label: 'Settlement Tracking', 
        icon: TrendingUp, 
        path: '/dropshipper-settlements',
        requiresKyc: true
      },
      { 
        id: 'rot-manager', 
        label: 'ROT Liability & Return', 
        icon: RotateCcw, 
        path: '/dropshipper-rot-manager',
        requiresKyc: true
      },
      { 
        id: 'returns-ledger', 
        label: 'Margin Returns Ledger', 
        icon: Percent, 
        path: '/reseller-returns',
        requiresKyc: true
      },
    ]
  },
  {
    id: 'channels-group',
    label: 'Store Channels & API',
    icon: Cable,
    children: [
      { 
        id: 'integrations', 
        label: 'Store Integrations & Webhooks', 
        icon: Cable, 
        path: '/dropshipper-integrations',
        requiresKyc: true
      },
    ]
  },
  {
    id: 'wallet-group',
    label: 'Earnings & Payouts',
    icon: Wallet,
    children: [
      { 
        id: 'wallet-passbook', 
        label: 'Fintech Wallet', 
        icon: Wallet, 
        path: '/my-wallet',
        requiresKyc: true
      },
      { 
        id: 'withdraw-funds', 
        label: 'Withdraw Margin', 
        icon: Banknote, 
        path: '/withdraw-earnings',
        requiresKyc: true
      },
      { 
        id: 'payout-settings', 
        label: 'Bank & UPI Settings', 
        icon: CheckCircle2, 
        path: '/payout-settings',
        requiresKyc: true
      },
    ]
  },
  { 
    id: 'support-desk', 
    label: 'Helpdesk & Claims', 
    icon: LifeBuoy, 
    path: '/dropshipper-support',
    requiresKyc: false
  },
  { 
    id: 'kyc', 
    label: '4-Step KYC Verification', 
    icon: ShieldCheck, 
    path: '/dropshipper-register',
    requiresKyc: false
  },
];
