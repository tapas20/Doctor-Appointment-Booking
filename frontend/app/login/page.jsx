"use client";

import { useState, useEffect } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";
import Image from "next/image";
import { assets } from "@/lib/data";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const {
    token,
    dToken,
    aToken,
    authLoaded,
    loginUser,
    loginDoctor,
    loginAdmin,
    backendUrl,
  } = useAppContext();

  const [state, setState] = useState("login"); // "login" | "signup"
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Redirect if already logged in (after localStorage hydration)
  useEffect(() => {
    if (!authLoaded) return;
    if (aToken) router.replace("/admin/dashboard");
    else if (dToken) router.replace("/doctor/dashboard");
    else if (token) router.replace("/my-profile");
  }, [authLoaded, token, dToken, aToken, router]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (state === "signup") {
        // ── Register new patient ──────────────────────────────────────────
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        if (!data.success) return toast.error(data.message);
        loginUser(data.token);
        toast.success("Account created! Welcome to Prescripto.");
        router.push("/my-profile");
      } else {
        // ── Unified login — backend resolves role automatically ───────────
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email: form.email,
          password: form.password,
        });
        if (!data.success) return toast.error(data.message);

        toast.success(data.message);

        if (data.role === "admin") {
          loginAdmin(data.token);
          router.push("/admin/dashboard");
        } else if (data.role === "doctor") {
          loginDoctor(data.token);
          router.push("/doctor/dashboard");
        } else {
          loginUser(data.token);
          router.push("/my-profile");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src={assets.logo}
            alt="Prescripto"
            width={160}
            height={40}
            className="mx-auto mb-5"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            {state === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {state === "login"
              ? "Sign in to continue to Prescripto"
              : "Join thousands of patients on Prescripto"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            {[
              { id: "login", label: "Sign In" },
              { id: "signup", label: "Sign Up" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setState(tab.id);
                  setForm({ name: "", email: "", password: "" });
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  state === tab.id
                    ? "text-[#5f6FFF] border-b-2 border-[#5f6FFF] bg-white"
                    : "text-gray-400 hover:text-gray-600 bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            {/* Name — sign up only */}
            {state === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6FFF]/40 focus:border-[#5f6FFF] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6FFF]/40 focus:border-[#5f6FFF] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                {state === "login" && (
                  <button
                    type="button"
                    className="text-xs text-[#5f6FFF] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6FFF]/40 focus:border-[#5f6FFF] transition-all"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#5f6FFF] hover:bg-[#4a5be8] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : state === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="px-7 pb-6 text-center text-sm text-gray-500">
            {state === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setState("signup")}
                  className="text-[#5f6FFF] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setState("login")}
                  className="text-[#5f6FFF] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          By continuing, you agree to our{" "}
          <Link href="#" className="text-[#5f6FFF] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#5f6FFF] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
