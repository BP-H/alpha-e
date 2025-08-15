import React, { useEffect, useRef, useState } from "react";

interface RadialMenuProps {
  center: { x: number; y: number };
  onClose: () => void;
  onChat: () => void;
  onReact: (emoji: string) => void;
  onComment: () => void;
  onRemix: () => void;
  onShare: () => void;
  onProfile: () => void;
  avatarUrl: string;
  emojis: string[];
}

export default function RadialMenu({
  center,
  onClose,
  onChat,
  onReact,
  onComment,
  onRemix,
  onShare,
  onProfile,
  avatarUrl,
  emojis,
}: RadialMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"root" | "react" | "create">("root");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    menuRef.current?.focus();
    setStep("root");
    setIndex(0);
  }, []);

  const rootItems = [
    { id: "chat", label: "Chat", icon: "💬", action: () => { onChat(); onClose(); } },
    { id: "react", label: "React", icon: "👏", next: "react" as const },
    { id: "create", label: "Create", icon: "✍️", next: "create" as const },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <img
          src={avatarUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ),
      action: () => {
        onProfile();
        onClose();
      },
    },
  ];

  const reactItems = emojis.map((e, i) => ({
    id: `emoji-${i}`,
    label: `React ${e}`,
    icon: e,
    action: () => {
      onReact(e);
      onClose();
    },
  }));

  const createItems = [
    { id: "comment", label: "Comment", icon: "✍️", action: () => { onComment(); onClose(); } },
    { id: "remix", label: "Remix", icon: "🎬", action: () => { onRemix(); onClose(); } },
    { id: "share", label: "Share", icon: "↗️", action: () => { onShare(); onClose(); } },
  ];

  const currentItems = step === "root" ? rootItems : step === "react" ? reactItems : createItems;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((index + 1) % currentItems.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((index - 1 + currentItems.length) % currentItems.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = currentItems[index];
      if ((item as any).next) {
        setStep((item as any).next);
        setIndex(0);
      } else {
        (item as any).action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (step !== "root") {
        setStep("root");
        setIndex(0);
      } else {
        onClose();
      }
    }
  }

  const rbtn: React.CSSProperties = {
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

  function renderItem(
    item: any,
    i: number,
    angle: number,
    active: boolean,
    radius: number
  ) {
    const rad = (angle * Math.PI) / 180;
    const x = radius * Math.cos(rad) - 20;
    const y = radius * Math.sin(rad) - 20;
    return (
      <button
        key={item.id}
        id={`assistant-menu-item-${item.id}`}
        role="menuitem"
        tabIndex={-1}
        aria-label={item.label}
        style={{
          ...rbtn,
          left: x,
          top: y,
          boxShadow: active ? "0 0 0 2px #ff74de" : undefined,
        }}
        onClick={() => {
          if (item.next) {
            setStep(item.next);
            setIndex(0);
          } else {
            item.action();
          }
        }}
      >
        {item.icon}
      </button>
    );
  }

  const rootAngles = [-90, 230, 310, 180];
  const reactAngles = reactItems.map((_, i) => (360 / reactItems.length) * i - 90);
  const createAngles = createItems.map((_, i) => (360 / createItems.length) * i - 90);

  const activeId = currentItems[index]?.id || "";

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-activedescendant={`assistant-menu-item-${activeId}`}
      style={{ position: "fixed", left: center.x, top: center.y, width: 0, height: 0, zIndex: 9998 }}
    >
      {rootItems.map((item, i) =>
        renderItem(item, i, rootAngles[i], step === "root" && i === index, 74)
      )}
      {step === "react" &&
        reactItems.map((item, i) =>
          renderItem(item, i, reactAngles[i], i === index, 120)
        )}
      {step === "create" &&
        createItems.map((item, i) =>
          renderItem(item, i, createAngles[i], i === index, 120)
        )}
    </div>
  );
}

