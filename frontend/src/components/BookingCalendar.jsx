import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, Clock3, Check } from "lucide-react";

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DatePickerPanel = memo(function DatePickerPanel({
  selectedDate,
  onDateChange,
  minDate,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <CalendarDays size={18} />
        <p className="text-sm font-semibold">Pick a date</p>
      </div>
      <Calendar
        value={selectedDate}
        onChange={onDateChange}
        minDate={minDate}
        className="!w-full border-0"
      />
    </div>
  );
});

export default function BookingCalendar({ courtId, fieldName, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const today = useMemo(() => new Date(), []);
  const rawApiUrl = import.meta.env.VITE_API_URL;
  const apiBase = useMemo(() => {
    const raw = (rawApiUrl || "").trim();
    if (!raw) return window.location.origin;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw.replace(/\/+$/, "");
    }
    return `${window.location.protocol}//${raw.replace(/\/+$/, "")}`;
  }, [rawApiUrl]);

  const canConfirm =
    selectedRoom !== null &&
    !selectedRoom.is_my_booking &&
    !selectedRoom.is_full &&
    !loadingSlots &&
    !submitting;

  const handleDateChange = useCallback((value) => {
    const nextDate = Array.isArray(value) ? value[0] : value;
    setSelectedDate(nextDate);
    setSelectedRoom(null);
  }, []);

  const fetchSlots = useCallback(
    async (dateObj) => {
      if (!courtId) return;
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const dateKey = formatDateKey(dateObj);
        const url = new URL(`/api/courts/${courtId}/slots`, apiBase);
        url.searchParams.set("date", dateKey);

        const res = await fetch(url.toString(), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Failed to load slots");
        }
        setSlots(data.slots || []);
      } catch (error) {
        setSlots([]);
        setSlotsError(error.message || "Failed to load slots");
      } finally {
        setLoadingSlots(false);
      }
    },
    [apiBase, courtId]
  );

  useEffect(() => {
    setSelectedRoom(null);
    fetchSlots(selectedDate);
  }, [selectedDate, courtId, fetchSlots]);

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      const dateKey = formatDateKey(selectedDate);
      const url = new URL("/api/bookings", apiBase);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          court_id: courtId,
          time_slot_id: selectedRoom.time_slot_id,
          date: dateKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || "Booking failed");
      }

      if (onConfirm) {
        onConfirm({
          fieldName,
          date: dateKey,
          courtId,
          timeSlotId: selectedRoom.time_slot_id,
        });
      }
      await fetchSlots(selectedDate);
      setSelectedRoom(null);
    } catch (error) {
      alert(error.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }, [
    apiBase,
    canConfirm,
    courtId,
    fieldName,
    fetchSlots,
    onConfirm,
    selectedDate,
    selectedRoom,
  ]);

  return (
    <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            BOOKING STUDIO
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {fieldName}
          </h2>
        </div>
        <div className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Select day and room
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <DatePickerPanel
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          minDate={today}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <Clock3 size={18} />
            <p className="text-sm font-semibold">Available Rooms</p>
          </div>

          {slotsError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {slotsError}
            </p>
          )}

          {loadingSlots && (
            <p className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
              Loading slots...
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {slots.map((room) => {
              const isMyBooking = room.is_my_booking;
              const isFull = room.is_full;
              const statusText = isMyBooking
                ? "booked"
                : isFull
                ? "full"
                : "available";

              return (
                <button
                  key={room.time_slot_id}
                  onClick={() => !isFull && !isMyBooking && setSelectedRoom(room)}
                  disabled={isFull || isMyBooking}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    isFull || isMyBooking
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : selectedRoom?.time_slot_id === room.time_slot_id
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Slot #{room.time_slot_id}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        isMyBooking
                          ? "bg-indigo-100 text-indigo-700"
                          : isFull
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-medium opacity-80">
                    Time: {room.start_time} - {room.end_time}
                  </p>
                  <p className="text-xs opacity-80">
                    Players: {room.cur_pp} / {room.max_pp}
                  </p>
                </button>
              );
            })}
          </div>

          {!loadingSlots && slots.length === 0 && !slotsError && (
            <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
              No slots found for this date.
            </p>
          )}

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-semibold text-emerald-900">
              Your booking
            </p>
            {selectedRoom === null ? (
              <p className="mt-1 text-sm text-emerald-700">
                Choose a room to preview your booking.
              </p>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-emerald-900">
                <p>Date: {selectedDate.toLocaleDateString()}</p>
                <p>Slot: #{selectedRoom.time_slot_id}</p>
                <p>
                  Time: {selectedRoom.start_time} - {selectedRoom.end_time}
                </p>
                <p>
                  Players: {selectedRoom.cur_pp} / {selectedRoom.max_pp}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              canConfirm
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            <Check size={16} />
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
