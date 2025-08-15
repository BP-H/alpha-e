import React, { useLayoutEffect, useRef } from "react";
import bus from "../lib/bus";
import { useTheme } from "../lib/useTheme";
import BrandBadge from "./BrandBadge";

export default function Topbar() {
  const ref = useRef<HTMLElement | null>(null);
  const [theme, setTheme] = useTheme();

  const handleEnterUniverse = () => {
    const el = document.querySelector(".brand-dot") as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    bus.emit("orb:portal", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const setH = () => {
      document.documentElement.style.setProperty("--topbar-h", `${el.offsetHeight}px`);
    };
    setH();
    const ro = new ResizeObserver(setH);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header className="topbar" ref={ref}>
      <BrandBadge onEnterUniverse={handleEnterUniverse} />

      <div className="topbar-title">superNova_2177</div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="topbar-menu-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}