import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Flame, Search, Package, Trash2, Plus, Sparkles } from 'lucide-react';

export default function FlashSaleProductSelector({
  featuredProducts = [],
  candidates = [],
  searchQuery = '',
  onSearchChange,
  searchResults = [],
  isSearching = false,
  onAddProduct,
  onRemoveProduct,
  minDiscount = 40
}) {
  return (
    <Card className="border border-gray-100 shadow-xs">
      <CardContent className="p-6 space-y-4">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Featured Lightning Products ({featuredProducts.length})
              </h3>
              <p className="text-[11px] text-gray-500">
                Selected items displayed prominently at the top of the Flash Sale page
              </p>
            </div>
          </div>

          {/* Search in catalog */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search catalog to add..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 text-xs h-8 bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
        </div>

        {/* Live Search Results Drawer */}
        {searchQuery.trim() && (
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 space-y-2">
            <p className="text-[11px] font-semibold text-indigo-900">
              Search Results {isSearching && <span className="text-gray-400">(Searching...)</span>}:
            </p>
            {searchResults.length === 0 && !isSearching ? (
              <p className="text-xs text-gray-500 italic">
                No available products found matching "{searchQuery}".
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={prod.images?.[0] || 'https://placehold.co/60x60?text=Item'}
                        alt={prod.title}
                        className="w-8 h-8 rounded-md object-cover border border-gray-100 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-800 truncate">{prod.title}</p>
                        <p className="text-[10px] text-gray-500">
                          ₹{prod.price} • Stock: {prod.stock}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddProduct(prod)}
                      className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-0.5" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Currently Selected Featured Products */}
        {featuredProducts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-600">No specific products pinned to Flash Sale</p>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-0.5">
              Storefront will showcase catalog items with discount &gt;= {minDiscount}%. You can pin specific products below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-pink-200 transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={prod.images?.[0] || 'https://placehold.co/80x80?text=Item'}
                    alt={prod.title}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">{prod.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span className="font-semibold text-pink-600">₹{prod.price}</span>
                      <span>•</span>
                      <span>Stock: {prod.stock || 0}</span>
                      <span>•</span>
                      <span className="text-amber-600">★ {prod.rating || '—'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveProduct(prod.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-2"
                  title="Remove from Flash Sale"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Candidate Products to Add */}
        {candidates.length > 0 && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Recommended Top Products from Catalog:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {candidates.slice(0, 4).map((cand) => (
                <div
                  key={cand.id}
                  className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 flex flex-col justify-between space-y-2 hover:bg-white hover:border-pink-200 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={cand.images?.[0] || 'https://placehold.co/60x60?text=Item'}
                      alt={cand.title}
                      className="w-9 h-9 rounded-md object-cover border border-gray-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{cand.title}</p>
                      <p className="text-[10px] text-pink-600 font-bold">₹{cand.price}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onAddProduct(cand)}
                    className="w-full text-[11px] h-7 border-dashed border-gray-300 text-gray-700 hover:border-pink-400 hover:text-pink-600 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add to Deal
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
