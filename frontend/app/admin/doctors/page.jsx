'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaTrash, FaUserMd, FaEdit, FaCamera, FaTimes } from 'react-icons/fa';

export default function AdminDoctorsPage() {
  const { aToken, backendUrl } = useAppContext();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingDoc, setEditingDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', speciality: '', degree: '', experience: '',
    fees: '', about: '', address1: '', address2: '',
  });

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/doctors`, {
        headers: { atoken: aToken },
      });
      if (data.success) setDoctors(data.doctors);
      else toast.error(data.message);
    } catch { toast.error('Failed to fetch doctors'); }
    finally { setLoading(false); }
  }, [aToken, backendUrl]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const toggleAvailability = async (id, available) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/doctors/${id}`,
        { available: !available },
        { headers: { atoken: aToken } }
      );
      if (data.success) {
        setDoctors((prev) => prev.map((d) => d._id === id ? { ...d, available: !available } : d));
        toast.success(`Doctor ${!available ? 'marked available' : 'marked unavailable'}`);
      } else toast.error(data.message);
    } catch { toast.error('Failed to update'); }
  };

  const deleteDoctor = async (id, name) => {
    if (!confirm(`Delete Dr. ${name}? This action cannot be undone.`)) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/doctors/${id}`, {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setDoctors((prev) => prev.filter((d) => d._id !== id));
        toast.success('Doctor removed');
      } else toast.error(data.message);
    } catch { toast.error('Failed to delete'); }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setProfileImage(null);
    setForm({
      name: doc.name || '',
      phone: doc.phone || '',
      speciality: doc.speciality || '',
      degree: doc.degree || '',
      experience: doc.experience || '',
      fees: doc.fees || '',
      about: doc.about || '',
      address1: doc.address?.line1 || '',
      address2: doc.address?.line2 || '',
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
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
      formData.append('address', JSON.stringify({ line1: form.address1, line2: form.address2 }));
      if (profileImage) formData.append('image', profileImage);

      const { data } = await axios.put(`${backendUrl}/api/admin/doctors/${editingDoc._id}/update`, formData, {
        headers: { atoken: aToken },
      });

      if (data.success) {
        toast.success('Doctor profile updated!');
        await fetchDoctors();
        setEditingDoc(null);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Doctors List</h2>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
          {doctors.length} Doctors
        </span>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <FaUserMd className="text-gray-300 text-5xl mx-auto mb-3" />
          <p className="text-gray-500">No doctors added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
                <Image
                  src={doc.image || assets.profile_pic}
                  alt={doc.name}
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{doc.name}</h3>
                <p className="text-[#5f6FFF] text-sm mb-3">{doc.speciality}</p>

                <div className="flex items-center justify-between">
                  {/* Availability Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => toggleAvailability(doc._id, doc.available)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        doc.available ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          doc.available ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${doc.available ? 'text-green-600' : 'text-gray-500'}`}>
                      {doc.available ? 'Available' : 'Unavailable'}
                    </span>
                  </label>

                  <div className="flex gap-2">
                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(doc)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit doctor"
                    >
                      <FaEdit />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deleteDoctor(doc._id, doc.name)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete doctor"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Doctor Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Edit Doctor Profile</h3>
              <button onClick={() => setEditingDoc(null)} className="text-gray-400 hover:text-gray-600 p-2">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <form id="edit-doctor-form" onSubmit={handleEditSave} className="space-y-6">
                
                {/* Image Edit */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shrink-0">
                    <Image
                      src={profileImage ? URL.createObjectURL(profileImage) : editingDoc.image || assets.profile_pic}
                      alt="Doctor" fill className="object-cover"
                    />
                  </div>
                  <div>
                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors inline-flex items-center gap-2">
                      <FaCamera /> Change Photo
                      <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0])} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                    <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                    <input required type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Speciality</label>
                    <select required value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none">
                      <option value="General physician">General physician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatricians</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Degree</label>
                    <input required type="text" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Experience</label>
                    <select required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none">
                      {[...Array(20)].map((_, i) => (
                        <option key={i} value={`${i + 1} Year`}>{i + 1} Year{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fees (₹)</label>
                    <input required type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About</label>
                    <textarea required rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none resize-none" />
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address 1</label>
                      <input required type="text" value={form.address1} onChange={(e) => setForm({ ...form, address1: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address 2</label>
                      <input type="text" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => setEditingDoc(null)} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button form="edit-doctor-form" type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
