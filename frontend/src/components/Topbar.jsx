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
  const [profileImg, setProfileImg] = React.useState(null);

  React.useEffect(() => {
    if (!user) {
      setProfileImg(null);
      return;
    }

    const key = user?.user_id ? `user_pfp_${user.user_id}` : "user_pfp";
    setProfileImg(
      localStorage.getItem(key) || localStorage.getItem("user_pfp") || null
    );

    const syncProfileImg = () => {
      setProfileImg(
        localStorage.getItem(key) || localStorage.getItem("user_pfp") || null
      );
    };

    window.addEventListener("user-pfp-updated", syncProfileImg);
    window.addEventListener("storage", syncProfileImg);
    return () => {
      window.removeEventListener("user-pfp-updated", syncProfileImg);
      window.removeEventListener("storage", syncProfileImg);
    };
  }, [user]);

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
          <div className="flex items-center">
            <span className="text-xl font-bold mr-4">
              Login as : {user.student_id}
            </span>

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-10 w-10 overflow-hidden rounded-full bg-green-400 text-[#0a5c34] hover:scale-110 hover:bg-yellow-300 transition-all shadow-md cursor-pointer"
            >
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="User profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User size={20} />
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="absolute right-10 mt-40 w-40 bg-white text-black rounded-lg shadow-lg py-2 z-50">
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
