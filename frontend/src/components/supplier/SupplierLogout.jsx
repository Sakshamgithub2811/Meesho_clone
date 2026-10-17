import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutConfirmDialog from '../ui/LogoutConfirmDialog';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import supplierApiService, { clearAuthSession } from '../../services/supplierApiService';

/**
 * Standard Supplier Logout Component
 * Renders the same sleek pill button as user-home, with Shadcn confirmation dialog
 */
export default function SupplierLogout({ 
  className = '', 
  label = 'Logout', 
  onNavigate,
  showLabel = true 
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSupplierLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) {
        await supplierApiService.logoutSupplier().catch(() => {});
      }
      if (auth) {
        await signOut(auth).catch(() => {});
      }
    } catch (err) {
      console.warn('Supplier logout warning:', err);
    } finally {
      clearAuthSession();
      localStorage.removeItem('meesho_supplier_token');
      localStorage.removeItem('meesho_supplier_user');
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplier');
      sessionStorage.clear();

      if (onNavigate) {
        onNavigate('/supplier-login');
      } else {
        navigate('/supplier-login');
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer active:scale-95 shrink-0 select-none ${className}`}
        title="Logout Supplier Account"
      >
        <span className="material-symbols-outlined text-base">logout</span>
        {showLabel && <span>{label}</span>}
      </button>

      {/* Shadcn Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showConfirm}
        setIsOpen={setShowConfirm}
        roleLabel="Supplier"
        title="Log out of Supplier account?"
        description="Are you sure you want to log out? You will need to sign in again to access your supplier portal, catalog and orders."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={handleSupplierLogout}
      />
    </>
  );
}
