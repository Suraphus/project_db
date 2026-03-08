import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Flame } from "lucide-react";
import { useAllField } from "../Context/getAllField";
import BookingCalendar from "../components/BookingCalendar";

const apiUrl = import.meta.env.VITE_API_URL;

function Facilities() {
  const navigate = useNavigate();
  const { fields, loading } = useAllField();
  
  const [quickJoinData, setQuickJoinData] = useState(null);
  const [quickJoins, setQuickJoins] = useState([]);
  const [loadingQuickJoins, setLoadingQuickJoins] = useState(true);

  useEffect(() => {
    const fetchQuickJoins = async () => {
      try {
        const apiBase = (apiUrl || "").trim().replace(/\/+$/, "") || window.location.origin;
        const res = await fetch(`${apiBase}/api/quickjoin`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setQuickJoins(data);
        }
      } catch (error) {
        console.error("Failed to fetch quick joins:", error);
      } finally {
        setLoadingQuickJoins(false);
      }
    };
    fetchQuickJoins();
  }, []);

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

  const handleQuickJoinConfirm = () => {
    setQuickJoinData(null);
    window.location.reload(); // รีเฟรชหน้าเพื่ออัปเดตจำนวนคน
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] py-16 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-gray-800">
            Choose your sports
          </h1>
        </div>

        {/* ส่วนแสดง Quick Join */}
        {!loadingQuickJoins && quickJoins.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 p-4 rounded-2xl shadow-sm border border-green-300">
            <div className="flex items-center gap-2 mb-3 text-[#084929]">
              <Flame size={20} className="animate-pulse" />
              <h2 className="text-lg font-bold tracking-wide">Quick Join - วันนี้ใกล้เต็มแล้ว เข้าร่วมเลย!</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {quickJoins.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setQuickJoinData(item)}
                  className="flex flex-col text-left border border-green-400 bg-gradient-to-br from-green-200 to-emerald-300 hover:from-[#0a5c34] hover:to-emerald-600 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300 rounded-xl p-3 min-w-[250px] cursor-pointer group"
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="font-bold text-base text-[#084929] group-hover:text-white transition-colors duration-300">
                      {item.sportName}
                    </span>
                    <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded text-green-900 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                      วันนี้ • {item.room.time}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end w-full">
                    <span className="text-xs font-medium text-green-800 group-hover:text-emerald-100 transition-colors duration-300">
                      {item.fieldName}
                    </span>
                    <span className="text-sm font-extrabold text-[#c2410c] group-hover:text-yellow-300 transition-colors duration-300">
                      ขาดอีก {item.room.maxPlayers - item.room.currentPlayers} คน
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {uniqueSports.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden group hover:scale-105"
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

      {quickJoinData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto">
            <button
              onClick={() => setQuickJoinData(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2 text-white transition hover:bg-slate-900"
              aria-label="Close booking dialog"
            >
              <X size={18} />
            </button>

            <BookingCalendar
              courtId={quickJoinData.courtId} 
              fieldName={quickJoinData.fieldName}
              onConfirm={handleQuickJoinConfirm}
              preselectedData={quickJoinData} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Facilities;
