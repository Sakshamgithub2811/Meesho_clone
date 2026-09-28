# 🛍️ Meesho Clone — Module-Wise Navigator & Navigation Flow Documentation

> **Ecosystem Overview:** Comprehensive architecture and navigation flow directory covering all **57+ screens** categorized across **6 Core Modules**.

---

## 🧭 Global Navigation Controllers

The Meesho Clone application utilizes four primary navigation controllers to transition between modules and screens:

### 1. FloatingNavigator (`App.jsx`)
- **Type:** Global overlay modal activated on demand.
- **Trigger:** Accessible anywhere via `window.dispatchEvent(new CustomEvent('open-screen-navigator'))`.
- **Functionality:** Categorized tab filters (`All`, `Reseller & Shop`, `Shopping`, `Logistics`, `Supplier`, `Admin`, `Themes`) displaying a searchable grid of all 57+ routes for testing and rapid navigation.

### 2. NavDrawer (`components/NavDrawer.jsx`)
- **Type:** Slide-over left drawer tailored for the Reseller workspace.
- **Sections:**
  - **Shop & Catalog:** Home & Curated Catalog (`/reseller-home`), Resell & Earn (`/resell-earn`), Margin Config (`/share-earn-config`).
  - **Business & Earnings:** Dashboard 1 (`/earnings-dashboard-1`), Analytics (`/earnings-dashboard-2`), Fintech Wallet (`/my-wallet`), Reseller Wallet (`/reseller-wallet`), Withdraw (`/withdraw-earnings`), Payout Settings (`/payout-settings`).
  - **Community & Network:** Community Hub (`/community-hub`), Messenger (`/messenger`), Notifications (`/notifications`).
  - **Growth & Programs:** Refer & Earn (`/refer-earn`), Affiliate Program (`/affiliate-program`).

### 3. AppBottomNav (`components/AppBottomNav.jsx`)
- **Type:** Persistent bottom dock for mobile and responsive desktop layouts.
- **Action Tabs:**
  - 🏠 **Home:** `/reseller-home`
  - 🗂️ **Categories:** `/explorer`
  - 🛍️ **Orders:** `/delivery-history`
  - 💳 **Earnings:** `/earnings-dashboard-1`
  - 👤 **Profile:** `/user-dashboard`
  - 📑 **Screens (62):** Opens `FloatingNavigator`

### 4. Router Bridge (`AppRoutes` in `App.jsx`)
- **Type:** Alias normalization bridge.
- **Functionality:** Maps legacy identifier strings (e.g. `reseller`, `cart`, `inventory`, `campaignFlow`, `supportCenter`) into canonical browser route paths.

---

## 📦 Module-by-Module Navigation Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           MEESHO CLONE ECOSYSTEM                               │
│                                                                                │
│   ┌───────────────┐     ┌───────────────┐     ┌───────────────┐                │
│   │   MODULE 1    │     │   MODULE 2    │     │   MODULE 3    │                │
│   │ Reseller &    │◄───►│ Customer      │◄───►│ Logistics &   │                │
│   │ Fintech (18)  │     │ Shopping (15) │     │ Fleet (9)     │                │
│   └───────┬───────┘     └───────┬───────┘     └───────┬───────┘                │
│           │                     │                     │                        │
│           ▼                     ▼                     ▼                        │
│   ┌───────────────┐     ┌───────────────┐     ┌───────────────┐                │
│   │   MODULE 4    │     │   MODULE 5    │     │   MODULE 6    │                │
│   │ Supplier &    │◄───►│ Admin Panel & │◄───►│ Theme         │                │
│   │ Seller (9)    │     │ Support (6)   │     │ Ecosystem (5) │                │
│   └───────────────┘     └───────────────┘     └───────────────┘                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### 💰 Module 1: Reseller & Fintech System (18 Screens)
**Target Users:** Resellers, Social Micro-Entrepreneurs, Affiliates  
**Core Objective:** Product discovery, custom profit margin addition, WhatsApp sharing, commission tracking, and bank payouts.

#### 🔄 Step-by-Step Flow:
```
[Login / Sign Up] (/login or /)
       │
       ▼ (Verify OTP / Credentials)
[Reseller Home] (/reseller-home)
       │
       ├─► [Resell & Earn Catalog] (/resell-earn)
       │
       ▼ (Click Product Margin / Share)
[Share & Earn Config] (/share-earn-config) ──► [Share to WhatsApp / Social]
       │
       ▼ (After Customer Purchases)
[Earnings Dashboard 1] (/earnings-dashboard-1)
       │
       ├─► [Earnings Dashboard 2 Analytics] (/earnings-dashboard-2)
       │
       ▼ (Check Balances)
[Fintech Wallet] (/my-wallet) or [Reseller Wallet] (/reseller-wallet)
       │
       ▼ (Click "Withdraw Earnings")
[Withdraw Earnings] (/withdraw-earnings)
       │
       ▼ (Submit Bank / UPI Transfer)
[Payout Confirmation] (/payout-confirmation)
```

#### 📋 Complete Route Directory:
| # | Route / URL | Screen Name | Key Triggers & Transition Targets |
|---|---|---|---|
| 1 | `/` or `/login` | 🔐 Login / Sign Up | OTP verification ➔ redirects to `/reseller-home` |
| 2 | `/reseller-home` | 🛍️ Reseller Home | Catalog feed; opens `/share-earn-config`, `/product`, or `NavDrawer` |
| 3 | `/resell-earn` | 💰 Resell & Earn | Supplier listings with highlighted margins; links to `/share-earn-config` |
| 4 | `/share-earn-config` | 🔗 Share & Earn Config | Margin calculation slider; generates customer sharing link |
| 5 | `/earnings-dashboard-1` | 📈 Earnings Dashboard 1 | High-level earnings KPI cards; links to `/my-wallet` & `/earnings-dashboard-2` |
| 6 | `/earnings-dashboard-2` | 📊 Earnings Dashboard 2 | In-depth sales charts, conversion analytics, and monthly forecasts |
| 7 | `/my-wallet` | 👛 Fintech Wallet | Neo-banking wallet balance, rewards; CTA: *Withdraw* ➔ `/withdraw-earnings` |
| 8 | `/reseller-wallet` | 💳 Reseller Wallet | Order-level margin ledger; button to `/payout-settings` |
| 9 | `/withdraw-earnings` | 🏦 Withdraw Earnings | Transfer funds to UPI/Bank; triggers ➔ `/payout-confirmation` |
| 10 | `/payout-settings` | ⚙️ Payout Settings | Setup Bank Account, IFSC, PAN card verification |
| 11 | `/payout-confirmation` | ✅ Payout Confirmation | Digital receipt with reference ID; return to `/my-wallet` |
| 12 | `/refer-earn` | 🎁 Refer & Earn | Referral link and milestone bonus tracker |
| 13 | `/affiliate-program` | 🤝 Affiliate Program | Affiliate program onboarding, perks, and terms |
| 14 | `/affiliate-panel` | 👑 Affiliate Panel | High-volume affiliate affiliate metrics and payout history |
| 15 | `/community-hub` | 👥 Community Hub | Reseller learning feed, success stories, and discussion threads |
| 16 | `/messenger` | 💬 Messenger Hub | Chat inbox for buyer queries; opens ➔ `/conversation` |
| 17 | `/conversation` | 🗨️ Conversation Screen | Real-time 1-on-1 customer & supplier chat |
| 18 | `/notifications` | 🔔 Notification Center | System alerts, price changes, margin credits, and tracking |

---

### 🛒 Module 2: Customer E-Commerce Shopping Flow (15 Screens)
**Target Users:** End Consumers, Buyers  
**Core Objective:** Product exploration, category browsing, reviews verification, shopping cart management, and seamless checkout.

#### 🔄 Step-by-Step Flow:
```
[Home / Luxe Storefront] (/luxe or /reseller-home)
       │
       ▼ (Search / Browse Category)
[Categories Explorer] (/explorer) ──► [Sarees] (/sarees) / [Western] (/western) / [Search] (/search)
       │
       ▼ (Click Product)
[Product Detail] (/product)
       │
       ├─► [Ratings & Reviews] (/reviews) ──► [Write a Review] (/write-review)
       ├─► [User Wishlist] (/wishlist)
       │
       ▼ (Click "Add to Cart" / "Buy Now")
[Shopping Cart] (/cart)
       │
       ▼ (Click "Proceed to Checkout")
[Checkout Address Selection] (/address)
       │
       ▼ (Click "Proceed to Payment")
[Checkout Payment] (/payment) ──► (UPI / COD / Card Confirmation)
       │
       ▼ (View Status)
[User Web Dashboard] (/user-dashboard)
```

#### 📋 Complete Route Directory:
| # | Route / URL | Screen Name | Key Triggers & Transition Targets |
|---|---|---|---|
| 1 | `/luxe` | ✨ Flutter Luxe Theme | Animated consumer storefront with trending collections |
| 2 | `/explorer` or `/categories` | 🗂️ Categories Explorer | Category grid; navigates to `/sarees`, `/western`, or `/search` |
| 3 | `/search` | 🔍 Search Results | Filtered search view with price and rating facets |
| 4 | `/sarees` | 🥻 Sarees Listing | Curated Indian ethnic apparel listings |
| 5 | `/western` | 👗 Women Western | Western fashion dresses, tops, and casual apparel |
| 6 | `/spotlight` | 🌟 Curated Spotlight | Featured trending spotlight products |
| 7 | `/flash` | ⚡ Flash Sale Landing | Time-limited flash sale landing page |
| 8 | `/product` | 🏷️ Product Detail | Product gallery, pricing, sizes, description; leads to `/cart` & `/reviews` |
| 9 | `/reviews` | ⭐ Ratings & Reviews | Buyer feedback and photos; CTA: *Write Review* ➔ `/write-review` |
| 10 | `/write-review` | ✍️ Write a Review | Star rating input and comment submission |
| 11 | `/wishlist` | ❤️ User Wishlist | Saved items; quick action: *Move to Cart* ➔ `/cart` |
| 12 | `/cart` | 🛒 Shopping Cart | Quantity management, promo coupons; CTA: ➔ `/address` |
| 13 | `/address` | 📍 Checkout Address | Shipping address picker; CTA: ➔ `/payment` |
| 14 | `/payment` | 💳 Checkout Payment | Payment gateway with UPI, Card, NetBanking, and COD |
| 15 | `/user-dashboard` | 📊 Curator Dashboard | Order tracking, shipment milestones, and returns |

---

### 🛵 Module 3: Logistics & Delivery Fleet Management (9 Screens)
**Target Users:** Delivery Riders, Courier Partners, Fleet Dispatchers  
**Core Objective:** Task allocation, route optimization, live package transit tracking, and rider earnings.

#### 🔄 Step-by-Step Flow:
```
[Driver Dashboard Mobile] (/driver-dashboard)
       │
       ▼ (Go Online & Find Runs)
[Available Tasks] (/available-tasks)
       │
       ▼ (Accept Delivery Assignment)
[Order Details Driver] (/order-driver)
       │
       ▼ (Start Navigation)
[Active Delivery Map] (/active-delivery) ──► (Live GPS Navigation & Customer Call)
       │
       ▼ (Doorstep OTP Handover)
[Delivery History] (/delivery-history)
       │
       ▼ (Check Daily Payout)
[Driver Earnings Mobile] (/driver-earnings)
```

#### 📋 Complete Route Directory:
| # | Route / URL | Screen Name | Key Triggers & Transition Targets |
|---|---|---|---|
| 1 | `/driver-dashboard` | 🛵 Driver Dashboard | Mobile console, online/offline status; links to `/available-tasks` |
| 2 | `/available-tasks` | 📦 Available Tasks | Real-time pool of pending parcel deliveries |
| 3 | `/order-driver` | 📋 Order Details Driver | Package verification, customer details; CTA: ➔ `/active-delivery` |
| 4 | `/active-delivery` | 🗺️ Active Delivery Map | GPS route navigation, ETA countdown, OTP verification |
| 5 | `/delivery-history` | 📜 Delivery History | Completed drops archive with delivery timestamps |
| 6 | `/driver-earnings` | 💰 Driver Earnings | Daily earnings, trip incentives, and withdrawal options |
| 7 | `/rider-express` | ⚡ Rider Express | Hyperlocal quick-commerce intra-city delivery flow |
| 8 | `/meesho-velocity` | 🚀 Meesho Velocity | Long-distance inter-city freight tracking |
| 9 | `/swiftroute` | 🧭 SwiftRoute AI | Multi-drop route sequence optimization engine |

---

### 🏬 Module 4: Supplier & Seller Hub (9 Screens)
**Target Users:** Manufacturers, Direct Suppliers, Direct Brands  
**Core Objective:** Product uploads, inventory management, order dispatch processing, and sales analytics.

#### 🔄 Step-by-Step Flow:
```
[Structure Flow Hub] (/structure-flow) or [Seller Dashboard] (/seller-dashboard)
       │
       ├─► [Add New Product] (/add-product) ──► [Add Category] (/add-category)
       │         │
       │         ▼ (Published to Catalog)
       ├─► [Supplier Inventory] (/supplier-inventory)
       │
       ▼ (Customer Orders Placed)
[Supplier Orders List] (/supplier-orders) ──► (Pack & Generate Shipping Label)
       │
       ▼ (Handover to Courier / Driver)
[Supplier Dashboard 1 & 2] (/supplier-dashboard-1, /supplier-dashboard-2)
       │
       ▼ (Manage Business Profile)
[Supplier Profile] (/supplier-profile)
```

#### 📋 Complete Route Directory:
| # | Route / URL | Screen Name | Key Triggers & Transition Targets |
|---|---|---|---|
| 1 | `/structure-flow` | 🏬 Structure Flow Hub | High-level operational map with quick actions |
| 2 | `/supplier-dashboard-1` | 📉 Supplier Dashboard 1 | Immediate pending orders and dispatch alerts |
| 3 | `/supplier-dashboard-2` | 📈 Supplier Dashboard 2 | Revenue analytics, SKU performance, return metrics |
| 4 | `/supplier-inventory` | 📦 Inventory Management | Stock monitor; CTA: *Add Product* ➔ `/add-product` |
| 5 | `/supplier-orders` | 📑 Supplier Orders List | Order dispatch workflow (New, Packing, Shipped) |
| 6 | `/add-product` | ➕ Add New Product | Product creation form (Price, Images, Variants, GST) |
| 7 | `/add-category` | 🏷️ Add Category | Custom category and attribute definition |
| 8 | `/supplier-profile` | 👤 Supplier Profile | KYC, GSTIN, warehouse details, and account settings |
| 9 | `/seller-dashboard` | 💻 Seller Web Dashboard | Unified desktop portal for complete business operations |

---

### 🛡️ Module 5: Admin Panel & Support Operations (6 Screens)
**Target Users:** System Administrators, Support Operations  
**Core Objective:** System moderation, catalog approvals, marketing campaign creation, and dispute resolution.

#### 🔄 Step-by-Step Flow:
```
[Admin Web Panel] (/admin-panel)
       │
       ├─► [Admin Product Catalog] (/admin-catalog) ──► (Approve / Reject SKUs)
       ├─► [Campaign Creation Flow] (/campaign-flow) ──► (Publish Discount Sales)
       ├─► [Performance Analytics] (/admin-analytics) ──► (Platform GMV & Metrics)
       ├─► [Support Center] (/support-center) ────────► [Raise A Ticket] (/raise-ticket)
```

#### 📋 Complete Route Directory:
| # | Route / URL | Screen Name | Key Triggers & Transition Targets |
|---|---|---|---|
| 1 | `/admin-panel` | 🛡️ Admin Web Panel | Master operations dashboard; switch to `/seller-dashboard` |
| 2 | `/admin-catalog` | 📁 Admin Catalog | Moderation queue for supplier submitted listings |
| 3 | `/campaign-flow` | 📢 Campaign Creation | Marketing banners, discount campaigns, promotional rules |
| 4 | `/admin-analytics` | 📊 Performance Analytics | Enterprise metrics: GMV, customer cohorts, partner growth |
| 5 | `/support-center` | 🎧 Support Center | Customer support portal; launches live chat ➔ `/conversation` |
| 6 | `/raise-ticket` | 🎫 Raise A Ticket | Customer/Reseller issue ticket submission form |

---

### 🎨 Module 6: Design Ecosystem & Theme Variations (5 Screens)
**Target Users:** UI/UX Engineers, Design Teams, White-label Brands  
**Core Objective:** Showcase diverse theme variations and responsive design paradigms.

#### 📋 Route Directory:
| # | Route / URL | Theme Name | Visual Personality & Special Features |
|---|---|---|---|
| 1 | `/digital-curator` | 🎨 The Digital Curator | Minimalist editorial luxury theme for boutique curation |
| 2 | `/petal-collective` | 🌸 Petal Collective | Soft pastel aesthetic designed for beauty and wellness |
| 3 | `/gilded-pulse` | 👑 Gilded Pulse | Warm gold and metallic accents for wedding and jewelry lines |
| 4 | `/social-commerce-luxe` | 💎 Social Commerce Luxe | Dynamic interactive video shopping with live feeds |
| 5 | `/signal-core` | ⚡ Signal Core | Cyberpunk-inspired dark theme for electronics and tech gear |

---

## 🔄 End-to-End Cross-Module Business Workflow

```
[1. SUPPLIER]
   Uploads Product (/add-product)
         │
         ▼
[2. ADMIN]
   Approves Listing (/admin-catalog)
         │
         ▼
[3. RESELLER]
   Sets Custom Profit Margin & Shares (/share-earn-config)
         │
         ▼
[4. CUSTOMER]
   Adds to Cart & Completes Payment (/cart ➔ /address ➔ /payment)
         │
         ▼
[5. SUPPLIER]
   Packs Parcel & Prints Shipping Label (/supplier-orders)
         │
         ▼
[6. DRIVER]
   Picks Up Parcel & Delivers via Live GPS (/active-delivery)
         │
         ▼
[7. RESELLER FINTECH]
   Profit Margin Credited to Wallet (/my-wallet ➔ /withdraw-earnings)
```
