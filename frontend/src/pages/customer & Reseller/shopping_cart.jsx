import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../components/AppBottomNav';
import QuickEmailOtpModal from '../../components/auth/QuickEmailOtpModal';
import {
  toggleWishlist,
  getAddresses,
  saveAddress as apiSaveAddress,
  getActiveCoupons,
  validateCoupon
} from '../../services/ecommerceService';
import { useCart } from '../../hooks/useCart';

export default function ShoppingCart({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const { cart: cartData, updateItem, removeItem, loading: cartLoading, refreshCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(() => {
    try {
      const stored = localStorage.getItem('mshoppy_selected_address');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.pincode && /^[1-9][0-9]{5}$/.test(String(parsed.pincode).trim())) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isUserAuthenticated = () => {
    try {
      const raw = localStorage.getItem('mshoppy_customer_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.email && !u.email.endsWith('@customer.meesho') && !u.isOfflineFallback) return true;
      }
      const token = localStorage.getItem('mshoppy_customer_token');
      if (token && raw) return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleProceedToCheckout = () => {
    if (!isUserAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    handleNav('/address');
  };
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(() => address || {
    name: '',
    phone: '',
    pincode: '',
    details: '',
  });
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Fetch real addresses & coupons on mount
  const loadCartAndAddress = async () => {
    try {
      const [addrs, activeCoups] = await Promise.all([
        getAddresses(),
        getActiveCoupons()
      ]);

      if (addrs && addrs.length > 0) {
        const def = addrs.find(a => a.isDefault) || addrs[0];
        const formatted = {
          name: def.fullName,
          phone: def.phone,
          pincode: def.pincode,
          details: `${def.addressLine}, ${def.city}, ${def.state}`,
        };
        setAddress(formatted);
        setTempAddress(formatted);
      } else {
        localStorage.removeItem('mshoppy_selected_address');
        setAddress(null);
        setTempAddress({
          name: '',
          phone: '',
          pincode: '',
          details: '',
        });
      }

      // Check saved coupon
      const savedCoupon = localStorage.getItem('mshoppy_applied_coupon');
      if (savedCoupon) {
        try {
          const parsed = JSON.parse(savedCoupon);
          if (parsed?.code && parsed?.discountAmount) {
            setAppliedCoupon(parsed.code);
            setCouponDiscount(parsed.discountAmount);
          }
        } catch (e) {}
      }

      if (activeCoups) {
        setAvailableCoupons(activeCoups);
      }
    } catch (e) {
      console.error('Failed to load cart context:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartAndAddress();
  }, []);

  const handleUpdateQuantity = async (itemId, delta, currentQty) => {
    const nextQty = Math.max(1, currentQty + delta);
    if (nextQty === currentQty) return;

    try {
      await updateItem(itemId, nextQty);
      triggerToast('Cart quantity updated! 🛒');
    } catch (e) {
      triggerToast('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      triggerToast('Item removed from cart');
    } catch (e) {
      triggerToast('Failed to remove item');
    }
  };

  const handleMoveToWishlist = async (item) => {
    try {
      if (item.productId) {
        await toggleWishlist(item.productId);
      }
      await removeItem(item.id);
      triggerToast(`Moved to Wishlist ❤️`);
    } catch (e) {
      triggerToast('Moved to Wishlist ❤️');
    }
  };

  const handleApplyCoupon = async (code) => {
    const codeToApply = (code || couponCode || '').trim().toUpperCase();
    if (!codeToApply) {
      triggerToast('Please enter a coupon code');
      return;
    }
    try {
      const res = await validateCoupon(codeToApply, rawProductTotal);
      if (res?.success && res.data) {
        setAppliedCoupon(res.data.code);
        setCouponDiscount(res.data.discountAmount);
        setCouponCode('');
        localStorage.setItem('mshoppy_applied_coupon', JSON.stringify(res.data));
        setShowCouponsModal(false);
        triggerToast(`🎉 Coupon "${res.data.code}" Applied! Saved ₹${res.data.discountAmount}`);
      } else {
        triggerToast(res?.message || 'Invalid coupon code. Only generated codes are accepted.');
      }
    } catch (e) {
      triggerToast('Failed to validate coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem('mshoppy_applied_coupon');
    triggerToast('Coupon removed');
  };

  const items = cartData.items || [];
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamic Affiliate Margin Support (e.g. ₹849 + ₹150 = ₹999)
  const affiliateMargin = Number(localStorage.getItem('mshoppy_affiliate_margin') || 0);

  const totalMRP = items.reduce((acc, item) => {
    const orig = item.product?.originalPrice || item.product?.price || 0;
    return acc + (orig + (affiliateMargin > 0 ? affiliateMargin : 0)) * item.quantity;
  }, 0);

  const rawProductTotal = items.reduce((acc, item) => {
    const baseP = item.product?.price || 0;
    const effP = baseP + (affiliateMargin > 0 ? affiliateMargin : 0);
    return acc + effP * item.quantity;
  }, 0);
  const totalAmount = Math.max(0, rawProductTotal - (items.length > 0 ? couponDiscount : 0));
  const totalDiscount = totalMRP - rawProductTotal + (items.length > 0 ? couponDiscount : 0);

  const saveAddress = async (e) => {
    e.preventDefault();
    const cleanPin = tempAddress?.pincode ? String(tempAddress.pincode).trim() : '';
    if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      triggerToast('Please enter a valid 6-digit Indian Pincode');
      return;
    }
    try {
      const payload = {
        fullName: tempAddress?.name || 'Valued Customer',
        phone: tempAddress?.phone || '9999999999',
        pincode: cleanPin,
        addressLine: tempAddress?.details || 'Street Address',
        city: tempAddress?.city || 'City',
        state: tempAddress?.state || 'State',
        isDefault: true
      };
      const res = await apiSaveAddress(payload);
      const saved = res?.data || payload;
      const updated = {
        id: saved.id,
        name: saved.fullName,
        phone: saved.phone,
        pincode: saved.pincode,
        details: `${saved.addressLine}, ${saved.city}, ${saved.state}`
      };
      setAddress(updated);
      setIsChangingAddress(false);
      triggerToast('Delivery address saved to database! 📍');
    } catch (err) {
      console.error('Error saving address:', err);
      triggerToast(err.message || 'Failed to save address');
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] font-sans antialiased min-h-screen pb-32 selection:bg-pink-100 selection:text-pink-600">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-xs border-b border-gray-100">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : handleNav('/user-home'))}
              className="p-2 rounded-full hover:bg-slate-100 active:scale-95 text-[#191C1E] cursor-pointer transition-colors"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-[#191C1E]">
                Shopping Cart
              </h1>
              {items.length > 0 && (
                <span className="bg-pink-50 text-[#FF3F6C] font-black text-xs px-2.5 py-0.5 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>

          {/* Stepper (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="text-[#FF3F6C] font-extrabold flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-[#FF3F6C] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Cart
            </span>
            <span>─────</span>
            <span className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                2
              </span>
              Address
            </span>
            <span>─────</span>
            <span className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                3
              </span>
              Payment
            </span>
          </div>

          {/* 100% Safe Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>100% Safe</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold text-slate-400">Loading your cart...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto space-y-4 my-8">
            <div className="w-20 h-20 bg-pink-50 text-[#FF3F6C] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-4xl">shopping_cart</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#191c1e]">Your Shopping Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Add top trending products with free delivery &amp; cash on delivery options!
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleNav('/user-home')}
                className="bg-[#FF3F6C] hover:bg-[#e02659] text-white px-6 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-pink-500/25 active:scale-95 transition-transform cursor-pointer"
              >
                Browse Products ➔
              </button>
              <button
                onClick={() => handleNav('/wishlist')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-black text-xs transition-colors cursor-pointer"
              >
                View Wishlist ❤️
              </button>
            </div>
          </div>
        ) : (
          /* 2-Column Responsive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Delivery Address & Cart Items */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Delivery Address Preview Card */}
              <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                {address && address.pincode ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="bg-pink-50 text-[#FF3F6C] p-2.5 rounded-2xl h-max flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          location_on
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-[#191c1e]">
                            Deliver to: {address.name || 'Recipient'}
                          </p>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-md">
                            {address.pincode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {address.details || `Pincode: ${address.pincode}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTempAddress(address);
                        setIsChangingAddress(true);
                      }}
                      className="text-[#FF3F6C] text-xs font-bold uppercase tracking-wider px-3.5 py-2 bg-pink-50 hover:bg-pink-100 rounded-xl cursor-pointer transition-colors whitespace-nowrap"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-50 text-[#FF3F6C] p-2.5 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">add_location_alt</span>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#191c1e]">Delivery Address Not Set</p>
                        <p className="text-xs text-slate-400 mt-0.5">Add your pincode &amp; address for accurate delivery time</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTempAddress({ name: '', phone: '', pincode: '', details: '' });
                        setIsChangingAddress(true);
                      }}
                      className="bg-[#FF3F6C] hover:bg-[#e02659] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </section>

              {/* Items List Header */}
              <div className="flex items-center justify-between px-1">
                <h2 className="font-black text-base text-slate-800 tracking-tight">
                  Cart Items ({totalItemsCount})
                </h2>
                <button
                  onClick={() => handleNav('/user-home')}
                  className="text-xs font-bold text-[#FF3F6C] hover:underline cursor-pointer"
                >
                  + Add More Items
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => {
                  const prod = item.product || {};
                  const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400';
                  const itemTotal = prod.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:border-pink-200 transition-all group"
                    >
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                        {/* Product Thumbnail */}
                        <div
                          onClick={() => handleNav(`/product?id=${prod.id}`)}
                          className="relative w-full sm:w-28 sm:h-36 h-48 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer"
                        >
                          <img
                            src={img}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between space-y-2 sm:space-y-0">
                          <div>
                            <h3
                              onClick={() => handleNav(`/product?id=${prod.id}`)}
                              className="font-extrabold text-sm sm:text-base text-[#191c1e] line-clamp-2 leading-snug cursor-pointer hover:text-[#FF3F6C] transition-colors"
                            >
                              {prod.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                                Size: <strong className="text-slate-800">{item.size || 'Free Size'}</strong>
                              </span>
                              {prod.supplierName && (
                                <span className="text-[11px] text-slate-400">
                                  Seller: <strong className="text-slate-600">{prod.supplierName.toLowerCase().includes('meesho') ? 'Official Store' : prod.supplierName}</strong>
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="font-black text-lg text-slate-900">
                                ₹{prod.price + (affiliateMargin > 0 ? affiliateMargin : 0)}
                              </span>
                              {prod.originalPrice && prod.originalPrice > prod.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{prod.originalPrice}
                                </span>
                              )}
                              {prod.discountPercentage > 0 && (
                                <span className="text-xs font-bold text-[#FF3F6C]">
                                  {prod.discountPercentage}% OFF
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, -1, item.quantity)}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs hover:bg-slate-200 active:scale-95 disabled:opacity-40 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-extrabold text-xs text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, 1, item.quantity)}
                                className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs hover:bg-slate-200 active:scale-95 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleMoveToWishlist(item)}
                                className="text-xs font-bold text-slate-500 hover:text-[#FF3F6C] flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">favorite</span>
                                <span>Save for Later</span>
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5">
              {/* Coupon Section */}
              <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#FF3F6C]">sell</span>
                    Apply Coupon
                  </h3>
                  {appliedCoupon && (
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-emerald-800 tracking-wider">
                        {appliedCoupon} APPLIED
                      </span>
                      <p className="text-[11px] text-emerald-600 mt-0.5">
                        ₹{couponDiscount} discount applied to cart
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-xl">
                      check_circle
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter Coupon (e.g. SAVE50, FESTIVE15)"
                        className="flex-1 bg-[#f8f9fb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 uppercase tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="bg-[#FF3F6C] hover:bg-[#e02659] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-xs cursor-pointer uppercase tracking-wider"
                      >
                        Apply
                      </button>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCouponsModal(true)}
                        className="text-xs font-bold text-[#FF3F6C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">redeem</span>
                        <span>Available Coupons ({availableCoupons.length})</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Price Details Card */}
              <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-[#191c1e] border-b border-slate-100 pb-3 uppercase tracking-wider">
                  Price Details ({totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'})
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Total Product MRP</span>
                    <span className="font-bold text-[#191c1e]">₹{totalMRP}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Discount on MRP</span>
                    <span className="text-[#008644] font-extrabold">
                      -₹{totalMRP - rawProductTotal}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Coupon Discount</span>
                      <span className="text-[#008644] font-extrabold">-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="text-[#008644] font-extrabold bg-green-50 px-2 py-0.5 rounded">
                      FREE
                    </span>
                  </div>

                  <div className="pt-3 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
                    <span className="font-black text-[#191c1e] text-base">Total Payable</span>
                    <span className="font-black text-2xl text-[#FF3F6C]">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Savings Pill */}
                {totalDiscount > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5 text-[#006a34]">
                    <span className="material-symbols-outlined text-xl">savings</span>
                    <p className="text-xs font-bold leading-tight">
                      You are saving ₹{totalDiscount} on this order!
                    </p>
                  </div>
                )}

                {/* Desktop Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white font-black text-base rounded-2xl shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>Proceed to Checkout</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Edit Address Modal */}
      {isChangingAddress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-[#191c1e]">Edit Delivery Address</h3>
              <button
                onClick={() => setIsChangingAddress(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveAddress} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={tempAddress.name}
                  onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={tempAddress.phone}
                  onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={tempAddress.pincode || ''}
                  onChange={(e) => setTempAddress({ ...tempAddress, pincode: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Street Address &amp; House Details
                </label>
                <textarea
                  rows={3}
                  value={tempAddress.details}
                  onChange={(e) => setTempAddress({ ...tempAddress, details: e.target.value })}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingAddress(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#FF3F6C] hover:bg-[#e02659] text-white font-bold text-xs shadow-md shadow-pink-500/25 cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Checkout Bar */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.08)] p-4 border-t border-slate-100 z-40">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Total Payable
              </span>
              <span className="font-black text-xl text-[#191c1e]">₹{totalAmount}</span>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="flex-1 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white h-12 rounded-2xl font-black text-sm shadow-lg shadow-pink-500/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Place Order</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Available Coupons & Generator Drawer Modal */}
      {showCouponsModal && (
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
                onClick={() => setShowCouponsModal(false)}
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

                {availableCoupons.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    No active coupons available right now.
                  </div>
                )}

                {availableCoupons.map((c) => {
                  const isEligible = rawProductTotal >= c.minOrder;
                  const isAlreadyApplied = appliedCoupon === c.code;

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
                            Min Order: ₹{c.minOrder} • {isEligible ? 'Eligible on current cart' : `Add ₹${c.minOrder - rawProductTotal} more`}
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
                              disabled={!isEligible}
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

      {/* Quick Email OTP Login Modal for Cart Checkout */}
      <QuickEmailOtpModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          handleNav('/address');
        }}
        actionTitle="Login to Checkout Your Cart"
        actionSubtitle="Enter your email to receive an instant 6-digit login OTP"
      />

      {/* Bottom Nav */}
      <AppBottomNav activeNav="cart" onNavigate={handleNav} role="customer" homePath="/user-home" />
    </div>
  );
}