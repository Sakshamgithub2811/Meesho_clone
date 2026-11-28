import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, FileText, ChevronRight } from 'lucide-react';
import { API_BASE } from '../../config/apiConfig';

const DEFAULT_POLICIES = {
  'terms-and-conditions': {
    title: 'Terms of Service',
    slug: 'terms-and-conditions',
    metaTitle: 'Terms of Service | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Introduction & Acceptance</h2>
      <p>Welcome to MShoppy. By accessing or using our platform, browsing product catalogs, placing orders, or using our reseller services, you agree to comply with and be bound by these Terms of Service. Please review them carefully.</p>

      <h2>2. User Accounts & Registration</h2>
      <p>You may explore our marketplace as a guest or create an account. When ordering products, you agree to provide complete and accurate shipping and contact information. For Cash on Delivery (COD) orders, OTP verification via registered mobile number or email may be enforced to ensure secure order dispatch.</p>

      <h2>3. Marketplace Platform & Product Listings</h2>
      <p>MShoppy connects customers and resellers with independent verified manufacturers and suppliers across India. While we strive to maintain high quality standards, product manufacturing specifications, brand warranties, and color variances are managed by their respective suppliers.</p>

      <h2>4. Pricing, Payments & Discounts</h2>
      <p>All prices displayed on the platform are in Indian Rupees (₹) and are inclusive of applicable GST unless explicitly indicated otherwise. Discount coupon codes, promotional flash sales, and first-order offers are subject to their specific validity terms.</p>

      <h2>5. Reseller & Affiliate Guidelines</h2>
      <p>Resellers may share catalog items with customers and earn profit margins. Resellers must not misrepresent product claims or brand associations. Fraudulent orders or policy abuse may result in immediate suspension.</p>

      <h2>6. Governing Law & Consumer Protection</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of the use of this platform shall be subject to the exclusive jurisdiction of the competent courts in India.</p>
    `
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    metaTitle: 'Privacy Policy | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Overview & Commitment</h2>
      <p>At MShoppy, we value your trust and are deeply committed to protecting your personal privacy. This Privacy Policy details how we collect, handle, use, and safeguard your information when you visit our website or use our shopping services.</p>

      <h2>2. Information We Collect</h2>
      <p>We only collect information necessary to process your transactions and provide a smooth shopping experience:</p>
      <ul>
        <li><strong>Contact Details:</strong> Your name, mobile phone number, delivery address, and registered email address.</li>
        <li><strong>Order & Transaction Records:</strong> Purchased items, invoice amounts, chosen payment method (Cash on Delivery or Prepaid), and delivery status updates.</li>
        <li><strong>Device Information:</strong> Browser type, operating system, and IP address collected strictly for platform security, fraud prevention, and session maintenance.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>Your information is used strictly for legitimate business and fulfillment purposes:</p>
      <ul>
        <li>To fulfill, ship, and deliver your orders through our verified logistics partners.</li>
        <li>To send order confirmation notifications, real-time shipment tracking alerts, and COD OTP verification codes.</li>
        <li>To provide responsive customer support and handle returns or refund requests.</li>
      </ul>

      <h2>4. Data Security & Storage</h2>
      <p>We employ 256-bit SSL encryption across all data channels. We do not sell, rent, or trade your personal information to third-party marketing companies.</p>

      <h2>5. Your Privacy Rights</h2>
      <p>You have full authority to review, modify, or update your personal account details at any time from your Account Profile or by reaching our support team at <a href="mailto:support@mshoppy.in">support@mshoppy.in</a>.</p>
    `
  },
  'return-and-refund-policy': {
    title: 'Return & Refund Policy',
    slug: 'return-and-refund-policy',
    metaTitle: 'Return & Refund Policy | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Easy 7-Day Return Window</h2>
      <p>We want you to be completely satisfied with every order. If you receive a product that is damaged, defective, or different from what was ordered, you can initiate a return or replacement within <strong>7 days</strong> of delivery.</p>

      <h2>2. Return Eligibility Conditions</h2>
      <p>To ensure a smooth return and refund experience:</p>
      <ul>
        <li>The item must be unused, unwashed, and returned with its original packaging, brand tags, and accessories intact.</li>
        <li>Certain intimate apparel, personal grooming, and customized products are non-returnable due to hygiene and health standards.</li>
        <li>For damaged or incorrect shipments, clear unboxing photos or package pictures may be uploaded in your order return request.</li>
      </ul>

      <h2>3. Doorstep Reverse Pickup</h2>
      <p>Once your return request is approved, our courier logistics partner will attempt doorstep reverse pickup from your delivery address within 2 to 4 business days. No pickup fee is charged for valid returns.</p>

      <h2>4. Refund Timelines & Methods</h2>
      <ul>
        <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are credited directly to your registered UPI ID or Bank Account within 24 to 48 hours following successful pickup and quality check.</li>
        <li><strong>Prepaid Orders (Cards / UPI / NetBanking):</strong> Refunds are processed immediately and reflect in your original payment method within 3 to 5 business days.</li>
      </ul>
    `
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    metaTitle: 'Shipping Policy | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Nationwide Pin Code Coverage</h2>
      <p>MShoppy partners with premier Indian courier and logistics providers to deliver orders securely across more than 20,000 pin codes throughout India.</p>

      <h2>2. Estimated Delivery Durations</h2>
      <ul>
        <li><strong>Metro & Tier-1 Cities:</strong> 2 to 4 business days from dispatch.</li>
        <li><strong>Tier-2 & Tier-3 Cities:</strong> 4 to 6 business days from dispatch.</li>
        <li><strong>Remote Locations:</strong> Up to 7 to 9 business days from dispatch.</li>
      </ul>

      <h2>3. Free Delivery on Catalog Orders</h2>
      <p>We offer <strong>Free Delivery</strong> on all eligible orders across our marketplace catalog. If any special handling charges apply to specific oversized items, they will be clearly indicated on the checkout screen before payment.</p>

      <h2>4. Real-Time Tracking Updates</h2>
      <p>Once your order is handed over to the courier partner, an automatic tracking link and Tracking ID are sent to your registered email and mobile number, allowing you to monitor the live transit status until delivery.</p>
    `
  }
};

const POLICY_TABS = [
  { slug: 'terms-and-conditions', path: '/terms-and-conditions', label: 'Terms of Service' },
  { slug: 'privacy-policy', path: '/privacy-policy', label: 'Privacy Policy' },
  { slug: 'return-and-refund-policy', path: '/return-and-refund-policy', label: 'Return & Refund' },
  { slug: 'shipping-policy', path: '/shipping-policy', label: 'Shipping Policy' }
];

function normalizeSlug(raw) {
  if (!raw) return 'terms-and-conditions';
  const clean = String(raw).toLowerCase().trim();
  if (clean === 'terms' || clean === 'terms-of-service' || clean === 'tos') return 'terms-and-conditions';
  if (clean === 'privacy' || clean === 'privacy-policy') return 'privacy-policy';
  if (clean === 'return' || clean === 'returns' || clean === 'refund' || clean === 'refund-policy' || clean === 'return-and-refund') return 'return-and-refund-policy';
  if (clean === 'shipping' || clean === 'shipping-policy' || clean === 'delivery') return 'shipping-policy';
  if (clean === 'about' || clean === 'about-us') return 'about-us';
  if (clean === 'contact' || clean === 'contact-us') return 'contact-us';
  return clean;
}

export default function PolicyPage() {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const targetSlug = useMemo(() => {
    const path = (location.pathname || '').toLowerCase();
    if (path.includes('privacy')) return 'privacy-policy';
    if (path.includes('return') || path.includes('refund')) return 'return-and-refund-policy';
    if (path.includes('shipping') || path.includes('delivery')) return 'shipping-policy';
    if (path.includes('terms') || path.includes('condition')) return 'terms-and-conditions';
    const querySlug = searchParams.get('slug') || searchParams.get('type');
    return normalizeSlug(routeSlug || querySlug || 'terms-and-conditions');
  }, [routeSlug, location.pathname, searchParams]);

  const [page, setPage] = useState(() => DEFAULT_POLICIES[targetSlug] || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Use default policy content immediately so there is no flickering or blank screen
    const defaultDoc = DEFAULT_POLICIES[targetSlug];
    if (defaultDoc && isMounted) {
      setPage(defaultDoc);
      document.title = defaultDoc.metaTitle;
    }

    async function fetchPolicy() {
      try {
        const res = await fetch(`${API_BASE}/cms/${targetSlug}`);
        const data = await res.json();

        if (res.ok && data.success && data.page && isMounted) {
          // If the DB has custom content longer than 20 chars, use it; otherwise stick to rich default
          if (data.page.content && data.page.content.trim().length > 20) {
            setPage(data.page);
            document.title = data.page.metaTitle || `${data.page.title} | MShoppy`;
          }
        }
      } catch (_) {
        // Quiet fallback to defaultDoc
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPolicy();

    return () => {
      isMounted = false;
    };
  }, [targetSlug]);

  const updatedDate = page?.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'November 2026';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── TOP NAV BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <Link to="/user-home" className="text-lg font-black tracking-tight text-[#b7004d]">
            MShoppy<span className="text-xs font-medium text-slate-400 ml-1.5">Official</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Verified Official</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ─────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link to="/user-home" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-400">Policies &amp; Legal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-pink-400 font-semibold truncate max-w-[220px]">
            {page?.title || 'Policy Document'}
          </span>
        </nav>

        {/* Quick Policy Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {POLICY_TABS.map((tab) => {
            const isActive = targetSlug === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#b7004d] text-white shadow-lg shadow-pink-900/30 ring-1 ring-pink-500'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="min-h-[400px] bg-slate-900/40 rounded-3xl border border-slate-800 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading document...</p>
            </div>
          </div>
        ) : !page ? (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-white mb-2">Policy Page Not Found</h1>
            <p className="text-xs text-slate-400 mb-6">
              The requested policy could not be found. Please choose from one of our verified policies above.
            </p>
            <button
              type="button"
              onClick={() => navigate('/terms-and-conditions')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#b7004d] text-white rounded-xl text-xs font-bold hover:bg-[#9a0041] transition-all cursor-pointer"
            >
              View Terms of Service
            </button>
          </div>
        ) : (
          <article className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-pink-950/40 via-slate-900 to-purple-950/40 p-6 md:p-8 border-b border-slate-800">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                {page.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span>Last updated: {updatedDate}</span>
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Policy Document</span>
                </span>
              </div>
            </div>

            {/* HTML Policy Body */}
            <div
              className="p-6 md:p-10 text-slate-300 text-sm leading-relaxed space-y-4
                [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-white [&>h2]:pt-4 [&>h2]:pb-1 [&>h2]:border-b [&>h2]:border-slate-800
                [&>p]:text-slate-300 [&>p]:leading-relaxed
                [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li]:text-slate-300
                [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol>li]:text-slate-300
                [&>a]:text-pink-400 hover:[&>a]:underline"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </article>
        )}
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-slate-800/80 bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} MShoppy Technologies Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}