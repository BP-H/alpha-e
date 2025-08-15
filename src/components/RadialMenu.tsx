import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./RadialMenu.css";

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

  const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

  useEffect(() => {
    menuRef.current?.focus();
    setStep("root");
    setIndex(0);
  }, []);

  const PAGE_SIZE = 8;

  const menuConfig = {
    root: [
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
            aria-hidden="true"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ),
        action: () => {
          onProfile();
          onClose();
        },
      },
    ],
    react: emojis.slice(0, PAGE_SIZE).map((e, i) => ({
      id: `emoji-${i}`,
      label: `React ${e}`,
      icon: e,
      action: () => {
        onReact(e);
        onClose();
      },
    })),
    reactAll: emojis.map((e, i) => ({
      id: `emoji-all-${i}`,
      label: `React ${e}`,
      icon: e,
      action: () => {
        onReact(e);
        onClose();
      },
    })),
    create: [
      { id: "comment", label: "Comment", icon: "✍️", action: () => { onComment(); onClose(); } },
      { id: "remix", label: "Remix", icon: "🎬", action: () => { onRemix(); onClose(); } },
      { id: "share", label: "Share", icon: "↗️", action: () => { onShare(); onClose(); } },
    ],
    moreReact: { id: "more", label: "More reactions", icon: "…", next: "react-all" as const },
  } as const;

  const rootItems = menuConfig.root;
  const baseReactItems = menuConfig.react;
  const reactItems =
    emojis.length > PAGE_SIZE
      ? [...baseReactItems, menuConfig.moreReact]
      : baseReactItems;
  const reactAllItems = menuConfig.reactAll;
  const createItems = menuConfig.create;

  const currentItems =
    step === "root"
      ? rootItems
      : step === "react"
      ? reactItems
      : step === "react-all"
      ? reactAllItems
      : createItems;

  function handleKeyDown(e: React.KeyboardEvent) {
    const totalItems = currentItems.length + 1; // include center control
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((index + 1) % totalItems);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((index - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (index === currentItems.length) {
        if (step === "root") {
          onClose();
        } else {
          setStep("root");
          setIndex(0);
        }
      } else {
        const item = currentItems[index];
        if ((item as any).next) {
          setStep((item as any).next);
          setIndex(0);
        } else {
          (item as any).action();
        }
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
  const rootRadius = 74;
  const subRadius = 120;
  const radius = step === "root" ? rootRadius : subRadius;
  const { innerWidth: vw, innerHeight: vh } =
    typeof window !== "undefined" ? window : ({ innerWidth: 0, innerHeight: 0 } as any);
  const margin = 40;
  const edgeLeft = center.x < radius + margin;
  const edgeRight = center.x > vw - radius - margin;
  const edgeTop = center.y < radius + margin;
  const edgeBottom = center.y > vh - radius - margin;
  const safeX = clamp(center.x, radius + margin, vw - radius - margin);
  const safeY = clamp(center.y, radius + margin, vh - radius - margin);
  const menuCenter = { x: safeX, y: safeY };
  let angleOffset = 0;
  if (edgeTop && edgeLeft) angleOffset = 135;
  else if (edgeTop && edgeRight) angleOffset = -135;
  else if (edgeBottom && edgeLeft) angleOffset = 45;
  else if (edgeBottom && edgeRight) angleOffset = -45;
  else if (edgeTop) angleOffset = 180;
  else if (edgeBottom) angleOffset = 0;
  else if (edgeLeft) angleOffset = 90;
  else if (edgeRight) angleOffset = -90;

  const angleFor = (i: number, len: number) => (360 / len) * i - 90 + angleOffset;

  function renderItem(
    item: any,
    i: number,
    active: boolean,
    radius: number,
    len: number
  ) {
    const rad = (angleFor(i, len) * Math.PI) / 180;
    const x = radius * Math.cos(rad) - 20;
    const y = radius * Math.sin(rad) - 20;
    return (
      <motion.button
        key={item.id}
        id={`assistant-menu-item-${item.id}`}
        role="menuitem"
        tabIndex={-1}
        aria-label={item.label}
        className="rbtn"
        style={{ left: -20, top: -20 }}
        initial={
          reduceMotion
            ? { opacity: 1, x, y, scale: 1 }
            : { opacity: 0, x: 0, y: 0, scale: 0 }
        }
        animate={{
          opacity: 1,
          x,
          y,
          scale: 1,
          boxShadow: active ? "0 0 0 2px var(--rm-ring)" : "none",
        }}
        exit={
          reduceMotion
            ? { opacity: 1, x, y, scale: 1 }
            : { opacity: 0, x: 0, y: 0, scale: 0 }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={
          reduceMotion ? undefined : { scale: 1.06, opacity: 0.95 }
        }
        whileFocus={
          reduceMotion ? undefined : { scale: 1.06, opacity: 0.95 }
        }
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

  const activeId =
    index === currentItems.length
      ? step === "root"
        ? "close"
        : "back"
      : currentItems[index]?.id || "";

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-activedescendant={`assistant-menu-item-${activeId}`}
      style={{ position: "fixed", left: menuCenter.x, top: menuCenter.y, width: 0, height: 0, zIndex: 9998 }}
    >
      {step === "root" && (
        <AnimatePresence>
          {rootItems.map((item, i) =>
            renderItem(item, i, i === index, rootRadius, currentItems.length)
          )}
        </AnimatePresence>
      )}
      <AnimatePresence mode="wait">
        <motion.button
          key={step === "root" ? "close" : "back"}
          id={step === "root" ? "assistant-menu-item-close" : "assistant-menu-item-back"}
          role="menuitem"
          tabIndex={-1}
          aria-label={step === "root" ? "Close menu" : "Go back"}
          className="rbtn"
          style={{ left: -20, top: -20 }}
          initial={
            reduceMotion
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : { opacity: 0, x: 0, y: 0, scale: 0 }
          }
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            boxShadow:
              index === currentItems.length
                ? "0 0 0 2px var(--rm-ring)"
                : "none",
          }}
          exit={
            reduceMotion
              ? { opacity: 1, x: 0, y: 0, scale: 1 }
              : { opacity: 0, x: 0, y: 0, scale: 0 }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
          whileHover={
            reduceMotion ? undefined : { scale: 1.06, opacity: 0.95 }
          }
          whileFocus={
            reduceMotion ? undefined : { scale: 1.06, opacity: 0.95 }
          }
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
            renderItem(item, i, i === index, subRadius, currentItems.length)
          )}
        </AnimatePresence>
      )}
      {step === "react-all" && (
        <AnimatePresence>
          {reactAllItems.map((item, i) =>
            renderItem(item, i, i === index, subRadius, currentItems.length)
          )}
        </AnimatePresence>
      )}
      {step === "create" && (
        <AnimatePresence>
          {createItems.map((item, i) =>
            renderItem(item, i, i === index, subRadius, currentItems.length)
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

