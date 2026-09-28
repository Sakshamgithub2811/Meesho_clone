import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';
import BankAutocompleteSelect from '../../components/BankAutocompleteSelect';

export default function PayoutSettings() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: "HDFC Bank",
    accountNumber: "•••• 4321",
    holderName: "Rahul Sharma",
    ifsc: "HDFC0001234"
  });

  const [upiList, setUpiList] = useState([
    { id: 1, upiId: "partner@upi", verified: true },
    { id: 2, upiId: "rahul@okaxis", verified: true }
  ]);

  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);
  const [newUpi, setNewUpi] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const [newBank, setNewBank] = useState({
    bankName: "",
    accountNumber: "",
    holderName: "",
    ifsc: ""
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    if (!newBank.bankName || !newBank.accountNumber) return;
    setBankDetails({
      bankName: newBank.bankName,
      accountNumber: `•••• ${newBank.accountNumber.slice(-4)}`,
      holderName: newBank.holderName || "Rahul Sharma",
      ifsc: newBank.ifsc || "SBIN0002145"
    });
    setShowAddBankModal(false);
    showToast("Bank account updated successfully!");
  };

  const handleAddUpi = (e) => {
    e.preventDefault();
    if (!newUpi.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. yourname@upi)');
      return;
    }
    setUpiList(prev => [...prev, { id: Date.now(), upiId: newUpi, verified: true }]);
    setNewUpi("");
    setShowAddUpiModal(false);
    showToast("UPI ID linked & verified!");
  };

  const handleDeleteUpi = (id) => {
    setUpiList(prev => prev.filter(u => u.id !== id));
    showToast("UPI ID removed.");
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary/20">
      {/* TopAppBar - Full Width */}
      <header className="w-full relative bg-[#F8F9FB] border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#FF3F6C] active:scale-95 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-lg sm:text-xl text-[#191C1E]">
              Payout Settings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span 
              onClick={() => alert("Payouts are processed automatically every Wednesday.")}
              className="material-symbols-outlined text-[#191C1E] cursor-pointer text-2xl"
            >
              help_outline
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-8">
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-2xl text-center shadow-lg animate-fade-in">
            {toastMsg}
          </div>
        )}

        {/* Current Payout Method Section */}
        <section>
          <h2 className="font-headline font-bold text-lg mb-4 text-on-surface">
            Primary Payout Bank Account
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-[0_12px_32px_rgba(25,28,30,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Primary
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">account_balance</span>
              </div>
              <div className="flex-1">
                <p className="font-headline font-bold text-xl text-on-surface">{bankDetails.bankName}</p>
                <p className="text-on-surface-variant font-medium mt-1 tracking-widest text-sm">
                  {bankDetails.accountNumber} • {bankDetails.holderName}
                </p>
                <p className="text-xs text-outline mt-0.5">IFSC: {bankDetails.ifsc}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="bg-surface-container-high hover:bg-surface-container-highest transition-colors px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Bank Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Linked UPI IDs Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline font-bold text-lg text-on-surface">Linked UPI IDs</h2>
            <button
              onClick={() => setShowAddUpiModal(true)}
              className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add UPI
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upiList.map(upi => (
              <div
                key={upi.id}
                className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">alternate_email</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{upi.upiId}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">✓ Auto-Verified</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteUpi(upi.id)}
                  className="text-error font-bold text-xs px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowAddUpiModal(true)}
              className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-center gap-2 border-2 border-dashed border-outline-variant/60 hover:bg-surface-container-high transition-colors cursor-pointer text-on-surface-variant font-bold text-xs"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Link Another UPI ID
            </button>
          </div>
        </section>

        {/* Add Bank Account CTA */}
        <section className="flex flex-col gap-3">
          <button
            onClick={() => setShowAddBankModal(true)}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add Bank Account
          </button>
        </section>

        {/* Withdrawal Schedule Info */}
        <section>
          <div className="bg-secondary-fixed p-6 rounded-3xl flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-4xl">calendar_month</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-secondary-fixed">
                Withdrawal Schedule
              </h3>
              <p className="text-on-secondary-fixed-variant text-sm mt-1">
                Payouts are processed <span className="font-bold">Weekly on Mondays</span> directly to your primary account.
              </p>
            </div>
          </div>
        </section>

        {/* Security Note */}
        <footer className="text-center px-6 sm:px-10 pb-4">
          <div className="inline-flex items-center gap-2 text-on-surface-variant/60 mb-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              End-to-End Encrypted
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Your financial information is stored securely following PCI-DSS standards. We never share your banking credentials with third parties.
          </p>
        </footer>
      </main>



      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-headline font-bold text-lg text-on-surface">Add Bank Account</h3>
              <button 
                type="button"
                onClick={() => setShowAddBankModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveBank} className="space-y-3">
              <BankAutocompleteSelect
                label="Bank Name"
                required
                value={newBank.bankName}
                onChange={(val) => setNewBank(prev => ({ ...prev, bankName: val }))}
                onSelectBank={(bank) => {
                  if (!newBank.ifsc && bank.code) {
                    setNewBank(prev => ({ ...prev, ifsc: bank.code }));
                  }
                }}
                placeholder="Search or select bank (e.g. HDFC, SBI, ICICI)"
              />
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Account Number</label>
                <input
                  required
                  type="text"
                  placeholder="Enter full account number"
                  value={newBank.accountNumber}
                  onChange={(e) => setNewBank(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full mt-1 p-3 bg-surface-container-low border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Account Holder Name</label>
                <input
                  required
                  type="text"
                  placeholder="As per bank passbook"
                  value={newBank.holderName}
                  onChange={(e) => setNewBank(prev => ({ ...prev, holderName: e.target.value }))}
                  className="w-full mt-1 p-3 bg-surface-container-low border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">IFSC Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={newBank.ifsc}
                  onChange={(e) => setNewBank(prev => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
                  className="w-full mt-1 p-3 bg-surface-container-low border border-gray-200 rounded-xl text-sm outline-none focus:border-primary uppercase transition-colors"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="flex-1 py-2.5 px-3 bg-gray-100 font-bold text-gray-600 rounded-xl text-xs cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-primary text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary/90 transition-all flex flex-col items-center justify-center leading-tight"
                >
                  <span>Save & Verify</span>
                  <span className="text-[10px] font-medium opacity-90">(₹1 Test Deposit)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add UPI Modal */}
      {showAddUpiModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-headline font-bold text-base text-on-surface">Link UPI ID</h3>
              <button 
                type="button"
                onClick={() => setShowAddUpiModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddUpi} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Virtual Payment Address (UPI)</label>
                <input
                  required
                  type="text"
                  placeholder="mobile@okhdfcbank or name@paytm"
                  value={newUpi}
                  onChange={(e) => setNewUpi(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-surface-container-low border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2">
                {['@okhdfcbank', '@paytm', '@ybl', '@upi'].map(suffix => (
                  <button
                    key={suffix}
                    type="button"
                    onClick={() => {
                      const prefix = newUpi.split('@')[0];
                      setNewUpi(prefix ? `${prefix}${suffix}` : suffix);
                    }}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                  >
                    {suffix}
                  </button>
                ))}
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUpiModal(false)}
                  className="flex-1 py-3 bg-gray-100 font-bold text-gray-600 rounded-xl text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary/90 transition-all"
                >
                  Verify & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="earnings" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
