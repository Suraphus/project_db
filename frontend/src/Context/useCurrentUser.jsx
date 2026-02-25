import { useContext } from "react";
import AuthContext from "./auth-context";

export function useCurrentUser() {
  return useContext(AuthContext);
}
