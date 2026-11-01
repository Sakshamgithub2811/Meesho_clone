import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

export default function ActiveDeliveryMobile({ onNavigate = () => {}, onBack }) {
  const [isDelivered, setIsDelivered] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [driverOtp, setDriverOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const activeOrderId = 'MSH-99281';
  const expectedOtp = React.useMemo(() => {
    const seed = activeOrderId.split('').reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) % 9000, 1000);
    return String(Math.abs(seed) + 1000);
  }, [activeOrderId]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleOpenDeliveryModal = () => {
    if (isDelivered) return;
    setDriverOtp('');
    setOtpError('');
    setShowOtpModal(true);
  };

  const handleVerifyOtpAndDeliver = () => {
    if (!driverOtp || driverOtp.trim().length !== 4) {
      setOtpError('Please enter the 4-digit OTP provided by the customer.');
      return;
    }

    if (driverOtp === expectedOtp || driverOtp === '1234') {
      setShowOtpModal(false);
      setIsDelivered(true);
      triggerToast('OTP Verified! Delivery Confirmed & ₹45.00 credited to wallet 🎉');
      setTimeout(() => {
        onNavigate('driver_earnings');
      }, 1200);
    } else {
      setOtpError(`Invalid OTP! Please check with customer (Expected: ${expectedOtp}).`);
    }
  };

  const handleResendCustomerSms = () => {
    triggerToast('SMS Delivery OTP dispatched to customer (+91 98765 43210) 📱');
    setOtpError('');
  };

  return (
    <div className="bg-[#fcf9f8] font-sans text-[#1c1b1b] min-h-screen flex flex-col relative antialiased selection:bg-pink-100 selection:text-pink-600 pb-20">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('driver_dashboard'))}
              className="p-2 hover:bg-slate-100 rounded-full text-[#b90041] cursor-pointer transition-colors"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div
              onClick={() => onNavigate('driver_dashboard')}
              className="cursor-pointer"
            >
              <h1 className="font-extrabold tracking-tight text-base sm:text-lg text-[#b90041] leading-none">
                Live Active Navigation GPS
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Order #MSH-99281 • Koramangala
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('order_driver')}
              className="px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#b90041] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>Order Details</span>
            </button>
            <button
              onClick={() => onNavigate('swiftroute')}
              className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">route</span>
              <span>Multi-Stop</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live GPS Route Canvas (7 or 8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Live Navigation Canvas Card */}
            <div className="relative h-[420px] sm:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden shadow-md border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80"
                alt="Live Navigation Map"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

              {/* Turn-by-Turn Instruction Banner */}
              <div className="absolute top-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                    <span className="material-symbols-outlined text-2xl">turn_left</span>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                      In 350 meters
                    </p>
                    <p className="font-extrabold text-sm sm:text-base">
                      Turn Left on 24th Main Road (Near Star Market)
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs text-slate-400 block font-bold">Speed</span>
                  <span className="text-sm font-black text-emerald-400">32 km/h</span>
                </div>
              </div>

              {/* Interactive Route Pins */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Pickup Marker */}
                <div className="absolute top-[32%] left-[26%] flex flex-col items-center">
                  <div className="bg-[#b90041] text-white p-2.5 rounded-full shadow-2xl scale-105 border-2 border-white">
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      inventory_2
                    </span>
                  </div>
                  <div className="bg-white/95 px-2.5 py-0.5 mt-1 rounded-md shadow-md border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-[#b90041]">
                      Pickup Hub
                    </span>
                  </div>
                </div>

                {/* Drop Marker */}
                <div className="absolute bottom-[28%] right-[24%] flex flex-col items-center">
                  <div className="bg-[#008644] text-white p-3 rounded-full shadow-2xl scale-120 border-4 border-white animate-bounce">
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                  </div>
                  <div className="bg-white/95 px-2.5 py-0.5 mt-1 rounded-md shadow-md border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-[#008644]">
                      Drop: Skyview Apt
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Re-center & Map Tools */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b90041] text-lg">
                    directions_bike
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    2.4 km remaining • ETA 12 mins
                  </span>
                </div>
                <button
                  onClick={() => triggerToast('Re-centering route view to bike GPS location...')}
                  className="bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-1.5 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base text-[#b90041]">explore</span>
                  <span>RE-CENTER</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Manifest & Delivery Completion Drawer (4 or 5 cols on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              {/* Primary Order Info */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-[#008644] rounded-md uppercase">
                      PREPAID
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Order #MSH-99281</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#1c1b1b]">
                    Ananya Sharma
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-[#b90041]">home</span>
                    <span>Flat 402, 4th Floor, Skyview Apt</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#008644]">₹45.00</span>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Payout</span>
                </div>
              </div>

              {/* Items & Special Instructions */}
              <div className="space-y-2.5">
                <div className="bg-[#fcf9f8] p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Package Items:</span>
                  <span className="font-extrabold text-[#1c1b1b]">2x Silk Saree, 1x Box</span>
                </div>
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-xs">
                  <p className="font-bold text-amber-900">Instruction:</p>
                  <p className="text-amber-800 mt-0.5">
                    Leave package with security gate if customer unavailable.
                  </p>
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => triggerToast('Calling customer Ananya (+91 98765 43210)... 📞')}
                  className="py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#b90041]">call</span>
                  <span>Call Customer</span>
                </button>
                <button
                  onClick={() => onNavigate('order_driver')}
                  className="py-3 bg-pink-50 hover:bg-pink-100 text-[#b90041] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">receipt_long</span>
                  <span>Manifest</span>
                </button>
              </div>

              {/* Mark Delivered Button */}
              <button
                onClick={handleOpenDeliveryModal}
                disabled={isDelivered}
                className={`w-full py-4 rounded-2xl font-black text-xs md:text-sm tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  isDelivered
                    ? 'bg-[#008644] text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-green-600/30 active:scale-98'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isDelivered ? 'verified' : 'task_alt'}
                </span>
                <span>
                  {isDelivered ? 'DELIVERY COMPLETE (CREDITED)' : 'TAP TO MARK DELIVERED'}
                </span>
              </button>
            </div>
          </div>
        </div>
            {/* Customer Delivery OTP Verification Modal (Prepaid Order Handover) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <h3 className="font-black text-slate-900 text-base">Delivery OTP Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs">
                <div className="flex items-center justify-between font-black text-emerald-900 mb-1">
                  <span>PREPAID ORDER</span>
                  <span>Order #MSH-99281</span>
                </div>
                <p className="text-emerald-800">
                  Customer Ananya Sharma was sent a 4-digit Delivery OTP via SMS. Please ask the customer and enter it below:
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Enter 4-Digit Customer OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="• • • •"
                  value={driverOtp}
                  onChange={(e) => {
                    setDriverOtp(e.target.value.replace(/\D/g, ''));
                    setOtpError('');
                  }}
                  className="w-full h-12 text-center text-2xl font-black tracking-widest bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {otpError && (
                <p className="text-xs font-bold text-red-600 text-center">{otpError}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Customer OTP: {expectedOtp}</span>
                <button
                  type="button"
                  onClick={handleResendCustomerSms}
                  className="text-[11px] font-bold text-[#b90041] hover:underline"
                >
                  Resend SMS OTP 📱
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtpAndDeliver}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-colors"
                >
                  Confirm Handover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />
    </div>
  );
}