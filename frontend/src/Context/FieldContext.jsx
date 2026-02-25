import { useEffect, useState } from "react";
import FieldContext from "./field-context";

const apiUrl = import.meta.env.VITE_API_URL;

export function FieldProvider({ children }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFields = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/get_field`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setFields(data);
    } catch {
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return (
    <FieldContext.Provider value={{ fields, loading, fetchFields }}>
      {children}
    </FieldContext.Provider>
  );
}
