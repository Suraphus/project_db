import { useNavigate } from "react-router-dom"
import { House } from "lucide-react"

function Topbar({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <div className=" bg-[#0a5c34] text-white h-[60px] flex justify-between items-center px-10 text-[22px] font-medium">
      <div className="flex gap-4">      
      <button onClick={()=>navigate('/facilities')} className="hover:cursor-pointer hover:text-yellow-400 hover:scale-150 transition-all ">
        <House />
      </button>
      
      <div>Kasetsart University</div>
      </div>
      <div className="flex gap-5 items-center text-[18px]">
        <span>Name : Student_ID</span>

        <button
          onClick={handleLogout}
          className="text-yellow-400 underline font-medium hover:cursor-pointer hover:scale-110 transition-all"
        >
          logout
        </button>
      </div>
    </div>
  )
}

export default Topbar

