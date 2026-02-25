import { memo, useCallback, useMemo, useState } from "react";
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

export default function BookingCalendar({ fieldName, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const today = useMemo(() => new Date(), []);

  const rooms = useMemo(
    () => [
      {
        id: 1,
        name: "Lobby #1",
        time: "10:00 - 11:00",
        currentPlayers: 2,
        maxPlayers: 4,
      },
      {
        id: 2,
        name: "Lobby #2",
        time: "11:30 - 12:30",
        currentPlayers: 4,
        maxPlayers: 4,
      },
      {
        id: 3,
        name: "Lobby #3",
        time: "14:00 - 15:30",
        currentPlayers: 1,
        maxPlayers: 6,
      },
      {
        id: 4,
        name: "Lobby #4",
        time: "18:00 - 19:00",
        currentPlayers: 5,
        maxPlayers: 6,
      },
    ],
    []
  );

  const canConfirm = selectedRoom !== null;

  const handleDateChange = useCallback((value) => {
    const nextDate = Array.isArray(value) ? value[0] : value;
    setSelectedDate(nextDate);
    setSelectedRoom(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!canConfirm || !onConfirm) return;

    onConfirm({
      fieldName,
      date: formatDateKey(selectedDate),
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
    });
  }, [canConfirm, fieldName, onConfirm, selectedDate, selectedRoom]);

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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rooms.map((room) => {
              const isFull = room.currentPlayers >= room.maxPlayers;
              const isReady = room.currentPlayers === room.maxPlayers;
              const statusText = isFull
                ? "FULL"
                : room.currentPlayers >= Math.ceil(room.maxPlayers / 2)
                ? "Almost Ready"
                : "Waiting for players";

              return (
                <button
                  key={room.id}
                  onClick={() => !isFull && setSelectedRoom(room)}
                  disabled={isFull}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    isFull
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : selectedRoom?.id === room.id
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{room.name}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        isFull
                          ? "bg-red-100 text-red-600"
                          : room.currentPlayers >=
                            Math.ceil(room.maxPlayers / 2)
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-medium opacity-80">
                    Time: {room.time}
                  </p>
                  <p className="text-xs opacity-80">
                    Players: {room.currentPlayers} / {room.maxPlayers}
                  </p>
                </button>
              );
            })}
          </div>

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
                <p>Lobby: {selectedRoom.name}</p>
                <p>Time: {selectedRoom.time}</p>
                <p>
                  Players: {selectedRoom.currentPlayers} /{" "}
                  {selectedRoom.maxPlayers}
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
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
