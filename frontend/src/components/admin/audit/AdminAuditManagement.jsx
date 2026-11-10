import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import AuditHeaderBanner from './AuditHeaderBanner';
import AuditFeedTable from './AuditFeedTable';
import { API_V1_BASE } from '../../../config/apiConfig';

export default function AdminAuditManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res = await axios.get(`${API_V1_BASE}/admin-audit`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit ledger: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <AuditHeaderBanner logs={logs} loading={loading} onRefresh={fetchAuditLogs} />
      <AuditFeedTable logs={logs} loading={loading} onRefresh={fetchAuditLogs} />
    </div>
  );
}
