"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/lib/data";
import Image from "next/image";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaEdit,
  FaSave,
  FaCamera,
} from 'react-icons/fa';

export default function MyProfilePage() {
  const router = useRouter();
  const {
    token,
    userData,
    setUserData,
    backendUrl,
    fetchUserProfile,
    authLoaded,
  } = useAppContext();
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "Not Selected",
    dob: "",
    address: { line1: "", line2: "" },
  });

  useEffect(() => {
    if (!authLoaded) return; // wait until localStorage has been read
    if (!token) {
      router.replace("/login");
      return;
    }
    if (userData) {
      setForm({
        name: userData.name || "",
        phone: userData.phone || "",
        gender: userData.gender || "Not Selected",
        dob: userData.dob || "",
        address: {
          line1: userData.address?.line1 || "",
          line2: userData.address?.line2 || "",
        },
      });
    }
  }, [token, userData, router, authLoaded]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("address", JSON.stringify(form.address));
      formData.append("gender", form.gender);
      formData.append("dob", form.dob);
      if (profileImage) formData.append("image", profileImage);

      const { data } = await axios.put(
        `${backendUrl}/api/user/profile`,
        formData,
        {
          headers: { token },
        },
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        await fetchUserProfile();
        setIsEdit(false);
        setProfileImage(null);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoaded || !token || !userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#5f6FFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayImage = profileImage
    ? URL.createObjectURL(profileImage)
    : userData.image || assets.profile_pic;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#5f6FFF]/10 p-3 rounded-xl">
          <FaUser className="text-[#5f6FFF] text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 text-sm">
            Manage your personal information
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#5f6FFF] to-[#8B9AFF] px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={displayImage}
                  alt="Profile"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEdit && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white text-[#5f6FFF] p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
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
                </>
              )}
            </div>
            <div className="text-center sm:text-left">
              {isEdit ? (
                <input
                  className="text-2xl font-bold bg-white/20 text-white placeholder-white/70 rounded-lg px-3 py-1 outline-none focus:bg-white/30 w-full"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">
                  {userData.name}
                </h2>
              )}
              <p className="text-white/80 mt-1 text-sm">{userData.email}</p>
              <span className="inline-block mt-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                Patient
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-8">
          {/* Contact Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaPhone className="text-[#5f6FFF]" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Email
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-[#5f6FFF] text-sm" />
                  <span className="text-gray-700 text-sm">
                    {userData.email}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Phone
                </label>
                {isEdit ? (
                  <input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="text-[#5f6FFF] text-sm" />
                    <span className="text-gray-700 text-sm">
                      {userData.phone || "—"}
                    </span>
                  </div>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Address Line 1
                </label>
                {isEdit ? (
                  <input
                    value={form.address.line1}
                    onChange={(e) =>
                      handleAddressChange("line1", e.target.value)
                    }
                    placeholder="Street address"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-[#5f6FFF] text-sm" />
                    <span className="text-gray-700 text-sm">
                      {userData.address?.line1 || "—"}
                    </span>
                  </div>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Address Line 2
                </label>
                {isEdit ? (
                  <input
                    value={form.address.line2}
                    onChange={(e) =>
                      handleAddressChange("line2", e.target.value)
                    }
                    placeholder="City, State, Country"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-[#5f6FFF] text-sm" />
                    <span className="text-gray-700 text-sm">
                      {userData.address?.line2 || "—"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-[#5f6FFF]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Gender
                </label>
                {isEdit ? (
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                  >
                    <option value="Not Selected">Not Selected</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FaVenusMars className="text-[#5f6FFF] text-sm" />
                    <span className="text-gray-700 text-sm">
                      {userData.gender || "—"}
                    </span>
                  </div>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Date of Birth
                </label>
                {isEdit ? (
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FaBirthdayCake className="text-[#5f6FFF] text-sm" />
                    <span className="text-gray-700 text-sm">
                      {userData.dob
                        ? new Date(userData.dob).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            {isEdit ? (
              <>
                <button
                  onClick={() => {
                    setIsEdit(false);
                    setProfileImage(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#5f6FFF] text-white rounded-lg hover:bg-[#4a5bef] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaSave size={14} />
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#5f6FFF] text-white rounded-lg hover:bg-[#4a5bef] transition-colors text-sm font-medium"
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
