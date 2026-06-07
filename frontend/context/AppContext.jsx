"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { doctors as staticDoctors } from "@/lib/data";

export const AppContext = createContext(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppContextProvider");
  return context;
}

const AppContextProvider = ({ children }) => {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const currencySymbol = "₹";

  const [token, setToken] = useState(null);
  const [dToken, setDToken] = useState(null);
  const [aToken, setAToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [authLoaded, setAuthLoaded] = useState(false); // true once localStorage has been read

  // Load tokens from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    const dt = localStorage.getItem("dToken");
    const at = localStorage.getItem("aToken");
    if (t) setToken(t);
    if (dt) setDToken(dt);
    if (at) setAToken(at);
    setAuthLoaded(true); // mark auth as resolved regardless of whether tokens exist
  }, []);

  // Fetch doctors list (fallback to static data if backend unavailable)
  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        setDoctors(staticDoctors);
      }
    } catch {
      setDoctors(staticDoctors);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Fetch user profile whenever token changes
  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        // Only invalidate session on explicit auth rejection
        setUserData(null);
      }
    } catch (err) {
      // Only clear token on 401 Unauthorized — not on network errors
      if (err?.response?.status === 401) {
        setToken(null);
        setUserData(null);
        localStorage.removeItem("token");
      }
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const loginUser = (t) => {
    setToken(t);
    localStorage.setItem("token", t);
  };

  const loginDoctor = (t) => {
    setDToken(t);
    localStorage.setItem("dToken", t);
  };

  const loginAdmin = (t) => {
    setAToken(t);
    localStorage.setItem("aToken", t);
  };

  const logoutUser = () => {
    setToken(null);
    setUserData(null);
    localStorage.removeItem("token");
  };

  const logoutDoctor = () => {
    setDToken(null);
    localStorage.removeItem("dToken");
  };

  const logoutAdmin = () => {
    setAToken(null);
    localStorage.removeItem("aToken");
  };

  const value = {
    backendUrl,
    currencySymbol,
    authLoaded,
    token,
    dToken,
    aToken,
    userData,
    setUserData,
    doctors,
    fetchDoctors,
    loginUser,
    loginDoctor,
    loginAdmin,
    logoutUser,
    logoutDoctor,
    logoutAdmin,
    fetchUserProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
