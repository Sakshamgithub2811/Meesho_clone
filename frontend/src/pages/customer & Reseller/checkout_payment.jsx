import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

export default function CheckoutPayment({ onNavigate = () => {}, onBack }) {
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isReselling, setIsReselling] = useState(true);
  const [marginAmount, setMarginAmount] = useState(150);
  const [basePrice] = useState(1099);
  const [firstOrderDiscount] = useState(100);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const finalAmount = basePrice - firstOrderDiscount;
  const customerInvoiceTotal = isReselling ? finalAmount + Number(marginAmount || 0) : finalAmount;

  const handleConfirmOrder = () => {
    setIsOrderConfirmed(true);
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] font-sans antialiased min-h-screen pb-36 selection:bg-pink-100 selection:text-pink-600">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : onNavigate('address'))}
              className="p-2 rounded-full hover:bg-slate-100 active:scale-95 text-[#FF3F6C] cursor-pointer transition-colors"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-[#191C1E] leading-none">
                Payment &amp; Final Review
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Step 3 of 3 • 100% Secure Checkout
              </span>
            </div>
          </div>

          {/* Stepper (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400">
            <span
              onClick={() => onNavigate('cart')}
              className="text-[#008644] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="w-5 h-5 rounded-full bg-[#008644] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              Cart
            </span>
            <span>─────</span>
            <span
              onClick={() => onNavigate('address')}
              className="text-[#008644] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="w-5 h-5 rounded-full bg-[#008644] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              Address
            </span>
            <span>─────</span>
            <span className="text-[#FF3F6C] font-extrabold flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-[#FF3F6C] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              Payment
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Address Summary, Payment Options, Reseller Margin (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Address Summary Card */}
            <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#FF3F6C]">
                    location_on
                  </span>
                  Delivering To
                </h2>
                <button
                  onClick={() => onNavigate('address')}
                  className="text-[#FF3F6C] font-bold text-xs px-3 py-1 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  Change Address
                </button>
              </div>
              <div className="space-y-0.5 pt-1">
                <p className="font-extrabold text-sm sm:text-base text-[#191c1e]">
                  Priya Sharma • <span className="text-xs text-slate-500 font-semibold">+91 98765 43210</span>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Flat 402, Lotus Apartments, 24th Main, Sector 15, HSR Layout, Bengaluru, Karnataka - 560102
                </p>
              </div>
            </section>

            {/* Payment Method Selection */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Select Payment Mode
              </h2>
              <div className="space-y-3">
                {/* Cash on Delivery */}
                <div
                  onClick={() => {
                    setSelectedPayment('cod');
                    triggerToast('Selected Cash on Delivery (COD)');
                  }}
                  className={`p-4 sm:p-5 rounded-3xl shadow-sm flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all ${
                    selectedPayment === 'cod'
                      ? 'bg-white ring-2 ring-[#FF3F6C]'
                      : 'bg-white hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-[#FF3F6C] text-white px-3 py-0.5 rounded-bl-xl text-[9px] font-black uppercase tracking-wider">
                    Recommended for Resellers
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPayment === 'cod'
                        ? 'border-[#FF3F6C] bg-[#FF3F6C]'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedPayment === 'cod' && (
                      <span className="material-symbols-outlined text-white text-xs">check</span>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-green-50 text-[#008644] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">payments</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm text-[#191c1e]">
                      Cash on Delivery (Pay at Doorstep)
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No online transaction required. Pay cash/UPI on delivery.
                    </p>
                  </div>
                </div>

                {/* UPI Instant */}
                <div
                  onClick={() => {
                    setSelectedPayment('upi');
                    triggerToast('Selected UPI Payment');
                  }}
                  className={`p-4 sm:p-5 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer transition-all ${
                    selectedPayment === 'upi'
                      ? 'bg-white ring-2 ring-[#FF3F6C]'
                      : 'bg-white hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPayment === 'upi'
                        ? 'border-[#FF3F6C] bg-[#FF3F6C]'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedPayment === 'upi' && (
                      <span className="material-symbols-outlined text-white text-xs">check</span>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm text-[#191c1e]">
                      UPI Instant (Google Pay, PhonePe, Paytm)
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Instant 1-click payment with 0% extra gateway fees.
                    </p>
                  </div>
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => {
                    setSelectedPayment('card');
                    triggerToast('Selected Credit / Debit Card');
                  }}
                  className={`p-4 sm:p-5 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer transition-all ${
                    selectedPayment === 'card'
                      ? 'bg-white ring-2 ring-[#FF3F6C]'
                      : 'bg-white hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPayment === 'card'
                        ? 'border-[#FF3F6C] bg-[#FF3F6C]'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedPayment === 'card' && (
                      <span className="material-symbols-outlined text-white text-xs">check</span>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm text-[#191c1e]">
                      Credit / Debit Card / Net Banking
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Visa, MasterCard, RuPay, Maestro accepted.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reseller Margin Configuration */}
            <section className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-5 sm:p-6 rounded-3xl border border-indigo-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-black text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">trending_up</span>
                    <span>Reselling this Order to a Customer?</span>
                  </h2>
                  <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                    Set your custom profit margin. The customer bill will show your final price.
                  </p>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => setIsReselling(!isReselling)}
                  className={`w-13 h-7 rounded-full transition-colors cursor-pointer relative p-0.5 flex-shrink-0 ${
                    isReselling ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      isReselling ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isReselling && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1 uppercase tracking-wider">
                      Your Margin Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-700 text-lg">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={marginAmount}
                        onChange={(e) => setMarginAmount(Number(e.target.value))}
                        className="w-full bg-white border border-indigo-200 rounded-2xl py-3 pl-9 pr-4 font-black text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white/90 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">
                        Customer Invoice Total:
                      </span>
                      <span className="text-xs text-emerald-600 font-bold">
                        (Supplier Price ₹{finalAmount} + Margin ₹{marginAmount})
                      </span>
                    </div>
                    <span className="font-black text-indigo-900 text-lg sm:text-xl">
                      ₹{customerInvoiceTotal}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Price Breakdown & Order Confirmation CTA (5 cols, sticky) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* Price Details Breakdown */}
            <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
                Payment Summary
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Product Charges</span>
                  <span className="font-bold text-[#191c1e]">₹{basePrice}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="text-[#008644] font-extrabold bg-green-50 px-2 py-0.5 rounded">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>First Order Promotional Discount</span>
                  <span className="text-[#FF3F6C] font-bold">-₹{firstOrderDiscount}</span>
                </div>
                <div className="pt-3 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
                  <span className="font-black text-[#191c1e] text-base">You Pay (Prepaid/COD)</span>
                  <span className="font-black text-2xl text-[#FF3F6C]">₹{finalAmount}</span>
                </div>
              </div>

              {/* Product Preview Thumbnail Hint */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-12 h-14 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&auto=format&fit=crop&q=80"
                    alt="Product Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-[#191c1e] line-clamp-1">
                    Floral Embroidered Georgette Kurti Set
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Qty: 1 • Size: M</p>
                </div>
              </div>

              {/* Confirm Order CTA */}
              <button
                onClick={handleConfirmOrder}
                className="w-full py-4 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white font-black text-base rounded-2xl shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Confirm &amp; Place Order</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </section>

            {/* Guarantees */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-3xl text-xs space-y-1 text-emerald-900">
              <span className="font-extrabold flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                MShoppy Trust Guarantee
              </span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Free replacements &amp; easy 7-day doorstep returns if product doesn't match description.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Order Confirmed Modal */}
      {isOrderConfirmed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-18 h-18 bg-green-100 text-[#008644] rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <h3 className="text-2xl font-black text-[#191c1e] mb-1">Order Confirmed! 🎉</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Paid via <span className="font-bold uppercase text-[#FF3F6C]">{selectedPayment}</span>.
              Estimated delivery by tomorrow evening!
            </p>
            {isReselling && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 mb-4 text-xs text-indigo-900 font-extrabold">
                Reseller Margin of ₹{marginAmount} will be transferred to your account!
              </div>
            )}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsOrderConfirmed(false);
                  onNavigate('/orders');
                }}
                className="w-full bg-[#FF3F6C] hover:bg-[#e02d58] text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-pink-500/30 cursor-pointer transition-all uppercase tracking-wider"
              >
                Track in My Orders 📦
              </button>
              <button
                onClick={() => {
                  setIsOrderConfirmed(false);
                  onNavigate('reseller');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="cart" onNavigate={onNavigate} />
    </div>
  );
}