import { useNavigate } from "react-router-dom"

function FacilityCard({ img, name }) {
  const navigate = useNavigate()
  return (
    <div className="text-center">
      <button onClick={()=>navigate('/fields') }   className="hover:cursor-pointer hover:scale-105 transition-all w-full h-[220px] object-cover rounded-[10px] border border-black">  
      <img
        src={img}
        className="w-full h-[220px] object-cover rounded-[10px] border border-black"
      />
      <p className="mt-[12px] text-[24px] font-bold">{name}</p>
      </button>
    </div>
  )
}
export default FacilityCard
