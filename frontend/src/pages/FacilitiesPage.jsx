import FacilityCard from "../components/FacilityCard"

function Facilities() {
  const data = [
    { img: "https://cdn.prod.website-files.com/65724dca4c6e2916c2b00c25/65e9a454bcdf8bb397b81543_Howe_Final_4.jpg", name: "Basketball field" },
    { img: "https://d2jqoimos5um40.cloudfront.net/site_1525/1e1bd6.jpeg", name: "Football field" },
    { img: "https://www.sportcourtnortherncalifornia.com/wp-content/uploads/Futsal4.jpg", name: "Futsal field" },
    { img: "https://en.reformsports.com/oxegrebi/2025/08/dimensions-dun-terrain-de-volley-ball1.webp", name: "Volleyball field" },
    { img: "https://pacecourt.com/wp-content/uploads/2024/04/96.jpeg", name: "Badminton field" },
    { img: "https://tenniscourtsuk.co.uk/images/1920/11689034/Pickleball-Main.jpg", name: "Tennis field" },
  ]

  return (
    <div className="px-[60px] py-[40px]">
      <p className="text-[#005E40] text-4xl font-bold ...">Facilities</p>

      <div className="bg-[#e6e6e6] p-10 rounded-[5px] grid grid-cols-3 gap-10 shadow-lg">
        {data.map((item, index) => (
          <FacilityCard key={index} img={item.img} name={item.name} />
        ))}
      </div>
    </div>
  )
}

export default Facilities
