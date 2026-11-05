import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { X, Mail, ShieldCheck, ArrowRight, RefreshCw, KeyRound, CheckCircle2, Lock } from 'lucide-react';
import { API_BASE } from '../../config/apiConfig';

export default function QuickEmailOtpModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = "Login to Complete Your Order",
  actionSubtitle = "Enter your email to receive a 6-digit OTP"
}) {
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('EMAIL');
      setOtp('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/user-auth/send-login-otp`, {
        email: cleanEmail
      });

      if (res.data?.success) {
        setStep('OTP');
        setResendTimer(45);
        toast.success(`6-Digit OTP sent to ${cleanEmail} 📧`);
      } else {
        setError(res.data?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await axios.post(`${API_BASE}/user-auth/verify-login-otp`, {
        email: cleanEmail,
        otp: cleanOtp
      });

      if (res.data?.success && res.data?.user) {
        const verifiedUser = {
          ...res.data.user,
          role: 'CUSTOMER'
        };

        // Persist customer session in localStorage
        try {
          localStorage.setItem('mshoppy_customer_user', JSON.stringify(verifiedUser));
          localStorage.setItem('mshoppy_customer_token', verifiedUser.id || 'cust_token_' + Date.now());
        } catch (e) {}

        toast.success('Login Successful! Proceeding to checkout... 🛍️');

        if (onSuccess) {
          onSuccess(verifiedUser);
        }
        onClose();
      } else {
        setError(res.data?.error || 'Invalid OTP code. Please enter the correct 6-digit code.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.error || 'Invalid OTP. Please check your email or request a new code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-pink-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#9f0038] via-[#b7004d] to-[#ff7293] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                Secure Checkout Gateway
              </span>
              <h3 className="font-extrabold text-lg text-white mt-0.5 leading-snug">
                {actionTitle}
              </h3>
            </div>
          </div>

          <p className="text-xs text-pink-100 mt-2 font-medium">
            {step === 'EMAIL' 
              ? actionSubtitle 
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          {step === 'EMAIL' ? (
            /* ── STEP 1: ENTER EMAIL ── */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-pink-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#b7004d] focus:ring-2 focus:ring-[#b7004d]/20 transition-all outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">
                  We'll send a 6-digit verification code directly to your email inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-[#9f0038] to-[#b7004d] hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Login OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  No password required • Instant 1-Click Verification
                </span>
              </div>
            </form>
          ) : (
            /* ── STEP 2: ENTER OTP ── */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Enter 6-Digit OTP <span className="text-pink-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setStep('EMAIL'); setError(''); }}
                    className="text-[11px] text-pink-700 font-bold hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-mono font-black tracking-widest text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#b7004d] focus:ring-2 focus:ring-[#b7004d]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Proceed to Checkout</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Resend OTP in <strong className="text-slate-700 font-mono">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-pink-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend OTP Code
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

