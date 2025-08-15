import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./RadialMenu.css";

export interface RadialMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  items?: RadialMenuItem[];
}

interface RadialMenuProps {
  center: { x: number; y: number };
  onClose: () => void;
  config: RadialMenuItem[];
}

export default function RadialMenu({ center, onClose, config }: RadialMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [stack, setStack] = useState<RadialMenuItem[][]>([config]);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    menuRef.current?.focus();
    setStack([config]);
    setIndex(0);
  }, [config]);

  const currentItems = stack[stack.length - 1];
  const depth = stack.length - 1;

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
        onClose();
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

  const angleFor = (i: number, len: number) => (360 / len) * i - 90;

  function renderItem(item: RadialMenuItem, i: number, active: boolean, radius: number, len: number) {
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
          reduceMotion ? { opacity: 1, x, y, scale: 1 } : { opacity: 0, x: 0, y: 0, scale: 0 }
        }
        animate={{
          opacity: 1,
          x,
          y,
          scale: 1,
          boxShadow: active ? "0 0 0 2px #ff74de" : "none",
        }}
        exit={
          reduceMotion ? { opacity: 1, x, y, scale: 1 } : { opacity: 0, x: 0, y: 0, scale: 0 }
        }
        transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
        whileHover={reduceMotion ? undefined : { scale: 1.1 }}
        onClick={() => {
          if (item.items) {
            setStack([...stack, item.items]);
            setIndex(0);
          } else {
            item.action?.();
            onClose();
          }
        }}
      >
        {item.icon}
      </motion.button>
    );
  }

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
      {depth === 0 && (
        <AnimatePresence>
          {currentItems.map((item, i) => renderItem(item, i, i === index, 74, currentItems.length))}
        </AnimatePresence>
      )}
      {depth > 0 && (
        <AnimatePresence>
          {currentItems.map((item, i) => renderItem(item, i, i === index, 120, currentItems.length))}
        </AnimatePresence>
      )}
      <AnimatePresence mode="wait">
        <motion.button
          key={depth === 0 ? "close" : "back"}
          id={depth === 0 ? "assistant-menu-item-close" : "assistant-menu-item-back"}
          role="menuitem"
          tabIndex={-1}
          aria-label={depth === 0 ? "Close" : "Back"}
          className="rbtn"
          style={{ left: -20, top: -20 }}
          initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
          whileHover={reduceMotion ? undefined : { scale: 1.1 }}
          onClick={() => {
            if (depth === 0) {
              onClose();
            } else {
              setStack(stack.slice(0, -1));
              setIndex(0);
            }
          }}
        >
          {depth === 0 ? "✖️" : "⬅️"}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}

