"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/lib/data";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaStar,
  FaFileInvoiceDollar,
} from "react-icons/fa";

const navItems = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/doctor/appointments", label: "Appointments", icon: FaCalendarAlt },
  { href: "/doctor/profile", label: "Profile", icon: FaUserCircle },
  { href: "/doctor/reviews", label: "Reviews", icon: FaStar },
  { href: "/doctor/transactions", label: "Transactions", icon: FaFileInvoiceDollar },
];

export default function DoctorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { dToken, authLoaded, logoutDoctor } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoaded) return;
    if (!dToken) window.location.replace("/login");
  }, [dToken, authLoaded, router]);

  if (!authLoaded || !dToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logoutDoctor();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none md:border-r md:border-gray-200 shrink-0`}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <Image src={assets.logo} alt="Prescripto" width={140} height={36} />
          <button
            className="md:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Doctor Portal
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={isActive ? "text-white" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            className="md:hidden text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="font-semibold text-gray-800 hidden md:block">
            {navItems.find((i) => i.href === pathname)?.label ||
              "Doctor Dashboard"}
          </h1>
          <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            Doctor
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
