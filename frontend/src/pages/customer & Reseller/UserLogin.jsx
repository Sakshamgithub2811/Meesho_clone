import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { loginCustomer } from '../../services/customerAuthService';
import axios from 'axios';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect') || '/user-home';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

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

      const endpoint = isRegistering
        ? 'http://localhost:5000/api/v1/user-auth/register'
        : 'http://localhost:5000/api/v1/user-auth/login';

      let userData;
      try {
        const response = await axios.post(endpoint, {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName
        });
        userData = response.data.user;
      } catch (apiErr) {
        console.warn('Backend API fallback for user auth:', apiErr.message);
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName || firebaseUser.displayName || email.split('@')[0],
          role: 'CUSTOMER',
          walletBalance: 12840,
        };
      }

      userData.role = 'CUSTOMER';

      // Save to Redux & Local storage auth service
      dispatch(loginSuccess(userData));
      await loginCustomer({
        email: userData.email,
        fullName: userData.fullName,
      }).catch(() => {});

      navigate(redirectParam);

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email is already registered.');
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Invalid Login Credentials!');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-login-email">User Email</Label>
        <Input 
          id="user-login-email" 
          type="email" 
          placeholder="user@mshoppy.com" 
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-login-password">Password</Label>
        <Input 
          id="user-login-password" 
          type="password" 
          placeholder="••••••••" 
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      {error && !loading && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md cursor-pointer transition-all">
        {loading ? 'Logging in...' : 'Secure Login'}
      </Button>
    </form>
  );

  const registerForm = (
    <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-register-name">Full Name</Label>
        <Input 
          id="user-register-name" 
          type="text" 
          placeholder="Your Full Name" 
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-register-email">User Email</Label>
        <Input 
          id="user-register-email" 
          type="email" 
          placeholder="user@mshoppy.com" 
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-register-password">Password</Label>
        <Input 
          id="user-register-password" 
          type="password" 
          placeholder="••••••••" 
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      {error && !loading && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md cursor-pointer transition-all">
        {loading ? 'Registering...' : 'Register & Enter'}
      </Button>
    </form>
  );

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
