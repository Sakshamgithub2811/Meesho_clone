import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { loginAffiliate } from '../../services/affiliateAuthService';
import { saveAffiliateApp } from '../../services/affiliateSessionStore';
import axios from 'axios';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import GoogleAuthButton from '@/components/ui/GoogleAuthButton';

export default function AffiliateLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect') || '/affiliate-panel';

  const { loginWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleAuth('AFFILIATE', redirectParam);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [referralTag, setReferralTag] = useState('');

  const handleAuth = async (e, isRegistering) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      const email = isRegistering ? registerEmail : loginEmail;
      const password = isRegistering ? registerPassword : loginPassword;
      const fullName = isRegistering ? registerName : undefined;

      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const firebaseUser = userCredential.user;

      const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';
      const endpoint = isRegistering
        ? `${apiBase}/affiliate-auth/register`
        : `${apiBase}/affiliate-auth/login`;

      const response = await axios.post(endpoint, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: fullName,
        referralCode: isRegistering ? referralTag : undefined
      });

      const affiliateData = {
        ...response.data.user,
        role: 'AFFILIATE',
      };

      // Save to Redux & Affiliate Session Storage
      dispatch(loginSuccess(affiliateData));
      
      saveAffiliateApp({
        fullName: affiliateData.fullName,
        email: affiliateData.email,
        kycStatus: 'APPROVED',
        referralCode: affiliateData.referralCode || 'MEESHO500',
        role: 'AFFILIATE'
      });

      await loginAffiliate({
        email: affiliateData.email,
        fullName: affiliateData.fullName,
        referralCode: affiliateData.referralCode
      }).catch(() => {});

      navigate(redirectParam);

    } catch (err) {
      console.error('Affiliate auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid Login Credentials!');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.response?.data?.message || err.response?.data?.error) {
        setError(err.response.data.message || err.response.data.error);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="affiliate-login-email">Affiliate Email</Label>
        <Input 
          id="affiliate-login-email" 
          type="email" 
          placeholder="affiliate@mshoppy.com" 
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="affiliate-login-password">Password</Label>
        <Input 
          id="affiliate-login-password" 
          type="password" 
          placeholder="••••••••" 
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
        <div className="flex justify-end pt-1">
          <button 
            type="button" 
            onClick={() => navigate('/forgot-password?from=/affiliate-login')} 
            className="text-xs font-bold text-[#b7004d] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
      </div>
      {(error || googleError) && !loading && !googleLoading && (
        <p className="text-xs text-red-600 font-semibold text-center">{error || googleError}</p>
      )}
      <Button type="submit" disabled={loading || googleLoading} className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md cursor-pointer transition-all">
        {loading ? 'Logging in...' : 'Affiliate Login'}
      </Button>

      <GoogleAuthButton 
        onClick={loginWithGoogle} 
        isLoading={googleLoading} 
        label="Continue with Google" 
      />
    </form>
  );

  const registerForm = (
    <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="affiliate-register-name">Full Name</Label>
        <Input 
          id="affiliate-register-name" 
          type="text" 
          placeholder="Your Full Name / Creator Name" 
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="affiliate-register-email">Affiliate Email</Label>
        <Input 
          id="affiliate-register-email" 
          type="email" 
          placeholder="affiliate@mshoppy.com" 
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="affiliate-register-password">Password</Label>
        <Input 
          id="affiliate-register-password" 
          type="password" 
          placeholder="••••••••" 
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="affiliate-register-referral">Custom Referral Tag (Optional)</Label>
        <Input 
          id="affiliate-register-referral" 
          type="text" 
          placeholder="e.g. MEESHOVIP" 
          value={referralTag}
          onChange={(e) => setReferralTag(e.target.value.toUpperCase())}
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      {(error || googleError) && !loading && !googleLoading && (
        <p className="text-xs text-red-600 font-semibold text-center">{error || googleError}</p>
      )}
      <Button type="submit" disabled={loading || googleLoading} className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md cursor-pointer transition-all">
        {loading ? 'Registering...' : 'Register as Affiliate'}
      </Button>

      <GoogleAuthButton 
        onClick={loginWithGoogle} 
        isLoading={googleLoading} 
        label="Sign up with Google" 
      />
    </form>
  );

  return (
    <AuthLayout
      title="Affiliate Access"
      subtitle="Secure portal for affiliate partners & creators"
      roleName="AFFILIATE"
      loginContent={loginForm}
      registerContent={registerForm}
    />
  );
}
