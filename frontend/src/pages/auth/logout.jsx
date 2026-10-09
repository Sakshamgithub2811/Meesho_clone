import React, { useState } from 'react';
import useLogout from '../../hooks/useLogout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';

export { useLogout };

/**
 * Ready-to-use Logout Button Component for User Panel
 * Includes Shadcn confirmation popup with background blur
 */
export default function Logout({ className = '', label = 'Logout' }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const handleLogout = useLogout('/');

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer active:scale-95 shrink-0 ${className}`}
        title={label}
      >
        <span className="material-symbols-outlined text-base">logout</span>
        <span>{label}</span>
      </button>

      {/* Shadcn Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showConfirm}
        setIsOpen={setShowConfirm}
        roleLabel="User"
        onConfirm={handleLogout}
      />
    </>
  );
}

/**
 * Route Page for /logout (Auto-executes logout when navigated to)
 */
export function LogoutPage() {
  const handleLogout = useLogout('/');

  React.useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 animate-bounce">
        <span className="material-symbols-outlined text-3xl">logout</span>
      </div>
      <h2 className="text-lg font-bold text-slate-800">Signing you out...</h2>
      <p className="text-xs text-slate-500 mt-1">Clearing your session securely.</p>
    </div>
  );
}
