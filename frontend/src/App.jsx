import { useState } from "react";
import LeftPanel from "./components/LeftPanel";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#cfd2d4] flex items-center justify-center font-['Segoe_UI',sans-serif]">
      
      {/* TOP BAR */}
      <div className="absolute top-0 left-0 w-full h-[52px] bg-[#0a5c34] text-white flex items-center pl-[22px] font-medium">
        Kasetsart University
      </div>

      {/* MAIN CONTAINER */}
      <div className="w-[1120px] h-[640px] bg-[#e6e8ea] rounded-[6px] shadow-[0_6px_12px_rgba(0,0,0,.18)] flex overflow-hidden">
        
        <LeftPanel isLogin={isLogin} setIsLogin={setIsLogin} />

        {/* RIGHT SIDE */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div
            className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)]"
            style={{
              transform: isLogin ? "translateX(0%)" : "translateX(-100%)",
            }}
          >
            <LoginForm setIsLogin={setIsLogin} />
            <RegisterForm setIsLogin={setIsLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}
