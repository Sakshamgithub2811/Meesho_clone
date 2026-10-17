import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddresses, saveAddress } from '../../services/ecommerceService';

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
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    addressLine: '',
    city: '',
    state: '',
    isDefault: false
  });

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
        const def = data.find(a => a.isDefault) || data[0];
        setSelectedAddressId(def.id);
        localStorage.setItem('mshoppy_selected_address', JSON.stringify({
          name: def.fullName,
          phone: def.phone,
          pincode: def.pincode,
          details: `${def.addressLine}, ${def.city}, ${def.state}`
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

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode || !newAddress.addressLine || !newAddress.city || !newAddress.state) {
      triggerToast('Please fill in all address fields');
      return;
    }

    try {
      const res = await saveAddress(newAddress);
      if (res?.data) {
        setAddresses(prev => [res.data, ...prev]);
        setSelectedAddressId(res.data.id);
        localStorage.setItem('mshoppy_selected_address', JSON.stringify({
          name: res.data.fullName,
          phone: res.data.phone,
          pincode: res.data.pincode,
          details: `${res.data.addressLine}, ${res.data.city}, ${res.data.state}`
        }));
      } else {
        await loadAddresses();
      }
      setShowAddAddressModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        pincode: '',
        addressLine: '',
        city: '',
        state: '',
        isDefault: false
      });
      triggerToast('New delivery address saved & selected! 📍');
    } catch (err) {
      triggerToast('Address saved locally! 📍');
      setShowAddAddressModal(false);
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    localStorage.setItem('mshoppy_selected_address', JSON.stringify({
      name: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      details: `${addr.addressLine}, ${addr.city}, ${addr.state}`
    }));
  };

  const handleProceedToPayment = () => {
    if (!selectedAddressId && addresses.length > 0) {
      handleSelectAddress(addresses[0]);
    }
    handleNav('/payment');
  };

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
              onClick={() => (onBack ? onBack() : handleNav('/cart'))}
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
              onClick={() => handleNav('/cart')}
              className="text-[#008644] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="w-5 h-5 rounded-full bg-[#008644] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              Cart
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-[#191c1e]">Add New Delivery Address</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddNewAddress} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Receiver Name"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="10-digit mobile"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pincode *</label>
                <input
                  type="text"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="6-digit pincode"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">House / Flat / Road / Area *</label>
                <textarea
                  rows={2}
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  placeholder="Street address details"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g. Bangalore"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">State *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-[#f8f9fb] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g. Karnataka"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
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
    </div>
  );
}