import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '../../config/apiConfig';

const POLICY_TITLES = {
  'terms-and-conditions': 'Terms of Service',
  'privacy-policy': 'Privacy Policy',
  'return-and-refund-policy': 'Return & Refund Policy',
  'shipping-policy': 'Shipping Policy',
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

  const defaultTitle = POLICY_TITLES[targetSlug] || 'Policy Document';
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function fetchCmsContent() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/cms/${targetSlug}`);
        const data = await res.json();
        if (res.ok && data.success && data.page && isMounted) {
          setPage(data.page);
          document.title = data.page.metaTitle || `${data.page.title} | MShoppy`;
        } else if (isMounted) {
          setPage(null);
          document.title = `${defaultTitle} | MShoppy`;
        }
      } catch (_) {
        if (isMounted) setPage(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCmsContent();
    return () => { isMounted = false; };
  }, [targetSlug, defaultTitle]);

  const displayTitle = page?.title || defaultTitle;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Header Bar ── */}
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

          <div className="w-16" />
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link to="/user-home" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-400">Policies &amp; Legal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-pink-400 font-semibold">{displayTitle}</span>
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
                    ? 'bg-[#b7004d] text-white shadow-lg shadow-pink-900/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Document Card: Dynamic Live Content Managed from Admin CMS */}
        <article className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 md:p-8 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {displayTitle}
            </h1>
          </div>

          {/* Dynamic Content Managed Live via Admin CMS */}
          <div className="p-6 md:p-10 min-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
              </div>
            ) : page?.content ? (
              <div
                className="text-slate-300 text-sm leading-relaxed space-y-4
                  [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-3
                  [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-white [&>h2]:pt-4 [&>h2]:pb-1 [&>h2]:border-b [&>h2]:border-slate-800
                  [&>p]:text-slate-300 [&>p]:leading-relaxed
                  [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li]:text-slate-300
                  [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol>li]:text-slate-300
                  [&>a]:text-pink-400 hover:[&>a]:underline"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <div className="text-slate-500 text-sm py-12 text-center">
                {/* Blank until Admin publishes content via Admin CMS */}
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-slate-800/80 bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} MShoppy Technologies Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}