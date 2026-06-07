'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { assets } from '@/lib/data';
import { FaCamera, FaUserMd } from 'react-icons/fa';

const specialities = [
  'General physician', 'Gynecologist', 'Dermatologist',
  'Pediatricians', 'Neurologist', 'Gastroenterologist',
];

const experiences = ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '7 Years', '8 Years', '9 Years', '10+ Years'];

export default function AddDoctorPage() {
  const { aToken, backendUrl } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', speciality: 'General physician',
    degree: '', experience: '1 Year', about: '', fees: '',
    address1: '', address2: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { toast.warning('Please upload a doctor image'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('speciality', form.speciality);
      formData.append('degree', form.degree);
      formData.append('experience', form.experience);
      formData.append('about', form.about);
      formData.append('fees', form.fees);
      formData.append('address', JSON.stringify({ line1: form.address1, line2: form.address2 }));

      const { data } = await axios.post(`${backendUrl}/api/admin/doctors`, formData, {
        headers: { atoken: aToken },
      });

      if (data.success) {
        toast.success('Doctor added successfully!');
        setForm({
          name: '', email: '', password: '', speciality: 'General physician',
          degree: '', experience: '1 Year', about: '', fees: '',
          address1: '', address2: '',
        });
        setImage(null);
      } else {
        toast.error(data.message || 'Failed to add doctor');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const preview = image ? URL.createObjectURL(image) : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Doctor</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {/* Image Upload */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-dashed border-gray-300 hover:border-[#5f6FFF] cursor-pointer transition-colors bg-gray-50 flex items-center justify-center"
          >
            {preview ? (
              <Image src={preview} alt="Doctor" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <FaCamera className="text-2xl mb-1" />
                <span className="text-xs">Upload Photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">Click to upload doctor photo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Dr. John Smith"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="doctor@example.com"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* Speciality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speciality *</label>
            <select
              name="speciality"
              value={form.speciality}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            >
              {specialities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
            <input
              name="degree"
              value={form.degree}
              onChange={handleChange}
              required
              placeholder="MBBS, MD"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
            <select
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            >
              {experiences.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Fees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fees (₹) *</label>
            <input
              name="fees"
              type="number"
              value={form.fees}
              onChange={handleChange}
              required
              min={0}
              placeholder="500"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* Address 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              name="address1"
              value={form.address1}
              onChange={handleChange}
              placeholder="Clinic/Hospital name"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* Address 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              name="address2"
              value={form.address2}
              onChange={handleChange}
              placeholder="City, State"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
            />
          </div>

          {/* About */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">About *</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Brief description of the doctor's expertise and background..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaUserMd />
            )}
            {loading ? 'Adding...' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}
