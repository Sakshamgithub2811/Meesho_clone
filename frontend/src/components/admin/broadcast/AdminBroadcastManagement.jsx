import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import BroadcastHeaderBanner from './BroadcastHeaderBanner';
import BroadcastComposerForm from './BroadcastComposerForm';
import BroadcastPreviewMockup from './BroadcastPreviewMockup';
import BroadcastHistoryTable from './BroadcastHistoryTable';
import { API_V1_BASE } from '../../../config/apiConfig';

export default function AdminBroadcastManagement() {
  const [counts, setCounts] = useState({ ALL: 0, CUSTOMER: 0, SUPPLIER: 0, DROPSHIPPER: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    audience: 'ALL',
    type: 'promo',
    title: '',
    body: '',
    link: '/flash-sale'
  });

  const currentUser = useSelector((state) => state.user?.currentUser);

  const getAuthToken = async () => {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) return idToken;
      }
    } catch (e) {
      console.warn('Firebase token retrieval notice:', e);
    }
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      currentUser?.id ||
      'admin_master'
    );
  };

  const fetchAudienceCounts = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const res = await axios.get(`${API_V1_BASE}/admin-broadcast/audience-counts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.data) {
        setCounts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audience counts:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const res = await axios.get(`${API_V1_BASE}/admin-broadcast/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load broadcast history:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAudienceCounts(), fetchHistory()]);
    setLoading(false);
  }, [fetchAudienceCounts, fetchHistory]);

  useEffect(() => {
    loadAll();
  }, [loadAll, currentUser]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendBroadcast = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Validation Error', {
        description: 'Please provide both headline and message body.'
      });
      return;
    }

    try {
      setSending(true);
      const token = await getAuthToken();
      const res = await axios.post(`${API_V1_BASE}/admin-broadcast`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        toast.success('Broadcast Dispatched! 🚀', {
          description: res.data.message || `Delivered to ${res.data.data?.recipientsCount || 0} users via In-App + FCM push!`
        });

        // Reset form to blank
        setForm({
          audience: 'ALL',
          type: 'promo',
          title: '',
          body: '',
          link: ''
        });

        // Refresh logs
        fetchHistory();
      } else {
        throw new Error(res.data?.message || 'Server rejected broadcast');
      }
    } catch (err) {
      console.error('Error dispatching broadcast:', err);
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to Dispatch Broadcast', {
        description: msg
      });
    } finally {
      setSending(false);
    }
  };

  const activeAudienceCount = counts[form.audience] || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Audience KPIs */}
      <BroadcastHeaderBanner counts={counts} loading={loading} onRefresh={loadAll} />

      {/* 2. Responsive 2-Column Composer & Live Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7">
          <BroadcastComposerForm
            form={form}
            onChange={handleFormChange}
            onSend={handleSendBroadcast}
            sending={sending}
            recipientCount={activeAudienceCount}
          />
        </div>

        {/* Right Column: Live Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <BroadcastPreviewMockup form={form} />
        </div>
      </div>

      {/* 3. Broadcast History & Dispatch Logs */}
      <BroadcastHistoryTable history={history} loading={loading} onRefresh={fetchHistory} />
    </div>
  );
}
