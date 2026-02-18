function FacilityCard({ img, name }) {
  return (
    <div className="text-center">
      <img
        src={img}
        className="w-full h-[220px] object-cover rounded-[10px] border border-black"
      />
      <p className="mt-[12px] text-[24px] font-bold">{name}</p>
    </div>
  )
}

export default FacilityCard
