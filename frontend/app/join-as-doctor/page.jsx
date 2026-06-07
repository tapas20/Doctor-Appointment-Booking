"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import {
  FaUserMd,
  FaArrowRight,
  FaArrowLeft,
  FaCamera,
  FaCheckCircle,
  FaStethoscope,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";

const SPECIALITIES = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
  "Orthopedic",
  "Cardiologist",
  "Ophthalmologist",
  "ENT Specialist",
];

const EXPERIENCES = [
  "1 Year",
  "2 Years",
  "3 Years",
  "4 Years",
  "5 Years",
  "6 Years",
  "7 Years",
  "8 Years",
  "9 Years",
  "10+ Years",
];

const STEPS = [
  { label: "Personal Info", icon: FaUserMd },
  { label: "Professional", icon: FaStethoscope },
  { label: "Location & Review", icon: FaMapMarkerAlt },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  speciality: "",
  degree: "",
  experience: "",
  fees: "",
  about: "",
  addressLine1: "",
  addressLine2: "",
};

export default function JoinAsDoctorPage() {
  const { backendUrl } = useAppContext();

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Step validation ──────────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.name.trim())
      return (toast.warning("Please enter your name"), false);
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return (toast.warning("Please enter a valid email"), false);
    if (!form.phone.trim() || !/^\+?[\d\s\-]{7,15}$/.test(form.phone))
      return (toast.warning("Please enter a valid phone number"), false);
    if (!form.password || form.password.length < 8)
      return (toast.warning("Password must be at least 8 characters"), false);
    if (form.password !== form.confirmPassword)
      return (toast.warning("Passwords do not match"), false);
    if (!imageFile)
      return (toast.warning("Please upload a profile photo"), false);
    return true;
  };

  const validateStep2 = () => {
    if (!form.speciality)
      return (toast.warning("Please select a speciality"), false);
    if (!form.degree.trim())
      return (toast.warning("Please enter your degree"), false);
    if (!form.experience)
      return (toast.warning("Please select your experience"), false);
    if (!form.fees || isNaN(Number(form.fees)) || Number(form.fees) <= 0)
      return (toast.warning("Please enter valid consultation fees"), false);
    if (!form.about.trim() || form.about.trim().length < 30)
      return (
        toast.warning("Please write at least 30 characters about yourself"),
        false
      );
    return true;
  };

  const validateStep3 = () => {
    if (!form.addressLine1.trim())
      return (toast.warning("Please enter Address Line 1"), false);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);
      formData.append("speciality", form.speciality);
      formData.append("degree", form.degree);
      formData.append("experience", form.experience);
      formData.append("fees", form.fees);
      formData.append("about", form.about);
      formData.append(
        "address",
        JSON.stringify({ line1: form.addressLine1, line2: form.addressLine2 }),
      );

      const { data } = await axios.post(
        `${backendUrl}/api/applications`,
        formData,
      );

      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f0f2ff] to-[#e8ebff] flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Application Submitted!
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            We&apos;ll review your application and contact you within{" "}
            <span className="text-[#5f6FFF] font-semibold">48 hours</span>.
            Thank you for choosing Prescripto.
          </p>
          <div className="bg-[#f0f2ff] rounded-2xl p-5 text-left mb-8">
            <p className="text-sm text-gray-600 font-medium mb-1">
              Application for
            </p>
            <p className="text-gray-800 font-bold">{form.name}</p>
            <p className="text-[#5f6FFF] text-sm">{form.speciality}</p>
          </div>
          <a
            href="/"
            className="inline-block bg-[#5f6FFF] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#4a5be8] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f0f2ff] to-[#e8ebff] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#5f6FFF]/20 mb-5">
            <MdLocalHospital className="text-[#5f6FFF] text-xl" />
            <span className="text-[#5f6FFF] font-semibold text-sm">
              Doctor Onboarding
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Join as a Doctor
          </h1>
          <p className="text-gray-500">
            Complete your profile in 3 easy steps and start connecting with
            patients
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between relative">
            {/* Connector line behind the dots */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 mx-10 z-0" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-[#5f6FFF] z-0 transition-all duration-500"
              style={{
                marginLeft: "2.5rem",
                width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - ${
                  step === 1 ? "0%" : step === STEPS.length ? "5rem" : "2.5rem"
                })`,
              }}
            />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const stepNum = i + 1;
              const isComplete = step > stepNum;
              const isActive = step === stepNum;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-2 z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-[#5f6FFF] text-white"
                        : isActive
                          ? "bg-[#5f6FFF] text-white ring-4 ring-[#5f6FFF]/20"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isComplete ? (
                      <FaCheckCircle className="text-sm" />
                    ) : (
                      <Icon className="text-sm" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive
                        ? "text-[#5f6FFF]"
                        : isComplete
                          ? "text-gray-600"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            {(() => {
              const Icon = STEPS[step - 1].icon;
              return <Icon className="text-[#5f6FFF]" />;
            })()}
            Step {step}: {STEPS[step - 1].label}
          </h2>

          {/* ── STEP 1: Personal Info ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full border-4 border-dashed border-[#5f6FFF]/40 bg-[#f0f2ff] cursor-pointer hover:border-[#5f6FFF] transition-colors overflow-hidden group shrink-0"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <FaCamera className="text-[#5f6FFF] text-2xl" />
                      <span className="text-[#5f6FFF] text-xs font-medium">
                        Upload
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FaCamera className="text-white text-xl" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-gray-400 text-xs">
                  Click to upload profile photo *
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Dr. John Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="doctor@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPass ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 focus:outline-none focus:ring-2 placeholder-gray-400 transition ${
                        form.confirmPassword &&
                        form.password !== form.confirmPassword
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-[#5f6FFF] focus:ring-[#5f6FFF]/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.confirmPassword &&
                    form.password !== form.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        Passwords do not match
                      </p>
                    )}
                  {form.confirmPassword &&
                    form.password === form.confirmPassword &&
                    form.confirmPassword.length >= 8 && (
                      <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                        <FaCheckCircle className="text-xs" /> Passwords match
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Professional Info ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Speciality *
                  </label>
                  <select
                    name="speciality"
                    value={form.speciality}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 bg-white transition appearance-none"
                  >
                    <option value="">Select speciality</option>
                    {SPECIALITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Degree *
                  </label>
                  <input
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    placeholder="MBBS, MD, etc."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Experience *
                  </label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 bg-white transition appearance-none"
                  >
                    <option value="">Select experience</option>
                    {EXPERIENCES.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Consultation Fees (₹) *
                  </label>
                  <input
                    name="fees"
                    type="number"
                    min="1"
                    value={form.fees}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    About You *{" "}
                    <span className="text-gray-400 font-normal">
                      (min. 30 characters)
                    </span>
                  </label>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your expertise, approach to patient care, and what sets you apart..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition resize-none"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {form.about.length} chars
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Location & Review ──────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address Line 1 *
                  </label>
                  <input
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address, clinic name..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address Line 2{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    placeholder="Area, city, state..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#5f6FFF] focus:ring-2 focus:ring-[#5f6FFF]/10 placeholder-gray-400 transition"
                  />
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-[#f8f9ff] rounded-2xl border border-[#5f6FFF]/15 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaClipboardCheck className="text-[#5f6FFF]" />
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Review Your Application
                  </h3>
                </div>

                <div className="flex gap-4 mb-4">
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{form.name}</p>
                    <p className="text-[#5f6FFF] text-sm font-medium">
                      {form.speciality}
                    </p>
                    <p className="text-gray-500 text-xs">{form.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    { label: "Phone", value: form.phone },
                    { label: "Degree", value: form.degree },
                    { label: "Experience", value: form.experience },
                    { label: "Fees", value: `₹${form.fees}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-gray-400 text-xs">{label}</span>
                      <p className="text-gray-700 font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                {form.addressLine1 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-400 text-xs">Address</span>
                    <p className="text-gray-700 text-sm font-medium">
                      {form.addressLine1}
                      {form.addressLine2 && `, ${form.addressLine2}`}
                    </p>
                  </div>
                )}

                {form.about && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-400 text-xs">About</span>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {form.about}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5f6FFF] hover:bg-[#4a5be8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          )}

          {/* Navigation Buttons (steps 1 & 2) */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
                >
                  <FaArrowLeft className="text-xs" />
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#5f6FFF] hover:bg-[#4a5be8] text-white font-bold px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
              >
                Continue
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          )}

          {/* Back button for step 3 (outside the form) */}
          {step === 3 && (
            <div className="mt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
              >
                <FaArrowLeft className="text-xs" />
                Back to Professional Info
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-6">
          By submitting, you agree to our{" "}
          <a href="#" className="text-[#5f6FFF] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#5f6FFF] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
