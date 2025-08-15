import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface RadialMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  items?: RadialMenuItem[];
  closeOnSelect?: boolean;
}

interface RadialMenuProps {
  center: { x: number; y: number };
  onClose: () => void;
  items: RadialMenuItem[];
}

export default function RadialMenu({ center, onClose, items }: RadialMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [stack, setStack] = useState<RadialMenuItem[][]>([items]);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    menuRef.current?.focus();
    setStack([items]);
    setIndex(0);
  }, [items]);

  const currentItems = stack[stack.length - 1];

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
      if (item.items) {
        setStack([...stack, item.items]);
        setIndex(0);
      } else {
        item.action?.();
        if (item.closeOnSelect !== false) onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (stack.length > 1) {
        setStack(stack.slice(0, -1));
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

  const angleFor = (i: number, len: number) => (360 / len) * i - 90;

  function renderItem(
    item: RadialMenuItem,
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
        style={{ ...rbtn, left: -20, top: -20 }}
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
          if (item.items) {
            setStack([...stack, item.items]);
            setIndex(0);
          } else {
            item.action?.();
            if (item.closeOnSelect !== false) onClose();
          }
        }}
      >
        {item.icon}
      </motion.button>
    );
  }

  const activeId = currentItems[index]?.id || "";
  const radius = stack.length === 1 ? 74 : 120;

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-activedescendant={`assistant-menu-item-${activeId}`}
      style={{
        position: "fixed",
        left: center.x,
        top: center.y,
        width: 0,
        height: 0,
        zIndex: 9998,
      }}
    >
      <AnimatePresence>
        {currentItems.map((item, i) =>
          renderItem(item, i, i === index, radius, currentItems.length)
        )}
      </AnimatePresence>
      <AnimatePresence>
        <motion.button
          key={stack.length === 1 ? "close" : "back"}
          id={
            stack.length === 1
              ? "assistant-menu-item-close"
              : "assistant-menu-item-back"
          }
          role="menuitem"
          tabIndex={-1}
          aria-label={stack.length === 1 ? "Close" : "Back"}
          style={{ ...rbtn, left: -20, top: -20 }}
          initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onClick={() => {
            if (stack.length === 1) {
              onClose();
            } else {
              setStack(stack.slice(0, -1));
              setIndex(0);
            }
          }}
        >
          {stack.length === 1 ? "✖️" : "⬅️"}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}

