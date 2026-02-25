import { useContext } from "react";
import BookingContext from "./booking-context";

export function useCurrentBooking() {
  return useContext(BookingContext);
}
