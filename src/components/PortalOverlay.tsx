// src/components/PortalOverlay.tsx  (fires the white-burst using your CSS)
import React, { useEffect, useRef, useState } from "react";
import bus from "../lib/bus";

export default function PortalOverlay(){
  const ref = useRef<HTMLDivElement|null>(null);
  const [on, setOn] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const off = bus.on("orb:portal", ({ x, y }: { x: number; y: number }) => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty("--px", `${x}px`);
      el.style.setProperty("--py", `${y}px`);
      setOn(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOn(false), 700);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      off();
    };
  }, []);

  return <div ref={ref} className={`portal-overlay${on ? " on": ""}`} />;
}

