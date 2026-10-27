import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import SupportStatsGrid from './SupportStatsGrid';
import FilterBar from '../../common/FilterBar';
import SupportTicketsTable from './SupportTicketsTable';
import TicketReviewModal from './TicketReviewModal';

const SUPPORT_STATUS_TABS = [
  { id: 'ALL', label: 'All Tickets' },
  { id: 'OPEN', label: 'Open ⏳' },
  { id: 'IN_PROGRESS', label: 'In Progress 🔄' },
  { id: 'RESOLVED', label: 'Resolved ✅' },
  { id: 'CLOSED', label: 'Closed 📁' },
];

export default function AdminSupportManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Ticket for review modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch support tickets from backend
  const fetchTickets = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-support?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setTickets(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (isManual) {
          toast.success("Support Desk Synced", {
            description: "Tickets refreshed from database.",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast.error('Failed to load support tickets', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTickets();
      }
    });
    return () => unsubscribe();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTickets();
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update ticket status handler
  const handleUpdateStatus = async (ticketId, newStatus, adminNotes) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.patch(
        `http://localhost:5000/api/v1/admin-support/${ticketId}/status`,
        { status: newStatus, adminNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(`Ticket marked as ${newStatus}`, {
          description: `Ticket #${ticketId.slice(0, 8)} status updated successfully.`,
        });

        // Update local state
        const updated = res.data.data;
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t))
        );

        setSelectedTicket(null);
        // Refresh aggregate counts
        fetchTickets(true);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS CARDS ────────────────────────────────────────── */}
      <SupportStatsGrid stats={stats} />

      {/* ── 2. FILTER & SEARCH BAR ────────────────────────────────────── */}
      <FilterBar
        searchPlaceholder="Search by ticket ID, subject, customer, supplier, or category..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={SUPPORT_STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        totalCount={tickets.length}
        countLabel="Tickets"
        onRefresh={() => fetchTickets(true)}
        refreshing={refreshing}
      />

      {/* ── 3. TICKETS DATA TABLE ─────────────────────────────────────── */}
      <SupportTicketsTable
        tickets={tickets}
        loading={loading}
        onOpenReview={(ticket) => setSelectedTicket(ticket)}
        formatDate={formatDate}
      />

      {/* ── 4. TICKET REVIEW & RESOLUTION MODAL ───────────────────────── */}
      {selectedTicket && (
        <TicketReviewModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
          actionLoading={actionLoading}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
