import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { loginSuccess } from '../redux/userSlice';
import { loginCustomer } from '../services/customerAuthService';
import { loginAffiliate } from '../services/affiliateAuthService';
import { saveAffiliateApp } from '../services/affiliateSessionStore';
import axios from 'axios';
import { toast } from 'sonner';

export const useGoogleAuth = (role = 'USER', customRedirect = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Google Popup open karna
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

      // 2. Apne Backend par user ka data bhejna
      const response = await axios.post(`${backendUrl}/auth/google`, {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        avatar: user.photoURL,
        role: role,
      });

      const backendUserData = response.data.user;
      const token = response.data.token;

      // 3. Save to Redux & Local storage auth service
      dispatch(loginSuccess(backendUserData));

      if (backendUserData.role === 'AFFILIATE') {
        saveAffiliateApp({
          fullName: backendUserData.fullName,
          email: backendUserData.email,
          kycStatus: 'APPROVED',
          referralCode: backendUserData.referralCode || 'MEESHO500',
          role: 'AFFILIATE',
        });
        await loginAffiliate({
          email: backendUserData.email,
          fullName: backendUserData.fullName,
          referralCode: backendUserData.referralCode,
        }).catch(() => {});
      } else {
        await loginCustomer({
          email: backendUserData.email,
          fullName: backendUserData.fullName,
        }).catch(() => {});
      }

      toast.success(`Welcome, ${backendUserData.fullName || 'User'}! Logged in with Google.`);

      // 4. Redirect to destination
      const destination = customRedirect || (backendUserData.role === 'AFFILIATE' ? '/affiliate-panel' : '/user-home');
      navigate(destination);

      return { success: true, user: backendUserData, token };

    } catch (err) {
      console.error('Google Auth failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled by user.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google popup was blocked by browser. Please allow popups.');
      } else {
        setError(err.message || 'Google authentication failed.');
      }
      toast.error(err.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled' : 'Google Sign-in failed');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading, error };
};
