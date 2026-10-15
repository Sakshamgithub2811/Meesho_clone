import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/button';
import { 
  Users, 
  Package, 
  ShieldCheck, 
  RefreshCw, 
  IndianRupee, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import StatCard from '../../common/StatCard';
import RecentOrdersCard from './RecentOrdersCard';
import RecentUsersCard from './RecentUsersCard';
import DashboardSkeleton from '../../common/DashboardSkeleton';

/**
 * AdminDashboardOverview Component
 * Orchestrator for real-time overview analytics, delegating sub-views
 * to StatCard (common), RecentOrdersCard, and RecentUsersCard
 */
export default function AdminDashboardOverview({ onNavigateTab }) {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;
      const res = await axios.get('http://localhost:5000/api/v1/admin-dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
        if (isManual) {
          toast.success("Dashboard Refreshed", {
            description: "Real-time analytics database se sync ho gaya!"
          });
        }
      }
    } catch (err) {
      console.error("Dashboard fetch stats error:", err);
      toast.error("Failed to load analytics", {
        description: err.response?.data?.error || "Could not fetch dashboard statistics."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchStats();
      }
    });
    return () => unsubscribe();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const metricCards = [
    {
      id: 'sales',
      title: 'Total Sales',
      value: formatCurrency(stats?.totalSales),
      icon: IndianRupee,
      color: 'pink',
      badge: {
        text: `${stats?.totalOrders || 0} Orders`,
        icon: TrendingUp,
        variant: 'success'
      },
      subtitle: 'across platform'
    },
    {
      id: 'users',
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'indigo',
      subtitle: `${stats?.roles?.CUSTOMER || 0} Buyers • ${stats?.roles?.DROPSHIPPER || 0} Dropshippers`,
      actionLabel: 'Manage',
      onAction: () => onNavigateTab?.('users')
    },
    {
      id: 'products',
      title: 'Catalog Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'emerald',
      subtitle: `${stats?.totalCategories || 0} Categories active`,
      actionLabel: 'View',
      onAction: () => onNavigateTab?.('products')
    },
    {
      id: 'kyc',
      title: 'Pending KYC',
      value: stats?.pendingKyc || 0,
      icon: ShieldCheck,
      color: 'amber',
      badge: stats?.pendingKyc > 0 ? {
        text: 'Action Required',
        icon: AlertCircle,
        variant: 'warning'
      } : null,
      subtitle: stats?.pendingKyc > 0 ? '' : 'All applications clear',
      actionLabel: 'Review',
      onAction: () => onNavigateTab?.('kyc')
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* ── TOP HEADER / ACTION BAR ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchStats(true)} 
          disabled={refreshing}
          className="border-gray-300 hover:border-[#b7004d] hover:text-[#b7004d] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin text-[#b7004d]' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* ── 4 REUSABLE METRIC CARDS ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* ── 2-COLUMN SECTION: RECENT ORDERS & RECENT USERS ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrdersCard 
          orders={stats?.recentOrders} 
          onNavigateTab={onNavigateTab} 
          formatCurrency={formatCurrency} 
        />
        <RecentUsersCard 
          users={stats?.recentUsers} 
          onNavigateTab={onNavigateTab} 
          formatDate={formatDate} 
        />
      </div>

    </div>
  );
}
