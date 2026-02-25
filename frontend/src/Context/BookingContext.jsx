import { useEffect, useState } from "react";
import BookingContext from "./booking-context";

const apiUrl = import.meta.env.VITE_API_URL;

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/bookings`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <BookingContext.Provider value={{ bookings, loading, fetchBookings }}>
      {children}
    </BookingContext.Provider>
  );
}
