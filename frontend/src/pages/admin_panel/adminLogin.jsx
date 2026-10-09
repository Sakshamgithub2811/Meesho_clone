import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import axios from 'axios';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        ? 'http://localhost:5000/api/v1/admin-auth/register'
        : 'http://localhost:5000/api/v1/admin-auth/login';

      const response = await axios.post(endpoint, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: fullName
      });

      dispatch(loginSuccess(response.data.user));
      navigate('/admin-panel1'); // Routing to the new dashboard panel

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email is already registered.');
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') setError('Invalid Login Credentials!');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Admin Email</Label>
        <Input 
          id="login-email" 
          type="email" 
          placeholder="admin@mshoppy.com" 
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input 
          id="login-password" 
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
            onClick={() => navigate('/forgot-password')} 
            className="text-xs font-bold text-[#b7004d] hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
      {error && !loading && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md">
        {loading ? 'Logging in...' : 'Secure Login'}
      </Button>
    </form>
  );

  const registerForm = (
    <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Full Name</Label>
        <Input 
          id="register-name" 
          type="text" 
          placeholder="Your Full Name" 
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Admin Email</Label>
        <Input 
          id="register-email" 
          type="email" 
          placeholder="admin@mshoppy.com" 
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input 
          id="register-password" 
          type="password" 
          placeholder="••••••••" 
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required 
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30"
        />
      </div>
      {error && !loading && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-[#b7004d] hover:bg-[#ff7293] text-white rounded-xl py-5 shadow-md">
        {loading ? 'Registering...' : 'Register & Enter'}
      </Button>
    </form>
  );

  return (
    <AuthLayout
      title="Admin Access"
      subtitle="Secure portal for authorized personnel"
      roleName="ADMIN"
      loginContent={loginForm}
      registerContent={registerForm}
    />
  );
}
