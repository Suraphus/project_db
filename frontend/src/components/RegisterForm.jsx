
export default function RegisterForm({ setIsLogin }) {

  const handleRegister = () => {
  

    alert("Register successful!")

    setIsLogin(true)
  }

  return (
    <div className="min-w-full flex items-center justify-center">
      <div className="w-[360px] bg-white p-[26px] rounded-[14px] shadow-[0_4px_8px_rgba(0,0,0,.25)] flex flex-col gap-[10px]">
        
        <label className="text-[12px] text-[#555]">Student ID</label>
        <input className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none" />

        <label className="text-[12px] text-[#555]">Name</label>
        <input className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none" />

        <label className="text-[12px] text-[#555]">Surname</label>
        <input className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none" />

        <label className="text-[12px] text-[#555]">Email</label>
        <input className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none" />

        <label className="text-[12px] text-[#555]">Password</label>
        <input type="password" className="h-[34px] rounded-[8px] bg-[#dde2e6] px-[10px] outline-none" />

        <button 
          onClick={handleRegister}
          className="mt-[10px] h-[42px] rounded-[12px] bg-[#0a5c34] text-white text-[16px]"
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

