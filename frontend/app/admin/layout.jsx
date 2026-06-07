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
  FaUserMd,
  FaUserPlus,
  FaUsers,
  FaMoneyBillWave,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaClipboardList,
  FaStar,
} from "react-icons/fa";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/admin/applications", label: "Applications", icon: FaClipboardList },
  { href: "/admin/appointments", label: "Appointments", icon: FaCalendarAlt },
  { href: "/admin/add-doctor", label: "Add Doctor", icon: FaUserPlus },
  { href: "/admin/doctors", label: "Doctors List", icon: FaUserMd },
  { href: "/admin/users", label: "Users List", icon: FaUsers },
  { href: "/admin/transactions", label: "Transactions", icon: FaMoneyBillWave },
  { href: "/admin/reviews", label: "Reviews", icon: FaStar },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { aToken, authLoaded, logoutAdmin } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoaded) return; // wait until localStorage has been read
    if (!aToken) window.location.replace("/login");
  }, [aToken, authLoaded, router]);

  if (!authLoaded || !aToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logoutAdmin();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none md:border-r md:border-gray-200 shrink-0`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <Image src={assets.logo} alt="Prescripto" width={140} height={36} />
          <button
            className="md:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        {/* Nav */}
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
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={isActive ? "text-white" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            className="md:hidden text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="font-semibold text-gray-800 hidden md:block">
            {navItems.find((i) => i.href === pathname)?.label ||
              "Admin Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
              Admin
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
