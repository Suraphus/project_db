import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../Context/useCurrentUser";
import { useCurrentBooking } from "../Context/useCurrentBooking";

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const { bookings, fetchBookings } = useCurrentBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetchBookings) fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        alert("Booking cancelled successfully!");
        if (fetchBookings) fetchBookings();
      } else {
        const errorData = await res.json();
        alert(
          `Failed to cancel booking: ${errorData.error || errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Error cancelling booking. Please try again.");
    }
  };

  const [profileImg, setProfileImg] = useState(
    localStorage.getItem("user_pfp") || null
  );
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImg(base64String);
        // 2. บันทึกลง localStorage เมื่อเลือกรูปใหม่
        localStorage.setItem("user_pfp", base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  // ข้อมูลประวัติการจองตามภาพต้นแบบ

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      {/* เนื้อหาหลัก */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-black mb-6">Profile</h2>

        <div className="bg-[#fafafa] rounded-[2rem] p-8 shadow-sm">
          {/* ส่วนข้อมูล Profile */}
          <div className="flex items-center gap-6 mb-10">
            {/* ส่วนรูปโปรไฟล์ที่แก้ไขใหม่ */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative w-24 h-24 bg-[#e2e2e2] rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition shadow-inner border-2 border-gray-300"
            >
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-sm text-black text-center leading-tight">
                  Click to upload
                </div>
              )}
              {/* Input ที่ซ่อนอยู่ */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* ข้อมูลผู้ใช้ */}
            <div className="bg-gray-200 px-6 py-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-black">
                  {user?.firstname} {user?.lastname}
                </span>
                <span className="bg-[#a3e6a3] text-gray-800 text-xs px-3 py-0.5 rounded-full">
                  {user?.role}
                </span>
              </div>
              <span className="text-black">{user?.student_id}</span>
              <div className="text-sm text-black">{user?.email}</div>
            </div>
          </div>

          {/* ส่วนประวัติการจอง */}
          <h3 className="text-2xl font-bold text-black mb-4">ประวัติการจอง</h3>

          <div className="bg-gray-200 rounded-t-md rounded-b-md overflow-hidden pb-4">
            <table className="w-full text-center text-sm text-black">
              <thead className="border-b border-gray-400/50">
                <tr>
                  <th className="py-2 font-semibold">Booking ID</th>
                  <th className="py-2 font-semibold">Court</th>
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Session</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Created</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {bookings?.map((item) => (
                  <tr
                    key={item.booking_id}
                    className="border-b border-gray-200"
                  >
                    <td className="py-3">{item.booking_id}</td>
                    <td className="py-3">{item.court_name || item.court_id}</td>
                    <td className="py-3">{item.date}</td>
                    <td className="py-3">
                      {item.start_time && item.end_time
                        ? `${item.start_time} - ${item.end_time}`
                        : item.time_id}
                    </td>
                    <td className="py-3 text-red-600 font-medium">
                      {item.status}
                    </td>
                    <td className="py-3">{item.create_at}</td>
                    <td className="py-3 pr-4 text-right">
                      {item.status !== "cancelled" &&
                        item.status !== "Cancelled" && (
                          <button
                            onClick={() => handleCancelBooking(item.booking_id)}
                            className="bg-[#cc0000] text-white px-4 py-1 rounded-full text-xs hover:bg-red-700 transition"
                          >
                            cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center gap-3 text-gray-600">
              <button className="hover:text-black">&lt;</button>
              <button className="bg-white text-black px-3 py-1 rounded shadow-sm">
                1
              </button>
              <button className="hover:text-black">&gt;</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
