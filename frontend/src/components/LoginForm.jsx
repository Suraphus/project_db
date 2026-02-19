import { useNavigate } from "react-router-dom";
import { useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function LoginForm({ setIsLogin, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        navigate("/facilities");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-w-full flex items-center justify-center">
      <div className="w-[360px] bg-white p-[26px] rounded-[14px] shadow-md flex flex-col gap-[10px]">
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[34px] bg-[#dde2e6] rounded px-2"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-[34px] bg-[#dde2e6] rounded px-2"
        />

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
