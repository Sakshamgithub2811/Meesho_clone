import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { auth } from '../../../utils/firebase';
import { useSelector } from 'react-redux';
import StaffHeaderBanner from './StaffHeaderBanner';
import StaffTable from './StaffTable';
import StaffModal from './StaffModal';
import { API_V1_BASE } from '../../../config/apiConfig';

export default function AdminStaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const currentUser = useSelector((state) => state.user?.currentUser);

  const getAuthToken = async () => {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) return idToken;
      }
    } catch (e) {
      console.warn('Firebase token retrieval error:', e);
    }
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      currentUser?.id ||
      'admin_master'
    );
  };

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res = await axios.get(`${API_V1_BASE}/admin-staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.success) {
        setStaffList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
      toast.error('Failed to load staff roster: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setModalOpen(true);
  };

  const handleSubmitStaffModal = async (formData) => {
    try {
      setActionLoading(true);
      const token = await getAuthToken();

      if (editingStaff) {
        // Update existing staff
        const res = await axios.patch(
          `${API_V1_BASE}/admin-staff/${editingStaff.id}`,
          {
            role: formData.role,
            customPermissions: formData.customPermissions
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (res.data?.success) {
          toast.success(res.data.message || 'Staff permissions updated successfully!');
          setModalOpen(false);
          setEditingStaff(null);
          fetchStaffList();
        }
      } else {
        // Create new staff
        const res = await axios.post(`${API_V1_BASE}/admin-staff`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Staff member added successfully!');
          setModalOpen(false);
          fetchStaffList();
        }
      }
    } catch (err) {
      console.error('Staff action failed:', err);
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (staffId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const token = await getAuthToken();
      const res = await axios.patch(
        `${API_V1_BASE}/admin-staff/${staffId}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success(`Account marked as ${nextStatus}`);
        setStaffList((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, status: nextStatus } : s))
        );
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
      toast.error('Failed to change status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to revoke access for "${staffName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await axios.delete(`${API_V1_BASE}/admin-staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Staff member removed.');
        setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      }
    } catch (err) {
      console.error('Staff deletion failed:', err);
      toast.error('Failed to remove staff: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <StaffHeaderBanner
        staff={staffList}
        loading={loading}
        onRefresh={fetchStaffList}
        onOpenAddModal={handleOpenAddModal}
      />

      <StaffTable
        staff={staffList}
        loading={loading}
        onRefresh={fetchStaffList}
        onEditStaff={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDeleteStaff={handleDeleteStaff}
      />

      <StaffModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleSubmitStaffModal}
        loading={actionLoading}
        editingStaff={editingStaff}
      />
    </div>
  );
}

