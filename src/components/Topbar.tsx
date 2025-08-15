import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import bus from "../lib/bus";

export default function Topbar() {
  const ref = useRef<HTMLElement | null>(null);
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "dark"
      : "dark"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

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
      {/* 🔵 Brand orb with 2177 — click → portal burst, then sidebar */}
      <button
        className="topbar-orb"
        onClick={(e) => {
          const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
          bus.emit("orb:portal", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
          bus.emit("sidebar:toggle");
        }}
        aria-label="Open brand menu"
      >
        <span className="topbar-orb-text">2177</span>
      </button>

      <div className="topbar-title">superNova_2177</div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="topbar-menu-btn"
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          className="topbar-menu-btn"
          onClick={() => bus.emit("sidebar:toggle")}
          aria-label="Menu"
        >
          ≡
        </button>
      </div>
    </header>
  );
}