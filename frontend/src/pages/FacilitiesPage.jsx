import { useNavigate } from "react-router-dom";
import FacilityCard from "../components/FacilityCard";

function Facilities() {
  const navigate = useNavigate();
  const data = [
    {
      img: "https://cdn.prod.website-files.com/65724dca4c6e2916c2b00c25/65e9a454bcdf8bb397b81543_Howe_Final_4.jpg",
      name: "Basketball field",
    },
    {
      img: "https://d2jqoimos5um40.cloudfront.net/site_1525/1e1bd6.jpeg",
      name: "Football field",
    },
    {
      img: "https://www.sportcourtnortherncalifornia.com/wp-content/uploads/Futsal4.jpg",
      name: "Futsal field",
    },
    {
      img: "https://en.reformsports.com/oxegrebi/2025/08/dimensions-dun-terrain-de-volley-ball1.webp",
      name: "Volleyball field",
    },
    {
      img: "https://pacecourt.com/wp-content/uploads/2024/04/96.jpeg",
      name: "Badminton field",
    },
    {
      img: "https://tenniscourtsuk.co.uk/images/1920/11689034/Pickleball-Main.jpg",
      name: "Tennis field",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-gray-800">
            Choose your sports
          </h1>
          {/* <div className="w-24 h-1 bg-[#005E40] mx-auto mt-4 rounded-full"></div>
          {/* <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto">
            Select your preferred sport and reserve your field quickly and
            conveniently.
          </p> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden group"
            >
              <div className="h-56 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.name}
                </h2>
                <button
                  onClick={() => navigate("/fields")}
                  className="mt-4 px-6 py-2 bg-[#005E40] text-white rounded-full hover:bg-[#014d34] transition hover:cursor-pointer hover:scale-105gi"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Facilities;
