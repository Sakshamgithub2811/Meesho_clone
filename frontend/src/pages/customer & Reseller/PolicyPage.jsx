import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, FileText, ChevronRight } from 'lucide-react';
import { API_BASE } from '../../config/apiConfig';

export default function PolicyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPolicy() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/cms/${slug}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Page not found');
        }

        if (isMounted) {
          setPage(data.page);
          document.title = data.page.metaTitle || `${data.page.title} | Meesho Clone`;
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Page not found');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      fetchPolicy();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#b7004d]/20 border-t-[#b7004d] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-sm text-gray-600 mb-6">
            The page you requested may be under review, unpublished, or the link might be broken.
          </p>
          <button
            onClick={() => navigate('/user-home')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#b7004d] text-white rounded-xl text-sm font-semibold hover:bg-[#9a0041] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const updatedDate = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently Updated';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-800">
      {/* ── TOP NAV BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <Link to="/user-home" className="text-lg font-extrabold tracking-tight text-[#b7004d]">
            meesho<span className="text-gray-900"> clone</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Official</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ─────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
          <Link to="/user-home" className="hover:text-gray-800">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400">Policies & CMS</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-[200px]">{page.title}</span>
        </nav>

        {/* Policy Document Card */}
        <article className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-pink-50/70 via-white to-purple-50/70 p-6 md:p-8 border-b border-gray-100">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              {page.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: {updatedDate}</span>
              <span>•</span>
              <span className="font-mono text-gray-400">/p/{page.slug}</span>
            </div>
          </div>

          {/* HTML Policy Body */}
          <div
            className="p-6 md:p-8 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </main>
    </div>
  );
}
