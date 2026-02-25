import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { BookingProvider } from "./Context/BookingContext";
import { FieldProvider } from "./Context/FieldContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <BookingProvider>
        <FieldProvider>
          <App />
        </FieldProvider>
      </BookingProvider>
    </AuthProvider>
  </BrowserRouter>
);
