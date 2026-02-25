import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../Context/useCurrentUser";
import { useCurrentBooking } from "../Context/useCurrentBooking";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const { bookings, fetchBookings } = useCurrentBooking(); // สมมติว่าใน Context มี fetchBookings ให้เรียกใช้เพื่ออัปเดตข้อมูล
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  // ฟังก์ชันสำหรับยกเลิกการจอง
  const handleCancel = async (booking_id) => {
    const confirmCancel = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?");
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      const res = await fetch(`${apiUrl}/api/bookings/${booking_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "ไม่สามารถยกเลิกการจองได้");
      }

      toast.success("ยกเลิกการจองสำเร็จ");
      // อัปเดตรายการจองใหม่หลังจากยกเลิก
      if (fetchBookings) {
        await fetchBookings();
      }
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
    } finally {
      setCancelling(false);
    }
  };

  // รอโหลดข้อมูลผู้ใช้
  if (!user) {
    return <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-10">
      {/* เนื้อหาหลัก */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-black mb-6">Profile</h2>

        <div className="bg-[#fafafa] rounded-[2rem] p-8 shadow-sm">
          {/* ส่วนข้อมูล Profile */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            {/* รูปโปรไฟล์ */}
            <div className="w-24 h-24 bg-[#e2e2e2] rounded-full flex items-center justify-center text-sm text-gray-500 text-center leading-tight shadow-inner overflow-hidden">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>profile<br />picture</>
              )}
            </div>

            {/* ข้อมูลผู้ใช้ */}
            <div className="bg-[#dcdcdc] px-6 py-4 rounded-xl w-full md:w-auto shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-black">
                  {user.firstname} {user.lastname}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-[#ffcc00] text-black' : 'bg-[#a3e6a3] text-gray-800'}`}>
                  {user.role}
                </span>
              </div>
              <div className="text-black font-medium mb-1">รหัสนิสิต: {user.student_id}</div>
              <div className="text-sm text-gray-700">{user.email}</div>
            </div>
          </div>

          {/* ส่วนประวัติการจอง */}
          <h3 className="text-2xl font-bold text-black mb-4">ประวัติการจอง</h3>

          <div className="bg-[#dcdcdc] rounded-xl overflow-hidden pb-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm text-black whitespace-nowrap">
                <thead className="border-b border-gray-400/50 bg-[#e5e7eb]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Booking ID</th>
                    <th className="py-3 px-4 font-semibold">Court</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Session</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Created</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bookings && bookings.length > 0 ? (
                    bookings.map((item) => (
                      <tr key={item.booking_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{item.booking_id}</td>
                        <td className="py-3 px-4 font-medium">{item.court_name || item.court_id}</td>
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4">{item.session || item.time}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {new Date(item.create_at || item.booking_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleCancel(item.booking_id)}
                            disabled={cancelling || item.status === 'cancelled'}
                            className="bg-[#cc0000] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancelling ? "กำลังยกเลิก..." : "cancel"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-gray-500">ไม่มีประวัติการจอง</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (ส่วนนี้ทำ UI ไว้ให้ แต่อาจต้องเชื่อม Logic ทีหลังถ้าข้อมูลมีเยอะ) */}
            {bookings && bookings.length > 0 && (
              <div className="mt-6 flex justify-center items-center gap-3 text-gray-600">
                <button className="hover:text-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">&lt;</button>
                <button className="bg-white text-black w-8 h-8 flex items-center justify-center rounded-md shadow-sm font-medium">1</button>
                <button className="hover:text-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">&gt;</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}