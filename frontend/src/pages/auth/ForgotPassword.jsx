import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../utils/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import AuthLayout from '../../components/layout/AuthLayout'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromParam = searchParams.get('from');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBack = (e) => {
    e?.preventDefault();
    if (fromParam) {
      navigate(fromParam);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 2 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/supplier-login');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      
      setMessage("✅ Password reset link has been sent to your email! Please check your Inbox and Spam folder.");
      setLoading(false);
      
      // Go back to login automatically after 3 seconds
      setTimeout(() => {
        handleBack();
      }, 3000);

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address. Please check and try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many requests sent. Please wait a few minutes before trying again.");
      } else {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
      setLoading(false);
    }
  };

  const forgotContent = (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Registered Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 text-base rounded-xl focus-visible:ring-[#b7004d]/30 w-full"
          required 
        />
      </div>
      
      {/* Messages */}
      {message && <p className="text-sm text-green-600 font-semibold px-2">{message}</p>}
      {error && <p className="text-sm text-red-500 font-semibold px-2">{error}</p>}

      {/* Primary Action Button */}
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-br from-[#b7004d] to-[#ff7293] text-white font-bold py-6 rounded-[2rem] shadow-md hover:scale-[0.98] transition-transform cursor-pointer" 
        disabled={loading}
      >
        {loading ? 'Sending Link...' : 'Send Reset Link'}
      </Button>

      {/* Back to Login Link */}
      <div className="text-center pt-2">
        <button 
          type="button" 
          onClick={handleBack} 
          className="text-sm text-[#b7004d] hover:text-[#8a0039] hover:underline font-bold cursor-pointer transition py-1 px-3"
        >
          ← Back to Login
        </button>
      </div>
    </form>
  );

  return (
    <AuthLayout 
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
      roleName="Security" 
      loginContent={forgotContent}
    />
  );
}
