import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

export default function OrderDetailsDriver({ onNavigate = () => {}, onBack }) {
  const [isDelivered, setIsDelivered] = useState(false);
  const [currentStep, setCurrentStep] = useState(2); // 0: Picked up, 1: Arrived, 2: Out for Delivery, 3: Delivered
  const [otpCode, setOtpCode] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleCompleteDelivery = () => {
    setIsDelivered(true);
    setCurrentStep(3);
    triggerToast('Delivery Completed! ₹60.00 credited to your wallet 🎉');
    setTimeout(() => {
      onNavigate('driver_earnings');
    }, 1200);
  };

  const timelineSteps = [
    { title: 'Picked up from Hub', time: '10:24 AM • Electronic City Hub' },
    { title: 'Arrived at Local Facility', time: '11:45 AM • Koramangala DC' },
    { title: 'Out for Delivery', time: 'Current • Heading to Customer' },
    { title: 'Delivered', time: 'Estimated by 12:30 PM' },
  ];

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen w-full max-w-full overflow-x-hidden font-sans antialiased selection:bg-pink-100 selection:text-pink-600 pb-32">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-14 sm:h-16 max-w-7xl mx-auto w-full gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('driver_dashboard'))}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 active:scale-95 text-[#b90041] cursor-pointer transition-colors shrink-0"
              title="Back"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                <h1 className="font-extrabold text-sm sm:text-lg text-[#1c1b1b] leading-tight whitespace-nowrap">
                  Order Details
                </h1>
                <span className="text-[10px] sm:text-xs font-bold text-[#b90041] bg-pink-50 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
                  #MS-99210-A
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate block">
                Electronic City ➔ Koramangala
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('active_delivery')}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#b90041] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
              title="Live GPS Map"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">explore</span>
              <span>GPS Map</span>
            </button>
            <button
              onClick={() => onNavigate('swiftroute')}
              className="hidden sm:flex px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-base">route</span>
              <span>Multi-Stop Route</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Order Summary, Customer Details, Items (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status & Estimated Earnings Banner */}
            <section className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-7 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Status
                  </span>
                  <h2 className="text-2xl font-black text-[#b90041] mt-0.5">
                    {isDelivered ? 'Delivered Successfully' : 'In Transit (Out for Delivery)'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Package ID: PKG-882910-K
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="bg-emerald-50 text-[#008644] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">speed</span>
                    <span>On Schedule</span>
                  </div>
                  <div
                    onClick={() => onNavigate('active_delivery')}
                    className="bg-pink-50 text-[#b90041] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-pink-100"
                  >
                    <span className="material-symbols-outlined text-sm">route</span>
                    <span>2.4 km to drop ➔</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigate('driver_earnings')}
                className="sm:col-span-5 bg-gradient-to-br from-[#b90041] to-[#df2457] text-white rounded-3xl p-5 shadow-lg shadow-pink-500/20 flex flex-col justify-between items-start sm:items-end sm:text-right cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <div>
                  <p className="text-xs uppercase font-bold text-pink-100 tracking-wider">
                    Trip Payout ➔
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black leading-none mt-1">₹60.00</h3>
                </div>
                <div className="mt-3 text-[11px] font-medium text-pink-100 bg-white/20 px-3 py-1 rounded-full">
                  Base ₹45.00 + Incentive ₹15.00
                </div>
              </div>
            </section>

            {/* Customer Details Card */}
            <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
                    alt="Customer Avatar"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-pink-100"
                  />
                  <div>
                    <h4 className="font-extrabold text-base text-[#1c1b1b]">Priya Sharma</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="text-amber-500 font-bold">★ 4.9 Rating</span>
                      <span>• Verified MShoppy Shopper</span>
                    </p>
                  </div>
                </div>

                {/* Call & Chat Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerToast('Dialing customer Priya (+91 98765 43210)... 📞')}
                    className="h-11 px-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center gap-1.5 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                    <span className="hidden sm:inline">Call</span>
                  </button>
                  <button
                    onClick={() => triggerToast('Opening live chat with customer... 💬')}
                    className="h-11 px-4 rounded-2xl bg-pink-50 text-[#b90041] hover:bg-pink-100 flex items-center justify-center gap-1.5 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address Box */}
              <div
                onClick={() => onNavigate('active_delivery')}
                className="bg-[#fcf9f8] p-4 rounded-2xl flex items-start gap-3 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <span className="material-symbols-outlined text-[#b90041] text-2xl mt-0.5">
                  location_on
                </span>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-extrabold text-[#1c1b1b]">
                    Flat 402, 4th Floor, Skyview Apartments
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Koramangala 5th Block, Near Star Market, Bangalore - 560034
                  </p>
                </div>
                <span className="text-xs font-black text-[#b90041]">GPS ➔</span>
              </div>
            </section>

            {/* Package Items & Instructions Bento */}
            <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Package Items (3 Items Inside)
                </h3>
                <span className="text-[10px] font-extrabold text-[#b90041] bg-pink-50 px-2.5 py-0.5 rounded-full">
                  Handle with Care (Fragile)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#fcf9f8] p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#b90041] shadow-xs">
                    <span className="material-symbols-outlined text-2xl">headphones</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-extrabold text-[#1c1b1b] line-clamp-1">
                      Elite Wireless Headphones Gen 2
                    </p>
                    <p className="text-slate-400 mt-0.5">Qty: 1 • Electronics • Prepaid</p>
                  </div>
                </div>

                <div className="bg-[#fcf9f8] p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#b90041] shadow-xs">
                    <span className="material-symbols-outlined text-2xl">watch</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-extrabold text-[#1c1b1b] line-clamp-1">
                      Minimalist Chrono Watch
                    </p>
                    <p className="text-slate-400 mt-0.5">Qty: 2 • Accessories • Prepaid</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-700">info</span>
                  Customer Delivery Instruction:
                </span>
                <p className="text-amber-800">
                  "Please call before ringing the doorbell. Leave with security guard at Block A if
                  door is locked."
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Timeline & Handover Verification (5 cols, sticky) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* Timeline Section */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Trip Timeline
              </h3>
              <div className="space-y-4 relative pl-2">
                {timelineSteps.map((step, idx) => {
                  const isPassed = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={idx} className="flex gap-3 relative">
                      <div
                        className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${
                          isCurrent
                            ? 'bg-[#b90041] ring-4 ring-pink-500/20 animate-pulse'
                            : isPassed
                            ? 'bg-[#008644]'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div className="text-xs">
                        <p
                          className={`font-bold ${
                            isCurrent
                              ? 'text-[#b90041]'
                              : isPassed
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-slate-400">{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Handover OTP Box */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customer Handover OTP
                </h3>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Required
                </span>
              </div>
              <input
                type="text"
                placeholder="Enter 4-Digit Customer OTP (e.g. 4829)"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-black p-3 bg-[#f8f9fb] border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <p className="text-[11px] text-slate-400 text-center">
                Ask customer for delivery verification OTP received on SMS.
              </p>
            </section>

            {/* Complete Delivery Action Button */}
            <button
              onClick={handleCompleteDelivery}
              disabled={isDelivered}
              className={`w-full h-14 rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                isDelivered
                  ? 'bg-green-600 text-white shadow-green-600/30'
                  : 'bg-gradient-to-r from-[#b90041] to-[#df2457] text-white shadow-pink-500/30 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {isDelivered ? 'verified' : 'task_alt'}
              </span>
              <span>
                {isDelivered ? 'DELIVERY COMPLETED (CREDITED)' : 'COMPLETE & CONFIRM DELIVERY'}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}