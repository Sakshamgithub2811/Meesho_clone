import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { loginCustomer } from '../../services/customerAuthService';
import axios from 'axios';
import AuthLayout from '../../components/layout/AuthLayout';
import { API_V1_BASE } from '../../config/apiConfig';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import GoogleAuthButton from '@/components/ui/GoogleAuthButton';
import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Inbox
} from 'lucide-react';

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect') || '/user-home';

  const { loginWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleAuth('USER', redirectParam);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mode: 'AUTH_TABS' | 'AWAITING_EMAIL_VERIFICATION'
  const [authMode, setAuthMode] = useState('AUTH_TABS');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // State for new user registration email verification
  const [pendingRegisteredUser, setPendingRegisteredUser] = useState(null); // user profile data

  // Timers for resend cooldowns
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const apiBase = API_V1_BASE;

  // ─── 1. HANDLE REGISTRATION (OPTION A: BRANDED EMAIL VERIFICATION LINK) ───
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const firebaseUser = userCredential.user;

      // 2. Register user profile in backend database (backend automatically dispatches custom branded HTML verification email via SMTP)
      const endpoint = `${apiBase}/user-auth/register`;
      const response = await axios.post(endpoint, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: registerName
      });

      const userData = {
        ...response.data.user,
        role: 'CUSTOMER',
      };

      setPendingRegisteredUser(userData);
      setResendTimer(45);
      setSuccessMsg('');
      setAuthMode('AWAITING_EMAIL_VERIFICATION');

    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.response?.data?.message || err.response?.data?.error) {
        setError(err.response.data.message || err.response.data.error);
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user has verified their email link
  const handleCheckEmailVerification = async () => {
    setError('');
    setLoading(true);

    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {
          // Email successfully verified! Proceed to login & dashboard
          const userToSave = pendingRegisteredUser || {
            id: auth.currentUser.uid,
            email: auth.currentUser.email,
            fullName: registerName || auth.currentUser.email.split('@')[0],
            role: 'CUSTOMER'
          };

          dispatch(loginSuccess(userToSave));
          await loginCustomer({
            email: userToSave.email,
            fullName: userToSave.fullName,
          }).catch(() => { });

          navigate(redirectParam);
          return;
        } else {
          setError('Email not yet confirmed. Please open the link received in your inbox and try again.');
        }
      } else {
        setError('Session expired. Please log in again.');
        setAuthMode('AUTH_TABS');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification link (Uses custom backend designed email)
  const handleResendEmailVerification = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);

    try {
      await axios.post(`${apiBase}/user-auth/resend-verification`, {
        email: registerEmail,
        fullName: registerName
      });

      setResendTimer(45);
      setSuccessMsg('Fresh verification email sent. Please check spam/junk if not in primary inbox.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to resend email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. HANDLE LOGIN (EXISTING USER: DIRECT LOGIN WITHOUT OTP) ───
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanEmail = loginEmail.trim();

      // 1. Verify credentials directly with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
      const firebaseUser = userCredential.user;

      // 2. Fetch / sync user profile from database
      const loginEndpoint = `${apiBase}/user-auth/login`;
      const response = await axios.post(loginEndpoint, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || cleanEmail
      });

      const userData = {
        ...(response.data?.user || {}),
        id: response.data?.user?.id || firebaseUser.uid,
        email: response.data?.user?.email || firebaseUser.email || cleanEmail,
        fullName: response.data?.user?.fullName || firebaseUser.displayName || cleanEmail.split('@')[0],
        role: 'CUSTOMER',
      };

      // 3. Save to Redux & Local storage customer session
      dispatch(loginSuccess(userData));
      await loginCustomer({
        email: userData.email,
        fullName: userData.fullName,
      }).catch(() => { });

      // 4. Redirect immediately without OTP
      navigate(redirectParam);

    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid Email or Password! Please verify your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please reset password or try again later.');
      } else if (err.response?.data?.message || err.response?.data?.error) {
        setError(err.response.data.message || err.response.data.error);
      } else {
        setError(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. SCREEN CONTENT RENDERERS ───

  // Screen 1: Registration Form
  const registerForm = (
    <form onSubmit={handleRegister} className="space-y-2">
      <div className="space-y-0.5 text-left">
        <Label htmlFor="user-register-name" className="text-[11px] font-bold text-slate-700">Full Name</Label>
        <Input
          id="user-register-name"
          type="text"
          placeholder="Enter your full name"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required
          className="h-9 px-3 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-[#b7004d]/20 focus-visible:border-[#b7004d]"
        />
      </div>
      <div className="space-y-0.5 text-left">
        <Label htmlFor="user-register-email" className="text-[11px] font-bold text-slate-700">Email Address</Label>
        <Input
          id="user-register-email"
          type="email"
          placeholder="name@example.com"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required
          className="h-9 px-3 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-[#b7004d]/20 focus-visible:border-[#b7004d]"
        />
      </div>
      <div className="space-y-0.5 text-left">
        <Label htmlFor="user-register-password" className="text-[11px] font-bold text-slate-700">Password</Label>
        <Input
          id="user-register-password"
          type="password"
          placeholder="Minimum 6 characters"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required
          className="h-9 px-3 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-[#b7004d]/20 focus-visible:border-[#b7004d]"
        />
      </div>
      {(error || googleError) && !loading && !googleLoading && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-left flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error || googleError}</span>
        </div>
      )}
      <Button
        type="submit"
        disabled={loading || googleLoading}
        className="w-full h-9 bg-[#b7004d] hover:bg-[#9f0038] text-white rounded-xl font-bold shadow-xs shadow-[#b7004d]/20 cursor-pointer transition-all active:scale-[0.99] text-xs sm:text-sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Creating Account...
          </span>
        ) : (
          'Create Account & Send Verification'
        )}
      </Button>

      <GoogleAuthButton
        onClick={loginWithGoogle}
        isLoading={googleLoading}
        label="Sign up with Google"
      />

      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      <button
        type="button"
        onClick={() => navigate(redirectParam || '/user-home')}
        className="w-full h-8.5 flex items-center justify-center gap-2 px-4 rounded-xl border border-slate-200 hover:border-[#b7004d]/40 bg-slate-50 hover:bg-pink-50/60 text-slate-700 hover:text-[#b7004d] font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
      >
        <span>Continue as Guest</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#b7004d]" />
      </button>
    </form>
  );

  // Screen 2: Login Form
  const loginForm = (
    <form onSubmit={handleLogin} className="space-y-2">
      <div className="space-y-0.5 text-left">
        <Label htmlFor="user-login-email" className="text-[11px] font-bold text-slate-700">Email Address</Label>
        <Input
          id="user-login-email"
          type="email"
          placeholder="name@example.com"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
          className="h-9 px-3 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-[#b7004d]/20 focus-visible:border-[#b7004d]"
        />
      </div>
      <div className="space-y-0.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="user-login-password" className="text-[11px] font-bold text-slate-700">Password</Label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password?from=/user/login')}
            className="text-[11px] font-bold text-[#b7004d] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        <Input
          id="user-login-password"
          type="password"
          placeholder="••••••••"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          className="h-9 px-3 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-[#b7004d]/20 focus-visible:border-[#b7004d]"
        />
      </div>
      {(error || googleError) && !loading && !googleLoading && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-left flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error || googleError}</span>
        </div>
      )}
      <Button
        type="submit"
        disabled={loading || googleLoading}
        className="w-full h-9 bg-[#b7004d] hover:bg-[#9f0038] text-white rounded-xl font-bold shadow-xs shadow-[#b7004d]/20 cursor-pointer transition-all active:scale-[0.99] text-xs sm:text-sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      </Button>

      <GoogleAuthButton
        onClick={loginWithGoogle}
        isLoading={googleLoading}
        label="Continue with Google"
      />

      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      <button
        type="button"
        onClick={() => navigate(redirectParam || '/user-home')}
        className="w-full h-8.5 flex items-center justify-center gap-2 px-4 rounded-xl border border-slate-200 hover:border-[#b7004d]/40 bg-slate-50 hover:bg-pink-50/60 text-slate-700 hover:text-[#b7004d] font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
      >
        <span>Continue as Guest</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#b7004d]" />
      </button>
    </form>
  );

  // Screen 3: High-end Professional Email Verification View
  const emailVerificationView = (
    <div className="space-y-4 text-center">
      {/* 1. Hero Animated Floating Icon Badge */}
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-[#b7004d]/15 rounded-2xl blur-lg animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9f0038] via-[#b7004d] to-[#ff7293] p-[2px] shadow-lg shadow-[#b7004d]/20">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#b7004d]" />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. Recipient Email Info */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Verification link sent to
        </p>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 shadow-xs max-w-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate max-w-[260px] sm:max-w-[300px]">{registerEmail}</span>
        </div>
      </div>

      {/* 3. Steps Card */}
      <div className="bg-[#fff9fb] border border-[#fce4ec] rounded-2xl p-3.5 text-left space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#9f0038]">
          <ShieldCheck className="w-4 h-4 text-[#b7004d] shrink-0" />
          <span>Quick Activation Steps:</span>
        </div>
        <div className="space-y-2 text-xs text-slate-600 pl-0.5">
          <div className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#fde8ef] text-[#b7004d] font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <span>Check your inbox for an email from <strong className="text-slate-800 font-semibold">MShoppy Support</strong></span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#fde8ef] text-[#b7004d] font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <span>Click the <strong className="text-[#b7004d] font-semibold">Verify My Account</strong> button in the email</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic pt-0.5 border-t border-[#fce4ec]/60">
          Tip: If not in your inbox, please check your Spam or Promotions folder.
        </p>
      </div>

      {/* 4. Feedback Notifications */}
      {successMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5. Action Buttons & Shortcuts */}
      <div className="space-y-2.5 pt-1">
        <Button
          type="button"
          onClick={handleCheckEmailVerification}
          disabled={loading}
          className="w-full bg-[#b7004d] hover:bg-[#9f0038] text-white rounded-xl py-5 font-bold shadow-md shadow-[#b7004d]/20 cursor-pointer text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Checking Verification Status...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>I Have Verified My Email</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <button
            type="button"
            onClick={handleResendEmailVerification}
            disabled={resendTimer > 0 || loading}
            className={`font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#b7004d] hover:text-[#9f0038] hover:underline'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Resend Verification Email'}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('AUTH_TABS');
              setError('');
              setSuccessMsg('');
            }}
            className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  // ─── 4. RENDER LAYOUT BASED ON ACTIVE MODE ───
  if (authMode === 'AWAITING_EMAIL_VERIFICATION') {
    return (
      <AuthLayout
        title="Verify Your Email"
        subtitle="Complete this quick step to activate your account"
        roleName="USER"
        loginContent={emailVerificationView}
        registerContent={null}
      />
    );
  }

  return (
    <AuthLayout
      title="User Access"
      subtitle="Secure shopping portal for customers"
      roleName="USER"
      loginContent={loginForm}
      registerContent={registerForm}
    />
  );
}
