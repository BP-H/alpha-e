import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import bus from "../lib/bus";
import { useTheme } from "../lib/useTheme";

type Keys = { openai?: string; anthropic?: string; perplexity?: string; stability?: string; elevenlabs?: string; };

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return init;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV] as const;
}

export default function Sidebar() {
  const [open, setOpen] = useLocal("sn.sidebar.open", false);

  useEffect(() => {
    const a = bus.on("sidebar:toggle", () => setOpen(v => !v));
    const b = bus.on("sidebar:open", () => setOpen(true));
    const c = bus.on("sidebar:close", () => setOpen(false));
    return () => { a?.(); b?.(); c?.(); };
  }, [setOpen]);

  // Profile info and settings...
  const [name, setName] = useLocal("sn.profile.name", "Your Name");
  const [handle, setHandle] = useLocal("sn.profile.handle", "@you");
  const [bio, setBio] = useLocal("sn.profile.bio", "I bend worlds with orbs and postcards.");
  const [avatar, setAvatar] = useLocal("sn.profile.avatar", "/avatar.jpg");

  const [theme, setTheme] = useTheme();
  const [accent, setAccent] = useLocal("sn.accent", "#7c83ff");
  const [worldMode, setWorldMode] = useLocal<"orbs"|"matrix">("sn.world.mode", "orbs");
  const [orbCount, setOrbCount] = useLocal("sn.world.count", 64);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  const [keys, setKeys] = useLocal<Keys>("sn.keys", {});
  const [showKey, setShowKey] = useState<string | null>(null);
  const setKey = (k: keyof Keys, v: string) => setKeys({ ...keys, [k]: v });
  const clearAll = () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith("sn."))
      .forEach(k => localStorage.removeItem(k));
    location.reload();
  };

  const pages = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Profile", path: "/profile", icon: "👤" },
    { label: "Settings", path: "/settings", icon: "⚙️" },
  ];

  return (
    <>
      <div
        className={`sb-scrim ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
        aria-label="Close sidebar"
        aria-hidden={!open}
      />
      <aside className={`sb ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="sb-panel" role="dialog" aria-modal={open ? "true" : undefined}>
          {/* Header */}
          <div className="sb-head">
            <button className="sb-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            <div className="sb-brand">
              <span className="sb-orb" />
              <span className="sb-logo">superNova</span>
            </div>
          </div>

          <nav className="sb-nav" aria-label="Main">
            <ul>
              {pages.map(p => (
                <li key={p.path}>
                  <NavLink to={p.path} end>
                    <span aria-hidden>{p.icon}</span>
                    <span>{p.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile card */}
          <section className="card profile">
            {/* ... profile avatar, name, handle inputs ... */}
          </section>

          {/* Appearance settings */}
          <section className="card">
            <header>Appearance</header>
            <div className="grid two">
              <div>
                <label className="label">Theme</label>
                <select className="input" value={theme} onChange={e => setTheme(e.target.value as any)}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="label">Accent</label>
                <div className="swatches">
                  {["#7c83ff","#ff74de","#00ffa2","#9efcff","#ffd166"].map(c => (
                    <button
                      key={c}
                      className={`sw ${c===accent ? "on" : ""}`}
                      style={{ background: c }}
                      onClick={() => setAccent(c)}
                      aria-label={c}
                    />
                  ))}
                  <input className="input" value={accent} onChange={e => setAccent(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid two">
              <div>
                <label className="label">Background</label>
                <select className="input" value={worldMode} onChange={e => setWorldMode(e.target.value as any)}>
                  <option value="orbs">Orb Mesh</option>
                  <option value="matrix">Matrix Drift</option>
                </select>
              </div>
              <div>
                <label className="label">Orb density</label>
                <input
                  className="input" type="range" min={16} max={160} step={4}
                  value={orbCount}
                  onChange={e => setOrbCount(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
            <p className="hint">Changes apply instantly and persist on this device.</p>
          </section>

          {/* API Keys Vault, Integrations, Privacy, Danger Zone sections ... */}

          <footer className="sb-foot">made with ✨</footer>
        </div>
      </aside>
    </>
  );
}