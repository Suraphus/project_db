function Topbar({ setIsAuthenticated }) {

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <div className="bg-[#0a5c34] text-white h-[60px] flex justify-between items-center px-10 text-[22px] font-medium">
      <div>Kasetsart University</div>

      <div className="flex gap-5 items-center text-[18px]">
        <span>Name : Student_ID</span>

        <button
          onClick={handleLogout}
          className="text-yellow-400 underline font-medium"
        >
          logout
        </button>
      </div>
    </div>
  )
}

export default Topbar

