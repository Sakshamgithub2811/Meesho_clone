import React, { useState } from 'react';
import DataTable from '../../common/DataTable';
import {
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CmsPagesTable({
  pages = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const [copiedSlug, setCopiedSlug] = useState(null);

  const copyPath = (slug) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success('Public URL copied to clipboard!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const columns = [
    {
      header: 'Page Details',
      render: (page) => {
        const isPublished = page.status === 'PUBLISHED';
        return (
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isPublished
                  ? 'bg-pink-50 text-[#b7004d]'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <FileText size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                {page.title}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  /p/{page.slug}
                </span>
                <button
                  type="button"
                  onClick={() => copyPath(page.slug)}
                  title="Copy Public Link"
                  className="text-gray-400 hover:text-[#b7004d] transition cursor-pointer"
                >
                  {copiedSlug === page.slug ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      render: (page) => {
        const isPublished = page.status === 'PUBLISHED';
        return (
          <button
            type="button"
            onClick={() => onToggleStatus?.(page.id)}
            title="Click to toggle status"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isPublished ? (
              <>
                <CheckCircle2 size={13} />
                Published
              </>
            ) : (
              <>
                <Clock size={13} />
                Draft
              </>
            )}
          </button>
        );
      },
    },
    {
      header: 'SEO Config',
      render: (page) =>
        page.metaTitle && page.metaDescription ? (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <Sparkles size={13} />
            <span>SEO Ready</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Default Title</span>
        ),
    },
    {
      header: 'Last Updated',
      render: (page) => (
        <span className="text-xs text-gray-500">
          {page.updatedAt
            ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'py-3.5 px-4 font-semibold text-right',
      cellClassName: 'py-3.5 px-4 text-right',
      render: (page) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={`/p/${page.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Open live storefront page"
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#b7004d] hover:bg-pink-50 transition"
          >
            <ExternalLink size={15} />
          </a>
          <button
            type="button"
            onClick={() => onEdit?.(page)}
            title="Edit page content"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(page)}
            title="Delete page"
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={pages}
      loading={loading}
      emptyTitle="No CMS pages found"
      emptyMessage="No policies or custom pages matching your filters."
      emptyIcon={FileText}
    />
  );
}
