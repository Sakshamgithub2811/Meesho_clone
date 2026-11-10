import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddresses, saveAddress } from '../../services/ecommerceService';
import INDIAN_STATES from '../../utils/indianStates';

export default function CheckoutAddressSelection({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const handleNav = (target) => {
    if (onNavigate) onNavigate(target);
    else navigate(target.startsWith('/') ? target : `/${target}`);
  };

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    addressType: 'Home',
    isDefault: false
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      if (data && data.length > 0) {
        setAddresses(data);
        const storedAddr = localStorage.getItem('mshoppy_selected_address');
        let selected = null;
        if (storedAddr) {
          try {
            const parsed = JSON.parse(storedAddr);
            selected = data.find(a => a.id === parsed.id || a.phone === parsed.phone);
          } catch (e) {}
        }
        if (!selected) {
          selected = data.find(a => a.isDefault) || data[0];
        }
        setSelectedAddressId(selected.id);
        localStorage.setItem('mshoppy_selected_address', JSON.stringify({
          id: selected.id,
          name: selected.fullName,
          phone: selected.phone,
          pincode: selected.pincode,
          details: `${selected.addressLine}, ${selected.city}, ${selected.state}`
        }));
      }
    } catch (e) {
      console.error('Failed to load addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handlePincodeChange = async (pinValue) => {
    const clean = pinValue.replace(/\D/g, '').slice(0, 6);
    setNewAddress((prev) => ({ ...prev, pincode: clean }));

    if (formErrors.pincode) {
      setFormErrors((prev) => ({ ...prev, pincode: null }));
    }

    if (clean.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus(null);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const detectedCity = po.District || po.Division || po.Block || '';
            const detectedState = po.State || '';

            setNewAddress((prev) => ({
              ...prev,
              city: prev.city || detectedCity,
              state: prev.state || detectedState,
            }));
            setPincodeStatus({
              success: true,
              message: `Delivery available for ${detectedCity ? detectedCity + ', ' : ''}${detectedState}`,
            });
            return;
          }
        }
      } catch (e) {
        console.warn('Pincode fetch error:', e);
      } finally {
        setPincodeLoading(false);
      }
      setPincodeStatus({ success: true, message: '✓ Valid 6-digit Pincode' });
    } else {
      setPincodeStatus(null);
      setPincodeLoading(false);
    }
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!newAddress.fullName || newAddress.fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters)';
    }

    const cleanPhone = newAddress.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Valid 10-digit Indian mobile number required (starts with 6, 7, 8, or 9)';
    }

    const cleanPin = newAddress.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      errors.pincode = 'Valid 6-digit Indian Pincode required';
    }

    if (!newAddress.houseNo || newAddress.houseNo.trim().length < 1) {
      errors.houseNo = 'House / Flat / Building No. is required';
    }

    if (!newAddress.street || newAddress.street.trim().length < 2) {
      errors.street = 'Street / Colony / Area is required';
    }

    if (!newAddress.city || newAddress.city.trim().length < 2) {
      errors.city = 'City / District is required';
    }

    if (!newAddress.state || !newAddress.state.trim()) {
      errors.state = 'State is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNewAddress = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!validateAddressForm()) {
      triggerToast('Please fill all required (*) address fields correctly');
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = newAddress.phone.replace(/\D/g, '').slice(-10);
    const cleanPin = newAddress.pincode.replace(/\D/g, '').slice(0, 6);

    const parts = [
      newAddress.houseNo.trim(),
      newAddress.street.trim(),
    ];
    if (newAddress.landmark && newAddress.landmark.trim()) {
      parts.push(`Near ${newAddress.landmark.trim()}`);
    }

    const combinedAddressLine = parts.join(', ');

    const payload = {
      fullName: newAddress.fullName.trim(),
      phone: cleanPhone,
      pincode: cleanPin,
      addressLine: combinedAddressLine,
      city: newAddress.city.trim(),
      state: newAddress.state.trim(),
      isDefault: Boolean(newAddress.isDefault),
    };

    try {
      const res = await saveAddress(payload);
      const savedData = res?.data || payload;
      
      setAddresses(prev => [savedData, ...prev.filter(a => a.id !== savedData.id)]);
      setSelectedAddressId(savedData.id || 'addr_' + Date.now());
      localStorage.setItem('mshoppy_selected_address', JSON.stringify({
        id: savedData.id || 'addr_' + Date.now(),
        name: savedData.fullName,
        phone: savedData.phone,
        pincode: savedData.pincode,
        details: `${savedData.addressLine}, ${savedData.city}, ${savedData.state}`
      }));

      setShowAddAddressModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        pincode: '',
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        addressType: 'Home',
        isDefault: false
      });
      setFormErrors({});
      setPincodeStatus(null);
      triggerToast('Delivery address saved successfully! 📍');
    } catch (err) {
      console.warn('API saveAddress notice:', err);
      const fallbackSaved = {
        id: 'local_addr_' + Date.now(),
        fullName: payload.fullName,
        phone: payload.phone,
        pincode: payload.pincode,
        addressLine: payload.addressLine,
        city: payload.city,
        state: payload.state,
        isDefault: payload.isDefault
      };
      setAddresses(prev => [fallbackSaved, ...prev]);
      setSelectedAddressId(fallbackSaved.id);
      localStorage.setItem('mshoppy_selected_address', JSON.stringify({
        id: fallbackSaved.id,
        name: fallbackSaved.fullName,
        phone: fallbackSaved.phone,
        pincode: fallbackSaved.pincode,
        details: `${fallbackSaved.addressLine}, ${fallbackSaved.city}, ${fallbackSaved.state}`
      }));
      setShowAddAddressModal(false);
      triggerToast('Delivery address saved! 📍');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    localStorage.setItem('mshoppy_selected_address', JSON.stringify({
      id: addr.id,
      name: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      details: `${addr.addressLine}, ${addr.city}, ${addr.state}`
    }));
  };

  const handleProceedToPayment = () => {
    if (selectedAddressId) {
      const chosen = addresses.find(a => a.id === selectedAddressId);
      if (chosen) handleSelectAddress(chosen);
    } else if (addresses.length > 0) {
      handleSelectAddress(addresses[0]);
    }
    handleNav('/payment');
  };

  const isBuyNow = typeof window !== 'undefined' && localStorage.getItem('mshoppy_checkout_mode') === 'buynow';

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-sans antialiased selection:bg-pink-100 selection:text-pink-600 pb-36">
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
              onClick={() => {
                if (onBack) return onBack();
                if (isBuyNow) {
                  navigate(-1);
                } else {
                  handleNav('/cart');
                }
              }}
              className="p-2 rounded-full hover:bg-slate-100 active:scale-95 text-[#FF3F6C] cursor-pointer transition-colors"
              title="Back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-[#191C1E] font-extrabold tracking-tight text-base sm:text-lg leading-none">
                Select Delivery Address
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Step 2 of 3 • Fast Dispatch
              </span>
            </div>
          </div>

          {/* Stepper (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400">
            <span
              onClick={() => handleNav(isBuyNow ? '/user-home' : '/cart')}
              className="text-[#008644] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="w-5 h-5 rounded-full bg-[#008644] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              {isBuyNow ? 'Product' : 'Cart'}
            </span>
            <span>─────</span>
            <span className="text-[#FF3F6C] font-extrabold flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-[#FF3F6C] text-white flex items-center justify-center text-[10px]">
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

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Verified Delivery</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-[#191c1e]">Saved Addresses</h2>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="text-xs font-bold text-[#FF3F6C] bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add New Address
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-300">location_off</span>
              <p className="text-sm font-bold text-slate-700">No Address Saved</p>
              <p className="text-xs text-slate-400">Add a delivery address to place your order with free delivery.</p>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="mt-2 bg-[#FF3F6C] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer"
              >
                + Add Address Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'border-[#FF3F6C] shadow-md shadow-pink-500/10'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#FF3F6C] bg-[#FF3F6C]' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-sm text-[#191c1e]">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-1">
                        {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-slate-400">Phone: {addr.phone}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Proceed Button */}
          <div className="pt-6">
            <button
              onClick={handleProceedToPayment}
              className="w-full py-4 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] text-white font-black text-base rounded-2xl shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Continue to Payment</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      {/* Add New Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#FF3F6C] flex items-center justify-center shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    location_on
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                    Add New Delivery Address
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide complete details for timely doorstep delivery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddNewAddress} className="overflow-y-auto py-4 space-y-4 pr-1">
              {/* SECTION 1: Contact Details */}
              <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm text-[#FF3F6C]">person</span>
                  <span>1. Contact Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name <span className="text-[#FF3F6C]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={newAddress.fullName}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, fullName: e.target.value });
                        if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: null });
                      }}
                      className={`w-full bg-white border ${formErrors.fullName ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all`}
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number <span className="text-[#FF3F6C]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={newAddress.phone}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setNewAddress({ ...newAddress, phone: v });
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                        }}
                        className={`w-full bg-white border ${formErrors.phone ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl pl-11 pr-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono tracking-wider transition-all`}
                        required
                      />
                    </div>
                    {formErrors.phone ? (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.phone}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">For delivery updates &amp; OTP</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Address & Location Details */}
              <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm text-[#FF3F6C]">home_pin</span>
                  <span>2. Address &amp; Location Details</span>
                </div>

                {/* Pincode with Auto-detection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Pincode <span className="text-[#FF3F6C]">*</span>
                    </label>
                    {pincodeLoading && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-[#FF3F6C] border-t-transparent rounded-full animate-spin"></span>
                        Detecting city/state...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Indian Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className={`w-full bg-white border ${formErrors.pincode ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono tracking-widest transition-all`}
                    required
                  />
                  {formErrors.pincode ? (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.pincode}</p>
                  ) : pincodeStatus ? (
                    <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      {pincodeStatus.message}
                    </p>
                  ) : null}
                </div>

                {/* House No / Building */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    House No. / Building Name / Flat / Floor <span className="text-[#FF3F6C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, B-Wing, Sunshine Heights"
                    value={newAddress.houseNo}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, houseNo: e.target.value });
                      if (formErrors.houseNo) setFormErrors({ ...formErrors, houseNo: null });
                    }}
                    className={`w-full bg-white border ${formErrors.houseNo ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all`}
                    required
                  />
                  {formErrors.houseNo && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.houseNo}</p>
                  )}
                </div>

                {/* Road Name / Street / Colony */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Road Name / Street / Colony / Area <span className="text-[#FF3F6C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near City Center Mall, MG Road, Sector 14"
                    value={newAddress.street}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, street: e.target.value });
                      if (formErrors.street) setFormErrors({ ...formErrors, street: null });
                    }}
                    className={`w-full bg-white border ${formErrors.street ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all`}
                    required
                  />
                  {formErrors.street && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.street}</p>
                  )}
                </div>

                {/* Nearby Landmark (Optional) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nearby Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Metro Pillar 128 / Behind SBI Bank"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                  />
                </div>

                {/* City & State (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City / District <span className="text-[#FF3F6C]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={newAddress.city}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, city: e.target.value });
                        if (formErrors.city) setFormErrors({ ...formErrors, city: null });
                      }}
                      className={`w-full bg-white border ${formErrors.city ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all`}
                      required
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      State <span className="text-[#FF3F6C]">*</span>
                    </label>
                    <select
                      value={newAddress.state}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, state: e.target.value });
                        if (formErrors.state) setFormErrors({ ...formErrors, state: null });
                      }}
                      className={`w-full bg-white border ${formErrors.state ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer transition-all`}
                      required
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                      {newAddress.state && !INDIAN_STATES.includes(newAddress.state) && (
                        <option value={newAddress.state}>{newAddress.state}</option>
                      )}
                    </select>
                    {formErrors.state && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.state}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Address Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Save Address As
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Home', label: 'Home', icon: 'home', hint: 'All Day' },
                    { id: 'Work', label: 'Work', icon: 'business', hint: '10 AM - 6 PM' },
                    { id: 'Other', label: 'Other', icon: 'location_on', hint: 'Anytime' },
                  ].map((type) => {
                    const isSelected = newAddress.addressType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewAddress({ ...newAddress, addressType: type.id })}
                        className={`py-2.5 px-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-pink-50 border-[#FF3F6C] text-[#FF3F6C] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{type.icon}</span>
                        <span className="text-xs font-extrabold">{type.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{type.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Make Default Address */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#FF3F6C] rounded border-slate-300 focus:ring-[#FF3F6C] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  Make this my default delivery address
                </span>
              </label>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] hover:from-[#e02659] hover:to-[#c41b49] text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Address...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}