import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Zap, Clock, TrendingUp, Save, Pause, Play } from 'lucide-react';

export default function FlashSaleSettingsForm({
  title = '',
  setTitle,
  subtitle = '',
  setSubtitle,
  bannerBadge = '',
  setBannerBadge,
  dealBadge = '',
  setDealBadge,
  minDiscount = 40,
  setMinDiscount,
  endTime = '',
  setEndTime,
  resellerBonusNote = '',
  setResellerBonusNote,
  status = 'ACTIVE',
  onToggleStatus,
  onSave,
  saving = false
}) {
  return (
    <Card className="border border-gray-100 shadow-xs">
      <CardContent className="p-6">
        <form onSubmit={onSave} className="space-y-5">
          {/* Header & Status Toggle */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Campaign Settings</h3>
                <p className="text-[11px] text-gray-500">
                  Configure promotional headlines, timer, and minimum discount
                </p>
              </div>
            </div>

            {/* Pause / Resume Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleStatus}
              className={`text-xs h-8 cursor-pointer ${
                status === 'ACTIVE'
                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {status === 'ACTIVE' ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Activate Campaign
                </>
              )}
            </Button>
          </div>

          {/* Campaign Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Campaign Title</label>
              <Input
                type="text"
                required
                placeholder="e.g. Midnight Flash Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Subtitle / Tagline</label>
              <Input
                type="text"
                placeholder="e.g. Up to 75% Off Everything"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Badges & Min Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Banner Headline Badge</label>
              <Input
                type="text"
                placeholder="e.g. Live Lightning Drops"
                value={bannerBadge}
                onChange={(e) => setBannerBadge(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Deal Card Badge</label>
              <Input
                type="text"
                placeholder="e.g. ⚡ Limited Stock • Extra 15% Off"
                value={dealBadge}
                onChange={(e) => setDealBadge(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Min Discount (%)</label>
              <Input
                type="number"
                min={5}
                max={95}
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Target End Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-600" />
                Sale End Date & Time
              </label>
              <Input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Reseller Bonus Margin Note
              </label>
              <Input
                type="text"
                placeholder="e.g. Earn up to ₹150 extra margin per order"
                value={resellerBonusNote}
                onChange={(e) => setResellerBonusNote(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end pt-3 border-t border-gray-100">
            <Button
              type="submit"
              disabled={saving}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? 'Publishing Changes...' : 'Save & Publish Live'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

