import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import Topbar from "./components/Topbar";
import ProfilePage from "./pages/ProfilePage";

import { Fields } from "./pages/Fields";
import AdminPage from "./pages/AdminPage";

const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/me`, {
          credentials: "include",
        });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="min-h-screen bg-[#cfd2d4] font-['Segoe_UI',sans-serif]">
        <Topbar setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/facilities"
            element={
              isAuthenticated ? <FacilitiesPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/fields"
            element={isAuthenticated ? <Fields /> : <Navigate to="/login" />}
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      <ToastContainer />
    </>
  );
}
