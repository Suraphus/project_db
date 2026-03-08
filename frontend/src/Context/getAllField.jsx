import { useContext } from "react";
import FieldContext from "./field-context";

export function useAllField() {
  return useContext(FieldContext);
}
