import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import OrdersStatsGrid from './OrdersStatsGrid';
import FilterBar from '../../common/FilterBar';
import OrdersTable from './OrdersTable';
import OrderDetailModal from './OrderDetailModal';

const ORDER_STATUS_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'ORDERED', label: 'Ordered / Pending ⏳' },
  { id: 'CONFIRMED', label: 'Confirmed 📦' },
  { id: 'SHIPPED', label: 'In Transit 🚚' },
  { id: 'DELIVERED', label: 'Delivered ✅' },
  { id: 'CANCELLED', label: 'Cancelled ❌' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Payment Status' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Payment Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' }
];

export default function AdminOrdersManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Format currency helper
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch orders from backend
  const fetchOrders = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const params = new URLSearchParams();

      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (paymentFilter !== 'ALL') params.append('paymentStatus', paymentFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axios.get(
        `http://localhost:5000/api/v1/admin-orders?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setOrders(res.data.orders || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (isManual) {
          toast.success("Orders Synced", {
            description: "Latest transactions refreshed from database."
          });
        }
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      toast.error('Failed to load orders', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchOrders();
      }
    });
    return () => unsubscribe();
  }, [statusFilter, paymentFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders();
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update order status handler
  const handleUpdateStatus = async (orderId, { orderStatus, paymentStatus }) => {
    try {
      setActionLoading(true);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.patch(
        `http://localhost:5000/api/v1/admin-orders/${orderId}/status`,
        { orderStatus, paymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success('Order status updated successfully', {
          description: `Order #${orderId.slice(0, 8)} is now ${orderStatus}`
        });

        // Update local order
        const updated = res.data.order;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, ...updated }));
        }

        setSelectedOrder(null);
        // Refresh counts
        fetchOrders(true);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. KPI STATS CARDS ────────────────────────────────────────── */}
      <OrdersStatsGrid stats={stats} formatCurrency={formatCurrency} />

      {/* ── 2. FILTER & SEARCH BAR ────────────────────────────────────── */}
      <FilterBar
        searchPlaceholder="Search by Order ID, customer name, email, or phone..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={ORDER_STATUS_TABS}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        dropdowns={[
          {
            value: paymentFilter,
            onChange: (e) => setPaymentFilter(e.target.value),
            options: PAYMENT_STATUS_OPTIONS
          }
        ]}
        totalCount={orders.length}
        countLabel="Orders Found"
        onRefresh={() => fetchOrders(true)}
        refreshing={refreshing}
      />

      {/* ── 3. ORDERS DATA TABLE ──────────────────────────────────────── */}
      <OrdersTable
        orders={orders}
        loading={loading}
        onOpenOrder={(order) => setSelectedOrder(order)}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* ── 4. ORDER DETAIL & STATUS REVIEW MODAL ─────────────────────── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          actionLoading={actionLoading}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
