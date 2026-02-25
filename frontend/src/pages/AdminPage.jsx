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

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([loadUsers(), loadLogs()]);
    } catch (err) {
      toast.error(err.message || "Failed to load admin data");
    }
  }, [loadUsers, loadLogs]);

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") {
      refreshAll();
    }
  }, [loading, user?.role, refreshAll]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0a5c34]">Admin Dashboard</h1>
        <button
          onClick={refreshAll}
          className="rounded-lg bg-[#0a5c34] px-4 py-2 text-white hover:opacity-90"
        >
          Refresh
        </button>
      </div>

      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Insert New Facility</h2>
        <form
          onSubmit={createFacility}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <input
            className="rounded border p-2"
            placeholder="Facility name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="Location"
            value={form.location}
            onChange={(e) => onChange("location", e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="Type (basketball, etc.)"
            value={form.type}
            onChange={(e) => onChange("type", e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="Surface"
            value={form.surface}
            onChange={(e) => onChange("surface", e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => onChange("image_url", e.target.value)}
          />
          <select
            className="rounded border p-2"
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="available">available</option>
            <option value="maintenance">maintenance</option>
            <option value="closed">closed</option>
          </select>
          <input
            type="number"
            min="1"
            className="rounded border p-2"
            placeholder="Max people"
            value={form.max_pp}
            onChange={(e) => onChange("max_pp", e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-[#0a5c34] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Add Facility"}
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Booking Logs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Time</th>
                <th className="border p-2 text-left">User</th>
                <th className="border p-2 text-left">Court</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.booking_id}>
                  <td className="border p-2">
                    {new Date(row.create_at).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    {row.firstname} {row.lastname} ({row.email})
                  </td>
                  <td className="border p-2">{row.court_name}</td>
                  <td className="border p-2">{row.date}</td>
                  <td className="border p-2">{row.status}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    className="border p-2 text-center text-gray-500"
                    colSpan="5"
                  >
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Kick User</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">User ID</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Role</th>
                <th className="border p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td className="border p-2">{u.user_id}</td>
                  <td className="border p-2">
                    {u.firstname || "-"} {u.lastname || ""}
                  </td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.role}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => kickUser(u.user_id)}
                      disabled={u.role === "admin"}
                      className="rounded bg-red-600 px-3 py-1 text-white disabled:bg-gray-400"
                    >
                      Kick
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    className="border p-2 text-center text-gray-500"
                    colSpan="5"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
