import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { loginDropshipperApi, registerDropshipperApi } from '../../services/dropshipperService';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function DropshipperLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // 1. Handle Login & Registration
  const handleAuth = async (e, isRegistering) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = isRegistering ? registerEmail.trim() : loginEmail.trim();
      const password = isRegistering ? registerPassword : loginPassword;

      if (!email || !password) {
        toast.error('Please enter all required credentials.');
        setLoading(false);
        return;
      }

      if (isRegistering) {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        // Firebase Client Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Backend Database Sync with DROPSHIPPER role
        await registerDropshipperApi({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: registerName.trim() || 'Verified Dropshipper',
          phone: registerPhone.trim() || null,
          businessName: registerName.trim() || 'Direct Store'
        });

        // Registration complete: User must NOT go to dashboard immediately.
        // User must receive toast and be switched to Login tab.
        toast.success('Account created successfully! Please sign in with your credentials.');

        // Prefill email for login and switch tab
        setLoginEmail(email);
        setLoginPassword('');
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPhone('');
        setRegisterPassword('');
        setActiveTab('login');

      } else {
        // Firebase Client Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Backend Database Role Verification
        const dbResponse = await loginDropshipperApi({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email
        });

        const userData = dbResponse.user;

        // Strict Role Guard
        if (userData.role !== 'DROPSHIPPER') {
          await signOut(auth);
          toast.error('Access Denied: Only verified dropshippers can access this portal.');
          setLoading(false);
          return;
        }

        // Save session in Redux & LocalStorage
        dispatch(loginSuccess(userData));
        localStorage.setItem('meesho_dropshipper_session', JSON.stringify({
          isLoggedIn: true,
          dropshipperId: userData.id,
          name: userData.fullName,
          email: userData.email,
          role: userData.role
        }));

        toast.success(`Welcome back, ${userData.fullName || 'Dropshipper'}!`);
        navigate('/dropshipper-dashboard');
      }

    } catch (err) {
      console.error('Dropshipper Auth Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login.');
        setActiveTab('login');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password credentials.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);

    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      toast.success('Password reset link sent to your email! Please check your inbox.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email.');
      } else {
        toast.error(err.message || 'Failed to send reset email.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Login Form Content
  const loginForm = (
    <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dropshipper-email">Dropshipper Email</Label>
        <Input 
          id="dropshipper-email" 
          type="email" 
          placeholder="partner@auratrends.shop" 
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="dropshipper-password">Password</Label>
          <button
            type="button"
            onClick={() => {
              setForgotEmail(loginEmail);
              setShowForgotModal(true);
            }}
            className="text-xs text-[#b7004d] hover:underline font-semibold cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        <Input 
          id="dropshipper-password" 
          type="password" 
          placeholder="••••••••" 
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md cursor-pointer transition-all duration-200 font-bold text-base"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Signing In...
          </span>
        ) : 'Secure Dropshipper Login'}
      </Button>

      {/* Direct link to 4-Step KYC Registration */}
      <div className="pt-2 text-center">
        <p className="text-xs text-gray-500">
          Want full B2B supplier catalog access?{' '}
          <button
            type="button"
            onClick={() => navigate('/dropshipper-register')}
            className="text-[#b7004d] font-bold hover:underline cursor-pointer"
          >
            Start 4-Step KYC Registration →
          </button>
        </p>
      </div>
    </form>
  );

  // Register Form Content
  const registerForm = (
    <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Store / Brand Name</Label>
        <Input 
          id="register-name" 
          type="text" 
          placeholder="Aura Trends Direct" 
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Business Email</Label>
        <Input 
          id="register-email" 
          type="email" 
          placeholder="seller@yourbrand.com" 
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-phone">Mobile Number (Optional)</Label>
        <Input 
          id="register-phone" 
          type="tel" 
          placeholder="+91 98765 43210" 
          value={registerPhone}
          onChange={(e) => setRegisterPhone(e.target.value)}
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Create Password</Label>
        <Input 
          id="register-password" 
          type="password" 
          placeholder="••••••••" 
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required 
          minLength={6}
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md cursor-pointer transition-all duration-200 font-bold text-base"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Creating Account...
          </span>
        ) : 'Create Dropshipper Account'}
      </Button>

      <div className="p-3 bg-[#ffecf1] border border-[#ff7293]/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-[#b7004d]">Have GST / MSME / Bank docs?</p>
          <p className="text-gray-600 text-[11px]">Instant approval with our 4-Step KYC flow.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dropshipper-register')}
          className="bg-[#b7004d] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#ff7293] transition shrink-0 cursor-pointer"
        >
          Open 4-Step KYC
        </button>
      </div>
    </form>
  );

  return (
    <>
      <AuthLayout
        title="Dropshipper Access"
        subtitle="Secure B2B portal for verified merchants and dropshippers"
        roleName="DROPSHIPPER"
        loginContent={loginForm}
        registerContent={registerForm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-[#4a2135]">Reset Your Password</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Enter your registered dropshipper email address to receive a password reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="partner@auratrends.shop"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-4 font-bold cursor-pointer"
              >
                {forgotLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
