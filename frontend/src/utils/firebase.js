import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBkNsdWIycbJ4GfJnmOZJWSVur_m38UNI4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'meesho-clone-d1709.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'meesho-clone-d1709',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'meesho-clone-d1709.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '108825967954995756730',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:108825967954995756730:web:abcdef',
};

let app = null;
let auth = null;
let googleProvider = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.warn('⚠️ Firebase initialization warning:', error?.message);
}

export { auth, googleProvider };
export default app;
