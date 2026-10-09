import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

/**
 * Shadcn-based Logout Confirmation Dialog
 * Specifically used for User and Affiliate roles
 */
export default function LogoutConfirmDialog({
  isOpen,
  setIsOpen,
  roleLabel = 'User',
  onConfirm,
  title,
  description,
  confirmText = 'Yes, Logout',
  cancelText = 'Cancel'
}) {
  if (!isOpen) return null;

  const defaultTitle = title || `Log out of ${roleLabel} account?`;
  const defaultDesc = description || `Are you sure you want to log out? You will need to sign in again to access your ${roleLabel.toLowerCase()} account.`;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-sm rounded-3xl p-6 text-center shadow-2xl">
        <AlertDialogHeader className="items-center">
          {/* Glowing Icon */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#b90041] dark:text-rose-400 mx-auto flex items-center justify-center mb-2 shadow-sm ring-6 ring-rose-50/70">
            <span className="material-symbols-outlined text-3xl">logout</span>
          </div>

          <AlertDialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
            {defaultTitle}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {defaultDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex items-center gap-3 mt-6 sm:justify-center">
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-2xl py-2.5 font-bold text-xs"
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              if (onConfirm) onConfirm();
            }}
            className="flex-1 rounded-2xl py-2.5 bg-[#b90041] hover:bg-[#a00037] text-white font-bold text-xs shadow-md shadow-[#b90041]/25"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
