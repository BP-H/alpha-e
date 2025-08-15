import React, { useEffect, useMemo, useRef, useState } from "react";
import "./postcard.css";
import type { Post } from "../../types";
import bus from "../../lib/bus";
import { ensureModelViewer } from "../../lib/ensureModelViewer";

const isBlob = (u?: string | null) => !!u && u.startsWith("blob:");

/** Thin, consistent emoji set (can be replaced by Orb’s list later) */
const EMOJIS: string[] = [
  "❤️","👏","🔥","✨","👍","😍","🤯","😂","😎","🎉","😮","🤝","🙏","💡","🚀","🫶",
  "💙","💜","🖤","🤍","💯","⚡","🌟","🌈","🪐","🌊","🌸","🍀","🎵","📚","📈","🧠"
];

function useCarousel<T>(items: T[]) {
  const [i, setI] = useState(0);
  const n = items.length;
  const clamp = (x: number) => (n ? (x + n) % n : 0);

  const start = useRef<{ x: number; y: number } | null>(null);
  const delta = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    delta.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    delta.current = e.clientX - start.current.x;
    // we let CSS handle the slight drag visual (via style transform)
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = delta.current;
    start.current = null;
    delta.current = 0;
    if (Math.abs(dx) > 40) setI((p) => clamp(p + (dx < 0 ? 1 : -1)));
  };

  const goTo = (idx: number) => setI(clamp(idx));
  return { i, n, goTo, delta, onPointerDown, onPointerMove, onPointerUp };
}

export default function PostCard({ post }: { post: Post }) {
  const [drawer, setDrawer] =
    useState<null | "react" | "comment" | "remix" | "share">(null);

  const [comments, setComments] = useState<string[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);

  // bus listeners (unchanged logic)
  useEffect(() => {
    const off1 = bus.on?.("post:comment", ({ id, body }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer("comment");
      setComments((s) => [body, ...s]);
    });
    const off2 = bus.on?.("post:react", ({ id, emoji }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer("react");
      setReactions((s) => [emoji, ...s].slice(0, 60));
    });
    const off3 = bus.on?.("post:focus", ({ id }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer("comment");
    });
    return () => {
      try { off1?.(); } catch {}
      try { off2?.(); } catch {}
      try { off3?.(); } catch {}
    };
  }, [post.id]);

  // media selection
  const pdf = (post as any)?.pdf as string | undefined;
  const model3d = (post as any)?.model3d as string | undefined;
  const video = (post as any)?.video as string | undefined;

  useEffect(() => {
    if (model3d) { ensureModelViewer().catch(() => {}); }
  }, [model3d]);

  // Images → carousel (instead of grid)
  const images = useMemo(() => {
    const out: string[] = [];
    const srcs =
      post?.images && post.images.length
        ? post.images
        : [post?.image || post?.cover].filter(Boolean);

    for (const img of srcs as any[]) {
      if (!img) continue;
      if (typeof img === "string") out.push(img);
      else if (img.url) out.push(String(img.url));
    }
    return out;
  }, [post]);

  const { i: slide, n: slideCount, goTo, delta,
    onPointerDown, onPointerMove, onPointerUp } = useCarousel(images);

  // reveal media opacity (same memory-safe pattern)
  const onMediaReady = (e: React.SyntheticEvent<any>) => {
    const el = e.currentTarget as any;
    try { el.style.opacity = "1"; } catch {}
    const src: string = el.currentSrc || el.src || el.getAttribute?.("src") || "";
    if (src && src.startsWith("blob:")) { try { URL.revokeObjectURL(src); } catch {} }
  };

  // sharing helper (kept simple)
  async function copyLink() {
    if (typeof location === "undefined") return;
    const url = `${location.origin}${location.pathname}#post-${post.id}`;
    try { await navigator.clipboard.writeText(url); } catch {}
  }

  // avatar: emoji placeholder per requirement
  const avatarEmoji = "🔥";

  return (
    <article className="pc" data-post-id={String(post?.id || "")} id={`post-${post.id}`}>
      {/* GLASS FRAME */}
      <div className="pc-frame">
        {/* TOP GLASS BAR — info */}
        <header className="pc-topbar" aria-label="Post info">
          <div className="pc-ava pc-ava-emoji" title={post?.author || "@user"} aria-hidden>
            <span>{avatarEmoji}</span>
          </div>
          <div className="pc-meta">
            <div className="pc-handle">{post?.author || "@user"}</div>
            <div className="pc-sub">{post?.time || "now"} · {post?.location || "superNova"}</div>
          </div>
          {post?.title && <div className="pc-title">{post.title}</div>}
        </header>

        {/* MEDIA AREA — NO OVERLAYS, NO GAPS TO TOP/BOTTOM BARS */}
        <div className="pc-media">
          {pdf ? (
            <iframe
              src={pdf}
              title="PDF preview"
              onLoad={onMediaReady}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
              allow="accelerometer; camera; microphone; encrypted-media"
              style={{ opacity: 0 }}
            />
          ) : model3d ? (
            <model-viewer
              src={model3d}
              camera-controls
              ar
              ar-modes="webxr scene-viewer quick-look"
              onLoad={onMediaReady as any}
              style={{ opacity: 0 }}
            />
          ) : video ? (
            <video
              src={video}
              controls
              playsInline
              preload="metadata"
              crossOrigin={isBlob(video) ? undefined : "anonymous"}
              onLoadedData={onMediaReady}
              style={{ opacity: 0 }}
            />
          ) : images.length > 0 ? (
            <div
              className="pc-carousel"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <div
                className="pc-track"
                style={{
                  transform: `translateX(calc(${(-slide * 100)}% + ${delta.current || 0}px))`
                }}
              >
                {images.map((src, k) => (
                  <div className="pc-slide" key={`${src}-${k}`}>
                    <img
                      src={src}
                      alt={post?.title || post?.author || "post"}
                      loading="lazy"
                      crossOrigin={isBlob(src) ? undefined : "anonymous"}
                      onLoad={onMediaReady}
                      style={{ opacity: 0 }}
                    />
                  </div>
                ))}
              </div>
              {slideCount > 1 && (
                <div className="pc-dots" role="tablist" aria-label="Media carousel">
                  {new Array(slideCount).fill(0).map((_, d) => (
                    <button
                      key={d}
                      className={`pc-dot ${d === slide ? "on" : ""}`}
                      aria-label={`Go to media ${d + 1}`}
                      aria-selected={d === slide}
                      onClick={() => goTo(d)}
                      type="button"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <img
              src={"/vite.svg"}
              alt={post?.title || post?.author || "post"}
              loading="lazy"
              onLoad={onMediaReady}
              style={{ opacity: 0 }}
            />
          )}
        </div>

        {/* BOTTOM GLASS BAR — avatar left, 4 linear icons right */}
        <footer className="pc-botbar" aria-label="Actions">
          <div
            className="pc-ava pc-ava-emoji"
            title={`View ${post?.author || "user"}`}
            onClick={() => bus.emit?.("profile:open", { id: post.author })}
            role="button"
            tabIndex={0}
          >
            <span>{avatarEmoji}</span>
          </div>

          <div className="pc-actions" aria-label="Action buttons">
            <button className="pc-act" title="React" aria-label="React" onClick={() => setDrawer("react")}>
              <svg className="pc-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.8 5.6c1.7-1.7 4.4-1.7 6 0l1.2 1.2 1.2-1.2c1.7-1.7 4.4-1.7 6 0 1.7 1.7 1.7 4.4 0 6L12 19.6 4.8 11.6c-1.7-1.6-1.7-4.3 0-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="pc-act" title="Comment" aria-label="Comment" onClick={() => setDrawer("comment")}>
              <svg className="pc-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="pc-act" title="Remix" aria-label="Remix" onClick={() => setDrawer("remix")}>
              <svg className="pc-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h8l2 3h6v9H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M7 11h10M7 15h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="pc-act" title="Share" aria-label="Share" onClick={() => setDrawer("share")}>
              <svg className="pc-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 12l9-8v5h5v6h-5v5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </footer>
      </div>

      {/* BOTTOM SHEET / DRAWER (light frosted) */}
      <div className={`pc-drawer ${drawer ? "open" : ""}`}>
        <div className="pc-sheet">
          <div className="pc-sheet-head">
            <div className="pc-sheet-dot" />
            <div className="pc-sheet-title">
              {drawer === "react" ? "React" : drawer === "comment" ? "Comment" : drawer === "remix" ? "Remix" : "Share"}
            </div>
            <button className="pc-sheet-close" onClick={() => setDrawer(null)} aria-label="Close">✕</button>
          </div>

          {drawer === "react" && (
            <div className="pc-emoji-grid" role="grid" aria-label="Pick an emoji">
              {EMOJIS.map((e, k) => (
                <button
                  key={`${e}-${k}`}
                  className="pc-emoji"
                  onClick={() => {
                    bus.emit?.("post:react", { id: post.id, emoji: e });
                    setDrawer(null);
                  }}
                  aria-label={`React ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {drawer === "comment" && (
            <form
              className="pc-comment-form"
              onSubmit={(ev) => {
                ev.preventDefault();
                const input = ev.currentTarget.elements.namedItem("cmt") as HTMLInputElement;
                const t = input.value.trim();
                if (!t) return;
                bus.emit?.("post:comment", { id: post.id, body: t });
                input.value = "";
              }}
            >
              <input className="pc-input" name="cmt" placeholder="Write a comment…" />
              <button className="pc-send" type="submit">Send</button>
            </form>
          )}

          {drawer === "remix" && (
            <div className="pc-remix">
              <p className="pc-hint">Prototype remix options (image→video, video→video, PDF→world…).</p>
              <div className="pc-remix-row">
                <button className="pc-chip" onClick={() => { bus.emit?.("post:remix", { id: post.id }); setDrawer(null); }}>
                  Quick Remix
                </button>
                <button className="pc-chip" onClick={() => setDrawer(null)}>AI Style</button>
                <button className="pc-chip" onClick={() => setDrawer(null)}>XR Portal</button>
              </div>
            </div>
          )}

          {drawer === "share" && (
            <div className="pc-share">
              <div className="pc-hint">Share or copy a link.</div>
              <div className="pc-remix-row">
                <button className="pc-chip" onClick={copyLink}>Copy Link</button>
                <button className="pc-chip" onClick={() => { try { navigator.share?.({ url: location.href }); } catch {} }}>System Share</button>
                <button className="pc-chip" onClick={() => setDrawer(null)}>Repost</button>
              </div>
            </div>
          )}

          {/* Live lists (unchanged) */}
          {(drawer === null || drawer === "react") && (
            <div className="pc-section">
              <strong>Reactions</strong>
              <div className="pc-reactions">
                {reactions.length ? reactions.map((e, i) => <span key={i}>{e}</span>) : <span className="pc-empty">—</span>}
              </div>
            </div>
          )}
          {(drawer === null || drawer === "comment") && (
            <div className="pc-section">
              <strong>Comments</strong>
              {comments.length ? (
                <ul className="pc-comments">
                  {comments.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              ) : (
                <div className="pc-empty">—</div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
