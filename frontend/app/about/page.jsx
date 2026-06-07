import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/data";
import {
  FaHeartbeat,
  FaUserMd,
  FaCalendarCheck,
  FaShieldAlt,
  FaStar,
  FaAward,
} from 'react-icons/fa';

export const metadata = {
  title: "About Us",
  description:
    "Learn about Prescripto — our mission, values, and the team dedicated to making healthcare accessible.",
};

const stats = [
  { value: "100+", label: "Verified Doctors" },
  { value: "10,000+", label: "Happy Patients" },
  { value: "50+", label: "Specialities" },
  { value: "4.9★", label: "Average Rating" },
];

const values = [
  {
    icon: FaHeartbeat,
    title: "Patient-First Care",
    desc: "Every decision we make is centered around improving patient outcomes and experience.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: FaShieldAlt,
    title: "Trust & Safety",
    desc: "All doctors on our platform are thoroughly verified and credentialed.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: FaCalendarCheck,
    title: "Seamless Access",
    desc: "Book appointments instantly, anytime, from anywhere on any device.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: FaAward,
    title: "Excellence",
    desc: "We connect you only with top-rated, experienced healthcare professionals.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <span className="text-[#5f6FFF] font-semibold text-sm uppercase tracking-wider">
            About Prescripto
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-5 leading-tight">
            Bridging the Gap Between Patients and Doctors
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Prescripto is a modern healthcare platform designed to make medical
            care accessible, affordable, and convenient for everyone. We connect
            patients with verified healthcare professionals across a wide range
            of specialities.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Founded with the belief that quality healthcare should be a right,
            not a privilege, we&apos;ve built a platform that empowers both
            patients and doctors to achieve better health outcomes.
          </p>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 bg-[#5f6FFF] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#4a5bef] transition-colors shadow-md"
          >
            <FaUserMd /> Find a Doctor
          </Link>
        </div>
        <div className="relative">
          <Image
            src={assets.about_image}
            alt="About Prescripto"
            width={500}
            height={400}
            className="rounded-2xl shadow-xl w-full object-cover"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="text-3xl font-bold text-[#5f6FFF] mb-1">
              {stat.value}
            </div>
            <div className="text-gray-600 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-r from-[#5f6FFF] to-[#8B9AFF] rounded-3xl p-10 text-white text-center mb-20">
        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
          To democratize healthcare by building technology that makes it easy
          for anyone to find, book, and receive care from qualified medical
          professionals — anytime, anywhere.
        </p>
      </div>

      {/* Values */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
          <p className="text-gray-600 mt-3">
            The principles that guide everything we do
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`${v.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className={`${v.color} text-xl`} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gray-50 rounded-3xl p-10 border border-gray-100">
        <FaStar className="text-yellow-400 text-3xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of patients who trust Prescripto for their healthcare
          needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-[#5f6FFF] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#4a5bef] transition-colors"
          >
            Create Free Account
          </Link>
          <Link
            href="/doctors"
            className="border-2 border-[#5f6FFF] text-[#5f6FFF] px-8 py-3.5 rounded-full font-medium hover:bg-[#5f6FFF] hover:text-white transition-colors"
          >
            Browse Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}
