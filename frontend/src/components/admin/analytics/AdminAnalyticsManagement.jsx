import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import AnalyticsStatsGrid from './AnalyticsStatsGrid';
import RevenueTrendChart from './RevenueTrendChart';
import CategoryDistributionCard from './CategoryDistributionCard';
import OrderStatusPipeline from './OrderStatusPipeline';
import TopSuppliersRanking from './TopSuppliersRanking';
import { Button } from '../../ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';

export default function AdminAnalyticsManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [data, setData] = useState({
    kpis: {},
    statusCounts: {},
    userRoleCounts: {},
    categoryDistribution: [],
    revenueTrends: [],
    topSuppliers: []
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics from backend
  const fetchAnalytics = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const res = await axios.get(
        'http://localhost:5000/api/v1/admin-analytics',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success && res.data.analytics) {
        setData(res.data.analytics);

        if (isManual) {
          toast.success("Analytics Synced", {
            description: "Marketplace intelligence & performance reports updated."
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast.error("Failed to load analytics", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAnalytics();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── 0. TOOLBAR & REFRESH ────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#b7004d]" />
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Business Intelligence & Reporting Engine
            </h3>
            <p className="text-xs text-gray-500">
              Aggregated transaction volume, catalog distribution & seller rankings
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="text-xs border-gray-200 hover:border-[#b7004d] hover:text-[#b7004d] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin text-[#b7004d]' : ''}`} />
          <span>Refresh Metrics</span>
        </Button>
      </div>

      {/* ── 1. KPI STATS SUMMARY ────────────────────────────────────── */}
      <AnalyticsStatsGrid kpis={data.kpis} />

      {/* ── 2. CHARTS & REVENUE TRENDS ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart trends={data.revenueTrends} />
        </div>
        <div>
          <CategoryDistributionCard categories={data.categoryDistribution} />
        </div>
      </div>

      {/* ── 3. PIPELINE & TOP SUPPLIERS ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusPipeline statusCounts={data.statusCounts} />
        <TopSuppliersRanking suppliers={data.topSuppliers} />
      </div>
    </div>
  );
}
