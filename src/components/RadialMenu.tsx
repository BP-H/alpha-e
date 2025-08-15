import React from "react";
import "./RadialMenu.css";

export interface RadialMenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}

export default function RadialMenu({
  open,
  center,
  items,
}: {
  open: boolean;
  center: { x: number; y: number };
  items: RadialMenuItem[];
}) {
  if (!open) return null;
  const step = 360 / items.length;
  return (
    <div
      className="radial-menu"
      style={{ left: center.x, top: center.y, transform: "translate(-50%, -50%)" }}
    >
      {items.map((it, i) => (
        <button
          key={it.id}
          className="radial-menu__btn"
          style={{ "--angle": `${i * step}deg` } as React.CSSProperties }
          onClick={it.onSelect}
          aria-label={it.label}
          title={it.label}
        >
          {it.icon}
        </button>
      ))}
    </div>
  );
}
