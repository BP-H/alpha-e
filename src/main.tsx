// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// If you have global styles (from earlier step), keep this:
import "./styles.css";

// Register the <model-viewer> web component in the browser only.
if (typeof window !== "undefined") {
  import("@google/model-viewer");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
