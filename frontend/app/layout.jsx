import "./globals.css";
import AppContextProvider from "@/context/AppContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: {
    default: "Prescripto — Book Doctor Appointments Online",
    template: "%s | Prescripto",
  },
  description:
    "Find and book appointments with top doctors near you. Instant, easy, and reliable healthcare at your fingertips.",
  keywords: ["doctor", "appointment", "healthcare", "medical", "prescripto"],
  openGraph: {
    siteName: "Prescripto",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppContextProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
          <ToastContainer position="top-right" autoClose={3000} />
        </AppContextProvider>
      </body>
    </html>
  );
}
