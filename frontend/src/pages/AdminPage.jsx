import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCurrentUser } from "../Context/useCurrentUser";

const apiUrl = import.meta.env.VITE_API_URL;

export default function AdminPage() {
  const { user, loading } = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    type: "",
    surface: "",
    status: "available",
    max_pp: "",
    image_url: "",
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [batchForm, setBatchForm] = useState({
    start_hour: 8,
    end_hour: 22,
    duration_minutes: 60,
  });

  const loadUsers = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/admin/users`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load users");
    const data = await res.json();
    setUsers(data);
  }, []);

  const loadLogs = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/admin/logs`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load logs");
    const data = await res.json();
    setLogs(data);
  }, []);

  const loadTimeSlots = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/admin/time_slots`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load time slots");
    const data = await res.json();
    setTimeSlots(data);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([loadUsers(), loadLogs(), loadTimeSlots()]);
    } catch (err) {
      toast.error(err.message || "Failed to load admin data");
    }
  }, [loadUsers, loadLogs, loadTimeSlots]);



  const generateBatchSlots = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/admin/time_slots/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(batchForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate slots");

      if (data.skipped > 0) {
        toast.warning(data.message, { pauseonHover: false, autoClose: 1500, closeOnClick: true });
      } else {
        toast.success(data.message, { pauseonHover: false, autoClose: 1500, closeOnClick: true });
      }

      loadTimeSlots();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!window.confirm("Delete this time slot?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/time_slots/${slotId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      toast.success("Slot deleted");
      loadTimeSlots();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteAllSlots = async () => {
    if (!window.confirm("Are you sure you want to delete ALL time slots? This cannot be undone.")) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/time_slots/all`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete all slots");
      toast.success("All time slots deleted");
      loadTimeSlots();
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") {
      refreshAll();
    }
  }, [loading, user?.role, refreshAll]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const createFacility = async (e) => {
    e.preventDefault();
    if (!form.name || !form.max_pp) {
      toast.error("Please enter facility name and max people");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/facilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          max_pp: Number(form.max_pp),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Create facility failed");

      toast.success("Facility created");
      setForm({
        name: "",
        location: "",
        type: "",
        surface: "",
        status: "available",
        max_pp: "",
        image_url: "",
      });
    } catch (err) {
      toast.error(err.message || "Create facility failed");
    } finally {
      setSubmitting(false);
    }
  };

  const kickUser = async (targetUserId) => {
    const ok = window.confirm(
      "Kick this user? This will delete their account."
    );
    if (!ok) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/admin/users/${targetUserId}/kick`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kick failed");

      toast.success("User kicked");
      await refreshAll();
    } catch (err) {
      toast.error(err.message || "Kick failed");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "admin") {
    return <div className="p-8 text-red-700">Admin access only.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-800">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage facilities, users and booking logs
            </p>
          </div>
          <div className="flex gap-4">

            <button
              onClick={refreshAll}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-105 hover:bg-emerald-800"
            >
              Refresh Data
            </button>
          </div>
        </div>

        <section className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-emerald-700">
              Batch Generate Time Slots
            </h2>
            <p className="text-xs text-gray-500">
              Create multiple slots at once (e.g. 08:00 to 22:00 every 60 mins)
            </p>
          </div>

          <form
            onSubmit={generateBatchSlots}
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Start Hour (24h)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={batchForm.start_hour}
                onChange={(e) => setBatchForm({ ...batchForm, start_hour: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">End Hour (24h)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={batchForm.end_hour}
                onChange={(e) => setBatchForm({ ...batchForm, end_hour: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Duration (minutes)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={batchForm.duration_minutes}
                onChange={(e) => setBatchForm({ ...batchForm, duration_minutes: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-emerald-800"
              >
                Generate Slots
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-700">Current Time Slots</h3>
              {timeSlots.length > 0 && (
                <button
                  onClick={deleteAllSlots}
                  className="rounded-lg bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-200"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <div key={slot.time_slot_id} className="group relative flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 border border-emerald-100">
                  {slot.start_time} - {slot.end_time}
                  <button
                    onClick={() => deleteSlot(slot.time_slot_id)}
                    className="ml-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              {timeSlots.length === 0 && <p className="text-gray-400 italic">No time slots created yet.</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-2xl font-bold text-emerald-700">
            Add New Facility
          </h2>

          <form
            onSubmit={createFacility}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <input
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Facility name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
            <input
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Location"
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
            />
            <input
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Type (basketball, etc.)"
              value={form.type}
              onChange={(e) => onChange("type", e.target.value)}
            />
            <input
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Surface"
              value={form.surface}
              onChange={(e) => onChange("surface", e.target.value)}
            />
            <input
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Image URL"
              value={form.image_url}
              onChange={(e) => onChange("image_url", e.target.value)}
            />
            <select
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={form.status}
              onChange={(e) => onChange("status", e.target.value)}
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>

            <input
              type="number"
              min="1"
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Max people"
              value={form.max_pp}
              onChange={(e) => onChange("max_pp", e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-emerald-800 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Create Facility"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-2xl font-bold text-emerald-700">
            Booking Logs
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr className="w-fit">
                  <th className="p-3 text-left font-semibold">Time</th>
                  <th className="p-3 text-left font-semibold">User</th>
                  <th className="p-3 text-left font-semibold">Court</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                  <th className="p-3 text-left font-semibold">Action</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr
                    key={row.booking_id}
                    className="border-t hover:bg-emerald-50"
                  >
                    <td className="p-3 w-50">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="p-3 w-50">
                      {row.firstname} {row.lastname}
                    </td>
                    <td className="p-3">{row.courtname}</td>
                    <td className="p-3">{row.detail?.date || row.date || "-"}</td>
                    <td className="p-3 capitalize">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${row.action === "book"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${row.status === "success"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-2xl font-bold text-emerald-700">
            Manage Users
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr>
                  <th className="p-3 text-left font-semibold">User ID</th>
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Role</th>
                  <th className="p-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-t hover:bg-emerald-50">
                    <td className="p-3">{u.user_id}</td>
                    <td className="p-3">
                      {u.firstname || "-"} {u.lastname || ""}
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">
                      <button
                        onClick={() => kickUser(u.user_id)}
                        disabled={u.role === "admin"}
                        className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:bg-gray-400"
                      >
                        Kick
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
