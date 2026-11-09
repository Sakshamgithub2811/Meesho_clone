import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import SettingsHeaderBanner from './SettingsHeaderBanner';
import FinancialSettingsCard from './FinancialSettingsCard';
import ShippingDeliverySettingsCard from './ShippingDeliverySettingsCard';
import PaymentOperationsSettingsCard from './PaymentOperationsSettingsCard';
import SupportContactSettingsCard from './SupportContactSettingsCard';
import { API_BASE } from '../../../config/apiConfig';
import { Loader2 } from 'lucide-react';

export default function AdminSettingsManagement() {
  const [settings, setSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const getAdminAuthHeaders = () => {
    const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
    };
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await fetch(`${API_BASE}/admin-settings`, {
        headers: getAdminAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setInitialSettings(data.data);
      } else {
        throw new Error(data.message || 'Failed to load platform settings');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setFetchError(err.message);
      toast.error('Settings Load Error', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings({ ...initialSettings });
      toast.info('Changes discarded', {
        description: 'Reverted settings to last saved version.'
      });
    }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleSave = async () => {
    if (!settings) return;

    // Client-side validations
    if (settings.commissionRate < 0 || settings.commissionRate > 100) {
      toast.error('Validation Error', {
        description: 'Commission rate must be between 0% and 100%.'
      });
      return;
    }

    if (settings.minPayoutThreshold < 0) {
      toast.error('Validation Error', {
        description: 'Minimum payout threshold cannot be negative.'
      });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/admin-settings`, {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(settings)
      });
      const data = await res.json();

      if (data.success && data.data) {
        setSettings(data.data);
        setInitialSettings(data.data);
        toast.success('Settings Saved Successfully! ⚙️', {
          description: `Platform commission: ${data.data.commissionRate}%, Free Delivery: ₹${data.data.freeShippingThreshold}, COD: ${data.data.codEnabled ? 'Active' : 'Disabled'}`
        });
      } else {
        throw new Error(data.message || 'Server rejected settings update');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to Save Settings', {
        description: err.message
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
        <Loader2 className="w-8 h-8 text-[#b7004d] animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading Platform Settings...</p>
        <p className="text-xs text-gray-400 mt-1">Fetching live marketplace economics and gateway configurations</p>
      </div>
    );
  }

  if (fetchError && !settings) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
          !
        </div>
        <h3 className="text-base font-bold text-rose-900">Failed to Connect to Settings Engine</h3>
        <p className="text-xs text-rose-700 mt-1.5">{fetchError}</p>
        <button
          onClick={fetchSettings}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Action Controls */}
      <SettingsHeaderBanner
        saving={saving}
        isDirty={isDirty}
        lastUpdated={settings?.updatedAt}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* 2. Responsive 2-Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketplace Economics */}
        <FinancialSettingsCard
          commissionRate={settings?.commissionRate ?? 5}
          minPayoutThreshold={settings?.minPayoutThreshold ?? 500}
          onChange={handleChange}
        />

        {/* Free Shipping & Delivery Rules */}
        <ShippingDeliverySettingsCard
          freeShippingThreshold={settings?.freeShippingThreshold ?? 499}
          shippingFee={settings?.shippingFee ?? 49}
          onChange={handleChange}
        />

        {/* Payment Operations & Maintenance Mode */}
        <PaymentOperationsSettingsCard
          codEnabled={settings?.codEnabled ?? true}
          maintenanceMode={settings?.maintenanceMode ?? false}
          onChange={handleChange}
        />

        {/* Support & Contact Credentials */}
        <SupportContactSettingsCard
          supportEmail={settings?.supportEmail ?? 'support@mshoppy.in'}
          supportPhone={settings?.supportPhone ?? '1800-890-1234'}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
