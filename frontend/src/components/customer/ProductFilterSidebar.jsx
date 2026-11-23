import React, { useState, useMemo } from 'react';

const FILTER_CATEGORIES = [
  'Women Tshirts',
  'Women Tops and Tunics',
  'Sarees',
  'Kurtis',
  'Analog Watches',
  'Appliance Covers',
  'Bedsheets',
  'Blouses',
  'Caps & Hats',
  'Dresses',
  'Earrings & Studs',
  'Fridge Covers',
  'Hair Oil',
  'Lipsticks',
  'Perfumes',
  'Handbags',
  'Footwear',
  'Audio & Earbuds',
];

const GENDER_OPTIONS = ['Boys', 'Girls', 'Men', 'Women'];

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#f8fafc', border: true },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Yellow', hex: '#eab308' },
];

const FABRIC_OPTIONS = ['Cotton', 'Silk', 'Georgette', 'Denim', 'Rayon', 'Polyester'];
const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const FOOTWEAR_SIZES = ['IND-6', 'IND-7', 'IND-8', 'IND-9', 'IND-10'];
const SIZE_OPTIONS = [...APPAREL_SIZES, ...FOOTWEAR_SIZES];
const PRICE_RANGES = [
  { label: 'Under ₹299', max: 299 },
  { label: '₹300 - ₹499', min: 300, max: 499 },
  { label: '₹500 - ₹999', min: 500, max: 999 },
  { label: '₹1000 & Above', min: 1000 },
];
const RATING_OPTIONS = [
  { label: '4.0★ & Above', min: 4.0 },
  { label: '3.5★ & Above', min: 3.5 },
  { label: '3.0★ & Above', min: 3.0 },
];
const DISCOUNT_OPTIONS = [
  { label: '10% and above', min: 10 },
  { label: '20% and above', min: 20 },
  { label: '30% and above', min: 30 },
  { label: '50% and above', min: 50 },
];

export default function ProductFilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
  totalCount = 0,
  isOpen = false,
  onClose,
}) {
  const [catSearch, setCatSearch] = useState('');
  const [showAllCats, setShowAllCats] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    gender: true,
    price: true,
    rating: false,
    color: false,
    fabric: false,
    size: false,
    discount: false,
    mall: false,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = useMemo(() => {
    let list = FILTER_CATEGORIES;
    if (catSearch.trim()) {
      list = list.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase().trim()));
    }
    return showAllCats ? list : list.slice(0, 8);
  }, [catSearch, showAllCats]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.gender) count += 1;
    if (filters.priceRange) count += 1;
    if (filters.minRating) count += 1;
    if (filters.colors?.length) count += filters.colors.length;
    if (filters.fabrics?.length) count += filters.fabrics.length;
    if (filters.sizes?.length) count += filters.sizes.length;
    if (filters.minDiscount) count += 1;
    if (filters.mallOnly) count += 1;
    return count;
  }, [filters]);

  const content = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-5 text-slate-800 dark:text-slate-200 text-xs shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-headline font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>FILTERS</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#9f0038] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{totalCount}+ Products</p>
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[#9f0038] hover:underline font-bold text-xs cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 1. Category Filter Accordion */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Category</span>
          <span className="material-symbols-outlined text-sm transition-transform duration-200">
            {expandedSections.category ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.category && (
          <div className="space-y-2 pt-1 animate-in fade-in">
            {/* Search within category */}
            <div className="relative">
              <span className="material-symbols-outlined text-sm text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search category"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9f0038]"
              />
            </div>

            {/* Checkbox list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const isChecked = filters.categories?.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white group py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const next = isChecked
                          ? filters.categories.filter((c) => c !== cat)
                          : [...(filters.categories || []), cat];
                        onFilterChange('categories', next);
                      }}
                      className="rounded border-slate-300 text-[#9f0038] focus:ring-[#9f0038] cursor-pointer"
                    />
                    <span className={`text-[11.5px] truncate ${isChecked ? 'font-bold text-[#9f0038]' : 'text-slate-600 dark:text-slate-300'}`}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>

            {FILTER_CATEGORIES.length > 8 && !catSearch && (
              <button
                type="button"
                onClick={() => setShowAllCats(!showAllCats)}
                className="text-[#9f0038] hover:underline text-[11px] font-bold cursor-pointer pt-1"
              >
                {showAllCats ? '- Show Less' : '+ Show More'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Gender Filter */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('gender')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Gender</span>
          <span className="material-symbols-outlined text-sm">
            {expandedSections.gender ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.gender && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {GENDER_OPTIONS.map((g) => {
              const isActive = filters.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => onFilterChange('gender', isActive ? null : g)}
                  className={`py-1.5 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#9f0038] bg-rose-50 dark:bg-rose-950/40 text-[#9f0038] shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Price Range Filter */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Price</span>
          <span className="material-symbols-outlined text-sm">
            {expandedSections.price ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.price && (
          <div className="space-y-1.5 pt-1">
            {PRICE_RANGES.map((r) => {
              const isChecked = filters.priceRange?.label === r.label;
              return (
                <label
                  key={r.label}
                  className="flex items-center gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white py-0.5"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={isChecked}
                    onChange={() => onFilterChange('priceRange', isChecked ? null : r)}
                    className="text-[#9f0038] focus:ring-[#9f0038] cursor-pointer"
                  />
                  <span className={`text-[11.5px] ${isChecked ? 'font-bold text-[#9f0038]' : 'text-slate-600 dark:text-slate-300'}`}>
                    {r.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Rating Filter */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Rating</span>
          <span className="material-symbols-outlined text-sm">
            {expandedSections.rating ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.rating && (
          <div className="space-y-1.5 pt-1">
            {RATING_OPTIONS.map((opt) => {
              const isChecked = filters.minRating === opt.min;
              return (
                <label
                  key={opt.label}
                  className="flex items-center gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white py-0.5"
                >
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={isChecked}
                    onChange={() => onFilterChange('minRating', isChecked ? null : opt.min)}
                    className="text-[#9f0038] focus:ring-[#9f0038] cursor-pointer"
                  />
                  <span className={`text-[11.5px] flex items-center gap-1 ${isChecked ? 'font-bold text-emerald-700' : 'text-slate-600 dark:text-slate-300'}`}>
                    <span className="text-amber-500">★</span> {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Color Swatches */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Color</span>
          <span className="material-symbols-outlined text-sm">
            {expandedSections.color ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.color && (
          <div className="flex flex-wrap gap-2 pt-1">
            {COLOR_OPTIONS.map((col) => {
              const isSelected = filters.colors?.includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => {
                    const next = isSelected
                      ? filters.colors.filter((c) => c !== col.name)
                      : [...(filters.colors || []), col.name];
                    onFilterChange('colors', next);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#9f0038] bg-rose-50 text-[#9f0038]'
                      : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${col.border ? 'border border-slate-300' : ''}`}
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Size Filter */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Size</span>
          <span className="material-symbols-outlined text-sm">
            {expandedSections.size ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.size && (
          <div className="space-y-2 pt-1">
            {(!filters.categories?.length || filters.categories.some((c) => c.toLowerCase() === 'footwear')) && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Footwear (UK/IND)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FOOTWEAR_SIZES.map((sz) => {
                    const isSelected = filters.sizes?.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? filters.sizes.filter((s) => s !== sz)
                            : [...(filters.sizes || []), sz];
                          onFilterChange('sizes', next);
                        }}
                        className={`px-2.5 h-8 rounded-xl border text-[10.5px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#9f0038] bg-[#9f0038] text-white'
                            : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(!filters.categories?.length || !filters.categories.every((c) => c.toLowerCase() === 'footwear')) && (
              <div>
                {filters.categories?.some((c) => c.toLowerCase() === 'footwear') && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pt-1">
                    Clothing Sizes
                  </span>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {APPAREL_SIZES.map((sz) => {
                    const isSelected = filters.sizes?.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? filters.sizes.filter((s) => s !== sz)
                            : [...(filters.sizes || []), sz];
                          onFilterChange('sizes', next);
                        }}
                        className={`w-10 h-8 rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#9f0038] bg-[#9f0038] text-white'
                            : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Discount Filter */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('discount')}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
        >
          <span>Discount</span>
          <span className="material-symbols-outlined text-sm">
            {expandedSections.discount ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expandedSections.discount && (
          <div className="space-y-1.5 pt-1">
            {DISCOUNT_OPTIONS.map((disc) => {
              const isChecked = filters.minDiscount === disc.min;
              return (
                <label
                  key={disc.label}
                  className="flex items-center gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white py-0.5"
                >
                  <input
                    type="radio"
                    name="discountFilter"
                    checked={isChecked}
                    onChange={() => onFilterChange('minDiscount', isChecked ? null : disc.min)}
                    className="text-[#9f0038] focus:ring-[#9f0038] cursor-pointer"
                  />
                  <span className={`text-[11.5px] ${isChecked ? 'font-bold text-[#9f0038]' : 'text-slate-600 dark:text-slate-300'}`}>
                    {disc.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Meesho Mall Verified Badge Filter */}
      <div className="pt-1">
        <label className="flex items-center justify-between p-2.5 rounded-xl border border-sky-200/80 bg-sky-50/50 dark:bg-sky-950/20 cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-sm uppercase tracking-wide">
              Mall
            </span>
            <span className="text-xs font-bold text-sky-900 dark:text-sky-300">
              Verified Mall Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.mallOnly}
            onChange={(e) => onFilterChange('mallOnly', e.target.checked)}
            className="rounded border-sky-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  // Desktop inline view
  return (
    <>
      <div className="hidden md:block w-64 lg:w-72 shrink-0">{content}</div>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="font-black text-sm text-slate-900 dark:text-white">Filters</span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
