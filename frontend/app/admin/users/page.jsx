'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCamera } from 'react-icons/fa';

const EditUserModal = ({ user, onClose, onSave, aToken, backendUrl }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Not Selected',
    dob: user?.dob || '',
    password: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isAdding = !user;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('gender', formData.gender);
      payload.append('dob', formData.dob);
      if (formData.password) payload.append('password', formData.password);
      if (imageFile) payload.append('image', imageFile);

      let url = `${backendUrl}/api/admin/users`;
      let method = 'post';

      if (!isAdding) {
        url = `${backendUrl}/api/admin/users/${user._id}/update`;
        method = 'put';
      }

      const { data } = await axios({
        method,
        url,
        data: payload,
        headers: { atoken: aToken, 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        toast.success(data.message);
        onSave();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : user?.image || assets.profile_pic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 relative overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h3 className="text-xl font-bold text-white">
            {isAdding ? 'Add New User' : 'Edit User Profile'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-amber-600 p-2 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image Upload */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  <Image
                    src={previewImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-amber-500 text-white p-2 rounded-full shadow-md hover:bg-amber-600 transition"
                >
                  <FaCamera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">Profile Image</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="e.g. Richard James"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={!isAdding && false} // Admins can change user emails
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {isAdding ? 'Password *' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={isAdding}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder={isAdding ? "Minimum 8 characters" : "Leave blank to keep current"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="000-000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                  >
                    <option value="Not Selected">Not Selected</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const { aToken, backendUrl } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { atoken: aToken },
      });
      if (data.success) setUsers(data.users);
      else toast.error(data.message);
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  }, [aToken, backendUrl]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This will also delete all their associated appointments.`)) {
      try {
        const { data } = await axios.delete(`${backendUrl}/api/admin/users/${user._id}`, {
          headers: { atoken: aToken }
        });
        if (data.success) {
          toast.success('User deleted successfully');
          fetchUsers();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Users List</h2>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered patients</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-sm w-64"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm text-sm font-medium shrink-0"
          >
            <FaPlus size={12} /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'User', 'Email', 'Phone', 'Gender', 'Joined', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user, i) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={user.image || assets.profile_pic}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.phone || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.gender || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-amber-500 hover:text-amber-700 p-1.5 transition-colors"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-400 hover:text-red-600 p-1.5 transition-colors"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {search ? 'No users match your search' : 'No users registered yet'}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            fetchUsers();
          }}
          aToken={aToken}
          backendUrl={backendUrl}
        />
      )}
    </div>
  );
}
