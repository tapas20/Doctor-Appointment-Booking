"use client";

import { useState } from "react";
import Image from "next/image";
import { assets } from "@/lib/data";
import { toast } from "react-toastify";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

const contactInfo = [
  {
    icon: FaPhone,
    label: "Phone",
    value: "+91 7848009613",
    sub: "Mon–Sat, 9 AM – 6 PM",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FaEnvelope,
    label: "Email",
    value: "support@prescripto.com",
    sub: "We reply within 24 hours",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: FaMapMarkerAlt,
    label: "Address",
    value: "123 Medical Plaza",
    sub: "Health City, IN 123456",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: FaClock,
    label: "Working Hours",
    value: "Mon – Sat: 9 AM – 6 PM",
    sub: "Sunday: Closed",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you shortly.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-[#5f6FFF] font-semibold text-sm uppercase tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Have a question or need help? Our team is here to assist you. Reach
          out to us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell us more about your inquiry..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5f6FFF] outline-none text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#5f6FFF] text-white py-3.5 rounded-xl font-semibold hover:bg-[#4a5bef] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info + Image */}
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden h-48">
            <Image
              src={assets.contact_image}
              alt="Contact"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#5f6FFF]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">
                We&apos;re Here For You
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div
                    className={`${info.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}
                  >
                    <Icon className={`${info.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {info.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {info.value}
                  </p>
                  <p className="text-xs text-gray-500">{info.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: "How do I book an appointment?",
              a: "Browse doctors, select your preferred doctor, choose a date and time, then click Book Appointment. You need to be logged in.",
            },
            {
              q: "Can I cancel my appointment?",
              a: "Yes, you can cancel upcoming appointments from My Appointments. Cancellations must be made before the scheduled time.",
            },
            {
              q: "How do I make a payment?",
              a: "We support online payments via Razorpay. You can pay securely from the My Appointments page after booking.",
            },
            {
              q: "Are the doctors verified?",
              a: "Yes, all doctors on Prescripto are thoroughly verified including their credentials, qualifications, and experience.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-xl p-5 border border-gray-100"
            >
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                {faq.q}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
