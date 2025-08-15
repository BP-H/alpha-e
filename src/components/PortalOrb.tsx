import React, { useEffect, useRef, useState } from "react";
import usePointer from "../hooks/usePointer";

type Props = {
  onAnalyzeImage: (imgUrl: string) => void;
};

type Mode = "idle" | "menu" | "analyze";

const HOLD_MS = 600;
const SNAP_PADDING = 12;
const MOVE_TOLERANCE = 8;

export default function PortalOrb({ onAnalyzeImage }: Props) {
  const orbRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const originRef = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<Mode>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [menuIndex, setMenuIndex] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("orb-pos");
      return saved ? JSON.parse(saved) : { x: 16, y: 16 };
    }
    return { x: 16, y: 16 };
  });
  const [dragging, setDragging] = useState(false);
  const lastTap = useRef<number>(0);
  const analyzeOverlay = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("orb-pos", JSON.stringify(pos));
    }
    if (orbRef.current) {
      orbRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
  }, [pos]);

  function withinSafe(x: number, y: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = 64;
    return {
      x: Math.min(Math.max(x, SNAP_PADDING), w - size - SNAP_PADDING),
      y: Math.min(Math.max(y, SNAP_PADDING), h - size - SNAP_PADDING),
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    // double-tap to snap top-left + vortex
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setMenuOpen(false);
      setMode("idle");
      setPos({ x: 12, y: 12 });
      orbRef.current?.classList.add("vortex");
      window.setTimeout(
        () => orbRef.current?.classList.remove("vortex"),
        900
      );
      return;
    }
    lastTap.current = now;

    setDragging(true);
    startRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    originRef.current = { x: e.clientX, y: e.clientY };

    // long-press => open radial menu
    holdRef.current = window.setTimeout(() => {
      setMenuOpen(true);
      setMode("menu");
      orbRef.current?.classList.add("grow");
    }, HOLD_MS);
  }

  function handlePointerMove(ev: PointerEvent) {
    if (!dragging) return;
    const next = withinSafe(
      ev.clientX - startRef.current.x,
      ev.clientY - startRef.current.y
    );
    setPos(next);
    if (
      holdRef.current &&
      Math.hypot(
        ev.clientX - originRef.current.x,
        ev.clientY - originRef.current.y
      ) > MOVE_TOLERANCE
    ) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    if (mode === "analyze" && analyzeOverlay.current) {
      analyzeOverlay.current.style.setProperty("--x", `${ev.clientX}px`);
      analyzeOverlay.current.style.setProperty("--y", `${ev.clientY}px`);
    }
  }

  function finishInteraction(ev: PointerEvent, canceled = false) {
    setDragging(false);
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    try {
      orbRef.current?.releasePointerCapture(ev.pointerId);
    } catch {}

    if (mode === "analyze") {
      const el = document.elementFromPoint(ev.clientX, ev.clientY) as
        | HTMLElement
        | null;
      const url = el?.closest("[data-asset]")?.getAttribute("data-asset");
      if (url) onAnalyzeImage(url);
      setMode("idle");
      setMenuOpen(false);
      teardownAnalyzeOverlay();
    } else if (canceled) {
      setMode("idle");
      setMenuOpen(false);
      orbRef.current?.classList.remove("grow");
      teardownAnalyzeOverlay();
    }
  }

  function handlePointerUp(ev: PointerEvent) {
    finishInteraction(ev);
  }

  function handlePointerCancel(e: React.PointerEvent) {
    finishInteraction(e.nativeEvent, true);
  }

  function startAnalyze() {
    setMode("analyze");
    setMenuOpen(false);
    orbRef.current?.classList.remove("grow");
    setupAnalyzeOverlay();
  }

  function setupAnalyzeOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "55";
    overlay.style.background =
      "radial-gradient(600px 600px at var(--x,50%) var(--y,50%), rgba(10,132,255,.18), transparent 60%)";
    overlay.style.transition = "background .2s ease";
    overlay.className = "analyze-overlay";
    analyzeOverlay.current = overlay;
    document.body.appendChild(overlay);
  }

  function teardownAnalyzeOverlay() {
    analyzeOverlay.current?.remove();
    analyzeOverlay.current = null;
  }

  const actions: { icon: React.ReactNode; label: string; callback: () => void }[] = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="ico">
          <path
            d="M15.5 15.5L21 21"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
          />
          <circle
            cx="10"
            cy="10"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      label: "Analyze",
      callback: startAnalyze,
    },
    {
      icon: (
        <svg className="ico" viewBox="0 0 24 24">
          <path
            d="M4 20h16M4 4h12l4 4v8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      label: "Compose",
      callback: () => {
        setMenuOpen(false);
        orbRef.current?.classList.remove("grow");
        // placeholder “compose” action
        alert("Compose: hook this to your AI API.");
      },
    },
    {
      icon: (
        <svg className="ico" viewBox="0 0 24 24">
          <path
            d="M5 5l14 14M19 5L5 19"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      label: "Close",
      callback: () => {
        setMode("idle");
        setMenuOpen(false);
        orbRef.current?.classList.remove("grow");
      },
    },
  ];

  function handleOrbKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const next = !menuOpen;
      setMenuOpen(next);
      setMode(next ? "menu" : "idle");
      orbRef.current?.classList.toggle("grow", next);
    } else if (e.key === "Escape") {
      setMenuOpen(false);
      setMode("idle");
      orbRef.current?.classList.remove("grow");
    }
  }

  function handleMenuKey(e: React.KeyboardEvent) {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (!items.length) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const next = (menuIndex + 1) % items.length;
      setMenuIndex(next);
      items[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      const next = (menuIndex - 1 + items.length) % items.length;
      setMenuIndex(next);
      items[next]?.focus();
    } else if (e.key === "Escape") {
      setMenuOpen(false);
      setMode("idle");
      orbRef.current?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      items[menuIndex]?.click();
    }
  }

  useEffect(() => {
    if (menuOpen) {
      setMenuIndex(0);
      const first = itemRefs.current[0];
      first?.focus();
    } else {
      itemRefs.current = [];
    }
  }, [menuOpen]);

  usePointer(dragging, {
    onMove: handlePointerMove,
    onUp: handlePointerUp,
  });

  return (
    <>
      <div
        ref={orbRef}
        className={`portal-orb ${menuOpen ? "open" : ""} ${
          mode === "analyze" ? "analyzing" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerCancel={handlePointerCancel}
        role="button"
        tabIndex={0}
        aria-label="AI Portal"
        title="AI Portal"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onKeyDown={handleOrbKeyDown}
      >
        {/* inner glow */}
        <div className="orb-core" />
        {/* radial menu */}
        {menuOpen && (
          <div
            className="radial-menu"
            role="menu"
            aria-label="Portal actions"
            ref={menuRef}
            onKeyDown={handleMenuKey}
            aria-activedescendant={`portal-orb-item-${menuIndex}`}
          >
            {actions.map((action, i) => {
              const angle = (360 / actions.length) * i - 90;
              const rad = (angle * Math.PI) / 180;
              const iconX = 94 * Math.cos(rad);
              const iconY = 94 * Math.sin(rad);
              const labelX = 140 * Math.cos(rad);
              const labelY = 140 * Math.sin(rad);
              return (
                <React.Fragment key={action.label}>
                  <button
                    className="rm-item"
                    onClick={action.callback}
                    title={action.label}
                    role="menuitem"
                    ref={(el) => (itemRefs.current[i] = el)}
                    tabIndex={menuIndex === i ? 0 : -1}
                    id={`portal-orb-item-${i}`}
                    style={{ transform: `translate(${iconX}px, ${iconY}px)` }}
                  >
                    {action.icon}
                  </button>
                  <span
                    className="rm-label"
                    style={{
                      transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
                    }}
                  >
                    {action.label}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* styles */}
      <style>{`
        .portal-orb{
          position:fixed;left:0;top:0;z-index:56;
          width:64px;height:64px;transform:translate(${pos.x}px,${pos.y}px);
          transition:transform .18s ease;
          contain:layout paint;
        }
        .orb-core{
          width:100%;height:100%;
          background:
            radial-gradient(60% 60% at 40% 35%, rgba(255,255,255,.9), rgba(255,255,255,.2) 65%, transparent 70%),
            radial-gradient(80% 80% at 70% 70%, rgba(10,132,255,.8), rgba(10,132,255,.2) 70%, transparent 72%),
            radial-gradient(120% 120% at 50% 50%, rgba(10,132,255,.2), transparent 60%);
          border:1px solid var(--stroke-2);
          box-shadow:0 0 0 1px rgba(255,255,255,.06) inset, 0 8px 40px rgba(10,132,255,.35);
        }

        .portal-orb.open .orb-core{
          animation:pulse 1.6s ease infinite;
        }
        @keyframes pulse{
          0%{box-shadow:0 0 0 1px rgba(255,255,255,.06) inset,0 8px 40px rgba(10,132,255,.35)}
          50%{box-shadow:0 0 0 1px rgba(255,255,255,.1) inset,0 8px 60px rgba(10,132,255,.55)}
          100%{box-shadow:0 0 0 1px rgba(255,255,255,.06) inset,0 8px 40px rgba(10,132,255,.35)}
        }

        .portal-orb.grow .orb-core{ transform:scale(1.08) }

        .portal-orb.vortex .orb-core{
          background:
            conic-gradient(from 0deg, rgba(10,132,255,.8), rgba(155,134,255,.8), rgba(110,168,254,.8), rgba(10,132,255,.8));
          animation:spin 0.9s ease forwards;
        }
        @keyframes spin{ to{ filter:hue-rotate(90deg) saturate(1.3) } }

        .radial-menu{
          position:absolute;inset:-30px;display:grid;place-items:center;pointer-events:none;
        }
        .rm-item{
          position:absolute;pointer-events:auto;
          display:grid;place-items:center;gap:6px;padding:6px 8px;background:rgba(16,18,24,.9);
          border:1px solid var(--stroke-2);color:#fff;
        }
        .rm-item .ico{width:18px;height:18px}
        .rm-label{
          position:absolute;pointer-events:none;
          padding:2px 4px;background:rgba(16,18,24,.9);
          border:1px solid var(--stroke-2);color:#fff;font-size:12px;
        }
        .analyzing .orb-core{ box-shadow:0 0 0 1px rgba(255,255,255,.08) inset, 0 10px 70px rgba(10,132,255,.7) }
      `}</style>
    </>
  );
}
