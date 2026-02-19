import { useNavigate } from "react-router-dom";

export default function LoginForm({ setIsLogin, setIsAuthenticated }) {

  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/facilities");   
  };

  return (
    <div className="min-w-full flex items-center justify-center">
      <div className="w-[360px] bg-white p-[26px] rounded-[14px] shadow-md flex flex-col gap-[10px]">
        
        <label>Email</label>
        <input className="h-[34px] bg-[#dde2e6] rounded px-2" />

        <label>Password</label>
        <input type="password" className="h-[34px] bg-[#dde2e6] rounded px-2" />

        <button
          onClick={handleLogin}
          className="mt-[10px] h-[42px] bg-[#0a5c34] text-white rounded hover:cursor-pointer"
        >
          Login
        </button>

        <div
          className="text-right text-sm underline cursor-pointer"
          onClick={() => setIsLogin(false)}
        >
          Sign up
        </div>

      </div>
    </div>
  );
}