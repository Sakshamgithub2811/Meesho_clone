import os
import sys
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Suppress headers/footers on cover if desired, but here we can show everywhere except page 1
        if self._pageNumber > 1:
            # Header
            self.drawString(36, A4[1] - 25, "MShoppy Platform • Complete Application Route Map & Architecture")
            self.drawRightString(A4[0] - 36, A4[1] - 25, "Frontend Routes Specification")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(36, A4[1] - 30, A4[0] - 36, A4[1] - 30)

            # Footer
            self.line(36, 32, A4[0] - 36, 32)
            self.drawString(36, 20, "Confidential • Internal Architecture Document • React Router v7")
            page_str = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(A4[0] - 36, 20, page_str)
        else:
            # Page 1 minimal footer
            self.drawString(36, 20, "MShoppy E-Commerce Architecture Specification")
            self.drawRightString(A4[0] - 36, 20, f"Page 1 of {page_count}")
            
        self.restoreState()

def build_pdf(filename="Meesho_Clone_App_Routes_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    BRAND_PRIMARY = colors.HexColor("#B90041")
    BRAND_DARK = colors.HexColor("#0F172A")
    TEXT_MAIN = colors.HexColor("#1E293B")
    TEXT_MUTED = colors.HexColor("#64748B")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BORDER_LIGHT = colors.HexColor("#E2E8F0")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=BRAND_PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=TEXT_MUTED,
        spaceAfter=14
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=BRAND_DARK,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    tbl_header = ParagraphStyle(
        'TblHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    tbl_cell = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=TEXT_MAIN
    )

    tbl_cell_code = ParagraphStyle(
        'TblCellCode',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=BRAND_PRIMARY
    )

    tbl_cell_comp = ParagraphStyle(
        'TblCellComp',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0284C7")
    )

    badge_public = ParagraphStyle(
        'BadgePublic',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=8,
        textColor=colors.HexColor("#166534")
    )

    badge_protected = ParagraphStyle(
        'BadgeProtected',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=8,
        textColor=colors.HexColor("#991B1B")
    )

    elements = []

    # ─────────────────────────────────────────────────────────────
    # COVER / HEADER BANNER
    # ─────────────────────────────────────────────────────────────
    banner_data = [
        [
            Paragraph("<b>MSHOPPY SUPER-APP ECOSYSTEM</b>", ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#DF2457"))),
            Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%d %b %Y')}", ParagraphStyle('R', alignment=2, fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED))
        ],
        [
            Paragraph("Application Routes & Navigation Architecture", title_style),
            Paragraph("<b>Source:</b> <code>frontend/src/App.jsx</code>", ParagraphStyle('R2', alignment=2, fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED))
        ],
        [
            Paragraph(
                "Complete role-based route specification, access control permissions, screen catalog groupings, "
                "and component mappings for Customer, Reseller, Supplier, Driver Logistics, Dropshipper, and Admin modules.",
                subtitle_style
            ),
            ""
        ]
    ]

    banner_table = Table(banner_data, colWidths=[380, 142])
    banner_table.setStyle(TableStyle([
        ('SPAN', (0, 2), (1, 2)),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(banner_table)

    # Key Metrics Cards Table
    metrics_data = [
        [
            Paragraph("<b>TOTAL ROUTES</b><br/><font size=14 color='#B90041'><b>85+</b></font><br/><font size=6.5 color='#64748B'>Mapped in App.jsx</font>", tbl_cell),
            Paragraph("<b>USER ROLES</b><br/><font size=14 color='#4F46E5'><b>6 Roles</b></font><br/><font size=6.5 color='#64748B'>RBAC Protected</font>", tbl_cell),
            Paragraph("<b>SCREEN GROUPS</b><br/><font size=14 color='#059669'><b>8 Groups</b></font><br/><font size=6.5 color='#64748B'>Screen Navigator (Ctrl+K)</font>", tbl_cell),
            Paragraph("<b>STACK</b><br/><font size=14 color='#D97706'><b>React 19</b></font><br/><font size=6.5 color='#64748B'>React Router + Vite</font>", tbl_cell),
        ]
    ]
    metrics_table = Table(metrics_data, colWidths=[130, 130, 130, 132])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────
    # ARCHITECTURE OVERVIEW
    # ─────────────────────────────────────────────────────────────
    elements.append(Paragraph("1. System Architecture & Route Security", section_heading))
    overview_text = (
        "The MShoppy frontend is structured as a unified multi-role social commerce super-app. "
        "Routing is orchestrated in <code>frontend/src/App.jsx</code> using <b>React Router DOM</b>. "
        "Access control is enforced via the <code>&lt;ProtectedRoute /&gt;</code> wrapper component, which inspects user "
        "authentication status and verifies allowed roles (<code>CUSTOMER</code>, <code>RESELLER</code>, <code>SUPPLIER</code>, "
        "<code>DRIVER</code>, <code>DROPSHIPPER</code>, <code>AFFILIATE</code>, <code>ADMIN</code>). "
        "A global <b>Floating Navigator</b> (activated via <code>Ctrl + K</code> or bottom navigation) indexes 8 functional groups "
        "allowing rapid navigation and QA audit across the entire application."
    )
    elements.append(Paragraph(overview_text, body_style))
    elements.append(Spacer(1, 12))

    # Helper function to generate route tables
    def create_route_table(title, rows, header_color=BRAND_PRIMARY):
        tbl_data = [
            [
                Paragraph("Route Path (URL)", tbl_header),
                Paragraph("Component File", tbl_header),
                Paragraph("Access Guard", tbl_header),
                Paragraph("Description & Responsibilities", tbl_header)
            ]
        ]

        for path, comp, guard, desc in rows:
            is_prot = "Protected" in guard or "ADMIN" in guard or "customer" in guard or "affiliate" in guard
            guard_p = Paragraph(f"🔒 {guard}", badge_protected) if is_prot else Paragraph(f"🌐 {guard}", badge_public)
            
            tbl_data.append([
                Paragraph(path, tbl_cell_code),
                Paragraph(comp, tbl_cell_comp),
                guard_p,
                Paragraph(desc, tbl_cell)
            ])

        col_w = [115, 125, 82, 200]
        t = Table(tbl_data, colWidths=col_w, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), header_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
        ]))
        return t

    # ─────────────────────────────────────────────────────────────
    # MODULES DATA DEFINITIONS
    # ─────────────────────────────────────────────────────────────

    # 1. Authentication & Onboarding
    auth_routes = [
        ("/", "LoginSignup", "Public", "Default landing & unified authentication portal (Login/Signup)."),
        ("/login", "LoginSignup", "Public", "Direct login & registration view with phone/Google auth."),
        ("/logout", "LogoutPage", "Public", "Session clearance, token eviction, and redirection flow."),
        ("/user/login", "UserLogin", "Public", "Dedicated Customer & Reseller login page."),
        ("/affiliate/login", "AffiliateLogin", "Public", "Affiliate partner credentials sign-in."),
        ("/admin/login", "AdminLogin", "Public", "Admin console secure authentication interface."),
        ("/dropshipper-login", "DropshipperLogin", "Public", "B2B Dropshipper merchant credentials portal."),
        ("/forgot-password", "ForgotPassword", "Public", "Password recovery, OTP verification, and reset flow.")
    ]

    # 2. Customer Shopping Flow
    customer_routes = [
        ("/user-home", "HomeUserCustomer", "Public", "Main Shopper Feed: Banners, Categories, Top Deals & Product Cards."),
        ("/product", "ProductDetail", "Public", "Product details page: Image carousel, size selector, price, COD check."),
        ("/cart", "ShoppingCart", "Public", "Cart tray: Quantity adjuster, coupon input, order total computation."),
        ("/address", "CheckoutAddressSelection", "Public", "Shipping address management & new address addition modal."),
        ("/payment", "CheckoutPayment", "Public", "Payment gateway selection (COD, UPI, Debit/Credit Card, Netbanking)."),
        ("/wishlist", "UserWishlist", "Public", "Customer saved items list with move-to-cart shortcuts."),
        ("/explorer", "SearchCategoriesExplorer", "Public", "Category taxonomy directory (Ethnic, Western, Kids, Home, Tech)."),
        ("/search", "SearchResults", "Public", "Search results page with price filtering, sorting & text queries."),
        ("/sarees", "SareesCategoryListing", "Public", "Dedicated vertical listing for Sarees, Silk, & Ethnic Wear."),
        ("/western", "WomenWesternCategory", "Public", "Western Wear curation: Tops, Jeans, Dresses & Outerwear."),
        ("/spotlight", "CuratedSpotlight", "Public", "Editor's curated collection and seasonal trend highlights."),
        ("/flash", "FlashSaleLandingPage", "Public", "Limited-time flash discounts with countdown countdown timer."),
        ("/luxe", "HomeScreenFlutterLuxe", "Public", "High-fashion Flutter Luxe premium lifestyle shopping experience."),
        ("/reviews", "RatingsReviews", "Public", "Verified buyer ratings breakdown, feedback, and customer photos."),
        ("/write-review", "WriteAReview", "Public", "Review submission form with star rating and image attachment."),
        ("/user-dashboard", "UserWebDashboard", "Protected (customer)", "Customer profile hub: Account details, preferences, addresses."),
        ("/orders", "CustomerOrders", "Protected (customer)", "Order tracking timeline: Ordered, Shipped, Out for Delivery, Delivered."),
        ("/return-request", "ReturnRequest", "Public", "Return/Exchange initiator with photo evidence upload and reason selection.")
    ]

    # 3. Reseller & Affiliate Fintech
    reseller_routes = [
        ("/reseller-home", "HomeUserReseller", "Public", "Reseller portal home: Curated catalogs, wholesale pricing, share buttons."),
        ("/supplier-products", "SupplierProductAccess", "Public", "Supplier catalogue browsing with wholesale margins and SKU info."),
        ("/share-earn-config", "ShareEarnConfig", "Public", "Custom margin configurator: Set customer price & compute net margin."),
        ("/resell-earn", "ResellEarn", "Public", "Reselling business overview, tier rewards, and profit calculators."),
        ("/earnings-dashboard-1", "EarningsDashboard1", "Public", "Reseller weekly profit metrics, pending payouts, order analytics."),
        ("/earnings-dashboard-2", "EarningsDashboard2", "Public", "Advanced reseller analytics with conversion rates and top categories."),
        ("/refer-earn", "ReferEarn", "Public", "Referral code sharing, bonus tiers, and referee tracking."),
        ("/affiliate-program", "AffiliateProgram", "Public", "Affiliate commission structure, terms, and onboarding banner."),
        ("/affiliate-panel", "AffiliateProgramPanel", "Protected (affiliate)", "Affiliate partner command center: Track link clicks and commissions."),
        ("/affiliate-kyc", "AffiliateKYC", "Public", "Affiliate KYC registration: PAN, GST, Aadhaar document uploads."),
        ("/affiliate-kyc-status", "AffiliateKycStatus", "Public", "Live status tracker for affiliate KYC review (Pending/Approved)."),
        ("/my-wallet", "MyWalletFintechStyle", "Public", "Fintech passbook: Cash balance, pending credits, transaction history."),
        ("/reseller-wallet", "ResellerWallet", "Public", "Wallet management: Bank transfers, payout requests, mini statements."),
        ("/reseller-returns", "ResellerReturnsLedger", "Public", "Ledger for returned customer orders and margin adjustments."),
        ("/withdraw-earnings", "WithdrawEarnings", "Public", "Instant withdrawal portal to linked bank account / UPI ID."),
        ("/payout-settings", "PayoutSettings", "Public", "Bank account verification, IFSC lookups, and UPI VPA configuration."),
        ("/payout-confirmation", "PayoutConfirmation", "Public", "Success confirmation screen with payout reference UTR number."),
        ("/community-hub", "CommunityHub", "Public", "Social feed for Meesho entrepreneurs, success stories & tips."),
        ("/messenger", "MeeshoMessengerChatHub", "Public", "In-app messaging list connecting buyers, resellers, and sellers."),
        ("/conversation", "ConversationScreen", "Public", "Active 1-on-1 chat window with image sharing and order links."),
        ("/notifications", "NotificationCenter", "Public", "Push notifications feed: Orders, system announcements, promo deals.")
    ]

    # 4. Dropshipper B2B Hub
    dropship_routes = [
        ("/dropshipper-dashboard", "DropshipperDashboard", "Public", "B2B Dropshipper overview: Volume orders, gross merchandise value."),
        ("/dropshipper-settlements", "DropshipperSettlementTracking", "Public", "Consolidated invoice ledger, payment cycles, and settlements."),
        ("/dropshipper-rot-manager", "DropshipperRotManager", "Public", "Return On Transit (ROT) liability tracker & policy compliance."),
        ("/dropshipper-register", "DropshipperKYCRegister", "Public", "Dropshipper merchant business onboarding and KYC document upload.")
    ]

    # 5. Supplier Hub
    supplier_routes = [
        ("/structure-flow", "StructureFlow", "Public", "Supplier hub root with quick links to inventory, orders, and products."),
        ("/supplier-dashboard-1", "SupplierDashboard1", "Public", "Supplier operations center: Daily dispatch targets, revenue summary."),
        ("/supplier-dashboard-2", "SupplierDashboard2", "Public", "Alternative supplier analytical overview with fulfillment charts."),
        ("/supplier-inventory", "SupplierInventoryManagement", "Public", "Stock inventory manager: Edit price, update stock, SKU search."),
        ("/supplier-orders", "SupplierOrdersList", "Public", "Order processing queue: Pending labels, manifested, shipped orders."),
        ("/add-product", "AddNewProductSupplier", "Public", "Comprehensive product creation wizard: Title, variants, media, pricing."),
        ("/add-category", "AddCategorySupplier", "Public", "Custom category & subcategory creator for seller catalog."),
        ("/supplier-profile", "SupplierProfile", "Public", "Supplier business details, pickup warehouse address, GST details."),
        ("/seller-dashboard", "SellerWebDashboard", "Public", "Seller web dashboard: Order fulfillment stats & inventory alerts."),
        ("/supplier-returns", "SupplierReturnsRTO", "Public", "Return to Origin (RTO) tracking & courier dispute claims."),
        ("/supplier-rot-ledger", "SupplierRotLedger", "Public", "Freight liability, ROT penalties, and credit adjustment ledger."),
        ("/dropship-fulfilment", "CustomerOrderSupplierFulfilment", "Public", "B2B dropship order dispatch & direct-to-customer packing labels.")
    ]

    # 6. Logistics & Driver Fleet
    driver_routes = [
        ("/driver-dashboard", "DriverDashboardMobile", "Public", "Mobile-optimized driver hub: Today's deliveries, completed drops."),
        ("/available-tasks", "AvailableTasks", "Public", "Delivery gig board: Accept new packages for local delivery zone."),
        ("/order-driver", "OrderDetailsDriver", "Public", "Consignee delivery slip, customer address, recipient contact button."),
        ("/active-delivery", "ActiveDeliveryMobile", "Public", "Live GPS routing navigation screen with turn-by-turn map."),
        ("/delivery-history", "DeliveryHistoryMobile", "Public", "Logbook of successfully fulfilled parcels and POD signatures."),
        ("/driver-earnings", "DriverEarningsMobile", "Public", "Payout summary: Delivery fees, surge bonuses, weekly totals."),
        ("/rider-express", "RiderExpressDashboard", "Public", "Rapid-fulfillment rider hub for express same-day orders."),
        ("/meesho-velocity", "MeeshoVelocity", "Public", "Logistics speed metrics, SLA compliance, and dispatch throughput."),
        ("/swiftroute", "SwiftRoute", "Public", "AI Route Optimization engine: Clustered stops for lowest transit time."),
        ("/driver-reverse-pickup", "DriverReversePickup", "Public", "Doorstep quality check (QC) checklist for customer return parcels.")
    ]

    # 7. Admin Panel & Security
    admin_routes = [
        ("/admin-panel", "AdminWebPanel", "Protected (ADMIN)", "Admin command center: Platform KPIs, revenue, user oversight."),
        ("/admin-panel1", "AdminWebPanel1", "Public", "Alternate modern executive dashboard layout."),
        ("/admin-support", "AdminSupportDesk", "Protected (ADMIN)", "Customer service ticket queue: Prioritize, assign, and resolve."),
        ("/admin-rot-rules", "AdminRotRulesConfigurator", "Protected (ADMIN)", "Global ROT liability percentage and automated penalty rules."),
        ("/admin-dropshipper-kyc", "AdminDropshipperKyc", "Protected (ADMIN)", "Review and verify B2B dropshipper business registrations."),
        ("/admin-affiliate-kyc", "AdminAffiliateKycApproval", "Protected (ADMIN)", "Audit affiliate partner PAN/Bank docs with Approve/Reject actions."),
        ("/admin-returns", "AdminReturnRefundHub", "Protected (ADMIN)", "Platform refund arbiter: Approve claims, inspect QC photos."),
        ("/admin-catalog", "AdminProductCatalog", "Protected (ADMIN)", "Master product catalog: Approve/delist products across suppliers."),
        ("/campaign-flow", "CampaignCreationFlowAdmin", "Protected (ADMIN)", "Promotional campaign wizard: Discounts, banners, and push blasts."),
        ("/admin-analytics", "PerformanceAnalyticsDashboardAdmin", "Protected (ADMIN)", "Executive deep-dive analytics: GMV, churn, conversion rates."),
        ("/support-center", "SupportCenter", "Public", "Help center FAQ repository and live chat initiation."),
        ("/raise-ticket", "RaiseATicket", "Public", "Self-service complaint filing form for missing packages or refunds.")
    ]

    # 8. Theme Variations
    theme_routes = [
        ("/digital-curator", "TheDigitalCuratorEcosystem", "Public", "High-concept editorial curator theme for modern apparel."),
        ("/petal-collective", "PetalCollective", "Public", "Soft pastel aesthetic theme tailored for floral & cosmetic goods."),
        ("/gilded-pulse", "GildedPulse", "Public", "Luxury dark-mode jewelry & timepiece showcase theme."),
        ("/social-commerce-luxe", "SocialCommerceLuxe", "Public", "Influencer-led live commerce design variant."),
        ("/signal-core", "SignalCore", "Public", "High-contrast minimalist utilitarian design system.")
    ]

    # Build sections
    elements.append(Paragraph("2. Authentication & Onboarding Routes", section_heading))
    elements.append(create_route_table("Auth", auth_routes, colors.HexColor("#0F172A")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("3. Customer Shopping & E-Commerce Routes", section_heading))
    elements.append(create_route_table("Customer", customer_routes, colors.HexColor("#B90041")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("4. Reseller & Affiliate Fintech Routes", section_heading))
    elements.append(create_route_table("Reseller", reseller_routes, colors.HexColor("#4F46E5")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("5. B2B Dropshipper Portal Routes", section_heading))
    elements.append(create_route_table("Dropship", dropship_routes, colors.HexColor("#0D9488")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("6. Supplier Hub & Inventory Routes", section_heading))
    elements.append(create_route_table("Supplier", supplier_routes, colors.HexColor("#D97706")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("7. Delivery & Driver Logistics Fleet Routes", section_heading))
    elements.append(create_route_table("Driver", driver_routes, colors.HexColor("#2563EB")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("8. Admin Command Center & Security Routes", section_heading))
    elements.append(create_route_table("Admin", admin_routes, colors.HexColor("#991B1B")))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("9. Design Ecosystem & Theme Variations", section_heading))
    elements.append(create_route_table("Themes", theme_routes, colors.HexColor("#7C3AED")))
    elements.append(Spacer(1, 18))

    # ─────────────────────────────────────────────────────────────
    # ACCESS CONTROL SECURITY MATRIX
    # ─────────────────────────────────────────────────────────────
    elements.append(Paragraph("10. Access Control & Role Guard Summary", section_heading))
    sec_matrix = [
        [
            Paragraph("Role Guard", tbl_header),
            Paragraph("Enforcement Mechanism", tbl_header),
            Paragraph("Protected Paths", tbl_header),
            Paragraph("Redirect On Unauthorized", tbl_header)
        ],
        [
            Paragraph("<b>ADMIN</b>", tbl_cell),
            Paragraph("<code>&lt;ProtectedRoute allowedRoles={['ADMIN']} /&gt;</code>", tbl_cell_code),
            Paragraph("/admin-panel, /admin-support, /admin-rot-rules, /admin-dropshipper-kyc, /admin-affiliate-kyc, /admin-returns, /admin-catalog, /campaign-flow, /admin-analytics", tbl_cell),
            Paragraph("Redirects to <code>/admin/login</code>", tbl_cell)
        ],
        [
            Paragraph("<b>CUSTOMER</b>", tbl_cell),
            Paragraph("<code>&lt;ProtectedRoute role='customer' /&gt;</code>", tbl_cell_code),
            Paragraph("/user-dashboard, /users, /user-profile, /orders", tbl_cell),
            Paragraph("Redirects to <code>/user/login</code>", tbl_cell)
        ],
        [
            Paragraph("<b>AFFILIATE</b>", tbl_cell),
            Paragraph("<code>&lt;ProtectedRoute role='affiliate' /&gt;</code>", tbl_cell_code),
            Paragraph("/affiliate-panel", tbl_cell),
            Paragraph("Redirects to <code>/affiliate/login</code>", tbl_cell)
        ],
        [
            Paragraph("<b>PUBLIC / GUEST</b>", tbl_cell),
            Paragraph("Standard <code>&lt;Route /&gt;</code> (No Guard)", tbl_cell_code),
            Paragraph("Browsing, Home Feed, Products, Cart, Driver, Supplier, Themes", tbl_cell),
            Paragraph("Open Access", tbl_cell)
        ]
    ]
    t_sec = Table(sec_matrix, colWidths=[90, 160, 180, 92])
    t_sec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_DARK),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    elements.append(t_sec)

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"SUCCESS: PDF generated at: {filename}")

if __name__ == '__main__':
    out_file = "d:/Meesho/Meesho_clone/Meesho_App_Routes_Documentation.pdf"
    build_pdf(out_file)
