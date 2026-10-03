import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function DropshipperLogin() {
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');
  // Login Tab: 'mobile' | 'id_password' | 'google'
  const [loginMethod, setLoginMethod] = useState('mobile');

  // Form states
  const [mobileNumber, setMobileNumber] = useState('');
  const [dropshipperId, setDropshipperId] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register form fields
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('');

  // Google SSO Modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleAuthMode, setGoogleAuthMode] = useState('login'); // 'login' | 'register'
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isAddingNewGoogleAccount, setIsAddingNewGoogleAccount] = useState(false);

  // Sample Google Accounts for 1-click SSO Demo
  const DEMO_GOOGLE_ACCOUNTS = [
    {
      id: 'DS-G-94210',
      name: 'Sarah James',
      email: 'sarah.james@auratrends.shop',
      brandName: 'Aura Trends',
      storeUrl: 'https://auratrends.shop',
      platform: 'Shopify',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      tier: 'Tier 1 Verified Dropshipper',
      capacity: '50 - 200 orders/month',
    },
    {
      id: 'DS-G-88124',
      name: 'Aura Trends Direct',
      email: 'admin@auratrends.shop',
      brandName: 'Aura Trends',
      storeUrl: 'https://auratrends.shop',
      platform: 'Shopify',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      tier: 'Tier 1 Verified Dropshipper',
      capacity: '100+ orders/month',
    },
  ];

  // Handle Mobile input (only 10 digits)
  const handleMobileChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length <= 10) {
      setMobileNumber(digits);
      if (error) setError('');
    }
  };

  // Send / Verify OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtp(['8', '9', '4', '2']); // Auto-fill demo OTP
    }, 600);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Complete Login and Redirect to Supplier Product Catalog
  const handleCompleteLogin = (userLabel = 'DS-89420', customDetails = {}) => {
    setIsLoading(true);
    setError('');

    const sessionData = {
      isLoggedIn: true,
      authProvider: customDetails.authProvider || 'credentials',
      dropshipperId: userLabel,
      name: customDetails.name || businessName || 'Aura Trends',
      brandName: customDetails.brandName || businessName || 'Aura Trends',
      email: customDetails.email || `${userLabel.toLowerCase()}@auratrends.shop`,
      storeUrl: customDetails.storeUrl || 'https://auratrends.shop',
      platform: customDetails.platform || 'Shopify',
      capacity: customDetails.capacity || '50 - 200 orders/month',
      pan: customDetails.pan || 'ABCDE1234F',
      aadhaar: customDetails.aadhaar || '4829 1920 3810',
      gstin: customDetails.gstin || '29ABCDE1234F1Z5',
      tier: customDetails.tier || 'Tier 1 Verified Dropshipper',
      avatar: customDetails.avatar || '',
      loginTime: new Date().toISOString(),
    };

    // Save session in localStorage
    localStorage.setItem('meesho_dropshipper_session', JSON.stringify(sessionData));

    setTimeout(() => {
      setIsLoading(false);
      navigate('/supplier-products');
    }, 700);
  };

  // Open Google SSO Modal with current intent
  const openGoogleAuth = (mode = 'login') => {
    setError('');
    setGoogleAuthMode(mode);
    setIsAddingNewGoogleAccount(false);
    setShowGoogleModal(true);
  };

  // Google SSO Account selection
  const handleSelectGoogleAccount = (account) => {
    setSelectedGoogleAccount(account);
    setGoogleAuthLoading(true);

    setTimeout(() => {
      setGoogleAuthLoading(false);
      setShowGoogleModal(false);
      handleCompleteLogin(account.id, {
        authProvider: 'google',
        name: account.name,
        brandName: account.brandName || 'Aura Trends',
        email: account.email,
        storeUrl: account.storeUrl || 'https://auratrends.shop',
        platform: account.platform || 'Shopify',
        tier: account.tier || 'Tier 1 Verified Dropshipper',
        avatar: account.avatar || '',
      });
    }, 900);
  };

  // Custom Google Account submission
  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleName.trim()) {
      setError('Please provide your Google name and email address');
      return;
    }
    const customAcc = {
      id: `DS-G-${Math.floor(10000 + Math.random() * 90000)}`,
      name: customGoogleName.trim(),
      email: customGoogleEmail.trim(),
      brandName: `${customGoogleName.trim()}'s Direct Store`,
      storeUrl: 'https://auratrends.shop',
      platform: 'Shopify',
      tier: 'Tier 1 Verified Dropshipper',
      avatar: '',
    };
    handleSelectGoogleAccount(customAcc);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col justify-between font-sans selection:bg-[#b90041]/30 w-full overflow-x-hidden">
      {/* Top Brand Bar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => navigate('/')}>
            <img 
              src="/mshoppy-logo.png" 
              alt="MShoppy" 
              className="w-8 h-8 rounded-xl object-contain shadow-xs" 
            />
            <span className="text-lg sm:text-2xl font-black text-[#FF3F6C] font-['Plus_Jakarta_Sans'] tracking-tight whitespace-nowrap">
              MShoppy Direct
            </span>
            <span className="bg-[#b90041]/20 text-[#FF6B8B] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-[#b90041]/40 uppercase tracking-wide whitespace-nowrap">
              B2B <span className="hidden sm:inline">Dropshipper </span>Portal
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] sm:text-xs text-gray-400 hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              <span className="hidden xs:inline">Reseller </span>Login →
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Authentication Card */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {/* Header inside Card */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
                  {authMode === 'login' ? 'Dropshipper Login' : 'Register Dropshipper'}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {authMode === 'login'
                    ? 'Access supplier catalog, SKUs, and margin tools'
                    : 'Create your B2B account with zero deposit'}
                </p>
              </div>

              {/* Mode Switcher Pills */}
              <div className="bg-gray-950 p-1 rounded-xl border border-gray-800 flex items-center text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                    setOtpSent(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    authMode === 'login' ? 'bg-[#b90041] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError('');
                    setOtpSent(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    authMode === 'register' ? 'bg-[#b90041] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Login Method Tabs (Only in Login Mode) */}
            {authMode === 'login' && !otpSent && (
              <div className="flex border-b border-gray-800 mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('mobile')}
                  className={`pb-2.5 px-4 cursor-pointer transition border-b-2 flex items-center gap-1.5 ${
                    loginMethod === 'mobile'
                      ? 'border-[#FF3F6C] text-[#FF3F6C] font-bold'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">smartphone</span>
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('id_password')}
                  className={`pb-2.5 px-4 cursor-pointer transition border-b-2 flex items-center gap-1.5 ${
                    loginMethod === 'id_password'
                      ? 'border-[#FF3F6C] text-[#FF3F6C] font-bold'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">badge</span>
                  <span>Dropshipper ID / Email</span>
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-rose-400">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* ============================================== */}
            {/* FORM: Mobile OTP Login                         */}
            {/* ============================================== */}
            {authMode === 'login' && loginMethod === 'mobile' && !otpSent && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-sm font-bold text-gray-400 border-r border-gray-700 pr-2.5">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      placeholder="Enter 10-digit number (e.g. 9876543210)"
                      className="w-full pl-24 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#b90041] focus:border-transparent transition"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    An OTP will be sent to verify your dropshipper account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#b90041] hover:bg-[#a00037] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-pink-900/30 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    <>
                      <span>Get Verification OTP</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-gray-800 w-full"></div>
                  <span className="bg-gray-900 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute">
                    or
                  </span>
                </div>

                {/* Standard Continue with Google button */}
                <button
                  type="button"
                  onClick={() => openGoogleAuth('login')}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* FORM: OTP Verification Screen */}
            {authMode === 'login' && loginMethod === 'mobile' && otpSent && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">OTP sent to</span>
                    <strong className="text-white font-mono text-sm">+91 {mobileNumber}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[#FF3F6C] hover:underline font-bold text-xs cursor-pointer"
                  >
                    Edit Number
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2 text-center">
                    Enter 4-Digit Security Code
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 text-center bg-gray-950 border border-gray-700 rounded-xl text-xl font-bold font-mono text-white focus:outline-none focus:ring-2 focus:ring-[#b90041] transition"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 px-1">
                    <span>Enter code sent via SMS</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(['', '', '', '']);
                      }}
                      className="text-[#FF3F6C] hover:underline font-semibold cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCompleteLogin(`DS-${mobileNumber.slice(-5) || '89420'}`)}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#b90041] hover:bg-[#a00037] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-pink-900/30 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">login</span>
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ============================================== */}
            {/* FORM: Dropshipper ID & Password Login          */}
            {/* ============================================== */}
            {authMode === 'login' && loginMethod === 'id_password' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!dropshipperId) {
                    setError('Please enter your Dropshipper ID or Business Email');
                    return;
                  }
                  handleCompleteLogin(dropshipperId);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Dropshipper ID / Business Email
                  </label>
                  <input
                    type="text"
                    value={dropshipperId}
                    onChange={(e) => setDropshipperId(e.target.value)}
                    placeholder="e.g. DS-89420 or partner@store.com"
                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-300">Password</label>
                    <a href="#forgot" className="text-[11px] text-[#FF3F6C] hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#b90041] hover:bg-[#a00037] text-white font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">login</span>
                      <span>Sign In to Supplier Portal</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-gray-800 w-full"></div>
                  <span className="bg-gray-900 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute">
                    or
                  </span>
                </div>

                {/* Standard Continue with Google button */}
                <button
                  type="button"
                  onClick={() => openGoogleAuth('login')}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* ============================================== */}
            {/* FORM: New Dropshipper Registration (Sign Up)   */}
            {/* ============================================== */}
            {authMode === 'register' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!businessName || !mobileNumber) {
                    setError('Please enter your Business/Store Name and Mobile Number');
                    return;
                  }
                  handleCompleteLogin('DS-NEW-' + Math.floor(1000 + Math.random() * 9000));
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Business / Store Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Fashion Boutique"
                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      placeholder="10 Digits"
                      className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Jaipur"
                      className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    GSTIN (Optional — for tax credits)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 08AAAAA0000A1Z5"
                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">how_to_reg</span>
                      <span>Register</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3.5">
                  <div className="border-t border-gray-800 w-full"></div>
                  <span className="bg-gray-900 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute">
                    or sign up with
                  </span>
                </div>

                {/* Sign up with Google button */}
                <button
                  type="button"
                  onClick={() => openGoogleAuth('register')}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Sign up with Google</span>
                </button>
              </form>
            )}

            {/* Legal & Terms notice */}
            <div className="mt-6 pt-5 border-t border-gray-800 text-center">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to the MShoppy Dropshipper Agreement &amp; B2B Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ==================================================== */}
      {/* GOOGLE SSO / ACCOUNT CHOOSER MODAL                   */}
      {/* ==================================================== */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col font-sans">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <GoogleIcon className="w-6 h-6" />
                  <span className="font-semibold text-slate-700 text-sm tracking-tight">
                    Google Identity Services
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!googleAuthLoading) {
                      setShowGoogleModal(false);
                      setIsAddingNewGoogleAccount(false);
                    }
                  }}
                  disabled={googleAuthLoading}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {googleAuthMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                to continue to <strong className="text-slate-800">MShoppy Direct B2B Portal</strong>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {googleAuthLoading ? (
                /* Authenticating Loading State */
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#4285F4] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Signing in with Google...
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {selectedGoogleAccount?.email || 'Authenticating B2B Credentials'}
                    </p>
                  </div>
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ OAuth 2.0 Token Verified
                  </span>
                </div>
              ) : isAddingNewGoogleAccount ? (
                /* Add New Google Account Form */
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Ananya Roy"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Google Email Address *
                    </label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="e.g. ananya.store@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewGoogleAccount(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-xs font-bold text-white transition cursor-pointer shadow-md"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              ) : (
                /* List of Google Accounts */
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Choose an account:
                  </div>

                  {DEMO_GOOGLE_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-[#4285F4] transition truncate">
                            {acc.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono truncate">
                            {acc.email}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            {acc.brandName} • {acc.tier}
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-[#4285F4] transition text-base shrink-0 ml-2">
                        chevron_right
                      </span>
                    </button>
                  ))}

                  {/* Use another account button */}
                  <button
                    type="button"
                    onClick={() => setIsAddingNewGoogleAccount(true)}
                    className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition flex items-center gap-3 text-left cursor-pointer text-slate-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <span className="material-symbols-outlined text-lg">person_add</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Use another Google account
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sign in with a different workspace or personal account
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                To continue, Google will share your name, email address, and profile picture with MShoppy Direct B2B Portal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-850 py-4 px-6 text-center text-xs text-gray-500">
        <p>© 2026 MShoppy B2B Network • Direct Supplier-to-Customer Fulfillment Engine</p>
      </footer>
    </div>
  );
}

