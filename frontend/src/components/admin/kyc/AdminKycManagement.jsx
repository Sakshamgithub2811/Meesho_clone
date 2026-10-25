import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/button';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import KycStatsGrid from './KycStatsGrid';
import FilterBar from '../../common/FilterBar';
import KycTable from './KycTable';
import KycReviewModal from './KycReviewModal';

const TYPE_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'supplier', label: 'Suppliers 🏬' },
  { id: 'dropshipper', label: 'Dropshippers 📦' },
  { id: 'affiliate', label: 'Affiliates 🤝' }
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

/**
 * AdminKycManagement Component
 * Main coordinator for KYC verification hub, orchestrating
 * KycStatsGrid, KycFilterBar, KycTable, and KycReviewModal.
 */
export default function AdminKycManagement({ initialType = 'ALL' }) {
  const currentUser = useSelector((state) => state.user?.currentUser);
  
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedType, setSelectedType] = useState(initialType.toLowerCase()); // 'all' | 'dropshipper' | 'affiliate'
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Application for Review Modal
  const [reviewApp, setReviewApp] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch applications from backend
  const fetchApplications = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await axios.get(`http://localhost:5000/api/v1/admin-kyc?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setApplications(res.data.applications || []);
        if (res.data.stats) setStats(res.data.stats);
        if (isManual) {
          toast.success("KYC Data Synced", { description: "Applications list refreshed from database." });
        }
      }
    } catch (err) {
      console.error("KYC Fetch Error:", err);
      toast.error("Failed to load KYC requests", {
        description: err.response?.data?.error || "Could not retrieve KYC applications."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchApplications();
      }
    });
    return () => unsubscribe();
  }, [selectedType, selectedStatus]);

  // Handle Search on Submit / Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  // Open review modal
  const handleOpenReview = (app) => {
    setReviewApp(app);
    setAdminNote(app.adminNotes || '');
  };

  // Update status (Approve, Reject, or Under Review)
  const handleStatusUpdate = async (newStatus) => {
    if (!reviewApp) return;

    if (newStatus === 'REJECTED' && !adminNote.trim()) {
      return toast.error("Rejection Note Required", {
        description: "Please enter a reason for rejecting this application so the user can fix it."
      });
    }

    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const res = await axios.put(
        `http://localhost:5000/api/v1/admin-kyc/${reviewApp.id}/status`,
        {
          status: newStatus,
          adminNotes: adminNote.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        toast.success(`Application ${newStatus}`, {
          description: `Applicant has been marked as ${newStatus}.`
        });
        setReviewApp(null);
        fetchApplications();
      }
    } catch (err) {
      console.error("KYC Status Update Error:", err);
      toast.error("Action Failed", {
        description: err.response?.data?.error || "Could not update KYC status."
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ── TOP HEADER & REFRESH BAR ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#b7004d]" />
            KYC Verification Hub
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review and verify Dropshippers and Affiliate Partner identity documents.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchApplications(true)} 
          disabled={refreshing}
          className="border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin text-[#b7004d]' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {/* ── 4 SUMMARY METRIC CARDS (COMMON StatCard) ──────────── */}
      <KycStatsGrid stats={stats} />

      {/* ── COMMON FILTER & SEARCH BAR ───────────────────────── */}
      <FilterBar
        tabs={TYPE_TABS}
        activeTab={selectedType}
        onTabChange={setSelectedType}
        dropdowns={[
          {
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: STATUS_OPTIONS
          }
        ]}
        searchPlaceholder="Search by name, email..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* ── APPLICATIONS TABLE ───────────────────────────────── */}
      <KycTable
        applications={applications}
        loading={loading}
        onOpenReview={handleOpenReview}
        formatDate={formatDate}
      />

      {/* ── MODAL: DOCUMENT INSPECTION & ACTIONS ─────────────── */}
      <KycReviewModal
        reviewApp={reviewApp}
        onClose={() => setReviewApp(null)}
        adminNote={adminNote}
        onAdminNoteChange={setAdminNote}
        actionLoading={actionLoading}
        onStatusUpdate={handleStatusUpdate}
        formatDate={formatDate}
      />

    </div>
  );
}
