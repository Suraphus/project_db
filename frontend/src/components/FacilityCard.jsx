import { useNavigate } from "react-router-dom";

function FacilityCard({ img, name }) {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <button
        onClick={() => navigate(`/fields/${encodeURIComponent(name)}`)}
        className="hover:cursor-pointer hover:scale-105 transition-all w-full"
      >
        <img
          src={img}
          alt={name}
          className="w-full h-[220px] object-cover rounded-[10px] border border-black"
        />
      </button>

      <p className="mt-[12px] text-[24px] font-bold uppercase">{name}</p>
    </div>
  );
}
export default FacilityCard;
