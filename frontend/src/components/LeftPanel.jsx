export default function LeftPanel({ isLogin, setIsLogin }) {
  return (
    <div className="w-[340px] bg-[#efefef] m-[26px] rounded-[14px] flex flex-col items-center justify-center gap-[18px] shadow-[0_2px_4px_rgba(0,0,0,.15)]">
      
      <div className="text-[30px] font-extrabold flex items-center gap-2">
        <span className="relative text-[#117C0D] font-black">
          KU
          <span className="absolute left-[2px] bottom-[-6px] w-[36px] h-[6px] bg-[#d4e157] rounded-[3px]"></span>
        </span>
        <span className="text-[#005E37] font-semibold tracking-[1px]">
          FACILITY
        </span>
      </div>

      <img
        className="w-[120px] my-[6px]"
        src="https://lh5.googleusercontent.com/proxy/qbxHivySAmM2hiuGTp-q0UfvgDii-6pWAQIlDal764IEMnPXj9CXMjSP1_0yl_l4M7RIM-VLdQsz64ndTLEdHF2EiVfkUSeHUXHFTjKr3cgKL90"
        alt="logo"
      />

      <button
        className={`w-[75%] py-[14px] rounded-[12px] text-[16px] font-semibold transition ${
          isLogin
            ? "bg-[#f7f7f7] text-[#145a32] shadow-[inset_0_0_0_2px_#ececec]"
            : "bg-[#e3e3e3] text-[#9aa0a6]  hover:cursor-pointer hover:bg-[#0a5c34] hover:text-white "
        }`}
        onClick={() => setIsLogin(true)}
      >
        Login
      </button>

      <button
        className={`w-[75%]  py-[14px] rounded-[12px] text-[16px] font-semibold transition ${
          !isLogin
            ? "bg-[#f7f7f7] text-[#145a32] shadow-[inset_0_0_0_2px_#ececec]"
            : "bg-[#e3e3e3] text-[#9aa0a6] hover:cursor-pointer hover:bg-[#0a5c34] hover:text-white"
        }`}
        onClick={() => setIsLogin(false)}
      >
        Register
      </button>
    </div>
  );
}
