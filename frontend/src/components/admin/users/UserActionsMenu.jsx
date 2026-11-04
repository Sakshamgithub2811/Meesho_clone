import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { MoreVertical, Trash2, Edit, UserCheck, UserX } from 'lucide-react';

const ROLES = ['CUSTOMER', 'SUPPLIER', 'RESELLER', 'DROPSHIPPER', 'DRIVER', 'ADMIN'];

export default function UserActionsMenu({
  user,
  currentAdminId,
  actionLoadingId,
  onRoleChange,
  onDeleteUser,
  onEditUser,
  onToggleStatus,
}) {
  const isCurrentAdmin = user.id === currentAdminId;
  const isLoading = actionLoadingId === user.id;
  const isActive = user.isActive !== false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 rounded-lg"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => onEditUser && onEditUser(user)}
          className="text-xs font-semibold text-gray-800 hover:text-[#b7004d] hover:bg-pink-50 cursor-pointer flex items-center gap-2"
        >
          <Edit className="h-3.5 w-3.5 text-[#b7004d]" />
          Edit User Profile & Pass
        </DropdownMenuItem>

        {/* Activate / Deactivate Toggle Option */}
        {!isCurrentAdmin && onToggleStatus && (
          isActive ? (
            <DropdownMenuItem
              onClick={() => onToggleStatus(user.id, false, user.fullName || user.email)}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer flex items-center gap-2"
            >
              <UserX className="h-3.5 w-3.5 text-amber-600" />
              Deactivate User Account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => onToggleStatus(user.id, true, user.fullName || user.email)}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              Activate User Account
            </DropdownMenuItem>
          )
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
          Quick Change Role
        </DropdownMenuLabel>
        
        {ROLES.filter((r) => r !== user.role).map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => onRoleChange(user.id, r)}
            className="text-xs font-medium cursor-pointer"
          >
            Set as {r}
          </DropdownMenuItem>
        ))}

        {!isCurrentAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDeleteUser(user.id, user.fullName || user.email)}
              className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


