import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Layers,
  Package,
  Calendar,
  AlertTriangle,
  FolderOpen,
  FolderTree,
  GitBranch,
  CornerDownRight,
} from 'lucide-react';

export default function CategoriesTable({
  categories = [],
  loading = false,
  onEdit,
  onDelete,
  searchTerm = '',
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'main' | 'sub'

  // Filter by search & tab
  const filteredCategories = categories.filter((cat) => {
    // 1. Tab filter
    if (activeTab === 'main' && Boolean(cat.parentId)) return false;
    if (activeTab === 'sub' && !Boolean(cat.parentId)) return false;

    // 2. Search filter
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.parent?.name?.toLowerCase().includes(q) ||
      cat.id?.toLowerCase().includes(q)
    );
  });

  const mainCount = categories.filter((c) => !c.parentId).length;
  const subCount = categories.filter((c) => Boolean(c.parentId)).length;

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Filter Tabs Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers size={13} />
            <span>All Taxonomies</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'main'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FolderTree size={13} />
            <span>Main Categories</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
              {mainCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'sub'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GitBranch size={13} />
            <span>Subcategories</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {subCount}
            </span>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-700">{filteredCategories.length}</span> of {categories.length}
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <FolderOpen size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Categories Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No taxonomies matching "${searchTerm}". Try a different search query.`
              : activeTab === 'sub'
              ? 'No subcategories created yet. Click "Add Category" and select "Subcategory" to create one.'
              : 'No catalog categories have been defined yet. Click "Add Category" above to create one.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Category / Subcategory Details</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">URL Slug</th>
                <th className="py-3.5 px-4">Catalog Metrics</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredCategories.map((cat) => {
                const isSub = Boolean(cat.parentId);
                const productCount = cat._count?.products ?? 0;
                const subcategoryCount = cat._count?.subcategories ?? 0;
                const hasProducts = productCount > 0;
                const hasSubcategories = subcategoryCount > 0;
                const cannotDelete = hasProducts || hasSubcategories;

                return (
                  <tr
                    key={cat.id}
                    className={`hover:bg-purple-50/30 transition-colors group ${
                      isSub ? 'bg-slate-50/30' : ''
                    }`}
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
                          ) : isSub ? (
                            <GitBranch size={20} className="text-emerald-500" />
                          ) : (
                            <FolderTree size={20} className="text-purple-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            {isSub && (
                              <CornerDownRight size={13} className="text-emerald-600 shrink-0" />
                            )}
                            <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                              {cat.name}
                            </span>
                          </div>

                          {isSub && cat.parent ? (
                            <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                              <span>Parent:</span>
                              <span className="px-1.5 py-0.2 rounded bg-blue-50 border border-blue-100 text-blue-700">
                                {cat.parent.name}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              ID: {cat.id?.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Classification Type Badge */}
                    <td className="py-3.5 px-4">
                      {isSub ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <GitBranch size={11} />
                          Subcategory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                          <FolderTree size={11} />
                          Main Category
                        </span>
                      )}
                    </td>

                    {/* URL Slug */}
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 border border-gray-200">
                        /{cat.slug}
                      </span>
                    </td>

                    {/* Catalog Metrics */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                            hasProducts
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          <Package size={11} />
                          {productCount} {productCount === 1 ? 'Product' : 'Products'}
                        </span>

                        {!isSub && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                              hasSubcategories
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-gray-50 text-gray-400 border border-gray-100'
                            }`}
                          >
                            <GitBranch size={10} />
                            {subcategoryCount} Subcategories
                          </span>
                        )}
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
                          title="Edit Category / Subcategory"
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(cat)}
                          title={
                            hasSubcategories
                              ? `Cannot delete: Has ${subcategoryCount} linked subcategories`
                              : hasProducts
                              ? `Cannot delete: Has ${productCount} linked products`
                              : 'Delete Category'
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            cannotDelete
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
      )}

      {/* Footer summary */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filteredCategories.length} items</span>
        <span className="text-[11px] text-gray-400">
          Tip: Categories with 0 subcategories and 0 products can be safely deleted.
        </span>
      </div>
    </div>
  );
}

