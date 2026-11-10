import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { loginSuccess } from '../redux/userSlice';
import { loginCustomer } from '../services/customerAuthService';
import { loginAffiliate } from '../services/affiliateAuthService';
import { getAffiliateApp, saveAffiliateApp } from '../services/affiliateSessionStore';
import axios from 'axios';
import { toast } from 'sonner';
import { API_V1_BASE } from '../config/apiConfig';

export const useGoogleAuth = (role = 'USER', customRedirect = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Google Popup open karna (Force account picker dialog)
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const backendUrl = API_V1_BASE;

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
        // Affiliate session store me user save karna
        await loginAffiliate({
          email: backendUserData.email,
          fullName: backendUserData.fullName,
          referralCode: backendUserData.referralCode,
        }).catch(() => {});

        // Check if user has already submitted KYC
        const existingKyc = getAffiliateApp();
        const currentKycStatus = existingKyc?.status || existingKyc?.kycStatus || backendUserData.kycStatus;

        if (currentKycStatus === 'Approved' || currentKycStatus === 'APPROVED') {
          toast.success(`Welcome back, ${backendUserData.fullName || 'Partner'}! Accessing Affiliate Hub.`);
          navigate(customRedirect || '/affiliate-panel');
        } else if (currentKycStatus === 'Under Review' || currentKycStatus === 'Pending' || currentKycStatus === 'PENDING') {
          toast.info('Your Affiliate KYC is Under Review by Compliance Desk ⏳');
          navigate('/affiliate-kyc-status');
        } else if (currentKycStatus === 'Rejected' || currentKycStatus === 'REJECTED') {
          toast.error('Your previous KYC submission needs revision.');
          navigate('/affiliate-kyc-status');
        } else {
          // New User - Has NOT filled KYC form yet! Redirect to /affiliate-kyc
          toast.info(`Welcome, ${backendUserData.fullName || 'Partner'}! Please complete your KYC registration.`);
          navigate('/affiliate-kyc');
        }
      } else {
        await loginCustomer({
          email: backendUserData.email,
          fullName: backendUserData.fullName,
        }).catch(() => {});

        toast.success(`Welcome, ${backendUserData.fullName || 'User'}! Logged in with Google.`);
        const destination = customRedirect || '/user-home';
        navigate(destination);
      }

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
