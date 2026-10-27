import React from 'react';
import {
  Edit2,
  Trash2,
  Layers,
  Package,
  Calendar,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

export default function CategoriesTable({
  categories = [],
  loading = false,
  onEdit,
  onDelete,
  searchTerm = '',
}) {
  const filteredCategories = categories.filter((cat) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.id?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-100 rounded" />
                <div className="w-20 h-3 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="w-24 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-6 bg-gray-100 rounded-full" />
            <div className="w-20 h-8 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
          <FolderOpen size={28} />
        </div>
        <h3 className="text-base font-bold text-gray-900">No Categories Found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          {searchTerm
            ? `No taxonomies matching "${searchTerm}". Try a different search query.`
            : 'No catalog categories have been defined yet. Click "Add Category" above to create one.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Category Details</th>
              <th className="py-3.5 px-4">URL Slug</th>
              <th className="py-3.5 px-4">Linked Products</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredCategories.map((cat) => {
              const productCount = cat._count?.products ?? 0;
              const hasProducts = productCount > 0;

              return (
                <tr
                  key={cat.id}
                  className="hover:bg-purple-50/30 transition-colors group"
                >
                  {/* Category Details */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <Layers size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ID: {cat.id?.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* URL Slug */}
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 border border-gray-200">
                      /{cat.slug}
                    </span>
                  </td>

                  {/* Linked Products Count */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          hasProducts
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        <Package size={12} />
                        {productCount} {productCount === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {formatDate(cat.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(cat)}
                        title="Edit Category"
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(cat)}
                        title={
                          hasProducts
                            ? `Cannot delete (${productCount} products attached)`
                            : 'Delete Category'
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          hasProducts
                            ? 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                            : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count summary */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filteredCategories.length} categories</span>
        <span className="text-[11px] text-gray-400">
          Tip: Categories with 0 products can be safely deleted.
        </span>
      </div>
    </div>
  );
}
