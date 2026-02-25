import { useContext } from "react";
import FieldContext from "./field-context";

export function getAllField() {
  return useContext(FieldContext);
}
