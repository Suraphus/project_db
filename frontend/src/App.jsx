
import { useState } from "react";
import LeftPanel from "./components/LeftPanel";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Facilities from "./components/Facilities";
import Topbar from "./components/Topbar";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-[#cfd2d4] font-['Segoe_UI',sans-serif]">
      
      {isAuthenticated && (
        <Topbar setIsAuthenticated={setIsAuthenticated} />
      )}

      {isAuthenticated ? (
        <Facilities />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="w-[1120px] h-[640px] bg-[#e6e8ea] rounded-[6px] shadow-[0_6px_12px_rgba(0,0,0,.18)] flex overflow-hidden">
            
            <LeftPanel isLogin={isLogin} setIsLogin={setIsLogin} />

            <div className="flex-1 overflow-hidden relative flex items-center">
              <div
                className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)]"
                style={{
                  transform: isLogin ? "translateX(0%)" : "translateX(-100%)",
                }}
              >
                <LoginForm 
                  setIsLogin={setIsLogin} 
                  setIsAuthenticated={setIsAuthenticated}
                />
                <RegisterForm setIsLogin={setIsLogin} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

