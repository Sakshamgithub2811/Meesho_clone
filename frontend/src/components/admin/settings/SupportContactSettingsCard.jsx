import React from 'react';
import { Headphones, Mail, Phone, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';

export default function SupportContactSettingsCard({
  supportEmail = 'support@mshoppy.in',
  supportPhone = '1800-890-1234',
  onChange
}) {
  return (
    <Card className="border border-gray-200/90 shadow-xs hover:border-blue-200 transition-all">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Customer Support & Invoice Credentials
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Helpline and support contact displayed on customer order slips, GST tax invoices, and SMS updates.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Support Helpline Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Helpline / Phone</span>
              <span className="text-pink-600">*</span>
            </label>
            <Input
              type="text"
              value={supportPhone}
              onChange={(e) => onChange('supportPhone', e.target.value)}
              className="text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-blue-500/30"
              placeholder="e.g. 1800-890-1234 or +91 9876543210"
            />
            <p className="text-[11px] text-gray-400">
              Printed on thermal dispatch slips and customer order confirmation emails.
            </p>
          </div>

          {/* 2. Support Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-pink-600" />
              <span>Official Customer Care Email</span>
              <span className="text-pink-600">*</span>
            </label>
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => onChange('supportEmail', e.target.value)}
              className="text-sm font-semibold rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-pink-500/30"
              placeholder="e.g. support@mshoppy.in"
            />
            <p className="text-[11px] text-gray-400">
              Used for refund inquiries, escalation tickets, and customer receipts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
