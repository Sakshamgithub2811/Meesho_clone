import React from 'react';
import DataTable from '../../common/DataTable';
import {
  Edit2,
  Trash2,
  Layers,
  Package,
  FolderOpen,
  FolderTree,
  GitBranch,
  CornerDownRight,
  AlertTriangle,
} from 'lucide-react';

export default function CategoriesTable({
  categories = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns = [
    {
      header: 'Category Details',
      render: (cat) => {
        const isSub = Boolean(cat.parentId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
              ) : isSub ? (
                <GitBranch size={18} className="text-emerald-500" />
              ) : (
                <FolderTree size={18} className="text-[#b7004d]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {isSub && (
                  <CornerDownRight size={13} className="text-emerald-600 shrink-0" />
                )}
                <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                  {cat.name}
                </span>
              </div>
              {isSub && cat.parent ? (
                <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                  <span>Parent:</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 border border-blue-100 text-blue-700 font-semibold">
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
        );
      },
    },
    {
      header: 'Classification',
      render: (cat) => {
        const isSub = Boolean(cat.parentId);
        return isSub ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GitBranch size={12} />
            Subcategory
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FolderTree size={12} />
            Main Department
          </span>
        );
      },
    },
    {
      header: 'URL Slug',
      render: (cat) => (
        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {cat.slug}
        </span>
      ),
    },
    {
      header: 'Catalog Metrics',
      render: (cat) => {
        const productCount = cat._count?.products ?? 0;
        const subcategoryCount = cat._count?.subcategories ?? 0;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <Package size={13} className="text-gray-400" />
              <span className="font-bold text-gray-900">{productCount}</span>
              <span className="text-gray-500">Products</span>
            </div>
            {!cat.parentId && subcategoryCount > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <GitBranch size={12} />
                <span>{subcategoryCount} subcategories</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Created Date',
      render: (cat) => (
        <span className="text-xs text-gray-500">
          {formatDate(cat.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (cat) => {
        const productCount = cat._count?.products ?? 0;
        const subcategoryCount = cat._count?.subcategories ?? 0;
        const cannotDelete = productCount > 0 || subcategoryCount > 0;

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(cat)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="Edit Category"
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(cat)}
              disabled={cannotDelete}
              className={`p-1.5 rounded-lg transition ${
                cannotDelete
                  ? 'text-gray-300 cursor-not-allowed opacity-50'
                  : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
              }`}
              title={
                cannotDelete
                  ? 'Cannot delete category with linked products or subcategories'
                  : 'Delete Category'
              }
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      loading={loading}
      emptyTitle="No Categories Found"
      emptyMessage="No taxonomies matched your criteria. Add a new category to get started."
      emptyIcon={FolderOpen}
    />
  );
}
