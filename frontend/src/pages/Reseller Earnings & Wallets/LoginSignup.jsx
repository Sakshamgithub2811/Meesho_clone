import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');

  // Sirf numbers accept karega aur max 10 digits
  const handleInputChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    if (onlyDigits.length <= 10) {
      setMobileNumber(onlyDigits);
      if (error) setError('');
    }
  };

  // Submit check (exact 10 digits)
  const handleMobileLogin = (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setError('Invalid');
      return;
    }
    setError('');
    setUser(`+91 ${mobileNumber}`);
    setIsLoggedIn(true);
  };

  const handleGoogleLogin = () => {
    setUser('Google User');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMobileNumber('');
    setUser('');
    setError('');
  };

  // ==========================================
  // SCREEN 2: SIMPLE WELCOME SCREEN
  // ==========================================
  if (isLoggedIn) {
    return (
      <div className="bg-[#fff4f6] text-[#4a2135] min-h-screen flex flex-col items-center justify-center px-6 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-[0_12px_40px_rgba(74,33,53,0.06)] text-center space-y-5">
          <div className="w-16 h-16 bg-[#ffecf1] text-[#b7004d] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#4a2135]">
              Welcome to MShoppy!
            </h2>
            <p className="text-sm text-[#7d4d62] mt-2">
              Logged in as <span className="font-bold text-[#b7004d]">{user}</span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/reseller-home')}
              className="w-full bg-[#b7004d] hover:bg-[#990040] text-white font-extrabold py-3.5 rounded-[2rem] transition-colors cursor-pointer text-sm shadow-lg shadow-[#b7004d]/25 active:scale-95"
            >
              Enter MShoppy Reseller Catalog →
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-[#7d4d62] hover:text-red-600 font-semibold py-2 transition-colors cursor-pointer text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 1: ORIGINAL LOGIN FORM
  // ==========================================
  return (
    <div className="bg-[#fff4f6] text-[#4a2135] min-h-screen flex flex-col items-center overflow-x-hidden font-sans">
      {/* Top Section */}
      <div className="relative w-full h-[353px] overflow-hidden [clip-path:ellipse(110%_100%_at_50%_0%)] bg-[#ff7293]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fff4f6]/90 z-10" />
        <img
          className="w-full h-full object-cover mix-blend-multiply opacity-80"
          alt="MShoppy Community"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17Odz0VuEd9507iy5ggYedrO4p3lV7PTifqh_NIFIjMwYs7F7xvv7dJPF3VZ6Z11llVLVw5xtNaMn4qJcaZlijJ5VYBvw4lkhDG0GaD_3mqVC6fp_xGCsC_hT5Kl2Yvq85636Vd8iv-Nfvmw3A5Otx5SstITEeJ4evOSjB2EZqGwhDYhrJHL4AtEO6BSjDVRSWi-AhA3f8HCmXuKT-yo3NUOxOwpD4XR4x4e-hJLySUEWwuFS8o8Obusm8jNEjV35CWqYtkzkNNg"
        />
        {/* Floating Brand Chip */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/80 backdrop-blur-[20px] px-6 py-2 rounded-full border border-white/40 shadow-[0_12px_40px_rgba(74,33,53,0.06)] flex items-center gap-2.5">
            <img src="/mshoppy-logo.png" alt="MShoppy" className="w-7 h-7 rounded-lg object-contain" />
            <span className="text-[#b7004d] font-black tracking-tighter text-xl">
              MSHOPPY
            </span>
          </div>
        </div>
      </div>

      {/* Content Canvas */}
      <main className="w-full max-w-md px-6 -mt-12 z-30 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-10 w-full">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4a2135] mb-2">
            Login or Signup
          </h1>
          <p className="text-[#7d4d62] font-medium opacity-70">
            Join our curated community of resellers
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-white p-8 rounded-[3rem] shadow-[0_12px_40px_rgba(74,33,53,0.06)] space-y-6">
          <form onSubmit={handleMobileLogin} className="space-y-6">
            {/* Mobile Number Input */}
            <div className="space-y-2">
              <label
                htmlFor="mobile-input"
                className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#7d4d62] px-1 block"
              >
                Mobile Number
              </label>

              <div
                className={`relative flex items-center bg-[#ffecf1] rounded-[2rem] group transition-all duration-300 focus-within:ring-2 ${
                  error
                    ? 'ring-2 ring-red-500/50'
                    : 'focus-within:ring-[#b7004d]/20'
                }`}
              >
                <div className="flex items-center px-4 py-4 border-r border-[#d79db5]/20 select-none cursor-pointer">
                  <span className="text-[#4a2135] font-bold">+91</span>
                  {/* Real Chevron Down SVG Icon */}
                  <svg
                    className="w-4 h-4 text-[#7d4d62] ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <input
                  id="mobile-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 font-semibold text-[#4a2135] placeholder:text-[#d79db5]/60 outline-none"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-xs text-red-600 font-semibold px-1 mt-1">
                  {error}
                </p>
              )}
            </div>

            {/* Primary Action Button (Exact Original py-5 rounded-[2rem]) */}
            <button
              type="submit"
              className="w-full bg-gradient-to-br from-[#b7004d] to-[#ff7293] text-white font-bold py-5 rounded-[2rem] shadow-[0_12px_40px_rgba(74,33,53,0.06)] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Continue
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center justify-center space-x-4 opacity-30">
            <div className="h-[1px] flex-grow bg-[#d79db5]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a2135]">
              OR
            </span>
            <div className="h-[1px] flex-grow bg-[#d79db5]" />
          </div>

          {/* Secondary Actions (Exact Original py-4 rounded-[2rem]) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-[#ffecf1] hover:bg-[#ffd8e6] transition-colors py-4 rounded-[2rem] cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-[#4a2135] font-semibold">
                Continue with Google
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUser('user@theatelier.com');
                setIsLoggedIn(true);
              }}
              className="w-full py-3 text-[#b7004d] font-bold text-sm hover:underline underline-offset-4 transition-all cursor-pointer"
            >
              Login with Email
            </button>

            <div className="pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/dropshipper-login')}
                className="w-full py-3 px-4 bg-gray-950 hover:bg-gray-850 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-95"
              >
                <span className="text-[#FF3F6C]">🏬</span>
                <span>Are you a Dropshipper? B2B Portal Login →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="mt-12 mb-8 text-center px-4">
          <p className="text-xs text-[#7d4d62] leading-relaxed opacity-60">
            By continuing, you agree to our{' '}
            <a
              href="#terms"
              className="text-[#4a2135] font-bold border-b border-[#d79db5]"
            >
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a
              href="#privacy"
              className="text-[#4a2135] font-bold border-b border-[#d79db5]"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Community Badge */}
        <div className="flex items-center space-x-2 bg-[#b5a4ff]/30 px-4 py-2 rounded-full mb-10">
          <svg
            className="w-4 h-4 text-[#5f4ab3]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49-4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f4ab3]">
            Trusted by 10M+ Resellers
          </span>
        </div>
      </main>
    </div>
  );
}