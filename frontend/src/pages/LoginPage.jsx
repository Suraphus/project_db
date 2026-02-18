import { useState } from "react";
import LeftPanel from "../components/LeftPanel";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function LoginPage({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-[1120px] h-[640px] bg-[#e6e8ea] rounded shadow-lg flex overflow-hidden">
        
        <LeftPanel isLogin={isLogin} setIsLogin={setIsLogin} />

        <div className="flex-1 flex items-center">
          {isLogin ? (
            <LoginForm 
              setIsLogin={setIsLogin}
              setIsAuthenticated={setIsAuthenticated}
            />
          ) : (
            <RegisterForm setIsLogin={setIsLogin} />
          )}
        </div>

      </div>
    </div>
  );
}