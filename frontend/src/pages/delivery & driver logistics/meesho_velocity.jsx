import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

export default function MeeshoVelocity({ onNavigate = () => {}, onBack }) {
  const [isHyperSpeedActive, setIsHyperSpeedActive] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const dispatchQueue = [
    {
      id: 'VEL-9901',
      zone: 'Koramangala Sector 4, Bengaluru',
      status: 'Express Dispatch',
      timeRemaining: '14 mins',
      rider: 'Vikram S. (Rider #882)',
      speed: '34 km/h',
      itemsCount: '3 items',
      priority: 'Ultra High',
    },
    {
      id: 'VEL-9902',
      zone: 'Indiranagar 100ft Rd, Bengaluru',
      status: 'Picking Up from Hub',
      timeRemaining: '22 mins',
      rider: 'Ramesh K. (Rider #619)',
      speed: '28 km/h',
      itemsCount: '1 item',
      priority: 'High',
    },
    {
      id: 'VEL-9903',
      zone: 'HSR Layout Sector 1, Bengaluru',
      status: 'Out for Delivery',
      timeRemaining: '08 mins',
      rider: 'Anil P. (Rider #404)',
      speed: '41 km/h',
      itemsCount: '2 items',
      priority: 'Ultra High',
    },
    {
      id: 'VEL-9904',
      zone: 'Whitefield Tech Corridor, Bengaluru',
      status: 'In Transit',
      timeRemaining: '18 mins',
      rider: 'Deepak M. (Rider #102)',
      speed: '36 km/h',
      itemsCount: '4 items',
      priority: 'Standard',
    },
  ];

  return (
    <div className="bg-[#f9f9fb] text-[#191c1e] min-h-screen font-sans antialiased pb-32 selection:bg-indigo-100 selection:text-indigo-800">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('driver_dashboard'))}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2f06be] to-[#4834d4] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg text-[#191c1e] tracking-tight leading-none">
                MShoppy Velocity Grid
              </h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                Ultra-Speed Fleet Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('swiftroute')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-50 text-[#b90041] hover:bg-pink-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">route</span>
              <span>SwiftRoute</span>
            </button>
            <button
              onClick={() => {
                setIsHyperSpeedActive(!isHyperSpeedActive);
                triggerToast(
                  isHyperSpeedActive
                    ? 'Switched to Standard Grid'
                    : 'HyperSpeed Dispatch Grid Active! ⚡'
                );
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                isHyperSpeedActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>HYPERSPEED</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Metric Cards Bento */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-gradient-to-br from-[#2f06be] to-[#4834d4] text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-indigo-500/20 col-span-2 sm:col-span-1 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider">
                Average Delivery Time
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mt-1">28 Mins</h2>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-white/10 px-3 py-1 rounded-full w-max backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">speed</span>
              <span>Top 2% Ultra-Fast Fleet</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">On-Time Rate</p>
              <h3 className="text-2xl font-black text-[#191c1e]">98.4%</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="material-symbols-outlined text-indigo-600 text-2xl">two_wheeler</span>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Couriers</p>
              <h3 className="text-2xl font-black text-[#191c1e]">342</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="material-symbols-outlined text-amber-500 text-2xl">bolt</span>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Efficiency Index</p>
              <h3 className="text-2xl font-black text-amber-600">99.1%</h3>
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dispatch Queue (7 cols) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center px-1">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#191c1e]">
                  Active Velocity Dispatch Queue
                </h2>
                <p className="text-xs text-slate-400">Live real-time courier telemetry</p>
              </div>
              <button
                onClick={() => triggerToast('Refreshing real-time courier telemetry...')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">sync</span>
                <span>Live Sync</span>
              </button>
            </div>

            <div className="space-y-3">
              {dispatchQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('active_delivery')}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">bolt</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#191c1e]">{item.id}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.zone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">{item.timeRemaining}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">ETA</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                    <span className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-400">
                        person
                      </span>
                      {item.rider}
                    </span>
                    <span className="font-black text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">speed</span>
                      Speed: {item.speed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Demand Heatmap & Zone Surge Controls (5 cols, sticky) */}
          <section className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* Live Heatmap Preview */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Urban Demand &amp; Speed Coverage
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  High Efficiency Zone
                </span>
              </div>

              <div className="relative h-56 rounded-2xl overflow-hidden shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80"
                  alt="Demand Heatmap"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-[1px]" />
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl text-xs font-bold text-indigo-900 shadow-lg flex items-center justify-between">
                  <span>🚀 34 Express Nodes in Bengaluru</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-black">
                    Live
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Peak Hour Surge Multipier</span>
                  <span className="text-emerald-600 font-black">+1.4x Active</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-[#df2457] h-full w-[70%]" />
                </div>
              </div>
            </div>

            {/* Velocity Fleet Action Hub */}
            <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-5 rounded-3xl border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                <span className="material-symbols-outlined text-indigo-600">electric_bolt</span>
                <span>Fleet Optimization Active</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart dispatch algorithms automatically group nearby package drops within a 3km
                radius to minimize transit latency.
              </p>
              <button
                onClick={() => onNavigate('swiftroute')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-500/25 cursor-pointer transition-colors"
              >
                Launch SwiftRoute AI Navigator ➔
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}
