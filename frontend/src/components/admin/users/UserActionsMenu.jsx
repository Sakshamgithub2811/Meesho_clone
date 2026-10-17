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
import { MoreVertical, Trash2 } from 'lucide-react';

const ROLES = ['CUSTOMER', 'SUPPLIER', 'RESELLER', 'DROPSHIPPER', 'DRIVER', 'ADMIN'];

export default function UserActionsMenu({
  user,
  currentAdminId,
  actionLoadingId,
  onRoleChange,
  onDeleteUser
}) {
  const isCurrentAdmin = user.id === currentAdminId;
  const isLoading = actionLoadingId === user.id;

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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
          Manage User Role
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
