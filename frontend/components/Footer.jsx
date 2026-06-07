"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { assets } from "@/lib/data";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserMd,
} from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";

export default function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Please enter your email");
    toast.success("Subscribed successfully!");
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* CTA Banner — Join as a Doctor */}
      <div className="bg-linear-to-r from-[#5f6FFF] to-[#8B9AFF]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <FaUserMd className="text-white text-3xl" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">
                Are you a Doctor?
              </h3>
              <p className="text-white/80 text-sm mt-0.5">
                Join Prescripto and connect with thousands of patients
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/join-as-doctor")}
            className="shrink-0 flex items-center gap-2 bg-white text-[#5f6FFF] font-bold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <MdLocalHospital className="text-xl" />
            Join as a Doctor
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src={assets.logo}
              alt="Prescripto"
              width={150}
              height={38}
              className="brightness-0 invert mb-5"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Connecting patients with trusted healthcare professionals. Your
              health, our priority — available 24/7.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: "#", color: "hover:bg-blue-600" },
                { icon: FaTwitter, href: "#", color: "hover:bg-sky-500" },
                { icon: FaInstagram, href: "#", color: "hover:bg-pink-600" },
                { icon: FaLinkedinIn, href: "#", color: "hover:bg-blue-700" },
                { icon: FaYoutube, href: "#", color: "hover:bg-red-600" },
              ].map(({ icon: Icon, href, color }, i) => (
                <a
                  key={i}
                  href={href}
                  className={`w-9 h-9 bg-gray-800 ${color} rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all`}
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#5f6FFF] rounded-full inline-block" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "All Doctors", href: "/doctors" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Join as a Doctor", href: "/join-as-doctor" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-[#8B9AFF] text-sm flex items-center gap-2 group transition-colors"
                  >
                    <FaArrowRight className="text-xs text-[#5f6FFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#5f6FFF] rounded-full inline-block" />
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                "Online Appointment",
                "Emergency Care",
                "Health Checkup",
                "Medicine Delivery",
                "Specialist Consultation",
                "Lab Tests",
              ].map((s) => (
                <li key={s}>
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#5f6FFF] rounded-full shrink-0" />
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#5f6FFF] rounded-full inline-block" />
              Contact Us
            </h4>
            <ul className="space-y-4 mb-7">
              <li className="flex items-start gap-3">
                <div className="bg-[#5f6FFF]/10 p-2 rounded-lg mt-0.5 shrink-0">
                  <FaPhone className="text-[#5f6FFF] text-xs" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-gray-300 text-sm">+91 78480 09613</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-[#5f6FFF]/10 p-2 rounded-lg mt-0.5 shrink-0">
                  <FaEnvelope className="text-[#5f6FFF] text-xs" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-gray-300 text-sm">
                    support@prescripto.com
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-[#5f6FFF]/10 p-2 rounded-lg mt-0.5 shrink-0">
                  <FaMapMarkerAlt className="text-[#5f6FFF] text-xs" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Address
                  </p>
                  <p className="text-gray-300 text-sm">
                    123 Medical Plaza,
                    <br />
                    Health City, India
                  </p>
                </div>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-white text-sm font-medium mb-2">Newsletter</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#5f6FFF] min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#5f6FFF] hover:bg-[#4a5be8] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
                >
                  <FaArrowRight />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Prescripto. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (t) => (
                <Link
                  key={t}
                  href="#"
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {t}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
