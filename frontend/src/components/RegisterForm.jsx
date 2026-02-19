import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast, Bounce } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export default function RegisterForm({ setIsLogin }) {
  const navigate = useNavigate();
  const [student_id, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ student_id, name, surname, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Register Successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          transition: Bounce,
        });

        setTimeout(() => {
          setIsLogin(true);
          navigate("/login");
        }, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="min-w-full flex items-center justify-center">
      <div className="w-[360px] bg-white p-[26px] rounded-[14px] shadow-[0_4px_8px_rgba(0,0,0,.25)] flex flex-col gap-[10px]">
        <label className="text-[12px] text-[#555]">Student ID</label>
        <input
          value={student_id}
          onChange={(e) => setStudentId(e.target.value)}
          className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none"
        />
        <label className="text-[12px] text-[#555]">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none"
        />

        <label className="text-[12px] text-[#555]">Surname</label>
        <input
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none"
        />

        <label className="text-[12px] text-[#555]">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none"
        />

        <label className="text-[12px] text-[#555]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none"
        />

        <button
          onClick={handleRegister}
          className="mt-[10px] h-[42px] rounded-[12px] bg-[#0a5c34] text-white text-[16px] hover:cursor-pointer"
        >
          Register
        </button>

        <div
          className="text-right text-[11px] underline cursor-pointer"
          onClick={() => setIsLogin(true)}
        >
          Already have an account?
        </div>
      </div>
    </div>
  );
}
