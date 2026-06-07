"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { assets } from "@/lib/data";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const NavItem = ({ href, label, onClick }) => {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} onClick={onClick} className={isActive ? "active" : ""}>
      <li className="py-1">{label}</li>
      <hr
        className={`border-none outline-none h-0.5 bg-[#5f6FFF] w-3/5 m-auto ${
          isActive ? "block" : "hidden"
        }`}
      />
    </Link>
  );
};

const Navbar = () => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const { token, userData, logoutUser } = useAppContext();

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/doctors", label: "ALL DOCTORS" },
    { href: "/about", label: "ABOUT" },
    { href: "/contact", label: "CONTACT" },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      {/* Logo */}
      <Image
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="Prescripto Logo"
        width={176}
        height={40}
        className="cursor-pointer"
      />

      {/* Desktop Nav */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        {navLinks.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} />
        ))}
      </ul>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <Image
              src={userData?.image || assets.profile_pic}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full object-cover w-8 h-8"
            />
            <Image src={assets.dropdown_icon} alt="" width={10} height={10} />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 shadow-lg">
                <p
                  onClick={() => router.push("/my-profile")}
                  className="hover:text-[#5f6FFF] cursor-pointer transition-colors"
                >
                  My Profile
                </p>
                <p
                  onClick={() => router.push("/my-appointments")}
                  className="hover:text-[#5f6FFF] cursor-pointer transition-colors"
                >
                  My Appointments
                </p>
                <p
                  onClick={handleLogout}
                  className="hover:text-red-500 cursor-pointer transition-colors"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-[#5f6FFF] cursor-pointer text-white px-8 py-3 rounded-full font-light hidden md:block hover:bg-[#4a5bef] transition-colors"
          >
            Sign in / Sign up
          </button>
        )}

        {/* Hamburger */}
        <Image
          src={assets.menu_icon}
          alt="Menu"
          width={24}
          height={24}
          className="md:hidden cursor-pointer"
          onClick={() => setShowMenu(true)}
        />

        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <Image src={assets.logo} alt="Logo" width={144} height={36} />
            <Image
              src={assets.cross_icon}
              alt="Close"
              width={28}
              height={28}
              className="cursor-pointer"
              onClick={() => setShowMenu(false)}
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMenu(false)}
              >
                <p className="px-4 py-2 rounded inline-block">{link.label}</p>
              </Link>
            ))}
            {token ? (
              <>
                <button
                  onClick={() => {
                    router.push("/my-profile");
                    setShowMenu(false);
                  }}
                  className="px-4 py-2 text-[#5f6FFF] font-medium"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    router.push("/my-appointments");
                    setShowMenu(false);
                  }}
                  className="px-4 py-2 text-[#5f6FFF] font-medium"
                >
                  My Appointments
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="px-4 py-2 text-red-500 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setShowMenu(false);
                }}
                className="mt-4 bg-[#5f6FFF] text-white px-8 py-3 rounded-full font-light"
              >
                Sign in / Sign up
              </button>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
