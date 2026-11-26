import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';
import SecureCallModal from '../../components/delivery/SecureCallModal';

export default function SwiftRoute({ onNavigate = () => {}, onBack }) {
  const [stops, setStops] = useState([
    {
      id: 1,
      name: 'Hub Pickup: Indiranagar Fulfilment',
      type: 'pickup',
      address: 'Plot 14, 100ft Road, Indiranagar, Bengaluru',
      packages: 6,
      eta: '09:30 AM',
      isCompleted: true,
      time: 'Completed at 09:28 AM',
    },
    {
      id: 2,
      name: 'Customer Drop: Priya Sharma',
      type: 'drop',
      address: 'Flat 402, Lotus Apt, Sector 15, HSR Layout, Bengaluru',
      packages: 2,
      eta: '10:05 AM',
      isCompleted: false,
      contact: '+91 98765 XXXXX (Masked)',
      cod: false,
    },
    {
      id: 3,
      name: 'Customer Drop: Rahul Varma',
      type: 'drop',
      address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru',
      packages: 1,
      eta: '10:35 AM',
      isCompleted: false,
      contact: '+91 91234 XXXXX (Masked)',
      cod: true,
      codAmount: 850,
    },
    {
      id: 4,
      name: 'Customer Drop: Sneha Kapoor',
      type: 'drop',
      address: 'B-304, Prestige Tech Vista, Kadubeesanahalli, Bengaluru',
      packages: 3,
      eta: '11:15 AM',
      isCompleted: false,
      contact: '+91 99887 XXXXX (Masked)',
      cod: false,
    },
  ]);

  const [batterySaveMode, setBatterySaveMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [activeCallStop, setActiveCallStop] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleToggleStop = (id) => {
    setStops((prev) =>
      prev.map((stop) => {
        if (stop.id === id) {
          const next = !stop.isCompleted;
          triggerToast(next ? `Stop #${id} marked as Completed! ✓` : `Stop #${id} marked pending`);
          return { ...stop, isCompleted: next };
        }
        return stop;
      })
    );
  };

  const handleOptimizeRoute = () => {
    triggerToast('AI Route Optimizer re-sequenced stops to save 18 mins & 3.2 km! ⚡');
  };

  const completedCount = stops.filter((s) => s.isCompleted).length;

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen font-sans antialiased pb-32 selection:bg-pink-100 selection:text-pink-600">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('driver_dashboard'))}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-[#b90041] text-white flex items-center justify-center shadow-md shadow-pink-500/20 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">route</span>
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg text-[#1c1b1b] tracking-tight leading-none">
                SwiftRoute AI Navigator
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Smart Multi-Stop Sequencing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setBatterySaveMode(!batterySaveMode);
                triggerToast(
                  batterySaveMode
                    ? 'High Contrast GPS mode active'
                    : 'Battery Saver GPS mode enabled 🔋'
                );
              }}
              className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                batterySaveMode ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}
              title="Battery Saver"
            >
              <span className="material-symbols-outlined text-lg">battery_saver</span>
            </button>
            <button
              onClick={handleOptimizeRoute}
              className="bg-gradient-to-r from-[#b90041] to-[#df2457] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-md active:scale-95 transition-transform cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              <span>AI Optimize</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Progress Metric Banner */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Route Execution Progress
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1c1b1b] mt-0.5">
                {completedCount} of {stops.length} Stops Completed
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-[#008644] bg-green-50 px-3 py-1 rounded-full">
                {Math.round((completedCount / stops.length) * 100)}% Done
              </span>
            </div>
          </div>

          {/* Linear Progress */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#b90041] to-[#df2457] transition-all duration-500"
              style={{ width: `${(completedCount / stops.length) * 100}%` }}
            />
          </div>
        </section>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sequence List (7 cols) */}
          <section className="lg:col-span-7 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-extrabold text-[#1c1b1b] uppercase tracking-wider">
                Multi-Stop Sequence ({stops.length})
              </h3>
              <span className="text-xs font-bold text-slate-400">Live Geo-Sequenced</span>
            </div>

            <div className="space-y-3">
              {stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    stop.isCompleted
                      ? 'border-emerald-100 bg-emerald-50/20 opacity-80'
                      : 'border-slate-100 shadow-sm hover:shadow-md hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                          stop.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : stop.type === 'pickup'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-pink-100 text-[#b90041]'
                        }`}
                      >
                        {stop.isCompleted ? (
                          <span className="material-symbols-outlined text-lg">check</span>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-[#1c1b1b]">
                            {stop.name}
                          </h4>
                          {stop.cod && (
                            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              COD ₹{stop.codAmount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {stop.address}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400">
                          <span>📦 {stop.packages} Pkgs</span>
                          <span>•</span>
                          <span className="text-[#b90041]">{stop.eta}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStop(stop.id)}
                      className={`p-2 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer flex-shrink-0 ${
                        stop.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={stop.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {stop.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  </div>

                  {!stop.isCompleted && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('active_delivery')}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-emerald-400">
                          near_me
                        </span>
                        <span>Navigate Map</span>
                      </button>
                      {stop.contact && (
                        <button
                          onClick={() => {
                            setActiveCallStop(stop);
                            setIsCallModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                        >
                          <span className="material-symbols-outlined text-sm text-emerald-600">call</span>
                          <span>Secure Call</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: AI Optimizer & Map Canvas (5 cols, sticky) */}
          <section className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* AI Optimization Efficiency Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-5 sm:p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                <span className="material-symbols-outlined text-indigo-600">auto_fix_high</span>
                <span>AI Sequence Optimization</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stops arranged in order of closest geographical coordinates to eliminate backtrack
                mileage.
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-white/80 p-3 rounded-2xl border border-indigo-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Time Saved
                  </span>
                  <span className="text-base font-black text-indigo-900">18 Mins</span>
                </div>
                <div className="bg-white/80 p-3 rounded-2xl border border-indigo-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Distance Saved
                  </span>
                  <span className="text-base font-black text-emerald-600">3.2 km</span>
                </div>
              </div>
            </div>

            {/* Route Map Preview Card */}
            <div
              onClick={() => onNavigate('active_delivery')}
              className="relative h-60 rounded-3xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80"
                alt="Route Map"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">Open Live Turn Navigation</p>
                  <p className="text-[10px] text-slate-400">Total Route: 8.4 km (1h 45m)</p>
                </div>
                <span className="text-[#b90041] font-black text-xs">➔</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Cloud Telephony Secure Calling Modal */}
      {activeCallStop && (
        <SecureCallModal
          isOpen={isCallModalOpen}
          onClose={() => {
            setIsCallModalOpen(false);
            setActiveCallStop(null);
          }}
          customerName={activeCallStop.name.replace('Customer Drop: ', '')}
          orderId={`#ST-${activeCallStop.id}84`}
          maskedPhone={activeCallStop.contact}
        />
      )}

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}
