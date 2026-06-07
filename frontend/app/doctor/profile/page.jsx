'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaEdit, FaSave, FaCamera } from 'react-icons/fa';

export default function DoctorProfilePage() {
  const { dToken, backendUrl } = useAppContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '', phone: '', speciality: '', degree: '', experience: '',
    fees: '', about: '', available: true,
    address1: '', address2: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dtoken: dToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
        setForm({
          name: data.profileData.name || '',
          phone: data.profileData.phone || '',
          speciality: data.profileData.speciality || '',
          degree: data.profileData.degree || '',
          experience: data.profileData.experience || '',
          fees: data.profileData.fees || '',
          about: data.profileData.about || '',
          available: data.profileData.available ?? true,
          address1: data.profileData.address?.line1 || '',
          address2: data.profileData.address?.line2 || '',
        });
      } else toast.error(data.message);
    } catch (err) { 
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to load profile'); 
    }
    finally { setLoading(false); }
  }, [dToken, backendUrl]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('speciality', form.speciality);
      formData.append('degree', form.degree);
      formData.append('experience', form.experience);
      formData.append('fees', form.fees);
      formData.append('about', form.about);
      formData.append('available', form.available);
      formData.append('address', JSON.stringify({ line1: form.address1, line2: form.address2 }));
      if (profileImage) formData.append('image', profileImage);

      const { data } = await axios.put(`${backendUrl}/api/doctor/profile`, formData, {
        headers: { dtoken: dToken },
      });

      if (data.success) {
        toast.success('Profile updated!');
        await fetchProfile();
        setIsEdit(false);
        setProfileImage(null);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;

  const displayImage = profileImage ? URL.createObjectURL(profileImage) : profileData.image || assets.profile_pic;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image src={displayImage} alt="Doctor" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              {isEdit && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white text-emerald-600 p-2 rounded-full shadow-md"
                  >
                    <FaCamera size={14} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} className="hidden" />
                </>
              )}
            </div>
            <div className="text-center sm:text-left">
              {isEdit ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="text-2xl font-bold text-gray-800 px-2 py-1 rounded border border-gray-200 outline-none w-full max-w-xs"
                  placeholder="Doctor Name"
                />
              ) : (
                <h3 className="text-2xl font-bold text-white">{profileData.name}</h3>
              )}
              
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                {isEdit ? (
                  <>
                    <input
                      type="text"
                      value={form.degree}
                      onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
                      className="text-sm text-gray-800 px-2 py-1 rounded border border-gray-200 outline-none w-24"
                      placeholder="Degree"
                    />
                    <span className="text-white/80 hidden sm:inline">—</span>
                    <select
                      value={form.speciality}
                      onChange={(e) => setForm((p) => ({ ...p, speciality: e.target.value }))}
                      className="text-sm text-gray-800 px-2 py-1 rounded border border-gray-200 outline-none w-36"
                    >
                      <option value="General physician">General physician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatricians</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                    </select>
                  </>
                ) : (
                  <p className="text-white/80">{profileData.degree} — {profileData.speciality}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-block w-2 h-2 rounded-full ${profileData.available ? 'bg-green-300' : 'bg-gray-300'}`} />
                <span className="text-white/90 text-sm">{profileData.available ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Phone Number</label>
              {isEdit ? (
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">{profileData.phone || '—'}</div>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Experience</label>
              {isEdit ? (
                <select
                  value={form.experience}
                  onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i} value={`${i + 1} Year`}>{i + 1} Year{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">{profileData.experience || '—'}</div>
              )}
            </div>

            {/* Fees */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Consultation Fees (₹)</label>
              {isEdit ? (
                <input
                  type="number"
                  value={form.fees}
                  onChange={(e) => setForm((p) => ({ ...p, fees: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">₹{profileData.fees}</div>
              )}
            </div>

            {/* Available */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Availability</label>
              {isEdit ? (
                <select
                  value={form.available ? 'true' : 'false'}
                  onChange={(e) => setForm((p) => ({ ...p, available: e.target.value === 'true' }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              ) : (
                <div className={`p-3 rounded-xl text-sm font-medium ${profileData.available ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                  {profileData.available ? 'Available for appointments' : 'Currently unavailable'}
                </div>
              )}
            </div>

            {/* Address 1 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Address Line 1</label>
              {isEdit ? (
                <input value={form.address1} onChange={(e) => setForm((p) => ({ ...p, address1: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm" />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">{profileData.address?.line1 || '—'}</div>
              )}
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Address Line 2</label>
              {isEdit ? (
                <input value={form.address2} onChange={(e) => setForm((p) => ({ ...p, address2: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm" />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">{profileData.address?.line2 || '—'}</div>
              )}
            </div>

            {/* About */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">About</label>
              {isEdit ? (
                <textarea
                  value={form.about}
                  onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm resize-none"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">{profileData.about || '—'}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={14} />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium"
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
