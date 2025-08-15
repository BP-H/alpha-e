// src/components/AvatarPortal.tsx
import React, { useEffect, useState } from "react";
import bus from "../lib/bus";
import "./AvatarPortal.css";

export default function AvatarPortal(){
  const [on, setOn] = useState(false);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const off = bus.on("avatar-portal:open", () => {
      setOn(true);
      timeoutId = setTimeout(() => setOn(false), 900);
    });

    return () => {
      off();
      clearTimeout(timeoutId);
    };
  }, []);
  return on ? (
    <div className="avatar-portal">
      <div className="ap-splash" />
      <div className="ap-ring" />
    </div>
  ) : null;
}
