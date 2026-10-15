import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import FilterBar from '../../common/FilterBar';
import UserTable from './UserTable';

const ROLES = [
  { id: 'ALL', label: 'All Roles' },
  { id: 'CUSTOMER', label: 'CUSTOMER' },
  { id: 'SUPPLIER', label: 'SUPPLIER' },
  { id: 'RESELLER', label: 'RESELLER' },
  { id: 'DROPSHIPPER', label: 'DROPSHIPPER' },
  { id: 'DRIVER', label: 'DRIVER' },
  { id: 'ADMIN', label: 'ADMIN' }
];

/**
 * AdminUsersManagement Component
 * Main coordinator for user management, orchestrating
 * UserFilterBar and UserTable.
 */
export default function AdminUsersManagement() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // 1. Fetch Users from Backend
  const fetchUsers = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedRole !== 'ALL') params.role = selectedRole;

      const response = await axios.get('http://localhost:5000/api/v1/admin-users', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setUsers(response.data.users || []);
        if (isManual) {
          toast.success("Users Synced", {
            description: "Users list refreshed from database."
          });
        }
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      toast.error("Failed to load users", {
        description: err.response?.data?.error || "Could not fetch user list."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUsers();
      }
    });
    return () => unsubscribe();
  }, [selectedRole]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // 2. Change User Role
  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoadingId(userId);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const response = await axios.put(
        `http://localhost:5000/api/v1/admin-users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success("Role Updated", {
          description: `User role changed to ${newRole}`
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Role Update Failed", {
        description: err.response?.data?.error || "Failed to change role."
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      setActionLoadingId(userId);
      const token = (await auth.currentUser?.getIdToken()) || currentUser?.id;

      const response = await axios.delete(
        `http://localhost:5000/api/v1/admin-users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("User Deleted", {
          description: `${userName} has been removed from system.`
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete Failed", {
        description: err.response?.data?.error || "Failed to delete user."
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* ── COMMON SEARCH & ROLE FILTER BAR ─────────────────── */}
      <FilterBar
        tabs={ROLES}
        activeTab={selectedRole}
        onTabChange={setSelectedRole}
        totalCount={users.length}
        countLabel="Users"
        onRefresh={() => fetchUsers(true)}
        refreshing={refreshing}
        searchPlaceholder="Search by name, email, or phone..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* ── USERS DATA TABLE ─────────────────────────────────── */}
      <UserTable
        users={users}
        loading={loading}
        currentAdminId={currentUser?.id}
        actionLoadingId={actionLoadingId}
        onRoleChange={handleRoleChange}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}
