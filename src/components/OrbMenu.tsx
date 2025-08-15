import React, { useState } from "react";
import "./OrbMenu.css";

export interface OrbAction {
  id: string;
  icon: string;
  label: string;
  onSelect?: () => void;
}

export interface OrbCategory extends OrbAction {
  actions?: OrbAction[];
}

interface OrbMenuProps {
  x: number;
  y: number;
  categories: OrbCategory[];
  onClose: () => void;
}

export default function OrbMenu({ x, y, categories, onClose }: OrbMenuProps) {
  const [active, setActive] = useState<OrbCategory | null>(null);
  const items = active ? active.actions || [] : categories;
  const radius = active ? 110 : 80;

  return (
    <div className="orb-menu" style={{ left: x, top: y }}>
      {items.map((item, i) => (
        <button
          key={item.id}
          className="orb-menu__item"
          style={{
            "--i": i,
            "--count": items.length,
            "--r": `${radius}px`,
          } as React.CSSProperties}
          aria-label={item.label}
          title={item.label}
          onClick={() => {
            if (active) {
              item.onSelect?.();
              setActive(null);
              onClose();
            } else if (item.actions && item.actions.length > 0) {
              setActive(item);
            } else {
              item.onSelect?.();
              onClose();
            }
          }}
        >
          <span className="orb-menu__icon">{item.icon}</span>
        </button>
      ))}
      {active && (
        <button
          className="orb-menu__item orb-menu__back"
          style={{
            "--i": items.length,
            "--count": items.length + 1,
            "--r": `${radius}px`,
          } as React.CSSProperties}
          aria-label="Back"
          title="Back"
          onClick={() => setActive(null)}
        >
          ⬅️
        </button>
      )}
    </div>
  );
}

