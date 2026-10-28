import React from 'react';
import {
  Edit2,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  MousePointerClick,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';

export default function BannersVisualGrid({
  banners = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  statusFilter = 'ALL',
  searchTerm = '',
}) {
  const filteredBanners = banners.filter((banner) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      banner.title?.toLowerCase().includes(q) ||
      banner.subtitle?.toLowerCase().includes(q) ||
      banner.targetUrl?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return banner.isActive !== false;
    if (statusFilter === 'INACTIVE') return banner.isActive === false;

    return true;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-2xl border border-gray-100 p-4 space-y-3"
          >
            <div className="aspect-[16/7] bg-gray-100 rounded-xl" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredBanners.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
          <ImageIcon size={28} />
        </div>
        <h3 className="text-base font-bold text-gray-900">No Banners Found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          {searchTerm || statusFilter !== 'ALL'
            ? 'No banners match your active filters or search query.'
            : 'No homepage banners created yet. Click "Add Banner" to launch your first promotional banner.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {filteredBanners.map((banner) => (
        <div
          key={banner.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
        >
          {/* Visual Banner Preview Image */}
          <div className="relative aspect-[16/7] bg-gray-900 overflow-hidden">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            />
            {/* Gradient Overlay & Tag */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-gray-900 shadow backdrop-blur-sm">
                  {banner.badgeText || 'OFFER'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                  <ArrowUpDown size={10} /> Position #{banner.displayOrder}
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-gray-200 text-xs mt-0.5 line-clamp-1 drop-shadow-sm">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Banner Meta & Controls */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <ExternalLink size={13} className="text-gray-400 shrink-0" />
                <span className="font-mono text-gray-700 truncate">
                  {banner.targetUrl || '/'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 shrink-0">
                <MousePointerClick size={13} className="text-purple-600" />
                <span className="font-semibold text-gray-800">
                  {(banner.clicksCount || 0).toLocaleString()}
                </span>{' '}
                clicks
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => onToggleStatus(banner)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
              >
                {banner.isActive !== false ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                    <ToggleRight size={22} />
                    Live on App
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600">
                    <ToggleLeft size={22} />
                    Hidden
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(banner)}
                  title="Edit Banner"
                  className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => onDelete(banner)}
                  title="Delete Banner"
                  className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
