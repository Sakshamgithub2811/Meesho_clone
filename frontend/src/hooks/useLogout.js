import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';

export const useLogout = (redirectPath = '/') => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Firebase se bahar aana
      await signOut(auth);
      
      // 2. Browser ka purana data/tokens saaf karna
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. User ko seedha login page par bhej dena
      navigate(redirectPath);
      
      // 4. Success message dikhana
      toast.success("Successfully logged out!");
      
    } catch (error) {
      console.error("Logout error: ", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return handleLogout;
};
