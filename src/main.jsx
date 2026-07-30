import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./lib/storageShim"; // sets up window.storage backed by Supabase, before anything renders
import AppGate from "./AppGate";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppGate />
  </React.StrictMode>
);
