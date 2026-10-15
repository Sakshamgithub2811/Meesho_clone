import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supplierApiService from '../../services/supplierApiService';

export default function SupplierLogin({ onNavigate, onBack, defaultTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect active tab from prop or URL
  const initialTab = defaultTab || (location?.pathname?.includes('register') ? 'register' : 'login');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state if defaultTab prop or location changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location?.pathname?.includes('register')) {
      setActiveTab('register');
    } else if (location?.pathname?.includes('login')) {
      setActiveTab('login');
    }
  }, [defaultTab, location?.pathname]);

  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      handleNav('/seller-web-dashboard1');
    }
  };

  const handleTabToggle = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      window.history.replaceState(null, '', tab === 'register' ? '/supplier-register' : '/supplier-login');
    } catch {
      // Fallback
    }
  };

  // ==========================================
  // --- LOGIN STATE & LOGIC (EMAIL ONLY) ---
  // ==========================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Login via Email & Password
  const handleEmailLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your supplier email');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await supplierApiService.loginWithPassword(email.trim(), password);
      setSuccessMessage(`Welcome back, ${res.supplier?.name || 'Supplier'}! Redirecting...`);
      setTimeout(() => {
        handleNav('/seller-web-dashboard1');
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoLogin = () => {
    setEmail('supplier@globalexports.com');
    setPassword('Password@123');
    setErrorMessage('');
  };

  // ==========================================
  // --- REGISTRATION STATE & LOGIC ---
  // ==========================================
  const [regData, setRegData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(true);

  // Common Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  // Minimal Registration Submission (Full Name, Phone, Email, Password)
  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();

    if (!regData.fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    const cleanPhone = regData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('A valid 10-digit mobile number is required');
      return;
    }
    if (!regData.email.trim() || !regData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the MShoppy Supplier Terms & Conditions');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const payload = {
        fullName: regData.fullName.trim(),
        name: regData.fullName.trim(),
        phone: cleanPhone,
        email: regData.email.trim().toLowerCase(),
        password: regData.password,
        storeName: `${regData.fullName.trim()}'s Store`,
      };

      await supplierApiService.registerSupplier(payload);
      setSuccessMessage('🎉 Congratulations! Your supplier account has been registered successfully. Redirecting...');
      setTimeout(() => {
        handleNav('/seller-web-dashboard1');
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoRegister = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    setRegData({
      fullName: 'Rahul Sharma',
      phone: `9811${randomDigits}`,
      email: `rahul_${randomDigits}@test.com`,
      password: 'Password@123',
    });
    setErrorMessage('');
  };

  return (
    <div className="bg-[#fff4f6] text-[#4a2135] min-h-screen w-full overflow-x-hidden relative font-sans flex flex-col items-center">
      {/* 1. Top Curved Banner Graphic */}
      <div className="absolute top-0 left-0 w-full h-[320px] sm:h-[350px] overflow-hidden [clip-path:ellipse(110%_100%_at_50%_0%)] bg-[#ff7293]/20 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fff4f6]/95 z-10" />
        <img
          className="w-full h-full object-cover mix-blend-multiply opacity-80"
          alt="MShoppy Supplier Access"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17Odz0VuEd9507iy5ggYedrO4p3lV7PTifqh_NIFIjMwYs7F7xvv7dJPF3VZ6Z11llVLVw5xtNaMn4qJcaZlijJ5VYBvw4lkhDG0GaD_3mqVC6fp_xGCsC_hT5Kl2Yvq85636Vd8iv-Nfvmw3A5Otx5SstITEeJ4evOSjB2EZqGwhDYhrJHL4AtEO6BSjDVRSWi-AhA3f8HCmXuKT-yo3NUOxOwpD4XR4x4e-hJLySUEWwuFS8o8Obusm8jNEjV35CWqYtkzkNNg"
        />
      </div>

      {/* Top Floating Badge & Back Button */}
      <header className="relative z-20 pt-7 pb-3 w-full flex items-center justify-center">
        {/* Subtle Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute left-5 sm:left-8 top-7 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-white/60 flex items-center justify-center text-slate-700 hover:text-[#9e003f] transition cursor-pointer"
          title="Go Back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Brand Pill Badge - Matching "MSHOPPY USER" from reference */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-[0_8px_25px_rgba(74,33,53,0.06)] flex items-center gap-1.5">
          <span className="text-[#880e4f] font-black tracking-tight text-base sm:text-lg">
            MSHOPPY
          </span>
          <span className="text-[#f06292] font-black tracking-wider text-xs sm:text-sm uppercase">
            SUPPLIER
          </span>
        </div>
      </header>

      {/* 2. Floating Centered Card Canvas */}
      <main className="relative z-10 w-full px-4 pt-1 sm:pt-3 pb-16 flex flex-col items-center">
        <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(74,33,53,0.09)] border border-white/90 p-7 sm:p-9 space-y-6">

          {/* Card Title & Subtitle */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#3b1227]">
              Supplier Access
            </h1>
            <p className="text-xs sm:text-sm text-[#8a6575] font-medium">
              {activeTab === 'login'
                ? 'Secure shopping & seller portal for suppliers'
                : 'Create your supplier account in seconds'}
            </p>
          </div>

          {/* ============================================================ */}
          {/* SEGMENTED TOGGLE PILL: Login | Register (As in screenshot) */}
          {/* ============================================================ */}
          <div className="bg-[#ffeef2] p-1 rounded-full flex items-center">
            <button
              type="button"
              onClick={() => handleTabToggle('login')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer text-center ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white shadow-md shadow-pink-600/30'
                  : 'text-[#6e3950] hover:text-[#d82a62]'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => handleTabToggle('register')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer text-center ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#d82a62] to-[#eb3678] text-white shadow-md shadow-pink-600/30'
                  : 'text-[#6e3950] hover:text-[#d82a62]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB CONTENT A: SUPPLIER EMAIL LOGIN ONLY */}
          {/* ============================================================ */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-bold text-[#3b1227] block">
                  Supplier Email
                </label>
                <input
                  type="email"
                  placeholder="supplier@mshoppy.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                  className="w-full h-12 px-4 text-sm rounded-2xl border border-slate-200/90 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition bg-white text-slate-800 placeholder-slate-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-[13px] font-bold text-[#3b1227] block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('/forgot-password');
                      } else {
                        navigate('/forgot-password', { state: { from: '/supplier-login' } });
                      }
                    }}
                    className="text-xs text-[#9e003f] hover:text-[#7e0032] font-semibold hover:underline cursor-pointer transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                  className="w-full h-12 px-4 text-sm rounded-2xl border border-slate-200/90 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition bg-white text-slate-800 placeholder-slate-400"
                  required
                />
              </div>

              {/* Primary CTA Button matching the deep crimson button in screenshot */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#9e003f] hover:bg-[#860035] text-white font-bold rounded-2xl shadow-md shadow-pink-950/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base mt-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </>
                ) : (
                  'Secure Login'
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={fillDemoLogin}
                  className="text-xs text-slate-400 hover:text-[#9e003f] font-medium transition cursor-pointer underline decoration-dotted"
                >
                  ⚡ Auto-fill demo credentials
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB CONTENT B: SUPPLIER REGISTRATION FORM */}
          {/* Only 4 Fields: Full Name, Phone, Email, Password */}
          {/* ============================================================ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-bold text-[#3b1227] block">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={regData.fullName}
                  onChange={handleRegChange}
                  className="w-full h-12 px-4 text-sm rounded-2xl border border-slate-200/90 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition bg-white text-slate-800 placeholder-slate-400"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-bold text-[#3b1227] block">
                  Mobile Number
                </label>
                <div className="relative flex rounded-2xl border border-slate-200/90 focus-within:border-[#d82a62] focus-within:ring-2 focus-within:ring-pink-100 overflow-hidden bg-white">
                  <div className="bg-slate-50 px-3.5 flex items-center border-r border-slate-200/90 text-xs font-bold text-slate-700 select-none">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter 10-digit number"
                    value={regData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setRegData((prev) => ({ ...prev, phone: digits }));
                      setErrorMessage('');
                    }}
                    className="w-full h-12 px-3 text-sm font-semibold tracking-wider outline-none text-slate-800 placeholder-slate-400"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Supplier Email */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-bold text-[#3b1227] block">
                  Supplier Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="supplier@mshoppy.com"
                  value={regData.email}
                  onChange={handleRegChange}
                  className="w-full h-12 px-4 text-sm rounded-2xl border border-slate-200/90 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition bg-white text-slate-800 placeholder-slate-400"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-[13px] font-bold text-[#3b1227] block">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={handleRegChange}
                  className="w-full h-12 px-4 text-sm rounded-2xl border border-slate-200/90 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition bg-white text-slate-800 placeholder-slate-400"
                  required
                />
              </div>

              {/* Agreement checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-[#5f2b43] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-[#9e003f] focus:ring-[#9e003f] mt-0.5"
                />
                <span>
                  I agree to the <span className="font-bold underline text-[#3b1227]">MShoppy Supplier Agreement</span> and Terms of Service.
                </span>
              </label>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#9e003f] hover:bg-[#860035] text-white font-bold rounded-2xl shadow-md shadow-pink-950/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base mt-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </>
                ) : (
                  'Secure Register'
                )}
              </button>

              {/* Auto-fill demo link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={fillDemoRegister}
                  className="text-xs text-slate-400 hover:text-[#9e003f] font-medium transition cursor-pointer underline decoration-dotted"
                >
                  ⚡ Auto-fill demo details
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
