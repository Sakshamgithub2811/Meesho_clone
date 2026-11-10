import React from 'react';
import { Send, Users, Sparkles, AlertCircle, Link as LinkIcon, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

export default function BroadcastComposerForm({
  form,
  onChange,
  onSend,
  sending = false,
  recipientCount = 0
}) {
  const audienceOptions = [
    { id: 'ALL', label: 'All Users', icon: '👥' },
    { id: 'CUSTOMER', label: 'Customers', icon: '🛍️' },
    { id: 'SUPPLIER', label: 'Suppliers', icon: '📦' },
    { id: 'DROPSHIPPER', label: 'Resellers', icon: '🚚' }
  ];

  const typeOptions = [
    { id: 'promo', label: 'Promo Offer', badgeClass: 'bg-pink-100 text-[#b7004d]' },
    { id: 'system', label: 'System Notice', badgeClass: 'bg-blue-100 text-blue-700' },
    { id: 'earning', label: 'Bonus Margin', badgeClass: 'bg-emerald-100 text-emerald-800' },
    { id: 'order', label: 'Order Update', badgeClass: 'bg-amber-100 text-amber-800' }
  ];

  const quickLinks = [
    { label: '⚡ Flash Sale', path: '/flash-sale' },
    { label: '🛍️ Categories', path: '/categories' },
    { label: '📦 Orders Page', path: '/orders' },
    { label: '💰 Reseller Hub', path: '/reseller-panel' }
  ];

  return (
    <Card className="border border-gray-200/90 shadow-xs hover:border-pink-200 transition-all">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-50 text-[#b7004d] rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Compose Push Broadcast
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Select your target audience, compose the message, and dispatch via in-app database + FCM push.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* 1. Target Audience Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-pink-600" />
              Target Audience
              <span className="text-pink-600">*</span>
            </span>
            <span className="text-[11px] font-semibold text-gray-500">
              Reach: <strong className="text-gray-900">{recipientCount} recipients</strong>
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {audienceOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange('audience', opt.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  form.audience === opt.id
                    ? 'border-[#b7004d] bg-pink-50/70 text-[#b7004d] shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Notification Type Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Notification Category
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {typeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange('type', opt.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  form.type === opt.id
                    ? `${opt.badgeClass} ring-2 ring-offset-1 ring-[#b7004d]`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Title Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800">
              Broadcast Headline / Title <span className="text-pink-600">*</span>
            </label>
            <span className="text-[11px] text-gray-400">
              {form.title?.length || 0}/65 chars
            </span>
          </div>
          <Input
            type="text"
            maxLength={65}
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g. Midnight Flash Sale is Live! ⚡ 70% Off"
            className="text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#b7004d]/30"
          />
        </div>

        {/* 4. Message Body Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800">
              Notification Message Body <span className="text-pink-600">*</span>
            </label>
            <span className="text-[11px] text-gray-400">
              {form.body?.length || 0}/200 chars
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={200}
            value={form.body}
            onChange={(e) => onChange('body', e.target.value)}
            placeholder="e.g. Flat 50% discount on all festive sarees and kurtis. Use coupon code FESTIVE50 at checkout!"
            className="w-full text-xs font-medium p-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#b7004d]/30 focus:border-[#b7004d] transition-all resize-none"
          />
        </div>

        {/* 5. Destination Link (Optional) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
            Destination Route / Promo Link (Optional)
          </label>
          <Input
            type="text"
            value={form.link}
            onChange={(e) => onChange('link', e.target.value)}
            placeholder="e.g. /flash-sale or /categories"
            className="text-xs font-mono rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-blue-500/30"
          />
          {/* Quick Route Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-gray-400 mr-1">Quick Suggestions:</span>
            {quickLinks.map((ql) => (
              <button
                key={ql.path}
                type="button"
                onClick={() => onChange('link', ql.path)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all cursor-pointer"
              >
                {ql.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onSend}
            disabled={sending || !form.title?.trim() || !form.body?.trim()}
            className="w-full py-3 rounded-xl bg-[#b7004d] hover:bg-[#9a0041] text-white shadow-sm text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Dispatching Broadcast...' : `Send Broadcast to ${recipientCount} Users 📢`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

