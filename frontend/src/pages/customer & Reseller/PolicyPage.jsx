import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
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
      <p>Welcome to MShoppy. By accessing or using our platform, shopping catalogs, ordering products, or registering as a customer or reseller, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

      <h2>2. Account Security & Verification</h2>
      <p>Users must provide accurate, complete, and current information during checkout and registration. For Cash on Delivery (COD) orders, OTP verification via registered mobile number or email may be required to prevent fraudulent transactions and safeguard order processing.</p>

      <h2>3. Marketplace Nature & Product Listings</h2>
      <p>MShoppy acts as a managed marketplace connecting shoppers, resellers, and verified independent suppliers across India. While we enforce strict quality standards, suppliers are responsible for product accuracy, manufacturing specifications, and warranties.</p>

      <h2>4. Pricing, Payments & Discounts</h2>
      <p>All prices displayed are in Indian Rupees (₹) and include applicable taxes unless explicitly stated. Promotional coupon codes, such as WELCOME10, are subject to their respective terms and may not be combined with other conflicting promotions.</p>

      <h2>5. Reseller Program & Profit Margins</h2>
      <p>Resellers may share catalog items and set custom customer margins. Resellers must not misrepresent products, engage in deceptive advertising, or submit fictitious orders. Fraudulent activity will lead to immediate account suspension.</p>

      <h2>6. Governing Law & Dispute Resolution</h2>
      <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in India.</p>
    `
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    metaTitle: 'Privacy Policy | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Information We Collect</h2>
      <p>At MShoppy, we respect your privacy and are committed to safeguarding your personal data. We collect information necessary to deliver our services, including:</p>
      <ul>
        <li><strong>Personal Identifiers:</strong> Name, mobile phone number, email address, and delivery shipping addresses.</li>
        <li><strong>Transactional Records:</strong> Order IDs, items purchased, payment method (COD or Prepaid), delivery status milestones, and returns.</li>
        <li><strong>Technical Information:</strong> IP address, device type, and session logs utilized exclusively for fraud prevention and security verification.</li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <p>Your data is used strictly to process orders, dispatch shipments through verified courier partners, verify COD orders via OTP, issue delivery updates, and provide responsive customer support.</p>

      <h2>3. Data Protection & Security Controls</h2>
      <p>We implement end-to-end 256-bit SSL encryption across all transaction channels. We do not sell, rent, or lease your personal information to third-party data brokers or external advertisers.</p>

      <h2>4. User Rights & Account Management</h2>
      <p>You have full access to view, update, or remove your personal data and addresses at any time via your Account Profile. For data inquiries, reach out to our privacy team at <a href="mailto:support@mshoppy.in">support@mshoppy.in</a>.</p>
    `
  },
  'return-and-refund-policy': {
    title: 'Return & Refund Policy',
    slug: 'return-and-refund-policy',
    metaTitle: 'Return & Refund Policy | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Easy 7-Day Return Window</h2>
      <p>We want you to love everything you order from MShoppy. If you receive an item that is damaged, defective, or significantly different from what was described, you can request a return or replacement within <strong>7 days</strong> of delivery.</p>

      <h2>2. Return Eligibility Criteria</h2>
      <p>To qualify for a hassle-free return:</p>
      <ul>
        <li>The product must be unused, unwashed, and in its original condition with all brand tags and packaging intact.</li>
        <li>Intimate wear, personal hygiene products, and perishable goods are non-returnable due to health and safety standards.</li>
        <li>For damaged or incorrect shipments, photos of the item and original packaging may be requested via our Return Request portal.</li>
      </ul>

      <h2>3. Doorstep Reverse Pickup</h2>
      <p>Once your return request is approved, our courier logistics partner will attempt doorstep reverse pickup from your delivery address within 2 to 4 business days. No courier charges are levied on genuine returns.</p>

      <h2>4. Transparent Refund Timelines</h2>
      <ul>
        <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are credited directly to your registered UPI ID or Bank Account within 24 to 48 hours following successful pickup and warehouse verification.</li>
        <li><strong>Prepaid Orders (Cards / NetBanking / UPI):</strong> Refunds are initiated immediately and reflect in your original payment source within 3 to 5 business days.</li>
      </ul>
    `
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    metaTitle: 'Shipping Policy | MShoppy',
    updatedAt: new Date().toISOString(),
    content: `
      <h2>1. Nationwide Delivery Network</h2>
      <p>MShoppy partners with premier Indian logistics carriers to provide reliable doorstep delivery across 20,000+ pin codes throughout India.</p>

      <h2>2. Estimated Transit Timelines</h2>
      <ul>
        <li><strong>Metro & Tier-1 Cities:</strong> 2 to 4 business days.</li>
        <li><strong>Tier-2 & Tier-3 Cities:</strong> 4 to 6 business days.</li>
        <li><strong>Remote & Northeast Regions:</strong> 6 to 9 business days.</li>
      </ul>

      <h2>3. Free Delivery on Orders</h2>
      <p>We offer <strong>Free Delivery</strong> on all eligible orders across our marketplace catalog. Shipping costs, if any apply to specific oversized items, are transparently presented at checkout before you confirm payment.</p>

      <h2>4. Live Tracking & Milestone Updates</h2>
      <p>As soon as your package is dispatched by the supplier, you will receive real-time email and SMS alerts with your active Tracking ID and carrier link to follow your parcel from dispatch to doorstep delivery.</p>
    `
  }
};

const POLICY_TABS = [
  { slug: 'terms-and-conditions', label: 'Terms of Service' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'return-and-refund-policy', label: 'Return & Refund' },
  { slug: 'shipping-policy', label: 'Shipping Policy' }
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
  const navigate = useNavigate();

  const querySlug = searchParams.get('slug') || searchParams.get('type');
  const targetSlug = useMemo(() => normalizeSlug(routeSlug || querySlug || 'terms-and-conditions'), [routeSlug, querySlug]);

  const [page, setPage] = useState(() => DEFAULT_POLICIES[targetSlug] || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function fetchPolicy() {
      // If we have a local default, show it immediately without flash of loading
      const defaultDoc = DEFAULT_POLICIES[targetSlug];
      if (defaultDoc && isMounted) {
        setPage(defaultDoc);
        document.title = defaultDoc.metaTitle;
      }

      try {
        setLoading(!defaultDoc);
        const res = await fetch(`${API_BASE}/cms/${targetSlug}`);
        const data = await res.json();

        if (res.ok && data.success && data.page) {
          if (isMounted) {
            setPage(data.page);
            document.title = data.page.metaTitle || `${data.page.title} | MShoppy`;
          }
        } else if (!defaultDoc && isMounted) {
          setPage(null);
        }
      } catch (err) {
        // Fall back to default doc if network/backend failed
        if (defaultDoc && isMounted) {
          setPage(defaultDoc);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <Link to="/user-home" className="text-lg font-black tracking-tight text-[#b7004d]">
            MShoppy<span className="text-xs font-medium text-slate-400 ml-1.5">Official</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Verified Document</span>
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
                onClick={() => navigate(`/p/${tab.slug}`)}
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
              onClick={() => navigate('/p/terms-and-conditions')}
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
                <span className="font-mono text-slate-500">/p/{page.slug}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Legally Verified</span>
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