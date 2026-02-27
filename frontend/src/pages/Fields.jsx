import React, { useState } from "react";
import { MapPin, X } from "lucide-react";
import { useParams } from "react-router-dom";
import BookingCalendar from "../components/BookingCalendar";
import { getAllField } from "../Context/getAllField";
import { useCurrentUser } from "../Context/useCurrentUser";

export const Fields = () => {
  const { user } = useCurrentUser();
  const { fields, loading } = getAllField();
  const [selectedField, setSelectedField] = useState(null);
  const { sportName } = useParams();
  const decodedSportName = decodeURIComponent(sportName || "");
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const isAdmin = user?.role == "admin";
  const apiUrl = import.meta.env.VITE_API_URL;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }
  console.log(fields);
  console.log("API URL:", apiUrl);

  if (!fields) return null;

  const fieldsList = fields.filter(
    (item) => item.type?.toLowerCase() === decodedSportName.toLowerCase()
  );

  const handleBookingConfirm = (bookingData) => {
    console.log("Booking confirmed:", bookingData);
    alert("Booking created successfully");
    setSelectedField(null);
  };

  const handleDeleteField = async () => {
    if (!fieldToDelete) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/fields/${fieldToDelete.court_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }
      alert("ลบสำเร็จ");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("ลบไม่สำเร็จ");
    } finally {
      setFieldToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 xl:grid-cols-3">
        {fieldsList.length === 0 && (
          <div className="col-span-full text-center text-xl font-semibold text-gray-600">
            ไม่พบสนามสำหรับกีฬา "{decodedSportName}"
          </div>
        )}
        {fieldsList.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedField(item)}
            className="hover:cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white pb-1 shadow-md">
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFieldToDelete(item);
                    console.log(fieldToDelete);
                  }}
                  className="absolute right-3 top-3 z-10 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
                >
                  ลบสนาม
                </button>
              )}
              <div>
                <img
                  className="mb-2 h-70 w-full rounded-t-2xl object-cover"
                  src={item.img_url}
                  alt={item.name}
                />
              </div>
              <div className="mb-6">
                <p className="text-xl font-bold mx-2 mb-1">{item.name}</p>
                <div className="flex gap-1 justify-center">
                  <p>
                    <MapPin size={20} />
                  </p>
                  <p className="text-gray-500 -translate-y-0.5">
                    {item.location}
                  </p>
                </div>
              </div>

              <div className="gap-3 flex justify-between mb-4 mx-4">
                <div className="p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl">
                  <p className="text-sm text-gray-400">Surface</p>
                  <p>{item.surface}</p>
                </div>
                <div className="p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl">
                  <p className="text-sm text-gray-400">Capacity</p>
                  <p>{item.max_pp}</p>
                </div>

                <div className="p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl">
                  <p className="text-sm text-gray-400">Status</p>
                  <p>{item.status}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto">
            <button
              onClick={() => setSelectedField(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2 text-white transition hover:bg-slate-900"
              aria-label="Close booking dialog"
            >
              <X size={18} />
            </button>

            <BookingCalendar
              courtId={selectedField.court_id}
              fieldName={selectedField.name}
              onConfirm={handleBookingConfirm}
            />
          </div>
        </div>
      )}
      {fieldToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              ยืนยันการลบสนาม
            </h2>
            <p className="mb-6 text-gray-600">
              คุณต้องการลบสนาม "{fieldToDelete.name}" ใช่หรือไม่?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFieldToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleDeleteField}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
