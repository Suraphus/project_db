import { useNavigate, useLocation } from "react-router-dom";
import { House } from "lucide-react";
import { useCurrentUser } from "../Context/AuthContext";

const apiUrl = import.meta.env.VITE_API_URL;

function Topbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const handleLogout = async () => {
    await fetch(`${apiUrl}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  // if (!loading) return null;

  return (
    <div className=" bg-[#0a5c34] text-white h-[60px] flex justify-between items-center px-10 text-[22px] font-medium">
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/facilities")}
          className="hover:cursor-pointer hover:text-yellow-400 hover:scale-150 transition-all "
        >
          <House />
        </button>

        <div>Kasetsart University</div>
      </div>
      <div className="flex gap-5 items-center text-[18px]">
        {!isLoginPage && user && (
          <>
            <span>
              {user.firstname} {user.lastname} ({user.student_id})
            </span>
          </>
        )}
        <button
          onClick={handleLogout}
          className="text-yellow-400 underline font-medium hover:cursor-pointer hover:scale-110 transition-all"
        >
          logout
        </button>
      </div>
    </div>
  );
}

export default Topbar;
