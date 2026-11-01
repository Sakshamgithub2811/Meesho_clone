import fs from 'fs';

const file = 'd:/Meesho/Meesho_clone/frontend/src/pages/delivery & driver logistics/active_delivery_mobile.jsx';
let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. Add states and handlers
const oldHeader = `  const [isDelivered, setIsDelivered] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleMarkDelivered = () => {
    setIsDelivered(true);
    triggerToast('Delivery Confirmed! ₹45.00 credited to wallet 🎉');
    setTimeout(() => {
      onNavigate('driver_earnings');
    }, 1200);
  };`;

const newHeader = `  const [isDelivered, setIsDelivered] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [driverOtp, setDriverOtp] = useState('');
  const [otpError, setOtpError] = useState('');

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

    if (driverOtp === '4829' || driverOtp === '1234') {
      setShowOtpModal(false);
      setIsDelivered(true);
      triggerToast('OTP Verified! Delivery Confirmed & ₹45.00 credited to wallet 🎉');
      setTimeout(() => {
        onNavigate('driver_earnings');
      }, 1200);
    } else {
      setOtpError('Invalid OTP! Please check with customer or click Resend SMS.');
    }
  };

  const handleResendCustomerSms = () => {
    triggerToast('SMS Delivery OTP dispatched to customer (+91 98765 43210) 📱');
    setOtpError('');
  };`;

code = code.replace(oldHeader, newHeader);

// 2. Update Mark Delivered Button trigger
code = code.replace(
  'onClick={handleMarkDelivered}',
  'onClick={handleOpenDeliveryModal}'
);

// 3. Add OTP Modal before </main>
const modalCode = `      {/* Customer Delivery OTP Verification Modal (Prepaid Order Handover) */}
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
                    setDriverOtp(e.target.value.replace(/\\D/g, ''));
                    setOtpError('');
                  }}
                  className="w-full h-12 text-center text-2xl font-black tracking-widest bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {otpError && (
                <p className="text-xs font-bold text-red-600 text-center">{otpError}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Dev Hint: OTP is 4829</span>
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
      </main>`;

code = code.replace('</main>', modalCode);

fs.writeFileSync(file, code.replace(/\n/g, '\r\n'), 'utf8');
console.log('Updated active_delivery_mobile.jsx successfully');

