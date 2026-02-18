function FacilityCard({ img, name }) {
  return (
    <div className="text-center">
      <img
        src={img}
        className="w-full h-[220px] object-cover rounded-[20px] border border-black"
      />
      <p className="mt-[15px] text-[22px]">{name}</p>
    </div>
  )
}

export default FacilityCard
