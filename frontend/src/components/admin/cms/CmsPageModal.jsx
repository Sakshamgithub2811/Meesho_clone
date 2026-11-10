import React, { useState, useEffect } from 'react';
import { X, Globe, Eye, Code, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function CmsPageModal({
  isOpen,
  onClose,
  onSubmit,
  editingPage,
  isSubmitting
}) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'PUBLISHED',
    metaTitle: '',
    metaDescription: '',
  });

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview' | 'seo'
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (editingPage) {
      setFormData({
        title: editingPage.title || '',
        slug: editingPage.slug || '',
        content: editingPage.content || '',
        status: editingPage.status || 'PUBLISHED',
        metaTitle: editingPage.metaTitle || '',
        metaDescription: editingPage.metaDescription || '',
      });
      setAutoSlug(false);
    } else {
      setFormData({
        title: '',
        slug: '',
        content: `<h1>New Page Title</h1>\n<p>Add your clear policy terms or company information here...</p>`,
        status: 'PUBLISHED',
        metaTitle: '',
        metaDescription: '',
      });
      setAutoSlug(true);
    }
    setActiveTab('editor');
  }, [editingPage, isOpen]);

  if (!isOpen) return null;

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: titleVal,
      slug: autoSlug ? slugify(titleVal) : prev.slug,
      metaTitle: !prev.metaTitle || prev.metaTitle === prev.title ? titleVal : prev.metaTitle
    }));
  };

  const insertTag = (tagOpen, tagClose = '') => {
    const textarea = document.getElementById('cms-content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content;
    const selectedText = currentText.substring(start, end);
    const replacement = `${tagOpen}${selectedText || 'Text here'}${tagClose}`;

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + (selectedText.length || 9));
    }, 50);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      slug: slugify(formData.slug || formData.title),
    });
  };

  const previewSlug = slugify(formData.slug || formData.title || 'untitled-page');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingPage ? `Edit: ${editingPage.title}` : 'Create New CMS Page'}
              </h2>
              <p className="text-xs text-gray-500">
                Manage policy terms, legal documentation, or company information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex items-center border-b border-gray-200 px-6 bg-white gap-2 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'editor'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code size={16} /> Content Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'preview'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye size={16} /> Live Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'seo'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles size={16} /> SEO & Google Preview
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Basic Info (Always visible above tabs) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Terms and Conditions, Return Policy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-sm"
                />
              </div>

              <div className="md:col-span-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSlug(!autoSlug);
                      if (!autoSlug) setFormData(p => ({ ...p, slug: slugify(p.title) }));
                    }}
                    className="text-[11px] text-purple-600 hover:underline"
                  >
                    {autoSlug ? 'Lock Slug' : 'Auto from title'}
                  </button>
                </div>
                <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-600">
                  <span className="bg-gray-100 text-gray-500 px-3 py-2 text-xs flex items-center select-none border-r border-gray-200">
                    /p/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                    }}
                    placeholder="privacy-policy"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-sm font-medium bg-white"
                >
                  <option value="PUBLISHED">Published ✅</option>
                  <option value="DRAFT">Draft 📝</option>
                </select>
              </div>
            </div>

            {/* TAB 1: Editor */}
            {activeTab === 'editor' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Page Content (HTML / Rich Text) *
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-gray-400 mr-1">Insert:</span>
                    <button
                      type="button"
                      onClick={() => insertTag('<h2>', '</h2>')}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-600 font-mono transition"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<h3>', '</h3>')}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-600 font-mono transition"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<p>', '</p>')}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-600 font-mono transition"
                    >
                      Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<strong>', '</strong>')}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-600 font-bold transition"
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag('<ul>\n  <li>', '</li>\n  <li>Item 2</li>\n</ul>')}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-600 font-mono transition"
                    >
                      Bullet List
                    </button>
                  </div>
                </div>

                <textarea
                  id="cms-content-textarea"
                  rows={14}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<h1>Title</h1>\n<p>Type your page content here...</p>"
                  className="w-full p-4 rounded-xl border border-gray-300 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-gray-50/50"
                />
                <p className="text-xs text-gray-400">
                  Tip: Supports full HTML markup with headings, ordered/unordered lists, paragraphs, links, and tables.
                </p>
              </div>
            )}

            {/* TAB 2: Live Preview */}
            {activeTab === 'preview' && (
              <div className="border border-gray-200 rounded-2xl p-6 bg-white min-h-[350px]">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100 text-xs text-gray-400">
                  <span>Storefront Preview Path:</span>
                  <span className="font-mono text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                    /p/{previewSlug}
                  </span>
                </div>
                <div
                  className="prose prose-purple max-w-none text-gray-800 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400 italic">No content written yet.</p>' }}
                />
              </div>
            )}

            {/* TAB 3: SEO & Google Preview */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Search Engine Optimization (SEO)</h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Configure custom meta tags so Google Search Console and crawlers rank this policy or info page higher.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        SEO Meta Title
                      </label>
                      <span className={`text-[11px] font-mono ${
                        formData.metaTitle.length > 60 ? 'text-amber-600 font-semibold' : 'text-gray-400'
                      }`}>
                        {formData.metaTitle.length} / 60 chars recommended
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="e.g. Return & Refund Policy | Meesho Clone Official"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        SEO Meta Description
                      </label>
                      <span className={`text-[11px] font-mono ${
                        formData.metaDescription.length > 160 ? 'text-amber-600 font-semibold' : 'text-gray-400'
                      }`}>
                        {formData.metaDescription.length} / 160 chars recommended
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="e.g. Learn about our 7-day hassle-free return policy, reverse pickup guidelines, and refund credit timelines."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-sm"
                    />
                  </div>
                </div>

                {/* Google Search Mockup Snippet */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Google Search Result Snippet Preview
                  </h5>
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                        M
                      </div>
                      <div className="text-xs text-gray-700 truncate">
                        https://meeshoclone.in &gt; p &gt; {previewSlug}
                      </div>
                    </div>
                    <h3 className="text-blue-800 hover:underline text-base font-medium leading-snug cursor-pointer">
                      {formData.metaTitle || formData.title || 'Page Title | Meesho Clone'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                      {formData.metaDescription || 'No meta description provided. Google search will automatically generate a snippet based on page body content.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Target URL:{' '}
              <span className="font-mono text-purple-700 font-semibold">
                /p/{previewSlug}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200/70 rounded-xl transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition shadow-md font-semibold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingPage ? 'Update Page' : 'Publish Page'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
