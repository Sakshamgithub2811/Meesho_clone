import React from 'react';
import { FileCode, ShieldAlert, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { BACKEND_ROOT } from '../../../config/apiConfig';

export default function SeoProtocolCards({ stats = null }) {
  const sitemapUrl = stats?.sitemapUrl || `${BACKEND_ROOT}/sitemap.xml`;
  const robotsUrl = stats?.robotsUrl || `${BACKEND_ROOT}/robots.txt`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sitemap Protocol Card */}
      <Card className="border border-gray-200/80 shadow-xs hover:border-pink-200 transition-all">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="p-3 bg-pink-50 text-[#b7004d] rounded-2xl">
            <FileCode className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">sitemap.xml (Public XML)</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-pink-100 text-[#b7004d]">
                XML Protocol
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Serves on-the-fly XML to Googlebot, Bingbot, and Yahoo with all published products, categories, and public storefronts.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href={sitemapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b7004d] hover:underline"
              >
                Inspect Live XML <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">
                {sitemapUrl}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Robots.txt Card */}
      <Card className="border border-gray-200/80 shadow-xs hover:border-indigo-200 transition-all">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">robots.txt (Crawler Directives)</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                Security Guard
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Directs search engines to index storefront while explicitly blocking private routes like <code className="text-indigo-600 font-mono">/admin-panel</code>, <code className="text-indigo-600 font-mono">/cart</code>, and <code className="text-indigo-600 font-mono">/api/</code>.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href={robotsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                Inspect Live robots.txt <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">
                {robotsUrl}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

