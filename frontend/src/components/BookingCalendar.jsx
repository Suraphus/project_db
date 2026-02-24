import { useMemo, useState, useCallback } from "react";
import { Users, Check } from "lucide-react";

const mockRoomsByField = {
  "Basketball 1": [
    { id: 1, time: "08:00 - 10:00", maxPlayers: 10, currentPlayers: 2 },
    { id: 2, time: "10:00 - 12:00", maxPlayers: 10, currentPlayers: 9 },
    { id: 3, time: "14:00 - 16:00", maxPlayers: 10, currentPlayers: 10 },
    { id: 4, time: "18:00 - 20:00", maxPlayers: 8, currentPlayers: 5 },
  ],
  "Football 3": [
    { id: 5, time: "09:00 - 11:00", maxPlayers: 12, currentPlayers: 12 },
    { id: 6, time: "13:00 - 15:00", maxPlayers: 12, currentPlayers: 4 },
    { id: 7, time: "17:00 - 19:00", maxPlayers: 12, currentPlayers: 11 },
  ],
  "Field C": [
    { id: 8, time: "07:00 - 09:00", maxPlayers: 6, currentPlayers: 1 },
    { id: 9, time: "15:00 - 17:00", maxPlayers: 6, currentPlayers: 6 },
    { id: 10, time: "19:00 - 21:00", maxPlayers: 6, currentPlayers: 3 },
  ],
};

function RoomCard({ room, selected, onSelect }) {
  const isFull = room.currentPlayers >= room.maxPlayers;

  const ratio = room.currentPlayers / room.maxPlayers;

  let statusLabel = "Waiting";
  let statusClass = "bg-yellow-100 text-yellow-700";

  if (isFull) {
    statusLabel = "Full";
    statusClass = "bg-red-100 text-red-600";
  } else if (ratio >= 0.8) {
    statusLabel = "Recommend";
    statusClass = "bg-orange-100 text-orange-600";
  } else if (ratio >= 0.5) {
    statusLabel = "Ready";
    statusClass = "bg-emerald-100 text-emerald-700";
  }

  return (
    <button
      onClick={() => onSelect(room)}
      disabled={isFull}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isFull
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : selected
          ? "border-emerald-600 bg-emerald-50"
          : "border-slate-300 bg-white hover:border-emerald-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{room.time}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        <Users size={16} />
        <span>
          {room.currentPlayers}/{room.maxPlayers} players
        </span>
      </div>
    </button>
  );
}

export default function BookingCalendar({ fieldName, onConfirm }) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = useMemo(() => {
    if (!fieldName) return [];
    return mockRoomsByField[fieldName] || [];
  }, [fieldName]);

  const handleSelect = useCallback((room) => {
    setSelectedRoom(room);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedRoom || !onConfirm) return;

    onConfirm({
      fieldName,
      time: selectedRoom.time,
      currentPlayers: selectedRoom.currentPlayers,
      maxPlayers: selectedRoom.maxPlayers,
    });
  }, [fieldName, onConfirm, selectedRoom]);

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            GAME LOBBY
          </p>
          <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
            {fieldName}
          </h2>
        </div>
        <div className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Choose a room to join
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rooms.length === 0 ? (
          <p className="text-slate-500">No rooms available.</p>
        ) : (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              selected={selectedRoom?.id === room.id}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedRoom}
        className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-semibold transition ${
          selectedRoom
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "cursor-not-allowed bg-slate-200 text-slate-500"
        }`}
      >
        <Check size={16} />
        Join Room
      </button>
    </div>
  );
}
