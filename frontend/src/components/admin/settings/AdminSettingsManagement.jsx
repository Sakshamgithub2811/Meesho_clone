import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import SettingsHeaderBanner from './SettingsHeaderBanner';
import FinancialSettingsCard from './FinancialSettingsCard';
import ShippingDeliverySettingsCard from './ShippingDeliverySettingsCard';
import PaymentOperationsSettingsCard from './PaymentOperationsSettingsCard';
import SupportContactSettingsCard from './SupportContactSettingsCard';
import { API_V1_BASE } from '../../../config/apiConfig';
import { Loader2 } from 'lucide-react';

export default function AdminSettingsManagement() {
  const [settings, setSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const currentUser = useSelector((state) => state.user?.currentUser);

  const getAuthToken = async () => {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) return idToken;
      }
    } catch (e) {
      console.warn('Firebase token retrieval error:', e);
    }
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      currentUser?.id ||
      'admin_master'
    );
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const token = await getAuthToken();
      const res = await axios.get(`${API_V1_BASE}/admin-settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.success && res.data?.data) {
        setSettings(res.data.data);
        setInitialSettings(res.data.data);
      } else {
        throw new Error(res.data?.message || 'Failed to load platform settings');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setFetchError(msg);
      toast.error('Settings Load Error', {
        description: msg
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [currentUser]);

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
      const token = await getAuthToken();
      const res = await axios.put(`${API_V1_BASE}/admin-settings`, settings, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data?.success && res.data?.data) {
        setSettings(res.data.data);
        setInitialSettings(res.data.data);
        toast.success('Settings Saved Successfully! ⚙️', {
          description: `Platform commission: ${res.data.data.commissionRate}%, Free Delivery: ₹${res.data.data.freeShippingThreshold}, COD: ${res.data.data.codEnabled ? 'Active' : 'Disabled'}`
        });
      } else {
        throw new Error(res.data?.message || 'Server rejected settings update');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error('Failed to Save Settings', {
        description: msg
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
