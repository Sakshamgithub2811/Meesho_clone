import { 
  LayoutDashboard, 
  UserCircle, 
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
    path: '/dropshipper-dashboard' 
  },
  { 
    id: 'profile', 
    label: 'Store & Profile Settings', 
    icon: UserCircle,
    path: '/dropshipper-dashboard?tab=profile'
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
        path: '/supplier-products' 
      },
      { 
        id: 'margin-rules', 
        label: 'Margin & Markup Rules', 
        icon: SlidersHorizontal, 
        path: '/dropshipper-margin-config' 
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
        path: '/dropshipper-orders-push' 
      },
      { 
        id: 'settlements', 
        label: 'Settlement Tracking', 
        icon: TrendingUp, 
        path: '/dropshipper-settlements' 
      },
      { 
        id: 'rot-manager', 
        label: 'ROT Liability & Return', 
        icon: RotateCcw, 
        path: '/dropshipper-rot-manager' 
      },
      { 
        id: 'returns-ledger', 
        label: 'Margin Returns Ledger', 
        icon: Percent, 
        path: '/reseller-returns' 
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
        path: '/dropshipper-integrations' 
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
        path: '/my-wallet' 
      },
      { 
        id: 'withdraw-funds', 
        label: 'Withdraw Margin', 
        icon: Banknote, 
        path: '/withdraw-earnings' 
      },
      { 
        id: 'payout-settings', 
        label: 'Bank & UPI Settings', 
        icon: CheckCircle2, 
        path: '/payout-settings' 
      },
    ]
  },
  {
    id: 'support-group',
    label: 'Helpdesk & Claims',
    icon: LifeBuoy,
    children: [
      { 
        id: 'support-desk', 
        label: 'Disputes & Tickets', 
        icon: MessageSquareText, 
        path: '/dropshipper-support' 
      },
      { 
        id: 'raise-ticket', 
        label: 'Raise New Ticket', 
        icon: AlertCircle, 
        path: '/raise-ticket' 
      },
    ]
  },
  { 
    id: 'kyc', 
    label: '4-Step KYC Verification', 
    icon: ShieldCheck, 
    path: '/dropshipper-register' 
  },
];
