import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, User, LogOut } from "lucide-react";
import { useCurrentUser } from "../Context/useCurrentUser";

const apiUrl = import.meta.env.VITE_API_URL;

function Topbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isAdmin = user?.role === "admin";
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

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
        {!isLoginPage && isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="text-yellow-400 underline font-medium hover:cursor-pointer hover:scale-110 transition-all"
          >
            admin
          </button>
        )}
        {!isLoginPage && user && (
          <div className="relative">
            <span className="text-xl font-bold mb-2 mr-4">
              Login as : {user.student_id}
            </span>

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="bg-green-400 text-[#0a5c34] p-2 rounded-full hover:scale-110 hover:bg-yellow-300 transition-all shadow-md cursor-pointer"
            >
              <User size={20} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-40 bg-white text-black rounded-lg shadow-lg py-2">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;
