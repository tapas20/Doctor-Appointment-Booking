'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaEdit, FaSave, FaCamera, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

export default function AdminProfilePage() {
  const { aToken, backendUrl } = useAppContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/profile`, {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
        setForm({
          name: data.profileData.name || '',
          email: data.profileData.email || '',
          phone: data.profileData.phone || '',
          password: '',
        });
      } else toast.error(data.message);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      // We don't append email to avoid accidental lockouts unless explicitly supported
      if (form.password) formData.append('password', form.password);
      if (profileImage) formData.append('image', profileImage);

      const { data } = await axios.put(`${backendUrl}/api/admin/profile`, formData, {
        headers: { atoken: aToken },
      });

      if (data.success) {
        toast.success('Admin profile updated!');
        await fetchProfile();
        setIsEdit(false);
        setProfileImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;

  const displayImage = profileImage ? URL.createObjectURL(profileImage) : profileData.image || assets.profile_pic;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-10 flex flex-col items-center text-center relative">
          <div className="relative">
            <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-white/40 shadow-lg shrink-0">
               {profileData.image || profileImage ? (
                 <Image src={displayImage} alt="Admin" width={112} height={112} className="w-full h-full object-cover" />
               ) : (
                 <Image src={assets.profile_pic} alt="Admin" width={112} height={112} className="w-full h-full object-cover opacity-80" />
               )}
            </div>
            {isEdit && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-0 bg-white text-amber-600 p-2 rounded-full shadow-md hover:bg-gray-50 transition"
                >
                  <FaCamera size={14} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} className="hidden" />
              </>
            )}
          </div>
          
          {isEdit ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="text-2xl font-bold text-gray-800 px-2 py-1 rounded border border-gray-200 outline-none max-w-xs text-center"
              placeholder="Admin Name"
            />
          ) : (
            <h3 className="text-2xl font-bold text-white">{profileData.name}</h3>
          )}
          <p className="text-amber-100 mt-1">Superuser Access</p>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Email (Read Only usually, to avoid locking out) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="flex items-center gap-3 w-full p-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-500">
                <FaEnvelope className="text-gray-400" />
                <span className="font-medium">{profileData.email}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">Email changes are restricted to server configuration.</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              {isEdit ? (
                <div className="flex items-center gap-3 w-full p-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-amber-400 bg-white">
                  <FaPhoneAlt className="text-gray-400 ml-1" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full outline-none text-gray-700"
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full p-4 border border-gray-100 bg-gray-50/50 rounded-xl text-gray-700">
                  <FaPhoneAlt className="text-gray-400" />
                  <span className="font-medium">{profileData.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Password */}
            {isEdit && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
                  placeholder="Leave blank to keep current password"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
            {isEdit ? (
              <>
                <button
                  onClick={() => { setIsEdit(false); setProfileImage(null); }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={14} />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
              >
                <FaEdit size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
