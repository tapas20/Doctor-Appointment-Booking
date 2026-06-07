"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/doctor/") ||
    pathname === "/doctor";

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="mx-4">
        <Navbar />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  );
}
