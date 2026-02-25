import { useNavigate } from "react-router-dom";
import FacilityCard from "../components/FacilityCard";
import { getAllField } from "../Context/getAllField";

function Facilities() {
  const navigate = useNavigate();
  const { fields, loading } = getAllField();

  if (loading)
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  if (!fields) return null;

  const uniqueSports = Object.values(
    fields.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {
          name: item.type,
          img: item.img_url,
        };
      }
      return acc;
    }, {})
  );

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
          {uniqueSports.map((item, index) => (
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
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                  {item.name}
                </h2>
                <button
                  onClick={() =>
                    navigate(
                      `/fields/${encodeURIComponent(
                        item.name.replace(" field", "")
                      )}`
                    )
                  }
                  className="mt-4 px-6 py-2 bg-[#005E40] text-white rounded-full hover:bg-[#014d34] transition hover:cursor-pointer hover:scale-105"
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
