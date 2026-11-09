import React from 'react';
import { Globe, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';

export default function SeoHeaderBanner({
  loading = false,
  onRefresh,
  onCopySitemap,
  copied = false
}) {
  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-100/70 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-[#b7004d] text-white rounded-xl shadow-xs">
            <Globe className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-gray-900">Dynamic SEO & Search Crawler Hub</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live On-The-Fly Generation
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Real-time sitemap queries your PostgreSQL products and categories directly on crawl requests, adhering strictly to the <span className="font-semibold text-gray-800">sitemaps.org standard</span> for instant Google indexing.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Refresh stats from database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b7004d]' : ''}`} />
          Refresh
        </button>

        <button
          onClick={onCopySitemap}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#b7004d] hover:bg-[#9a0041] rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard!' : 'Copy GSC Sitemap URL'}
        </button>
      </div>
    </div>
  );
}

