import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../utils/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import AuthLayout from '../../components/layout/AuthLayout'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      
      setMessage("Password reset link has been sent to your email!");
      setLoading(false);
      
      // Go back to login automatically after 3 seconds
      setTimeout(() => {
        navigate(-1);
      }, 3000);

    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Please try again.");
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
          placeholder="admin@mshoppy.com" 
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
        className="w-full bg-gradient-to-br from-[#b7004d] to-[#ff7293] text-white font-bold py-6 rounded-[2rem] shadow-md hover:scale-[0.98] transition-transform" 
        disabled={loading}
      >
        {loading ? 'Sending Link...' : 'Send Reset Link'}
      </Button>

      {/* Back to Login Link */}
      <div className="text-center pt-2">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="text-sm text-[#b7004d] hover:underline font-bold"
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
