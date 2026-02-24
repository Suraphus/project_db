import { useState } from "react";

export default function ProfilePage() {
  // ข้อมูลจำลองตามภาพต้นแบบ
  const [user, setUser] = useState({
    name: "สมชาย",
    studentId: "67112345",
    role: "admin",
    email: "hongtong@gmail.com",
  });

  // ข้อมูลประวัติการจองตามภาพต้นแบบ
  const [bookings, setBookings] = useState([
    {
      booking_id: "173",
      court_id: "2",
      date: "2025-7-1",
      session: "9:00-10:00",
      status: "7/10",
      booking_date: "2025-6-20",
    },
  ]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      {/* ส่วน Header (Navbar) */}
      <header className="bg-[#006633] text-white px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-medium tracking-wide">Kasetsart University</h1>
        <div className="text-right text-sm">
          <div>Name : Student_ID</div>
          <button className="text-[#ffcc00] underline hover:text-yellow-300">
            logout
          </button>
        </div>
      </header>

      {/* เนื้อหาหลัก */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-black mb-6">Profile</h2>
        
        <div className="bg-[#fafafa] rounded-[2rem] p-8 shadow-sm">
          
          {/* ส่วนข้อมูล Profile */}
          <div className="flex items-center gap-6 mb-10">
            {/* รูปโปรไฟล์ */}
            <div className="w-24 h-24 bg-[#e2e2e2] rounded-full flex items-center justify-center text-sm text-black text-center leading-tight shadow-inner">
              profile<br />picture
            </div>
            
            {/* ข้อมูลผู้ใช้ */}
            <div className="bg-[#dcdcdc] px-6 py-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-black">{user.name}</span>
                <span className="text-black">{user.studentId}</span>
                <span className="bg-[#a3e6a3] text-gray-800 text-xs px-3 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
              <div className="text-sm text-black">{user.email}</div>
            </div>
          </div>

          {/* ส่วนประวัติการจอง */}
          <h3 className="text-2xl font-bold text-black mb-4">ประวัติการจอง</h3>
          
          <div className="bg-[#dcdcdc] rounded-t-md overflow-hidden pb-4">
            <table className="w-full text-center text-sm text-black">
              <thead className="border-b border-gray-400/50">
                <tr>
                  <th className="py-2 font-semibold">booking_id</th>
                  <th className="py-2 font-semibold">court_id</th>
                  <th className="py-2 font-semibold">date</th>
                  <th className="py-2 font-semibold">session</th>
                  <th className="py-2 font-semibold">status</th>
                  <th className="py-2 font-semibold">booking date</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {bookings.map((item) => (
                  <tr key={item.booking_id} className="border-b border-gray-200">
                    <td className="py-3">{item.booking_id}</td>
                    <td className="py-3">{item.court_id}</td>
                    <td className="py-3">{item.date}</td>
                    <td className="py-3">{item.session}</td>
                    <td className="py-3 text-red-600 font-medium">{item.status}</td>
                    <td className="py-3">{item.booking_date}</td>
                    <td className="py-3 pr-4 text-right">
                      <button className="bg-[#cc0000] text-white px-4 py-1 rounded-full text-xs hover:bg-red-700 transition">
                        cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center gap-3 text-gray-600">
              <button className="hover:text-black">&lt;</button>
              <button className="bg-white text-black px-3 py-1 rounded shadow-sm">1</button>
              <button className="hover:text-black">&gt;</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}