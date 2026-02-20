import { useState, useEffect } from "react";

export default function ProfilePage() {
  // สมมติข้อมูล User (ในงานจริงอาจจะดึงจาก API หรือ Context)
  const [user, setUser] = useState({
    name: "สมชาย ใจดี",
    email: "somchai.j@example.com",
    avatar: "https://via.placeholder.com/150",
  });

  // สมมติข้อมูลประวัติการจอง
  const [bookings, setBookings] = useState([
    { id: 1, service: "สนามฟุตบอล", date: "2026-02-20", status: "สำเร็จ", player: "5", maxPlayer: "30" },
    { id: 2, service: "คอร์ดแบดมินตัน", date: "2026-02-25", status: "รอดำเนินการ", player: "2", maxPlayer: "8" },
    { id: 3, service: "คอร์ทเทนนิส", date: "2026-01-15", status: "ยกเลิก", player: "3", maxPlayer: "8" },
  ]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ส่วนข้อมูล Profile */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center space-x-6">
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-[#e6e8ea]"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <button className="mt-2 text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
              แก้ไขโปรไฟล์
            </button>
          </div>
        </div>

        {/* ส่วนประวัติการจอง */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">ประวัติการจองของคุณ</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="px-6 py-4">สนาม</th>
                  <th className="px-6 py-4">วันที่</th>
                  <th className="px-6 py-4">จำนวนผู้เล่น</th>
                  <th className="px-6 py-4">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-700">{item.service}</td>
                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                    <td className="px-6 py-4 text-gray-600">{item.player}/{item.maxPlayer}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        item.status === "สำเร็จ" ? "bg-green-100 text-green-700" :
                        item.status === "รอดำเนินการ" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              ไม่พบประวัติการจอง
            </div>
          )}
        </div>

      </div>
    </div>
  );
}