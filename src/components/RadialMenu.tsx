import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const [step, setStep] = useState<"root" | "react" | "react-all" | "create">("root");
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

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

  const PAGE_SIZE = 8;
  const baseReactItems = emojis.slice(0, PAGE_SIZE).map((e, i) => ({
    id: `emoji-${i}`,
    label: `React ${e}`,
    icon: e,
    action: () => {
      onReact(e);
      onClose();
    },
  }));
  const reactItems =
    emojis.length > PAGE_SIZE
      ? [
          ...baseReactItems,
          { id: "more", label: "More reactions", icon: "…", next: "react-all" as const },
        ]
      : baseReactItems;
  const reactAllItems = emojis.map((e, i) => ({
    id: `emoji-all-${i}`,
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

  const currentItems =
    step === "root"
      ? rootItems
      : step === "react"
      ? reactItems
      : step === "react-all"
      ? reactAllItems
      : createItems;

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
      <motion.button
        key={item.id}
        id={`assistant-menu-item-${item.id}`}
        role="menuitem"
        tabIndex={-1}
        aria-label={item.label}
        style={{
          ...rbtn,
          left: -20,
          top: -20,
        }}
        initial={
          reduceMotion
            ? { scale: 1, opacity: 1, x, y }
            : { scale: 0, opacity: 0, x: 0, y: 0 }
        }
        animate={{
          scale: 1,
          opacity: 1,
          x,
          y,
          boxShadow: active ? "0 0 0 2px #ff74de" : "none",
        }}
        exit={
          reduceMotion
            ? { scale: 1, opacity: 1, x, y }
            : { scale: 0, opacity: 0, x: 0, y: 0 }
        }
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
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
      </motion.button>
    );
  }

  // evenly spaced around the circle for a more logical layout
  const evenlySpaced = (len: number) =>
    Array.from({ length: len }, (_, i) => (360 / len) * i - 90);
  const rootAngles = evenlySpaced(rootItems.length);
  const reactAngles = evenlySpaced(reactItems.length);
  const reactAllAngles = evenlySpaced(reactAllItems.length);
  const createAngles = evenlySpaced(createItems.length);

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
      <AnimatePresence>
        {rootItems.map((item, i) =>
          step === "root" ? renderItem(item, i, rootAngles[i], i === index, 74) : null
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.button
          key={step === "root" ? "close" : "back"}
          id={step === "root" ? "assistant-menu-item-close" : "assistant-menu-item-back"}
          role="menuitem"
          tabIndex={-1}
          aria-label={step === "root" ? "Close" : "Back"}
          style={{ ...rbtn, left: -20, top: -20 }}
          initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onClick={() => {
            if (step === "root") {
              onClose();
            } else {
              setStep("root");
              setIndex(0);
            }
          }}
        >
          {step === "root" ? "✖️" : "⬅️"}
        </motion.button>
      </AnimatePresence>
      {step === "react" && (
        <AnimatePresence>
          {reactItems.map((item, i) =>
            renderItem(item, i, reactAngles[i], i === index, 120)
          )}
        </AnimatePresence>
      )}
      {step === "react-all" && (
        <AnimatePresence>
          {reactAllItems.map((item, i) =>
            renderItem(item, i, reactAllAngles[i], i === index, 120)
          )}
        </AnimatePresence>
      )}
      {step === "create" && (
        <AnimatePresence>
          {createItems.map((item, i) =>
            renderItem(item, i, createAngles[i], i === index, 120)
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

