import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import Topbar from "./components/Topbar";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-[#cfd2d4] font-['Segoe_UI',sans-serif]">
      
      {/* แสดง Topbar เฉพาะตอน login แล้ว */}
      {isAuthenticated && (
        <Topbar setIsAuthenticated={setIsAuthenticated} />
      )}

      <Routes>

        {/* เข้าเว็บครั้งแรก → ไป login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* หน้า Login */}
        <Route
          path="/login"
          element={
            <LoginPage setIsAuthenticated={setIsAuthenticated} />
          }
        />

        {/* หน้า Facilities (กันเข้าโดยไม่ได้ login) */}
        <Route
          path="/facilities"
          element={
            isAuthenticated ? (
              <FacilitiesPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </div>
  );
}