import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Volume2, VolumeX, Bell, ShoppingBag, Sparkles, ChevronRight, X } from 'lucide-react';
import { playNewOrderChime } from '../../../utils/webAudioChime';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { API_V1_BASE } from '../../../config/apiConfig';

export default function OrderSoundAlertWidget({ onNavigateToOrders }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('admin_order_sound_enabled') !== 'false';
  });
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState(null);

  const currentUser = useSelector((state) => state.user?.currentUser);
  const lastCheckedRef = useRef(null);
  const timerRef = useRef(null);

  const getAuthToken = async () => {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) return idToken;
      }
    } catch (e) {
      console.warn('Firebase token retrieval:', e);
    }
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      currentUser?.id ||
      'admin_master'
    );
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('admin_order_sound_enabled', String(nextState));
    if (nextState) {
      playNewOrderChime(0.2); // Soft test chime on enable
      toast.success('Live Order Sound Alerts: ENABLED 🔔');
    } else {
      toast.info('Live Order Sound Alerts: MUTED 🔕');
    }
  };

  const handleTestChime = () => {
    playNewOrderChime(0.5);
    toast.success('Test Chime Played 🎵', {
      description: 'Cashier sound synthesized with native Web Audio API.'
    });
  };

  // Live Polling Routine
  const pollForNewOrders = async () => {
    if (typeof document !== 'undefined' && document.hidden) {
      return; // Skip poll when tab is inactive to preserve bandwidth
    }

    try {
      const token = await getAuthToken();
      const params = {};
      if (lastCheckedRef.current) {
        params.since = lastCheckedRef.current;
      }

      const res = await axios.get(`${API_V1_BASE}/admin-orders/live-poll`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data?.success) {
        const { hasNewOrders, orders, latestTimestamp } = res.data;

        // On first run without since, establish baseline without triggering alert
        if (!lastCheckedRef.current) {
          lastCheckedRef.current = latestTimestamp || new Date().toISOString();
          return;
        }

        if (latestTimestamp) {
          lastCheckedRef.current = latestTimestamp;
        }

        if (hasNewOrders && Array.isArray(orders) && orders.length > 0) {
          setNewOrdersCount((prev) => prev + orders.length);
          const newest = orders[0];
          setLastOrderInfo(newest);

          // Play Audio Chime
          if (soundEnabled) {
            playNewOrderChime(0.45);
          }

          // Trigger Interactive Alert Toast
          toast.success(`🛍️ New Order Received: ${newest.orderNumber}`, {
            description: `${newest.customerName} • ₹${Number(newest.totalAmount || 0).toLocaleString('en-IN')}`,
            duration: 8000,
            action: {
              label: 'View Orders',
              onClick: () => {
                if (onNavigateToOrders) onNavigateToOrders('orders');
              }
            }
          });
        }
      }
    } catch (err) {
      // Silent catch to prevent spamming errors on network blips
    }
  };

  useEffect(() => {
    // Initial fetch to set baseline
    pollForNewOrders();

    // 12-second heartbeat poll
    timerRef.current = setInterval(pollForNewOrders, 12000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [soundEnabled]);

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      {isMinimized ? (
        // Minimized floating circular button
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all border border-slate-700/60 cursor-pointer"
          title="Open Order Alert Center"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}

          {newOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#b7004d] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white">
              {newOrdersCount}
            </span>
          )}
        </button>
      ) : (
        // Expanded sleek floating glassmorphic widget
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/70 max-w-sm flex flex-col gap-2.5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-gray-200">Live Order Radar</span>
              {newOrdersCount > 0 && (
                <span className="bg-[#b7004d] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  +{newOrdersCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimize widget"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Last Order Info or Idle status */}
          <div className="flex items-center gap-2.5 py-0.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-pink-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              {lastOrderInfo ? (
                <>
                  <div className="text-xs font-semibold text-white truncate">
                    {lastOrderInfo.orderNumber} • ₹{Number(lastOrderInfo.totalAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {lastOrderInfo.customerName}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold text-gray-300">Listening for orders...</div>
                  <div className="text-[11px] text-gray-500">12s heartbeat active</div>
                </>
              )}
            </div>
          </div>

          {/* Action Footer row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            {/* Toggle Sound */}
            <button
              type="button"
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-gray-400 border border-slate-700 hover:bg-slate-700'
              }`}
              title={soundEnabled ? 'Click to Mute' : 'Click to Unmute'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Test Chime */}
            <button
              type="button"
              onClick={handleTestChime}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-medium bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
              title="Test notification chime"
            >
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Test Chime</span>
            </button>

            {/* View Orders Tab Button */}
            {onNavigateToOrders && (
              <button
                type="button"
                onClick={() => onNavigateToOrders('orders')}
                className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#b7004d] hover:bg-[#9a0041] text-white transition-all shadow-xs cursor-pointer ml-auto"
              >
                <span>Orders</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
