import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export default function LoginForm({ setIsLogin, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError]=useState(null);
  
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
        toast.success("Login successful!", { 
                                              position: "top-right", 
                                              autoClose: 1500, 
                                              hideProgressBar: false, 
                                              closeOnClick: true, 
                                              pauseOnHover: false, 
                                              draggable: false, 
                                              theme: "colored", });
        navigate("/facilities");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
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
        {error && (
    <div className="mt-4 rounded bg-red-100 border border-red-400 text-red-700 px-4 py-3 ">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error}</span>
      <button
        onClick={() => setError(null)}
        className="ml-2 text-red-700 hover:text-red-900"
      >
        ✕
      </button>
    </div>
      )}
      </div>
    </div>
  );
}
