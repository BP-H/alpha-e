// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import World from "./pages/World";
import Settings from "./pages/Settings";
import "./styles.css"; // global reset/theme (includes your orb/chat/portal CSS)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Feed />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/world" element={<World />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
