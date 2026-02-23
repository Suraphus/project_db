import { Routes, Route, Navigate } from "react-router-dom";
import { useDebugValue, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import Topbar from "./components/Topbar";
import { Fields } from "./pages/Fields";
import { ToastContainer } from "react-toastify";

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

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
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
        {/* แสดง Topbar เฉพาะตอน login แล้ว */}
        <Topbar setIsAuthenticated={setIsAuthenticated} />

        <Routes>
          {/* เข้าเว็บครั้งแรก → ไป login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* หน้า Login */}
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* หน้า Facilities (กันเข้าโดยไม่ได้ login) */}
          <Route
            path="/facilities"
            element={
              isAuthenticated ? <FacilitiesPage /> : <Navigate to="/login" />
            }
          />

        {/* หน้า Facilities (กันเข้าโดยไม่ได้ login) */}
        <Route
          path="/facilities"
          element={
            isAuthenticated ? (
              <FacilitiesPage />
            ) : (
              <Navigate to="/login"/>
            )
          }
        />

        <Route path="/fields" element = {<Fields />} />

      </Routes>
    </div>
    <ToastContainer />
    </>
  );
}
