import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import axios from 'axios';


export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;


      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const firebaseUser = userCredential.user;
      // const token = await firebaseUser.getIdToken();
      // console.log("MERA FIREBASE TOKEN YEH HAI:", token);

      // 2. Backend API Call (Ab hum fullName bhi bhej rahe hain)
      const endpoint = isRegistering
        ? 'http://localhost:5000/api/v1/admin-auth/register'
        : 'http://localhost:5000/api/v1/admin-auth/login';

      const response = await axios.post(endpoint, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: isRegistering ? fullName : undefined
      });

      const data = response.data;


      // 3. Save to Redux & Redirect
      dispatch(loginSuccess(data.user));
      navigate('/admin-panel');

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email is already registered.');
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') setError('Invalid Login Credentials!');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fff4f6] text-[#4a2135] min-h-screen flex flex-col items-center overflow-x-hidden font-sans">
      <div className="relative w-full h-[353px] overflow-hidden [clip-path:ellipse(110%_100%_at_50%_0%)] bg-[#ff7293]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fff4f6]/90 z-10" />
        <img className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="MShoppy Admin" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17Odz0VuEd9507iy5ggYedrO4p3lV7PTifqh_NIFIjMwYs7F7xvv7dJPF3VZ6Z11llVLVw5xtNaMn4qJcaZlijJ5VYBvw4lkhDG0GaD_3mqVC6fp_xGCsC_hT5Kl2Yvq85636Vd8iv-Nfvmw3A5Otx5SstITEeJ4evOSjB2EZqGwhDYhrJHL4AtEO6BSjDVRSWi-AhA3f8HCmXuKT-yo3NUOxOwpD4XR4x4e-hJLySUEWwuFS8o8Obusm8jNEjV35CWqYtkzkNNg" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/80 backdrop-blur-[20px] px-6 py-2 rounded-full border border-white/40 shadow-[0_12px_40px_rgba(74,33,53,0.06)] flex items-center gap-2.5">
            <span className="text-[#b7004d] font-black tracking-tighter text-xl">MSHOPPY ADMIN</span>
          </div>
        </div>
      </div>

      <main className="w-full max-w-md px-6 -mt-12 z-30 flex flex-col items-center">
        <div className="text-center mb-10 w-full">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4a2135] mb-2">
            {isRegistering ? 'Register New Admin' : 'Admin Access'}
          </h1>
          <p className="text-[#7d4d62] font-medium opacity-70">Secure portal for authorized personnel</p>
        </div>

        <div className="w-full bg-white p-8 rounded-[3rem] shadow-[0_12px_40px_rgba(74,33,53,0.06)] space-y-6">
          <form onSubmit={handleAdminAuth} className="space-y-6">

            {/* Naya Full Name Input (Sirf Register mode me dikhega) */}
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#7d4d62] px-1 block">Full Name</label>
                <div className="relative flex items-center bg-[#ffecf1] rounded-[2rem] focus-within:ring-2 focus-within:ring-[#b7004d]/20">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your real name"
                    className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 font-semibold text-[#4a2135] placeholder:text-[#d79db5]/60 outline-none"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#7d4d62] px-1 block">Admin Email</label>
              <div className={`relative flex items-center bg-[#ffecf1] rounded-[2rem] focus-within:ring-2 ${error ? 'ring-2 ring-red-500/50' : 'focus-within:ring-[#b7004d]/20'}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 font-semibold text-[#4a2135] outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#7d4d62] px-1 block">Password</label>
              <div className={`relative flex items-center bg-[#ffecf1] rounded-[2rem] focus-within:ring-2 ${error ? 'ring-2 ring-red-500/50' : 'focus-within:ring-[#b7004d]/20'}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 font-semibold text-[#4a2135] outline-none"
                  required
                />
              </div>
              {error && <p className="text-xs text-red-600 font-semibold px-1 mt-2 text-center">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-br from-[#b7004d] to-[#ff7293] text-white font-bold py-5 rounded-[2rem] shadow-lg mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}`}
            >
              {loading ? 'Processing...' : (isRegistering ? 'Register & Enter' : 'Secure Login')}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="w-full py-2 text-[#b7004d] font-bold text-sm hover:underline transition-all cursor-pointer"
          >
            {isRegistering ? 'Already an Admin? Login' : 'Need to register? Sign Up'}
          </button>
        </div>
      </main>
    </div>
  );
}
