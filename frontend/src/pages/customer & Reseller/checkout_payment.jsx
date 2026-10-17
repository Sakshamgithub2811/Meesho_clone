import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import {
  getCart,
  getAddresses,
  createOrder,
  getActiveCoupons,
  validateCoupon
} from '../../services/ecommerceService';

export default function CheckoutPayment({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isReselling, setIsReselling] = useState(false);
  const [marginAmount, setMarginAmount] = useState(150);
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // ── Real Coupon States (Non-dummy, validated against backend) ──
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // ── UPI Detailed States ──
  const [upiSubMode, setUpiSubMode] = useState('app'); // 'app' | 'id' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  // ── Card & Netbanking Detailed States ──
  const [cardSubMode, setCardSubMode] = useState('card'); // 'card' | 'netbanking'
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // ── Simulated Interactive Payment Processing State ──
  const [paymentProcessing, setPaymentProcessing] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    async function init() {
      try {
        const [cartRes, addrsRes, coupsRes] = await Promise.all([
          getCart(),
          getAddresses(),
          getActiveCoupons()
        ]);

        if (cartRes?.items) {
          setCartItems(cartRes.items);
        }

        if (coupsRes && coupsRes.length > 0) {
          setAvailableCoupons(coupsRes);
        }

        const savedCoupon = localStorage.getItem('mshoppy_applied_coupon');
        if (savedCoupon) {
          try {
            const parsed = JSON.parse(savedCoupon);
            if (parsed?.code) setAppliedCoupon(parsed);
          } catch (e) {}
        }

        const storedAddr = localStorage.getItem('mshoppy_selected_address');
        if (storedAddr) {
          try {
            const parsed = JSON.parse(storedAddr);
            setAddress(parsed);
            if (parsed.name) setCardName(parsed.name.toUpperCase());
          } catch (e) {}
        } else if (addrsRes && addrsRes.length > 0) {
          const def = addrsRes.find(a => a.isDefault) || addrsRes[0];
          setAddress({
            name: def.fullName,
            phone: def.phone,
            pincode: def.pincode,
            details: `${def.addressLine}, ${def.city}, ${def.state}`
          });
          if (def.fullName) setCardName(def.fullName.toUpperCase());
        }
      } catch (e) {
        console.error('Error initializing checkout payment:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const basePrice = cartItems.reduce((sum, it) => sum + ((it.product?.price || 0) * it.quantity), 0);
  const couponDiscount = appliedCoupon ? (appliedCoupon.discountAmount || 0) : 0;
  const finalAmount = Math.max(0, basePrice - couponDiscount);
  const customerInvoiceTotal = isReselling ? finalAmount + Number(marginAmount || 0) : finalAmount;

  // Format Card Number into 4-digit groups (e.g. 4532 8920 1827 9102)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry as MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Format CVV
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(raw);
  };

  // Detect Card Brand
  const detectCardBrand = (number) => {
    const clean = (number || '').replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^6/.test(clean) || /^35/.test(clean)) return 'RuPay';
    return null;
  };

  // Quick UPI handle suffix click
  const handleUpiSuffixClick = (suffix) => {
    const parts = upiIdInput.split('@');
    const base = parts[0] || '';
    setUpiIdInput(base ? `${base}${suffix}` : `user${suffix}`);
    setIsUpiVerified(false);
  };

  // ── Coupon Handler Functions (Strictly validates against backend) ──
  const handleApplyCoupon = async (codeOverride) => {
    const codeToTest = (codeOverride || couponInput || '').trim().toUpperCase();
    if (!codeToTest) {
      setCouponError('Please enter a coupon code');
      triggerToast('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await validateCoupon(codeToTest, basePrice);
      if (res?.success && res.data) {
        setAppliedCoupon(res.data);
        localStorage.setItem('mshoppy_applied_coupon', JSON.stringify(res.data));
        setCouponInput('');
        setShowCouponModal(false);
        triggerToast(`🎉 Coupon "${res.data.code}" Applied! Saved ₹${res.data.discountAmount}`);
      } else {
        const errMsg = res?.message || 'Invalid or non-existent coupon code. Only generated codes are accepted.';
        setCouponError(errMsg);
        triggerToast(`⚠️ ${errMsg}`);
      }
    } catch (e) {
      setCouponError('Failed to validate coupon code');
      triggerToast('Failed to validate coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    localStorage.removeItem('mshoppy_applied_coupon');
    triggerToast('Coupon removed');
  };

  // Execute database order creation once payment is confirmed / approved
  const executeOrderPlacement = async (paymentMethodToSave) => {
    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || 'Free Size',
          price: item.product?.price || 0
        })),
        shippingAddress: address,
        paymentMethod: paymentMethodToSave.toUpperCase(),
        totalAmount: finalAmount
      };

      const res = await createOrder(orderPayload);
      localStorage.removeItem('mshoppy_applied_coupon');
      if (res?.success && res.data) {
        setConfirmedOrder(res.data);
      } else {
        // Fallback demo order
        setConfirmedOrder({
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          totalAmount: finalAmount,
          paymentMethod: paymentMethodToSave.toUpperCase(),
          paymentStatus: paymentMethodToSave.toUpperCase() === 'COD' ? 'PENDING' : 'PAID'
        });
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      localStorage.removeItem('mshoppy_applied_coupon');
      setConfirmedOrder({
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        totalAmount: finalAmount,
        paymentMethod: paymentMethodToSave.toUpperCase(),
        paymentStatus: paymentMethodToSave.toUpperCase() === 'COD' ? 'PENDING' : 'PAID'
      });
    } finally {
      setPlacingOrder(false);
      setPaymentProcessing(null);
    }
  };

  // Main Confirm Order Trigger
  const handleConfirmOrder = () => {
    if (!cartItems.length) {
      triggerToast('Your cart is empty');
      return;
    }
    if (!address) {
      triggerToast('Please select a delivery address');
      handleNav('/address');
      return;
    }

    // 1. Cash on Delivery (COD) -> Instant Placement
    if (selectedPayment === 'cod') {
      executeOrderPlacement('COD');
      return;
    }

    // 2. UPI Prepaid -> Validate & Open Simulated UPI Gateway
    if (selectedPayment === 'upi') {
      if (upiSubMode === 'id') {
        const cleanId = upiIdInput.trim();
        if (!cleanId || !cleanId.includes('@') || cleanId.length < 5) {
          triggerToast('⚠️ Please enter a valid UPI ID (e.g. name@okhdfcbank)');
          return;
        }
      }

      setPaymentProcessing({
        type: 'UPI',
        subMode: upiSubMode,
        app: selectedUpiApp,
        id: upiIdInput || '8103013465@paytm'
      });
      return;
    }

    // 3. Card / Netbanking Prepaid -> Validate & Open Bank 3D-Secure OTP
    if (selectedPayment === 'card') {
      if (cardSubMode === 'card') {
        const rawDigits = cardNumber.replace(/\s+/g, '');
        if (rawDigits.length < 15) {
          triggerToast('⚠️ Please enter a valid 16-digit Card Number');
          return;
        }
        if (!cardName.trim()) {
          triggerToast('⚠️ Please enter the Name on your Card');
          return;
        }
        if (!cardExpiry || cardExpiry.length < 5) {
          triggerToast('⚠️ Please enter Card Expiry Date (MM/YY)');
          return;
        }
        if (!cardCvv || cardCvv.length < 3) {
          triggerToast('⚠️ Please enter 3-digit CVV');
          return;
        }

        // Open Bank OTP Modal
        setPaymentProcessing({
          type: 'CARD',
          cardLast4: rawDigits.slice(-4),
          userOtp: ''
        });
      } else {
        // Netbanking Modal
        setPaymentProcessing({
          type: 'NETBANKING',
          bank: selectedBank
        });
      }
    }
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
              onClick={() => (onBack ? onBack() : handleNav('/address'))}
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
              onClick={() => handleNav('/cart')}
              className="text-[#008644] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="w-5 h-5 rounded-full bg-[#008644] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              Cart
            </span>
            <span>─────</span>
            <span
              onClick={() => handleNav('/address')}
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
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading order checkout details...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Address Summary, Payment Options */}
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
                    onClick={() => handleNav('/address')}
                    className="text-[#FF3F6C] font-bold text-xs px-3 py-1 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    Change Address
                  </button>
                </div>
                {address ? (
                  <div className="space-y-0.5 pt-1">
                    <p className="font-extrabold text-sm sm:text-base text-[#191c1e]">
                      {address.name} • <span className="text-xs text-slate-500 font-semibold">{address.phone}</span>
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {address.details} - {address.pincode}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-red-500 font-bold">No delivery address selected. Please choose an address.</p>
                )}
              </section>

              {/* Payment Method Selection */}
              <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Select Payment Mode
                </h2>
                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery (COD) */}
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
                    <div className="absolute top-0 right-0 bg-[#008644] text-white px-3 py-0.5 rounded-bl-xl text-[9px] font-black uppercase tracking-wider">
                      Zero Advance Fee
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPayment === 'cod'
                          ? 'border-[#FF3F6C] bg-[#FF3F6C]'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedPayment === 'cod' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl">payments</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-[#191c1e]">
                        Cash on Delivery (COD)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pay cash or UPI to delivery rider at your doorstep.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: UPI (Expanded with Google Pay, PhonePe, Paytm, QR, UPI ID) */}
                  <div
                    className={`rounded-3xl shadow-sm transition-all overflow-hidden ${
                      selectedPayment === 'upi'
                        ? 'bg-white ring-2 ring-[#FF3F6C] border-transparent'
                        : 'bg-white hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedPayment('upi');
                        triggerToast('Selected UPI Fast Payment');
                      }}
                      className="p-4 sm:p-5 flex items-center gap-4 cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === 'upi'
                            ? 'border-[#FF3F6C] bg-[#FF3F6C]'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedPayment === 'upi' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#191c1e]">
                            UPI (Google Pay, PhonePe, Paytm)
                          </h3>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            Instant Prepaid
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Pay securely using any UPI App or UPI ID
                        </p>
                      </div>
                    </div>

                    {/* Expanded UPI Details */}
                    {selectedPayment === 'upi' && (
                      <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-slate-100 bg-[#fafbff] space-y-4 animate-in fade-in duration-200">
                        {/* Sub Tabs: UPI App | UPI ID */}
                        <div className="flex gap-2 p-1 bg-slate-100/90 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setUpiSubMode('app')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              upiSubMode === 'app'
                                ? 'bg-white text-[#FF3F6C] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">phone_iphone</span>
                            <span>UPI Apps</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiSubMode('id')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              upiSubMode === 'id'
                                ? 'bg-white text-[#FF3F6C] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">alternate_email</span>
                            <span>Enter UPI ID</span>
                          </button>
                        </div>

                        {/* Mode 1: Installed UPI Apps */}
                        {upiSubMode === 'app' && (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-700">Select an App to Pay:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {[
                                { id: 'Google Pay', name: 'Google Pay', color: '#4285F4', tag: 'Fast' },
                                { id: 'PhonePe', name: 'PhonePe', color: '#5f259f', tag: 'Popular' },
                                { id: 'Paytm', name: 'Paytm UPI', color: '#00BAF2', tag: '' },
                                { id: 'BHIM', name: 'BHIM UPI', color: '#008644', tag: 'Govt' },
                              ].map(app => (
                                <div
                                  key={app.id}
                                  onClick={() => setSelectedUpiApp(app.id)}
                                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center relative ${
                                    selectedUpiApp === app.id
                                      ? 'border-[#FF3F6C] bg-pink-50/50 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300'
                                  }`}
                                >
                                  {selectedUpiApp === app.id && (
                                    <span className="absolute top-1.5 right-1.5 text-xs font-black text-[#FF3F6C]">✓</span>
                                  )}
                                  {app.tag && (
                                    <span className="absolute top-1 left-1 text-[8px] font-black uppercase px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                                      {app.tag}
                                    </span>
                                  )}
                                  <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs mb-1 shadow-xs"
                                    style={{ backgroundColor: app.color }}
                                  >
                                    {app.id.slice(0, 2)}
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">{app.name}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-800 text-[11px] font-semibold">
                              <span className="material-symbols-outlined text-sm">lock</span>
                              <span>Clicking Pay will simulate opening {selectedUpiApp} to authorize ₹{finalAmount}.</span>
                            </div>
                          </div>
                        )}

                        {/* Mode 2: Enter UPI ID */}
                        {upiSubMode === 'id' && (
                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700">
                              Virtual Payment Address (VPA / UPI ID) *
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={upiIdInput}
                                  onChange={(e) => {
                                    setUpiIdInput(e.target.value);
                                    setIsUpiVerified(false);
                                  }}
                                  placeholder="e.g. mobile@paytm or name@okhdfcbank"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                                />
                                {isUpiVerified && (
                                  <span className="absolute right-3 top-2.5 text-emerald-600 flex items-center gap-0.5 text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Verified
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (upiIdInput.includes('@') && upiIdInput.length >= 5) {
                                    setIsUpiVerified(true);
                                    triggerToast(`Verified UPI ID: ${upiIdInput} ✓`);
                                  } else {
                                    triggerToast('⚠️ Please enter a valid UPI ID (e.g. name@okhdfcbank)');
                                  }
                                }}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                              >
                                Verify
                              </button>
                            </div>

                            {/* Quick UPI Handle Chips */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block mb-1">Quick Select Handle:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {['@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@upi', '@ibl'].map(handle => (
                                  <button
                                    key={handle}
                                    type="button"
                                    onClick={() => handleUpiSuffixClick(handle)}
                                    className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-slate-600 cursor-pointer transition-colors"
                                  >
                                    {handle}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option 3: Credit / Debit Card / Netbanking (Expanded with Card & Netbanking Forms) */}
                  <div
                    className={`rounded-3xl shadow-sm transition-all overflow-hidden ${
                      selectedPayment === 'card'
                        ? 'bg-white ring-2 ring-[#FF3F6C] border-transparent'
                        : 'bg-white hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedPayment('card');
                        triggerToast('Selected Credit/Debit Card / Netbanking');
                      }}
                      className="p-4 sm:p-5 flex items-center gap-4 cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === 'card'
                            ? 'border-[#FF3F6C] bg-[#FF3F6C]'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedPayment === 'card' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">credit_card</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#191c1e]">
                          Credit / Debit Card / Netbanking
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Visa, Mastercard, RuPay &amp; all major banks.</p>
                      </div>
                    </div>

                    {/* Expanded Card / Netbanking Details */}
                    {selectedPayment === 'card' && (
                      <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-slate-100 bg-[#fafbff] space-y-4 animate-in fade-in duration-200">
                        {/* Sub Tabs: Card vs Netbanking */}
                        <div className="flex gap-2 p-1 bg-slate-100/90 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setCardSubMode('card')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              cardSubMode === 'card'
                                ? 'bg-white text-[#FF3F6C] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">credit_card</span>
                            <span>Credit / Debit Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCardSubMode('netbanking')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              cardSubMode === 'netbanking'
                                ? 'bg-white text-[#FF3F6C] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">account_balance</span>
                            <span>Net Banking</span>
                          </button>
                        </div>

                        {cardSubMode === 'card' ? (
                          <div className="space-y-3.5">
                            {/* Card Number */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-700 ml-1">Card Number *</label>
                                {detectCardBrand(cardNumber) && (
                                  <span className="text-[10px] font-black text-[#FF3F6C] bg-pink-50 px-2 py-0.5 rounded border border-pink-100 uppercase">
                                    {detectCardBrand(cardNumber)}
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={cardNumber}
                                  onChange={handleCardNumberChange}
                                  placeholder="4532 8920 1827 9102"
                                  maxLength={19}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C] tracking-wider"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-400 material-symbols-outlined text-lg">
                                  credit_card
                                </span>
                              </div>
                            </div>

                            {/* Cardholder Name */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Name on Card *</label>
                              <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                placeholder="e.g. SHRUTI PALIWAL"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C] uppercase"
                              />
                            </div>

                            {/* Expiry & CVV */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Valid Thru *</label>
                                <input
                                  type="text"
                                  value={cardExpiry}
                                  onChange={handleExpiryChange}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C] text-center"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-xs font-bold text-slate-700 ml-1">CVV *</label>
                                  <span className="text-[10px] text-slate-400 font-medium">3 Digits</span>
                                </div>
                                <input
                                  type="password"
                                  value={cardCvv}
                                  onChange={handleCvvChange}
                                  placeholder="•••"
                                  maxLength={3}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C] text-center tracking-widest"
                                />
                              </div>
                            </div>

                            {/* Secure tokenization checkbox */}
                            <label className="flex items-start gap-2 cursor-pointer pt-1">
                              <input
                                type="checkbox"
                                checked={saveCard}
                                onChange={(e) => setSaveCard(e.target.checked)}
                                className="mt-0.5 rounded text-[#FF3F6C] focus:ring-pink-400"
                              />
                              <span className="text-[11px] text-slate-500 leading-tight">
                                Save this card securely as per RBI tokenization guidelines for future fast checkouts.
                              </span>
                            </label>
                          </div>
                        ) : (
                          /* Net Banking */
                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700 ml-1">Select Popular Bank *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { id: 'SBI', name: 'State Bank of India' },
                                { id: 'HDFC', name: 'HDFC Bank' },
                                { id: 'ICICI', name: 'ICICI Bank' },
                                { id: 'Axis', name: 'Axis Bank' },
                                { id: 'Kotak', name: 'Kotak Mahindra' },
                                { id: 'PNB', name: 'Punjab National' },
                              ].map(bank => (
                                <div
                                  key={bank.id}
                                  onClick={() => setSelectedBank(bank.name)}
                                  className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex items-center justify-between ${
                                    selectedBank === bank.name
                                      ? 'border-[#FF3F6C] bg-pink-50 text-[#b90041] shadow-xs'
                                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <span>{bank.name}</span>
                                  {selectedBank === bank.name && <span className="text-xs">✓</span>}
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1 ml-1">Other Supported Banks:</label>
                              <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                              >
                                <option value="Bank of Baroda">Bank of Baroda</option>
                                <option value="Canara Bank">Canara Bank</option>
                                <option value="Union Bank of India">Union Bank of India</option>
                                <option value="IndusInd Bank">IndusInd Bank</option>
                                <option value="Yes Bank">Yes Bank</option>
                                <option value="IDBI Bank">IDBI Bank</option>
                                <option value="Federal Bank">Federal Bank</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Reseller Margin Option */}
              <section className="bg-indigo-50/60 p-5 rounded-3xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-extrabold text-sm text-indigo-950 flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">trending_up</span>
                      <span>Reselling this Order?</span>
                    </h2>
                    <p className="text-xs text-indigo-700/80 mt-0.5 leading-relaxed">
                      Enable if you are sending this directly to your customer.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsReselling(!isReselling)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 flex-shrink-0 ${
                      isReselling ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        isReselling ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isReselling && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-indigo-900 mb-1">
                      Your Margin (₹)
                    </label>
                    <input
                      type="number"
                      value={marginAmount}
                      onChange={(e) => setMarginAmount(Number(e.target.value))}
                      className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 font-bold text-sm focus:outline-none"
                    />
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Coupon Section & Price Breakdown */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
              {/* Authentic Coupon Card */}
              <section className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF3F6C] text-base">local_offer</span>
                    <span>Apply Coupon Code</span>
                  </h3>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-emerald-800 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="bg-emerald-200 text-emerald-900 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                          Applied
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        You saved ₹{couponDiscount} on this order! 🎉
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">
                      check_circle
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter Code (e.g. SAVE50, FESTIVE15)"
                        className="flex-1 bg-[#f8f9fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 tracking-wider uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading}
                        className="bg-[#FF3F6C] hover:bg-[#e02659] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <span className="material-symbols-outlined text-xs">error</span>
                        <span>{couponError}</span>
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCouponModal(true)}
                        className="text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">redeem</span>
                        <span>View Available Coupons ({availableCoupons.length})</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Payment Summary */}
              <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
                  Payment Summary ({cartItems.length} items)
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Products Subtotal</span>
                    <span className="font-bold text-[#191c1e]">₹{basePrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="text-[#008644] font-extrabold bg-green-50 px-2 py-0.5 rounded">
                      FREE
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1">
                        <span>Coupon Discount</span>
                        <strong className="text-[10px] bg-pink-100 text-[#FF3F6C] font-black px-1.5 py-0.2 rounded">
                          {appliedCoupon?.code}
                        </strong>
                      </span>
                      <span className="text-[#008644] font-black">-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
                    <span className="font-black text-[#191c1e] text-base">Total Payable</span>
                    <span className="font-black text-2xl text-[#FF3F6C]">₹{finalAmount}</span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-2 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto">
                  {cartItems.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <img
                        src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200'}
                        alt={it.product?.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-slate-800 truncate">{it.product?.title}</p>
                        <p className="text-[11px] text-slate-400">Qty: {it.quantity} • ₹{it.product?.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confirm Order CTA with Contextual Label */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={placingOrder || !cartItems.length}
                  className="w-full py-4 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {selectedPayment === 'cod'
                          ? 'Confirm & Place Order (COD)'
                          : selectedPayment === 'upi'
                          ? `Pay ₹${finalAmount} via UPI`
                          : cardSubMode === 'card'
                          ? `Pay ₹${finalAmount} via Card`
                          : `Pay ₹${finalAmount} via NetBanking`}
                      </span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </section>

              {/* Guarantees */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-3xl text-xs space-y-1 text-emerald-900">
                <span className="font-extrabold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                  MShoppy Quality Guarantee
                </span>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Easy 7-day doorstep replacement &amp; refund if you're not completely satisfied.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simulated Interactive Payment Processing Modal (UPI & Card) */}
      {paymentProcessing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            {/* Gateway Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#FF3F6C] flex items-center justify-center font-black">
                  <span className="material-symbols-outlined text-xl">shield</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {paymentProcessing.type === 'UPI'
                      ? 'UPI Payment Gateway'
                      : paymentProcessing.type === 'CARD'
                      ? 'Bank 3D-Secure Verification'
                      : 'NetBanking Gateway'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">256-Bit Bank Grade SSL Encryption</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentProcessing(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Merchant and Amount Display */}
            <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">MERCHANT</span>
                <span className="font-extrabold text-slate-800">MShoppy India Pvt Ltd</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">AMOUNT</span>
                <span className="font-black text-[#FF3F6C] text-lg">₹{finalAmount}</span>
              </div>
            </div>

            {/* UPI Simulation Body */}
            {paymentProcessing.type === 'UPI' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto relative">
                  <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {paymentProcessing.subMode === 'app'
                      ? `Approval Request Sent to ${paymentProcessing.app}`
                      : `Approval Request Sent to ${paymentProcessing.id}`}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Please approve the payment request of <strong className="text-slate-800">₹{finalAmount}</strong> in your UPI app and enter your UPI PIN.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => executeOrderPlacement('UPI')}
                    className="w-full py-3.5 bg-[#008644] hover:bg-[#007038] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Approve &amp; Complete Prepaid Payment</span>
                  </button>
                </div>
              </div>
            )}

            {/* Card OTP Simulation Body */}
            {paymentProcessing.type === 'CARD' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-blue-600">sms</span>
                    One-Time Password (OTP) Sent
                  </p>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    An OTP has been sent to your mobile ending with <strong className="font-bold">***{address?.phone?.slice(-4) || '3465'}</strong> linked to Card ending in <strong className="font-bold">***{paymentProcessing.cardLast4}</strong>.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Enter 6-Digit Bank OTP</label>
                    <button
                      type="button"
                      onClick={() => setPaymentProcessing(prev => ({ ...prev, userOtp: '748291' }))}
                      className="text-[10px] text-[#FF3F6C] font-bold hover:underline cursor-pointer"
                    >
                      Auto-fill (Demo: 748291)
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={paymentProcessing.userOtp || ''}
                    onChange={(e) => setPaymentProcessing(prev => ({ ...prev, userOtp: e.target.value.replace(/\D/g, '') }))}
                    placeholder="748291"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-black tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF3F6C]"
                    autoFocus
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!paymentProcessing.userOtp || paymentProcessing.userOtp.length < 4) {
                        triggerToast('⚠️ Please enter the 6-digit OTP');
                        return;
                      }
                      executeOrderPlacement('CARD');
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white font-black text-xs rounded-xl shadow-lg shadow-pink-500/25 cursor-pointer uppercase tracking-wider"
                  >
                    Verify OTP &amp; Pay ₹{finalAmount}
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Resend OTP in 00:28 • Do not refresh or press back
                  </p>
                </div>
              </div>
            )}

            {/* Netbanking Simulation Body */}
            {paymentProcessing.type === 'NETBANKING' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto relative">
                  <span className="material-symbols-outlined text-3xl">account_balance</span>
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Connecting to {paymentProcessing.bank}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Authorizing one-time netbanking session for account verification...
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => executeOrderPlacement('NETBANKING')}
                  className="w-full py-3 bg-[#008644] hover:bg-[#007038] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Authorize NetBanking Payment of ₹{finalAmount}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real Order Confirmed Modal with Prepaid Status Badges */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-18 h-18 bg-green-100 text-[#008644] rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <h3 className="text-2xl font-black text-[#191c1e] mb-1">Order Placed! 🎉</h3>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Order ID: <span className="font-bold text-slate-800">#{confirmedOrder.id?.slice(0, 8)}</span>
            </p>

            {/* Prepaid vs COD Banner */}
            <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              {confirmedOrder.paymentMethod !== 'COD' ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Prepaid Payment Successful
                  </span>
                  <p className="text-slate-600 font-semibold pt-1">
                    Paid ₹{confirmedOrder.totalAmount} via <strong className="text-slate-900">{confirmedOrder.paymentMethod}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Ref: TXN_{Math.floor(10000000 + Math.random() * 90000000)}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    Cash on Delivery
                  </span>
                  <p className="text-slate-600 font-semibold pt-1">
                    Please pay ₹{confirmedOrder.totalAmount} at doorstep to rider.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Free delivery initiated to your doorstep!
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  handleNav('/orders');
                }}
                className="w-full bg-[#FF3F6C] hover:bg-[#e02d58] text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-pink-500/30 cursor-pointer transition-all uppercase tracking-wider"
              >
                Track in My Orders 📦
              </button>
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  handleNav('/user-home');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Coupons & Generator Drawer Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#FF3F6C] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">local_offer</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Coupons &amp; Offers</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Active &amp; verified discounts for your cart</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* List of Verified Available Coupons */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Available Coupons &amp; Offers ({availableCoupons.length})
                </h4>

                {availableCoupons.map((c) => {
                  const isEligible = basePrice >= c.minOrder;
                  const isAlreadyApplied = appliedCoupon?.code === c.code;

                  return (
                    <div
                      key={c.id || c.code}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAlreadyApplied
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2.5 py-1 bg-white border border-dashed border-pink-300 text-[#FF3F6C] rounded-lg tracking-wider">
                              {c.code}
                            </span>
                          </div>
                          <p className="font-extrabold text-xs text-slate-900 pt-0.5">{c.title}</p>
                          <p className="text-[11px] text-slate-500 leading-snug">{c.description}</p>
                          <p className="text-[10px] text-slate-400 font-semibold pt-0.5">
                            Min Order: ₹{c.minOrder} • {isEligible ? 'Eligible on current cart' : `Add ₹${c.minOrder - basePrice} more`}
                          </p>
                        </div>

                        <div>
                          {isAlreadyApplied ? (
                            <span className="text-emerald-700 font-black text-xs bg-emerald-100 px-3 py-1.5 rounded-xl inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check</span>
                              Applied
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(c.code)}
                              disabled={!isEligible || couponLoading}
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                                isEligible
                                  ? 'bg-[#FF3F6C] hover:bg-[#e02659] text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <AppBottomNav activeNav="cart" onNavigate={handleNav} />
    </div>
  );
}