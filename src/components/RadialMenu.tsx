import React, { useState } from "react";

interface RadialMenuProps {
  onSelect: (id: string) => void;
  style?: React.CSSProperties;
}

type Item = {
  id: string;
  icon: React.ReactNode;
  children?: Item[];
};

const EMOJIS = ["❤️", "😂", "🎉", "👍", "😢", "😡", "🔥", "😍"]; // subset for radial

const SHARE_TARGETS: Item[] = [
  { id: "copy", icon: "📋" },
  { id: "link", icon: "🔗" },
  { id: "msg", icon: "✉️" },
];

const PRIMARY: Item[] = [
  { id: "chat", icon: "💬" },
  { id: "react", icon: "👏", children: EMOJIS.map(e => ({ id: e, icon: e })) },
  { id: "comment", icon: "✍️" },
  { id: "remix", icon: "🎬" },
  { id: "share", icon: "🔗", children: SHARE_TARGETS },
];

export default function RadialMenu({ onSelect, style }: RadialMenuProps) {
  const [active, setActive] = useState<Item | null>(null);
  const items = active?.children ?? PRIMARY;
  const radius = active ? 72 : 80;
  const step = 360 / items.length;

  const btnStyle: React.CSSProperties = {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(14,16,22,.7)",
    border: "1px solid rgba(255,255,255,.15)",
    color: "#fff",
    cursor: "pointer",
    backdropFilter: "blur(8px) saturate(140%)",
  };

  return (
    <div style={{ position: "fixed", left: 0, top: 0, ...style }}>
      <div style={{ position: "relative", width: 0, height: 0 }}>
        {items.map((item, i) => {
          const ang = -90 + i * step;
          const transform = `rotate(${ang}deg) translate(${radius}px) rotate(${-ang}deg)`;
          return (
            <button
              key={item.id}
              style={{ ...btnStyle, transform }}
              onClick={() => {
                if (active) {
                  onSelect(`${active.id}:${item.id}`);
                  setActive(null);
                } else if (item.children) {
                  setActive(item);
                } else {
                  onSelect(item.id);
                }
              }}
              aria-label={item.id}
              title={item.id}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
