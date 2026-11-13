import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
// import { toast } from 'sonner';

export const useLogout = (redirectPath = '/') => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // 1. Firebase se sign out
      await signOut(auth);

      // 2. Redux state reset (purges currentUser and isAuthenticated)
      try {
        dispatch(logout());
      } catch (_) {}

      // 3. Complete auth session & user cache cleanup
      const authKeysToRemove = [
        'token',
        'user',
        'persist:root',
        'mshoppy_customer_token',
        'mshoppy_customer_user',
        'mshoppy_user_orders',
        'mshoppy_user_addresses',
        'mshoppy_wishlist',
        'mshoppy_selected_address',
        'mshoppy_user_pincode',
        'mshoppy_affiliate_token',
        'mshoppy_affiliate_user',
        'mshoppy_reseller_token',
        'mshoppy_reseller_user',
        'meesho_admin_token',
        'meesho_admin_user',
        'meesho_supplier_token',
        'meesho_supplier_user',
        'meesho_dropshipper_session'
      ];
      authKeysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (_) {}
      });
      try {
        sessionStorage.clear();
      } catch (_) {}

      // 3. User ko seedha login page par bhej dena
      navigate(redirectPath);

      // 4. Success message dikhana (if toast library is present)
      if (typeof toast !== 'undefined') {
        toast.success("Successfully logged out!");
      }
    } catch (error) {
      console.error("Logout error: ", error);
      if (typeof toast !== 'undefined') {
        toast.error("Logout failed. Please try again.");
      }
    }
  };

  return handleLogout;
};

export default useLogout;
